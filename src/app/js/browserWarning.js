/* Taken from here: http://stackoverflow.com/a/17907562 */
function getInternetExplorerVersion() {
	var ua,
		re,
		rv = -1;

	// check for edge
	var isEdge=/(?:\b(MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:|\bEdge\/)(\d+)/.test(navigator.userAgent);
	if (isEdge){
		rv  = parseInt("12");
		return rv;
	}

	var isIE11 = /Trident.*rv[ :]*11\./.test(navigator.userAgent);
	if (isIE11){
		rv  = parseInt("11");
		return rv;
	}
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
	if (version > 0 && version <= 12) {
		document.write("<div id=\"browserCheck\">WebVOWL does not work properly in Internet Explorer and Microsoft Edge. Please use another browser, such as <a href=\"http://www.mozilla.org/firefox/\">Mozilla Firefox</a> or <a href=\"https://www.google.com/chrome/\">Google Chrome</a>, to run WebVOWL.</div>");
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
showBrowserWarningIfRequired();