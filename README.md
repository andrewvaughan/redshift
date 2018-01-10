<h1 align="center">
    <br />
    <a href="https://github.com/andrewvaughan/redshift" target="_blank">
        <img src="https://media.githubusercontent.com/media/andrewvaughan/redshift/master/resources/media/logo.png" alt="Redshift" width="80%">
    </a>
    <br/>
</h1>

<h4 align="center">A modern multi-user dungeon (MUD) game engine built in Node.js</h4>

<p align="center">
    <a href="https://github.com/andrewvaughan/redshift/releases" target="_blank">
        <img src="http://img.shields.io/badge/version-0.1.0-blue.svg?style=flat" alt="Version 0.1.0" />
    </a>
    <a href="https://github.com/andrewvaughan/redshift/blob/master/LICENSE" target="_blank">
        <img src="http://img.shields.io/badge/license-MIT-blue.svg?style=flat" alt="MIT License" />
    </a>
    <a href="https://discord.gg/QJgj8fP" target="_blank">
        <img src="http://img.shields.io/badge/discord-chat%20now-orange.svg?style=flat" alt="Chat on Discord" />
    </a>
</p>
<p align="center">
    <a href="https://travis-ci.org/andrewvaughan/redshift" target="_blank">
        <img src="https://travis-ci.org/andrewvaughan/redshift.svg?branch=master" alt="Build Status" />
    </a>
    <a href="https://coveralls.io/github/andrewvaughan/redshift?branch=master" target="_blank">
        <img src="https://coveralls.io/repos/github/andrewvaughan/redshift/badge.svg?branch=master" alt="Coverage Status" />
    </a>
    <a href="https://inch-ci.org/github/andrewvaughan/redshift" target="_blank">
        <img src="https://inch-ci.org/github/andrewvaughan/redshift.svg?branch=master" alt="Documentation Status" />
    </a>
    <a href="https://david-dm.org/andrevaughan/redshift/" target="_blank">
        <img src="https://david-dm.org/andrewvaughan/redshift/status.svg" alt="Dependency Status" />
    </a>
    <a href="https://david-dm.org/andrevaughan/redshift/?type=dev" target="_blank">
        <img src="https://david-dm.org/andrewvaughan/redshift/dev-status.svg" alt="Developer Dependency Status" />
    </a>
</p>

## Key Features

[Redshift][project-url] is a modern MUD engine built with Node.js.  It adheres to an object-oriented design
philosophy, creating an environment that fosters rapid and [DRY][dry-url] development.

By adhering to a stack that is entirely architected within JavaScript, scripting can be as basic or as powerful as a
developer needs.  Redshift is designed to be extensible and modular, allowing for game creators to quickly and
effectively create worlds, quests, and adventures.

### Key Features Include:

* (Coming Soon)

## Installation

Redshift can be installed with [NPM][npm-url]:

```bash
npm install redshift-engine
```

Alternatively, and more recommended, you can add the latest version of the [redshift-engine][project-npm] module to
your `package.json` file for your project.  Redshift can be configured, as explained [below](#usage), to automatically
find and incorporate your custom modules for your game.

### Usage

A `redshift` script is provided in the main project folder to start the Redshift engine.  It provides a number of
basic options, which can be listed with the `-h` option:

```bash
redshift -h
```

The most important option for the engine is the `--config` or `-c` option, which tells the engine where your
configuration file is on your system.  This file can be a `.json`, `.yml`, or `.xml` file with configuration settings
inside of it.  For example:

```bash
redshift -c ~/redshift-config.json
```

#### Configuration Options

Configuration can be stored in a `.json`, `.yml`, or `.xml` file in their respective format.  This JSON example
lists all of the defaults, if no configuration is provided:

```json
{
    "debug"   : false,
    "verbose" : false
}
```

The configuration options are as follows:

| Option  | Value Type | Default Value | Note |
|---------|------------|---------------|------------------------------------------------------------------------------------|
| debug   | `boolean`  | `false`       | Whether to output debugging information. Can be overridden by command line options. |
| verbose | `boolean`  | `false`       | Whether to output verbose debugging information.  If set true, automatically sets `debug` to true. Can be overridden by command line options. |

## Module Development

Redshift is intended to be extended by NPM modules specific to your game or project.  Instructions for how to develop
Redshift modules will be added when support is fully available.

## Contributing

There are many ways to contribute to Redshift.  If you have an idea or have discovered a bug please
[open an issue][project-issues] so it can be addressed.

If you are interested in contributing to the project with design or development, please read our
[Contribution Guidelines][project-contributing] before starting.

## Release Policy

Releases of Redshift follow [Semantic Versioning][semver-url] standards in a `MAJOR.MINOR.PATCH` versioning
scheme of the following format:

* `MAJOR` - modified when major, incompatible changes are made to the application,
* `MINOR` - modified when functionality is added in a backwards-compatible manner, and
* `PATCH` - patches to existing functionality, such as documentation and bug fixes.

## License

This project is licensed via the [MIT License][project-license]:

```
MIT License

Copyright (c) 2018 Andrew Vaughan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```


[project-url]:          https://github.com/andrewvaughan/redshift
[project-issues]:       https://github.com/andrewvaughan/redshift/issues
[project-license]:      https://github.com/andrewvaughan/redshift/blob/master/LICENSE
[project-contributing]: https://github.com/nimbus-pi/nimbus-pi/blob/master/CONTRIBUTING.md
[project-npm]:          https://www.npmjs.com/package/redshift-engine

[npm-url]:    https://www.npmjs.com/
[dry-url]:    https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[semver-url]: http://semver.org/
