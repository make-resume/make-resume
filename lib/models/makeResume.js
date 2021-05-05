const { mkdirSync, existsSync, readFileSync, writeFileSync } = require("fs");
const fs = require("fs");
const util = require("util");
const path = require("path");
const _rimraf = require("rimraf");
const ncp = require("ncp");
const _ = require("lodash");
const prettier = require("prettier");
const Handlebars = require("./hbsHelpers");
const {
	DEFAULT_THEME,
	DEFAULT_INFO_FILE,
	DEFAULT_OUTPUT_DIR,
} = require("../constants");
const Themes = require("./themes");

const rimraf = util.promisify(_rimraf);
const copy = util.promisify(ncp);

class MakeResume {
	constructor(opts) {
		opts.dir = opts.dir || process.cwd();
		this.requiredFields = ["basics.name", "basics.label"];

		this.names = {
			theme: opts.theme || DEFAULT_THEME,
			infoFile: opts.infoFile || DEFAULT_INFO_FILE,
			outputDir: opts.outputDir || DEFAULT_OUTPUT_DIR,
		};

		this.paths = {};
		this.paths.dir = opts.dir;
		this.paths.infoFile = path.join(opts.dir, this.names.infoFile);
		this.paths.output = path.join(opts.dir, this.names.outputDir);
		this.paths.outputAssets = path.join(this.paths.output, "assets");
		this.paths.htmlFile = path.join(this.paths.output, "index.html");
	}

	async init() {
		this.theme = Themes.getById(this.paths.dir, this.names.theme);
	}

	async validate() {
		if (!existsSync(this.paths.infoFile)) {
			throw new Error(`'${this.names.infoFile}' does not exist`);
		}
		if (!existsSync(this.theme.templateFile)) {
			throw new Error(`'${this.theme.id}' is not a valid theme`);
		}
	}

	async loadInfo() {
		let info;
		try {
			let contents = readFileSync(this.paths.infoFile).toString();
			info = JSON.parse(contents);
			if (!info) throw new Error();
		} catch (e) {
			throw new Error(`${this.names.infoFile} is invalid`);
		}

		this.requiredFields.forEach((fa) => {
			// fa = fieldAddress
			// fp(s) = fieldPortion
			const fps = fa.split(".");
			fps.forEach((fp, i) => {
				if (i > 0) {
					if (!info[fps[i - 1]].hasOwnProperty(fp)) {
						throw new Error(`'${fa}' info field is required`);
					}
				} else {
					if (!info.hasOwnProperty(fp)) {
						throw new Error(`'${fa}' info field is required`);
					}
				}
			});
		});
		this.info = info;
	}

	async build() {
		this._caterDir(this.paths.output);
		let html;
		try {
			this._loadPartials();
			let templateContents = readFileSync(this.theme.templateFile, {
				encoding: "utf-8",
			});

			const normalizedVars = {};
			const { manifest } = this.theme;

			// set default values
			manifest.vars.forEach(({ key, defaultValue }) => {
				normalizedVars[key] = defaultValue;
			});

			html = Handlebars.compile(templateContents)({
				resume: this.info,
				vars: normalizedVars,
			});

			if (!html) throw new Error("could not build the resume");
		} catch (e) {
			throw e;
		}

		html = prettier.format(html, { parser: "html" });
		writeFileSync(this.paths.htmlFile, html);
		await copy(this.theme.assets, this.paths.outputAssets);
	}

	_loadPartials() {
		var partialsDir = this.theme.partials;
		var partials = fs.readdirSync(partialsDir);

		partials.forEach(function (partial) {
			var matches = /^([^.]+).hbs$/.exec(partial);
			if (!matches) {
				return;
			}
			var name = matches[1];
			var template = fs.readFileSync(
				path.join(partialsDir, partial),
				"utf-8"
			);
			Handlebars.registerPartial(name, template);
		});
	}

	async clean() {
		await rimraf(this.paths.output);
	}

	async cloneTheme() {
		if (this.theme.origin === "local") {
			throw new Error(`'${this.names.theme}' is already local`);
		}
		await copy(
			this.theme.path,
			path.join(this.paths.dir, this.names.theme)
		);
	}

	_caterDir(dir) {
		if (!existsSync(dir)) {
			mkdirSync(dir);
		}
	}
}

module.exports = MakeResume;
