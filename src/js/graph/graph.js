'use strict';

var webvowl = webvowl || {};

webvowl.Graph = (function () {
	var DEFAULT_VISIBLE_LINKDISTANCE = 160, // TODO move into options
		visibleLinkDistance = DEFAULT_VISIBLE_LINKDISTANCE,
		visibleLiteralLinkDistance = DEFAULT_VISIBLE_LINKDISTANCE,
		CARDINALITY_HDISTANCE = 20,
		CARDINALITY_VDISTANCE = 10,
		curveFunction = d3.svg.line()
			.x(function (d) {
				return d.x;
			})
			.y(function (d) {
				return d.y;
			}).interpolate("cardinal"),
		loopFunction = d3.svg.line()
			.x(function (d) {
				return d.x;
			})
			.y(function (d) {
				return d.y;
			}).interpolate("cardinal")
			.tension(-1);

	/**
	 * Creates a new graph object.
	 * @param graphContainerSelector the selector which will be used to get insert the graph.
	 * @constructor
	 */
	var Graph = function (graphContainerSelector) {
		var options,
			statistics,
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
			links,
			classMap,
			propertyMap,
		// Graph behaviour
			force,
			dragBehaviour,
			zoom,
			currentFocusedElement;

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
				if (l.domain === l.range) {
					return calculateLoopPath(l);
				}

				// Calculate these every time to get nicer curved paths
				var pathStart = calculateIntersection(l.range, l.domain, 1),
					pathEnd = calculateIntersection(l.domain, l.range, 1),
					curvePoint = calculateCurvePoint(pathStart, pathEnd, l);
				l.curvePoint = curvePoint;

				return curveFunction([calculateIntersection(l.curvePoint, l.domain, 1),
					curvePoint, calculateIntersection(l.curvePoint, l.range, 1)]);
			});

			// Set label group positions
			labelGroupElements.attr("transform", function (link) {
				var posX = link.curvePoint.x,
					posY = link.curvePoint.y;

				return "translate(" + posX + "," + posY + ")";
			});


			// Set cardinality positions
			cardinalityElements.attr("transform", function (p) {
				var curve = p.link.curvePoint,
					pos = calculateIntersection(curve, p.range, CARDINALITY_HDISTANCE),
					normalV = calculateNormalVector(curve, p.domain, CARDINALITY_VDISTANCE);

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
			options = webvowl.graphOptions();
			statistics = webvowl.graphStatistics();
			options.graphContainerSelector(graphContainerSelector);

			force = d3.layout.force()
				.on("tick", recalculatePositions);

			dragBehaviour = d3.behavior.drag()
				.on("dragstart", function (d) {
					d3.event.sourceEvent.stopPropagation(); // Prevent panning
					d._fixed = d.fixed;
					d.fixed = true;
				})
				.on("drag", function (d) {
					d.px = d3.event.x;
					d.py = d3.event.y;
					force.resume();
				})
				.on("dragend", function (d) {
					d.fixed = d._fixed;
				});

			// Apply the zooming factor.
			zoom = d3.behavior.zoom()
				.scaleExtent([options.minMagnification(), options.maxMagnification()])
				.on("zoom", zoomed);

		};
		initializeGraph();

		/**
		 * Returns the node array.
		 * @returns {Array} Node array
		 */
		this.getNodes = function getNodesFunct() {
			return nodes;
		};

		/**
		 * Returns the links array.
		 * @returns {Array} Link array
		 */
		this.getLinks = function getLinksFunct() {
			return links;
		};

		/**
		 * Returns the graph options of this graph.
		 * @returns {webvowl.graphOptions} a graph options object
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

		this.getGraphStatistics = function getGraphStats() {
			return statistics;
		};

		/**
		 * Loads all settings, removes the old graph (if it exists) and draws a new one.
		 */
		this.start = function startF() {
			force.stop();
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
				n.fixed = true;
			});
		};

		/**
		 * Allows the influence of the force directed layout on all nodes.
		 */
		this.unfreeze = function unfreezeF() {
			nodes.forEach(function (n) {
				n.fixed = false;
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
		 * Calculate the visible link distance.
		 * @param l The current link.
		 * @returns {*}
		 */
		var calculateLinkDistance = function calculateLinkDistanceF(l) {
			var distance;

			if (l.source.isNormalVisibility() && l.target.isNormalVisibility()) {
				distance = options.classDistance();
			} else {
				distance = options.datatypeDistance();
			}

			distance += l.target.radius;
			distance += l.source.radius;
			return distance;
		};

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
			graphContainer.selectAll('*').remove();

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
				.attr("id", function(d){return d.id;})
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
				var success = link.property.drawProperty(d3.select(this), graphContainer);

				// Remove empty groups without a label.
				if (!success) {
					this.remove();
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
					this.remove();
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
				link.property.drawLink(d3.select(this));
			});

			// Select the path for direct access to receive a better performance
			linkPathElements = linkElements.selectAll("path");

			statistics.calculateStates(nodeElements, linkElements);
			addClickEvents();
		};

		/**
		 * Applies click listeneres to nodes and properties.
		 */
		var addClickEvents = function addClickEventsF() {
			nodeElements.on("click", function (element) {
				if (currentFocusedElement !== undefined) {
					currentFocusedElement.toggleFocus();
				}

				if (currentFocusedElement !== element) {
					element.toggleFocus();
					currentFocusedElement = element;
				} else {
					currentFocusedElement = undefined;
				}

				if (options.infoFunction !== undefined) {
					options.infoFunction.call(currentFocusedElement);
				}
			});

			labelGroupElements.selectAll(".label").on("click", function (element) {
				if (currentFocusedElement !== undefined) {
					currentFocusedElement.toggleFocus();
				}

				if (currentFocusedElement !== element) {
					element.toggleFocus();
					currentFocusedElement = element;
				} else {
					currentFocusedElement = undefined;
				}


				if (options.infoFunction !== undefined) {
					options.infoFunction.call(currentFocusedElement);
				}
			});
		};

		/**
		 * Applies the data of the graph options object and parses it. The graph is not redrawn.
		 */
		var refreshGraphData = function refreshGraphDataF() {
			var data = options.data(),
				classes = combineGraphData(data.class, data.classAttribute, webvowl.nodes),
				datatypes = combineGraphData(data.datatype, data.datatypeAttribute, webvowl.nodes),
				rawProperties,
				rawNodes = classes.concat(datatypes);

			// Inject properties for unions, intersections, ...
			addSetOperatorProperties(rawNodes, data.property);
			rawProperties = combineGraphData(data.property, data.propertyAttribute, webvowl.labels);

			/**
			 * Specific map function.
			 * @param element class or property
			 * @returns {{}}
			 */
			var mapFunction = function mapFunctionF(element) {
				return element.id;
			};
			classMap = mapArray(rawNodes, mapFunction);
			propertyMap = mapArray(rawProperties, mapFunction);

			// Process the graph data
			nodes = createNodeStructure(rawNodes, classMap);
			properties = createPropertyStructure(rawProperties, classMap, propertyMap);
			convertTypesToUris(nodes, data.namespace);
			convertTypesToUris(properties, data.namespace);

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
	var combineGraphData = function combineGraphDataFunct(baseObjects, attributes, prototypes) {
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
			elementType = element.type.replace(":", "");

			// Deprecated and external attributes are more important than the others
			if (element.attribute) {
				if (element.attribute.contains("deprecated")) {
					elementType = "owlDeprecatedProperty";
				} else if (element.attribute.contains("external")) {
					elementType = "owlExternalProperty";
				}
			}

			if (elementType in prototypes) {
				addAdditionalAttributes(element, prototypes[elementType]);
			} else {
				console.error("Unknown element type: " + elementType);
			}

			// And finally apply the base class of the passed prototype type
			if ("base" in prototypes) {
				addAdditionalAttributes(element, prototypes.base);
			}

			combinations.push(element);
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
			node.index = index;
			node.visible = true;
			node._eqProcessed = false;
		});

		rawNodes.forEach(function (node) {
			// Merge and connect the equivalent nodes
			processEquivalentIds(node, classMap);
		});

		// Collect all nodes that should be displayed
		rawNodes.forEach(function (node) {
			if (node.visible) {
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
		if (property.type !== TYPE_DISJOINT) {
			return;
		}

		var domain = property.domain,
			range = property.range;

		// Check the domain.
		if (!domain.disjointWith) {
			domain.disjointWith = [];
		}

		// Check the range.
		if (!range.disjointWith) {
			range.disjointWith = [];
		}

		domain.disjointWith.push(property.range);
		range.disjointWith.push(property.domain);
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
			property.visible = true;
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
			if ((property.domain && property.range) || property.inverse) {

				var inversePropertyId = findId(property.inverse);
				// Look if an inverse property exists
				if (typeof  inversePropertyId !== 'undefined') {
					inverse = propertyMap[inversePropertyId];
					if (typeof inverse === 'undefined') {
						console.warn("No inverse property was found for id: " + inversePropertyId);
					}
				}

				// Either domain and range are set on this property or at the inverse
				if (typeof property.domain !== 'undefined' && typeof property.range !== 'undefined') {
					domain = findId(property.domain);
					range = findId(property.range);

					domainObject = classMap[domain];
					rangeObject = classMap[range];
				} else if (inverse) {
					// Domain and range need to be switched
					domain = findId(inverse.range);
					range = findId(inverse.domain);

					domainObject = classMap[domain];
					rangeObject = classMap[range];
				} else {
					console.warn('Domain and range not found for property: ' + property.id);
				}

				// Set the references on this property
				property.domain = domainObject;
				property.range = rangeObject;

				// Also set the attributes of the inverse property
				if (inverse) {
					property.inverse = inverse;
					inverse.inverse = property;

					// Switch domain and range
					inverse.domain = rangeObject;
					inverse.range = domainObject;
				}
			}

			// Reference subproperties
			var subpropertyIds = property.subproperty;
			if (subpropertyIds) {
				for (i = 0, l = subpropertyIds.length; i < l; ++i) {
					var subpropertyId = findId(subpropertyIds[i]);
					var subproperty = propertyMap[subpropertyId];

					if (subproperty) {
						// Replace id with object
						property.subproperty[i] = subproperty;
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
			if (!property.domain.visible && property.domain.equivalentBase) {
				property.domain = property.domain.equivalentBase;
			}
			if (!property.range.visible && property.range.equivalentBase) {
				property.range = property.range.equivalentBase;
			}

			// Hide link if source or target node is hidden
			if (!property.domain.visible || !property.range.visible) {
				property.visible = false;
			}

			// Collect all properties that should be displayed
			if (property.visible) {
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
			if (typeof outer.loopCount === "undefined") {
				var loops = [];
				links.forEach(function (inner) {
					if (outer.domain === inner.domain && outer.domain === inner.range) {
						loops.push(inner);
					}
				});

				for (i = 0, l = loops.length; i < l; ++i) {
					loop = loops[i];

					loop.loopIndex = i;
					loop.loopCount = l;
					loop.loops = loops;
				}
			}

			// Count overlaying links (loops are included)
			if (typeof outer.layerCount === "undefined") {
				var layers = [];
				links.forEach(function (inner) {
					if (outer.domain === inner.domain && outer.range === inner.range ||
						outer.domain === inner.range && outer.range === inner.domain) {
						layers.push(inner);
					}
				});

				for (i = 0, l = layers.length; i < l; ++i) {
					layer = layers[i];

					layer.layerIndex = i;
					layer.layerCount = l;
					layer.layers = layers;
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
			if (typeof setIds !== 'undefined') {
				for (i = 0, l = setIds.length; i < l; ++i) {
					var rangeId = setIds[i],
						property = {};

					property.id = 'GENERATED-' + domainId + '-' + rangeId + '-' + i;
					property.type = 'setOperatorProperty';
					property.domain = domainId;
					property.range = rangeId;

					properties.push(property);
				}
			}
		}

		classes.forEach(function (clss) {
			addProperties(clss.id, clss.complement);
			addProperties(clss.id, clss.intersection);
			addProperties(clss.id, clss.union);
		});
	};

	/**
	 * Replaces the ids of equivalent nodes/properties with the matching objects, cross references them
	 * and tags them as processed.
	 * @param element a node or a property
	 * @param elementMap a map where nodes/properties can be looked up
	 */
	var processEquivalentIds = function processEquivalentIdsF(element, elementMap) {
		var eqIds = element.equivalent;
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
				eqObject.equivalent = eqObject.equivalent || [];
				eqObject.equivalent.push(element);
				eqObject.equivalentBase = element;
				eqIds[i] = eqObject;

				// Hide other equivalent nodes
				eqObject.visible = false;
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
			if (typeof element.uri === 'undefined') {
				element.uri = replaceNamespace(element.type, namespaces);
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
		properties.forEach(function (property) {
			if (!property._addedToLink) {
				var link = {};
				link.property = property;
				link.domain = property.domain;
				link.range = property.range;
				// Set properties for the layout
				link.source = property.domain;
				link.target = property.range;

				property.link = link;
				property._addedToLink = true;

				var inverse = property.inverse;
				if (inverse) {
					link.inverse = inverse;
					inverse.link = link;
					inverse._addedToLink = true;
				}

				links.push(link);
			}
		});
		return links;
	};

	// TODO eventuell diese Funktionen in labelDefinition auslagern
	/* Calculates the normal vector between two points */
	var calculateNormalVector = function calculateNormalVectorFunct(source, target, length) {
		var dx = target.x - source.x,
			dy = target.y - source.y,

			nx = -dy,
			ny = dx,

			vlength = Math.sqrt(nx * nx + ny * ny),
			ratio = length / vlength;

		return {"x": nx * ratio, "y": ny * ratio};
	};

	/* Calculates a point between two points for curves */
	var calculateCurvePoint = function calculateCurvePointFunct(source, target, link) {
		var distance = calculateLayeredLinkDistance(link),

		// Find the center of the two points,
			dx = target.x - source.x,
			dy = target.y - source.y,

			cx = source.x + dx / 2,
			cy = source.y + dy / 2,

			n = calculateNormalVector(source, target, distance);

		// Every second link shoud be drawn on the opposite of the center
		if (link.layerIndex % 2 !== 0) {
			n.x = -n.x;
			n.y = -n.y;
		}

		/*
		 If there is a link from A to B, the normal vector will point to the left
		 in movement direction.
		 It there is a link from B to A, the normal vector should point to the of his
		 own direction to not overlay the other link.
		 */
		if (link.domain.index < link.range.index) {
			n.x = -n.x;
			n.y = -n.y;
		}

		return {"x": cx + n.x, "y": cy + n.y};
	};

	var calculateLayeredLinkDistance = function calculateLayeredLinkDistanceFunct(link) {
		var level = Math.floor((link.layerIndex - link.layerCount % 2) / 2) + 1,
			distance = 0;
		switch (level) {
			case 1:
				distance = 20;
				break;
			case 2:
				distance = 45;
				break;
		}
		return distance * (visibleLinkDistance / DEFAULT_VISIBLE_LINKDISTANCE);
	};

	/* Calculates the radian of an angle */
	var calculateRadian = function calculateRadianFunct(angle) {
		angle = angle % 360;
		if (angle < 0) {
			angle = angle + 360;
		}
		var arc = (2 * Math.PI * angle) / 360;
		if (arc < 0) {
			arc = arc + (2 * Math.PI);
		}
		return arc;
	};

	/* Calculates links to itself and stores the point for the labels. Currently only working for circle nodes! */
	var calculateLoopPath = function calculateLoopPathFunct(l) {
		var node = l.domain,
			loopShiftAngle = 360 / l.loopCount,
			loopAngle = Math.min(60, loopShiftAngle * 0.8),

			arcFrom = calculateRadian(loopShiftAngle * l.loopIndex),
			arcTo = calculateRadian((loopShiftAngle * l.loopIndex) + loopAngle),

			x1 = Math.cos(arcFrom) * node.radius,
			y1 = Math.sin(arcFrom) * node.radius,

			x2 = Math.cos(arcTo) * node.radius,
			y2 = Math.sin(arcTo) * node.radius,

			fixPoint1 = {"x": node.x + x1, "y": node.y + y1},
			fixPoint2 = {"x": node.x + x2, "y": node.y + y2},

			distanceMultiplier = 2.5,
			dx = ((x1 + x2) / 2) * distanceMultiplier,
			dy = ((y1 + y2) / 2) * distanceMultiplier,
			curvePoint = {"x": node.x + dx, "y": node.y + dy};
		l.curvePoint = curvePoint;

		return loopFunction([fixPoint1, curvePoint, fixPoint2]);
	};

	/* Calculates the point where the link between the source and target node
	 * intersects the border of the target node */
	var calculateIntersection = function calculateIntersectionFunct(source, target, additionalDistance) {
		var dx = target.x - source.x,
			dy = target.y - source.y,
			innerDistance = target.radius;

		if (target.type === "rdfs:Literal" ||
			target.type === "rdfs:Datatype") {
			var m_link = Math.abs(dy / dx),
				m_rect = target.height / target.width;

			if (m_link <= m_rect) {
				var timesX = dx / (target.width / 2),
					rectY = dy / timesX;
				innerDistance = Math.sqrt(Math.pow(target.width / 2, 2) + rectY * rectY);
			} else {
				var timesY = dy / (target.height / 2),
					rectX = dx / timesY;
				innerDistance = Math.sqrt(Math.pow(target.height / 2, 2) + rectX * rectX);
			}
		}

		var length = Math.sqrt(dx * dx + dy * dy),
			ratio = (length - (innerDistance + additionalDistance)) / length,
			x = dx * ratio + source.x,
			y = dy * ratio + source.y;

		return {x: x, y: y};
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
		if (typeof object === 'undefined') {
			return undefined;
		} else if (typeof object === 'string') {
			return object;
		} else if ('id' in object) {
			return object.id;
		} else {
			console.warn('No Id was found for this object: ' + object);
			return undefined;
		}
	};

	return Graph;
}());

webvowl.graphOptions = function () {
	/**
	 * @constructor
	 */
	var options = {},
		data,
		graphContainerSelector,
		defaultLinkDistance = 260,
		classDistance = defaultLinkDistance,
		datatypeDistance = defaultLinkDistance,
		charge = -1000,
		gravity = 0.025,
		linkStrength = 0.7,
		height = 600,
		width = 800,
		infoFunction,
		minMagnification = 0.1,
		maxMagnification = 4;

	/* Read-only properties */
	options.defaultLinkDistance = function () {
		return defaultLinkDistance;
	};

	/* Properties with read-write access */
	options.infoFunction = function (p) {
		if (!arguments.length) return infoFunction;

		if (typeof p === "function") {
			infoFunction = p;
		} else {
			console.error("Parameter is not a function.");
			infoFunction = undefined;
		}

		return options;
	};

	options.data = function (p) {
		if (!arguments.length) return data;
		data = p;
		return options;
	};

	options.graphContainerSelector = function (p) {
		if (!arguments.length) return graphContainerSelector;
		graphContainerSelector = p;
		return options;
	};

	options.classDistance = function (p) {
		if (!arguments.length) return classDistance;
		classDistance = +p;
		return options;
	};

	options.datatypeDistance = function (p) {
		if (!arguments.length) return datatypeDistance;
		datatypeDistance = +p;
		return options;
	};

	options.charge = function (p) {
		if (!arguments.length) return charge;
		charge = +p;
		return options;
	};

	options.gravity = function (p) {
		if (!arguments.length) return gravity;
		gravity = +p;
		return options;
	};

	options.linkStrength = function (p) {
		if (!arguments.length) return linkStrength;
		linkStrength = +p;
		return options;
	};

	options.height = function (p) {
		if (!arguments.length) return height;
		height = +p;
		return options;
	};

	options.width = function (p) {
		if (!arguments.length) return width;
		width = +p;
		return options;
	};

	options.minMagnification = function (p) {
		if (!arguments.length) return minMagnification;
		minMagnification = +p;
		return options;
	};

	options.maxMagnification = function (p) {
		if (!arguments.length) return maxMagnification;
		maxMagnification = +p;
		return options;
	};

	return options;
};