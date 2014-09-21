webvowl.modules.statistics = function () {

	var statistics = {},
		nodeCount,
		occurencesOfClassAndDatatypeTypes = {},
		edgeCount,
		occurencesOfPropertyTypes = {},
		classCount,
		datatypeCount,
		propertyCount,
		filteredNodes,
		filteredProperties;


	statistics.filter = function (classesAndDatatypes, properties) {
		resetStoredData();

		storeTotalCounts(classesAndDatatypes, properties);
		storeClassAndDatatypeCount(classesAndDatatypes);
		storePropertyCount(properties);

		storeOccurencesOfTypes(classesAndDatatypes, occurencesOfClassAndDatatypeTypes);
		storeOccurencesOfTypes(properties, occurencesOfPropertyTypes);

		filteredNodes = classesAndDatatypes;
		filteredProperties = properties;
	};

	function resetStoredData() {
		nodeCount = 0;
		edgeCount = 0;
		classCount = 0;
		datatypeCount = 0;
		propertyCount = 0;
	}

	function storeTotalCounts(classesAndDatatypes, properties) {
		nodeCount = classesAndDatatypes.length;
		edgeCount = properties.length;
	}

	function storeClassAndDatatypeCount(classesAndDatatypes) {
		function isDatatype(node) {
			if (node instanceof webvowl.nodes.rdfsdatatype ||
				node instanceof webvowl.nodes.rdfsliteral) {
				return true;
			}
			return false;
		}

		classesAndDatatypes.forEach(function (node) {
			if (isDatatype(node)) {
				datatypeCount += 1;
			} else if (!(node instanceof webvowl.nodes.SetOperatorNode)) {
				classCount += 1;
				classCount += countEquivalentElements(node.equivalent());
			}
		});
	}

	function storePropertyCount(properties) {
		properties.forEach(function (property) {
			propertyCount += 1;
			propertyCount += countEquivalentElements(property.equivalent());
		});
	}

	function countEquivalentElements(equivalents) {
		if (equivalents) {
			return equivalents.length;
		}
		return 0;
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

	statistics.occurencesOfClassAndDatatypeTypes = function () {
		return occurencesOfClassAndDatatypeTypes;
	};

	statistics.edgeCount = function () {
		return edgeCount;
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

	statistics.propertyCount = function () {
		return propertyCount;
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