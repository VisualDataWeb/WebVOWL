/**
 * Creates a new textblock in the specified element.
 * @param element The element/group where the text block should be appended.
 * @constructor New text block where additional <tspan>'s can be applied to.
 */
webvowl.util.textElement = function (element) {

	var textElement = {},
		SPACE_BETWEEN_SPANS = 12,
		textBlock = element.append("text")
			.classed("text", true)
			.attr("text-anchor", "middle");

	/**
	 * Repositions the textblock according to its own offsetHeight.
	 */
	textElement.repositionTextBlock = function repositionTextBlockFunct() {
		// Testing which browser is
		var FIREFOX = /Firefox/i.test(navigator.userAgent);
		var OPERA = /Opera/i.test(navigator.userAgent);
		var moveup;

		/* According to the used browser different methods are used.
		 * Calculation method:
		 * The first textline is positioned correctly that means it's the middle point lies also in the middle of the box.
		 * Now if more elements exists we remove the complete first block. Now the middle line lies not on top of
		 * our left box. So we need to remove again half of the first box to move it further up. Now we can half it and
		 * this is what we need to move up.
		 */
		if (FIREFOX || OPERA) {
			// If has only one <tspan> ignore.
			if (textBlock.property("children").length === 1) {
				moveup = 0;
			} else {
				var textbbox = textBlock.node().getBoundingClientRect();
				moveup = textbbox.height;
				// Because x, y is the lower left corner and the first child is not in middle!
				var firstChildBbox = textBlock.property("firstChild").getBoundingClientRect();
				moveup -= 1.5 * firstChildBbox.height;
				moveup /= 2;
			}

		} else {
			// If has only one <tspan> ignore.
			if (textBlock.property("children").length === 1) {
				moveup = 0;
			} else {
				moveup = textBlock.property("offsetHeight");
				// Because x, y is the lower left corner and the first child is not in middle!
				var firstChild = textBlock.property("firstChild");
				moveup -= 1.5 * firstChild.offsetHeight;
				moveup /= 2;
			}
		}

		textBlock.attr("transform", function () {
			return "translate(0," + (-1) * moveup + ")";
		});
	};

	/* Adds a new line of text to the element. */
	textElement.addTextline = function addTextlineFunct(word, additionalClass) {
		if (word === undefined) {
			return;
		}

		textBlock.append("tspan")
			.attr("class", additionalClass)
			.classed("text", true)
			.attr("x", 0)
			.attr("dy",function () {
				var childNum = textBlock.property("children").length;

				if (childNum < 2) {
					return 0;
				} else {
					return SPACE_BETWEEN_SPANS;
				}
			}).text(word.truncate(element.datum().textWidth()));
	};

	/* Adds a new line of text to the element. */
	textElement.addEquivalentSpan = function addEquivalentSpan(word) {
		if (word === undefined) {
			return;
		}

		var _word = "[" + word + "]";

		textBlock.append("tspan")
			.classed("text", true)
			.classed("subtext", true)
			.attr("x", 0)
			.attr("dy",function () {
				var childNum = textBlock.property("children").length;

				if (childNum < 2) {
					return 0;
				} else {
					return SPACE_BETWEEN_SPANS;
				}
			}).text(_word.truncate(element.datum().textWidth()), "subtext");
	};

	/* Adds a new line of text to the element. */
	textElement.addSubTextNode = function addSubTextNode(word, additionalClass) {
		if (word === undefined) {
			return;
		}

		var _word = "(" + word + ")";

		textBlock.append("tspan")
			.attr("class", additionalClass)
			.classed("text", true)
			.classed("subtext", true)
			.attr("x", 0)
			.attr("dy",function () {
				var childNum = textBlock.property("children").length;

				if (childNum < 2) {
					return 0;
				} else {
					return SPACE_BETWEEN_SPANS;
				}
			}).text(_word.truncate(element.datum().textWidth()), "subtext");
	};

	textElement.setTranslation = function (first, second) {
		textBlock.attr("transform", "translate(" + first + ", " + second + ")");
	};

	return textElement;
};
