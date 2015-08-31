"use strict";

module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	var webpack = require("webpack");
	var webpackConfig = require("./webpack.config.js");

	var deployPath = "deploy/",
		graphPath = deployPath + "js/<%= pkg.name %>.js",
		minGraphPath = deployPath + "js/<%= pkg.name %>.min.js",
		appPath = deployPath + "js/<%= pkg.name %>-app.js",
		minAppPath = deployPath + "js/<%= pkg.name %>-app.min.js";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		bump: {
			options: {
				files: ["package.json"],
				updateConfigs: ["pkg"],
				commit: true,
				commitMessage: "Bump version to %VERSION%",
				commitFiles: ["package.json"],
				createTag: false,
				push: false
			}
		},
		clean: {
			js: ["!" + deployPath + ".htaccess", deployPath + "**/*"]
		},
		copy: {
			dependencies: {
				files: [
					{expand: true, cwd: "node_modules/d3/", src: ["d3*.js"], dest: deployPath + "/js/"}
				]
			},
			static: {
				files: [
					{expand: true, cwd: "src/css/", src: ["**"], dest: deployPath + "css/"},
					{expand: true, cwd: "src/js/data/", src: ["**"], dest: deployPath + "js/data/"},
					{expand: true, cwd: "src/", src: ["favicon.ico"], dest: deployPath},
					{expand: true, src: ["license.txt"], dest: deployPath}
				]
			}
		},
		cssmin: {
			all: {
				files: [{
					expand: true,
					cwd: deployPath + "css/",
					src: ["*.css", "!*.min.css"],
					dest: deployPath + "css/",
					ext: ".min.css"
				}]
			}
		},
		htmlbuild: {
			options: {
				beautify: true,
				relative: true,
				data: {
					// Data to pass to templates
					version: "<%= pkg.version %>"
				}
			},
			dev: {
				src: "src/index.html",
				dest: deployPath
			},
			release: {
				// required for removing the benchmark ontology from the selection menu
				src: "src/index.html",
				dest: deployPath
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			source: ["src/js/**/*.js"],
			tests: ["test/*/**/*.js"]
		},
		karma: {
			options: {
				configFile: "test/karma.conf.js"
			},
			dev: {

			},
			continuous: {
				singleRun: true
			}
		},
		replace: {
			options: {
				patterns: [
					{
						match: "WEBVOWL_VERSION",
						replacement: "<%= pkg.version %>"
					}
				]
			},
			dist: {
				files: [
					{expand: true, cwd: "deploy/js/", src: "webvowl*.js", dest: "deploy/js/"}
				]
			}
		},
		webpack: {
			options: webpackConfig,
			build: {
				plugins: webpackConfig.plugins.concat(
					new webpack.optimize.DedupePlugin(),
					new webpack.optimize.UglifyJsPlugin()
				)
			},
			"build-dev": {
				devtool: "sourcemap",
				debug: true
			}
		},
		"webpack-dev-server": {
			options: {
				webpack: webpackConfig,
				publicPath: "/" + webpackConfig.output.publicPath,
				port: 8000,
				contentBase: "deploy/"
			},
			start: {
				webpack: {
					devtool: "eval",
					debug: true
				}
			}
		},
		watch: {
			js: {
				files: ["src/js/**/*"],
				tasks: ["webpack:build-dev", "post-js"],
				options: {
					spawn: false
				}
			},
			css: {
				files: ["src/css/**/*.css"],
				tasks: ["copy", "cssmin"]
			},
			html: {
				files: ["src/**/*.html"],
				tasks: ["htmlbuild:dev"]
			}
		}
	});


	grunt.registerTask("default", ["release"]);
	grunt.registerTask("pre-js", ["clean", "copy", "cssmin"]);
	grunt.registerTask("post-js", ["replace"]);
	grunt.registerTask("package", ["pre-js", "webpack:build-dev", "post-js", "htmlbuild:dev"]);
	grunt.registerTask("release", ["pre-js", "webpack:build", "post-js", "htmlbuild:release"]);
	grunt.registerTask("webserver", ["package", "webpack-dev-server", "watch"]);
	grunt.registerTask("test", ["release", "karma:dev"]);
	grunt.registerTask("test-ci", ["release", "karma:continuous"]);
};
