#!/usr/bin/env node

const Message = require("./models/message");
const JtcCli = require("./models/jtcCli");
const { program } = require("commander");
const chokidar = require("chokidar");

program.option("-t, --theme <type>", "theme to use", "basic");
program.option("-w, --watch", "watch for file changes");

program.parse(process.argv);

const jtcCli = new JtcCli({
	dir: process.cwd(),
	theme: program.theme,
});

(async () => {
	await jtcCli.build();
	if (program.watch) {
		Message.info("project file(s): watching for changes ...");
		chokidar.watch("./**(!dist)").on("change", async () => {
			Message.info("project file(s): changed");
			Message.info("project file(s): rebuilding ...");
			await jtcCli.build();
		});
	}
})();
