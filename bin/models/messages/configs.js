const { infoTable } = require("../cli");
const Message = require("../message");

class Configs {
	constructor(mr) {
		this.mr = mr;
		this.config = infoTable();
		this.config.push(
			{ Theme: this.mr.theme.id },
			{ "Theme Origin": this.mr.theme.origin },
			{ "Info File": this.mr.paths.infoFile },
			{ Output: this.mr.paths.output }
		);
	}
	show() {
		Message.info(this.config.toString());
	}
}
module.exports = Configs;
