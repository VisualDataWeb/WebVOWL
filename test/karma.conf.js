module.exports = function (config) {
	config.set({
		basePath: "../",
		frameworks: ["jasmine"],
		files: [
			"node_modules/d3/d3.js",
			"test/unit/index.js"
		],
		preprocessors: {
			"test/unit/index.js": ["webpack"]
		},
		reporters: ["spec"],
		browsers: ["PhantomJS"],
		plugins: [
			require("karma-jasmine"),
			require("karma-phantomjs-launcher"),
			require("karma-spec-reporter"),
			require("karma-webpack")
		],
		webpack: {
			resolve: {
				extensions: ["", ".js"]
			}
		},
		webpackMiddleware: {
			noInfo: true
		},
		singleRun: false
	});
};
