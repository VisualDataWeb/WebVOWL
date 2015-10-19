/**
 * Parses the attributes an element has and sets the corresponding attributes.
 * @returns {Function}
 */
module.exports = (function () {
	var attributeParser = {},
	// Style
		DEPRECATED = "deprecated",
		EXTERNAL = "external",
		DATATYPE = "datatype",
		OBJECT = "object",
		RDF = "rdf",
		ANONYMOUS = "anonymous",
	// Representations
		FUNCTIONAL = "functional",
		INVERSE_FUNCTIONAL = "inverse functional",
		TRANSITIVE = "transitive",
		SYMMETRIC = "symmetric",
	// Attribute groups
	    VISUAL_ATTRIBUTE_GROUPS = [
		    [DEPRECATED, EXTERNAL, DATATYPE, OBJECT, RDF],
		    [ANONYMOUS]
	    ];

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
		VISUAL_ATTRIBUTE_GROUPS.forEach(function (attributeGroup) {
			setVisualAttributeOfGroup(element, attributeGroup);
		});
	}

	function setVisualAttributeOfGroup(element, group) {
		var i, l, attribute;

		for (i = 0, l = group.length; i < l; i++) {
			attribute = group[i];
			if (element.attributes().indexOf(attribute) >= 0) {
				element.visualAttributes().push(attribute);

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

			if (clazz.attributes().indexOf(indication) >= 0) {
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

			if (property.attributes().indexOf(indication) >= 0) {
				property.indications().push(indication);
			}
		}
	}


	return function () {
		// Return a function to keep module interfaces consistent
		return attributeParser;
	};
})();
