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
			connectedProperties = findRelevantConnectedProperties(subclass, properties);

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

	/**
	 * Looks recursively for connected properties. Because just subclasses are relevant,
	 * we just look recursively for their properties.
	 *
	 * @param node
	 * @param allProperties
	 * @returns {Array}
	 */
	function findRelevantConnectedProperties(node, allProperties) {
		var connectedProperties = [],
			property,
			i,
			l;

		for (i = 0, l = allProperties.length; i < l; i++) {
			property = allProperties[i];
			if (property.domain() === node ||
				property.range() === node) {

				connectedProperties.push(property);


				/* Special case: SuperClass <-(1) Subclass <-(2) Subclass ->(3) e.g. Datatype
				 * We need to find the last property recursivly. Otherwise, we would remove the subClassOf
				 * property (1) because we didn't see the datatype property (3).
				 */

				/* Look only subclass properties, because these can't create a loop and
				 * these are the relevant properties */
				if (property instanceof webvowl.labels.rdfssubclassof) {
					// If we have the range, there might be a nested property on the domain
					if (node === property.range()) {
						var nestedConnectedProperties = findRelevantConnectedProperties(property.domain(), allProperties);
						connectedProperties = connectedProperties.concat(nestedConnectedProperties);
					}
				}
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