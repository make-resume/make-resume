#!/usr/bin/env node

const Message = require("./models/message");
const JtcCli = require("./models/jtcCli");
const { program } = require("commander");
const chokidar = require("chokidar");

program
	.command("clone-theme <theme>")
	.description("clone specified theme in current directory")
	.action((theme) => {
		(async () => {
			const jtcCli = new JtcCli({
				dir: process.cwd(),
				theme: theme,
			});
			await jtcCli.cloneTheme();
		})();
	});

program
	.command("build", { isDefault: true })
	.description("build the cv")
	.option("-t, --theme <type>", "name of the theme to use", "basic")
	.option("-w, --watch", "watch for file changes")
	.action((cmd) => {
		(async () => {
			const jtcCli = new JtcCli({
				dir: process.cwd(),
				theme: cmd.theme,
			});
			await jtcCli.build();
			if (cmd.watch) {
				Message.info("watching for changes ...");
				chokidar
					.watch(jtcCli.dirsToWatch())
					.on("change", async (path, stats) => {
						Message.info("project file(s): changed. rebuilding ..");
						await jtcCli.build();
					});
			}
		})();
	});

program.parse(process.argv);
