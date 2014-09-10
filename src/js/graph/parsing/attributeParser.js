/**
 * Parses the attributes an element has and sets the corresponding attributes.
 * @returns {Function}
 */
webvowl.parsing.attributeParser = (function () {
	var attributeParser = {};

	/**
	 * Parses and sets the elements attributes.
	 * @param element
	 */
	attributeParser.parse = function (element) {
		if (!(element.attribute() instanceof Array)) {
			return;
		}

		if (element.attribute().contains("deprecated")) {
			element.indication("deprecated")
				.visualAttribute("deprecated");
		} else if (element.attribute().contains("external")) {
			element.indication("external")
				.visualAttribute("external");
		} else if (element.attribute().contains("datatype")) {
			element.visualAttribute("datatype");
		} else if (element.attribute().contains("object")) {
			element.visualAttribute("object");
		} else if (element.attribute().contains("rdf")) {
			element.visualAttribute("rdf");
		}
	};


	return function () {
		// Return a function to keep module interfaces consistent
		return attributeParser;
	};
})();