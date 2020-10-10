const MakeResume = require("../../lib/models/makeResume");
const Process = require("./process");
const BuildSuccess = require("./messages/buildSuccess");
const CloneThemeSuccess = require("./messages/cloneThemeSuccess");

class MakeResumeCLI {
	constructor(cmd) {
		this.cmd = cmd;
		try {
			this.mr = new MakeResume({
				dir: process.cwd(),
				theme: this.cmd.theme,
				infoFile: this.cmd.file,
				output: {
					dir: this.cmd.outputDir
				}
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
			new BuildSuccess(this.mr).show();
		} catch (e) {
			Process.exitWithError(e.message);
		}
	}
	async cloneTheme() {
		try {
			await this.mr.cloneTheme();
			new CloneThemeSuccess(this.mr).show();
		} catch (e) {
			Process.exitWithError(e.message);
		}
	}
	dirsToWatch() {
		let paths = [this.mr.paths.infoFile, this.mr.paths.theme];
		return paths;
	}
}
module.exports = MakeResumeCLI;
