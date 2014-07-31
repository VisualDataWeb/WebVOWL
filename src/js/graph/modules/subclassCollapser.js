webvowl.modules.subclassCollapser = function () {

	var collapser = {},
		nodes,
		properties,
		enabled = false,
		filteredNodes,
		filteredProperties;


	/**
	 * If enabled subclasses that have only subclass properties are filtered.
	 * @param untouchedNodes
	 * @param untouchedProperties
	 */
	collapser.filter = function (untouchedNodes, untouchedProperties) {
		nodes = untouchedNodes;
		properties = untouchedProperties;

		if (this.enabled()) {
			hideSubclassesWithoutOwnProperties();
		}

		filteredNodes = nodes;
		filteredProperties = properties;
	};

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