var _ = require("lodash/core");
var math = require("./util/math")();
var linkCreator = require("./parsing/linkCreator")();
var elementTools = require("./util/elementTools")();


module.exports = function (graphContainerSelector) {
	var graph = {},
		CARDINALITY_HDISTANCE = 20,
		CARDINALITY_VDISTANCE = 10,
		curveFunction = d3.svg.line()
			.x(function (d) {
				return d.x;
			})
			.y(function (d) {
				return d.y;
			})
			.interpolate("cardinal"),
		options = require("./options")(),
		parser = require("./parser")(graph),
		language = "default",
		paused = false,
	// Container for visual elements
		graphContainer,
		nodeContainer,
		labelContainer,
		cardinalityContainer,
		linkContainer,
	// Visual elements
		nodeElements,
		labelGroupElements,
		linkGroups,
		linkPathElements,
		cardinalityElements,
	// Internal data
		classNodes,
		labelNodes,
		links,
		properties,
		unfilteredData,
		// Graph behaviour
		force,
		dragBehaviour,
		zoomFactor,
		graphTranslation,
		graphUpdateRequired = false,
		pulseNodeIds,
		nodeArrayForPulse = [],
		nodeMap = [],
		zoom;

	/**
	 * Recalculates the positions of nodes, links, ... and updates them.
	 */
	function recalculatePositions() {
		// Set node positions
		nodeElements.attr("transform", function (node) {
			return "translate(" + node.x + "," + node.y + ")";
		});

		// Set label group positions
		labelGroupElements.attr("transform", function (label) {
			var position;

			// force centered positions on single-layered links
			var link = label.link();
			if (link.layers().length === 1 && !link.loops()) {
				var linkDomainIntersection = math.calculateIntersection(link.range(), link.domain(), 0);
				var linkRangeIntersection = math.calculateIntersection(link.domain(), link.range(), 0);
				position = math.calculateCenter(linkDomainIntersection, linkRangeIntersection);
				label.x = position.x;
				label.y = position.y;
			}
			return "translate(" + label.x + "," + label.y + ")";
		});
		// Set link paths and calculate additional information
		linkPathElements.attr("d", function (l) {
			if (l.isLoop()) {
				return math.calculateLoopPath(l);
			}
			var curvePoint = l.label();
			var pathStart = math.calculateIntersection(curvePoint, l.domain(), 1);
			var pathEnd = math.calculateIntersection(curvePoint, l.range(), 1);

			return curveFunction([pathStart, curvePoint, pathEnd]);
		});

		// Set cardinality positions
		cardinalityElements.attr("transform", function (property) {
			var label = property.link().label(),
				pos = math.calculateIntersection(label, property.range(), CARDINALITY_HDISTANCE),
				normalV = math.calculateNormalVector(label, property.domain(), CARDINALITY_VDISTANCE);

			return "translate(" + (pos.x + normalV.x) + "," + (pos.y + normalV.y) + ")";
		});

	}

	/**
	 * Adjusts the containers current scale and position.
	 */
	function zoomed() {
		graphContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		// store zoom factor for export
		zoomFactor = d3.event.scale;
		graphTranslation = d3.event.translate;
	}

	/**
	 * Initializes the graph.
	 */
	function initializeGraph() {
		options.graphContainerSelector(graphContainerSelector);

		force = d3.layout.force()
			.on("tick", recalculatePositions);

		dragBehaviour = d3.behavior.drag()
			.origin(function (d) {
				return d;
			})
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
			.duration(150)
			.scaleExtent([options.minMagnification(), options.maxMagnification()])
			.on("zoom", zoomed);
	}

	initializeGraph();

	/**
	 * Returns the graph options of this graph (readonly).
	 * @returns {webvowl.options} a graph options object
	 */
	graph.graphOptions = function () {
		return options;
	};

	graph.scaleFactor = function () {
		return zoomFactor;
	};
	graph.translation = function () {
		return graphTranslation;
	};

	/** Returns the visible nodes */
	graph.graphNodeElements = function () {
		return nodeElements;
	};
	/** Returns the visible Label Nodes */
	graph.graphLabelElements = function () {
		return labelNodes;
	};


	/** Loads all settings, removes the old graph (if it exists) and draws a new one. */
	graph.start = function () {
		force.stop();
		loadGraphData();
		redrawGraph();
		graph.update();
	};

	/**    Updates only the style of the graph. */
	graph.updateStyle = function () {
		refreshGraphStyle();
		force.start();
	};

	graph.reload = function () {
		loadGraphData();
		this.update();
	};

	graph.load = function () {
		force.stop();
		loadGraphData();
		refreshGraphData();
		for (var i = 0; i < labelNodes.length; i++) {
			var label = labelNodes[i];
			if (label.property().x && label.property().y) {
				label.x = label.property().x;
				label.y = label.property().y;
				// also set the prev position of the label
				label.px = label.x;
				label.py = label.y;
			}
		}
		graph.update();
	};


	/**
	 * Updates the graphs displayed data and style.
	 */
	graph.update = function () {
		refreshGraphData();

		// update node map
		nodeMap = [];
		var node;
		for (var j = 0; j < force.nodes().length; j++) {
			node = force.nodes()[j];
			if (node.id) {
				nodeMap[node.id()] = j;
				// check for equivalents
				var eqs = node.equivalents();
				if (eqs.length > 0) {
					for (var e = 0; e < eqs.length; e++) {
						var eqObject = eqs[e];
						nodeMap[eqObject.id()] = j;
					}
				}
			}
			if (node.property) {
				nodeMap[node.property().id()] = j;
				var inverse = node.inverse();
				if (inverse) {
					nodeMap[inverse.id()] = j;
				}
			}
		}
		force.start();
		redrawContent();
		graph.updatePulseIds(nodeArrayForPulse);
		refreshGraphStyle();
		var haloElement;
		var halo;
		for (j = 0; j < force.nodes().length; j++) {
			node = force.nodes()[j];
			if (node.id) {
				haloElement = node.getHalos();
				if (haloElement) {
					halo = haloElement.selectAll(".searchResultA");
					halo.classed("searchResultA", false);
					halo.classed("searchResultB", true);
				}
			}

			if (node.property) {
				haloElement = node.property().getHalos();
				if (haloElement) {
					halo = haloElement.selectAll(".searchResultA");
					halo.classed("searchResultA", false);
					halo.classed("searchResultB", true);
				}
			}
		}
	};

	graph.paused = function (p) {
		if (!arguments.length) return paused;
		paused = p;
		graph.updateStyle();
		return graph;
	};

	/**
	 * Resets visual settings like zoom or panning.
	 */

	/** setting the zoom factor **/
	graph.setZoom = function (value) {
		zoom.scale(value);
	};

	/** setting the translation factor **/
	graph.setTranslation = function (translation) {
		zoom.translate([translation[0], translation[1]]);
	};

	/** resetting the graph **/
	graph.reset = function () {
		zoom.translate([0, 0])
			.scale(1);
	};

	/**
	 * Calculate the link distance of a single link part.
	 * The visible link distance does not contain e.g. radii of round nodes.
	 * @param linkPart the link
	 * @returns {*}
	 */
	function calculateLinkPartDistance(linkPart) {
		var link = linkPart.link();

		if (link.isLoop()) {
			return options.loopDistance();
		}

		// divide by 2 to receive the length for a single link part
		var linkPartDistance = getVisibleLinkDistance(link) / 2;
		linkPartDistance += linkPart.domain().actualRadius();
		linkPartDistance += linkPart.range().actualRadius();
		return linkPartDistance;
	}

	function getVisibleLinkDistance(link) {
		if (elementTools.isDatatype(link.domain()) || elementTools.isDatatype(link.range())) {
			return options.datatypeDistance();
		} else {
			return options.classDistance();
		}
	}

	/**
	 * Empties the last graph container and draws a new one with respect to the
	 * value the graph container selector has.
	 */
	function redrawGraph() {
		remove();

		graphContainer = d3.selectAll(options.graphContainerSelector())
			.append("svg")
			.classed("vowlGraph", true)
			.attr("width", options.width())
			.attr("height", options.height())
			.call(zoom)
			.append("g");
	}

	/** search functionality **/
	graph.getUpdateDictionary = function () {
		return parser.getDictionary();
	};

	graph.resetSearchHighlight = function () {
		// get all nodes (handle also already filtered nodes )
		pulseNodeIds = [];
		nodeArrayForPulse = [];


		// clear from stored nodes
		var nodes = unfilteredData.nodes;
		var props = unfilteredData.properties;
		var j;
		for (j = 0; j < nodes.length; j++) {
			var node = nodes[j];
			if (node.removeHalo)
				node.removeHalo();
		}
		for (j = 0; j < props.length; j++) {
			var prop = props[j];
			if (prop.removeHalo)
				prop.removeHalo();
		}
	};

	graph.updatePulseIds = function (nodeIdArray) {

		pulseNodeIds = [];
		if (nodeIdArray.length === 0) {
			return;
		}

		for (var i = 0; i < nodeIdArray.length; i++) {
			var selectedId = nodeIdArray[i];
			var forceId = nodeMap[selectedId];
			if (forceId !== undefined) {
				var le_node = force.nodes()[forceId];
				if (le_node.id) {
					if (pulseNodeIds.indexOf(forceId) === -1) {
						pulseNodeIds.push(forceId);
					}
				}
				if (le_node.property) {
					if (pulseNodeIds.indexOf(forceId) === -1) {
						pulseNodeIds.push(forceId);
					}
				}
			}
		}
	};

	graph.highLightNodes = function (nodeIdArray) {
		if (nodeIdArray.length === 0) {
			return;
			// nothing to highlight
		}
		pulseNodeIds = [];
		nodeArrayForPulse = nodeIdArray;
		var missedIds = [];
		// identify the force id to highlight
		for (var i = 0; i < nodeIdArray.length; i++) {
			var selectedId = nodeIdArray[i];
			var forceId = nodeMap[selectedId];

			if (forceId !== undefined) {
				var le_node = force.nodes()[forceId];
				if (le_node.id) {
					if (pulseNodeIds.indexOf(forceId) === -1) {
						pulseNodeIds.push(forceId);
						le_node.foreground();
						le_node.drawHalo();
					}
				}
				if (le_node.property) {
					if (pulseNodeIds.indexOf(forceId) === -1) {
						pulseNodeIds.push(forceId);
						le_node.property().foreground();
						le_node.property().drawHalo();
					}
				}
			}
			else {
				// check if they have an equivalent or an inverse!
				console.log("Could not Find Id in Graph (maybe filtered out) id = " + selectedId);
				missedIds.push(selectedId);
			}
		}

		// store the highlight on the missed nodes;
		var s_nodes = unfilteredData.nodes;
		var s_props = unfilteredData.properties;
		for (i = 0; i < missedIds.length; i++) {
			var missedId = missedIds[i];
			// search for this in the nodes;
			for (var n = 0; n < s_nodes.length; n++) {
				var nodeId = s_nodes[n].id();
				if (nodeId === missedId) {
					s_nodes[n].drawHalo();
				}
			}
			for (var p = 0; p < s_props.length; p++) {
				var propId = s_props[p].id();
				if (propId === missedId) {
					s_props[p].drawHalo();
				}
			}
		}
	};

	/**
	 * removes data when data could not be loaded
	 */
	graph.clearGraphData=function(){
		var sidebar=graph.options().sidebar();
		if (sidebar)
			sidebar.clearOntologyInformation();
		if (graphContainer)
			redrawGraph();
	};

	/**
	 * Redraws all elements like nodes, links, ...
	 */
	function redrawContent() {
		var markerContainer;

		if (!graphContainer) {
			return;
		}

		// Empty the graph container
		graphContainer.selectAll("*").remove();

		// Last container -> elements of this container overlap others
		linkContainer = graphContainer.append("g").classed("linkContainer", true);
		cardinalityContainer = graphContainer.append("g").classed("cardinalityContainer", true);
		labelContainer = graphContainer.append("g").classed("labelContainer", true);
		nodeContainer = graphContainer.append("g").classed("nodeContainer", true);

		// Add an extra container for all markers
		markerContainer = linkContainer.append("defs");

		// Draw nodes
		nodeElements = nodeContainer.selectAll(".node")
			.data(classNodes).enter()
			.append("g")
			.classed("node", true)
			.attr("id", function (d) {
				return d.id();
			})
			.call(dragBehaviour);

		nodeElements.each(function (node) {
			node.draw(d3.select(this));
		});

		// Draw label groups (property + inverse)
		labelGroupElements = labelContainer.selectAll(".labelGroup")
			.data(labelNodes).enter()
			.append("g")
			.classed("labelGroup", true)
			.call(dragBehaviour);

		labelGroupElements.each(function (label) {
			var success = label.draw(d3.select(this));
			// Remove empty groups without a label.
			if (!success) {
				d3.select(this).remove();
			}
		});

		// Place subclass label groups on the bottom of all labels
		labelGroupElements.each(function (label) {
			// the label might be hidden e.g. in compact notation
			if (!this.parentNode) {
				return;
			}

			if (elementTools.isRdfsSubClassOf(label.property())) {
				var parentNode = this.parentNode;
				parentNode.insertBefore(this, parentNode.firstChild);
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

		// Draw links
		linkGroups = linkContainer.selectAll(".link")
			.data(links).enter()
			.append("g")
			.classed("link", true);

		linkGroups.each(function (link) {
			link.draw(d3.select(this), markerContainer);
		});

		// Select the path for direct access to receive a better performance
		linkPathElements = linkGroups.selectAll("path");

		addClickEvents();
	}

	/**
	 * Applies click listeners to nodes and properties.
	 */
	function addClickEvents() {
		function executeModules(selectedElement) {
			options.selectionModules().forEach(function (module) {
				module.handle(selectedElement);
			});
		}

		nodeElements.on("click", function (clickedNode) {
			executeModules(clickedNode);
		});

		labelGroupElements.selectAll(".label").on("click", function (clickedProperty) {
			executeModules(clickedProperty);
		});
	}

	function generateDictionary(data){
		var i;
		var originalDictionary = [];
		var nodes = data.nodes;
		for (i = 0; i < nodes.length; i++) {
			// check if node has a label
			if (nodes[i].labelForCurrentLanguage()!==undefined)
				originalDictionary.push(nodes[i]);
		}
		var props= data.properties;
		for (i = 0; i < props.length; i++) {
			if (props[i].labelForCurrentLanguage()!==undefined)
				originalDictionary.push(props[i]);
		}
		parser.setDictionary(originalDictionary);

		var literFilter = graph.options().literalFilter();
		var idsToRemove = literFilter.removedNodes();
		var originalDict = parser.getDictionary();
		var newDict = [];

		// go through the dictionary and remove the ids;
		for (i = 0; i < originalDict.length; i++) {
			var dictElement = originalDict[i];
			var dictElementId;
			if (dictElement.property)
				dictElementId = dictElement.property().id();
			else
				dictElementId = dictElement.id();
			// compare against the removed ids;
			var addToDictionary = true;
			for (var j = 0; j < idsToRemove.length; j++) {
				var currentId = idsToRemove[j];
				if (currentId === dictElementId) {
					addToDictionary = false;
				}
			}
			if (addToDictionary === true) {
				newDict.push(dictElement);
			}
		}
		// tell the parser that the dictionary is updated
		parser.setDictionary(newDict);

	}

	function loadGraphData() {
		parser.parse(options.data());

		unfilteredData = {
			nodes: parser.nodes(),
			properties: parser.properties()
		};

		// Initialize filters with data to replicate consecutive filtering
		var initializationData = _.clone(unfilteredData);
		options.filterModules().forEach(function (module) {
			initializationData = filterFunction(module, initializationData, true);
		});

		// generate dictionary here ;
		generateDictionary(unfilteredData);

		parser.parseSettings();
		graphUpdateRequired = parser.settingsImported();
		graph.options().searchMenu().requestDictionaryUpdate();
	}

	/**
	 * Applies the data of the graph options object and parses it. The graph is not redrawn.
	 */
	function refreshGraphData() {
		var preprocessedData = _.clone(unfilteredData);

		// Filter the data
		options.filterModules().forEach(function (module) {
			preprocessedData = filterFunction(module, preprocessedData);
		});

		classNodes = preprocessedData.nodes;
		properties = preprocessedData.properties;
		links = linkCreator.createLinks(properties);
		labelNodes = links.map(function (link) {
			return link.label();
		});
		storeLinksOnNodes(classNodes, links);
		setForceLayoutData(classNodes, labelNodes, links);
	}

	function filterFunction(module, data, initializing) {
		links = linkCreator.createLinks(data.properties);
		storeLinksOnNodes(data.nodes, links);

		if (initializing) {
			if (module.initialize) {
				module.initialize(data.nodes, data.properties);
			}
		}
		module.filter(data.nodes, data.properties);
		return {
			nodes: module.filteredNodes(),
			properties: module.filteredProperties()
		};
	}

	function storeLinksOnNodes(nodes, links) {
		for (var i = 0, nodesLength = nodes.length; i < nodesLength; i++) {
			var node = nodes[i],
				connectedLinks = [];

			// look for properties where this node is the domain or range
			for (var j = 0, linksLength = links.length; j < linksLength; j++) {
				var link = links[j];

				if (link.domain() === node || link.range() === node) {
					connectedLinks.push(link);
				}
			}
			node.links(connectedLinks);
		}
	}

	function setForceLayoutData(classNodes, labelNodes, links) {
		var d3Links = [];
		links.forEach(function (link) {
			d3Links = d3Links.concat(link.linkParts());
		});

		var d3Nodes = [].concat(classNodes).concat(labelNodes);
		setPositionOfOldLabelsOnNewLabels(force.nodes(), labelNodes);

		force.nodes(d3Nodes)
			.links(d3Links);
	}

	/**
	 * The label nodes are positioned randomly, because they are created from scratch if the data changes and lose
	 * their position information. With this hack the position of old labels is copied to the new labels.
	 */
	function setPositionOfOldLabelsOnNewLabels(oldLabelNodes, labelNodes) {
		labelNodes.forEach(function (labelNode) {
			for (var i = 0; i < oldLabelNodes.length; i++) {
				var oldNode = oldLabelNodes[i];
				if (oldNode.equals(labelNode)) {
					labelNode.x = oldNode.x;
					labelNode.y = oldNode.y;
					labelNode.px = oldNode.px;
					labelNode.py = oldNode.py;
					break;
				}
			}
		});
	}


	/**
	 * Applies all options that don't change the graph data.
	 */
	function refreshGraphStyle() {
		zoom = zoom.scaleExtent([options.minMagnification(), options.maxMagnification()]);
		if (graphContainer) {
			zoom.event(graphContainer);
		}

		force.charge(function (element) {
			var charge = options.charge();
			if (elementTools.isLabel(element)) {
				charge *= 0.8;
			}
			return charge;
		})
			.size([options.width(), options.height()])
			.linkDistance(calculateLinkPartDistance)
			.gravity(options.gravity())
			.linkStrength(options.linkStrength()); // Flexibility of links

		force.nodes().forEach(function (n) {
			n.frozen(paused);
		});
	}

	/**
	 * Removes all elements from the graph container.
	 */
	function remove() {
		if (graphContainer) {
			// Select the parent element because the graph container is a group (e.g. for zooming)
			d3.select(graphContainer.node().parentNode).remove();
		}
	}

	graph.options = function () {
		return options;
	};

	graph.language = function (newLanguage) {
		if (!arguments.length) return language;

		// Just update if the language changes
		if (language !== newLanguage) {
			language = newLanguage || "default";
			redrawContent();
			recalculatePositions();
			graph.options().searchMenu().requestDictionaryUpdate();
			graph.resetSearchHighlight();
		}
		return graph;
	};


	return graph;
};
