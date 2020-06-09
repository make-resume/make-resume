const JsonToCV = require("./../../lib/models/jsonToCV");
const Message = require("./message");
const Process = require("./process");
const path = require("path");

class JtcCli {
	constructor(opts) {
		this.opts = opts;
		try {
			this.jtc = new JsonToCV({
				dir: this.opts.dir,
				theme: this.opts.theme,
			});
		} catch (e) {
			Process.exitWithError(e.message);
		}
	}
	async build() {
		try {
			await this.jtc.validateDir();
			await this.jtc.validateInfo();
			await this.jtc.build();
			Message.info("project: built");
		} catch (e) {
			Process.exitWithError(e.message);
		}
	}
	async cloneTheme() {
		try {
			await this.jtc.cloneTheme();
			Message.info("theme: cloned");
		} catch (e) {
			Process.exitWithError(e.message);
		}
	}
	dirsToWatch() {
		let paths = [
			path.join(this.jtc.paths.dir, `**(!${this.jtc.names.output.dir})`),
			this.jtc.paths.theme,
		];
		return paths;
	}
}
module.exports = JtcCli;
