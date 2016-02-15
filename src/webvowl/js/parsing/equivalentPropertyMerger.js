var OwlThing = require("../elements/nodes/implementations/OwlThing");
var RdfsLiteral = require("../elements/nodes/implementations/RdfsLiteral");
var elementTools = require("../util/elementTools")();

var equivalentPropertyMerger = {};
module.exports = function () {
	return equivalentPropertyMerger;
};

var PREFIX = "GENERATED-MERGED_RANGE-";


equivalentPropertyMerger.merge = function (properties, nodes, propertyMap, graph) {
	var totalNodeIdsToHide = d3.set();
	var mergeNodes = [];

	for (var i = 0; i < properties.length; i++) {
		var property = properties[i];
		var equivalents = property.equivalents().map(createIdToPropertyMapper(propertyMap));

		if (equivalents.length === 0 || isPropertyProcessed(property)) {
			continue;
		}

		var mergeRange = createMergeNode(property, equivalents, graph);
		mergeNodes.push(mergeRange);

		var propertyWithEquivalents = equivalents.concat(property);
		var nodeIdsToHide = replaceRangesAndCollectNodesToHide(propertyWithEquivalents, mergeRange, properties);

		for (var j = 0; j < nodeIdsToHide; j++) {
			totalNodeIdsToHide.add(nodeIdsToHide[j]);
		}
	}

	return filterVisibleNodes(nodes.concat(mergeNodes), totalNodeIdsToHide);
};


function createIdToPropertyMapper(propertyMap) {
	return function (id) {
		return propertyMap[id];
	};
}

function isPropertyProcessed(property) {
	return property.range().indexOf(PREFIX) === 0;
}

function createMergeNode(property, graph, equivalents) {
	var range;

	if (elementTools.isDatatypeProperty(property)) {
		range = new RdfsLiteral(graph);
	} else {
		range = findObjectPropertyMergeRange(property, equivalents, new OwlThing(graph));
	}
	range.id(PREFIX + property.id());

	return range;
}

function findObjectPropertyMergeRange(property, equivalents, defaultRange) {
	return defaultRange;
}

function replaceRangesAndCollectNodesToHide(propertyWithEquivalents, mergedRange, properties) {
	var nodesToHide = [];

	propertyWithEquivalents.forEach(function (property) {
		var oldRangeId = property.range();
		property.range(mergedRange.id());
		if (!isDomainOrRangeOfOtherProperty(oldRangeId, properties)) {
			nodesToHide.push(oldRangeId);
		}
	});

	return nodesToHide;
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

function filterVisibleNodes(nodes, nodeIdsToHide) {
	var filteredNodes = [];

	nodes.forEach(function (node) {
		if (!nodeIdsToHide.has(node.id())) {
			filteredNodes.push(node);
		}

	});

	return filteredNodes;
}
