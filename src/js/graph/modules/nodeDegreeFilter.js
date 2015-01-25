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
			var linksWithoutDatatypes = filterOutDatatypes(nodes[i].links());

			maxLinkCount = Math.max(maxLinkCount, linksWithoutDatatypes.length);
		}

		if (maxDegreeSetter instanceof Function) {
			maxDegreeSetter(maxLinkCount);
		}
	}

	function filterOutDatatypes(links) {
		return links.filter(function(link) {
			return !(link.property() instanceof webvowl.labels.owldatatypeproperty);
		});
	}

	function filterByNodeDegree(minDegree) {
		var filteredData = filterTools.filterNodesAndTidy(nodes, properties, hasRequiredDegree(minDegree));

		nodes = filteredData.nodes;
		properties = filteredData.properties;
	}

	function hasRequiredDegree(minDegree) {
		return function (node) {
			return filterOutDatatypes(node.links()).length >= minDegree;
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
