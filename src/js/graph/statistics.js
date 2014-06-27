'use strict';
var webvowl = webvowl || {};

webvowl.graphStatistics = function () {
	/**
	 * @constructor
	 */
	var statistics = {},
		totalNodes = 0,
		mappedNodes = {},
		totalProperties = 0,
		mappedProperties = {};

	/**
	 * Calculates all possible statistics.
	 * @param nodes
	 * @param properties
	 */
	statistics.calculateStates = function(nodes, properties) {
		totalNodes = nodes.size();
		totalProperties = properties.size();

		nodes.each(function(element){
			if(mappedNodes[element.type]) {
				mappedNodes[element.type]++;
			} else {
				mappedNodes[element.type] = 1;
			}
		});

		properties.each(function(element){
			if(!mappedProperties[element.property.type]){
				mappedProperties[element.property.type] = 0;
			}

			mappedProperties[element.property.type]++;

			if(element.inverse){
				if(!mappedProperties[element.inverse.type]){
					mappedProperties[element.inverse.type] = 0;
				}

				mappedProperties[element.inverse.type]++;
			}
		});
	};

	statistics.logStats = function() {
		console.log("Total Nodes: " + totalNodes);
		console.log("Total Properties: " + totalProperties);
		console.log(mappedNodes);
		console.log(mappedProperties);
	};

	/* Read-only properties */
	statistics.totalNodes = function () {
		return totalNodes;
	};

	statistics.mappedNodes = function () {
		return mappedNodes;
	};

	statistics.totalProperties = function () {
		return totalProperties;
	};

	statistics.mappedProperties = function () {
		return mappedProperties;
	};

	return statistics;
};