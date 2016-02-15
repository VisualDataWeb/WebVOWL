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
		var property = properties[i];
		var equivalents = property.equivalents().map(createIdToPropertyMapper(propertyMap));
		var allEquivalents = equivalents.concat(property);

		if (equivalents.length === 0 || isProcessedProperty(property)) {
			continue;
		}

		var mergedRange = createMergeNode(property, graph);
		mergeNodes.push(mergedRange);

		for (var equivIndex = 0; equivIndex < allEquivalents.length; equivIndex++) {
			var equivalentProperty = allEquivalents[equivIndex];

			var oldRangeId = equivalentProperty.range();
			equivalentProperty.range(mergedRange.id());
			if (!isDomainOrRangeOfOtherProperty(oldRangeId, properties)) {
				hiddenNodeIds.add(oldRangeId);
			}
		}
	}

	return filterVisibleNodes(nodes.concat(mergeNodes), hiddenNodeIds);
};


function createIdToPropertyMapper(propertyMap) {
	return function (id) {
		return propertyMap[id];
	};
}

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
	for (var i = 0; i < properties.length; i++) {
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
