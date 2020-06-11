const path = require("path");
const { existsSync, mkdirSync } = require("fs");
const util = require("util");
const _rimraf = require("rimraf");

const JsonToCv = require("../../../lib/models/jsonToCV");

const rimraf = util.promisify(_rimraf);

const outputFixture = path.join(__dirname, "../../../fixture");

test("should select a built-in theme", () => {
	const opts = { theme: "basic", dir: process.cwd() };
	const jtc = new JsonToCv(opts);
	expect(jtc.paths.theme).toBe(
		path.join(__dirname, "../../../lib/themes", opts.theme)
	);
	expect(jtc.themeOrigin).toBe("built-in");
});

describe("theme cloning", () => {
	const theme = "basic";
	const localThemePath = path.join(outputFixture, theme);

	test("should clone a theme", async () => {
		const opts = {
			theme: theme,
			dir: outputFixture,
		};
		const jtc = new JsonToCv(opts);
		await jtc.cloneTheme();
		expect(existsSync(localThemePath)).toBe(true);
	});

	test("should use cloned theme", () => {
		const opts = {
			theme: theme,
			dir: outputFixture,
		};
		const jtc = new JsonToCv(opts);
		expect(jtc.paths.theme).toBe(localThemePath);
	});

	afterAll(async () => {
		await rimraf(localThemePath);
	});
});
