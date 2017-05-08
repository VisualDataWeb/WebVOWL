WebVOWL [![Build Status](https://travis-ci.org/VisualDataWeb/WebVOWL.svg?branch=master)](https://travis-ci.org/VisualDataWeb/WebVOWL)
=======

This repository was ported from an internal SVN repository to Github after the release of WebVOWL 0.4.0. Due to cleanups with `git filter-branch`, the commit history might show some strange effects.


Requirements
------------

Node.js for installing the development tools and dependencies.


Development setup
-----------------

### Simple ###
1. Download and install Node.js from http://nodejs.org/download/
2. Open the terminal in the root directory
3. Run `npm install` to install the dependencies and build the project
4. Edit the code
5. Run `npm run release` to (re-)build all necessary files into the deploy directory

### Advanced ###
You can execute a few more advanced commands in the terminal:

* `npm run build` builds the development version
* `npm run webserver` starts a local live-updating webserver with the current development version
* `npm run test` starts the test runner
* `npm run zip` builds the project and puts it into a zip file

After install the npm package `grunt-cli` globally with `npm install grunt-cli -g` you can use `grunt-bump`.
* `grunt bump` increases version of the package and creates commit with the changes

Additional information
----------------------

To export the VOWL visualization to an SVG image, all css styles have to be included into the SVG code.
This means that if you change the CSS code in the `vowl.css` file, you also have to update the code that
inlines the styles - otherwise the exported SVG will not look the same as the displayed graph.

The tool which creates the code that inlines the styles can be found in the util directory. Please
follow the instructions in its [README](util/VowlCssToD3RuleConverter/README.md) file.
