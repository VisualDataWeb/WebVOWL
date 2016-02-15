var OwlThing = require("../elements/nodes/implementations/OwlThing");
var RdfsLiteral = require("../elements/nodes/implementations/RdfsLiteral");
var elementTools = require("../util/elementTools")();

var equivalentPropertyMerger = {};
module.exports = function () {
	return equivalentPropertyMerger;
};

var PREFIX = "GENERATED-MERGED_RANGE-";

equivalentPropertyMerger.merge = function (properties, nodes, propertyMap, graph) {
	var hiddenNodeIds = d3.set();
	var mergeNodes = [];

	for (var i = 0; i < properties.length; i++) {
		var property = properties[i],
			equivalents = property.equivalents();

		if (equivalents.length === 0 || isProcessedProperty(property)) {
			continue;
		}

		var mergedRange = createMergeNode(property, graph);
		mergeNodes.push(mergedRange);

		var hiddenNodeId = property.range();
		property.range(mergedRange.id());

		for (var j = 0; j < equivalents.length; j++) {
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

	return filterVisibleNodes(nodes.concat(mergeNodes), hiddenNodeIds);
};

function isProcessedProperty(property) {
	return property.range().indexOf(PREFIX) === 0;
}

function createMergeNode(property, graph) {
	var range;

	if (elementTools.isDatatypeProperty(property)) {
		range = new RdfsLiteral(graph);
	} else {
		range = new OwlThing(graph);
	}
	range.id(PREFIX + property.id());

	return range;
}

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

function filterVisibleNodes(nodes, hiddenNodeIds) {
	var filteredNodes = [];

	nodes.forEach(function (node) {
		if (!hiddenNodeIds.has(node.id())) {
			filteredNodes.push(node);
		}

	});

	return filteredNodes;
}
