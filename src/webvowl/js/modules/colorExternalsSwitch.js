module.exports = function () {

	var DEFAULT_STATE = false;
	var COLOR_RANGE = [d3.rgb("#3366CC"), d3.rgb("#EE2867")]; // taken from Linked Data VOWL

	var filter = {},
		nodes,
		properties,
		enabled = DEFAULT_STATE,
		filteredNodes,
		filteredProperties;


	filter.filter = function (untouchedNodes, untouchedProperties) {
		nodes = untouchedNodes;
		properties = untouchedProperties;

		var externalElements = filterExternalElements(nodes.concat(properties));

		if (enabled) {
			setColorsForExternals(externalElements);
		} else {
			resetBackgroundColors(externalElements);
		}

		filteredNodes = nodes;
		filteredProperties = properties;
	};

	function filterExternalElements(nodes) {
		return nodes.filter(function (node) {
			return node.visualAttributes().indexOf("external") >= 0;
		});
	}

	function setColorsForExternals(elements) {
		var iriMap = mapExternalsToBaseUri(elements);
		var entries = iriMap.entries();

		var colorScale = d3.scale.linear()
			.domain([0, entries.length - 1])
			.range(COLOR_RANGE)
			.interpolate(d3.interpolateHsl);

		for (var i = 0; i < entries.length; i++) {
			var groupedElements = entries[i].value;
			setBackgroundColorForNodes(groupedElements, colorScale(i));
		}
	}

	function mapExternalsToBaseUri(elements) {
		var map = d3.map();

		elements.forEach(function (element) {
			var baseIri = element.baseIri();

			if (!map.has(baseIri)) {
				map.set(baseIri, []);
			}
			map.get(baseIri).push(element);
		});

		return map;
	}

	function setBackgroundColorForNodes(elements, backgroundColor) {
		elements.forEach(function (element) {
			element.backgroundColor(backgroundColor);
		});
	}

	function resetBackgroundColors(elements) {
		elements.forEach(function (element) {
			element.backgroundColor(null);
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
