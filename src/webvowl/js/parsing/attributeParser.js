/**
 * Parses the attributes an element has and sets the corresponding attributes.
 * @returns {Function}
 */
module.exports = (function () {
	var attributeParser = {},
	// Style
		ANONYMOUS = "anonymous",
		DATATYPE = "datatype",
		DEPRECATED = "deprecated",
		EXTERNAL = "external",
		OBJECT = "object",
		RDF = "rdf",
	// Representations
		ASYMMETRIC = "asymmetric",
		FUNCTIONAL = "functional",
		INVERSE_FUNCTIONAL = "inverse functional",
		IRREFLEXIVE = "irreflexive",
		KEY = "key",
		REFLEXIVE = "reflexive",
		SYMMETRIC = "symmetric",
		TRANSITIVE = "transitive",
	// Attribute groups
		VISUAL_ATTRIBUTE_GROUPS = [
			[DEPRECATED, DATATYPE, OBJECT, RDF],
			[ANONYMOUS]
		],
		CLASS_INDICATIONS = [DEPRECATED, EXTERNAL],
		PROPERTY_INDICATIONS = [ASYMMETRIC, FUNCTIONAL, INVERSE_FUNCTIONAL, IRREFLEXIVE, KEY, REFLEXIVE, SYMMETRIC,
		                        TRANSITIVE];

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
		var i, l, indication;

		for (i = 0, l = CLASS_INDICATIONS.length; i < l; i++) {
			indication = CLASS_INDICATIONS[i];

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
		var i, l, indication;

		for (i = 0, l = PROPERTY_INDICATIONS.length; i < l; i++) {
			indication = PROPERTY_INDICATIONS[i];

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
