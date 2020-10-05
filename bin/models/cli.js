const Table = require("cli-table");

module.exports.infoTable = () => {
	return new Table({
		style: { head: ["yellow"] },
	});
};
