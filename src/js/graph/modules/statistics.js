webvowl.modules.statistics = function () {

	var statistics = {},
		nodeCount,
		occurencesOfClassAndDatatypeTypes = {},
		edgeCount,
		occurencesOfPropertyTypes = {},
		classCount,
		datatypeCount,
		datatypePropertyCount,
		objectPropertyCount,
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
		datatypePropertyCount = 0;
		objectPropertyCount = 0;
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
		var datatypeSet = d3.set(),
			hasThing = false;

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
			} else if (!(node instanceof webvowl.nodes.SetOperatorNode)) {
				if (node instanceof webvowl.nodes.owlthing) {
					hasThing = true;
				} else {
					classCount += 1;
					classCount += countElementArray(node.equivalents());
				}
			}
		});

		// count things just a single time
		classCount += hasThing ? 1 : 0;

		datatypeCount = datatypeSet.size();
	}

	function storePropertyCount(properties) {
		for (var i = 0, l = properties.length; i < l; i++) {
			var property = properties[i];

			if (property instanceof webvowl.labels.owlobjectproperty) {
				objectPropertyCount += getExtendedPropertyCount(property);
			} else if (property instanceof webvowl.labels.owldatatypeproperty) {
				datatypePropertyCount += getExtendedPropertyCount(property);
			}
		}
		propertyCount = objectPropertyCount + datatypePropertyCount;
	}

	function getExtendedPropertyCount(property) {
		// count the property itself
		var count = 1;

		// and count properties this property represents
		count += countElementArray(property.equivalents());
		count += countElementArray(property.redundantProperties());

		return count;
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

	statistics.datatypePropertyCount = function () {
		return datatypePropertyCount;
	};

	statistics.objectPropertyCount = function () {
		return objectPropertyCount;
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