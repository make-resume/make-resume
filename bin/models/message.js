const chalk = require("chalk");

class Message {
	static error(msg) {
		console.log(chalk.red(msg));
	}
}

module.exports = Message;
