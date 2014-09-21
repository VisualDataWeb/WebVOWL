/**
 * Creates a new textblock in the specified element.
 * @param element The element/group where the text block should be appended.
 * @constructor New text block where additional <tspan>'s can be applied to.
 */
webvowl.util.textElement = function (element) {

	var textElement = {},
		DEFAULT_DY = 0.5,
		SPACE_BETWEEN_SPANS = 0.25,
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

		var textBlockHeight,
		// the first element is correct, but with multiple tspans a reposition is required
			additionalChildCount = textBlockChildCount - 1;

		textBlockHeight = additionalChildCount * (1 /*text height itself*/ + SPACE_BETWEEN_SPANS);

		textBlock.attr("y", -textBlockHeight / 2 + "ex");
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
			.attr("x", 0)
			.attr("dy", function () {
				var dy = DEFAULT_DY,
					siblingCount = textBlock.property("childElementCount") - 1;

				if (siblingCount > 0) {
					dy += DEFAULT_DY + 1 + SPACE_BETWEEN_SPANS;
				}
				return dy + "ex";
			})
			.text(applyPreAndPostFix(truncatedText, prefix, postfix), subtextCssClass);

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

	textElement.setTranslation = function (x, y) {
		textBlock.attr("transform", "translate(" + x + ", " + y + ")");
	};

	return textElement;
};
