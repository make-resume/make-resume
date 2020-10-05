#!/usr/bin/env node

const Message = require("./models/message");
const MakeResumeCLI = require("./models/makeResumeCLI");
const { program } = require("commander");
const chokidar = require("chokidar");

program
	.command("clone-theme <theme>")
	.description("clone specified theme in current directory")
	.action((theme) => {
		(async () => {
			const makeResumeCLI = new MakeResumeCLI({
				dir: process.cwd(),
				theme: theme,
			});
			await makeResumeCLI.cloneTheme();
		})();
	});

program
	.command("build", { isDefault: true })
	.description("build the cv")
	.option(
		"-t, --theme <type>",
		"name of the theme to use",
		"make-resume-base"
	)
	.option("-w, --watch", "watch for file changes")
	.option(
		"-f, --file <file>",
		"info file name or relative path",
		"resume.json"
	)
	.action((cmd) => {
		(async () => {
			const makeResumeCLI = new MakeResumeCLI(cmd);
			await makeResumeCLI.build();
			if (cmd.watch) {
				Message.info("watching for changes ...");
				chokidar
					.watch(makeResumeCLI.dirsToWatch())
					.on("change", async (path, stats) => {
						Message.info("project file(s): changed. rebuilding ..");
						await makeResumeCLI.build();
					});
			}
		})();
	});

program.parse(process.argv);
