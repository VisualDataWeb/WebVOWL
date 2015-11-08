var textTools = require("./textTools")();

/**
 * Creates a new textblock in the specified element.
 * @param element The element/group where the text block should be appended.
 * @constructor New text block where additional <tspan>'s can be applied to.
 */
module.exports = function (element) {

	var textElement = {},
		LINE_DISTANCE = 1,
		textBlock = element.append("text")
			.classed("text", true)
			.attr("text-anchor", "middle");

	var TEXT_CSS_CLASS = {
		default: "text",
		subtext: "subtext",
		instanceCount: "instance-count"
	};


	/**
	 * Adds a new line of text to the element.
	 * @param text
	 * @param prefix
	 * @param suffix
	 */
	textElement.addText = function (text, prefix, suffix) {
		if (text) {
			addTextline(text, TEXT_CSS_CLASS.default, prefix, suffix);
		}
	};

	/**
	 * Adds a line of text in subproperty style.
	 * @param text
	 */
	textElement.addSubText = function (text) {
		if (text) {
			addTextline(text, TEXT_CSS_CLASS.subtext, "(", ")");
		}
	};

	/**
	 * Adds a line of text in equivalent node listing style.
	 * @param text
	 */
	textElement.addEquivalents = function (text) {
		if (text) {
			addTextline(text, TEXT_CSS_CLASS.default);
		}
	};

	/**
	 * Adds a label with the instance count.
	 * @param instanceCount
	 */
	textElement.addInstanceCount = function (instanceCount) {
		if (instanceCount) {
			addTextline(instanceCount.toString(), TEXT_CSS_CLASS.instanceCount);
		}
	};

	textElement.addEmptyLine = function (pixelHeight) {
		if (pixelHeight > 0) {
			textBlock.append("tspan")
				.classed("empty", true)
				.attr("dy", pixelHeight + "px")
				.text(" ");
			repositionTextBlock();
		}
	};

	textElement.setTranslation = function (x, y) {
		textBlock.attr("transform", "translate(" + x + ", " + y + ")");
	};

	textElement.clear = function () {
		textBlock.selectAll("*").remove();
	};

	function addTextline(text, style, prefix, postfix) {
		var truncatedText = textTools.truncate(text, element.datum().textWidth(), style);

		var tspan = textBlock.append("tspan")
			.classed(TEXT_CSS_CLASS.default, true)
			.classed(style, true)
			.text(applyPreAndPostFix(truncatedText, prefix, postfix))
			.attr("x", 0);
		repositionTextLine(tspan);

		repositionTextBlock();
	}

	function repositionTextLine(tspan) {
		var fontSizeProperty = window.getComputedStyle(tspan.node()).getPropertyValue("font-size");
		var fontSize = parseFloat(fontSizeProperty);

		tspan.attr("dy", function () {
			var siblingCount = getLineCount() - 1,
				lineDistance = siblingCount > 0 ? LINE_DISTANCE : 0;
			return fontSize + lineDistance + "px";
		});
	}

	/**
	 * Repositions the textblock according to its own offsetHeight.
	 */
	function repositionTextBlock() {
		// Nothing to do if no child elements exist
		var lineCount = getLineCount();
		if (lineCount < 1) {
			textBlock.attr("y", 0);
			return;
		}

		var textBlockHeight = textBlock.node().getBBox().height;
		textBlock.attr("y", -textBlockHeight * 0.5 + "px");
	}

	function getLineCount() {
		return textBlock.property("childElementCount");
	}

	function applyPreAndPostFix(text, prefix, postfix) {
		if (prefix) {
			text = prefix + text;
		}
		if (postfix) {
			text += postfix;
		}
		return text;
	}


	return textElement;
};
