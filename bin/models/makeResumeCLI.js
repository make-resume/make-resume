const MakeResume = require("../../lib/models/makeResume");
const Configs = require("./messages/configs");
const Message = require("./message");

class MakeResumeCLI {
	constructor(cmd) {
		this.mr = new MakeResume({
			theme: cmd.theme,
			infoFile: cmd.file,
			outputDir: cmd.outputDir,
		});
		this.mr.init();
		new Configs(this.mr).show();
	}

	async build() {
		try {
			await this.mr.build();
			Message.success("the resume was built.");
		} catch (e) {
			Message.error(e.message);
		}
	}

	async rebuild() {
		try {
			this.mr.init();
			await this.build();
		} catch (e) {
			Message.error(e.message);
		}
	}

	toWatch() {
		return [this.mr.paths.infoFile, this.mr.theme.path];
	}

	static async cloneTheme(theme) {
		try {
			await MakeResume.cloneTheme(theme);
		} catch (e) {
			Message.error(e.message);
		}
	}
}

module.exports = MakeResumeCLI;
