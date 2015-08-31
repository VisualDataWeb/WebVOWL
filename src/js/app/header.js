require("./browserWarning.js");

var webvowlApp = {};
webvowlApp.app = require("./app.js");
webvowlApp.version = "@@WEBVOWL_VERSION";

window.webvowlApp = webvowlApp;
