const { mkdirSync, existsSync, readFileSync, writeFileSync } = require("fs");
const fs = require("fs");
const util = require("util");
const path = require("path");
const _rimraf = require("rimraf");
const ncp = require("ncp");
const prettier = require("prettier");
const Handlebars = require("handlebars");
require("handlebars-helpers")();

const rimraf = util.promisify(_rimraf);
const copy = util.promisify(ncp);

class MakeResume {
	constructor(opts) {
		this.opts = opts;
		this.requiredFields = ["basics.name", "basics.label"];
		this.names = {
			output: {
				dir: this.opts.output.dir,
				htmlFile: "index.html",
			},
			infoFile: opts.infoFile || "person.json",
			templateFile: "template.hbs",
			theme: opts.theme,
			dir: {
				themeAssets: "assets",
			},
		};

		this.paths = {
			dir: this.opts.dir,
			infoFile: path.join(this.opts.dir, this.names.infoFile),
			output: path.join(this.opts.dir, this.names.output.dir),
		};

		this.paths.theme = this._getThemePath();
		this.paths.themeAssets = path.join(
			this.paths.theme,
			this.names.dir.themeAssets
		);
		this.paths.outputAssets = path.join(
			this.paths.output,
			this.names.dir.themeAssets
		);
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

		// validate
		if (themePath) {
			if (existsSync(path.join(themePath, this.names.templateFile))) {
				return themePath;
			}
			throw new Error(`'${this.names.theme}' is not a valid theme`);
		}
		throw new Error(`no theme found with '${this.names.theme}' name`);
	}

	async validateDir() {
		if (!existsSync(this.paths.infoFile)) {
			throw new Error(`'${this.names.infoFile}' does not exist`);
		}
	}

	async validateInfo() {
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
			let templateContents = readFileSync(
				path.join(this.paths.theme, this.names.templateFile),
				{
					encoding: "utf-8",
				}
			);
			html = Handlebars.compile(templateContents)({
				resume: this.info,
			});
			if (!html) throw Error("could not build the resume");
		} catch (e) {
			throw e;
		}

		html = prettier.format(html, { parser: "html" });
		writeFileSync(
			path.join(this.paths.output, this.names.output.htmlFile),
			html
		);
		await copy(this.paths.themeAssets, this.paths.outputAssets);
	}

	_loadPartials() {
		var partialsDir = path.join(this.paths.theme, "partials");
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
