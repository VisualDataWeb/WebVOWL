webvowl.modules.setOperatorFilter = function () {

	var filter = {},
		nodes,
		properties,
		enabled = false,
		filteredNodes,
		filteredProperties;


	/**
	 * If enabled, all set operators including connected properties are filtered.
	 * @param untouchedNodes
	 * @param untouchedProperties
	 */
	filter.filter = function (untouchedNodes, untouchedProperties) {
		nodes = untouchedNodes;
		properties = untouchedProperties;

		if (this.enabled()) {
			removeSetOperators();
		}

		filteredNodes = nodes;
		filteredProperties = properties;
	};

	function removeSetOperators() {
		var removedNodes = webvowl.util.set(),
			cleanedNodes = [],
			cleanedProperties = [];

		nodes.forEach(function (node) {
			if (node instanceof webvowl.nodes.SetOperatorNode) {
				removedNodes.add(node);
			} else {
				cleanedNodes.push(node);
			}
		});

		properties.forEach(function (property) {
			if (propertyHasVisibleNodes(removedNodes, property)) {
				cleanedProperties.push(property);
			} else if (property instanceof webvowl.labels.owldatatypeproperty) {
				// Remove floating datatypes/literals, because they belong to their datatype property
				var index = cleanedNodes.indexOf(property.range());
				if (index >= 0) {
					cleanedNodes.splice(index, 1);
				}
			}
		});

		nodes = cleanedNodes;
		properties = cleanedProperties;
	}

	/**
	 * Returns true, if the domain and the range of this property have not been removed.
	 * @param removedNodes
	 * @param property
	 * @returns {boolean} true if property isn't dangling
	 */
	function propertyHasVisibleNodes(removedNodes, property) {
		return !removedNodes.has(property.domain()) && !removedNodes.has(property.range());
	}

	filter.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return filter;
	};


	// Functions a filter must have
	filter.filteredNodes = function () {
		return filteredNodes;
	};

	filter.filteredProperties = function () {
		return filteredProperties;
	};


	return filter;
};
