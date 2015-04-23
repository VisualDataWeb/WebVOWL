The whole compiled and minified application can be found in the deploy
directory of every tagged release.

The source files are located in the src directory. We use a template for html
files for automatic insertion of the version number and later other details.

Development setup:
 1.  Download and install Node.js from http://nodejs.org/download/
 2a. Download and install Git from http://git-scm.com/downloads e.g. for Bower
 2b. The path to the git executable must maybe added to the PATH variable
     if the installation didn't do this.
 3.  Open the command line interface in the project directory (shift + right click -> CLI on Windows)
 4.  Enter 'npm install' to install grunt and bower and automatically download d3
 5.  Edit the code files
 6.  Run 'npm run-script package' to (re-)build all necessary files into the deploy directory

Development setup - advanced:
 A webserver can be easily started with the command 'npm run-script webserver'.
 This is useful, because some browsers like Chrome prevent loading scripts from
 the local file system. The webserver also notices file changes, rebuilds the
 project automatically and reloads the web page in the browser.
 The dependency management bower and the build system grunt are at the moment
 called via node. This can be changed by installing both globally in the node
 cli with 'node install -g bower grunt-cli'. From now on you can run more
 advanced task combinations listed e.g. in the Gruntfile.js.
