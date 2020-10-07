# Make Resume

Separate data from design and build beautiful Resumes.

[![npm](https://img.shields.io/npm/v/make-resume)](https://www.npmjs.com/package/make-resume)
[![npm](https://img.shields.io/npm/dw/make-resume)](https://www.npmjs.com/package/make-resume)

## Features/Highlights

-   uses [JSON Resume](jsonresume.org) JSON schema
-   make multiple resumes in a single directory by using CLI options
-   make modifications to built-in and other themes; with ease!

## Installation

Since this package provides a `make-resume` CLI tool, one should install it globally using the command:

`npm install -g make-resume`

## Usage

1. create and `cd` into a directory (e.g. `my-resume`)
2. create `resume.json` file and copy the schema from [JSON Resume](https://jsonresume.org/schema/)
3. run `make-resume` (yes, with no options ‒ yet!)
4. your Resume should be in the `dist` directory

## Themes

You can change the theme of Resume very easily using the `--theme` or `-t` option of `build` sub-command.

Example:

`make-resume build --theme=<theme-name>`

_or_

`make-resume build -t <theme-name>`

### What is `<theme-name>`?

`<theme-name>` is the package name of the theme in the case of `built-in-mod` and `local-mod` themes or directory name in the case of `local` themes. See **Theme Origins** below.

Example:

`make-resume build -t make-resume-base`

The above command will use the `make-resume-base` `built-in-mod` theme, which is a package installed with `make-resume`, to build the Resume. `make-resume-base` is also the default theme so running `make-resume` only would work same as the above example command.

### Theme Origins

Make Resume can dynamically choose themes from different places/origins/locations.

There are three possible origins of a theme right now:

1. `built-in-mod` themes are packages installed with the `make-resume` package as dependencies

    - these are available by default
    - e.g. [`make-resume-base`](https://github.com/make-resume/make-resume-base)

2. `local-mod` themes are packages installed in a directory using `npm install` or similar command

    - you've to install these in a directory to use

3. `local` themes are simply a folder containing theme files
    - a `local` theme should be in the same directory as your `resume.json` file

### How themes are chosen?

`make-resume` will first look for `<theme-name>` directory in the current directory to use as a `local` theme, if not found, it'll look for `<theme-name>` package in the current directory, if not found, it'll look for `<theme-name>` package installed with `make-resume`, if not found, it'll end with an error.

_`local` themes are ones which you modify as per your needs._

### Modify theme

You can modify any `built-in-mod` or `local-mod` theme very easily using the `clone-theme` sub-command.

_make sure you are in the same directory as `resume.json`_

1. run `make-resume clone-theme <theme-name>` to clone `<theme-name>` theme in current directory.
    - e.g. `make-resume clone-theme make-resume-base` will create a `make-resume-base` named directory with all of its files in it.
    - the cloned theme will then be used as a `local` theme and you can modify it any way you like.
2. modify any theme file(s) (we used [Handlebars](https://handlebarsjs.com) for template).
3. run `make-resume build -t <theme-name>` to build Resume with cloned, now a `local`, theme.
    - if you'd cloned the `make-resume-base` theme you don't need the `-t` option since it's the default theme.

## Watch files

If you pass the `-w` or `--watch` option to `build` sub-command, `make-resume` will continuously look for any changes in `resume.json` or theme files and will rebuild the Resume.

Example:

`make-resume build -w`

_or_

`make-resume build --watch`

## Theme Library

There is only one theme available right now but I'm hoping for contribution from people. Let me know if you need information regarding that.

[make-resume-base](http://github.com/make-resume/make-resume-base) (_built-in and default_)
