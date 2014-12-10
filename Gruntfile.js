"use strict";

module.exports = function (grunt) {

	var deployPath = "deploy/",
		graphPath = deployPath + "js/<%= pkg.name %>.js",
		minGraphPath = deployPath + "js/<%= pkg.name %>.min.js",
		appPath = deployPath + "js/<%= pkg.name %>-app.js",
		minAppPath = deployPath + "js/<%= pkg.name %>-app.min.js";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		bowerrc: grunt.file.readJSON(".bowerrc"),
		bump: {
			options: {
				files: ["bower.json", "package.json"],
				updateConfigs: ["pkg"],
				commit: true,
				commitMessage: "Bump version to %VERSION%",
				commitFiles: ["bower.json", "package.json"],
				createTag: false,
				push: false
			}
		},
		clean: {
			js: [deployPath]
		},
		concat: {
			options: {
				process: function (src, filepath) {
					return "// Source: " + filepath + "\n" + src;
				}
			},
			graph: {
				src: ["src/js/header.js", "src/js/graph/**/*.js"],
				dest: graphPath
			},
			app: {
				src: ["src/js/app/header.js", "src/js/app/**/*.js"],
				dest: appPath
			}
		},
		connect: {
			devserver: {
				options: {
					protocol: "http",
					hostname: "localhost",
					port: 8000,
					base: deployPath,
					directory: deployPath,
					livereload: true,
					open: "http://localhost:8000/webvowl.html",
					middleware: function (connect, options) {
						return [
							connect.favicon("favicon.ico"),
							connect.static(options.base[0]),
							connect.directory(options.base[0])
						];
					}
				}
			}
		},
		copy: {
			dependencies: {
				files: [
					{expand: true, cwd: "<%= bowerrc.directory %>/d3/", src: ["d3*.js"], dest: deployPath + "/js/"}
				]
			},
			static: {
				files: [
					{expand: true, cwd: "src/css/", src: ["**"], dest: deployPath + "css/"},
					{expand: true, cwd: "src/js/data/", src: ["**"], dest: deployPath + "js/data/"},
					{expand: true, src: ["license.txt", "favicon.ico"], dest: deployPath}
				]
			}
		},
		htmlbuild: {
			dist: {
				src: "src/webvowl.html",
				dest: deployPath,
				options: {
					beautify: true,
					relative: true,
					data: {
						// Data to pass to templates
						version: "<%= pkg.version %>"
					}
				}
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
			unit: {
				configFile: "test/karma.conf.js"
			}
		},
		uglify: {
			options: {
				banner: "/*! <%= pkg.name %> v<%= pkg.version %> */\n"
			},
			graph: {
				src: graphPath,
				dest: minGraphPath
			},
			app: {
				src: appPath,
				dest: minAppPath
			}
		},
		watch: {
			options: {
				livereload: true
			},
			css: {
				files: ["src/css/**/*.css"],
				tasks: ["copy"]
			},
			html: {
				files: ["src/**/*.html"],
				tasks: ["htmlbuild"]
			},
			scripts: {
				files: ["src/js/**/*"],
				tasks: ["package"]
			}
		}
	});

	grunt.loadNpmTasks("grunt-bump");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-html-build");
	grunt.loadNpmTasks("grunt-karma");

	grunt.registerTask("build", ["clean", "copy", "concat", "htmlbuild"]);
	grunt.registerTask("default", ["package"]);
	grunt.registerTask("package", ["build", "uglify"]);
	grunt.registerTask("webserver", ["package", "connect:devserver", "watch"]);
	grunt.registerTask("test", ["karma"]);
};