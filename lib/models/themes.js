const { existsSync } = require("fs");
const path = require("path");
const Theme = require("./theme");

class Themes {
	static getById(dir, id) {
		let themePath;
		let themeOrigin;

		let local = path.join(dir, id);
		let localMod = path.join(dir, "/node_modules/", id);
		let builtInMod = path.join(__dirname, "../../node_modules/", id);

		if (existsSync(local)) {
			themeOrigin = "local";
			themePath = local;
		} else if (existsSync(localMod)) {
			themeOrigin = "local-mod";
			themePath = localMod;
		} else if (existsSync(builtInMod)) {
			themeOrigin = "built-in-mod";
			themePath = builtInMod;
		}

		if (themePath && themeOrigin) {
			return new Theme(id, themePath, themeOrigin);
		}
		throw new Error(`no theme found with '${id}' name`);
	}
}

module.exports = Themes;
