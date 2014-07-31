module.exports = function (config) {
	config.set({
		basePath: "../",
		frameworks: ["jasmine"],
		files: [
			"components/d3/d3.js",
			"src/js/header.js",
			"src/js/graph/**/*.js",
			"test/unit/**/*.js"
		],
		reporters: ["progress"],
		port: 9876,
		autoWatch: true,
		browsers : ["PhantomJS"],
		plugins : [
			"karma-phantomjs-launcher",
			"karma-jasmine"
		],
		singleRun: false
	});
};
