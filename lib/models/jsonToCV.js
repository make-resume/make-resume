const fs = require("fs");
const util = require("util");
const path = require("path");
const pug = require("pug");
const _rimraf = require("rimraf");
const _copy = require("copy");
const prettier = require("prettier");

const exists = fs.existsSync;
const mkdir = fs.mkdirSync;
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const rimraf = util.promisify(_rimraf);
const copy = util.promisify(_copy);

class JsonToCV {
	constructor(opts) {
		this.opts = opts;
		this.requiredFields = ["name", "position"];
		this.names = {
			output: {
				dir: "dist",
				htmlFile: "index.html",
			},
			infoFile: "person.json",
			templateFile: "template.pug",
			theme: opts.theme,
		};

		this.paths = {
			dir: this.opts.dir,
			infoFile: path.join(this.opts.dir, this.names.infoFile),
			theme: this._getThemePath(),
			output: path.join(this.opts.dir, this.names.output.dir),
		};
	}

	_validateThemePath(themePath) {
		if (!exists(path.join(themePath, this.names.templateFile))) {
			throw new Error(`'${this.names.theme}' is not a valid theme`);
		}
		return themePath;
	}

	_getThemePath() {
		let themePath;
		let localTheme = path.join(this.opts.dir, this.names.theme);
		let builtInTheme = path.join(
			__dirname,
			"./../themes",
			this.names.theme
		);

		if (exists(localTheme)) {
			this.themeOrigin = "local";
			themePath = localTheme;
		} else if (exists(builtInTheme)) {
			this.themeOrigin = "built-in";
			themePath = builtInTheme;
		}

		if (themePath) return this._validateThemePath(themePath);
		throw new Error(`no theme found with '${this.names.theme}' name`);
	}

	async validateDir() {
		if (!exists(this.paths.infoFile)) {
			throw new Error(
				`'${this.names.infoFile}' does not exist in this directory`
			);
		}
	}

	async validateInfo() {
		let info;
		try {
			let contents = (await readFile(this.paths.infoFile)).toString();
			info = JSON.parse(contents);
			if (!info) throw new Error();
		} catch (e) {
			throw new Error(`${this.names.infoFile} is invalid`);
		}

		this.requiredFields.forEach((f) => {
			if (!info.hasOwnProperty(f)) {
				throw new Error(`'${f}' info field is required`);
			}
		});
		this.info = info;
	}

	async build() {
		this._caterDir(this.paths.output);
		let html = pug.renderFile(
			path.join(this.paths.theme, this.names.templateFile),
			this.info
		);
		html = prettier.format(html, { parser: "html" });
		await writeFile(
			path.join(this.paths.output, this.names.output.htmlFile),
			html
		);
		await copy(
			path.join(this.paths.theme, "/**/*.!(pug)"),
			this.paths.output
		);
	}

	async clean() {
		await rimraf(this.paths.output);
	}

	async cloneTheme() {
		if (this.themeOrigin === "local") {
			throw new Error(`${this.names.theme} is not a built-in theme`);
		}
		let themeDir = path.join(this.paths.dir, this.names.theme);
		this._caterDir(themeDir);
		await copy(path.join(this.paths.theme, "**"), themeDir);
	}

	_caterDir(dir) {
		if (!exists(dir)) {
			mkdir(dir);
		}
	}
}

module.exports = JsonToCV;
