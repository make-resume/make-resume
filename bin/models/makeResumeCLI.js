const MakeResume = require("../../lib/models/makeResume");
const Configs = require("./messages/configs");
const Message = require("./message");

class MakeResumeCLI {
	constructor(cmd) {
		try {
			this.mr = new MakeResume({
				theme: cmd.theme,
				infoFile: cmd.file,
				outputDir: cmd.outputDir,
			});
			this.mr.init();
			new Configs(this.mr).show();
		} catch (e) {
			Message.error(e.message);
		}
	}
	async build() {
		try {
			await this.mr.validate();
			await this.mr.loadInfo();
			await this.mr.build();
			Message.success("the resume was built.");
		} catch (e) {
			Message.error(e.message);
		}
	}
	async cloneTheme() {
		try {
			await this.mr.cloneTheme();
			Message.success("theme cloned in current directory.");
		} catch (e) {
			Message.error(e.message);
		}
	}
	dirsToWatch() {
		let paths = [this.mr.paths.infoFile, this.mr.paths.theme];
		return paths;
	}
}
module.exports = MakeResumeCLI;
