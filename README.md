WebVOWL
=======

After the release of version 0.4.0 this repository was ported from an internal SVN repository to
Github. Due to cleanups with `git filter-branch` there might be some strange commits.


Requirements
------------

Node.js for installing the development tools and the dependencies.


Development setup
-----------------

### Simple ###
1. Download and install Node.js from http://nodejs.org/download/
2. Open the terminal in the root directory
3. Run `npm install` to install the dependencies automatically install d3 with bower
4. Edit the code
5. Run `npm run-script release` to (re-)build all necessary files into the deploy directory

### Advanced ###
Instead of the last step of the simple setup, install the npm package `grunt-cli` globally with
`npm install grunt-cli -g`. Now you can execute a few more advanced commands in the terminal:

* `grunt` or `grunt release` builds the release files into the deploy directory
* `grunt package` builds the development version
* `grunt webserver` starts a local live-updating webserver with the current development version
* `grunt test` starts the test runner


Additional information
----------------------

To export the current graph to SVG file, we have to inline all css styles into the SVG code.
That means, that if you change the CSS in the `vowl.css` file, you have to update the code that
inlines the styles or otherwise the exported SVG will not look the same as the displayed graph.

The tool which creates the code that inlines the styles can be found in the util directory. Please
follow the instructions in its README file.
