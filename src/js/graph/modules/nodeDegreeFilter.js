webvowl.modules.nodeDegreeFilter = function () {

	var filter = {},
		nodes,
		properties,
		enabled = true,
		filteredNodes,
		filteredProperties,
		maxDegreeSetter,
		degreeQueryFunction,
		filterTools = webvowl.util.filterTools();


	/**
	 * If enabled, all nodes are filter by their node degree.
	 * @param untouchedNodes
	 * @param untouchedProperties
	 */
	filter.filter = function (untouchedNodes, untouchedProperties) {
		nodes = untouchedNodes;
		properties = untouchedProperties;

		setMaxLinkCount();

		if (this.enabled()) {
			filterByNodeDegree(degreeQueryFunction());
		}

		filteredNodes = nodes;
		filteredProperties = properties;
	};

	function setMaxLinkCount() {
		var maxLinkCount = 0;
		for (var i = 0, l = nodes.length; i < l; i++) {
			maxLinkCount = Math.max(maxLinkCount, nodes[i].links().length);
		}

		if (maxDegreeSetter instanceof Function) {
			maxDegreeSetter(maxLinkCount);
		}
	}

	function filterByNodeDegree(minDegree) {
		var filteredData = filterTools.filterNodesAndTidy(nodes, properties, isDegreeTooLess(minDegree));

		nodes = filteredData.nodes;
		properties = filteredData.properties;
	}

	function isDegreeTooLess(minDegree) {
		return function (node) {
			return node.links().length < minDegree;
		};
	}

	filter.setMaxDegreeSetter = function(maxNodeDegreeSetter) {
		maxDegreeSetter = maxNodeDegreeSetter;
	};

	filter.setDegreeQueryFunction = function(nodeDegreeQueryFunction) {
		degreeQueryFunction = nodeDegreeQueryFunction;
	};

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
