/**
 * Encapsulates the parsing and preparation logic of the input data.
 * @returns {{}}
 */
webvowl.parser = function () {
	var parser = {},
		nodes,
		properties,
		classMap,
		propertyMap;

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

		baseObjects.forEach(function (element) {
			var matchingAttribute,
				elementType;

			// Look for an attribute with the same id and merge them
			for (var i = 0; i < attributes.length; i++) {
				var attribute = attributes[i];
				if (element.id === attribute.id) {
					matchingAttribute = attribute;
					break;
				}
			}
			addAdditionalAttributes(element, matchingAttribute);

			// Then look for a prototype to add its properties
			elementType = element.type.replace(":", "").toLowerCase();

			if (elementType in prototypes) {
				addAdditionalAttributes(element, prototypes[elementType]);

				var node = new prototypes[elementType]();
				node.attribute(element.attribute)
					.comment(element.comment)
					.complement(element.complement)
					.equivalent(element.equivalent)
					.id(element.id)
					.instances(element.instances)
					.intersection(element.intersection)
					.label(element.label)
					// .type(element.type) Ignore, because we predefined it
					.union(element.union)
					.uri(element.uri);

				combinations.push(node);
			} else {
				console.error("Unknown element type: " + elementType);
			}
		});

		return combinations;
	}

	function combineProperties(baseObjects, attributes, prototypes) {
		var combinations = [];

		baseObjects.forEach(function (element) {
			var matchingAttribute,
				elementType;

			// Look for an attribute with the same id and merge them
			for (var i = 0; i < attributes.length; i++) {
				var attribute = attributes[i];
				if (element.id === attribute.id) {
					matchingAttribute = attribute;
					break;
				}
			}
			addAdditionalAttributes(element, matchingAttribute);

			// Then look for a prototype to add its properties
			elementType = element.type.replace(":", "").toLowerCase();

			if (elementType in prototypes) {
				// Create the matching object and set the properties
				var property = new prototypes[elementType]();
				property.attribute(element.attribute)
					.cardinality(element.cardinality)
					.comment(element.comment)
					.domain(element.domain)
					.equivalent(element.equivalent)
					.id(element.id)
					.inverse(element.inverse)
					.label(element.label)
					.minCardinality(element.minCardinality)
					.maxCardinality(element.maxCardinality)
					.range(element.range)
					.subproperty(element.subproperty)
					// .type(element.type) Ignore, because we predefined it
					.uri(element.uri);
				combinations.push(property);
			} else {
				console.error("Unknown element type: " + elementType);
			}

		});

		return combinations;
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
		rawNodes.forEach(function (node, index) {
			node.visible(true);
			node._eqProcessed = false;
		});

		rawNodes.forEach(function (node) {
			// Merge and connect the equivalent nodes
			processEquivalentIds(node, classMap);

			parseAttributes(node);
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
	 * Connect all properties and also their subproperties.
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
			property._eqProcessed = false; // equivalent
			property._addedToLink = false;
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

			// Reference subproperties
			var subpropertyIds = property.subproperty();
			if (subpropertyIds) {
				for (i = 0, l = subpropertyIds.length; i < l; ++i) {
					var subpropertyId = findId(subpropertyIds[i]);
					var subproperty = propertyMap[subpropertyId];

					if (subproperty) {
						// Replace id with object
						property.subproperty()[i] = subproperty;
					} else {
						console.warn("No subproperty was found for id: " + subpropertyId);
					}
				}
			}
		});

		// Merge equivalent properties and process disjoints.
		rawProperties.forEach(function (property) {
			processEquivalentIds(property, propertyMap);
			processDisjoints(property);

			parseAttributes(property);
		});

		// Add additional information to the links
		rawProperties.forEach(function (property) {
			// Links of merged hidden classes should point to/from the visible equivalent class
			if (!property.domain().visible() && property.domain().equivalentBase()) {
				property.domain(property.domain().equivalentBase());
			}
			if (!property.range().visible() && property.range().equivalentBase()) {
				property.range(property.range().equivalentBase());
			}

			// Hide link if source or target node is hidden
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

	/**
	 * Generates and adds properties for links to set operators.
	 * @param classes unprocessed classes
	 * @param properties unprocessed properties
	 */
	function addSetOperatorProperties(classes, properties) {
		var i, // index
			l; // array length

		function addProperties(domainId, setIds) {
			if (typeof setIds !== "undefined") {
				for (i = 0, l = setIds.length; i < l; ++i) {
					var rangeId = setIds[i],
						property = {};

					property.id = "GENERATED-" + domainId + "-" + rangeId + "-" + i;
					property.type = "setOperatorProperty";
					property.domain = domainId;
					property.range = rangeId;

					properties.push(property);
				}
			}
		}

		classes.forEach(function (clss) {
			addProperties(clss.id(), clss.complement());
			addProperties(clss.id(), clss.intersection());
			addProperties(clss.id(), clss.union());
		});
	}

	/**
	 * Replaces the ids of equivalent nodes/properties with the matching objects, cross references them
	 * and tags them as processed.
	 * @param element a node or a property
	 * @param elementMap a map where nodes/properties can be looked up
	 */
	function processEquivalentIds(element, elementMap) {
		var eqIds = element.equivalent();
		if (!eqIds || element._eqProcessed) {
			element._eqProcessed = true;
			return;
		}

		// Replace ids with the corresponding objects
		for (var i = 0, l = eqIds.length; i < l; ++i) {
			var eqId = findId(eqIds[i]);
			var eqObject = elementMap[eqId];

			if (eqObject) {
				// Cross reference both objects
				eqObject.equivalent(eqObject.equivalent() || []);
				eqObject.equivalent().push(element);
				eqObject.equivalentBase(element);
				eqIds[i] = eqObject;

				// Hide other equivalent nodes
				eqObject.visible(false);
				eqObject._eqProcessed = true;
			} else {
				console.warn("No class/property was found for equivalent id: " + eqId);
			}
		}

		element._eqProcessed = true;
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

	function parseAttributes(element) {
		if (!(element.attribute() instanceof Array)) {
			return;
		}

		if (element.attribute().contains("deprecated")) {
			element.indication("deprecated")
				.visualAttribute("deprecated");
		} else if (element.attribute().contains("external")) {
			element.indication("external")
				.visualAttribute("external");
		} else if (element.attribute().contains("datatype")) {
			element.visualAttribute("datatype");
		} else if (element.attribute().contains("object")) {
			element.visualAttribute("object");
		} else if (element.attribute().contains("rdf")) {
			element.visualAttribute("rdf");
		}
	}


	return parser;
};
