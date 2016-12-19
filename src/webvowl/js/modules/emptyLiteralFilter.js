module.exports = function () {

	var filter = {},
		filteredNodes,
		filteredProperties;


	filter.filter = function (nodes, properties) {
		var literalUsageMap = [];
		for (var i = 0; i < properties.length; i++) {
			// get property range;
			var prop = properties[i];
			if (prop.range()) {
				var node = prop.range();
				if (node.type() === "rdfs:Literal") {
					literalUsageMap[node.id()] = 1;
				}
			}
		}
		var nodesToRemove = [];
		var newNodes=[];
		// todo: test and make it faster
		for (i = 0; i < nodes.length; i++) {
			var nodeId = nodes[i].id();
			if (nodes[i].type() === "rdfs:Literal") {
				if (literalUsageMap[nodeId]===undefined) {
					nodesToRemove.push(nodeId);
				}
				else{
					newNodes.push(nodes[i]);
				}
			}
			else{
				newNodes.push(nodes[i]);
			}
		}

		filteredNodes = newNodes;
		filteredProperties = properties;
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
