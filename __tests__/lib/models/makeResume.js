const path = require("path");
const { existsSync, mkdirSync, copyFileSync } = require("fs");
const { promisify } = require("util");
const _rimraf = require("rimraf");

const MakeResume = require("../../../lib/models/makeResume");

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
	const mr = new MakeResume(opts);
	expect(mr.paths.theme).toBe(
		path.join(__dirname, "../../../lib/themes", opts.theme)
	);
	expect(mr.themeOrigin).toBe("built-in");
});

test("should throw if directory is not valid", async () => {
	const opts = {
		theme: "basic",
		dir: path.join(outputFixture, "examples/1"),
	};
	const mr = new MakeResume(opts);
	await expect(mr.validate()).rejects.toThrow(/does not exist/);
});

test("should throw if info is not valid", async () => {
	const opts = {
		theme: "basic",
		dir: path.join(outputFixture, "examples/2"),
	};
	const mr = new MakeResume(opts);
	await expect(mr.validate()).resolves.toBeUndefined();
	await expect(mr.loadInfo()).rejects.toThrow();
});

test("should build the project", async () => {
	const dir = path.join(outputFixture, "examples/3");
	copyFileSync(validInfoFile, path.join(dir, infoFileName));
	const opts = {
		theme: "basic",
		dir: dir,
	};
	const mr = new MakeResume(opts);
	await expect(mr.validate()).resolves.toBeUndefined();
	await expect(mr.loadInfo()).resolves.toBeUndefined();
	await expect(mr.build()).resolves.toBeUndefined();
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
		const mr = new MakeResume(opts);
		await mr.cloneTheme();
		expect(existsSync(localThemePath)).toBe(true);
	});

	test("should use cloned theme", () => {
		const opts = {
			theme: theme,
			dir: outputFixture,
		};
		const mr = new MakeResume(opts);
		expect(mr.paths.theme).toBe(localThemePath);
	});

	afterAll(async () => {
		await rimraf(localThemePath);
	});
});
