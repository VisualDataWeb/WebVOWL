"use strict";

module.exports = function (grunt) {
	require("load-grunt-tasks")(grunt);

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
				prereleaseName: "RC",
				push: false
			}
		},
	});
};
