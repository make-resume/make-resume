const JsonToCV = require("./../../lib/models/jsonToCV");
const Message = require("./message");

class JtcCli {
	constructor(opts) {
		this.dir = opts.dir;
		this.theme = opts.theme;
		this.jtc = new JsonToCV({
			dir: this.dir,
			theme: this.theme,
		});
	}
	async build() {
		try {
			await this.jtc.validateDir();
			await this.jtc.validateInfo();
		} catch (e) {
			Process.exitWithError(e.message);
		}
		await this.jtc.build();
		Message.info("project: built");
	}
}
module.exports = JtcCli;
