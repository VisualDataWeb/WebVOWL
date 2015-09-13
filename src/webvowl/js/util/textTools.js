"use strict";

var ADDITIONAL_TEXT_SPACE = 4;

var tools = {};

function measureTextWidth(text, textStyle) {
	// Set a default value
	if (!textStyle) {
		textStyle = "text";
	}
	var d = d3.select("body")
			.append("div")
			.attr("class", textStyle)
			.attr("id", "width-test") // tag this element to identify it
			.text(text),
		w = document.getElementById("width-test").offsetWidth;
	d.remove();
	return w;
}

tools.truncate = function (text, maxWidth, textStyle) {
	maxWidth -= ADDITIONAL_TEXT_SPACE;
	if (isNaN(maxWidth) || maxWidth <= 0) {
		return text;
	}

	var truncatedText = text,
		newTruncatedTextLength,
		textWidth,
		ratio;

	while (true) {
		textWidth = measureTextWidth(truncatedText, textStyle);
		if (textWidth <= maxWidth) {
			break;
		}

		ratio = textWidth / maxWidth;
		newTruncatedTextLength = Math.floor(truncatedText.length / ratio);
		truncatedText = truncatedText.substring(0, newTruncatedTextLength);
	}

	if (text.length > truncatedText.length) {
		return text.substring(0, truncatedText.length - 3) + "...";
	}
	return text;
};


module.exports = function () {
	return tools;
};
