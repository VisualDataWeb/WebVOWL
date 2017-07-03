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
		transformAnimation=false,
		graphTranslation,
		graphUpdateRequired = false,
		pulseNodeIds=[],
		nodeArrayForPulse = [],
		nodeMap = [],
        locationId = 0,
		defaultZoom=1.0,
		defaultTargetZoom=0.8,
		zoom;


	graph.setDefaultZoom=function(val){
		defaultZoom=val;
		graph.reset();
	};
	graph.setTargetZoom=function(val){
		defaultTargetZoom=val;
	};

    function updateHaloRadius() {
        if (pulseNodeIds && pulseNodeIds.length > 0) {
            var forceNodes = force.nodes();
            for (var i = 0; i < pulseNodeIds.length; i++) {
                var node = forceNodes[pulseNodeIds[i]];
                if (node) {
                	if (node.property) {
                        // match search strings with property label
                        if (node.property().inverse) {
                            var searchString = graph.options().searchMenu().getSearchString().toLowerCase();
                            var name = node.property().labelForCurrentLanguage().toLowerCase();
                            if (name===searchString) computeDistanceToCenter(node);
                            else {
                                node.property().removeHalo();
                            	if (!node.property().inverse().getHalos())
                            		node.property().inverse().drawHalo();
                            	computeDistanceToCenter(node, true);
                            }
                        }
                    }
                    computeDistanceToCenter(node);
                }
            }
        }
    }
    function getScreenCoords(x, y, translate, scale) {
        var xn = translate[0] + x * scale;
        var yn = translate[1] + y * scale;
        return {x: xn, y: yn};
    }

    function computeDistanceToCenter(node, inverse) {
        var container = node;
        var w = graph.options().width();
        var h = graph.options().height();
        var posXY = getScreenCoords(node.x, node.y, graphTranslation, zoomFactor);

        var highlightOfInv=false;

        if (inverse && inverse===true){
            highlightOfInv=true;
            posXY = getScreenCoords(node.x, node.y+20, graphTranslation, zoomFactor);
        }
        var x = posXY.x;
        var y = posXY.y;
        var nodeIsRect = false;
        var halo;
        var roundHalo;
        var rectHalo;
        var borderPoint_x = 0;
        var borderPoint_y = 0;
        var defaultRadius;
        var offset = 15;
        var radius;

        if (node.property && highlightOfInv===true ) {
            rectHalo = node.property().inverse().getHalos().select("rect");
            rectHalo.classed("hidden", true);

            roundHalo = node.property().inverse().getHalos().select("circle");
            if (roundHalo.node() === null) {
                radius = node.property().inverse().width()+15;

                roundHalo = node.property().inverse().getHalos().append("circle")
                    .classed("searchResultB", true)
                    .classed("searchResultA", false)
                    .attr("r", radius + 15);

            }
            halo = roundHalo; // swap the halo to be round
            nodeIsRect = true;
            container = node.property().inverse();
        }

        if (node.id) {
            if (!node.getHalos()) return; // something went wrong before
            halo = node.getHalos().select("rect");
            if (halo.node() === null) {
                // this is a round node
                nodeIsRect = false;
                roundHalo = node.getHalos().select("circle");
                defaultRadius = node.actualRadius();
                roundHalo.attr("r", defaultRadius + offset);
                halo = roundHalo;
            } else { // this is a rect node
                nodeIsRect = true;
                rectHalo = node.getHalos().select("rect");
                rectHalo.classed("hidden", true);
                roundHalo = node.getHalos().select("circle");
                if (roundHalo.node() === null) {
                    radius = node.width();
                    roundHalo = node.getHalos().append("circle")
                        .classed("searchResultB", true)
                        .classed("searchResultA", false)
                        .attr("r", radius + offset);
                }
                halo = roundHalo;
            }
        }
        if (node.property && !inverse) {
            if (!node.property().getHalos()) return; // something went wrong before
            rectHalo = node.property().getHalos().select("rect");
            rectHalo.classed("hidden", true);

            roundHalo = node.property().getHalos().select("circle");
            if (roundHalo.node() === null) {
                radius = node.property().width();

                roundHalo = node.property().getHalos().append("circle")
                    .classed("searchResultB", true)
                    .classed("searchResultA", false)
                    .attr("r", radius + 15);

            }
            halo = roundHalo; // swap the halo to be round
            nodeIsRect = true;
            container = node.property();
        }

        if (x < 0 || x > w || y < 0 || y > h) {
            // node outside viewport;
            // check for quadrant and get the correct boarder point (intersection with viewport)
            if (x < 0 && y < 0) {
                borderPoint_x = 0;
                borderPoint_y = 0;
            } else if (x > 0 && x < w && y < 0) {
                borderPoint_x = x;
                borderPoint_y = 0;
            } else if (x > w && y < 0) {
                borderPoint_x = w;
                borderPoint_y = 0;
            } else if (x > w && y > 0 && y < h) {
                borderPoint_x = w;
                borderPoint_y = y;
            } else if (x > w && y > h) {
                borderPoint_x = w;
                borderPoint_y = h;
            } else if (x > 0 && x < w && y > h) {
                borderPoint_x = x;
                borderPoint_y = h;
            } else if (x < 0 && y > h) {
                borderPoint_x = 0;
                borderPoint_y = h;
            } else if (x < 0 && y > 0 && y < h) {
                borderPoint_x = 0;
                borderPoint_y = y;
            }
            // kill all pulses of nodes that are outside the viewport
            container.getHalos().select("rect").classed("searchResultA", false);
            container.getHalos().select("circle").classed("searchResultA", false);
            container.getHalos().select("rect").classed("searchResultB", true);
            container.getHalos().select("circle").classed("searchResultB", true);
            halo.classed("hidden", false);
            // compute in pixel coordinates length of difference vector
            var borderRadius_x = borderPoint_x - x;
            var borderRadius_y = borderPoint_y - y;

            var len = borderRadius_x * borderRadius_x + borderRadius_y * borderRadius_y;
            len = Math.sqrt(len);

            var normedX = borderRadius_x / len;
            var normedY = borderRadius_y / len;

            len = len + 20; // add 20 px;

            // re-normalized vector
            var newVectorX = normedX * len + x;
            var newVectorY = normedY * len + y;
            // compute world coordinates of this point
            var wX = (newVectorX - graphTranslation[0]) / zoomFactor;
            var wY = (newVectorY - graphTranslation[1]) / zoomFactor;

            // compute distance in world coordinates
            var dx = wX - node.x;
            var dy = wY - node.y;
            if ( highlightOfInv===true)
                dy = wY - node.y-20;

            if ( highlightOfInv===false && node.property && node.property().inverse())
                dy = wY - node.y+20;

            var newRadius = Math.sqrt(dx * dx + dy * dy);
            halo = container.getHalos().select("circle");
            // sanity checks and setting new halo radius
            if (!nodeIsRect) {
                defaultRadius = node.actualRadius() + offset;
                if (newRadius < defaultRadius) {
                    newRadius = defaultRadius;
                }
                halo.attr("r", newRadius);
            } else {
				defaultRadius = 0.5 * container.width();
                if (newRadius<defaultRadius)
                	newRadius=defaultRadius;
                halo.attr("r", newRadius);
            }
        } else { // node is in viewport , render original;
            // reset the halo to original radius
            defaultRadius = node.actualRadius() + 15;
            if (!nodeIsRect) {
                halo.attr("r", defaultRadius);
            } else { // this is rectangular node render as such
                halo = container.getHalos().select("rect");
                halo.classed("hidden", false);
                //halo.classed("searchResultB", true);
                //halo.classed("searchResultA", false);
                var aCircHalo = container.getHalos().select("circle");
                aCircHalo.classed("hidden", true);

                container.getHalos().select("rect").classed("hidden", false);
                container.getHalos().select("circle").classed("hidden", true);
            }
        }
    }

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

        updateHaloRadius();
	}

	/** Adjusts the containers current scale and position. */
	function zoomed() {
        var zoomEventByMWheel=false;
        if (d3.event.sourceEvent) {
            if (d3.event.sourceEvent.deltaY)
                zoomEventByMWheel=true;
        }

         if (zoomEventByMWheel===false){
             if (transformAnimation===true){
                 return;
             }
            zoomFactor = d3.event.scale;
            graphTranslation = d3.event.translate;
            graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
            updateHaloRadius();
            return;
		}
		/** animate the transition **/
        zoomFactor = d3.event.scale;
        graphTranslation = d3.event.translate;
        graphContainer.transition()
            .tween("attr.translate", function () {
                return function (t) {
                	transformAnimation=true;
                    var tr = d3.transform(graphContainer.attr("transform"));
                    graphTranslation[0] = tr.translate[0];
                    graphTranslation[1] = tr.translate[1];
                    zoomFactor=tr.scale[0];
                    updateHaloRadius();
                };
            })
			.each("end", function(){transformAnimation=false;})
            .attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")")
            .ease('linear')
			.duration(250);
	}// end of zoomed function

	/** Initializes the graph. */
	function initializeGraph() {
		options.graphContainerSelector(graphContainerSelector);
		var moved=false;
		force = d3.layout.force()
			.on("tick", recalculatePositions);

		dragBehaviour = d3.behavior.drag()
			.origin(function (d) {
				return d;
			})
			.on("dragstart", function (d) {
				d3.event.sourceEvent.stopPropagation(); // Prevent panning
				d.locked(true);
                moved=false;
			})
			.on("drag", function (d) {
				d.px = d3.event.x;
				d.py = d3.event.y;
				force.resume();
                updateHaloRadius();
                moved=true;
			})
			.on("dragend", function (d) {
				d.locked(false);
                var pnp=graph.options().pickAndPinModule();
                if (pnp.enabled()===true && moved===true){
                	if (d.id){ // node
                		pnp.handle(d,true);
					}
					if (d.property){
                		pnp.handle(d.property(),true);
					}
				}
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
		// window size
		var w=0.5*graph.options().width();
        var h=0.5*graph.options().height();
		// computing inital translation for the graph due tue the dynamic default zoom level
        var tx=w-defaultZoom*w;
        var ty=h-defaultZoom*h;
		zoom.translate([tx, ty])
			.scale(defaultZoom);
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
        pulseNodeIds=[];
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
	    locationId = 0;
        if (pulseNodeIds.length > 0) {
            d3.select("#locateSearchResult").classed("highlighted", true);
            d3.select("#locateSearchResult").node().title="Locate search term";
        }
        else {
            d3.select("#locateSearchResult").classed("highlighted", false);
            d3.select("#locateSearchResult").node().title="Nothing to locate, enter search term.";
        }

	};

    function transform(p,cx,cy) {
    	// one iteration step for the lacate target animation
		zoomFactor=graph.options().height()/ p[2];
        graphTranslation=[(cx - p[0] * zoomFactor),(cy - p[1] * zoomFactor)];
        updateHaloRadius();
        // update the values in case the user wants to break the animation
        zoom.translate(graphTranslation);
        zoom.scale(zoomFactor);
        return "translate(" + graphTranslation[0] + "," +  graphTranslation[1] + ")scale(" + zoomFactor + ")";
    }



    function targetLocationZoom(target) {
        // store the original information
        var cx=0.5*graph.options().width();
        var cy=0.5*graph.options().height();
        var cp=getWorldPosFromScreen(cx,cy,graphTranslation,zoomFactor);
        var sP=[cp.x,cp.y,graph.options().height()/zoomFactor];

        var zoomLevel=Math.max(defaultZoom+0.5*defaultZoom,defaultTargetZoom);
        var eP=[target.x,target.y,graph.options().height()/zoomLevel];
		var pos_intp=d3.interpolateZoom(sP,eP);

		var lenAnimation=pos_intp.duration;
		if (lenAnimation>2500){
			lenAnimation=2500;
		}

        graphContainer.attr("transform", transform(sP,cx,cy))
        	.transition()
            .duration(lenAnimation)
            .attrTween("transform", function() { return function(t) {
            	return transform(pos_intp(t),cx,cy); }; })
            .each("end", function() {
                graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
                zoom.translate(graphTranslation);
                zoom.scale(zoomFactor);
                updateHaloRadius();
            });
    }

    function getWorldPosFromScreen(x,y,translate,scale){
        var temp=scale[0];
        var xn,yn;
        if (temp) {
             xn = (x - translate[0]) / temp;
             yn = (y - translate[1]) / temp;
        }else{
             xn = (x - translate[0]) / scale;
             yn = (y - translate[1]) / scale;
		}
        return {x: xn, y: yn};
    }

    graph.locateSearchResult = function () {

        if (pulseNodeIds && pulseNodeIds.length > 0) {
            // move the center of the viewport to this location
			if (transformAnimation===true) return; // << prevents incrementing the location id if we are in an animation
            var node = force.nodes()[pulseNodeIds[locationId]];
            locationId++;
            locationId = locationId % pulseNodeIds.length;
            // pull the node in front
            if (node.id) {
            	node.foreground();
            }
            if (node.property){
            	node.property().foreground();
			}

			// locate it
            targetLocationZoom(node);
        }
    };

	graph.highLightNodes = function (nodeIdArray) {
		if (nodeIdArray.length === 0) {
			return; // nothing to highlight
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
        d3.select("#locateSearchResult").classed("highlighted", true);
        locationId = 0;
		updateHaloRadius();
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

		// Draw cardinality elements
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
		// reset the locate button and previously selected locations and other variables
		nodeArrayForPulse=[];
        pulseNodeIds = [];
        locationId=0;
		d3.select("#locateSearchResult").classed("highlighted", false);
        d3.select("#locateSearchResult").node().title="Nothing to locate, enter search term.";


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
		// resets the zoom and translation so we have an overview for the data;
		graph.reset();
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
