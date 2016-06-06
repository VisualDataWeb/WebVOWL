var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	cache: true,
	entry: {
		webvowl: "./src/webvowl/js/entry.js",
		"webvowl.app": "./src/app/js/entry.js"
	},
	output: {
		path: path.join(__dirname, "deploy/"),
		publicPath: "",
		filename: "js/[name].js",
		chunkFilename: "js/[chunkhash].js",
		libraryTarget: "assign",
		library: "[name]"
	},
	module: {
		loaders: [
			{test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")}
		]
	},
	plugins: [
		new CopyWebpackPlugin([
			{context: "src/app", from: "data/**/*"}
		]),
		new ExtractTextPlugin("css/[name].css"),
		new webpack.ProvidePlugin({
			d3: "d3"
		})
	],
	externals: {
		"d3": "d3"
	}
};
