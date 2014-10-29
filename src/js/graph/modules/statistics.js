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

		var seenProperties = webvowl.util.set(), i, l, property;
		for (i = 0, l = properties.length; i < l; i++) {
			property = properties[i];
			if (!seenProperties.has(property)) {
				edgeCount += 1;
			}

			seenProperties.add(property);
			if (property.inverse()) {
				seenProperties.add(property.inverse());
			}
		}
	}

	function storeClassAndDatatypeCount(classesAndDatatypes) {
		// Each datatype should be counted just a single time
		var datatypeSet = d3.set();

		function isDatatype(node) {
			if (node instanceof webvowl.nodes.rdfsdatatype ||
				node instanceof webvowl.nodes.rdfsliteral) {
				return true;
			}
			return false;
		}

		classesAndDatatypes.forEach(function (node) {
			if (isDatatype(node)) {
				datatypeSet.add(node.label());
			} else if (!(node instanceof webvowl.nodes.SetOperatorNode) && !(node instanceof webvowl.nodes.owlthing)) {
				classCount += 1;
				classCount += countElementArray(node.equivalent());
			}
		});

		datatypeCount = datatypeSet.size();
	}

	function storePropertyCount(properties) {
		for (var i = 0, l = properties.length; i < l; i++) {
			var property = properties[i];

			if (property instanceof webvowl.labels.owlobjectproperty ||
				property instanceof webvowl.labels.owldatatypeproperty) {

				propertyCount += 1;
				propertyCount += countElementArray(property.equivalent());
				propertyCount += countElementArray(property.redundantProperties());
			}
		}
	}

	function countElementArray(properties) {
		if (properties) {
			return properties.length;
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