const { mkdirSync, existsSync, readFileSync, writeFileSync } = require("fs");
const fs = require("fs");
const util = require("util");
const path = require("path");
const _rimraf = require("rimraf");
const ncp = require("ncp");
const _ = require("lodash");
const prettier = require("prettier");
const Handlebars = require("handlebars");
const {
	DEFAULT_THEME,
	DEFAULT_INFO_FILE,
	DEFAULT_OUTPUT_DIR,
} = require("../constants");
require("handlebars-helpers")();

const rimraf = util.promisify(_rimraf);
const copy = util.promisify(ncp);

Handlebars.registerHelper("sectionTitle", function (info, key, defaultTitle) {
	if (info._meta && info._meta.sections) {
		const sections = info._meta.sections;
		const section = _.find(sections, ["key", key]);
		if (section && section.title) return section.title;
	}
	return defaultTitle;
});

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
		this.paths.theme = this._getThemePath();
		this.paths.templateFile = path.join(this.paths.theme, "template.hbs");
		this.paths.themePartials = path.join(this.paths.theme, "partials");
		this.paths.themeAssets = path.join(this.paths.theme, "assets");
	}

	_getThemePath() {
		let themePath;
		let local = path.join(this.paths.dir, this.names.theme);
		let localMod = path.join(
			this.paths.dir,
			"/node_modules/",
			this.names.theme
		);
		let builtInMod = path.join(
			__dirname,
			"../../node_modules/",
			this.names.theme
		);

		if (existsSync(local)) {
			this.themeOrigin = "local";
			themePath = local;
		} else if (existsSync(localMod)) {
			this.themeOrigin = "local-mod";
			themePath = localMod;
		} else if (existsSync(builtInMod)) {
			this.themeOrigin = "built-in-mod";
			themePath = builtInMod;
		}

		if (themePath) return themePath;
		throw new Error(`no theme found with '${this.names.theme}' name`);
	}

	async validate() {
		if (!existsSync(this.paths.infoFile)) {
			throw new Error(`'${this.names.infoFile}' does not exist`);
		}
		if (!existsSync(this.paths.templateFile)) {
			throw new Error(`'${this.names.theme}' is not a valid theme`);
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
			let templateContents = readFileSync(this.paths.templateFile, {
				encoding: "utf-8",
			});
			html = Handlebars.compile(templateContents)({
				resume: this.info,
			});
			if (!html) throw new Error("could not build the resume");
		} catch (e) {
			throw e;
		}

		html = prettier.format(html, { parser: "html" });
		writeFileSync(this.paths.htmlFile, html);
		await copy(this.paths.themeAssets, this.paths.outputAssets);
	}

	_loadPartials() {
		var partialsDir = this.paths.themePartials;
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
		if (this.themeOrigin === "local") {
			throw new Error(`'${this.names.theme}' is already local`);
		}
		await copy(
			this.paths.theme,
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
