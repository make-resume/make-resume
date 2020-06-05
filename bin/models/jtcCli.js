const JsonToCV = require("./../../lib/models/jsonToCV");
const Message = require("./message");
const Process = require("./process");

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
		} catch (e) {
			Process.exitWithError(e.message);
		}
		Message.info("project: built");
	}
}
module.exports = JtcCli;
