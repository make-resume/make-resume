const MakeResume = require("../../lib/models/makeResume");
const Message = require("./message");
const Process = require("./process");
const path = require("path");

class MakeResumeCLI {
	constructor(opts) {
		this.opts = opts;
		try {
			this.mr = new MakeResume({
				dir: this.opts.dir,
				theme: this.opts.theme,
			});
		} catch (e) {
			Process.exitWithError(e.message);
		}
	}
	async build() {
		try {
			await this.mr.validateDir();
			await this.mr.validateInfo();
			await this.mr.build();
			Message.info("project: built");
		} catch (e) {
			Process.exitWithError(e.message);
		}
	}
	async cloneTheme() {
		try {
			await this.mr.cloneTheme();
			Message.info("theme: cloned");
		} catch (e) {
			Process.exitWithError(e.message);
		}
	}
	dirsToWatch() {
		let paths = [
			path.join(this.mr.paths.dir, `**(!${this.mr.names.output.dir})`),
			this.mr.paths.theme,
		];
		return paths;
	}
}
module.exports = MakeResumeCLI;
