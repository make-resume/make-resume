const path = require("path");
const { readFileSync, existsSync } = require("fs");

class Theme {
	constructor(tId, tPath, tOrigin) {
		this.id = tId;
		this.path = tPath;
		this.origin = tOrigin;
		this.templateFile = path.resolve(this.path, "template.hbs");
		this.partials = path.resolve(this.path, "partials");
		this.assets = path.resolve(this.path, "assets");
		this.picture = path.resolve(this.path, "screenshot.png");

		// set manifest
		const manifest = path.resolve(this.path, "manifest.json");
		if (existsSync(manifest)) {
			// file must have vars array
			this.manifest = JSON.parse(readFileSync(manifest));
		} else {
			this.manifest = {
				vars: [],
			};
		}
	}
}

module.exports = Theme;
