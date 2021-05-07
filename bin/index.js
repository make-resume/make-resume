#!/usr/bin/env node

const Message = require("./models/message");
const { program } = require("commander");
const chokidar = require("chokidar");
const MakeResumeCLI = require("./models/makeResumeCLI");

program
	.command("clone-theme <theme>")
	.description("clone specified theme in current directory")
	.action((theme) => {
		(async () => {
			await MakeResumeCLI.cloneTheme(theme);
		})();
	});

program
	.command("build", { isDefault: true })
	.description("build the resume")
	.option("-w, --watch", "watch for changes")
	.option("-t, --theme <type>", "theme-id of the theme to use")
	.option("-f, --file <file>", "info file name or relative path")
	.option("--output-dir <dir>", "directory to output the build")
	.action((cmd) => {
		(async () => {
			try {
				const makeResumeCLI = new MakeResumeCLI(cmd);
				await makeResumeCLI.build();
				if (cmd.watch) {
					Message.info("watching for changes ...");
					chokidar
						.watch(makeResumeCLI.toWatch())
						.on("change", async (path, stats) => {
							Message.info("rebuilding ...");
							await makeResumeCLI.rebuild();
						});
				}
			} catch (e) {
				Message.error(e.message);
			}
		})();
	});

program.parse(process.argv);
