webvowl.modules.collapser = function () {

	var collapser = {},
		nodes,
		properties,
		enabled = false,
		filteredNodes,
		filteredProperties;


	/**
	 * If enabled, all datatypes, literals and subclasses inclyare filtered.
	 * @param untouchedNodes
	 * @param untouchedProperties
	 */
	collapser.filter = function (untouchedNodes, untouchedProperties) {
		nodes = untouchedNodes;
		properties = untouchedProperties;

		if (this.enabled()) {
			removeDatatypesAndLiterals();
			hideSubclassesWithoutOwnProperties();
		}

		filteredNodes = nodes;
		filteredProperties = properties;
	};

	function removeDatatypesAndLiterals() {
		var removedElements = [],
			cleanedNodes = [],
			cleanedProperties = [];

		nodes.forEach(function (node) {
			if (isDatatypeOrLiteral(node)) {
				removedElements.push(node);
			} else {
				cleanedNodes.push(node);
			}
		});

		properties.forEach(function (property) {
			var isDangling = false;
			for (var i = 0, l = removedElements.length; i < l; ++i) {
				var removedElement = removedElements[i];

				if (isDanglingProperty(property, removedElement)) {
					isDangling = true;
					break;
				}
			}

			if (!isDangling) {
				cleanedProperties.push(property);
			}
		});

		nodes = cleanedNodes;
		properties = cleanedProperties;
	}

	function isDatatypeOrLiteral(node) {
		if (node instanceof webvowl.nodes.rdfsdatatype ||
			node instanceof webvowl.nodes.rdfsliteral) {
			return true;
		}
		return false;
	}

	function isDanglingProperty(property, removedElement) {
		if (property.domain() === removedElement ||
			property.range() === removedElement) {
			return true;
		}
		return false;
	}

	function hideSubclassesWithoutOwnProperties() {
		var unneededProperties = [],
			unneededClasses = [],
			subclasses = [],
			connectedProperties,
			subclass,
			property,
			i, // index,
			l; // length


		for (i = 0, l = properties.length; i < l; i++) {
			property = properties[i];
			if (property instanceof webvowl.labels.rdfssubclassof) {
				subclasses.push(property.domain());
			}
		}

		for (i = 0, l = subclasses.length; i < l; i++) {
			subclass = subclasses[i];
			connectedProperties = findConnectedProperties(subclass, properties);

			// Only remove the node and its properties, if they're all subclassOf properties
			var canBeRemoved = areOnlySubclassProperties(connectedProperties);

			if (canBeRemoved) {
				unneededProperties = unneededProperties.concat(connectedProperties);
				unneededClasses.push(subclass);
			}
		}

		nodes = removeUnneededElements(nodes, unneededClasses);
		properties = removeUnneededElements(properties, unneededProperties);
	}

	function findConnectedProperties(node, properties) {
		var connectedProperties = [],
			property,
			i,
			l;

		for (i = 0, l = properties.length; i < l; i++) {
			property = properties[i];
			if (property.domain() === node ||
				property.range() === node) {

				connectedProperties.push(property);
			}
		}

		return connectedProperties;
	}

	function areOnlySubclassProperties(connectedProperties) {
		var onlySubclassProperties = true,
			property,
			i,
			l;

		for (i = 0, l = connectedProperties.length; i < l; i++) {
			property = connectedProperties[i];

			if (!(property instanceof webvowl.labels.rdfssubclassof)) {
				onlySubclassProperties = false;
				break;
			}
		}

		return onlySubclassProperties;
	}

	function removeUnneededElements(array, removableElements) {
		var disjoint = [],
			element,
			i,
			l;

		for (i = 0, l = array.length; i < l; i++) {
			element = array[i];
			if (removableElements.indexOf(element) === -1) {
				disjoint.push(element);
			}
		}
		return disjoint;
	}

	collapser.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return collapser;
	};


	// Functions a filter must have
	collapser.filteredNodes = function () {
		return filteredNodes;
	};

	collapser.filteredProperties = function () {
		return filteredProperties;
	};


	return collapser;
};