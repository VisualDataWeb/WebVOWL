var path = require("path");
var webpack = require("webpack");
var HtmlReplaceWebpackPlugin = require("html-replace-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var GitRevisionPlugin = require('git-revision-webpack-plugin');
var CleanWebpackPlugin = require("clean-webpack-plugin");
var DashboardPlugin = require("webpack-dashboard/plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ZipPlugin = require('zip-webpack-plugin');

var outputPath = "deploy/";
var isDevelopment = process.env.NODE_ENV === "development";

var config = {
  cache: true,
  entry: {
    webvowl: "./src/webvowl/js/entry.js",
    "webvowl.app": "./src/app/js/entry.js"
  },
  output: {
    path: path.join(__dirname, outputPath),
    publicPath: "",
    filename: "js/[name].js",
    chunkFilename: "js/[chunkhash].js",
    libraryTarget: "assign",
    library: "[name]"
  },
  devtool: isDevelopment ? "eval" : "source-map",
  module: {
    rules: [{
        test: /\.js$/, // include .js files
        enforce: "pre", // preload the jshint loader
        exclude: [
					/node_modules/,
					/src\/webvowl\/js\/entry\.js/,
					/src\/app\/js\/browserWarning\.js/,
					/src\/app\/js\/entry\.js/,
					/deploy/
				], // exclude any and all files in the node_modules folder
        use: [{
          loader: "jshint-loader"
        }]
      },
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: {
            loader: "style-loader",
            options: {
              sourceMap: true,
            }
          },
          use: [{
              loader: "css-loader",
              options: {
                minimize: !isDevelopment,
                sourceMap: true,
                importLoaders: 1
              }
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: 'inline',
              }
            },
          ]
        })
      }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new CleanWebpackPlugin(outputPath),
    new HtmlReplaceWebpackPlugin({
      pattern: "<%= version %>",
      replacement: require("./package.json").version
    }),
    new ExtractTextPlugin({
      disable: isDevelopment,
      filename: "css/[name].[chunkhash].css",
      allChunks: true
    }),
    new CopyWebpackPlugin([{
        context: "src/app",
        from: "data/**/*"
      },
      {
        from: "node_modules/d3/d3.min.js",
        to: "js"
      }
    ]),
    new webpack.ProvidePlugin({
      d3: "d3",
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ],
  externals: {
    d3: "d3",
  },
  devServer: {
    contentBase: path.join(__dirname, outputPath),
    compress: true,
    hot: true,
    historyApiFallback: true,
    inline: true,
    watchContentBase: true,
    open: true,
    port: 8000
  }
};

// use it for "release", "zip" & "production"
if (!isDevelopment) {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      minimize: true,
      compress: {
        warnings: true
      }
    }),
    new CopyWebpackPlugin([{
        from: "src/favicon.ico"
      },
      {
        from: "license.txt"
      }
    ])
  );
}

if (process.env.NODE_ENV === "release") {
  config.plugins.push(
    new Bump([
      "package.json",
    ])
  );
} else if (process.env.NODE_ENV === "zip") {
  var gitRevisionPlugin = new GitRevisionPlugin();
  var branch = gitRevisionPlugin.branch();
  var commithash = gitRevisionPlugin.commithash();
  config.plugins.push(
    new ZipPlugin({
      // OPTIONAL: defaults to the Webpack output filename (above) or,
      // if not present, the basename of the path
      filename: "webvowl-" + branch + "-" + commithash + ".zip",
      // OPTIONAL: defaults an empty string
      // the prefix for the files included in the zip file
      pathPrefix: outputPath,
    })
  );
} else if (isDevelopment) {
  config.plugins.push(
    new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin()
  );
}

module.exports = config;
