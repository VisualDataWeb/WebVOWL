webvowl.modules.setOperatorFilter = function () {

	var filter = {},
		nodes,
		properties,
		enabled = false,
		filteredNodes,
		filteredProperties,
		filterTools = webvowl.util.filterTools();


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
		var filteredData = filterTools.filterNodesAndTidy(nodes, properties, isSetOperatorNode);

		nodes = filteredData.nodes;
		properties = filteredData.properties;
	}

	function isSetOperatorNode(node) {
		return node instanceof webvowl.nodes.SetOperatorNode;
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
