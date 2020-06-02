const Message = require("./message");

class Process {
	static exitWithError(msg) {
		Message.error(msg);
		process.exit();
	}
}

module.exports = Process;
