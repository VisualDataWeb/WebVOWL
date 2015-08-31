module.exports = function (config) {
	config.set({
		basePath: "../",
		frameworks: ["jasmine"],
		files: [
			"deploy/js/**/*.js",
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
