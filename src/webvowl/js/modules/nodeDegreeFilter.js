var elementTools = require("../util/elementTools")();
var filterTools = require("../util/filterTools")();

module.exports = function (menu) {

	var filter = {},
		nodes,
		properties,
		enabled = true,
		filteredNodes,
		filteredProperties,
		maxDegreeSetter,
		degreeGetter,
		degreeSetter;

	var NODE_COUNT_LIMIT_FOR_AUTO_ENABLING = 50;


	filter.initialize = function (nodes, properties) {
		var maxLinkCount = findMaxLinkCount(nodes);
		if (maxDegreeSetter instanceof Function) {
			maxDegreeSetter(maxLinkCount);
		}

		var defaultDegree = findDefaultDegree(nodes, properties, maxLinkCount);

		if (degreeSetter instanceof Function) {
			degreeSetter(defaultDegree);
			menu.highlightForDegreeSlider(defaultDegree > 0);
		} else {
			console.error("No degree setter function set.");
		}
	};

	function findDefaultDegree(nodes, properties, maxDegree) {
		for (var degree = 0; degree < maxDegree; degree++) {
			var filteredData = filterByNodeDegree(nodes, properties, degree);

			if (filteredData.nodes.length <= NODE_COUNT_LIMIT_FOR_AUTO_ENABLING) {
				return degree;
			}
		}

		return 0;
	}

	/**
	 * If enabled, all nodes are filter by their node degree.
	 * @param untouchedNodes
	 * @param untouchedProperties
	 */
	filter.filter = function (untouchedNodes, untouchedProperties) {
		nodes = untouchedNodes;
		properties = untouchedProperties;

		if (this.enabled()) {
			if (degreeGetter instanceof Function) {
				filterByNodeDegreeAndApply(degreeGetter());
			} else {
				console.error("No degree query function set.");
			}
		}

		filteredNodes = nodes;
		filteredProperties = properties;
	};

	function findMaxLinkCount(nodes) {
		var maxLinkCount = 0;
		for (var i = 0, l = nodes.length; i < l; i++) {
			var linksWithoutDatatypes = filterOutDatatypes(nodes[i].links());

			maxLinkCount = Math.max(maxLinkCount, linksWithoutDatatypes.length);
		}
		return maxLinkCount;
	}

	function filterOutDatatypes(links) {
		return links.filter(function (link) {
			return !elementTools.isDatatypeProperty(link.property());
		});
	}

	function filterByNodeDegreeAndApply(minDegree) {
		var filteredData = filterByNodeDegree(nodes, properties, minDegree);

		nodes = filteredData.nodes;
		properties = filteredData.properties;
	}

	function filterByNodeDegree(nodes, properties, minDegree) {
		return filterTools.filterNodesAndTidy(nodes, properties, hasRequiredDegree(minDegree));
	}

	function hasRequiredDegree(minDegree) {
		return function (node) {
			return filterOutDatatypes(node.links()).length >= minDegree;
		};
	}

	filter.setMaxDegreeSetter = function (_maxDegreeSetter) {
		maxDegreeSetter = _maxDegreeSetter;
	};

	filter.setDegreeGetter = function (_degreeGetter) {
		degreeGetter = _degreeGetter;
	};

	filter.setDegreeSetter = function (_degreeSetter) {
		degreeSetter = _degreeSetter;
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
