# JSON ⇒ CV

Create/Generate a web page [CV/Resume](https://en.wikipedia.org/wiki/Curriculum_vitae) from a JSON file. It's extensible, flexible, and easy to use.

[![npm](https://img.shields.io/npm/v/json-to-cv)](https://www.npmjs.com/package/json-to-cv)
[![npm](https://img.shields.io/npm/dw/json-to-cv)](https://www.npmjs.com/package/json-to-cv)
[![codecov](https://codecov.io/gh/Inambe/json-to-cv/branch/master/graph/badge.svg)](https://codecov.io/gh/Inambe/json-to-cv)

## Installation

As this package provides a `json-to-cv` cli tool, one should install it globally using the command:

`npm install -g json-to-cv`

## Usage

1. create and `cd` into a directory (e.g. `my-cv`)
2. create `person.json` file or copy it from any of theme's directory (e.g. [person.json](https://raw.githubusercontent.com/Inambe/json-to-cv/master/lib/themes/basic/person.json))
3. run `json-to-cv`
4. your cv/resume should be in `dist` directory.

## Themes

You can change the theme of `cv` very easily using `--theme` or `-t` option of `build` sub-command.

**Example:**

`json-to-cv build --theme=<theme-name>`

_or_

`json-to-cv build -t <theme-name>`

**How themes are chosen?**

`json-to-cv` will first look for `<theme-name>` named directory in the current directory to use as a theme(these are called `local` themes), if not found, it'll look if there is any `built-in` theme named `<theme-name>`, if not found, it'll end with an error.

_`built-in` themes are which come with `json-to-cv` package_

_`local` themes are which you develop as per your needs. It's also used when you modify any `built-in` theme_

_For now, there is only one, default, theme; `basic`. Any contributions to themes are welcome and appreciated._

## Modify Theme

You can modify any `built-in` theme very easily using `clone-theme` sub-command.

_make sure you are in the same directory as `person.json`_

1. run `json-to-cv clone-theme <theme-name>` to clone `<theme-name>` `built-in` theme in current directory.
    - e.g. `json-to-cv clone-theme basic` will create a `basic` named directory with all of its files.
    - the cloned theme will then be used as a `local` theme and you can modify it any way you like.
2. modify any theme file(s) (I used [pug](https://pugjs.org/api/getting-started.html) for template).
3. run `json-to-cv build -t <theme-name>` to build cv/resume with cloned, now a `local`, theme.
    - if you cloned `basic` theme you don't need `-t` or `--theme` option since it's the default. only `json-to-cv` command would work too.

## Watch Files

If you pass `-w` or `--watch` option to `build` sub-command, `json-to-cv` will continuously look for any changes in `person.json` or theme files(`local` or `built-in`) and will rebuild the cv/resume.

**Example:**

`json-to-cv build -w`

_or_

`json-to-cv build --watch`
