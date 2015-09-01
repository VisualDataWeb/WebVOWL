module.exports = function (config) {
	config.set({
		basePath: "../",
		frameworks: ["jasmine", "commonjs"],
		preprocessors: {
			"src/js/**/*.js": ["commonjs"]
		},
		files: [
			"node_modules/d3/d3.min.js",
			"src/js/**/*.js",
			"test/unit/**/*.js"
		],
		reporters: ["progress"],
		port: 9876,
		autoWatch: true,
		browsers : ["PhantomJS"],
		plugins : [
			"karma-phantomjs-launcher",
			"karma-jasmine",
			"karma-commonjs"
		],
		singleRun: false
	});
};
