webvowl.modules.collapsing = function () {
	var collapsing = {},
		enabled = false,
		filteredNodes, filteredProperties;

	collapsing.filter = function (nodes, properties) {
		// Nothing is filtered, we just need to draw everywehere
		filteredNodes = nodes;
		filteredProperties = properties;


		var i, l, node;

		for (i = 0, l = nodes.length; i < l; i++) {
			node = nodes[i];
			if (node instanceof webvowl.nodes.RoundNode) {
				node.collapsible(enabled);
			}
		}
	};

	collapsing.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return collapsing;
	};

	collapsing.reset = function () {
		// todo
	};

	collapsing.filteredNodes = function () {
		return filteredNodes;
	};

	collapsing.filteredProperties = function () {
		return filteredProperties;
	};

	return collapsing;
};
