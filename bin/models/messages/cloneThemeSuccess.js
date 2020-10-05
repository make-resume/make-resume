const { infoTable } = require("../cli");
const Message = require("../message");

class CloneThemeSuccess {
	constructor(mr) {
		this.mr = mr;
		this.status = infoTable();
		this.status.push(
			{ Status: "Success" },
			{ Message: "Theme was cloned!" }
		);
		this.config = infoTable();
		this.config.push(
			{ Theme: this.mr.names.theme },
			{ "Theme Origin": this.mr.themeOrigin }
		);
	}
	show() {
		Message.info(this.status.toString());
		Message.info(this.config.toString());
	}
}
module.exports = CloneThemeSuccess;
