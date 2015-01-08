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
			if (!removedNodes.has(property.domain()) && !removedNodes.has(property.range())) {
				cleanedProperties.push(property);
			}
		});

		nodes = cleanedNodes;
		properties = cleanedProperties;
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
