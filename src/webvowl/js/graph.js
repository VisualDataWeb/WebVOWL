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
		zoom,
	// some helper
		positionContainer;

	/**
	 * Recalculates the positions of nodes, links, ... and updates them.
	 */
	function recalculatePositions() {
		// Set node positions
        // console.log("Tick positions ----------------------------------");
        // var fNodes=force.nodes();
        // labelNodes.forEach(function (labelNode) {
         //    for (var i = 0; i < fNodes.length; i++) {
         //        var oldNode = fNodes[i];
         //        if (oldNode.equals(labelNode)) {
        //
         //            var lNodeId=labelNode.property().id();
         //            var lNodeX=labelNode.x;
         //            var lNodeY=labelNode.y;
        //
        //
         //            var fNodeId=oldNode.property().id();
         //            var fNodeX=oldNode.x;
         //            var fNodeY=oldNode.y;
         //            console.log("lNode: ["+lNodeId+"] ["+lNodeX+"] ["+lNodeY+"]"
         //                + "\t\tfNode: ["+fNodeId+"] ["+fNodeX+"] ["+fNodeY+"]"
         //                //+ "velocity(): ["+oldNode.vx()+"] ["+oldNode.vy()+"]"
         //                + "velocity: ["+oldNode.vx+"] ["+oldNode.vy+"]"
         //            // + "velocity(n): ["+oldNode.vx(oldNode)+"] ["+oldNode.vy(oldNode)+"]"
         //            );
         //            //console.log("lNode: ["+lNodeId+"] ["+lNodeX+"] ["+lNodeY+"]"+"\t\tfNode: ["+fNodeId+"]"+"["+fNodeX+"]"+"["+fNodeY+"]");
         //            break;
         //        }
         //    }
        // });

		nodeElements.attr("transform", function (node) {
			return "translate(" + node.x + "," + node.y + ")";
		});

		// Set label group positions
		labelGroupElements.attr("transform", function (label) {
			 var position;

			//force centered positions on single-layered links
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

	}

	/**
	 * Adjusts the containers current scale and position.
	 */
	function zoomed() {
		graphContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
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
	// temporary modifications done by vitalis 
	//------------------------------------------------------------------------------
	/**
	 * Returns the visible nodes 
	 */
	graph.graphNodeElements=function(){
		return nodeElements
	};
	/**
	 * Returns the visible Label Nodes 
	 */
	graph.graphLabelElements=function(){
		return labelNodes
	};

	
	//------------------------------------------------------------------------------
	
	/**
	 * Loads all settings, removes the old graph (if it exists) and draws a new one.
	 */
	graph.start = function () {
		force.stop();
		loadGraphData();
		redrawGraph();
		graph.update();
	};

	/**
	 * Updates only the style of the graph.
	 */
	graph.updateStyle = function () {
		refreshGraphStyle();
		force.start();
	};

	graph.reload = function () {
		loadGraphData();
		this.update();
	};

	graph.initFunc=function(){
		console.log("Call of initFunc")
        this.reload();
        force.stop();

        // setting the visualizations;
         redrawContent();
         recalculatePositions();


        var fNodes=force.nodes();
        // for (var i=0;i<fNodes.length;i++){
        //     var n=fNodes[i];
        //     if (n.id){
        //         console.log("Init ClassNode forceNode "+n.id()+" position "+n.x+" "+n.y);
        //     }
        //     if (n.property){
        //         console.log("Init Label forceNode "+n.property().id()+" position "+n.x+" "+n.y);
        //     }
        //
        // }

        var labelPositions=parser.importedPropertyPositions();

        /*
        *
        * this can be optimized using for loop over the labelNodes
        * and setting the label.x = label.property().x << since we added x to property when we read it
        * todo : test if this is the case
        * */


        // Set label group positions
         if (labelPositions.length>0) {
             console.log("Found label positions in file (size): "+labelPositions.length);
             console.log("labelGroupElements size: "+labelNodes.length);

             for (var i=0;i<labelNodes.length;i++){
                 var label=labelNodes[i];
                 var lId=label.property().id();

                 for (var j=0;j<labelPositions.length;j++){
                     var lposId=labelPositions[j].id();
                     if (lId==lposId){
                         console.log("found corresponding position : "+lposId);

                         console.log("  ---  > old  Position: " +label.x+" "+label.y);
                        // console.log("prop Position: " +label.property().x+" "+label.property().y);
                         label.x=labelPositions[j].x;
                         label.y=labelPositions[j].y;
                         label.px=labelPositions[j].x;
                         label.py=labelPositions[j].y;
                         console.log("  ---  > new  Position: " +label.x+" "+label.y +
                             "  <should>: " +label.property().x+" "+label.property().y );
                         break;
                     }


                 }


             }


         }
             // labelGroupElements.attr("transform", function (label) {
             //     var position;
             //     var lId = label.property().id();
             //
             //     // force centered positions on single-layered links
             //     for (var i = 0; i < labelPositions.length; i++) {
             //         lpos = labelPositions[i];
             //         var lpId = lpos.id();
             //         if (lId == lpId) {
		 			//force centered positions on single-layered links
			// 			var link = label.link();
			// 			if (link.layers().length === 1 && !link.loops()) {
			// 				var doNothing=1;
			// 			} else {
			// 				label.x = lpos.x;
			// 				label.y = lpos.y;
			// 				position = label;
			// 				break;
			// 			}
        //
        //             }
        //         }
        //         return "translate(" + position.x + "," + position.y + ")";
        //     });
        // }



        //
        // // Set label group positions
        // if (labelPositions.length>0) {
        //     // TOD [das geht besser]
        //     console.log("Found Label Positions");
        //     for (var i=0;i<fNodes.length;i++){
        //         var n=fNodes[i];
        //         if (n.property){
        //             var nid=n.property().id();
        //             for (var j=0;j<labelPositions.length;j++) {
        //                 var lpos = labelPositions[j];
        //                 c1=nid;
        //                 c2=lpos.id();
        //                 if (c1 == c2) {
        //                     console.log("Setting new position Node: "+c1+" From " +n.x+" "+n.y+ "->"+lpos.x+" "+lpos.y);
        //                  //   n.x = lpos.x;
        //                  //   n.y = lpos.y;
        //                 }
        //             }
        //         }
        //     }
        // }




        //
        // console.log("----------------------------------");
        // var fNodes=force.nodes();
        // for (var i=0;i<fNodes.length;i++){
        //     var n=fNodes[i];
        //     if (n.id){
        //         console.log("Out ClassNode forceNode "+n.id()+" position "+n.x+" "+n.y);
        //     }
        //     if (n.property){
        //         console.log("Out Label forceNode "+n.property().id()+" position "+n.x+" "+n.y);
        //     }
        //
        // }



        // loadGraphData();
        // positionContainer=parser.importedNodePositions();
        // refreshGraphData();
        // refreshGraphStyle();
        // force.start();
        // force.stop();
        // recalculatePositions();
        // this.update();
        // force.stop();

		// get force nodes;


        recalculatePositions();
        force.start();
       //
       //  var fNodes=force.nodes();
       //  labelNodes.forEach(function (labelNode) {
       //      for (var i = 0; i < fNodes.length; i++) {
       //          var oldNode = fNodes[i];
       //          if (oldNode.equals(labelNode)) {
       //
       //              var lNodeId=labelNode.property().id();
       //              var lNodeX=labelNode.x;
       //              var lNodeY=labelNode.y;
       //
       //
       //              var fNodeId=oldNode.property().id();
       //              var fNodeX=oldNode.x;
       //              var fNodeY=oldNode.y;
       //
       //              console.log("lNode: ["+lNodeId+"] ["+lNodeX+"] ["+lNodeY+"]"
       //                     + "\t\tfNode: ["+fNodeId+"] ["+fNodeX+"] ["+fNodeY+"]"
       //                     //+ "velocity(): ["+oldNode.vx()+"] ["+oldNode.vy()+"]"
       //                     + "velocity: ["+oldNode.px+"] ["+oldNode.py+"]"
       //                    // + "velocity(n): ["+oldNode.vx(oldNode)+"] ["+oldNode.vy(oldNode)+"]"
       //              );
       //
       //              break;
       //          }
       //      }
       //  });
       // force.start();
   //
   //      var fNodes=force.nodes();
   //      labelNodes.forEach(function (labelNode) {
   //          for (var i = 0; i < fNodes.length; i++) {
   //              var oldNode = fNodes[i];
   //              if (oldNode.equals(labelNode)) {
   //
   //                var lNodeId=labelNode.property().id();
   //                var lNodeX=labelNode.x;
   //                var lNodeY=labelNode.y;
   //
   //
   //                var fNodeId=oldNode.property().id();
   //                var fNodeX=oldNode.x;
   //                var fNodeY=oldNode.y;
   //
   //                console.log("lNode: ["+lNodeId+"] ["+lNodeX+"] ["+lNodeY+"]"+"\t\tfNode: ["+fNodeId+"]"+"["+fNodeX+"]"+"["+fNodeY+"]");
   //                break;
   //              }
   //          }
   //      });

        // for (var i=0;i<fNodes.length;i++){
        //     var n=fNodes[i];
        //     if (n.id){
        //
        //         console.log("Out ClassNode forceNode "+n.id()+" position "+n.x+" "+n.y);
        //     }
        //     if (n.property){
        //         console.log("Out Label forceNode "+n.property().id()+" position "+n.x+" "+n.y
        //         +"prop:" + n.property.x +" "+n.property.y);
        //     }
        //
        // }

     //   force.start();
     //    console.log("Start ----------------------------------");
     //    var fNodes=force.nodes();
     //    for (var i=0;i<fNodes.length;i++){
     //        var n=fNodes[i];
     //        if (n.id){
     //            console.log("Out ClassNode forceNode "+n.id()+" position "+n.x+" "+n.y);
     //        }
     //        if (n.property){
     //            console.log("Out Label forceNode "+n.property().id()+" position "+n.x+" "+n.y
     //                +"prop:" + n.property.x +" "+n.property.y);
     //        }
     //
     //    }
     //
     //    force.tick();
     //    console.log("Tick ----------------------------------");
     //    var fNodes=force.nodes();
     //    for (var i=0;i<fNodes.length;i++){
     //        var n=fNodes[i];
     //        if (n.id){
     //            console.log("Out ClassNode forceNode "+n.id()+" position "+n.x+" "+n.y);
     //        }
     //        if (n.property){
     //            console.log("Out Label forceNode "+n.property().id()+" position "+n.x+" "+n.y
     //                +"prop:" + n.property.x +" "+n.property.y);
     //        }
     //
     //    }
     //
     //    force.stop();

    }
	
	graph.initNodePositions=function(){
		if (positionContainer.length==0) return;
		console.log("Calling Position initialization Function")
		console.log("positionContainer has Elements: "+positionContainer.length)
		
		
		nodesWithPos=force.nodes();
		for (var i=0;i<nodesWithPos.length;i++){
			n=nodesWithPos[i];
			if (n.id){
				//console.log("Inspecting Node: "+n.id());
				for (var j=0;j<positionContainer.length;j++){
					p=positionContainer[j];
					c1=n.id();
					c2=p.id();
					if (c1==c2){
						// 	set the position of the node
//						console.log("setting position of node "+n.id()
//								+" with posId"+p.id()+" from"+n.x+" "+n.y+" to "+p.px+" "+p.py);
						n.x=p.px;
						n.y=p.py;
						n.vx=0;
						n.vy=0;
						break;
					}
				}
			}
		}
	};
	
	/**
	 * Updates the graphs displayed data and style.
	 */
	graph.update = function () {
		refreshGraphData();
		refreshGraphStyle();
		force.start();
		redrawContent();
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
	 * Applies click listeneres to nodes and properties.
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
		}
		return graph;
	};


	return graph;
};
