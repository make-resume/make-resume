const chalk = require("chalk");

class Message {
	static error(msg) {
		console.log(chalk.red(msg));
	}
	static info(msg) {
		console.log(chalk.blue(msg));
	}
}

module.exports = Message;
