const chalk = require("chalk");

class Message {
	static error(msg) {
		console.log(chalk.bgRed(msg));
	}
	static info(msg) {
		console.log(chalk.whiteBright(msg));
	}
	static success(msg) {
		console.log(chalk.green(msg));
	}
}

module.exports = Message;
