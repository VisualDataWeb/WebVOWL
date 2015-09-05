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

tools.truncate = function (text, maxLength, textStyle) {
	maxLength -= ADDITIONAL_TEXT_SPACE;
	if (isNaN(maxLength) || maxLength <= 0) {
		return text;
	}

	var textLength = text.length,
		textWidth,
		ratio;

	while (true) {
		textWidth = measureTextWidth(text, textStyle);
		if (textWidth <= maxLength) {
			break;
		}

		ratio = textWidth / maxLength;
		textLength = Math.floor(textLength / ratio);
		text = text.substring(0, textLength);
	}

	if (text.length > textLength) {
		return text.substring(0, textLength - 3) + "...";
	}
	return text;
};


module.exports = function () {
	return tools;
};
