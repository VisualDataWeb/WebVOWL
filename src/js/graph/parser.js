/**
 * Encapsulates the parsing and preparation logic of the input data.
 * @param graph the graph object that will be passed to the elements
 * @returns {{}}
 */
webvowl.parser = function (graph) {
	var parser = {},
		nodes,
		properties,
		classMap,
		propertyMap,
	// Modules
		attributeParser = webvowl.parsing.attributeParser();

	/**
	 * Parses the ontology data and preprocesses it (e.g. connecting inverse properties and so on).
	 * @param ontologyData the loaded ontology json file
	 */
	parser.parse = function (ontologyData) {
		var classes = combineClasses(ontologyData.class, ontologyData.classAttribute, webvowl.nodes),
			datatypes = combineClasses(ontologyData.datatype, ontologyData.datatypeAttribute, webvowl.nodes),
			combinedClassesAndDatatypes = classes.concat(datatypes),
			combinedProperties;

		// Inject properties for unions, intersections, ...
		addSetOperatorProperties(combinedClassesAndDatatypes, ontologyData.property);

		combinedProperties = combineProperties(ontologyData.property, ontologyData.propertyAttribute, webvowl.labels);

		classMap = mapElements(combinedClassesAndDatatypes);
		propertyMap = mapElements(combinedProperties);

		mergeRangesOfEquivalentProperties(combinedProperties, combinedClassesAndDatatypes);

		// Process the graph data
		convertTypesToUris(combinedClassesAndDatatypes, ontologyData.namespace);
		convertTypesToUris(combinedProperties, ontologyData.namespace);

		nodes = createNodeStructure(combinedClassesAndDatatypes, classMap);
		properties = createPropertyStructure(combinedProperties, classMap, propertyMap);
	};

	/**
	 * @return {Array} the preprocessed nodes
	 */
	parser.nodes = function () {
		return nodes;
	};

	/**
	 * @returns {Array} the preprocessed properties
	 */
	parser.properties = function () {
		return properties;
	};

	/**
	 * Combines the passed objects with its attributes and prototypes. This also applies
	 * attributes defined in the base of the prototype.
	 */
	function combineClasses(baseObjects, attributes, prototypes) {
		var combinations = [];

		if (baseObjects) {
			baseObjects.forEach(function (element) {
				var matchingAttribute,
					elementType;

				if (attributes) {
					// Look for an attribute with the same id and merge them
					for (var i = 0; i < attributes.length; i++) {
						var attribute = attributes[i];
						if (element.id === attribute.id) {
							matchingAttribute = attribute;
							break;
						}
					}
					addAdditionalAttributes(element, matchingAttribute);
				}

				// Then look for a prototype to add its properties
				elementType = element.type.replace(":", "").toLowerCase();

				if (elementType in prototypes) {
					addAdditionalAttributes(element, prototypes[elementType]);

					var node = new prototypes[elementType](graph);
					node.comment(element.comment)
						.complement(element.complement)
						.equivalents(element.equivalent)
						.id(element.id)
						.instances(element.instances)
						.intersection(element.intersection)
						.label(element.label)
						// .type(element.type) Ignore, because we predefined it
						.union(element.union)
						.uri(element.uri);

					if (element.attributes) {
						var deduplicatedAttributes = d3.set(element.attributes.concat(node.attributes()));
						node.attributes(deduplicatedAttributes.values());
					}

					combinations.push(node);
				} else {
					console.error("Unknown element type: " + elementType);
				}
			});
		}

		return combinations;
	}

	function combineProperties(baseObjects, attributes, prototypes) {
		var combinations = [];

		if (baseObjects) {
			baseObjects.forEach(function (element) {
				var matchingAttribute,
					elementType;

				if (attributes) {
					// Look for an attribute with the same id and merge them
					for (var i = 0; i < attributes.length; i++) {
						var attribute = attributes[i];
						if (element.id === attribute.id) {
							matchingAttribute = attribute;
							break;
						}
					}
					addAdditionalAttributes(element, matchingAttribute);
				}

				// Then look for a prototype to add its properties
				elementType = element.type.replace(":", "").toLowerCase();

				if (elementType in prototypes) {
					// Create the matching object and set the properties
					var property = new prototypes[elementType](graph);
					property.cardinality(element.cardinality)
						.comment(element.comment)
						.domain(element.domain)
						.equivalents(element.equivalent)
						.id(element.id)
						.inverse(element.inverse)
						.label(element.label)
						.minCardinality(element.minCardinality)
						.maxCardinality(element.maxCardinality)
						.range(element.range)
						.subproperties(element.subproperty)
						.superproperties(element.superproperty)
						// .type(element.type) Ignore, because we predefined it
						.uri(element.uri);

					if (element.attributes) {
						var deduplicatedAttributes = d3.set(element.attributes.concat(property.attributes()));
						property.attributes(deduplicatedAttributes.values());
					}

					combinations.push(property);
				} else {
					console.error("Unknown element type: " + elementType);
				}

			});
		}

		return combinations;
	}

	/**
	 * Really dirty implementation of the range merging of equivalent Ids,
	 * but this will be moved to the converter.
	 * @param properties
	 * @param nodes
	 */
	function mergeRangesOfEquivalentProperties(properties, nodes) {
		var backedUpNodes = nodes.slice(),
			hiddenNodeIds = d3.set(),
			i, l, j, k,
			prefix = "GENERATED-MERGED_RANGE-";

		// clear the original array
		nodes.length = 0;

		for (i = 0, l = properties.length; i < l; i++) {
			var property = properties[i],
				equivalents = property.equivalents();

			if (equivalents.length === 0) {
				continue;
			}

			// quickfix, because all equivalent properties have the equivalent attribute
			if (property.range().indexOf(prefix) === 0) {
				continue;
			}

			var mergedRange;
			if (property instanceof webvowl.labels.owldatatypeproperty) {
				mergedRange = new webvowl.nodes.rdfsliteral();
			} else {
				mergedRange = new webvowl.nodes.owlthing();
			}
			mergedRange.id(prefix + property.id());
			nodes.push(mergedRange);

			var hiddenNodeId = property.range();
			property.range(mergedRange.id());

			for (j = 0, k = equivalents.length; j < k; j++) {
				var equivalentId = equivalents[j],
					equivProperty = propertyMap[equivalentId];

				var oldRange = equivProperty.range();
				equivProperty.range(mergedRange.id());
				if (!isDomainOrRangeOfOtherProperty(oldRange, properties)) {
					hiddenNodeIds.add(oldRange);
				}
			}

			// only merge if this property was the only connected one
			if (!isDomainOrRangeOfOtherProperty(hiddenNodeId, properties)) {
				hiddenNodeIds.add(hiddenNodeId);
			}
		}

		for (i = 0, l = backedUpNodes.length; i < l; i++) {
			var node = backedUpNodes[i];

			if (!hiddenNodeIds.has(node.id())) {
				nodes.push(node);
			}
		}

		// Create a map again
		classMap = mapElements(nodes);
	}

	function isDomainOrRangeOfOtherProperty(nodeId, properties) {
		var i, l;

		for (i = 0, l = properties.length; i < l; i++) {
	        var property = properties[i];
			if (property.domain() === nodeId || property.range() === nodeId) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Checks all attributes which have to be rewritten.
	 * For example:
	 * <b>equivalent</b> is filled with only ID's of the corresponding nodes. It would be better to used the
	 * object instead of the ID so we swap the ID's with the correct object reference and can delete it from drawing
	 * because it is not necessary.
	 */
	function createNodeStructure(rawNodes, classMap) {
		var nodes = [];

		// Set the default values
		var totalInstanceCount = 0;
		rawNodes.forEach(function (node) {
		totalInstanceCount += node.instances() || 0;
			node.visible(true);
		});

		rawNodes.forEach(function (node) {
			// Merge and connect the equivalent nodes
			processEquivalentIds(node, classMap);

			attributeParser.parseClassAttributes(node);

			node.totalInstanceCount(totalInstanceCount);
		});

		// Collect all nodes that should be displayed
		rawNodes.forEach(function (node) {
			if (node.visible()) {
				nodes.push(node);
			}
		});

		return nodes;
	}

	/**
	 * Sets the disjoint attribute of the nodes if a disjoint label is found.
	 * @param property
	 */
	function processDisjoints(property) {
		if (property instanceof webvowl.labels.owldisjointwith === false) {
			return;
		}

		var domain = property.domain(),
			range = property.range();

		// Check the domain.
		if (!domain.disjointWith()) {
			domain.disjointWith([]);
		}

		// Check the range.
		if (!range.disjointWith()) {
			range.disjointWith([]);
		}

		domain.disjointWith().push(property.range());
		range.disjointWith().push(property.domain());
	}

	/**
	 * Connect all properties and also their sub- and superproperties.
	 * We iterate over the rawProperties array because it is way faster than iterating
	 * over an object and its attributes.
	 *
	 * @param rawProperties the properties
	 * @param classMap a map of all classes
	 * @param propertyMap the properties in a map
	 */
	function createPropertyStructure(rawProperties, classMap, propertyMap) {
		var properties = [],
			i, // loop index
			l; // array length

		// Set default values
		rawProperties.forEach(function (property) {
			property.visible(true);
		});

		// Connect properties
		rawProperties.forEach(function (property) {
			var domain,
				range,
				domainObject,
				rangeObject,
				inverse;

			/* Skip properties that have no information about their domain and range, like
			 inverse properties with optional inverse and optional domain and range attributes */
			if ((property.domain() && property.range()) || property.inverse()) {

				var inversePropertyId = findId(property.inverse());
				// Look if an inverse property exists
				if (typeof  inversePropertyId !== "undefined") {
					inverse = propertyMap[inversePropertyId];
					if (typeof inverse === "undefined") {
						console.warn("No inverse property was found for id: " + inversePropertyId);
					}
				}

				// Either domain and range are set on this property or at the inverse
				if (typeof property.domain() !== "undefined" && typeof property.range() !== "undefined") {
					domain = findId(property.domain());
					range = findId(property.range());

					domainObject = classMap[domain];
					rangeObject = classMap[range];
				} else if (inverse) {
					// Domain and range need to be switched
					domain = findId(inverse.range());
					range = findId(inverse.domain());

					domainObject = classMap[domain];
					rangeObject = classMap[range];
				} else {
					console.warn("Domain and range not found for property: " + property.id());
				}

				// Set the references on this property
				property.domain(domainObject);
				property.range(rangeObject);

				// Also set the attributes of the inverse property
				if (inverse) {
					property.inverse(inverse);
					inverse.inverse(property);

					// Switch domain and range
					inverse.domain(rangeObject);
					inverse.range(domainObject);
				}
			}

			// Reference sub- and superproperties
			referenceSubOrSuperProperties(property.subproperties());
			referenceSubOrSuperProperties(property.superproperties());
		});

		// Merge equivalent properties and process disjoints.
		rawProperties.forEach(function (property) {
			processEquivalentIds(property, propertyMap);
			processDisjoints(property);

			attributeParser.parsePropertyAttributes(property);
		});

		// Add additional information to the properties
		rawProperties.forEach(function (property) {

			// Properties of merged classes should point to/from the visible equivalent class
			var propertyWasRerouted = false;
			if (wasNodeMerged(property.domain())) {
				property.domain(property.domain().equivalentBase());
				propertyWasRerouted = true;
			}
			if (wasNodeMerged(property.range())) {
				property.range(property.range().equivalentBase());
				propertyWasRerouted = true;
			}

			// But there should not be two equal properties between the same domain and range
			var equalProperty = getOtherEqualProperty(rawProperties, property);
			if (propertyWasRerouted && equalProperty) {
				property.visible(false);

				equalProperty.redundantProperties().push(property);
			}

			// Hide property if source or target node is hidden
			if (!property.domain().visible() || !property.range().visible()) {
				property.visible(false);
			}

			// Collect all properties that should be displayed
			if (property.visible()) {
				properties.push(property);
			}
		});

		return properties;
	}

	function referenceSubOrSuperProperties(subOrSuperPropertiesArray) {
		var i, l;

		if (!subOrSuperPropertiesArray) {
			return;
		}

		for (i = 0, l = subOrSuperPropertiesArray.length; i < l; ++i) {
			var subOrSuperPropertyId = findId(subOrSuperPropertiesArray[i]);
			var subOrSuperProperty = propertyMap[subOrSuperPropertyId];

			if (subOrSuperProperty) {
				// Replace id with object
				subOrSuperPropertiesArray[i] = subOrSuperProperty;
			} else {
				console.warn("No sub-/superproperty was found for id: " + subOrSuperPropertyId);
			}
		}
	}

	function wasNodeMerged(node) {
		return !node.visible() && node.equivalentBase();
	}

	function getOtherEqualProperty(properties, referenceProperty) {
		var i, l, property;

		for (i = 0, l = properties.length; i < l; i++) {
			property = properties[i];

			if (referenceProperty === property) {
				continue;
			}
			if (referenceProperty.domain() !== property.domain() ||
				referenceProperty.range() !== property.range()) {
				continue;
			}

			// Check for an equal URI, if non existent compare label and type
			if (referenceProperty.uri() && property.uri()) {
				if (referenceProperty.uri() === property.uri()) {
					return property;
				}
			} else if (referenceProperty.type() === property.type() &&
				referenceProperty.label() === property.label()) {
				return property;
			}
		}

		return undefined;
	}

	/**
	 * Generates and adds properties for links to set operators.
	 * @param classes unprocessed classes
	 * @param properties unprocessed properties
	 */
	function addSetOperatorProperties(classes, properties) {
		var i, // index
			l; // array length

		function addProperties(domainId, setIds, operatorType) {
			if (typeof setIds !== "undefined") {
				for (i = 0, l = setIds.length; i < l; ++i) {
					var rangeId = setIds[i],
						property = {};

					property.id = "GENERATED-"+ operatorType +"-" + domainId + "-" + rangeId + "-" + i;
					property.type = "setOperatorProperty";
					property.domain = domainId;
					property.range = rangeId;

					properties.push(property);
				}
			}
		}

		classes.forEach(function (clss) {
			addProperties(clss.id(), clss.complement(), "COMPLEMENT");
			addProperties(clss.id(), clss.intersection(), "INTERSECTION");
			addProperties(clss.id(), clss.union(), "UNION");
		});
	}

	/**
	 * Replaces the ids of equivalent nodes/properties with the matching objects, cross references them
	 * and tags them as processed.
	 * @param element a node or a property
	 * @param elementMap a map where nodes/properties can be looked up
	 */
	function processEquivalentIds(element, elementMap) {
		var eqIds = element.equivalents();

		if (!eqIds || element.equivalentBase()) {
			return;
		}

		// Replace ids with the corresponding objects
		for (var i = 0, l = eqIds.length; i < l; ++i) {
			var eqId = findId(eqIds[i]);
			var eqObject = elementMap[eqId];

			if (eqObject) {
				// Cross reference both objects
				eqObject.equivalents(eqObject.equivalents());
				eqObject.equivalents().push(element);
				eqObject.equivalentBase(element);
				eqIds[i] = eqObject;

				// Hide other equivalent nodes
				eqObject.visible(false);
			} else {
				console.warn("No class/property was found for equivalent id: " + eqId);
			}
		}
	}

	/**
	 * Tries to convert the type to an uri and sets it.
	 * @param elements classes or properties
	 * @param namespaces an array of namespaces
	 */
	function convertTypesToUris(elements, namespaces) {
		elements.forEach(function (element) {
			if (typeof element.uri() === "string") {
				element.uri(replaceNamespace(element.uri(), namespaces));
			}
		});
	}

	/**
	 * Creates a map by mapping the array with the passed function.
	 * @param array the array
	 * @returns {{}}
	 */
	function mapElements(array) {
		var map = {};
		for (var i = 0, length = array.length; i < length; i++) {
			var element = array[i];
			map[element.id()] = element;
		}
		return map;
	}

	/**
	 * Adds the attributes of the additional object to the base object, but doesn't
	 * overwrite existing ones.
	 *
	 * @param base the base object
	 * @param addition the object with additional data
	 * @returns the combination is also returned
	 */
	function addAdditionalAttributes(base, addition) {
		// Check for an undefined value
		addition = addition || {};

		for (var addAttribute in addition) {
			// Add the attribute if it doesn't exist
			if (!(addAttribute in base) && addition.hasOwnProperty(addAttribute)) {
				base[addAttribute] = addition[addAttribute];
			}
		}
		return base;
	}

	/**
	 * Replaces the namespace (and the separator) if one exists and returns the new value.
	 * @param address the address with a namespace in it
	 * @param namespaces an array of namespaces
	 * @returns {string} the processed address with the (possibly) replaced namespace
	 */
	function replaceNamespace(address, namespaces) {
		var separatorIndex = address.indexOf(":");
		if (separatorIndex === -1) {
			return address;
		}

		var namespaceName = address.substring(0, separatorIndex);

		for (var i = 0, length = namespaces.length; i < length; ++i) {
			var namespace = namespaces[i];
			if (namespaceName === namespace.name) {
				return namespace.iri + address.substring(separatorIndex + 1);
			}
		}

		return address;
	}

	/**
	 * Looks whether the passed object is already the id or if it was replaced
	 * with the object that belongs to the id.
	 * @param object an id, a class or a property
	 * @returns {string} the id of the passed object or undefined
	 */
	function findId(object) {
		if (typeof object === "undefined") {
			return undefined;
		} else if (typeof object === "string") {
			return object;
		} else if ("id" in object) {
			return object.id();
		} else {
			console.warn("No Id was found for this object: " + object);
			return undefined;
		}
	}

	return parser;
};
