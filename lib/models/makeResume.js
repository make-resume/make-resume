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
const Info = require("./info");

const rimraf = util.promisify(_rimraf);
const copy = util.promisify(ncp);

class MakeResume {
	constructor(opts) {
		this.opts = {
			dir: opts.dir || process.cwd(),
			theme: opts.theme || DEFAULT_THEME,
			infoFile: opts.infoFile || DEFAULT_INFO_FILE,
			outputDir: opts.outputDir || DEFAULT_OUTPUT_DIR,
		};

		this.paths = {};
		this.paths.dir = this.opts.dir;
		this.paths.infoFile = path.resolve(this.paths.dir, this.opts.infoFile);
		this.paths.output = path.resolve(this.paths.dir, this.opts.outputDir);
		this.paths.outputAssets = path.join(this.paths.output, "assets");
		this.paths.htmlFile = path.join(this.paths.output, "index.html");
	}

	init() {
		this.info = new Info(this.paths.infoFile);

		this.theme = Themes.getById(
			this.paths.dir,
			// `meta.theme` will override `opts.theme`
			this.info.getTheme() || this.opts.theme
		);
	}

	async build() {
		this._caterDir(this.paths.output);

		this._loadPartials();
		let templateContents = readFileSync(this.theme.templateFile, {
			encoding: "utf-8",
		});

		const normalizedVars = {};
		const { manifest } = this.theme;

		// set default vars
		manifest.vars.forEach(({ key, defaultValue }) => {
			normalizedVars[key] = defaultValue;
		});

		// set/overset chosen vars
		const vars = this.info.getVars();
		for (let v in vars) {
			normalizedVars[v] = vars[v] || normalizedVars[v];
		}

		let html = Handlebars.compile(templateContents)({
			resume: this.info.object,
			vars: normalizedVars,
		});

		if (!html) throw new Error("could not build the resume.");

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

	static async cloneTheme(themeId) {
		const dir = process.cwd();
		const theme = Themes.getById(dir, themeId);
		if (theme.origin === "local") {
			throw new Error(`'${themeId}' is already local`);
		}
		await copy(theme.path, path.join(dir, themeId));
	}

	_caterDir(dir) {
		if (!existsSync(dir)) {
			mkdirSync(dir, {
				recursive: true,
			});
		}
	}
}

module.exports = MakeResume;
