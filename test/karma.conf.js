module.exports = function (config) {
	config.set({
		basePath: "../",
		frameworks: ["jasmine"],
		preprocessors: {
			"test/unit/**/*.js": ["webpack"]
		},
		files: [
			"node_modules/d3/d3.js",
			"test/unit/**/*.js"
		],
		reporters: ["progress"],
		browsers: ["PhantomJS"],
		plugins: [
			"karma-phantomjs-launcher",
			"karma-jasmine",
			"karma-webpack"
		],
		webpack: {
			cache: true,
			entry: {
				webvowl: "./src/webvowl/js/entry.js"
			},
			module: {
				loaders: [
					{test: /\.css$/, loader: "style!css"},
					{test: /\.json$/, loader: "file"}
				]
			}
		},
		webpackMiddleware: {
			noInfo: true
		},
		singleRun: false
	});
};
