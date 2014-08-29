"use strict";

webvowl.Graph = (function () {
	var CARDINALITY_HDISTANCE = 20,
		CARDINALITY_VDISTANCE = 10,
		curveFunction = d3.svg.line()
			.x(function (d) {
				return d.x;
			})
			.y(function (d) {
				return d.y;
			})
			.interpolate("cardinal");

	/**
	 * Creates a new graph object.
	 * @param graphContainerSelector the selector which will be used to get insert the graph.
	 * @constructor
	 */
	var Graph = function (graphContainerSelector) {
		var options,
		// Container for visual elements
			graphContainer,
			nodeContainer,
			labelContainer,
			cardinalityContainer,
			linkContainer,
		// Visual elements
			nodeElements,
			labelGroupElements,
			linkElements,
			linkPathElements,
			cardinalityElements,
		// Internal data
			nodes,
			properties,
			unfilteredNodes,
			unfilteredProperties,
			links,
			classMap,
			propertyMap,
		// Graph behaviour
			force,
			dragBehaviour,
			zoom;

		/**
		 * Recalculates the positions of nodes, links, ... and updates them.
		 */
		var recalculatePositions = function recalculatePositionsF() {
			// Set node positions
			nodeElements.attr("transform", function (node) {
				return "translate(" + node.x + "," + node.y + ")";
			});

			// Set link paths and calculate additional informations
			linkPathElements.attr("d", function (l) {
				if (l.domain() === l.range()) {
					return webvowl.util.math().calculateLoopPath(l);
				}

				// Calculate these every time to get nicer curved paths
				var pathStart = webvowl.util.math().calculateIntersection(l.range(), l.domain(), 1),
					pathEnd = webvowl.util.math().calculateIntersection(l.domain(), l.range(), 1),
					linkDistance = getVisibleLinkDistance(l),
					curvePoint = webvowl.util.math().calculateCurvePoint(pathStart, pathEnd, l,
						linkDistance/options.defaultLinkDistance());

				l.curvePoint(curvePoint);

				return curveFunction([webvowl.util.math().calculateIntersection(l.curvePoint(), l.domain(), 1),
					curvePoint, webvowl.util.math().calculateIntersection(l.curvePoint(), l.range(), 1)]);
			});

			// Set label group positions
			labelGroupElements.attr("transform", function (link) {
				var posX = link.curvePoint().x,
					posY = link.curvePoint().y;

				return "translate(" + posX + "," + posY + ")";
			});


			// Set cardinality positions
			cardinalityElements.attr("transform", function (p) {
				var curve = p.link().curvePoint(),
					pos = webvowl.util.math().calculateIntersection(curve, p.range(), CARDINALITY_HDISTANCE),
					normalV = webvowl.util.math().calculateNormalVector(curve, p.domain(), CARDINALITY_VDISTANCE);

				return "translate(" + (pos.x + normalV.x) + "," + (pos.y + normalV.y) + ")";
			});
		};

		/**
		 * Adjusts the containers current scale and position.
		 */
		var zoomed = function zoomedF() {
			graphContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		};

		/**
		 * Initializes the graph.
		 */
		var initializeGraph = function initializeGraphF() {
			options = webvowl.options();
			options.graphContainerSelector(graphContainerSelector);

			force = d3.layout.force()
				.on("tick", recalculatePositions);

			dragBehaviour = d3.behavior.drag()
				.on("dragstart", function (d) {
					d3.event.sourceEvent.stopPropagation(); // Prevent panning
					d.locked(true);
				})
				.on("drag", function (d) {
					d.px = d3.event.x;
					d.py = d3.event.y;
					force.resume();
				})
				.on("dragend", function (d) {
					d.locked(false);
				});

			// Apply the zooming factor.
			zoom = d3.behavior.zoom()
				.scaleExtent([options.minMagnification(), options.maxMagnification()])
				.on("zoom", zoomed);

		};
		initializeGraph();

		/**
		 * Returns the graph options of this graph.
		 * @returns {webvowl.options} a graph options object
		 */
		this.getGraphOptions = function getGraphOptionsFunct() {
			return options;
		};

		/**
		 * Sets the graph options.
		 * @param graphOptions
		 */
		this.setGraphOptions = function setGraphOptionsFunct(graphOptions) {
			this.options = graphOptions;
		};

		/**
		 * Loads all settings, removes the old graph (if it exists) and draws a new one.
		 */
		this.start = function startF() {
			force.stop();
			loadGraphData();
			refreshGraphData();
			redrawGraph();
			redrawContent();
			refreshGraphStyle();
			force.start();
		};

		/**
		 * Updates only the style of the graph.
		 */
		this.updateStyle = function updateStyleF() {
			refreshGraphStyle();
			force.start();
		};

		this.reload = function reloadF() {
			loadGraphData();
			this.update();
		};

		/**
		 * Updates the graphs displayed data and style.
		 */
		this.update = function updateF() {
			refreshGraphData();
			redrawContent();
			refreshGraphStyle();
			force.start();
		};

		/**
		 * Stops the influence of the force directed layout on all nodes. They are still manually movable.
		 */
		this.freeze = function freezeF() {
			nodes.forEach(function (n) {
				n.frozen(true);
			});
		};

		/**
		 * Allows the influence of the force directed layout on all nodes.
		 */
		this.unfreeze = function unfreezeF() {
			nodes.forEach(function (n) {
				n.frozen(false);
			});
			force.resume();
		};

		/**
		 * Resets visual settings like zoom or panning.
		 */
		this.reset = function resetF() {
			zoom.translate([0, 0])
				.scale(1);
		};

		/**
		 * Calculate the complete link distance. The visual link distance does
		 * not contain e.g. radii of round nodes.
		 * @param link the link
		 * @returns {*}
		 */
		var calculateLinkDistance = function calculateLinkDistanceF(link) {
			var distance = getVisibleLinkDistance(link);
			distance += link.domain().radius();
			distance += link.range().radius();
			return distance;
		};

		function getVisibleLinkDistance(link) {
			function isDatatype(node) {
				if (node instanceof webvowl.nodes.rdfsdatatype ||
					node instanceof webvowl.nodes.rdfsliteral) {
					return true;
				}
				return false;
			}

			if (isDatatype(link.domain()) || isDatatype(link.range())) {
				return options.datatypeDistance();
			} else {
				return options.classDistance();
			}
		}

		/**
		 * Empties the last graph container and draws a new one with respect to the
		 * value the graph container selector has.
		 */
		var redrawGraph = function redrawGraphF() {
			remove();

			graphContainer = d3.selectAll(options.graphContainerSelector())
				.append("svg")
				.classed("vowlGraph", true)
				.attr("width", options.width())
				.attr("height", options.height())
				.call(zoom)
				.append("g");
		};

		/**
		 * Redraws all elements like nodes, links, ...
		 */
		var redrawContent = function redrawContentF() {
			// Empty the graph container
			graphContainer.selectAll("*").remove();

			// Last container -> elements of this container overlap others
			linkContainer = graphContainer.append("g").classed("linkContainer", true);
			cardinalityContainer = graphContainer.append("g").classed("cardinalityContainer", true);
			labelContainer = graphContainer.append("g").classed("labelContainer", true);
			nodeContainer = graphContainer.append("g").classed("nodeContainer", true);

			// Draw nodes
			nodeElements = nodeContainer.selectAll(".node")
				.data(nodes).enter()
				.append("g")
				.classed("node", true)
				.attr("id", function (d) {
					return d.id();
				})
				.call(dragBehaviour);

			nodeElements.each(function (d) {
				d.drawNode(d3.select(this));
			});


			// Draw label groups (property + inverse)
			labelGroupElements = labelContainer.selectAll(".labelGroup")
				.data(links).enter()
				.append("g")
				.classed("labelGroup", true);

			labelGroupElements.each(function (link) {
				var success = link.property().drawProperty(d3.select(this));
				// Remove empty groups without a label.
				if (!success) {
					d3.select(this).remove();
				}
			});

			// Draw cardinalities
			cardinalityElements = cardinalityContainer.selectAll(".cardinality")
				.data(properties).enter()
				.append("g")
				.classed("cardinality", true);

			cardinalityElements.each(function (property) {
				var success = property.drawCardinality(d3.select(this));

				// Remove empty groups without a label.
				if (!success) {
					d3.select(this).remove();
				}
			});

			// Add an extra container for all markers
			linkContainer.append("defs");

			// Draw links
			linkElements = linkContainer.selectAll(".link")
				.data(links).enter()
				.append("g")
				.classed("link", true);

			linkElements.each(function (link) {
				link.property().drawLink(d3.select(this), graphContainer);
			});

			// Select the path for direct access to receive a better performance
			linkPathElements = linkElements.selectAll("path");

			addClickEvents();
		};

		/**
		 * Applies click listeneres to nodes and properties.
		 */
		var addClickEvents = function addClickEventsF() {
			function executeModules(clickedElement) {
				options.clickModules().forEach(function (module) {
					module.handle(clickedElement);
				});
			}


			nodeElements.on("click", function (clickedNode) {
				executeModules(clickedNode);
			});

			labelGroupElements.selectAll(".label").on("click", function (clickedProperty) {
				executeModules(clickedProperty);
			});
		};

		var loadGraphData = function reloadGraphDataF() {
			var data = options.data(),
				classes = combineClasses(data.class, data.classAttribute, webvowl.nodes),
				datatypes = combineClasses(data.datatype, data.datatypeAttribute, webvowl.nodes),
				combinedClassesAndDatatypes = classes.concat(datatypes),
				combinedProperties;

			// Inject properties for unions, intersections, ...
			addSetOperatorProperties(combinedClassesAndDatatypes, data.property);

			combinedProperties = combineProperties(data.property, data.propertyAttribute, webvowl.labels);

			var mapElements = function mapPropertiesF(element) {
				return element.id();
			};
			classMap = mapArray(combinedClassesAndDatatypes, mapElements);
			propertyMap = mapArray(combinedProperties, mapElements);

			// Process the graph data
			convertTypesToUris(combinedClassesAndDatatypes, data.namespace);
			convertTypesToUris(combinedProperties, data.namespace);
			unfilteredNodes = createNodeStructure(combinedClassesAndDatatypes, classMap);
			unfilteredProperties = createPropertyStructure(combinedProperties, classMap, propertyMap);
		};

		/**
		 * Applies the data of the graph options object and parses it. The graph is not redrawn.
		 */
		var refreshGraphData = function refreshGraphDataF() {
			var preprocessedNodes = unfilteredNodes,
				preprocessedProperties = unfilteredProperties;

			// Filter the data
			options.filterModules().forEach(function (module) {
				module.filter(preprocessedNodes, preprocessedProperties);
				preprocessedNodes = module.filteredNodes();
				preprocessedProperties = module.filteredProperties();
			});

			nodes = preprocessedNodes;
			properties = preprocessedProperties;
			// Group properties to links
			links = groupPropertiesToLinks(properties);

			// Gather additional informations like loops or layers
			gatherLinkInformation(links);

			force.nodes(nodes)
				.links(links);
		};

		/**
		 * Applies all options that don't change the graph data.
		 */
		var refreshGraphStyle = function refreshGraphStyleF() {
			zoom = zoom.scaleExtent([options.minMagnification(), options.maxMagnification()]);
			zoom.event(graphContainer);

			force.charge(options.charge())
				.size([options.width(), options.height()])
				.linkDistance(calculateLinkDistance)
				.gravity(options.gravity())
				.linkStrength(options.linkStrength()); // Flexibility of links
		};

		/**
		 * Removes all elements from the graph container.
		 */
		var remove = function removeF() {
			if (graphContainer) {
				// Select the parent element because the graph container is a group (e.g. for zooming)
				d3.select(graphContainer.node().parentNode).remove();
			}
		};
	};


	/**
	 * Combines the passed objects with its attributes and prototypes. This also applies
	 * attributes defined in the base of the prototype.
	 */
	var combineClasses = function combineGraphDataFunct(baseObjects, attributes, prototypes) {
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
				node.comment(element.comment)
					.complement(element.complement)
					.equivalent(element.equivalent)
					.id(element.id)
					.instances(element.instances)
					.intersection(element.intersection)
					.label(element.label || "unset")
					// .type(element.type) Ignore, because we predefined it
					.union(element.union);

				combinations.push(node);
			} else {
				console.error("Unknown element type: " + elementType);
			}
		});

		return combinations;
	};

	var combineProperties = function combineGraphDataFunct(baseObjects, attributes, prototypes) {
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

			// Deprecated and external attributes are more important than the others
			if (element.attribute) {
				if (element.attribute.contains("deprecated")) {
					element.type = "owl:DeprecatedProperty";
				} else if (element.attribute.contains("external")) {
					element.type = "owl:ExternalProperty";
				}
			}

			// Then look for a prototype to add its properties
			elementType = element.type.replace(":", "").toLowerCase();

			if (elementType in prototypes) {
				// Create the matching object and set the properties
				var property = new prototypes[elementType]();
				property.cardinality(element.cardinality)
					.comment(element.comment)
					.domain(element.domain)
					.equivalent(element.equivalent)
					.id(element.id)
					.inverse(element.inverse)
					.label(element.label)
					.minCardinality(element.minCardinality)
					.maxCardinality(element.maxCardinality)
					.range(element.range)
					.subproperty(element.subproperty);
				// .type(element.type) Ignore, because we predefined it
				combinations.push(property);
			} else {
				console.error("Unknown element type: " + elementType);
			}

		});

		return combinations;
	};

	/**
	 * Checks all attributes which have to be rewritten.
	 * For example:
	 * <b>equivalent</b> is filled with only ID's of the corresponding nodes. It would be better to used the
	 * object instead of the ID so we swap the ID's with the correct object reference and can delete it from drawing
	 * because it is not necessary.
	 */
	var createNodeStructure = function createNodeStructureF(rawNodes, classMap) {
		var nodes = [];

		// Set the default values
		rawNodes.forEach(function (node, index) {
			node.visible(true);
			node._eqProcessed = false;
		});

		rawNodes.forEach(function (node) {
			// Merge and connect the equivalent nodes
			processEquivalentIds(node, classMap);
		});

		// Collect all nodes that should be displayed
		rawNodes.forEach(function (node) {
			if (node.visible()) {
				nodes.push(node);
			}
		});

		return nodes;
	};

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
	var createPropertyStructure = function createPropertyStructureF(rawProperties, classMap, propertyMap) {
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
	};

	/**
	 * Adds more information like loop or link count to the passed links.
	 * @param links
	 */
	var gatherLinkInformation = function gatherLinkInformationF(links) {
		var i, // index
			l, // array length
			loop,
			layer;

		links.forEach(function (outer) {
			// Count loops
			if (typeof outer.loopCount() === "undefined") {
				var loops = [];
				links.forEach(function (inner) {
					if (outer.domain() === inner.domain() && outer.domain() === inner.range()) {
						loops.push(inner);
					}
				});

				for (i = 0, l = loops.length; i < l; ++i) {
					loop = loops[i];

					loop.loopIndex(i);
					loop.loopCount(l);
					loop.loops(loops);
				}
			}

			// Count overlaying links (loops are included)
			if (typeof outer.layerCount() === "undefined") {
				var layers = [];
				links.forEach(function (inner) {
					if (outer.domain() === inner.domain() && outer.range() === inner.range() ||
						outer.domain() === inner.range() && outer.range() === inner.domain()) {
						layers.push(inner);
					}
				});

				for (i = 0, l = layers.length; i < l; ++i) {
					layer = layers[i];

					layer.layerIndex(i);
					layer.layerCount(l);
					layer.layers(layers);
				}
			}
		});
	};

	/**
	 * Generates and adds properties for links to set operators.
	 * @param classes unprocessed classes
	 * @param properties unprocessed properties
	 */
	var addSetOperatorProperties = function addSetOperatorPropertiesF(classes, properties) {
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
	};

	/**
	 * Replaces the ids of equivalent nodes/properties with the matching objects, cross references them
	 * and tags them as processed.
	 * @param element a node or a property
	 * @param elementMap a map where nodes/properties can be looked up
	 */
	var processEquivalentIds = function processEquivalentIdsF(element, elementMap) {
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
	};

	/**
	 * Tries to convert the type to an uri and sets it.
	 * @param elements classes or properties
	 * @param namespaces an array of namespaces
	 */
	var convertTypesToUris = function convertTypesToUriF(elements, namespaces) {
		elements.forEach(function (element) {
			// Don't overwrite an existing uri
			if (typeof element.uri() === "undefined") {
				element.uri(replaceNamespace(element.type(), namespaces));
			}
		});
	};

	/**
	 * Creates a map by mapping the array with the passed function.
	 * @param array the array
	 * @param mapFunction a function that returns an id of every object
	 * @returns {{}}
	 */
	var mapArray = function mapArrayF(array, mapFunction) {
		var map = {};
		for (var i = 0, length = array.length; i < length; i++) {
			var element = array[i];
			map[mapFunction(element)] = element;
		}
		return map;
	};

	/**
	 * Creates links of properties and - if existing - their inverses.
	 * @param properties the properties
	 * @returns {Array}
	 */
	var groupPropertiesToLinks = function groupPropertiesToLinksF(properties) {
		var links = [];

		properties.forEach(function(property) {
			property._addedToLink = false;
		});

		properties.forEach(function (property) {
			if (!property._addedToLink) {
				var link = webvowl.util.link();
				link.property(property);
				link.domain(property.domain());
				link.range(property.range());

				property.link(link);
				property._addedToLink = true;

				var inverse = property.inverse();
				if (inverse) {
					link.inverse(inverse);
					inverse.link(link);
					inverse._addedToLink = true;
				}

				links.push(link);
			}
		});
		return links;
	};

	/**
	 * Adds the attributes of the additional object to the base object, but doesn't
	 * overwrite existing ones.
	 *
	 * @param base the base object
	 * @param addition the object with additional data
	 * @returns the combination is also returned
	 */
	var addAdditionalAttributes = function addAdditionalAttributesFunct(base, addition) {
		// Check for an undefined value
		addition = addition || {};

		for (var addAttribute in addition) {
			// Add the attribute if it doesn't exist
			if (!(addAttribute in base) && addition.hasOwnProperty(addAttribute)) {
				base[addAttribute] = addition[addAttribute];
			}
		}
		return base;
	};

	/**
	 * Replaces the namespace (and the separator) if one exists and returns the new value.
	 * @param address the address with a namespace in it
	 * @param namespaces an array of namespaces
	 * @returns {string} the processed address with the (possibly) replaced namespace
	 */
	var replaceNamespace = function replaceNamespaceF(address, namespaces) {
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
	};

	/**
	 * Looks whether the passed object is already the id or if it was replaced
	 * with the object that belongs to the id.
	 * @param object an id, a class or a property
	 * @returns {string} the id of the passed object or undefined
	 */
	var findId = function findIdF(object) {
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
	};

	return Graph;
}());