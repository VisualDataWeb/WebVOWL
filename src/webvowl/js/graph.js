var _ = require("lodash/core");
var math = require("./util/math")();
var linkCreator = require("./parsing/linkCreator")();
var elementTools = require("./util/elementTools")();
// add some maps for nodes and properties -- used for object generation
var nodePrototypeMap = require("./elements/nodes/nodeMap")();
var propertyPrototypeMap = require("./elements/properties/propertyMap")();
var classDragger= require("./classDragger")();
var rangeDragger= require("./rangeDragger")();
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
        transformAnimation = false,
        graphTranslation,
        graphUpdateRequired = false,
        pulseNodeIds = [],
        nodeArrayForPulse = [],
        nodeMap = [],
        locationId = 0,
        defaultZoom = 1.0,
        defaultTargetZoom = 0.8,
        global_dof = -1,
        touchDevice=false,
        last_touch_time,
        originalD3_dblClickFunction = null,
        originalD3_touchZoomFunction = null,

        // editing elements
        deleteGroupElement,
        addDataPropertyGroupElement,
        editContainer,
        draggerLayer = null,
        draggerObjectsArray = [],
        delayedHider,
        nodeFreezer,
        hoveredNodeElement = null,
        currentlySelectedNode=null,
        hoveredPropertyElement = null,
        draggingStarted=false,

        eP = 0, // id for new properties
        eN = 0, // id for new Nodes
        editMode=true,
        ignoreOtherHoverEvents=false,
        forceNotZooming=false,
        zoom;

    var NodePrototypeMap     = createLowerCasePrototypeMap(nodePrototypeMap);
    var PropertyPrototypeMap = createLowerCasePrototypeMap(propertyPrototypeMap);

    /** --------------------------------------------------------- **/
    /** -- getter and setter definitions                       -- **/
    /** --------------------------------------------------------- **/
    graph.getGlobalDOF = function () {
        return global_dof;
    };
    graph.setGlobalDOF = function (val) {
        global_dof = val;
    };

    graph.updateZoomSliderValueFromOutside = function () {
        graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
    };

    graph.setDefaultZoom = function (val) {
        defaultZoom = val;
        graph.reset();
        graph.options().zoomSlider().updateZoomSliderValue(defaultZoom);
    };
    graph.setTargetZoom = function (val) {
        defaultTargetZoom = val;
    };
    graph.graphOptions = function () {
        return options;
    };

    graph.scaleFactor = function () {
        return zoomFactor;
    };
    graph.translation = function () {
        return graphTranslation;
    };

    // Returns the visible nodes
    graph.graphNodeElements = function () {
        return nodeElements;
    };
    // Returns the visible Label Nodes
    graph.graphLabelElements = function () {
        return labelNodes;
    };

    graph.setSliderZoom = function (val) {

        var cx = 0.5 * graph.options().width();
        var cy = 0.5 * graph.options().height();
        var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
        var sP = [cp.x, cp.y, graph.options().height() / zoomFactor];
        var eP = [cp.x, cp.y, graph.options().height() / val];
        var pos_intp = d3.interpolateZoom(sP, eP);

        graphContainer.attr( "transform", transform(sP, cx, cy) )
            .transition()
            .duration(1)
            .attrTween("transform", function () {
                return function (t) {
                    return transform( pos_intp(t), cx, cy );
                };
            })
            .each("end", function () {
                graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
                zoom.translate( graphTranslation );
                zoom.scale( zoomFactor );
                graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
            });



    };


    graph.setZoom = function (value) {
        zoom.scale(value);
    };

    graph.setTranslation = function (translation) {
        zoom.translate([translation[0], translation[1]]);
    };

    graph.options = function () {
        return options;
    };
    // search functionality
    graph.getUpdateDictionary = function () {
        return parser.getDictionary();
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


    /** --------------------------------------------------------- **/
    /** graph / rendering  related functions                      **/
    /** --------------------------------------------------------- **/

    // Initializes the graph.
    function initializeGraph() {
        options.graphContainerSelector(graphContainerSelector);
        var moved = false;
        force = d3.layout.force()
            .on("tick", recalculatePositions);

        dragBehaviour = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", function (d) {
                d3.event.sourceEvent.stopPropagation(); // Prevent panning
                graph.ignoreOtherHoverEvents(true);
                if (d.type && d.type() === "Class_dragger") {
                    classDragger.mouseButtonPressed = true;
                    clearTimeout(delayedHider);
                    classDragger.selectedViaTouch(true);
                    d.parentNode().locked(true);
                    draggingStarted=true;
                } else if (d.type && d.type() === "Range_dragger") {
                    rangeDragger.mouseButtonPressed = true;
                    // clearTimeout(delayedHider);
                    // classDragger.selectedViaTouch(true);
                    // d.parentNode().locked(true);

                }



                else {
                    d.locked(true);
                    moved = false;
                }
            })
            .on("drag", function (d) {

                if (d.type && d.type() === "Class_dragger") {
                     classDragger.setPosition(d3.event.x, d3.event.y);
                } else if (d.type && d.type() === "Range_dragger") {
                    rangeDragger.setPosition(d3.event.x, d3.event.y);
                }

                else {
                    d.px = d3.event.x;
                    d.py = d3.event.y;
                    force.resume();
                    updateHaloRadius();
                    moved = true;
                    if (d.renderType && d.renderType()==="round"){
                        classDragger.setParentNode(d);
                    }

                }
            })
            .on("dragend", function (d) {
                graph.ignoreOtherHoverEvents(false);
                if (d.type && d.type() === "Class_dragger") {
                    var nX = classDragger.x;
                    var nY = classDragger.y;
                    clearTimeout(delayedHider);
                    classDragger.mouseButtonPressed = false;
                    classDragger.selectedViaTouch(false);
                    d.setParentNode(d.parentNode());

                    var draggeEndPos = [nX, nY];
                    var targetNode = graph.getTargetNode(draggeEndPos);
                    if (targetNode) {
                        createNewObjectProperty(d.parentNode(), targetNode);
                    }
                    if (touchDevice===false) {
                        editElementHoverOut();
                    }
                    draggingStarted=false;
                } else if (d.type && d.type() === "Range_dragger") {
                    console.log("TODO: change the range of this property!");
                    rangeDragger.mouseButtonPressed = false;
                }

                else {
                    d.locked(false);
                    var pnp = graph.options().pickAndPinModule();
                    if (pnp.enabled() === true && moved === true) {
                        if (d.id) { // node
                            pnp.handle(d, true);
                        }
                        if (d.property) {
                            pnp.handle(d.property(), true);
                        }
                    }
                }
            });

        // Apply the zooming factor.
        zoom = d3.behavior.zoom()
            .duration(150)
            .scaleExtent([options.minMagnification(), options.maxMagnification()])
            .on("zoom", zoomed);

        draggerObjectsArray.push(classDragger);
        draggerObjectsArray.push(rangeDragger);

    }

    graph.lazyRefresh=function(){
        redrawContent();
        recalculatePositions();
    };




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
                label.linkRangeIntersection=linkRangeIntersection;
                label.linkDomainIntersection=linkDomainIntersection;
                if (link.property().focused()===true){
                    console.log("update rangeDragger");
                    rangeDragger.updateElement();
                }
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

        if (hoveredNodeElement) {
            setDeleteHoverElementPosition(hoveredNodeElement);
            setAddDataPropertyHoverElementPosition(hoveredNodeElement);
            if (draggingStarted===false) {
                classDragger.setParentNode(hoveredNodeElement);
            }
        }
        if (hoveredPropertyElement) {
            setDeleteHoverElementPositionProperty(hoveredPropertyElement);
        }

        updateHaloRadius();
    }

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
            // add the
            console.log(clickedProperty.type());
            // We say that Datatype properties are not allowed to have domain range draggers
            if (clickedProperty.focused() && clickedProperty.type()!=="owl:DatatypeProperty"){
                console.log("SHOW Range Dragger");
                rangeDragger.setParentProperty(clickedProperty);
                rangeDragger.hideDragger(false);
                rangeDragger.addMouseEvents();
            }
            else{
                console.log("HIDE Range Dragger");
                rangeDragger.hideDragger(true);
            }
        });
    }

    /** Adjusts the containers current scale and position. */
    function zoomed() {
        if (forceNotZooming===true){
            zoom.translate(graphTranslation);
            zoom.scale(zoomFactor);
            return;
        }


        var zoomEventByMWheel = false;
        if (d3.event.sourceEvent) {
            if (d3.event.sourceEvent.deltaY) zoomEventByMWheel = true;
        }
        if (zoomEventByMWheel === false) {
            if (transformAnimation === true) {
                return;
            }
            zoomFactor = d3.event.scale;
            graphTranslation = d3.event.translate;
            graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
            updateHaloRadius();
            graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
            return;
        }
        /** animate the transition **/
        zoomFactor = d3.event.scale;
        graphTranslation = d3.event.translate;
        graphContainer.transition()
            .tween("attr.translate", function () {
                return function (t) {
                    transformAnimation = true;
                    var tr = d3.transform(graphContainer.attr("transform"));
                    graphTranslation[0] = tr.translate[0];
                    graphTranslation[1] = tr.translate[1];
                    zoomFactor = tr.scale[0];
                    updateHaloRadius();
                    graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
                };
            })
            .each("end", function () {
                transformAnimation = false;
            })
            .attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")")
            .ease('linear')
            .duration(250);
    }// end of zoomed function

    function redrawGraph() {
        remove();

        graphContainer = d3.selectAll(options.graphContainerSelector())
            .append("svg")
            .classed("vowlGraph", true)
            .attr("width", options.width())
            .attr("height", options.height())
            .call(zoom)
            .append("g");
        // add touch and double click functions

        var svgGraph=d3.selectAll(".vowlGraph");
        originalD3_dblClickFunction=svgGraph.on("dblclick.zoom");
        originalD3_touchZoomFunction=svgGraph.on("touchstart");
        svgGraph.on("touchstart",touchzoomed);
        if (editMode===true){
            svgGraph.on("dblclick.zoom", graph.modified_dblClickFunction);
        }
        else {
            svgGraph.on("dblclick.zoom", originalD3_dblClickFunction);
        }

    }

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

        // adding editing Elements
        var draggerPathLayer=graphContainer.append("g").classed("linkContainer", true);
        editContainer= graphContainer.append("g").classed("editContainer",true);
        draggerLayer=graphContainer.append("g").classed("editContainer",true);

        addDataPropertyGroupElement=editContainer.append('g')
            .classed("hidden-in-export", true)
            .classed("hidden", true)
            .classed("addDataPropertyElement",true)
            .attr("transform", "translate(" + 0 + "," + 0 + ")");


        addDataPropertyGroupElement.append("circle")
        // .classed("deleteElement", true)

            .attr("r", 12)
            .attr("cx", 0)
            .attr("cy", 0)
            .append("title").text("Add Datatype Property");

        addDataPropertyGroupElement.append("line")
        // .classed("deleteElementIcon ",true)
            .attr("x1", -8)
            .attr("y1", 0)
            .attr("x2", 8)
            .attr("y2", 0)
            .append("title").text("Add Datatype Property");

        addDataPropertyGroupElement.append("line")
        // .classed("deleteElementIcon",true)
            .attr("x1", 0)
            .attr("y1", -8)
            .attr("x2", 0)
            .attr("y2", 8)
            .append("title").text("Add Datatype Property");

        deleteGroupElement=editContainer.append('g')
            .classed("hidden-in-export", true)
            .classed("hidden", true)
            .classed("deleteParentElement",true)
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        deleteGroupElement.append("circle")
            .attr("r", 12)
            .attr("cx", 0)
            .attr("cy", 0)
            .append("title").text("Delete This Node");

        var crossLen=5;
        deleteGroupElement.append("line")
            .attr("x1", -crossLen)
            .attr("y1", -crossLen)
            .attr("x2", crossLen)
            .attr("y2", crossLen)
            .append("title").text("Delete This Node");

        deleteGroupElement.append("line")
            .attr("x1", crossLen)
            .attr("y1", -crossLen)
            .attr("x2", -crossLen)
            .attr("y2", crossLen)
            .append("title").text("Delete This Node");

        // Add an extra container for all markers
        markerContainer = linkContainer.append("defs");

        var drElement=draggerLayer.selectAll(".node")
            .data(draggerObjectsArray).enter()
            .append("g")
            .classed("node", true)
            .classed("hidden-in-export", true)
            .attr("id", function (d) {
                return d.id();
            })
            .call(dragBehaviour);
        drElement.each(function (node) {
            node.svgRoot(d3.select(this));
            node.svgPathLayer(draggerPathLayer);
            node.drawNode();
            node.hideDragger(true);
        });



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
            label.property().labelObject(label);
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

    function remove() {
        if (graphContainer) {
            // Select the parent element because the graph container is a group (e.g. for zooming)
            d3.select(graphContainer.node().parentNode).remove();
        }
    }

    initializeGraph(); // << call the initialization function

    graph.updateCanvasContainerSize = function () {
        if (graphContainer) {
                var svgElement = d3.selectAll(".vowlGraph");
                svgElement.attr("width", options.width());
                svgElement.attr("height", options.height());
                graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
            }
    };

    // Loads all settings, removes the old graph (if it exists) and draws a new one.
    graph.start = function () {
        force.stop();
        loadGraphData();
        redrawGraph();
        graph.update();
    };

    // Updates only the style of the graph.
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

    // Updates the graphs displayed data and style.
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
    // resetting the graph
    graph.reset = function () {
        // window size
        var w = 0.5 * graph.options().width();
        var h = 0.5 * graph.options().height();
        // computing initial translation for the graph due tue the dynamic default zoom level
        var tx = w - defaultZoom * w;
        var ty = h - defaultZoom * h;
        zoom.translate([tx, ty])
            .scale(defaultZoom);
    };


    graph.zoomOut = function () {

        var minMag = options.minMagnification(),
            maxMag = options.maxMagnification();
        var stepSize = (maxMag - minMag) / 10;
        var val = zoomFactor - stepSize;
        if (val < minMag) val = minMag;

        var cx = 0.5 * graph.options().width();
        var cy = 0.5 * graph.options().height();
        var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
        var sP = [cp.x, cp.y, graph.options().height() / zoomFactor];
        var eP = [cp.x, cp.y, graph.options().height() / val];
        var pos_intp = d3.interpolateZoom(sP, eP);

        graphContainer.attr("transform", transform(sP, cx, cy))
            .transition()
            .duration(250)
            .attrTween("transform", function () {
                return function (t) {
                    return transform(pos_intp(t), cx, cy);
                };
            })
            .each("end", function () {
                graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
                zoom.translate(graphTranslation);
                zoom.scale(zoomFactor);
                updateHaloRadius();
                options.zoomSlider().updateZoomSliderValue(zoomFactor);
            });

    };

    graph.zoomIn = function () {
        var minMag = options.minMagnification(),
            maxMag = options.maxMagnification();
        var stepSize = (maxMag - minMag) / 10;
        var val = zoomFactor + stepSize;
        if (val > maxMag) val = maxMag;
        var cx = 0.5 * graph.options().width();
        var cy = 0.5 * graph.options().height();
        var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
        var sP = [cp.x, cp.y, graph.options().height() / zoomFactor];
        var eP = [cp.x, cp.y, graph.options().height() / val];
        var pos_intp = d3.interpolateZoom(sP, eP);

        graphContainer.attr("transform", transform(sP, cx, cy))
            .transition()
            .duration(250)
            .attrTween("transform", function () {
                return function (t) {
                    return transform(pos_intp(t), cx, cy);
                };
            })
            .each("end", function () {
                graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
                zoom.translate(graphTranslation);
                zoom.scale(zoomFactor);
                updateHaloRadius();
                options.zoomSlider().updateZoomSliderValue(zoomFactor);
            });


    };

    /** --------------------------------------------------------- **/
    /** -- data related handling                               -- **/
    /** --------------------------------------------------------- **/

    // removes data when data could not be loaded
    graph.clearGraphData = function () {
        var sidebar = graph.options().sidebar();
        if (sidebar)
            sidebar.clearOntologyInformation();
        if (graphContainer)
            redrawGraph();
    };

    function generateDictionary(data) {
        var i;
        var originalDictionary = [];
        var nodes = data.nodes;
        for (i = 0; i < nodes.length; i++) {
            // check if node has a label
            if (nodes[i].labelForCurrentLanguage() !== undefined)
                originalDictionary.push(nodes[i]);
        }
        var props = data.properties;
        for (i = 0; i < props.length; i++) {
            if (props[i].labelForCurrentLanguage() !== undefined)
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
        nodeArrayForPulse = [];
        pulseNodeIds = [];
        locationId = 0;
        d3.select("#locateSearchResult").classed("highlighted", false);
        d3.select("#locateSearchResult").node().title = "Nothing to locate, enter search term.";


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
     //   graph.reset();
    }

    //Applies the data of the graph options object and parses it. The graph is not redrawn.
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
        for (var i = 0; i < classNodes.length; i++) {
            if (classNodes[i].setRectangularRepresentation)
                classNodes[i].setRectangularRepresentation(graph.options().rectangularRepresentation());
        }
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


    /** --------------------------------------------------------- **/
    /** -- force-layout related functions                      -- **/
    /** --------------------------------------------------------- **/
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

    // The label nodes are positioned randomly, because they are created from scratch if the data changes and lose
    // their position information. With this hack the position of old labels is copied to the new labels.
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

    // Applies all options that don't change the graph data.
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


    /** --------------------------------------------------------- **/
    /** -- halo and localization functions --                     **/
    /** --------------------------------------------------------- **/
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
                            if (name === searchString) computeDistanceToCenter(node);
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

    function getClickedScreenCoords(x, y, translate, scale) {
        var xn = (x - translate[0]) / scale;
        var yn = (y - translate[1]) / scale;
        return {x: xn, y: yn};
    }


    function computeDistanceToCenter(node, inverse) {
        var container = node;
        var w = graph.options().width();
        var h = graph.options().height();
        var posXY = getScreenCoords(node.x, node.y, graphTranslation, zoomFactor);

        var highlightOfInv = false;

        if (inverse && inverse === true) {
            highlightOfInv = true;
            posXY = getScreenCoords(node.x, node.y + 20, graphTranslation, zoomFactor);
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

        if (node.property && highlightOfInv === true) {
            rectHalo = node.property().inverse().getHalos().select("rect");
            rectHalo.classed("hidden", true);

            roundHalo = node.property().inverse().getHalos().select("circle");
            if (roundHalo.node() === null) {
                radius = node.property().inverse().width() + 15;

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
            if (highlightOfInv === true)
                dy = wY - node.y - 20;

            if (highlightOfInv === false && node.property && node.property().inverse())
                dy = wY - node.y + 20;

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
                if (newRadius < defaultRadius)
                    newRadius = defaultRadius;
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

    function transform(p, cx, cy) {
        // one iteration step for the locate target animation
        zoomFactor = graph.options().height() / p[2];
        graphTranslation = [(cx - p[0] * zoomFactor), (cy - p[1] * zoomFactor)];
        updateHaloRadius();
        // update the values in case the user wants to break the animation
        zoom.translate(graphTranslation);
        zoom.scale(zoomFactor);
        graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
        return "translate(" + graphTranslation[0] + "," + graphTranslation[1] + ")scale(" + zoomFactor + ")";
    }

    function targetLocationZoom(target) {
        // store the original information
        var cx = 0.5 * graph.options().width();
        var cy = 0.5 * graph.options().height();
        var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
        var sP = [cp.x, cp.y, graph.options().height() / zoomFactor];

        var zoomLevel = Math.max(defaultZoom + 0.5 * defaultZoom, defaultTargetZoom);
        var eP = [target.x, target.y, graph.options().height() / zoomLevel];
        var pos_intp = d3.interpolateZoom(sP, eP);

        var lenAnimation = pos_intp.duration;
        if (lenAnimation > 2500) {
            lenAnimation = 2500;
        }

        graphContainer.attr("transform", transform(sP, cx, cy))
            .transition()
            .duration(lenAnimation)
            .attrTween("transform", function () {
                return function (t) {
                    return transform(pos_intp(t), cx, cy);
                };
            })
            .each("end", function () {
                graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
                zoom.translate(graphTranslation);
                zoom.scale(zoomFactor);
                updateHaloRadius();
            });
    }

    function getWorldPosFromScreen(x, y, translate, scale) {
        var temp = scale[0], xn, yn;
        if (temp) {
            xn = (x - translate[0]) / temp;
            yn = (y - translate[1]) / temp;
        } else {
            xn = (x - translate[0]) / scale;
            yn = (y - translate[1]) / scale;
        }
        return {x: xn, y: yn};
    }

    graph.locateSearchResult = function () {
        if (pulseNodeIds && pulseNodeIds.length > 0) {
            // move the center of the viewport to this location
            if (transformAnimation === true) return; // << prevents incrementing the location id if we are in an animation
            var node = force.nodes()[pulseNodeIds[locationId]];
            locationId++;
            locationId = locationId % pulseNodeIds.length;
            if (node.id) node.foreground();
            if (node.property) node.property().foreground();

            targetLocationZoom(node);
        }
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
                    console.log("Checking for property");
                    if (pulseNodeIds.indexOf(forceId) === -1) {
                        pulseNodeIds.push(forceId);
                    }
                }
            }
        }
        locationId = 0;
        if (pulseNodeIds.length > 0) {
            d3.select("#locateSearchResult").classed("highlighted", true);
            d3.select("#locateSearchResult").node().title = "Locate search term";
        }
        else {
            d3.select("#locateSearchResult").classed("highlighted", false);
            d3.select("#locateSearchResult").node().title = "Nothing to locate, enter search term.";
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

        if (missedIds.length===nodeIdArray.length){

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
        if (missedIds.length===nodeIdArray.length){
            d3.select("#locateSearchResult").classed("highlighted", false);
        }
        else
        {
            d3.select("#locateSearchResult").classed("highlighted", true);
        }
        locationId = 0;
        updateHaloRadius();
    };

    graph.hideHalos=function(){
        var haloElements=d3.selectAll(".searchResultA,.searchResultB");
        haloElements.classed("hidden",true);
        return haloElements;
    };

    graph.forceRelocationEvent=function(){
        // we need to kill the halo to determine the bounding box;
        var halos=graph.hideHalos();
        var bbox=graphContainer.node().getBoundingClientRect();
        halos.classed("hidden",false);

        // get the graph coordinates
        var bboxOffset=50; // default radius of a node;
        var topLeft  = getWorldPosFromScreen(bbox.left,bbox.top,graphTranslation,zoomFactor);
        var botRight = getWorldPosFromScreen(bbox.right,bbox.bottom,graphTranslation,zoomFactor);
        var w = graph.options().width();
        var h = graph.options().height();

        topLeft.x  -= bboxOffset;
        topLeft.y  -= bboxOffset;
        botRight.x += bboxOffset;
        botRight.y += bboxOffset;

        var g_w = botRight.x-topLeft.x;
        var g_h = botRight.y-topLeft.y;

        // endpoint position calculations
        var posX = 0.5*(topLeft.x + botRight.x);
        var posY = 0.5*(topLeft.y + botRight.y);
        var cx   = 0.5 * w,
            cy   = 0.5 * h;
        var cp   = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);

        // zoom factor calculations and fail safes;
        var newZoomFactor;
        if ( w < h ) { newZoomFactor = w / g_w; }
        else         { newZoomFactor = h / g_h; }
        // fail saves
        if ( newZoomFactor > zoom.scaleExtent()[1] ) {
             newZoomFactor = zoom.scaleExtent()[1];
        }
        if ( newZoomFactor < zoom.scaleExtent()[0] ) {
             newZoomFactor = zoom.scaleExtent()[0];
        }

        // apply Zooming
        var sP = [cp.x, cp.y, h / zoomFactor];
        var eP = [posX, posY, h / newZoomFactor];

        var pos_intp = d3.interpolateZoom(sP, eP);
        var lenAnimation = pos_intp.duration;
        if (lenAnimation > 2500) {
            lenAnimation = 2500;
        }

        graphContainer.attr( "transform", transform(sP, cx, cy) )
            .transition()
            .duration(lenAnimation)
            .attrTween("transform", function () {
                return function (t) {
                    return transform( pos_intp(t), cx, cy );
                };
            })
        .each("end", function () {
            graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
            zoom.translate( graphTranslation );
            zoom.scale( zoomFactor );
            graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
        });
    };


    /** --------------------------------------------------------- **/
    /** -- VOWL EDITOR  create/ edit /delete functions --         **/
    /** --------------------------------------------------------- **/

    graph.changeNodeType=function(element){

        var typeString=d3.select("#typeEditor").node().value;
        var prototype= NodePrototypeMap.get(typeString.toLowerCase());
        var aNode = new prototype(graph);

        aNode.x = element.x;
        aNode.y = element.y;
        aNode.px = element.x;
        aNode.py = element.y;
        aNode.id(element.id());
        aNode.copyInformation(element);

        if (typeString==="owl:Thing") {
            aNode.label("Thing");
        }
        else{
            aNode.label("NewClass");
        }
        for (var i = 0; i < unfilteredData.properties.length; i++) {
            if (unfilteredData.properties[i].domain() === element) {
                unfilteredData.properties[i].toString();
                //            console.log("Updating Domain");
                unfilteredData.properties[i].domain(aNode);
            }
            if (unfilteredData.properties[i].range()  === element) {
                unfilteredData.properties[i].range( aNode);
                //          console.log("Updating Range");
                unfilteredData.properties[i].toString();
            }
        }
        unfilteredData.nodes.splice(unfilteredData.nodes.indexOf(element), 1);

        // very important thing for selection!;
        addNewNodeElement(aNode);
        // handle focuser!
        options.focuserModule().handle(aNode);

        element=null;

    };


    graph.changePropertyType=function(element){
        var typeString=d3.select("#typeEditor").node().value;

        // create warning
        if (sanityCheckProperty(element.domain(),element.range(),typeString)===false) return;

        var propPrototype=PropertyPrototypeMap.get(typeString.toLowerCase());
        var aProp= new propPrototype(graph);

        aProp.id(element.id());
        aProp.domain(element.domain());
        aProp.range(element.range());




        // // TODO: change its base IRI to proper value
        // var ontoIRI="http://someTest.de";
        // aProp.baseIri(ontoIRI);
        // aProp.iri(aProp.baseIri()+aProp.id());



        // add this to the data;
        unfilteredData.properties.push(aProp);
        unfilteredData.properties.splice(unfilteredData.properties.indexOf(element), 1);
        graph.update();
        if (element.labelObject() && aProp.labelObject()) {
            aProp.labelObject().x  = element.labelObject().x;
            aProp.labelObject().px = element.labelObject().px;
            aProp.labelObject().y  = element.labelObject().y;
            aProp.labelObject().py = element.labelObject().py;
        }

        options.focuserModule().handle(aProp);
        element=null;
    };


    graph.editorMode=function(val){
        if(!arguments.length) return editMode;
        else editMode=val;

        var svgGraph = d3.selectAll(".vowlGraph");
        if (editMode === true) {
            options.leftSidebar().showSidebar(1);
            options.leftSidebar().hideCollapseButton(false);
            svgGraph.on("dblclick.zoom", graph.modified_dblClickFunction);
        }else{
            svgGraph.on("dblclick.zoom",originalD3_dblClickFunction);
            options.leftSidebar().showSidebar(0);
            options.leftSidebar().hideCollapseButton(true);
        }

        options.sidebar().updateShowedInformation();
    };

    function createLowerCasePrototypeMap(prototypeMap) {
        return d3.map(prototypeMap.values(), function (Prototype) {
            return new Prototype().type().toLowerCase();
        });
    }

    function createNewNodeAtPosition(pos){
        var aNode,prototype;
        var forceUpdate=true;
        // create a node of that id;

        var typeToCreate=d3.select("#defaultClass").node().innerHTML;
        console.log("Want To create TYPE :"+typeToCreate);

        prototype= NodePrototypeMap.get(typeToCreate.toLowerCase());
        aNode = new prototype(graph);
        if (typeToCreate==="owl:Thing") {
            aNode.label("Thing");
        }
        else{
            aNode.label("NewClass");
        }

        console.log("CreateNOde Type TYPE :"+aNode.type());


        aNode.x = pos.x;
        aNode.y = pos.y;
        aNode.px = aNode.x;
        aNode.py = aNode.y;
        aNode.id("Class"+eN++);
        // aNode.paused(true);

        // aNode.baseIri(d3.select("#iriEditor").node().value);
        aNode.baseIri("http://someIRI.de/");
        aNode.iri(aNode.baseIri()+aNode.id());
        addNewNodeElement(aNode,forceUpdate);
        options.focuserModule().handle(aNode,true);
    }


    function addNewNodeElement(element){
        unfilteredData.nodes.push(element);
        generateDictionary(unfilteredData);
        graph.getUpdateDictionary();
        graph.update();
    }

    graph.getTargetNode = function (position) {
        var dx = position[0];
        var dy = position[1];
        var tN= null;
        var minDist = 1000000000000;
        // This is a bit OVERKILL for the computation of one node >> TODO: KD-TREE SEARCH
        unfilteredData.nodes.forEach(function (el) {
            var cDist = Math.sqrt((el.x - dx) * (el.x - dx) + (el.y - dy) * (el.y - dy));
            if (cDist < minDist) {
                minDist = cDist;
                tN = el;
            }
        });
        var offsetDist=hoveredNodeElement.actualRadius()+30;
        if (minDist > offsetDist) return null;
        if (tN.renderType() === "rect") return null;
        if (tN===hoveredNodeElement && minDist<=hoveredNodeElement.actualRadius()){
            return tN;
        }else if (tN===hoveredNodeElement && minDist>hoveredNodeElement.actualRadius()){
            return null;
        }
        return tN;
    };


    function sanityCheckProperty(domain,range,typeString){

        if (typeString==="owl:objectProperty" && graph.options().objectPropertyFilter().enabled()===true) {
            recalculatePositions();
            alert("Object properties are filtered out in the visualization!\nElement not created!");	// deselect
            return false;
        }

        if (typeString==="owl:disjointWith" && graph.options().disjointPropertyFilter().enabled()===true) {
            recalculatePositions();
            alert("owl:disjointWith properties are filtered out in the visualization!\nElement not created!");	// deselect
            return false;
        }

        if (domain===range && typeString!=="owl:objectProperty"){
            recalculatePositions();
            alert("owl:disjointWith or rdfs:subClassOf can not be created as loops (domain == range)\nElement not created!");	// deselect
            return false;
        }
        return true; // we can create a property

    }

    function createNewObjectProperty(domain,range){
        // check type of the property that we want to create;

        var defaultPropertyName=d3.select("#defaultProperty").node().innerHTML;
        console.log("WE want to create the Default Property"+ defaultPropertyName);



       if (sanityCheckProperty(domain,range,defaultPropertyName)===false) return;


        var propPrototype=PropertyPrototypeMap.get(defaultPropertyName.toLowerCase());
        var aProp= new propPrototype(graph);
        aProp.id("objectProperty"+eP++);
        aProp.domain(domain);
        aProp.range(range);
        aProp.label("newObjectProperty");
        // TODO: change its base IRI to proper value
        var ontoIRI="http://someTest.de";
        aProp.baseIri(ontoIRI);
        aProp.iri(aProp.baseIri()+aProp.id());


        var pX=0.49*(domain.x+range.x);
        var pY=0.49*(domain.y+range.y);

        // add this to the data;
        unfilteredData.properties.push(aProp);
        graph.update();
        aProp.labelObject().x =pX;
        aProp.labelObject().px=pX;
        aProp.labelObject().y =pY;
        aProp.labelObject().py=pY;
        domain.frozen(false);
        domain.locked(false);
        generateDictionary(unfilteredData);
        graph.getUpdateDictionary();

        options.focuserModule().handle(aProp);
        graph.activateHoverElementsForProperties(true,aProp,false);

    }

    graph.createDataTypeProperty = function (node) {
        // random postion issues;
        clearTimeout(nodeFreezer);
        // tells user when element is filtered out
        if (graph.options().datatypeFilter().enabled() === true) {
            recalculatePositions();
            alert("Datatype properties are filtered out in the visualization!\nElement not created!");	// deselect
            return;
        }


        var aNode, prototype;

        // create a default datatype Node >> HERE LITERAL;
        var defaultDatatypeName=d3.select("#defaultDatatype").node().innerHTML;
        if (defaultDatatypeName==="rdfs:Literal") {
            prototype = NodePrototypeMap.get("rdfs:literal");
            aNode = new prototype(graph);
            aNode.label("Literal");
            aNode.iri("http://www.w3.org/2000/01/rdf-schema#Literal");
            aNode.baseIri("http://www.w3.org/2000/01/rdf-schema#");
        }else {
            prototype = NodePrototypeMap.get("rdfs:datatype");
            aNode = new prototype(graph);
            var identifier="";
            if (defaultDatatypeName==="undefined"){
                identifier="undefined";
                aNode.label(identifier);
                // TODO : HANDLER FOR UNDEFINED DATATYPES!!<<<>>>>>>>>>>>..
                aNode.iri("http://www.undefinedDatatype.org/#"+identifier);
                aNode.baseIri("http://www.undefinedDatatype.org/#");
            }else{
                identifier=defaultDatatypeName.split(":")[1];
                aNode.label(identifier);
                aNode.iri("http://www.w3.org/2001/XMLSchema#"+identifier);
                aNode.baseIri("http://www.w3.org/2001/XMLSchema#");
            }
        }


        var nX = node.x - node.actualRadius() - 100;
        var nY = node.y + node.actualRadius() + 100;

        aNode.x = nX;
        aNode.y = nY;
        aNode.px = aNode.x;
        aNode.py = aNode.y;
        aNode.id("NodeId" + eN++);
        // add this property to the nodes;
        unfilteredData.nodes.push(aNode);


        // add also the datatype Property to it
        var propPrototype = PropertyPrototypeMap.get("owl:datatypeproperty");
        var aProp = new propPrototype(graph);
        aProp.id(eP++);

        // create the connection
        aProp.domain(node);
        aProp.range(aNode);
        aProp.label("newDatatypeProperty");


        // TODO: change its base IRI to proper value
        var ontoIRI="http://someTest.de";
        aProp.baseIri(ontoIRI);
        aProp.iri(ontoIRI+ "datatypeProperty" + aProp.id());
        // add this to the data;
        unfilteredData.properties.push(aProp);
        graph.update();
        generateDictionary(unfilteredData);
        graph.getUpdateDictionary();
        if (node)
            node.frozen(true);
        nodeFreezer = setTimeout(function () {
            if (node && node.frozen() === true && node.pinned() === false && graph.paused() === false) {
                node.frozen(false);
                node.locked(false);
            }
        }, 2000);
        options.focuserModule().handle(undefined);

    };

    graph.removeNodeViaEditor = function (node) {
        var propsToRemove = [];
        var nodesToRemove = [];
        nodesToRemove.push(node);
        for (var i = 0; i < unfilteredData.properties.length; i++) {
            if (unfilteredData.properties[i].domain() === node || unfilteredData.properties[i].range() === node) {
                propsToRemove.push(unfilteredData.properties[i]);
                if (unfilteredData.properties[i].type().toLocaleLowerCase() === "owl:datatypeproperty" &&
                    unfilteredData.properties[i].range() !== node) {
                    nodesToRemove.push(unfilteredData.properties[i].range());
                }
            }
        }
        // todo: throw alert if removing more than just one element
        var removedItems=propsToRemove.length+nodesToRemove.length;
        if (removedItems>2){
            if (confirm("Remove :\n"+propsToRemove.length + " properties\n"+nodesToRemove.length+" classes? ")===false){
                return;
            }else{
                // todo : store for undo delete button ;
            }
        }
        // splice them;
        for (i = 0; i < propsToRemove.length; i++) {
            unfilteredData.properties.splice(unfilteredData.properties.indexOf(propsToRemove[i]), 1);
            propsToRemove[i]=null;
        }
        for (i = 0; i < nodesToRemove.length; i++) {
            unfilteredData.nodes.splice(unfilteredData.nodes.indexOf(nodesToRemove[i]), 1);
            nodesToRemove[i]=null;
        }
        graph.update();
        options.focuserModule().handle(undefined);
        nodesToRemove=null;
        propsToRemove=null;

    };

    graph.removePropertyViaEditor = function (property) {
        if (property.type().toLocaleLowerCase() === "owl:datatypeproperty") {
            var datatype=property.range();
            unfilteredData.nodes.splice(unfilteredData.nodes.indexOf(property.range()), 1);
            datatype=null;
        }
        unfilteredData.properties.splice(unfilteredData.properties.indexOf(property), 1);
        hoveredPropertyElement = undefined;
        graph.update();
        generateDictionary(unfilteredData);
        graph.getUpdateDictionary();
        options.focuserModule().handle(undefined);
        property=null;
    };







    /** --------------------------------------------------------- **/
    /** -- animation functions for the nodes --                   **/
    /** --------------------------------------------------------- **/

    graph.animateDynamicLabelWidth=function() {
        // console.log("CALLING ANIMATE DYNAMIC LABEL WIDTH!");
        var wantedWidth = options.dynamicLabelWidth();
        var i;
        for (i = 0; i < classNodes.length; i++) {
            var nodeElement = classNodes[i];
            if (elementTools.isDatatype(nodeElement)) {
                nodeElement.animateDynamicLabelWidth(wantedWidth);
            }
        }
        for (i = 0; i < properties.length; i++) {
            properties[i].animateDynamicLabelWidth(wantedWidth);
        }
    };



    /** --------------------------------------------------------- **/
    /** -- Touch behaviour functions --                   **/
    /** --------------------------------------------------------- **/

    graph.setTouchDevice=function(val){
        touchDevice=val;
    };

    graph.modified_dblClickFunction=function() {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        // get position where we want to add the node;
        var grPos = getClickedScreenCoords(d3.event.clientX, d3.event.clientY, graph.translation(), graph.scaleFactor());
        createNewNodeAtPosition(grPos);
    };

    function touchzoomed(){
        forceNotZooming=true;
        console.log("calling touch zoomed function");

        var touch_time = d3.event.timeStamp;
        if (touch_time-last_touch_time < 500 && d3.event.touches.length===1) {
            d3.event.stopPropagation();

            if (editMode===true){
                //graph.modified_dblClickFunction();
                d3.event.preventDefault();
                d3.event.stopPropagation();
                zoom.translate(graphTranslation);
                zoom.scale(zoomFactor);
                graph.modified_dblTouchFunction();
            }
            else{
                forceNotZooming=false;
                if (originalD3_touchZoomFunction)
                    originalD3_touchZoomFunction();
            }
            return;
        }
        forceNotZooming=false;
        last_touch_time = touch_time;
        // TODO: WORK AROUND TO CHECK FOR ORIGINAL FUNCTION
        if (originalD3_touchZoomFunction)
            originalD3_touchZoomFunction();
    }

    graph.modified_dblTouchFunction=function(d){
        d3.event.stopPropagation();
        d3.event.preventDefault();
        var xy;
        if (editMode===true){
            xy=d3.touches(d3.selectAll(".vowlGraph").node());
        }
        var grPos=getClickedScreenCoords(xy[0][0],xy[0][1],graph.translation(),graph.scaleFactor());
        createNewNodeAtPosition(grPos);
    };

    /** --------------------------------------------------------- **/
    /** -- Hover and Selection functions, adding edit elements --  **/
    /** --------------------------------------------------------- **/

    graph.ignoreOtherHoverEvents = function (val) {
        if (!arguments.length) {
            return ignoreOtherHoverEvents;
        }
        else  ignoreOtherHoverEvents = val;
    };

    function delayedHiddingHoverElements(tbh) {
        if (tbh===true) return;
        if (hoveredNodeElement) {
            if (hoveredNodeElement.editingTextElement === true) return;
            delayedHider = setTimeout(function () {
                deleteGroupElement.classed("hidden", true);
                addDataPropertyGroupElement.classed("hidden", true);
                classDragger.hideDragger(true);
                if (hoveredNodeElement && hoveredNodeElement.pinned() === false && graph.paused() === false && hoveredNodeElement.editingTextElement === false) {
                    hoveredNodeElement.frozen(false);
                    hoveredNodeElement.locked(false);
                }
            }, 2000);
        }
        if (hoveredPropertyElement) {
            if (hoveredPropertyElement.editingTextElement === true) return;
            delayedHider = setTimeout(function () {
                deleteGroupElement.classed("hidden", true);
                addDataPropertyGroupElement.classed("hidden", true);
                classDragger.hideDragger(true);
                if (hoveredPropertyElement && hoveredPropertyElement.pinned() === false && graph.paused() === false && hoveredPropertyElement.editingTextElement === false) {
                    hoveredPropertyElement.frozen(false);
                    hoveredPropertyElement.locked(false);
                }
            }, 2000);
        }

    }

    function editElementHoverOnHidden(){
        classDragger.nodeElement.classed("classDraggerNodeHovered", true);
        classDragger.nodeElement.classed("classDraggerNode", false);
        editElementHoverOn();
    }

    function editElementHoverOutHidden(){
        classDragger.nodeElement.classed("classDraggerNodeHovered", false);
        classDragger.nodeElement.classed("classDraggerNode", true);
        editElementHoverOut();
    }

    function editElementHoverOn(){
        clearTimeout(delayedHider); // ignore touch behaviour
    }

    graph.killDelayedTimer=function () {
        clearTimeout(delayedHider);
        clearTimeout(nodeFreezer);
    };


    function editElementHoverOut(tbh){
        if (hoveredNodeElement) {
            if (graph.ignoreOtherHoverEvents() === true || tbh === true || hoveredNodeElement.editingTextElement === true) return;
            delayedHider = setTimeout(function () {
                deleteGroupElement.classed("hidden", true);
                addDataPropertyGroupElement.classed("hidden", true);
                classDragger.hideDragger(true);
                if (hoveredNodeElement && hoveredNodeElement.pinned() === false && graph.paused() === false) {
                    hoveredNodeElement.frozen(false);
                    hoveredNodeElement.locked(false);
                }

            }, 2000);
        }
        if (hoveredPropertyElement) {
            if (graph.ignoreOtherHoverEvents() === true || tbh === true || hoveredPropertyElement.editingTextElement === true) return;
            delayedHider = setTimeout(function () {
                deleteGroupElement.classed("hidden", true);
                addDataPropertyGroupElement.classed("hidden", true);
                classDragger.hideDragger(true);
                if (hoveredPropertyElement && hoveredPropertyElement.pinned() === false && graph.paused() === false) {
                    hoveredPropertyElement.frozen(false);
                    hoveredPropertyElement.locked(false);
                }

            }, 2000);
        }
    }
    graph.activateHoverElementsForProperties = function (val, property,inversed) {
        if (editMode === false) return; // nothing to do;


        if (val === true) {
            // make them visible
            // console.log("Property Highlighter");
            clearTimeout(delayedHider);
            hoveredPropertyElement = property;
            if (hoveredNodeElement) {
                if (hoveredNodeElement && hoveredNodeElement.pinned() === false && graph.paused() === false) {
                    hoveredNodeElement.frozen(false);
                    hoveredNodeElement.locked(false);
                }
            }
            hoveredNodeElement = undefined;
            deleteGroupElement.classed("hidden", false);
            setDeleteHoverElementPositionProperty(property,inversed);
            deleteGroupElement.selectAll("*").on("click", function () {
                graph.removePropertyViaEditor(property);
                d3.event.stopPropagation();
            });
            classDragger.hideDragger(true);
            addDataPropertyGroupElement.classed("hidden", true);
        }else{
            delayedHiddingHoverElements();
        }
    };

    function setAddDataPropertyHoverElementPosition(node) {
        var delX, delY = 0;
        if (node.renderType() === "round") {
            var scale = 0.5 * Math.sqrt(2.0);
            var oX = scale * node.actualRadius();
            var oY = scale * node.actualRadius();
            delX = node.x - oX;
            delY = node.y + oY;
            addDataPropertyGroupElement.attr("transform", "translate(" + delX + "," + delY + ")");
        }
    }

    function setDeleteHoverElementPosition(node) {
        var delX, delY = 0;
        if (node.renderType() === "round") {
            var scale = 0.5 * Math.sqrt(2.0);
            var oX = scale * node.actualRadius();
            var oY = scale * node.actualRadius();
            delX = node.x + oX;
            delY = node.y - oY;
        } else {
            delX = node.x + 0.5 * node.width() + 6;
            delY = node.y - 0.5 * node.height() - 6;
        }
        deleteGroupElement.attr("transform", "translate(" + delX + "," + delY + ")");
    }

    function setDeleteHoverElementPositionProperty(property,inversed) {
        if (property && property.labelObject()){
            var pos =[ property.labelObject().x,property.labelObject().y];
            var delX = pos[0] + 0.5 * property.width() + 6;
            var delY = pos[1] - 0.5 * property.height() - 6;
            if (inversed===true) {
                delY -= 12;
            }
            deleteGroupElement.attr("transform", "translate(" + delX + "," + delY + ")");
        }else{
            deleteGroupElement.classed("hidden",true);// hide when there is no property
        }


    }
    graph.activateHoverElements = function (val, node,touchBehaviour) {
        if (editMode === false){
            return; // nothing to do;
        }
        if (touchBehaviour===undefined) touchBehaviour=false;
        //    console.log("Selected Touch behaviour?"+touchBehaviour);
        if (val === true) {
            // make them visible
            clearTimeout(delayedHider);
            clearTimeout(nodeFreezer);
            if (hoveredNodeElement && node.pinned() === false && graph.paused()===false) {
                hoveredNodeElement.frozen(false);
            }
            hoveredNodeElement = node;
            if (node && node.frozen() === false && node.pinned() === false) {
                node.frozen(true);
            }
            hoveredPropertyElement = undefined;
            deleteGroupElement.classed("hidden", false);
            setDeleteHoverElementPosition(node);
            deleteGroupElement.on("click", function () {
                graph.removeNodeViaEditor(node);
                d3.event.stopPropagation();
            });

            deleteGroupElement.selectAll("*").on("click", function() {
                graph.removeNodeViaEditor(node);
                d3.event.stopPropagation();
            })
                .on("mouseover", function(){editElementHoverOn(node,touchBehaviour);})
                .on("mouseout", function(){editElementHoverOut(node,touchBehaviour);});

            addDataPropertyGroupElement.classed("hidden", true);
            classDragger.nodeElement.on("mouseover", editElementHoverOn)
                .on("mouseout", editElementHoverOut);
            classDragger.draggerObject.on("mouseover", editElementHoverOnHidden)
                .on("mouseout", editElementHoverOutHidden);

            // add the dragger element;
            if (node.renderType() === "round") {
                classDragger.svgRoot(draggerLayer);
                classDragger.setParentNode(node);
                classDragger.hideDragger(false);
                addDataPropertyGroupElement.classed("hidden", false);
                setAddDataPropertyHoverElementPosition(node);
                addDataPropertyGroupElement.selectAll("*").on("click", function () {
                    graph.createDataTypeProperty(node);
                    d3.event.stopPropagation();
                })
                    .on("mouseover", function(){
                        //      console.log("editElement Hover");
                        editElementHoverOn(node,touchBehaviour);})
                    .on("mouseout", function(){
                        //    console.log("editElement Hover OUT");
                        editElementHoverOut(node,touchBehaviour);});
            } else {
                classDragger.hideDragger(true);
            }
        }else {
            delayedHiddingHoverElements(node,touchBehaviour);
        }
    };



    return graph;
};
