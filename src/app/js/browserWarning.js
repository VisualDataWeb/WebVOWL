/* Taken from here: http://stackoverflow.com/a/17907562 */
function getInternetExplorerVersion() {
	var ua,
		re,
		rv = -1;
	if (navigator.appName === "Microsoft Internet Explorer") {
		ua = navigator.userAgent;
		re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
		if (re.exec(ua) !== null) {
			rv = parseFloat(RegExp.$1);
		}
	} else if (navigator.appName === "Netscape") {
		ua = navigator.userAgent;
		re = new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})");
		if (re.exec(ua) !== null) {
			rv = parseFloat(RegExp.$1);
		}
	}
	return rv;
}

function showBrowserWarningIfRequired() {
	var version = getInternetExplorerVersion();
	if (version > 0 && version <= 11) {
		document.write("<div id=\"browserCheck\">The WebVOWL demo does not work in Internet Explorer. Please use another browser, such as <a href=\"http://www.mozilla.org/firefox/\">Mozilla Firefox</a> or <a href=\"https://www.google.com/chrome/\">Google Chrome</a>, to run the WebVOWL demo.</div>");
		// hiding any additional menus and features
		var canvasArea = document.getElementById("canvasArea"),
			detailsArea = document.getElementById("detailsArea"),
			optionsArea = document.getElementById("optionsArea");
		canvasArea.className = "hidden";
		detailsArea.className = "hidden";
		optionsArea.className = "hidden";
	}
}


module.exports = showBrowserWarningIfRequired;
