/**
 * Parses the attributes an element has and sets the corresponding attributes.
 * @returns {Function}
 */
webvowl.parsing.attributeParser = (function () {
	var attributeParser = {},
	// Style
		DEPRECATED = "deprecated",
		EXTERNAL = "external",
		DATATYPE = "datatype",
		OBJECT = "object",
		RDF = "rdf",
	// Representations
		FUNCTIONAL = "functional",
		INVERSE_FUNCTIONAL = "inverse functional",
		TRANSITIVE = "transitive",
		SYMMETRIC = "symmetric";

	/**
	 * Parses and sets the attributes of a class.
	 * @param clazz
	 */
	attributeParser.parseClassAttributes = function (clazz) {
		if (!(clazz.attributes() instanceof Array)) {
			return;
		}

		parseVisualAttributes(clazz);
		parseClassIndications(clazz);
	};

	function parseVisualAttributes(element) {
		var orderedAttributes = [DEPRECATED, EXTERNAL, DATATYPE, OBJECT, RDF],
			i, l, attribute;

		for (i = 0, l = orderedAttributes.length; i < l; i++) {
			attribute = orderedAttributes[i];
			if (element.attributes().contains(attribute)) {
				element.visualAttribute(attribute);

				// Just a single attribute is possible
				break;
			}
		}
	}

	function parseClassIndications(clazz) {
		var indications = [DEPRECATED, EXTERNAL],
			i, l, indication;

		for (i = 0, l = indications.length; i < l; i++) {
			indication = indications[i];

			if (clazz.attributes().contains(indication)) {
				clazz.indications().push(indication);
			}
		}
	}

	/**
	 * Parses and sets the attributes of a property.
	 * @param property
	 */
	attributeParser.parsePropertyAttributes = function (property) {
		if (!(property.attributes() instanceof Array)) {
			return;
		}

		parseVisualAttributes(property);
		parsePropertyIndications(property);
	};

	function parsePropertyIndications(property) {
		var indications = [FUNCTIONAL, INVERSE_FUNCTIONAL, SYMMETRIC, TRANSITIVE],
			i, l, indication;

		for (i = 0, l = indications.length; i < l; i++) {
			indication = indications[i];

			if (property.attributes().contains(indication)) {
				property.indications().push(indication);
			}
		}
	}


	return function () {
		// Return a function to keep module interfaces consistent
		return attributeParser;
	};
})();