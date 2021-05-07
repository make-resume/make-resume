const { readFileSync } = require("fs");

class Info {
	constructor(path) {
		this.path = path;
		this.object = null;

		try {
			let contents = readFileSync(this.path).toString();
			const info = JSON.parse(contents);

			if (!info || typeof info !== "object") throw new Error();

			this.object = info;
		} catch (e) {
			console.error(e);
			throw new Error(`${this.path} is invalid`);
		}
	}

	getVars() {
		return this.object.meta?.vars || {};
	}

	getTheme() {
		return this.object.meta?.theme;
	}
}

module.exports = Info;
