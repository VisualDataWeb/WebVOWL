var path = require("path");
var webpack = require("webpack");

module.exports = {
	cache: true,
	entry: {
		webvowl: "./src/js/header.js",
		"webvowl-app": "./src/js/app/header.js"
	},
	output: {
		path: path.join(__dirname, "deploy/js/"),
		publicPath: "deploy/js/",
		filename: "[name].js",
		chunkFilename: "[chunkhash].js"
	},
	plugins: [
		new webpack.ProvidePlugin({
			d3: "d3"
		})
	],
	externals: {
		"d3": "d3"
	}
};
