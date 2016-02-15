var OwlThing = require("../elements/nodes/implementations/OwlThing");
var RdfsLiteral = require("../elements/nodes/implementations/RdfsLiteral");
var elementTools = require("../util/elementTools")();

var equivalentPropertyMerger = {};
module.exports = function () {
	return equivalentPropertyMerger;
};

equivalentPropertyMerger.merge = function (properties, nodes, propertyMap, graph) {
	var hiddenNodeIds = d3.set(),
		i, l, j, k,
		PREFIX = "GENERATED-MERGED_RANGE-";

	// clear the original array
	var newNodes = [];

	for (i = 0, l = properties.length; i < l; i++) {
		var property = properties[i],
			equivalents = property.equivalents();

		if (equivalents.length === 0) {
			continue;
		}

		// quickfix, we need to ignore already merged equivalent properties
		if (property.range().indexOf(PREFIX) === 0) {
			continue;
		}

		var mergedRange;
		if (elementTools.isDatatypeProperty(property)) {
			mergedRange = new RdfsLiteral(graph);
		} else {
			mergedRange = new OwlThing(graph);
		}
		mergedRange.id(PREFIX + property.id());
		newNodes.push(mergedRange);

		var hiddenNodeId = property.range();
		property.range(mergedRange.id());

		for (j = 0, k = equivalents.length; j < k; j++) {
			var equivalentId = equivalents[j],
				equivProperty = propertyMap[equivalentId];

			var oldRange = equivProperty.range();
			equivProperty.range(mergedRange.id());
			if (!isDomainOrRangeOfOtherProperty(oldRange, properties)) {
				hiddenNodeIds.add(oldRange);
			}
		}

		// only merge if this property was the only connected one
		if (!isDomainOrRangeOfOtherProperty(hiddenNodeId, properties)) {
			hiddenNodeIds.add(hiddenNodeId);
		}
	}

	for (i = 0, l = nodes.length; i < l; i++) {
		var node = nodes[i];

		if (!hiddenNodeIds.has(node.id())) {
			newNodes.push(node);
		}
	}

	return newNodes;
};

function isDomainOrRangeOfOtherProperty(nodeId, properties) {
	var i, l;

	for (i = 0, l = properties.length; i < l; i++) {
		var property = properties[i];
		if (property.domain() === nodeId || property.range() === nodeId) {
			return true;
		}
	}

	return false;
}
