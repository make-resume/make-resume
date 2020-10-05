const { infoTable } = require("../cli");
const Message = require("../message");

class BuildSuccess {
	constructor(mr) {
		this.mr = mr;
		this.status = infoTable();
		this.status.push(
			{ Status: "Success" },
			{ Message: "Resume was built!" }
		);
		this.config = infoTable();
		this.config.push(
			{ Theme: this.mr.names.theme },
			{ "Theme Origin": this.mr.themeOrigin },
			{ "Info File": this.mr.paths.infoFile },
			{ Output: this.mr.paths.output }
		);
	}
	show() {
		Message.info(this.status.toString());
		Message.info(this.config.toString());
	}
}
module.exports = BuildSuccess;
