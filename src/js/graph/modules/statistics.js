webvowl.modules.statistics = function () {

	var statistics = {},
		nodeCount = 0,
		occurencesOfNodeTypes = {},
		propertyCount = 0,
		occurencesOfPropertyTypes = {},
		classCount = 0,
		datatypeCount = 0,
		filteredNodes,
		filteredProperties;


	statistics.filter = function (nodes, properties) {
		storeTotalCounts(nodes, properties);
		storeClassAndDatatypeCount(nodes);

		storeOccurencesOfTypes(nodes, occurencesOfNodeTypes);
		storeOccurencesOfTypes(properties, occurencesOfPropertyTypes);

		filteredNodes = nodes;
		filteredProperties = properties;
	};

	function storeTotalCounts(nodes, properties) {
		nodeCount = nodes.length;
		propertyCount = properties.length;
	}

	function storeClassAndDatatypeCount(nodes) {
		function isDatatype(node) {
			if (node instanceof webvowl.nodes.rdfsdatatype ||
				node instanceof webvowl.nodes.rdfsliteral) {
				return true;
			}
			return false;
		}

		nodes.forEach(function (node) {
			if (isDatatype(node)) {
				datatypeCount += 1;
			} else {
				classCount += 1;
			}
		});
	}

	function storeOccurencesOfTypes(elements, storage) {
		elements.forEach(function (element) {
			var type = element.type(),
				typeCount = storage[type];

			if (typeof typeCount === "undefined") {
				typeCount = 0;
			} else {
				typeCount += 1;
			}
			storage[type] = typeCount;
		});
	}


	statistics.nodeCount = function () {
		return nodeCount;
	};

	statistics.occurencesOfNodeTypes = function () {
		return occurencesOfNodeTypes;
	};

	statistics.propertyCount = function () {
		return propertyCount;
	};

	statistics.occurencesOfPropertyTypes = function () {
		return occurencesOfPropertyTypes;
	};

	statistics.classCount = function () {
		return classCount;
	};

	statistics.datatypeCount = function () {
		return datatypeCount;
	};


	// Functions a filter must have
	statistics.filteredNodes = function () {
		return filteredNodes;
	};

	statistics.filteredProperties = function () {
		return filteredProperties;
	};


	return statistics;
};