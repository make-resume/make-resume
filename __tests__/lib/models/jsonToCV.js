const path = require("path");
const { existsSync, mkdirSync, copyFileSync } = require("fs");
const { promisify } = require("util");
const _rimraf = require("rimraf");

const JsonToCv = require("../../../lib/models/jsonToCV");

const rimraf = promisify(_rimraf);

const outputFixture = path.join(__dirname, "./../../fixture");
const validTheme = path.join(__dirname, "./../../../lib/themes/basic");
const infoFileName = "person.json";
const validInfoFile = path.join(validTheme, infoFileName);

beforeAll(() => {
	if (!existsSync(outputFixture)) {
		mkdirSync(outputFixture);
	}
});

test("should select a built-in theme", () => {
	const opts = { theme: "basic", dir: outputFixture };
	const jtc = new JsonToCv(opts);
	expect(jtc.paths.theme).toBe(
		path.join(__dirname, "../../../lib/themes", opts.theme)
	);
	expect(jtc.themeOrigin).toBe("built-in");
});

test("should throw if directory is not valid", async () => {
	const opts = {
		theme: "basic",
		dir: path.join(outputFixture, "examples/1"),
	};
	const jtc = new JsonToCv(opts);
	await expect(jtc.validateDir()).rejects.toThrow(/does not exist/);
});

test("should throw if info is not valid", async () => {
	const opts = {
		theme: "basic",
		dir: path.join(outputFixture, "examples/2"),
	};
	const jtc = new JsonToCv(opts);
	await expect(jtc.validateDir()).resolves.toBeUndefined();
	await expect(jtc.validateInfo()).rejects.toThrow();
});

test("should build the project", async () => {
	const dir = path.join(outputFixture, "examples/3");
	copyFileSync(validInfoFile, path.join(dir, infoFileName));
	const opts = {
		theme: "basic",
		dir: dir,
	};
	const jtc = new JsonToCv(opts);
	await expect(jtc.validateDir()).resolves.toBeUndefined();
	await expect(jtc.validateInfo()).resolves.toBeUndefined();
	await expect(jtc.build()).resolves.toBeUndefined();
	rimraf(path.join(dir, "**/*"));
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
