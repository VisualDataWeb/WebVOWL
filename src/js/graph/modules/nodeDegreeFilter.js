webvowl.modules.nodeDegreeFilter = function () {

	var filter = {},
		nodes,
		properties,
		enabled = true,
		filteredNodes,
		filteredProperties,
		maxDegreeSetter,
		degreeQueryFunction;


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
		var removedNodes = webvowl.util.set(),
			cleanedNodes = [],
			cleanedProperties = [];

		nodes.forEach(function (node) {
			if (node.links().length < minDegree) {
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
