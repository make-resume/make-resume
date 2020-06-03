const fs = require("fs");
const util = require("util");
const path = require("path");
const pug = require("pug");
const _rimraf = require("rimraf");
const _copy = require("copy");
const prettier = require("prettier");

const exists = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const rimraf = util.promisify(_rimraf);
const copy = util.promisify(_copy);

class JsonToCV {
	constructor(opts) {
		this.names = {
			output: {
				dir: "dist",
				htmlFile: "index.html",
			},
			infoFile: "cv.json",
			templateFile: "template.pug",
		};

		this.paths = {
			info: opts.dir,
			infoFile: path.join(opts.dir, this.names.infoFile),
			theme: path.join(__dirname, "./../themes", opts.theme),
			output: path.join(opts.dir, this.names.output.dir),
		};

		this.requiredFields = ["name", "position"];
	}

	async validateDir() {
		if (!(await exists(this.paths.infoFile))) {
			throw new Error(
				`${this.names.infoFile} doesn't exist in this directory`
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
		await this._caterOutput();
		let html = pug.renderFile(
			path.join(this.paths.theme, this.names.templateFile),
			this.info
		);
		html = prettier.format(html, { parser: "html" });
		await writeFile(
			path.join(this.paths.output, this.names.output.htmlFile),
			html
		);
		copy(path.join(this.paths.theme, "/**/*.!(pug)"), this.paths.output);
	}

	async _caterOutput() {
		if (!(await exists(this.paths.output))) {
			await mkdir(this.paths.output);
		}
	}
	async clean() {
		await rimraf(this.paths.output);
	}
}

module.exports = JsonToCV;
