var colorbrewer = require("colorbrewer");

module.exports = function () {

	var DEFAULT_STATE = false;

	var filter = {},
		nodes,
		properties,
		enabled = DEFAULT_STATE,
		filteredNodes,
		filteredProperties;

	var MINIMAL_AVAILABLE_COLOR_COUNT = 3;


	filter.filter = function (untouchedNodes, untouchedProperties) {
		nodes = untouchedNodes;
		properties = untouchedProperties;

		if (enabled) {
			setColorsForExternals(nodes);
		} else {
			nodes.forEach(function (node) {
				node.backgroundColor(null);
			});
		}

		filteredNodes = nodes;
		filteredProperties = properties;
	};

	function setColorsForExternals(nodes) {
		var iriMap = mapExternalsToBaseUri(nodes);
		var entries = iriMap.entries();

		// TODO handle domain count above the provided values of colorbrewer
		var requiredColorCount = Math.max(entries.length, MINIMAL_AVAILABLE_COLOR_COUNT);
		var colorScale = d3.scale.ordinal()
			.domain(iriMap.keys())
			.range(colorbrewer.RdBu[requiredColorCount]);

		for (var i = 0; i < entries.length; i++) {
			var baseIri = entries[i].key;
			var groupedNodes = entries[i].value;

			setBackgroundColorForNodes(groupedNodes, colorScale(baseIri));
		}
	}

	function mapExternalsToBaseUri(nodes) {
		var map = d3.map();

		nodes.forEach(function (node) {
			var baseIri = "" + Math.floor(10 * Math.random()); //TODO extract baseIri with OWL2VOWL

			if (!map.has(baseIri)) {
				map.set(baseIri, []);
			}
			map.get(baseIri).push(node);
		});

		return map;
	}

	function setBackgroundColorForNodes(nodes, backgroundColor) {
		nodes.forEach(function(node) {
			node.backgroundColor(backgroundColor);
		});
	}


	filter.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return filter;
	};

	filter.reset = function () {
		enabled = DEFAULT_STATE;
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
