"use strict";

var ADDITIONAL_TEXT_SPACE = 4;

/**
 * Add String function to calculate the text field length.
 * @param textStyle The optional special style.
 * @returns {number} The width of the text.
 */
String.prototype.width = function (textStyle) {
	// Set a default value
	if (!textStyle) {
		textStyle = "text";
	}
	var d = d3.select("body")
			.append("div")
			.attr("class", textStyle)
			.attr("id", "width-test") // tag this element to identify it
			.text(this),
		w = document.getElementById("width-test").offsetWidth;
	d.remove();
	return w;
};

/**
 * Function to truncate a string.
 * @param maxLength The maximum length of the text block.
 * @param textStyle The optional special style.
 * @returns {String} The truncated String.
 */
String.prototype.truncate = function (maxLength, textStyle) {
	maxLength -= ADDITIONAL_TEXT_SPACE;
	if (isNaN(maxLength) || maxLength <= 0) {
		return this;
	}

	var text = this,
		textLength = this.length,
		textWidth,
		ratio;

	while (true) {
		textWidth = text.width(textStyle);
		if (textWidth <= maxLength) {
			break;
		}

		ratio = textWidth / maxLength;
		textLength = Math.floor(textLength / ratio);
		text = text.substring(0, textLength);
	}

	if (this.length > textLength) {
		return this.substring(0, textLength - 3) + "...";
	}
	return this;
};

/**
 * Checks if the array contains the specified object.
 * @param obj The object to search for.
 * @returns {boolean}
 */
Array.prototype.contains = function (obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
};
