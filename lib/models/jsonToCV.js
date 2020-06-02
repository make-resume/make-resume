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
	constructor(cwd) {
		this.cwd = cwd;
		this.fileName = "cv.json";
		this.requiredFields = ["name", "position"];

		this.theme = {
			dir: path.join(__dirname, "./../themes/basic"),
		};
		this.output = {
			dir: path.join(this.cwd, "dist"),
			htmlFileName: "index.html",
		};
	}

	async validateDir() {
		if (!(await exists(path.join(this.cwd, this.fileName)))) {
			throw new Error(`${this.fileName} doesn't exist in this folder`);
		}
	}

	async validateInfo() {
		let info;
		try {
			let contents = (
				await readFile(path.join(this.cwd, this.fileName))
			).toString();
			info = JSON.parse(contents);
			if (!info) throw new Error();
		} catch (e) {
			throw new Error(`${this.fileName} is invalid`);
		}

		this.requiredFields.forEach((f) => {
			if (!info.hasOwnProperty(f)) {
				throw new Error(`'${f}' info field is required`);
			}
		});
		this.info = info;
	}

	async generate() {
		await mkdir(this.output.dir);
		let html = pug.renderFile(
			path.join(this.theme.dir, "template.pug"),
			this.info
		);
		html = prettier.format(html, { parser: "html" });
		await writeFile(
			path.join(this.output.dir, this.output.htmlFileName),
			html
		);
		copy(path.join(this.theme.dir, "/**/*.!(pug)"), this.output.dir);
	}

	async clean() {
		await rimraf(this.output.dir);
	}
}

module.exports = JsonToCV;
