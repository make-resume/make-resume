#!/usr/bin/env node

const JsonToCV = require("../lib/models/jsonToCV");
const Process = require("./models/process");
const { program } = require("commander");

program.option("-t, --theme <type>", "theme to use", "basic");

program.parse(process.argv);

(async () => {
	const core = new JsonToCV({
		dir: process.cwd(),
		theme: program.theme,
	});
	try {
		await core.validateDir();
		await core.validateInfo();
	} catch (e) {
		Process.exitWithError(e.message);
	}
	await core.clean();
	await core.generate();
})();
