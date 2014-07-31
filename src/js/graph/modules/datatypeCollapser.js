webvowl.modules.datatypeCollapser = function () {

	var collapser = {},
		nodes,
		properties,
		enabled = false,
		filteredNodes,
		filteredProperties;


	/**
	 * If enabled, all datatypes and literals including connected properties are filtered.
	 * @param untouchedNodes
	 * @param untouchedProperties
	 */
	collapser.filter = function (untouchedNodes, untouchedProperties) {
		nodes = untouchedNodes;
		properties = untouchedProperties;

		if (this.enabled()) {
			removeDatatypesAndLiterals();
		}

		filteredNodes = nodes;
		filteredProperties = properties;
	};

	function removeDatatypesAndLiterals() {
		var removedElements = [],
			cleanedNodes = [],
			cleanedProperties = [];

		nodes.forEach(function (node) {
			if (isDatatypeOrLiteral(node)) {
				removedElements.push(node);
			} else {
				cleanedNodes.push(node);
			}
		});

		properties.forEach(function (property) {
			var isDangling = false;
			for (var i = 0, l = removedElements.length; i < l; ++i) {
				var removedElement = removedElements[i];

				if (isDanglingProperty(property, removedElement)) {
					isDangling = true;
					break;
				}
			}

			if (!isDangling) {
				cleanedProperties.push(property);
			}
		});

		nodes = cleanedNodes;
		properties = cleanedProperties;
	}

	function isDatatypeOrLiteral(node) {
		if (node instanceof webvowl.nodes.rdfsdatatype ||
			node instanceof webvowl.nodes.rdfsliteral) {
			return true;
		}
		return false;
	}

	function isDanglingProperty(property, removedElement) {
		if (property.domain() === removedElement ||
			property.range() === removedElement) {
			return true;
		}
		return false;
	}

	collapser.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return collapser;
	};


	// Functions a filter must have
	collapser.filteredNodes = function () {
		return filteredNodes;
	};

	collapser.filteredProperties = function () {
		return filteredProperties;
	};


	return collapser;
};