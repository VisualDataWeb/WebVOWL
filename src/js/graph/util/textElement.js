/**
 * Creates a new textblock in the specified element.
 * @param element The element/group where the text block should be appended.
 * @constructor New text block where additional <tspan>'s can be applied to.
 */
webvowl.util.textElement = function (element) {

	var textElement = {},
		LINE_DISTANCE = 1,
		SUBTEXT_CSS_CLASS = "subtext",
		textBlock = element.append("text")
			.classed("text", true)
			.attr("text-anchor", "middle");

	/**
	 * Repositions the textblock according to its own offsetHeight.
	 */
	function repositionTextBlock() {
		// Nothing to do if no child elements exist
		var textBlockChildCount = textBlock.property("childElementCount");
		if (textBlockChildCount < 1) {
			return;
		}

		var textBlockHeight = getTextBlockHeight(textBlock);
		textBlock.attr("y", -textBlockHeight * 0.6 + "px");
	}

	/**
	 * Adds a new line of text to the element.
	 * @param text
	 */
	textElement.addTextline = function (text) {
		addTextline(text);
	};

	/**
	 * Adds a line of text in subproperty style.
	 * @param text
	 */
	textElement.addSubTextNode = function (text) {
		addTextline(text, SUBTEXT_CSS_CLASS, "(", ")");
	};

	/**
	 * Adds a line of text in equivalent node listing style.
	 * @param text
	 */
	textElement.addEquivalentSpan = function (text) {
		addTextline(text, SUBTEXT_CSS_CLASS, "[", "]");
	};

	function addTextline(text, subtextCssClass, prefix, postfix) {
		if (!text) {
			return;
		}

		var truncatedText, tspan;

		subtextCssClass = subtextCssClass || "text";
		truncatedText = text.truncate(element.datum().textWidth());

		tspan = textBlock.append("tspan")
			.classed("text", true)
			.classed(subtextCssClass, true)
			.text(applyPreAndPostFix(truncatedText, prefix, postfix), subtextCssClass)
			.attr("x", 0)
			.attr("dy", function () {
				var heightInPixels = getPixelHeightOfTextLine(d3.select(this)),
					siblingCount = textBlock.property("childElementCount") - 1,
					lineDistance = siblingCount > 0 ? LINE_DISTANCE : 0;
				return heightInPixels + lineDistance + "px";
			});


		repositionTextBlock();
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

	function getPixelHeightOfTextLine(textElement) {
		/* Due to browser incompatibilities this has to be hardcoded. This is because Firefox has no
		 * "offsetHeight" attribute like Chrome to retrieve the absolute pixel height. */
		if (textElement.classed("subtext")) {
			return 10;
		} else {
			return 14;
		}
	}

	function getTextBlockHeight(textBlock) {
		/* Hardcoded due to the same reasons like in the getPixelHeightOfTextLine function. */

		var children = textBlock.selectAll("*"),
			childCount = children.size();
		if (childCount === 0) {
			return 0;
		}

		// Values retrieved by testing
		var pixelHeight = childCount * LINE_DISTANCE;
		children.each(function () {
			pixelHeight += getPixelHeightOfTextLine(d3.select(this));
		});

		return pixelHeight;
	}

	textElement.setTranslation = function (x, y) {
		textBlock.attr("transform", "translate(" + x + ", " + y + ")");
	};

	return textElement;
};
