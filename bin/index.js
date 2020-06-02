#!/usr/bin/env node

const JsonToCV = require("../lib/models/jsonToCV");
const Process = require("./models/process");

(async () => {
	const core = new JsonToCV(process.cwd());
	try {
		await core.validateDir();
		await core.validateInfo();
	} catch (e) {
		Process.exitWithError(e.message);
	}
	await core.clean();
	await core.generate();
})();
