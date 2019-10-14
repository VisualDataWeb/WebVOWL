var _ = require("lodash/core");
var math = require("./util/math")();
var linkCreator = require("./parsing/linkCreator")();
var elementTools = require("./util/elementTools")();
// add some maps for nodes and properties -- used for object generation
var nodePrototypeMap = require("./elements/nodes/nodeMap")();
var propertyPrototypeMap = require("./elements/properties/propertyMap")();


module.exports = function ( graphContainerSelector ){
  var graph = {},
    CARDINALITY_HDISTANCE = 20,
    CARDINALITY_VDISTANCE = 10,
    curveFunction = d3.svg.line()
      .x(function ( d ){
        return d.x;
      })
      .y(function ( d ){
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
    initialLoad = true,
    updateRenderingDuringSimulation = false,
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
    zoomFactor = 1.0,
    centerGraphViewOnLoad = false,
    transformAnimation = false,
    graphTranslation = [0, 0],
    graphUpdateRequired = false,
    pulseNodeIds = [],
    nodeArrayForPulse = [],
    nodeMap = [],
    locationId = 0,
    defaultZoom = 1.0,
    defaultTargetZoom = 0.8,
    global_dof = -1,
    touchDevice = false,
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
    currentlySelectedNode = null,
    hoveredPropertyElement = null,
    draggingStarted = false,
    frozenDomainForPropertyDragger,
    frozenRangeForPropertyDragger,
    
    eP = 0, // id for new properties
    eN = 0, // id for new Nodes
    editMode = true,
    debugContainer = d3.select("#FPS_Statistics"),
    finishedLoadingSequence = false,
    
    ignoreOtherHoverEvents = false,
    forceNotZooming = false,
    now, then, // used for fps computation
    showFPS = false,
    seenEditorHint = false,
    seenFilterWarning = false,
    showFilterWarning = false,
    
    keepDetailsCollapsedOnLoading = true,
    adjustingGraphSize = false,
    showReloadButtonAfterLayoutOptimization = false,
    zoom;
  //var prefixModule=require("./prefixRepresentationModule")(graph);
  var NodePrototypeMap = createLowerCasePrototypeMap(nodePrototypeMap);
  var PropertyPrototypeMap = createLowerCasePrototypeMap(propertyPrototypeMap);
  var classDragger = require("./classDragger")(graph);
  var rangeDragger = require("./rangeDragger")(graph);
  var domainDragger = require("./domainDragger")(graph);
  var shadowClone = require("./shadowClone")(graph);
  
  graph.math = function (){
    return math;
  };
  /** --------------------------------------------------------- **/
  /** -- getter and setter definitions                       -- **/
  /** --------------------------------------------------------- **/
  graph.isEditorMode = function (){
    return editMode;
  };
  graph.getGlobalDOF = function (){
    return global_dof;
  };
  graph.setGlobalDOF = function ( val ){
    global_dof = val;
  };
  
  graph.updateZoomSliderValueFromOutside = function (){
    graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
  };
  
  graph.setDefaultZoom = function ( val ){
    defaultZoom = val;
    graph.reset();
    graph.options().zoomSlider().updateZoomSliderValue(defaultZoom);
  };
  graph.setTargetZoom = function ( val ){
    defaultTargetZoom = val;
  };
  graph.graphOptions = function (){
    return options;
  };
  
  graph.scaleFactor = function (){
    return zoomFactor;
  };
  graph.translation = function (){
    return graphTranslation;
  };
  
  // Returns the visible nodes
  graph.graphNodeElements = function (){
    return nodeElements;
  };
  // Returns the visible Label Nodes
  graph.graphLabelElements = function (){
    return labelNodes;
  };
  
  graph.graphLinkElements = function (){
    return links;
  };
  
  graph.setSliderZoom = function ( val ){
    
    var cx = 0.5 * graph.options().width();
    var cy = 0.5 * graph.options().height();
    var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
    var sP = [cp.x, cp.y, graph.options().height() / zoomFactor];
    var eP = [cp.x, cp.y, graph.options().height() / val];
    var pos_intp = d3.interpolateZoom(sP, eP);
    
    graphContainer.attr("transform", transform(sP, cx, cy))
      .transition()
      .duration(1)
      .attrTween("transform", function (){
        return function ( t ){
          return transform(pos_intp(t), cx, cy);
        };
      })
      .each("end", function (){
        graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
        zoom.translate(graphTranslation);
        zoom.scale(zoomFactor);
        graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
      });
  };
  
  
  graph.setZoom = function ( value ){
    zoom.scale(value);
  };
  
  graph.setTranslation = function ( translation ){
    zoom.translate([translation[0], translation[1]]);
  };
  
  graph.options = function (){
    return options;
  };
  // search functionality
  graph.getUpdateDictionary = function (){
    return parser.getDictionary();
  };
  
  graph.language = function ( newLanguage ){
    if ( !arguments.length ) return language;
    
    // Just update if the language changes
    if ( language !== newLanguage ) {
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
  function initializeGraph(){
    
    options.graphContainerSelector(graphContainerSelector);
    var moved = false;
    force = d3.layout.force()
      .on("tick", hiddenRecalculatePositions);
    
    dragBehaviour = d3.behavior.drag()
      .origin(function ( d ){
        return d;
      })
      .on("dragstart", function ( d ){
        d3.event.sourceEvent.stopPropagation(); // Prevent panning
        graph.ignoreOtherHoverEvents(true);
        if ( d.type && d.type() === "Class_dragger" ) {
          classDragger.mouseButtonPressed = true;
          clearTimeout(delayedHider);
          classDragger.selectedViaTouch(true);
          d.parentNode().locked(true);
          draggingStarted = true;
        } else if ( d.type && d.type() === "Range_dragger" ) {
          graph.ignoreOtherHoverEvents(true);
          clearTimeout(delayedHider);
          frozenDomainForPropertyDragger = shadowClone.parentNode().domain();
          frozenRangeForPropertyDragger = shadowClone.parentNode().range();
          shadowClone.setInitialPosition();
          shadowClone.hideClone(false);
          shadowClone.hideParentProperty(true);
          shadowClone.updateElement();
          deleteGroupElement.classed("hidden", true);
          addDataPropertyGroupElement.classed("hidden", true);
          frozenDomainForPropertyDragger.frozen(true);
          frozenDomainForPropertyDragger.locked(true);
          frozenRangeForPropertyDragger.frozen(true);
          frozenRangeForPropertyDragger.locked(true);
          domainDragger.updateElement();
          domainDragger.mouseButtonPressed = true;
          rangeDragger.updateElement();
          rangeDragger.mouseButtonPressed = true;
          //  shadowClone.setPosition(d.x, d.y);
          
          
        } else if ( d.type && d.type() === "Domain_dragger" ) {
          graph.ignoreOtherHoverEvents(true);
          clearTimeout(delayedHider);
          frozenDomainForPropertyDragger = shadowClone.parentNode().domain();
          frozenRangeForPropertyDragger = shadowClone.parentNode().range();
          shadowClone.setInitialPosition();
          shadowClone.hideClone(false);
          shadowClone.hideParentProperty(true);
          shadowClone.updateElement();
          deleteGroupElement.classed("hidden", true);
          addDataPropertyGroupElement.classed("hidden", true);
          
          frozenDomainForPropertyDragger.frozen(true);
          frozenDomainForPropertyDragger.locked(true);
          frozenRangeForPropertyDragger.frozen(true);
          frozenRangeForPropertyDragger.locked(true);
          domainDragger.updateElement();
          domainDragger.mouseButtonPressed = true;
          rangeDragger.updateElement();
          rangeDragger.mouseButtonPressed = true;
        }
        else {
          d.locked(true);
          moved = false;
        }
      })
      .on("drag", function ( d ){
        
        if ( d.type && d.type() === "Class_dragger" ) {
          clearTimeout(delayedHider);
          classDragger.setPosition(d3.event.x, d3.event.y);
        } else if ( d.type && d.type() === "Range_dragger" ) {
          clearTimeout(delayedHider);
          rangeDragger.setPosition(d3.event.x, d3.event.y);
          shadowClone.setPosition(d3.event.x, d3.event.y);
          domainDragger.updateElementViaRangeDragger(d3.event.x, d3.event.y);
        }
        else if ( d.type && d.type() === "Domain_dragger" ) {
          clearTimeout(delayedHider);
          domainDragger.setPosition(d3.event.x, d3.event.y);
          shadowClone.setPositionDomain(d3.event.x, d3.event.y);
          rangeDragger.updateElementViaDomainDragger(d3.event.x, d3.event.y);
        }
        
        else {
          d.px = d3.event.x;
          d.py = d3.event.y;
          force.resume();
          updateHaloRadius();
          moved = true;
          if ( d.renderType && d.renderType() === "round" ) {
            classDragger.setParentNode(d);
          }
          
        }
      })
      .on("dragend", function ( d ){
        graph.ignoreOtherHoverEvents(false);
        if ( d.type && d.type() === "Class_dragger" ) {
          var nX = classDragger.x;
          var nY = classDragger.y;
          clearTimeout(delayedHider);
          classDragger.mouseButtonPressed = false;
          classDragger.selectedViaTouch(false);
          d.setParentNode(d.parentNode());
          
          var draggerEndPos = [nX, nY];
          var targetNode = graph.getTargetNode(draggerEndPos);
          if ( targetNode ) {
            createNewObjectProperty(d.parentNode(), targetNode, draggerEndPos);
          }
          if ( touchDevice === false ) {
            editElementHoverOut();
          }
          draggingStarted = false;
        } else if ( d.type && d.type() === "Range_dragger" ) {
          graph.ignoreOtherHoverEvents(false);
          frozenDomainForPropertyDragger.frozen(false);
          frozenDomainForPropertyDragger.locked(false);
          frozenRangeForPropertyDragger.frozen(false);
          frozenRangeForPropertyDragger.locked(false);
          rangeDragger.mouseButtonPressed = false;
          domainDragger.mouseButtonPressed = false;
          domainDragger.updateElement();
          rangeDragger.updateElement();
          shadowClone.hideClone(true);
          var rX = rangeDragger.x;
          var rY = rangeDragger.y;
          var rangeDraggerEndPos = [rX, rY];
          var targetRangeNode = graph.getTargetNode(rangeDraggerEndPos);
          if ( elementTools.isDatatype(targetRangeNode) === true ) {
            targetRangeNode = null;
            console.log("---------------TARGET NODE IS A DATATYPE/ LITERAL ------------");
          }
          
          if ( targetRangeNode === null ) {
            d.reDrawEverthing();
            shadowClone.hideParentProperty(false);
          }
          else {
            d.updateRange(targetRangeNode);
            graph.update();
            shadowClone.hideParentProperty(false);
          }
        } else if ( d.type && d.type() === "Domain_dragger" ) {
          graph.ignoreOtherHoverEvents(false);
          frozenDomainForPropertyDragger.frozen(false);
          frozenDomainForPropertyDragger.locked(false);
          frozenRangeForPropertyDragger.frozen(false);
          frozenRangeForPropertyDragger.locked(false);
          rangeDragger.mouseButtonPressed = false;
          domainDragger.mouseButtonPressed = false;
          domainDragger.updateElement();
          rangeDragger.updateElement();
          shadowClone.hideClone(true);
          
          var dX = domainDragger.x;
          var dY = domainDragger.y;
          var domainDraggerEndPos = [dX, dY];
          var targetDomainNode = graph.getTargetNode(domainDraggerEndPos);
          if ( elementTools.isDatatype(targetDomainNode) === true ) {
            targetDomainNode = null;
            console.log("---------------TARGET NODE IS A DATATYPE/ LITERAL ------------");
          }
          shadowClone.hideClone(true);
          if ( targetDomainNode === null ) {
            d.reDrawEverthing();
            shadowClone.hideParentProperty(false);
          }
          else {
            d.updateDomain(targetDomainNode);
            graph.update();
            shadowClone.hideParentProperty(false);
          }
        }
        
        else {
          d.locked(false);
          var pnp = graph.options().pickAndPinModule();
          if ( pnp.enabled() === true && moved === true ) {
            if ( d.id ) { // node
              pnp.handle(d, true);
            }
            if ( d.property ) {
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
    draggerObjectsArray.push(domainDragger);
    draggerObjectsArray.push(shadowClone);
    force.stop();
  }
  
  graph.lazyRefresh = function (){
    redrawContent();
    recalculatePositions();
  };
  
  graph.adjustingGraphSize = function ( val ){
    adjustingGraphSize = val;
  };
  
  graph.showReloadButtonAfterLayoutOptimization = function ( show ){
    showReloadButtonAfterLayoutOptimization = show;
  };
  
  
  function hiddenRecalculatePositions(){
    finishedLoadingSequence = false;
    if ( graph.options().loadingModule().successfullyLoadedOntology() === false ) {
      force.stop();
      d3.select("#progressBarValue").node().innerHTML = "";
      graph.updateProgressBarMode();
      graph.options().loadingModule().showErrorDetailsMessage(hiddenRecalculatePositions);
      if ( keepDetailsCollapsedOnLoading && adjustingGraphSize === false ) {
        graph.options().loadingModule().collapseDetails("hiddenRecalculatePositions");
      }
      return;
    }
    if ( updateRenderingDuringSimulation === false ) {
      var value = 1.0 - 10 * force.alpha();
      var percent = parseInt(200 * value) + "%";
      graph.options().loadingModule().setPercentValue(percent);
      d3.select("#progressBarValue").style("width", percent);
      d3.select("#progressBarValue").node().innerHTML = percent;
      
      if ( value > 0.49 ) {
        updateRenderingDuringSimulation = true;
        // show graph container;
        if ( graphContainer ) {
          graphContainer.style("opacity", "1");
          percent = "100%";
          d3.select("#progressBarValue").style("width", percent);
          d3.select("#progressBarValue").node().innerHTML = percent;
          graph.options().ontologyMenu().append_message_toLastBulletPoint("done");
          d3.select("#reloadCachedOntology").classed("hidden", !showReloadButtonAfterLayoutOptimization);
          if ( showFilterWarning === true && seenFilterWarning === false ) {
            graph.options().warningModule().showFilterHint();
            seenFilterWarning = true;
          }
        }
        
        if ( initialLoad ) {
          if ( graph.paused() === false )
            force.resume(); // resume force
          initialLoad = false;
          
        }
        
        
        finishedLoadingSequence = true;
        if ( showFPS === true ) {
          force.on("tick", recalculatePositionsWithFPS);
          recalculatePositionsWithFPS();
        }
        else {
          force.on("tick", recalculatePositions);
          recalculatePositions();
        }
        
        if ( centerGraphViewOnLoad === true && force.nodes().length > 0 ) {
          if ( force.nodes().length < 10 ) graph.forceRelocationEvent(true); // uses dynamic zoomer;
          else graph.forceRelocationEvent();
          centerGraphViewOnLoad = false;
          // console.log("--------------------------------------")
        }
        
        
        graph.showEditorHintIfNeeded();
        
        if ( graph.options().loadingModule().missingImportsWarning() === false ) {
          graph.options().loadingModule().hideLoadingIndicator();
          graph.options().ontologyMenu().append_bulletPoint("Successfully loaded ontology");
          graph.options().loadingModule().setSuccessful();
        } else {
          graph.options().loadingModule().showWarningDetailsMessage();
          graph.options().ontologyMenu().append_bulletPoint("Loaded ontology with warnings");
        }
      }
    }
  }
  
  graph.showEditorHintIfNeeded = function (){
    if ( seenEditorHint === false && editMode === true ) {
      seenEditorHint = true;
      graph.options().warningModule().showEditorHint();
    }
  };
  
  graph.setForceTickFunctionWithFPS = function (){
    showFPS = true;
    if ( force && finishedLoadingSequence === true ) {
      force.on("tick", recalculatePositionsWithFPS);
    }
    
  };
  graph.setDefaultForceTickFunction = function (){
    showFPS = false;
    if ( force && finishedLoadingSequence === true ) {
      force.on("tick", recalculatePositions);
    }
  };
  function recalculatePositionsWithFPS(){
    // compute the fps
    
    recalculatePositions();
    now = Date.now();
    var diff = now - then;
    var fps = (1000 / (diff)).toFixed(2);
    
    debugContainer.node().innerHTML = "FPS: " + fps + "<br>" + "Nodes: " + force.nodes().length + "<br>" + "Links: " + force.links().length;
    then = Date.now();
    
  }
  
  function recalculatePositions(){
    // Set node positions
    
    
    // add switch for edit mode to make this faster;
    if ( !editMode ) {
      nodeElements.attr("transform", function ( node ){
        return "translate(" + node.x + "," + node.y + ")";
      });
      
      // Set label group positions
      labelGroupElements.attr("transform", function ( label ){
        var position;
        
        // force centered positions on single-layered links
        var link = label.link();
        if ( link.layers().length === 1 && !link.loops() ) {
          var linkDomainIntersection = math.calculateIntersection(link.range(), link.domain(), 0);
          var linkRangeIntersection = math.calculateIntersection(link.domain(), link.range(), 0);
          position = math.calculateCenter(linkDomainIntersection, linkRangeIntersection);
          label.x = position.x;
          label.y = position.y;
        }
        return "translate(" + label.x + "," + label.y + ")";
      });
      // Set link paths and calculate additional information
      linkPathElements.attr("d", function ( l ){
        if ( l.isLoop() ) {
          return math.calculateLoopPath(l);
        }
        var curvePoint = l.label();
        var pathStart = math.calculateIntersection(curvePoint, l.domain(), 1);
        var pathEnd = math.calculateIntersection(curvePoint, l.range(), 1);
        
        return curveFunction([pathStart, curvePoint, pathEnd]);
      });
      
      // Set cardinality positions
      cardinalityElements.attr("transform", function ( property ){
        
        var label = property.link().label(),
          pos = math.calculateIntersection(label, property.range(), CARDINALITY_HDISTANCE),
          normalV = math.calculateNormalVector(label, property.range(), CARDINALITY_VDISTANCE);
        
        return "translate(" + (pos.x + normalV.x) + "," + (pos.y + normalV.y) + ")";
      });
      
      
      updateHaloRadius();
      return;
    }
    
    // TODO: this is Editor redraw function // we need to make this faster!!
    
    
    nodeElements.attr("transform", function ( node ){
      return "translate(" + node.x + "," + node.y + ")";
    });
    
    // Set label group positions
    labelGroupElements.attr("transform", function ( label ){
      var position;
      
      // force centered positions on single-layered links
      var link = label.link();
      if ( link.layers().length === 1 && !link.loops() ) {
        var linkDomainIntersection = math.calculateIntersection(link.range(), link.domain(), 0);
        var linkRangeIntersection = math.calculateIntersection(link.domain(), link.range(), 0);
        position = math.calculateCenter(linkDomainIntersection, linkRangeIntersection);
        label.x = position.x;
        label.y = position.y;
        label.linkRangeIntersection = linkRangeIntersection;
        label.linkDomainIntersection = linkDomainIntersection;
        if ( link.property().focused() === true || hoveredPropertyElement !== undefined ) {
          rangeDragger.updateElement();
          domainDragger.updateElement();
          // shadowClone.setPosition(link.property().range().x,link.property().range().y);
          // shadowClone.setPositionDomain(link.property().domain().x,link.property().domain().y);
        }
      } else {
        label.linkDomainIntersection = math.calculateIntersection(link.label(), link.domain(), 0);
        label.linkRangeIntersection = math.calculateIntersection(link.label(), link.range(), 0);
        if ( link.property().focused() === true || hoveredPropertyElement !== undefined ) {
          rangeDragger.updateElement();
          domainDragger.updateElement();
          // shadowClone.setPosition(link.property().range().x,link.property().range().y);
          // shadowClone.setPositionDomain(link.property().domain().x,link.property().domain().y);
        }
        
      }
      return "translate(" + label.x + "," + label.y + ")";
    });
    // Set link paths and calculate additional information
    linkPathElements.attr("d", function ( l ){
      if ( l.isLoop() ) {
        
        var ptrAr = math.getLoopPoints(l);
        l.label().linkRangeIntersection = ptrAr[1];
        l.label().linkDomainIntersection = ptrAr[0];
        
        if ( l.property().focused() === true || hoveredPropertyElement !== undefined ) {
          rangeDragger.updateElement();
          domainDragger.updateElement();
        }
        return math.calculateLoopPath(l);
      }
      var curvePoint = l.label();
      var pathStart = math.calculateIntersection(curvePoint, l.domain(), 1);
      var pathEnd = math.calculateIntersection(curvePoint, l.range(), 1);
      l.linkRangeIntersection = pathStart;
      l.linkDomainIntersection = pathEnd;
      if ( l.property().focused() === true || hoveredPropertyElement !== undefined ) {
        domainDragger.updateElement();
        rangeDragger.updateElement();
        // shadowClone.setPosition(l.property().range().x,l.property().range().y);
        // shadowClone.setPositionDomain(l.property().domain().x,l.property().domain().y);
      }
      return curveFunction([pathStart, curvePoint, pathEnd]);
    });
    
    // Set cardinality positions
    cardinalityElements.attr("transform", function ( property ){
      
      var label = property.link().label(),
        pos = math.calculateIntersection(label, property.range(), CARDINALITY_HDISTANCE),
        normalV = math.calculateNormalVector(label, property.range(), CARDINALITY_VDISTANCE);
      
      return "translate(" + (pos.x + normalV.x) + "," + (pos.y + normalV.y) + ")";
    });
    
    if ( hoveredNodeElement ) {
      setDeleteHoverElementPosition(hoveredNodeElement);
      setAddDataPropertyHoverElementPosition(hoveredNodeElement);
      if ( draggingStarted === false ) {
        classDragger.setParentNode(hoveredNodeElement);
      }
    }
    if ( hoveredPropertyElement ) {
      setDeleteHoverElementPositionProperty(hoveredPropertyElement);
    }
    
    updateHaloRadius();
  }
  
  graph.updatePropertyDraggerElements = function ( property ){
    if ( property.type() !== "owl:DatatypeProperty" ) {
      
      shadowClone.setParentProperty(property);
      rangeDragger.setParentProperty(property);
      rangeDragger.hideDragger(false);
      rangeDragger.addMouseEvents();
      domainDragger.setParentProperty(property);
      domainDragger.hideDragger(false);
      domainDragger.addMouseEvents();
      
    }
    else {
      rangeDragger.hideDragger(true);
      domainDragger.hideDragger(true);
      shadowClone.hideClone(true);
    }
  };
  
  function addClickEvents(){
    function executeModules( selectedElement ){
      options.selectionModules().forEach(function ( module ){
        module.handle(selectedElement);
      });
    }
    
    nodeElements.on("click", function ( clickedNode ){
      
      // manaual double clicker // helper for iphone 6 etc...
      if ( touchDevice === true && doubletap() === true ) {
        d3.event.stopPropagation();
        if ( editMode === true ) {
          clickedNode.raiseDoubleClickEdit(defaultIriValue(clickedNode));
        }
      }
      else {
        executeModules(clickedNode);
      }
    });
    
    nodeElements.on("dblclick", function ( clickedNode ){
      
      d3.event.stopPropagation();
      if ( editMode === true ) {
        clickedNode.raiseDoubleClickEdit(defaultIriValue(clickedNode));
      }
    });
    
    labelGroupElements.selectAll(".label").on("click", function ( clickedProperty ){
      executeModules(clickedProperty);
      
      // this is for enviroments that do not define dblClick function;
      if ( touchDevice === true && doubletap() === true ) {
        d3.event.stopPropagation();
        if ( editMode === true ) {
          clickedProperty.raiseDoubleClickEdit(defaultIriValue(clickedProperty));
        }
      }
      
      // currently removed the selection of an element to invoke the dragger
      // if (editMode===true && clickedProperty.editingTextElement!==true) {
      //     return;
      //      // We say that Datatype properties are not allowed to have domain range draggers
      //      if (clickedProperty.focused() && clickedProperty.type() !== "owl:DatatypeProperty") {
      //          shadowClone.setParentProperty(clickedProperty);
      //          rangeDragger.setParentProperty(clickedProperty);
      //          rangeDragger.hideDragger(false);
      //          rangeDragger.addMouseEvents();
      //          domainDragger.setParentProperty(clickedProperty);
      //          domainDragger.hideDragger(false);
      //          domainDragger.addMouseEvents();
      //
      //          if (clickedProperty.domain()===clickedProperty.range()){
      //              clickedProperty.labelObject().increasedLoopAngle=true;
      //              recalculatePositions();
      //
      //          }
      //
      //      } else if (clickedProperty.focused() && clickedProperty.type() === "owl:DatatypeProperty") {
      //          shadowClone.setParentProperty(clickedProperty);
      //          rangeDragger.setParentProperty(clickedProperty);
      //          rangeDragger.hideDragger(true);
      //          rangeDragger.addMouseEvents();
      //          domainDragger.setParentProperty(clickedProperty);
      //          domainDragger.hideDragger(false);
      //          domainDragger.addMouseEvents();
      //
      //      }
      //      else {
      //          rangeDragger.hideDragger(true);
      //          domainDragger.hideDragger(true);
      //          if (clickedProperty.domain()===clickedProperty.range()){
      //              clickedProperty.labelObject().increasedLoopAngle=false;
      //              recalculatePositions();
      //
      //          }
      //      }
      //  }
    });
    labelGroupElements.selectAll(".label").on("dblclick", function ( clickedProperty ){
      d3.event.stopPropagation();
      if ( editMode === true ) {
        clickedProperty.raiseDoubleClickEdit(defaultIriValue(clickedProperty));
      }
      
    });
  }
  
  function defaultIriValue( element ){
    // get the iri of that element;
    if ( graph.options().getGeneralMetaObject().iri ) {
      var str2Compare = graph.options().getGeneralMetaObject().iri + element.id();
      return element.iri() === str2Compare;
    }
    return false;
  }
  
  /** Adjusts the containers current scale and position. */
  function zoomed(){
    if ( forceNotZooming === true ) {
      zoom.translate(graphTranslation);
      zoom.scale(zoomFactor);
      return;
    }
    
    
    var zoomEventByMWheel = false;
    if ( d3.event.sourceEvent ) {
      if ( d3.event.sourceEvent.deltaY ) zoomEventByMWheel = true;
    }
    if ( zoomEventByMWheel === false ) {
      if ( transformAnimation === true ) {
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
      .tween("attr.translate", function (){
        return function ( t ){
          transformAnimation = true;
          var tr = d3.transform(graphContainer.attr("transform"));
          graphTranslation[0] = tr.translate[0];
          graphTranslation[1] = tr.translate[1];
          zoomFactor = tr.scale[0];
          updateHaloRadius();
          graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
        };
      })
      .each("end", function (){
        transformAnimation = false;
      })
      .attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")")
      .ease('linear')
      .duration(250);
  }// end of zoomed function
  
  function redrawGraph(){
    remove();
    
    graphContainer = d3.selectAll(options.graphContainerSelector())
      .append("svg")
      .classed("vowlGraph", true)
      .attr("width", options.width())
      .attr("height", options.height())
      .call(zoom)
      .append("g");
    // add touch and double click functions
    
    var svgGraph = d3.selectAll(".vowlGraph");
    originalD3_dblClickFunction = svgGraph.on("dblclick.zoom");
    originalD3_touchZoomFunction = svgGraph.on("touchstart");
    svgGraph.on("touchstart", touchzoomed);
    if ( editMode === true ) {
      svgGraph.on("dblclick.zoom", graph.modified_dblClickFunction);
    }
    else {
      svgGraph.on("dblclick.zoom", originalD3_dblClickFunction);
    }
    
  }
  
  function generateEditElements(){
    addDataPropertyGroupElement = editContainer.append('g')
      .classed("hidden-in-export", true)
      .classed("hidden", true)
      .classed("addDataPropertyElement", true)
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
    
    if ( graph.options().useAccuracyHelper() ) {
      addDataPropertyGroupElement.append("circle")
        .attr("r", 15)
        .attr("cx", -7)
        .attr("cy", 7)
        .classed("superHiddenElement", true)
        .classed("superOpacityElement", !graph.options().showDraggerObject());
    }
    
    
    deleteGroupElement = editContainer.append('g')
      .classed("hidden-in-export", true)
      .classed("hidden", true)
      .classed("deleteParentElement", true)
      .attr("transform", "translate(" + 0 + "," + 0 + ")");
    
    deleteGroupElement.append("circle")
      .attr("r", 12)
      .attr("cx", 0)
      .attr("cy", 0)
      .append("title").text("Delete This Node");
    
    var crossLen = 5;
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
    
    if ( graph.options().useAccuracyHelper() ) {
      deleteGroupElement.append("circle")
        .attr("r", 15)
        .attr("cx", 7)
        .attr("cy", -7)
        .classed("superHiddenElement", true)
        .classed("superOpacityElement", !graph.options().showDraggerObject());
    }
    
    
  }
  
  graph.getUnfilteredData = function (){
    return unfilteredData;
  };
  
  graph.getClassDataForTtlExport = function (){
    var allNodes = unfilteredData.nodes;
    var nodeData = [];
    for ( var i = 0; i < allNodes.length; i++ ) {
      if ( allNodes[i].type() !== "rdfs:Literal" &&
        allNodes[i].type() !== "rdfs:Datatype" &&
        allNodes[i].type() !== "owl:Thing" ) {
        nodeData.push(allNodes[i]);
      }
    }
    return nodeData;
  };
  
  graph.getPropertyDataForTtlExport = function (){
    var propertyData = [];
    var allProperties = unfilteredData.properties;
    for ( var i = 0; i < allProperties.length; i++ ) {
      // currently using only the object properties
      if ( allProperties[i].type() === "owl:ObjectProperty" ||
        allProperties[i].type() === "owl:DatatypeProperty" ||
        allProperties[i].type() === "owl:ObjectProperty"
      
      ) {
        propertyData.push(allProperties[i]);
      } else {
        if ( allProperties[i].type() === "rdfs:subClassOf" ) {
          allProperties[i].baseIri("http://www.w3.org/2000/01/rdf-schema#");
          allProperties[i].iri("http://www.w3.org/2000/01/rdf-schema#subClassOf");
        }
        if ( allProperties[i].type() === "owl:disjointWith" ) {
          allProperties[i].baseIri("http://www.w3.org/2002/07/owl#");
          allProperties[i].iri("http://www.w3.org/2002/07/owl#disjointWith");
        }
      }
    }
    return propertyData;
  };
  
  graph.getAxiomsForTtlExport = function (){
    var axioms = [];
    var allProperties = unfilteredData.properties;
    for ( var i = 0; i < allProperties.length; i++ ) {
      // currently using only the object properties
      if ( allProperties[i].type() === "owl:ObjectProperty" ||
        allProperties[i].type() === "owl:DatatypeProperty" ||
        allProperties[i].type() === "owl:ObjectProperty" ||
        allProperties[i].type() === "rdfs:subClassOf"
      ) {
      } else {
      }
    }
    return axioms;
  };
  
  
  graph.getUnfilteredData = function (){
    return unfilteredData;
  };
  
  graph.getClassDataForTtlExport = function (){
    var allNodes = unfilteredData.nodes;
    var nodeData = [];
    for ( var i = 0; i < allNodes.length; i++ ) {
      if ( allNodes[i].type() !== "rdfs:Literal" &&
        allNodes[i].type() !== "rdfs:Datatype" &&
        allNodes[i].type() !== "owl:Thing" ) {
        nodeData.push(allNodes[i]);
      }
    }
    return nodeData;
  };
  
  
  function redrawContent(){
    var markerContainer;
    
    if ( !graphContainer ) {
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
    var draggerPathLayer = graphContainer.append("g").classed("linkContainer", true);
    draggerLayer = graphContainer.append("g").classed("editContainer", true);
    editContainer = graphContainer.append("g").classed("editContainer", true);
    
    draggerPathLayer.classed("hidden-in-export", true);
    editContainer.classed("hidden-in-export", true);
    draggerLayer.classed("hidden-in-export", true);
    
    // Add an extra container for all markers
    markerContainer = linkContainer.append("defs");
    var drElement = draggerLayer.selectAll(".node")
      .data(draggerObjectsArray).enter()
      .append("g")
      .classed("node", true)
      .classed("hidden-in-export", true)
      .attr("id", function ( d ){
        return d.id();
      })
      .call(dragBehaviour);
    drElement.each(function ( node ){
      node.svgRoot(d3.select(this));
      node.svgPathLayer(draggerPathLayer);
      if ( node.type() === "shadowClone" ) {
        node.drawClone();
        node.hideClone(true);
      } else {
        node.drawNode();
        node.hideDragger(true);
      }
    });
    generateEditElements();
    
    
    // Add an extra container for all markers
    markerContainer = linkContainer.append("defs");
    
    // Draw nodes
    
    if ( classNodes === undefined ) classNodes = [];
    
    nodeElements = nodeContainer.selectAll(".node")
      .data(classNodes).enter()
      .append("g")
      .classed("node", true)
      .attr("id", function ( d ){
        return d.id();
      })
      .call(dragBehaviour);
    nodeElements.each(function ( node ){
      node.draw(d3.select(this));
    });
    
    
    if ( labelNodes === undefined ) labelNodes = [];
    
    // Draw label groups (property + inverse)
    labelGroupElements = labelContainer.selectAll(".labelGroup")
      .data(labelNodes).enter()
      .append("g")
      .classed("labelGroup", true)
      .call(dragBehaviour);
    
    labelGroupElements.each(function ( label ){
      var success = label.draw(d3.select(this));
      label.property().labelObject(label);
      // Remove empty groups without a label.
      if ( !success ) {
        d3.select(this).remove();
      }
    });
    // Place subclass label groups on the bottom of all labels
    labelGroupElements.each(function ( label ){
      // the label might be hidden e.g. in compact notation
      if ( !this.parentNode ) {
        return;
      }
      
      if ( elementTools.isRdfsSubClassOf(label.property()) ) {
        var parentNode = this.parentNode;
        parentNode.insertBefore(this, parentNode.firstChild);
      }
    });
    if ( properties === undefined ) properties = [];
    // Draw cardinality elements
    cardinalityElements = cardinalityContainer.selectAll(".cardinality")
      .data(properties).enter()
      .append("g")
      .classed("cardinality", true);
    
    cardinalityElements.each(function ( property ){
      var success = property.drawCardinality(d3.select(this));
      
      // Remove empty groups without a label.
      if ( !success ) {
        d3.select(this).remove();
      }
    });
    // Draw links
    if ( links === undefined ) links = [];
    linkGroups = linkContainer.selectAll(".link")
      .data(links).enter()
      .append("g")
      .classed("link", true);
    
    linkGroups.each(function ( link ){
      link.draw(d3.select(this), markerContainer);
    });
    linkPathElements = linkGroups.selectAll("path");
    // Select the path for direct access to receive a better performance
    addClickEvents();
  }
  
  function remove(){
    if ( graphContainer ) {
      // Select the parent element because the graph container is a group (e.g. for zooming)
      d3.select(graphContainer.node().parentNode).remove();
    }
  }
  
  initializeGraph(); // << call the initialization function
  
  graph.updateCanvasContainerSize = function (){
    if ( graphContainer ) {
      var svgElement = d3.selectAll(".vowlGraph");
      svgElement.attr("width", options.width());
      svgElement.attr("height", options.height());
      graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
    }
  };
  
  // Loads all settings, removes the old graph (if it exists) and draws a new one.
  graph.start = function (){
    force.stop();
    loadGraphData(true);
    redrawGraph();
    graph.update(true);
    
    if ( graph.options().loadingModule().successfullyLoadedOntology() === false ) {
      graph.options().loadingModule().setErrorMode();
    }
    
  };
  
  // Updates only the style of the graph.
  graph.updateStyle = function (){
    refreshGraphStyle();
    if ( graph.options().loadingModule().successfullyLoadedOntology() === false ) {
      force.stop();
    } else {
      force.start();
    }
  };
  
  graph.reload = function (){
    loadGraphData();
    graph.update();
    
  };
  
  graph.load = function (){
    force.stop();
    loadGraphData();
    refreshGraphData();
    for ( var i = 0; i < labelNodes.length; i++ ) {
      var label = labelNodes[i];
      if ( label.property().x && label.property().y ) {
        label.x = label.property().x;
        label.y = label.property().y;
        // also set the prev position of the label
        label.px = label.x;
        label.py = label.y;
      }
    }
    graph.update();
  };
  
  graph.fastUpdate = function (){
    // fast update function for editor calls;
    // -- experimental ;
    quick_refreshGraphData();
    updateNodeMap();
    force.start();
    redrawContent();
    graph.updatePulseIds(nodeArrayForPulse);
    refreshGraphStyle();
    updateHaloStyles();
    
  };
  
  graph.getNodeMapForSearch = function (){
    return nodeMap;
  };
  function updateNodeMap(){
    nodeMap = [];
    var node;
    for ( var j = 0; j < force.nodes().length; j++ ) {
      node = force.nodes()[j];
      if ( node.id ) {
        nodeMap[node.id()] = j;
        // check for equivalents
        var eqs = node.equivalents();
        if ( eqs.length > 0 ) {
          for ( var e = 0; e < eqs.length; e++ ) {
            var eqObject = eqs[e];
            nodeMap[eqObject.id()] = j;
          }
        }
      }
      if ( node.property ) {
        nodeMap[node.property().id()] = j;
        var inverse = node.inverse();
        if ( inverse ) {
          nodeMap[inverse.id()] = j;
        }
      }
    }
  }
  
  function updateHaloStyles(){
    var haloElement;
    var halo;
    var node;
    for ( var j = 0; j < force.nodes().length; j++ ) {
      node = force.nodes()[j];
      if ( node.id ) {
        haloElement = node.getHalos();
        if ( haloElement ) {
          halo = haloElement.selectAll(".searchResultA");
          halo.classed("searchResultA", false);
          halo.classed("searchResultB", true);
        }
      }
      
      if ( node.property ) {
        haloElement = node.property().getHalos();
        if ( haloElement ) {
          halo = haloElement.selectAll(".searchResultA");
          halo.classed("searchResultA", false);
          halo.classed("searchResultB", true);
        }
      }
    }
  }
  
  // Updates the graphs displayed data and style.
  graph.update = function ( init ){
    var validOntology = graph.options().loadingModule().successfullyLoadedOntology();
    if ( validOntology === false && (init && init === true) ) {
      graph.options().loadingModule().collapseDetails();
      return;
    }
    if ( validOntology === false ) {
      return;
    }
    
    keepDetailsCollapsedOnLoading = false;
    refreshGraphData();
    // update node map
    updateNodeMap();
    
    force.start();
    redrawContent();
    graph.updatePulseIds(nodeArrayForPulse);
    refreshGraphStyle();
    updateHaloStyles();
  };
  
  graph.paused = function ( p ){
    if ( !arguments.length ) return paused;
    paused = p;
    graph.updateStyle();
    return graph;
  };
  // resetting the graph
  graph.reset = function (){
    // window size
    var w = 0.5 * graph.options().width();
    var h = 0.5 * graph.options().height();
    // computing initial translation for the graph due tue the dynamic default zoom level
    var tx = w - defaultZoom * w;
    var ty = h - defaultZoom * h;
    zoom.translate([tx, ty])
      .scale(defaultZoom);
  };
  
  
  graph.zoomOut = function (){
    
    var minMag = options.minMagnification(),
      maxMag = options.maxMagnification();
    var stepSize = (maxMag - minMag) / 10;
    var val = zoomFactor - stepSize;
    if ( val < minMag ) val = minMag;
    
    var cx = 0.5 * graph.options().width();
    var cy = 0.5 * graph.options().height();
    var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
    var sP = [cp.x, cp.y, graph.options().height() / zoomFactor];
    var eP = [cp.x, cp.y, graph.options().height() / val];
    var pos_intp = d3.interpolateZoom(sP, eP);
    
    graphContainer.attr("transform", transform(sP, cx, cy))
      .transition()
      .duration(250)
      .attrTween("transform", function (){
        return function ( t ){
          return transform(pos_intp(t), cx, cy);
        };
      })
      .each("end", function (){
        graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
        zoom.translate(graphTranslation);
        zoom.scale(zoomFactor);
        updateHaloRadius();
        options.zoomSlider().updateZoomSliderValue(zoomFactor);
      });
    
  };
  
  graph.zoomIn = function (){
    var minMag = options.minMagnification(),
      maxMag = options.maxMagnification();
    var stepSize = (maxMag - minMag) / 10;
    var val = zoomFactor + stepSize;
    if ( val > maxMag ) val = maxMag;
    var cx = 0.5 * graph.options().width();
    var cy = 0.5 * graph.options().height();
    var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
    var sP = [cp.x, cp.y, graph.options().height() / zoomFactor];
    var eP = [cp.x, cp.y, graph.options().height() / val];
    var pos_intp = d3.interpolateZoom(sP, eP);
    
    graphContainer.attr("transform", transform(sP, cx, cy))
      .transition()
      .duration(250)
      .attrTween("transform", function (){
        return function ( t ){
          return transform(pos_intp(t), cx, cy);
        };
      })
      .each("end", function (){
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
  
  var cachedJsonOBJ = null;
  graph.clearAllGraphData = function (){
    if ( graph.graphNodeElements() && graph.graphNodeElements().length > 0 ) {
      cachedJsonOBJ = graph.options().exportMenu().createJSON_exportObject();
    } else {
      cachedJsonOBJ = null;
    }
    force.stop();
    if ( unfilteredData ) {
      unfilteredData.nodes = [];
      unfilteredData.properties = [];
    }
  };
  graph.getCachedJsonObj = function (){
    return cachedJsonOBJ;
  };
  
  // removes data when data could not be loaded
  graph.clearGraphData = function (){
    force.stop();
    var sidebar = graph.options().sidebar();
    if ( sidebar )
      sidebar.clearOntologyInformation();
    if ( graphContainer )
      redrawGraph();
  };
  
  function generateDictionary( data ){
    var i;
    var originalDictionary = [];
    var nodes = data.nodes;
    for ( i = 0; i < nodes.length; i++ ) {
      // check if node has a label
      if ( nodes[i].labelForCurrentLanguage() !== undefined )
        originalDictionary.push(nodes[i]);
    }
    var props = data.properties;
    for ( i = 0; i < props.length; i++ ) {
      if ( props[i].labelForCurrentLanguage() !== undefined )
        originalDictionary.push(props[i]);
    }
    parser.setDictionary(originalDictionary);
    
    var literFilter = graph.options().literalFilter();
    var idsToRemove = literFilter.removedNodes();
    var originalDict = parser.getDictionary();
    var newDict = [];
    
    // go through the dictionary and remove the ids;
    for ( i = 0; i < originalDict.length; i++ ) {
      var dictElement = originalDict[i];
      var dictElementId;
      if ( dictElement.property )
        dictElementId = dictElement.property().id();
      else
        dictElementId = dictElement.id();
      // compare against the removed ids;
      var addToDictionary = true;
      for ( var j = 0; j < idsToRemove.length; j++ ) {
        var currentId = idsToRemove[j];
        if ( currentId === dictElementId ) {
          addToDictionary = false;
        }
      }
      if ( addToDictionary === true ) {
        newDict.push(dictElement);
      }
    }
    // tell the parser that the dictionary is updated
    parser.setDictionary(newDict);
    
  }
  
  graph.updateProgressBarMode = function (){
    var loadingModule = graph.options().loadingModule();
    
    var state = loadingModule.getProgressBarMode();
    switch ( state ) {
      case  0:
        loadingModule.setErrorMode();
        break;
      case  1:
        loadingModule.setBusyMode();
        break;
      case  2:
        loadingModule.setPercentMode();
        break;
      default:
        loadingModule.setPercentMode();
    }
  };
  
  graph.setFilterWarning = function ( val ){
    showFilterWarning = val;
  };
  function loadGraphData( init ){
    // reset the locate button and previously selected locations and other variables
    
    var loadingModule = graph.options().loadingModule();
    force.stop();
    
    force.nodes([]);
    force.links([]);
    nodeArrayForPulse = [];
    pulseNodeIds = [];
    locationId = 0;
    d3.select("#locateSearchResult").classed("highlighted", false);
    d3.select("#locateSearchResult").node().title = "Nothing to locate";
    graph.clearGraphData();
    
    if ( init ) {
      force.stop();
      return;
    }
    
    showFilterWarning = false;
    parser.parse(options.data());
    unfilteredData = {
      nodes: parser.nodes(),
      properties: parser.properties()
    };
    // fixing class and property id counter for the editor
    eN = unfilteredData.nodes.length + 1;
    eP = unfilteredData.properties.length + 1;
    
    initialLoad = true;
    graph.options().warningModule().closeFilterHint();
    
    // loading handler
    updateRenderingDuringSimulation = true;
    var validOntology = graph.options().loadingModule().successfullyLoadedOntology();
    if ( graphContainer && validOntology === true ) {
      
      updateRenderingDuringSimulation = false;
      graph.options().ontologyMenu().append_bulletPoint("Generating visualization ... ");
      loadingModule.setPercentMode();
      
      if ( unfilteredData.nodes.length > 0 ) {
        graphContainer.style("opacity", "0");
        force.on("tick", hiddenRecalculatePositions);
      } else {
        graphContainer.style("opacity", "1");
        if ( showFPS === true ) {
          force.on("tick", recalculatePositionsWithFPS);
        }
        else {
          force.on("tick", recalculatePositions);
        }
      }
      
      force.start();
    } else {
      force.stop();
      graph.options().ontologyMenu().append_bulletPoint("Failed to load ontology");
      loadingModule.setErrorMode();
    }
    // update prefixList(
    // update general MetaOBJECT
    graph.options().clearMetaObject();
    graph.options().clearGeneralMetaObject();
    graph.options().editSidebar().clearMetaObjectValue();
    if ( options.data() !== undefined ) {
      var header = options.data().header;
      if ( header ) {
        if ( header.iri ) {
          graph.options().addOrUpdateGeneralObjectEntry("iri", header.iri);
        }
        if ( header.title ) {
          graph.options().addOrUpdateGeneralObjectEntry("title", header.title);
        }
        if ( header.author ) {
          graph.options().addOrUpdateGeneralObjectEntry("author", header.author);
        }
        if ( header.version ) {
          graph.options().addOrUpdateGeneralObjectEntry("version", header.version);
        }
        if ( header.description ) {
          graph.options().addOrUpdateGeneralObjectEntry("description", header.description);
        }
        if ( header.prefixList ) {
          var pL = header.prefixList;
          for ( var pr in pL ) {
            if ( pL.hasOwnProperty(pr) ) {
              var val = pL[pr];
              graph.options().addPrefix(pr, val);
            }
          }
        }
        // get other metadata;
        if ( header.other ) {
          var otherObjects = header.other;
          for ( var name in otherObjects ) {
            if ( otherObjects.hasOwnProperty(name) ) {
              var otherObj = otherObjects[name];
              if ( otherObj.hasOwnProperty("identifier") && otherObj.hasOwnProperty("value") ) {
                graph.options().addOrUpdateMetaObjectEntry(otherObj.identfier, otherObj.value);
              }
            }
          }
        }
      }
    }
    // update more meta OBJECT
    // Initialize filters with data to replicate consecutive filtering
    var initializationData = _.clone(unfilteredData);
    options.filterModules().forEach(function ( module ){
      initializationData = filterFunction(module, initializationData, true);
    });
    // generate dictionary here ;
    generateDictionary(unfilteredData);
    
    parser.parseSettings();
    graphUpdateRequired = parser.settingsImported();
    centerGraphViewOnLoad = true;
    if ( parser.settingsImportGraphZoomAndTranslation() === true ) {
      centerGraphViewOnLoad = false;
    }
    graph.options().searchMenu().requestDictionaryUpdate();
    graph.options().editSidebar().updateGeneralOntologyInfo();
    graph.options().editSidebar().updatePrefixUi();
    graph.options().editSidebar().updateElementWidth();
  }
  
  graph.handleOnLoadingError = function (){
    force.stop();
    graph.clearGraphData();
    graph.options().ontologyMenu().append_bulletPoint("Failed to load ontology");
    d3.select("#progressBarValue").node().innherHTML = "";
    d3.select("#progressBarValue").classed("busyProgressBar", false);
    graph.options().loadingModule().setErrorMode();
    graph.options().loadingModule().showErrorDetailsMessage();
  };
  
  function quick_refreshGraphData(){
    links = linkCreator.createLinks(properties);
    labelNodes = links.map(function ( link ){
      return link.label();
    });
    
    storeLinksOnNodes(classNodes, links);
    setForceLayoutData(classNodes, labelNodes, links);
  }
  
  //Applies the data of the graph options object and parses it. The graph is not redrawn.
  function refreshGraphData(){
    var shouldExecuteEmptyFilter = options.literalFilter().enabled();
    graph.executeEmptyLiteralFilter();
    options.literalFilter().enabled(shouldExecuteEmptyFilter);
    
    var preprocessedData = _.clone(unfilteredData);
    
    // Filter the data
    options.filterModules().forEach(function ( module ){
      preprocessedData = filterFunction(module, preprocessedData);
    });
    options.focuserModule().handle(undefined, true);
    classNodes = preprocessedData.nodes;
    properties = preprocessedData.properties;
    links = linkCreator.createLinks(properties);
    labelNodes = links.map(function ( link ){
      return link.label();
    });
    storeLinksOnNodes(classNodes, links);
    setForceLayoutData(classNodes, labelNodes, links);
    // for (var i = 0; i < classNodes.length; i++) {
    //     if (classNodes[i].setRectangularRepresentation)
    //         classNodes[i].setRectangularRepresentation(graph.options().rectangularRepresentation());
    // }
  }
  
  function filterFunction( module, data, initializing ){
    links = linkCreator.createLinks(data.properties);
    storeLinksOnNodes(data.nodes, links);
    
    if ( initializing ) {
      if ( module.initialize ) {
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
  function storeLinksOnNodes( nodes, links ){
    for ( var i = 0, nodesLength = nodes.length; i < nodesLength; i++ ) {
      var node = nodes[i],
        connectedLinks = [];
      
      // look for properties where this node is the domain or range
      for ( var j = 0, linksLength = links.length; j < linksLength; j++ ) {
        var link = links[j];
        
        if ( link.domain() === node || link.range() === node ) {
          connectedLinks.push(link);
        }
      }
      node.links(connectedLinks);
    }
  }
  
  function setForceLayoutData( classNodes, labelNodes, links ){
    var d3Links = [];
    links.forEach(function ( link ){
      d3Links = d3Links.concat(link.linkParts());
    });
    
    var d3Nodes = [].concat(classNodes).concat(labelNodes);
    setPositionOfOldLabelsOnNewLabels(force.nodes(), labelNodes);
    
    force.nodes(d3Nodes)
      .links(d3Links);
  }
  
  // The label nodes are positioned randomly, because they are created from scratch if the data changes and lose
  // their position information. With this hack the position of old labels is copied to the new labels.
  function setPositionOfOldLabelsOnNewLabels( oldLabelNodes, labelNodes ){
    labelNodes.forEach(function ( labelNode ){
      for ( var i = 0; i < oldLabelNodes.length; i++ ) {
        var oldNode = oldLabelNodes[i];
        if ( oldNode.equals(labelNode) ) {
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
  function refreshGraphStyle(){
    zoom = zoom.scaleExtent([options.minMagnification(), options.maxMagnification()]);
    if ( graphContainer ) {
      zoom.event(graphContainer);
    }
    
    force.charge(function ( element ){
      var charge = options.charge();
      if ( elementTools.isLabel(element) ) {
        charge *= 0.8;
      }
      return charge;
    })
      .size([options.width(), options.height()])
      .linkDistance(calculateLinkPartDistance)
      .gravity(options.gravity())
      .linkStrength(options.linkStrength()); // Flexibility of links
    
    force.nodes().forEach(function ( n ){
      n.frozen(paused);
    });
  }
  
  function calculateLinkPartDistance( linkPart ){
    var link = linkPart.link();
    
    if ( link.isLoop() ) {
      return options.loopDistance();
    }
    
    // divide by 2 to receive the length for a single link part
    var linkPartDistance = getVisibleLinkDistance(link) / 2;
    linkPartDistance += linkPart.domain().actualRadius();
    linkPartDistance += linkPart.range().actualRadius();
    return linkPartDistance;
  }
  
  function getVisibleLinkDistance( link ){
    if ( elementTools.isDatatype(link.domain()) || elementTools.isDatatype(link.range()) ) {
      return options.datatypeDistance();
    } else {
      return options.classDistance();
    }
  }
  
  /** --------------------------------------------------------- **/
  /** -- animation functions for the nodes --                   **/
  /** --------------------------------------------------------- **/
  
  graph.animateDynamicLabelWidth = function (){
    var wantedWidth = options.dynamicLabelWidth();
    var i;
    for ( i = 0; i < classNodes.length; i++ ) {
      var nodeElement = classNodes[i];
      if ( elementTools.isDatatype(nodeElement) ) {
        nodeElement.animateDynamicLabelWidth(wantedWidth);
      }
    }
    for ( i = 0; i < properties.length; i++ ) {
      properties[i].animateDynamicLabelWidth(wantedWidth);
    }
  };
  
  
  /** --------------------------------------------------------- **/
  /** -- halo and localization functions --                     **/
  /** --------------------------------------------------------- **/
  function updateHaloRadius(){
    if ( pulseNodeIds && pulseNodeIds.length > 0 ) {
      var forceNodes = force.nodes();
      for ( var i = 0; i < pulseNodeIds.length; i++ ) {
        var node = forceNodes[pulseNodeIds[i]];
        if ( node ) {
          if ( node.property ) {
            // match search strings with property label
            if ( node.property().inverse ) {
              var searchString = graph.options().searchMenu().getSearchString().toLowerCase();
              var name = node.property().labelForCurrentLanguage().toLowerCase();
              if ( name === searchString ) computeDistanceToCenter(node);
              else {
                node.property().removeHalo();
                if ( node.property().inverse() ) {
                  if ( !node.property().inverse().getHalos() )
                    node.property().inverse().drawHalo();
                  computeDistanceToCenter(node, true);
                }
                if ( node.property().equivalents() ) {
                  var eq = node.property().equivalents();
                  for ( var e = 0; e < eq.length; e++ ) {
                    if ( !eq[e].getHalos() )
                      eq[e].drawHalo();
                  }
                  if ( !node.property().getHalos() )
                    node.property().drawHalo();
                  computeDistanceToCenter(node, false);
                  
                }
              }
            }
          }
          computeDistanceToCenter(node);
        }
      }
    }
  }
  
  function getScreenCoords( x, y, translate, scale ){
    var xn = translate[0] + x * scale;
    var yn = translate[1] + y * scale;
    return { x: xn, y: yn };
  }
  
  function getClickedScreenCoords( x, y, translate, scale ){
    var xn = (x - translate[0]) / scale;
    var yn = (y - translate[1]) / scale;
    return { x: xn, y: yn };
  }
  
  
  function computeDistanceToCenter( node, inverse ){
    var container = node;
    var w = graph.options().width();
    var h = graph.options().height();
    var posXY = getScreenCoords(node.x, node.y, graphTranslation, zoomFactor);
    
    var highlightOfInv = false;
    
    if ( inverse && inverse === true ) {
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
    
    if ( node.property && highlightOfInv === true ) {
      if ( node.property().inverse() ) {
        rectHalo = node.property().inverse().getHalos().select("rect");
        
      } else {
        if ( node.property().getHalos() )
          rectHalo = node.property().getHalos().select("rect");
        else {
          node.property().drawHalo();
          rectHalo = node.property().getHalos().select("rect");
        }
      }
      rectHalo.classed("hidden", true);
      if ( node.property().inverse() ) {
        if ( node.property().inverse().getHalos() ) {
          roundHalo = node.property().inverse().getHalos().select("circle");
        }
      } else {
        roundHalo = node.property().getHalos().select("circle");
      }
      if ( roundHalo.node() === null ) {
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
    
    if ( node.id ) {
      if ( !node.getHalos() ) return; // something went wrong before
      halo = node.getHalos().select("rect");
      if ( halo.node() === null ) {
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
        if ( roundHalo.node() === null ) {
          radius = node.width();
          roundHalo = node.getHalos().append("circle")
            .classed("searchResultB", true)
            .classed("searchResultA", false)
            .attr("r", radius + offset);
        }
        halo = roundHalo;
      }
    }
    if ( node.property && !inverse ) {
      if ( !node.property().getHalos() ) return; // something went wrong before
      rectHalo = node.property().getHalos().select("rect");
      rectHalo.classed("hidden", true);
      
      roundHalo = node.property().getHalos().select("circle");
      if ( roundHalo.node() === null ) {
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
    
    if ( x < 0 || x > w || y < 0 || y > h ) {
      // node outside viewport;
      // check for quadrant and get the correct boarder point (intersection with viewport)
      if ( x < 0 && y < 0 ) {
        borderPoint_x = 0;
        borderPoint_y = 0;
      } else if ( x > 0 && x < w && y < 0 ) {
        borderPoint_x = x;
        borderPoint_y = 0;
      } else if ( x > w && y < 0 ) {
        borderPoint_x = w;
        borderPoint_y = 0;
      } else if ( x > w && y > 0 && y < h ) {
        borderPoint_x = w;
        borderPoint_y = y;
      } else if ( x > w && y > h ) {
        borderPoint_x = w;
        borderPoint_y = h;
      } else if ( x > 0 && x < w && y > h ) {
        borderPoint_x = x;
        borderPoint_y = h;
      } else if ( x < 0 && y > h ) {
        borderPoint_x = 0;
        borderPoint_y = h;
      } else if ( x < 0 && y > 0 && y < h ) {
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
      if ( highlightOfInv === true )
        dy = wY - node.y - 20;
      
      if ( highlightOfInv === false && node.property && node.property().inverse() )
        dy = wY - node.y + 20;
      
      var newRadius = Math.sqrt(dx * dx + dy * dy);
      halo = container.getHalos().select("circle");
      // sanity checks and setting new halo radius
      if ( !nodeIsRect ) {
        defaultRadius = node.actualRadius() + offset;
        if ( newRadius < defaultRadius ) {
          newRadius = defaultRadius;
        }
        halo.attr("r", newRadius);
      } else {
        defaultRadius = 0.5 * container.width();
        if ( newRadius < defaultRadius )
          newRadius = defaultRadius;
        halo.attr("r", newRadius);
      }
    } else { // node is in viewport , render original;
      // reset the halo to original radius
      defaultRadius = node.actualRadius() + 15;
      if ( !nodeIsRect ) {
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
  
  function transform( p, cx, cy ){
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
  
  graph.zoomToElementInGraph = function ( element ){
    targetLocationZoom(element);
  };
  graph.updateHaloRadius = function ( element ){
    computeDistanceToCenter(element);
  };
  
  function targetLocationZoom( target ){
    // store the original information
    var cx = 0.5 * graph.options().width();
    var cy = 0.5 * graph.options().height();
    var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
    var sP = [cp.x, cp.y, graph.options().height() / zoomFactor];
    
    var zoomLevel = Math.max(defaultZoom + 0.5 * defaultZoom, defaultTargetZoom);
    var eP = [target.x, target.y, graph.options().height() / zoomLevel];
    var pos_intp = d3.interpolateZoom(sP, eP);
    
    var lenAnimation = pos_intp.duration;
    if ( lenAnimation > 2500 ) {
      lenAnimation = 2500;
    }
    
    graphContainer.attr("transform", transform(sP, cx, cy))
      .transition()
      .duration(lenAnimation)
      .attrTween("transform", function (){
        return function ( t ){
          return transform(pos_intp(t), cx, cy);
        };
      })
      .each("end", function (){
        graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
        zoom.translate(graphTranslation);
        zoom.scale(zoomFactor);
        updateHaloRadius();
      });
  }
  
  function getWorldPosFromScreen( x, y, translate, scale ){
    var temp = scale[0], xn, yn;
    if ( temp ) {
      xn = (x - translate[0]) / temp;
      yn = (y - translate[1]) / temp;
    } else {
      xn = (x - translate[0]) / scale;
      yn = (y - translate[1]) / scale;
    }
    return { x: xn, y: yn };
  }
  
  graph.locateSearchResult = function (){
    if ( pulseNodeIds && pulseNodeIds.length > 0 ) {
      // move the center of the viewport to this location
      if ( transformAnimation === true ) return; // << prevents incrementing the location id if we are in an animation
      var node = force.nodes()[pulseNodeIds[locationId]];
      locationId++;
      locationId = locationId % pulseNodeIds.length;
      if ( node.id ) node.foreground();
      if ( node.property ) node.property().foreground();
      
      targetLocationZoom(node);
    }
  };
  
  graph.resetSearchHighlight = function (){
    // get all nodes (handle also already filtered nodes )
    pulseNodeIds = [];
    nodeArrayForPulse = [];
    // clear from stored nodes
    var nodes = unfilteredData.nodes;
    var props = unfilteredData.properties;
    var j;
    for ( j = 0; j < nodes.length; j++ ) {
      var node = nodes[j];
      if ( node.removeHalo )
        node.removeHalo();
    }
    for ( j = 0; j < props.length; j++ ) {
      var prop = props[j];
      if ( prop.removeHalo )
        prop.removeHalo();
    }
  };
  
  graph.updatePulseIds = function ( nodeIdArray ){
    pulseNodeIds = [];
    for ( var i = 0; i < nodeIdArray.length; i++ ) {
      var selectedId = nodeIdArray[i];
      var forceId = nodeMap[selectedId];
      if ( forceId !== undefined ) {
        var le_node = force.nodes()[forceId];
        if ( le_node.id ) {
          if ( pulseNodeIds.indexOf(forceId) === -1 ) {
            pulseNodeIds.push(forceId);
          }
        }
        if ( le_node.property ) {
          if ( pulseNodeIds.indexOf(forceId) === -1 ) {
            pulseNodeIds.push(forceId);
          }
        }
      }
    }
    locationId = 0;
    if ( pulseNodeIds.length > 0 ) {
      d3.select("#locateSearchResult").classed("highlighted", true);
      d3.select("#locateSearchResult").node().title = "Locate search term";
    }
    else {
      d3.select("#locateSearchResult").classed("highlighted", false);
      d3.select("#locateSearchResult").node().title = "Nothing to locate";
    }
    
  };
  
  graph.highLightNodes = function ( nodeIdArray ){
    if ( nodeIdArray.length === 0 ) {
      return; // nothing to highlight
    }
    pulseNodeIds = [];
    nodeArrayForPulse = nodeIdArray;
    var missedIds = [];
    
    // identify the force id to highlight
    for ( var i = 0; i < nodeIdArray.length; i++ ) {
      var selectedId = nodeIdArray[i];
      var forceId = nodeMap[selectedId];
      if ( forceId !== undefined ) {
        var le_node = force.nodes()[forceId];
        if ( le_node.id ) {
          if ( pulseNodeIds.indexOf(forceId) === -1 ) {
            pulseNodeIds.push(forceId);
            le_node.foreground();
            le_node.drawHalo();
          }
        }
        if ( le_node.property ) {
          if ( pulseNodeIds.indexOf(forceId) === -1 ) {
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
    
    if ( missedIds.length === nodeIdArray.length ) {
      
    }
    // store the highlight on the missed nodes;
    var s_nodes = unfilteredData.nodes;
    var s_props = unfilteredData.properties;
    for ( i = 0; i < missedIds.length; i++ ) {
      var missedId = missedIds[i];
      // search for this in the nodes;
      for ( var n = 0; n < s_nodes.length; n++ ) {
        var nodeId = s_nodes[n].id();
        if ( nodeId === missedId ) {
          s_nodes[n].drawHalo();
        }
      }
      for ( var p = 0; p < s_props.length; p++ ) {
        var propId = s_props[p].id();
        if ( propId === missedId ) {
          s_props[p].drawHalo();
        }
      }
    }
    if ( missedIds.length === nodeIdArray.length ) {
      d3.select("#locateSearchResult").classed("highlighted", false);
    }
    else {
      d3.select("#locateSearchResult").classed("highlighted", true);
    }
    locationId = 0;
    updateHaloRadius();
  };
  
  graph.hideHalos = function (){
    var haloElements = d3.selectAll(".searchResultA,.searchResultB");
    haloElements.classed("hidden", true);
    return haloElements;
  };
  
  function nodeInViewport( node, property ){
    
    var w = graph.options().width();
    var h = graph.options().height();
    var posXY = getScreenCoords(node.x, node.y, graphTranslation, zoomFactor);
    var x = posXY.x;
    var y = posXY.y;
    
    var retVal = !(x < 0 || x > w || y < 0 || y > h);
    return retVal;
  }
  
  graph.getBoundingBoxForTex = function (){
    var halos = graph.hideHalos();
    var bbox = graphContainer.node().getBoundingClientRect();
    halos.classed("hidden", false);
    var w = graph.options().width();
    var h = graph.options().height();
    
    // get the graph coordinates
    var topLeft = getWorldPosFromScreen(0, 0, graphTranslation, zoomFactor);
    var botRight = getWorldPosFromScreen(w, h, graphTranslation, zoomFactor);
    
    
    var t_topLeft = getWorldPosFromScreen(bbox.left, bbox.top, graphTranslation, zoomFactor);
    var t_botRight = getWorldPosFromScreen(bbox.right, bbox.bottom, graphTranslation, zoomFactor);
    
    // tighten up the bounding box;
    
    var tX = Math.max(t_topLeft.x, topLeft.x);
    var tY = Math.max(t_topLeft.y, topLeft.y);
    
    var bX = Math.min(t_botRight.x, botRight.x);
    var bY = Math.min(t_botRight.y, botRight.y);
    
    
    // tighten further;
    var allForceNodes = force.nodes();
    var numNodes = allForceNodes.length;
    var visibleNodes = [];
    var bbx;
    
    
    var contentBBox = { tx: 1000000000000, ty: 1000000000000, bx: -1000000000000, by: -1000000000000 };
    
    for ( var i = 0; i < numNodes; i++ ) {
      var node = allForceNodes[i];
      if ( node ) {
        if ( node.property ) {
          if ( nodeInViewport(node, true) ) {
            if ( node.property().labelElement() === undefined ) continue;
            bbx = node.property().labelElement().node().getBoundingClientRect();
            if ( bbx ) {
              contentBBox.tx = Math.min(contentBBox.tx, bbx.left);
              contentBBox.bx = Math.max(contentBBox.bx, bbx.right);
              contentBBox.ty = Math.min(contentBBox.ty, bbx.top);
              contentBBox.by = Math.max(contentBBox.by, bbx.bottom);
            }
          }
        } else {
          if ( nodeInViewport(node, false) ) {
            bbx = node.nodeElement().node().getBoundingClientRect();
            if ( bbx ) {
              contentBBox.tx = Math.min(contentBBox.tx, bbx.left);
              contentBBox.bx = Math.max(contentBBox.bx, bbx.right);
              contentBBox.ty = Math.min(contentBBox.ty, bbx.top);
              contentBBox.by = Math.max(contentBBox.by, bbx.bottom);
            }
          }
        }
      }
    }
    
    var tt_topLeft = getWorldPosFromScreen(contentBBox.tx, contentBBox.ty, graphTranslation, zoomFactor);
    var tt_botRight = getWorldPosFromScreen(contentBBox.bx, contentBBox.by, graphTranslation, zoomFactor);
    
    tX = Math.max(tX, tt_topLeft.x);
    tY = Math.max(tY, tt_topLeft.y);
    
    bX = Math.min(bX, tt_botRight.x);
    bY = Math.min(bY, tt_botRight.y);
    // y axis flip for tex
    return [tX, -tY, bX, -bY];
    
  };
  
  var updateTargetElement = function (){
    var bbox = graphContainer.node().getBoundingClientRect();
    
    
    // get the graph coordinates
    var bboxOffset = 50; // default radius of a node;
    var topLeft = getWorldPosFromScreen(bbox.left, bbox.top, graphTranslation, zoomFactor);
    var botRight = getWorldPosFromScreen(bbox.right, bbox.bottom, graphTranslation, zoomFactor);
    
    var w = graph.options().width();
    if ( graph.options().leftSidebar().isSidebarVisible() === true )
      w -= 200;
    var h = graph.options().height();
    topLeft.x += bboxOffset;
    topLeft.y -= bboxOffset;
    botRight.x -= bboxOffset;
    botRight.y += bboxOffset;
    
    var g_w = botRight.x - topLeft.x;
    var g_h = botRight.y - topLeft.y;
    
    // endpoint position calculations
    var posX = 0.5 * (topLeft.x + botRight.x);
    var posY = 0.5 * (topLeft.y + botRight.y);
    var cx = 0.5 * w,
      cy = 0.5 * h;
    
    if ( graph.options().leftSidebar().isSidebarVisible() === true )
      cx += 200;
    var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
    
    // zoom factor calculations and fail safes;
    var newZoomFactor = 1.0; // fail save if graph and window are squares
    //get the smaller one
    var a = w / g_w;
    var b = h / g_h;
    if ( a < b ) newZoomFactor = a;
    else      newZoomFactor = b;
    
    
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
    return [pos_intp, cx, cy];
    
  };
  
  graph.forceRelocationEvent = function ( dynamic ){
    // we need to kill the halo to determine the bounding box;
    var halos = graph.hideHalos();
    var bbox = graphContainer.node().getBoundingClientRect();
    halos.classed("hidden", false);
    
    // get the graph coordinates
    var bboxOffset = 50; // default radius of a node;
    var topLeft = getWorldPosFromScreen(bbox.left, bbox.top, graphTranslation, zoomFactor);
    var botRight = getWorldPosFromScreen(bbox.right, bbox.bottom, graphTranslation, zoomFactor);
    
    var w = graph.options().width();
    if ( graph.options().leftSidebar().isSidebarVisible() === true )
      w -= 200;
    var h = graph.options().height();
    topLeft.x += bboxOffset;
    topLeft.y -= bboxOffset;
    botRight.x -= bboxOffset;
    botRight.y += bboxOffset;
    
    var g_w = botRight.x - topLeft.x;
    var g_h = botRight.y - topLeft.y;
    
    // endpoint position calculations
    var posX = 0.5 * (topLeft.x + botRight.x);
    var posY = 0.5 * (topLeft.y + botRight.y);
    var cx = 0.5 * w,
      cy = 0.5 * h;
    
    if ( graph.options().leftSidebar().isSidebarVisible() === true )
      cx += 200;
    var cp = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);
    
    // zoom factor calculations and fail safes;
    var newZoomFactor = 1.0; // fail save if graph and window are squares
    //get the smaller one
    var a = w / g_w;
    var b = h / g_h;
    if ( a < b ) newZoomFactor = a;
    else      newZoomFactor = b;
    
    
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
    if ( lenAnimation > 2500 ) {
      lenAnimation = 2500;
    }
    graphContainer.attr("transform", transform(sP, cx, cy))
      .transition()
      .duration(lenAnimation)
      .attrTween("transform", function (){
        return function ( t ){
          if ( dynamic ) {
            var param = updateTargetElement();
            var nV = param[0](t);
            return transform(nV, cx, cy);
          }
          return transform(pos_intp(t), cx, cy);
        };
      })
      .each("end", function (){
        if ( dynamic ) {
          return;
        }
        
        graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
        zoom.translate(graphTranslation);
        zoom.scale(zoomFactor);
        graph.options().zoomSlider().updateZoomSliderValue(zoomFactor);
        
        
      });
  };
  
  
  graph.isADraggerActive = function (){
    if ( classDragger.mouseButtonPressed === true ||
      domainDragger.mouseButtonPressed === true ||
      rangeDragger.mouseButtonPressed === true ) {
      return true;
    }
    return false;
  };
  
  /** --------------------------------------------------------- **/
  /** -- VOWL EDITOR  create/ edit /delete functions --         **/
  /** --------------------------------------------------------- **/
  
  graph.changeNodeType = function ( element ){
    
    var typeString = d3.select("#typeEditor").node().value;
    
    if ( graph.classesSanityCheck(element, typeString) === false ) {
      // call reselection to restore previous type selection
      graph.options().editSidebar().updateSelectionInformation(element);
      return;
    }
    
    var prototype = NodePrototypeMap.get(typeString.toLowerCase());
    var aNode = new prototype(graph);
    
    aNode.x = element.x;
    aNode.y = element.y;
    aNode.px = element.x;
    aNode.py = element.y;
    aNode.id(element.id());
    aNode.copyInformation(element);
    
    if ( typeString === "owl:Thing" ) {
      aNode.label("Thing");
    }
    else if ( elementTools.isDatatype(element) === false ) {
      if ( element.backupLabel() !== undefined ) {
        aNode.label(element.backupLabel());
      } else if ( aNode.backupLabel() !== undefined ) {
        aNode.label(aNode.backupLabel());
      } else {
        aNode.label("NewClass");
      }
    }
    
    if ( typeString === "rdfs:Datatype" ) {
      if ( aNode.dType() === "undefined" )
        aNode.label("undefined");
      else {
        var identifier = aNode.dType().split(":")[1];
        aNode.label(identifier);
      }
    }
    var i;
    // updates the property domain and range
    for ( i = 0; i < unfilteredData.properties.length; i++ ) {
      if ( unfilteredData.properties[i].domain() === element ) {
        //  unfilteredData.properties[i].toString();
        unfilteredData.properties[i].domain(aNode);
      }
      if ( unfilteredData.properties[i].range() === element ) {
        unfilteredData.properties[i].range(aNode);
        //  unfilteredData.properties[i].toString();
      }
    }
    
    // update for fastUpdate:
    for ( i = 0; i < properties.length; i++ ) {
      if ( properties[i].domain() === element ) {
        //  unfilteredData.properties[i].toString();
        properties[i].domain(aNode);
      }
      if ( properties[i].range() === element ) {
        properties[i].range(aNode);
        //  unfilteredData.properties[i].toString();
      }
    }
    
    var remId = unfilteredData.nodes.indexOf(element);
    if ( remId !== -1 )
      unfilteredData.nodes.splice(remId, 1);
    remId = classNodes.indexOf(element);
    if ( remId !== -1 )
      classNodes.splice(remId, 1);
    // very important thing for selection!;
    addNewNodeElement(aNode);
    // handle focuser!
    options.focuserModule().handle(aNode);
    generateDictionary(unfilteredData);
    graph.getUpdateDictionary();
    element = null;
  };
  
  
  graph.changePropertyType = function ( element ){
    var typeString = d3.select("#typeEditor").node().value;
    
    // create warning
    if ( graph.sanityCheckProperty(element.domain(), element.range(), typeString) === false ) return false;
    
    var propPrototype = PropertyPrototypeMap.get(typeString.toLowerCase());
    var aProp = new propPrototype(graph);
    aProp.copyInformation(element);
    aProp.id(element.id());
    
    element.domain().removePropertyElement(element);
    element.range().removePropertyElement(element);
    aProp.domain(element.domain());
    aProp.range(element.range());
    
    if ( element.backupLabel() !== undefined ) {
      aProp.label(element.backupLabel());
    } else {
      aProp.label("newObjectProperty");
    }
    
    if ( aProp.type() === "rdfs:subClassOf" ) {
      aProp.iri("http://www.w3.org/2000/01/rdf-schema#subClassOf");
    } else {
      if ( element.iri() === "http://www.w3.org/2000/01/rdf-schema#subClassOf" )
        aProp.iri(graph.options().getGeneralMetaObjectProperty('iri') + aProp.id());
      
    }
    
    
    if ( graph.propertyCheckExistenceChecker(aProp, element.domain(), element.range()) === false ) {
      graph.options().editSidebar().updateSelectionInformation(element);
      return;
    }
    // // TODO: change its base IRI to proper value
    // var ontoIRI="http://someTest.de";
    // aProp.baseIri(ontoIRI);
    // aProp.iri(aProp.baseIri()+aProp.id());
    
    
    // add this to the data;
    unfilteredData.properties.push(aProp);
    if ( properties.indexOf(aProp) === -1 )
      properties.push(aProp);
    var remId = unfilteredData.properties.indexOf(element);
    if ( remId !== -1 )
      unfilteredData.properties.splice(remId, 1);
    if ( properties.indexOf(aProp) === -1 )
      properties.push(aProp);
    remId = properties.indexOf(element);
    if ( remId !== -1 )
      properties.splice(remId, 1);
    graph.fastUpdate();
    aProp.domain().addProperty(aProp);
    aProp.range().addProperty(aProp);
    if ( element.labelObject() && aProp.labelObject() ) {
      aProp.labelObject().x = element.labelObject().x;
      aProp.labelObject().px = element.labelObject().px;
      aProp.labelObject().y = element.labelObject().y;
      aProp.labelObject().py = element.labelObject().py;
    }
    
    options.focuserModule().handle(aProp);
    element = null;
  };
  
  graph.removeEditElements = function (){
    // just added to be called form outside
    removeEditElements();
  };
  
  function removeEditElements(){
    rangeDragger.hideDragger(true);
    domainDragger.hideDragger(true);
    shadowClone.hideClone(true);
    
    classDragger.hideDragger(true);
    if ( addDataPropertyGroupElement )
      addDataPropertyGroupElement.classed("hidden", true);
    if ( deleteGroupElement )
      deleteGroupElement.classed("hidden", true);
    
    
    if ( hoveredNodeElement ) {
      if ( hoveredNodeElement.pinned() === false ) {
        hoveredNodeElement.locked(graph.paused());
        hoveredNodeElement.frozen(graph.paused());
      }
    }
    if ( hoveredPropertyElement ) {
      if ( hoveredPropertyElement.pinned() === false ) {
        hoveredPropertyElement.locked(graph.paused());
        hoveredPropertyElement.frozen(graph.paused());
      }
    }
    
    
  }
  
  graph.editorMode = function ( val ){
    var create_entry = d3.select("#empty");
    var create_container = d3.select("#emptyContainer");
    
    var modeOfOpString = d3.select("#modeOfOperationString").node();
    if ( !arguments.length ) {
      create_entry.node().checked = editMode;
      if ( editMode === false ) {
        create_container.node().title = "Enable editing in modes menu to create a new ontology";
        create_entry.node().title = "Enable editing in modes menu to create a new ontology";
        create_entry.style("pointer-events", "none");
      } else {
        create_container.node().title = "Creates a new empty ontology";
        create_entry.node().title = "Creates a new empty ontology";
        d3.select("#useAccuracyHelper").style("color", "#2980b9");
        d3.select("#useAccuracyHelper").style("pointer-events", "auto");
        create_entry.node().disabled = false;
        create_entry.style("pointer-events", "auto");
      }
      
      return editMode;
    }
    graph.options().setEditorModeForDefaultObject(val);
    
    // if (seenEditorHint===false  && val===true){
    //     seenEditorHint=true;
    //     graph.options().warningModule().showEditorHint();
    // }
    editMode = val;
    
    if ( create_entry ) {
      create_entry.classed("disabled", !editMode);
      if ( !editMode ) {
        create_container.node().title = "Enable editing in modes menu to create a new ontology";
        create_entry.node().title = "Enable editing in modes menu to create a new ontology";
        create_entry.node().disabled = true;
        d3.select("#useAccuracyHelper").style("color", "#979797");
        d3.select("#useAccuracyHelper").style("pointer-events", "none");
        create_entry.style("pointer-events", "none");
      } else {
        create_container.node().title = "Creates a new empty ontology";
        create_entry.node().title = "Creates a new empty ontology";
        d3.select("#useAccuracyHelper").style("color", "#2980b9");
        d3.select("#useAccuracyHelper").style("pointer-events", "auto");
        create_entry.style("pointer-events", "auto");
      }
    }
    
    // adjust compact notation
    // selector = compactNotationOption;
    // box =ModuleCheckbox
    var compactNotationContainer = d3.select("#compactnotationModuleCheckbox");
    if ( compactNotationContainer ) {
      compactNotationContainer.classed("disabled", !editMode);
      if ( !editMode ) {
        compactNotationContainer.node().title = "";
        compactNotationContainer.node().disabled = false;
        compactNotationContainer.style("pointer-events", "auto");
        d3.select("#compactNotationOption").style("color", "");
        d3.select("#compactNotationOption").node().title = "";
        options.literalFilter().enabled(true);
        graph.update();
      } else {
        // if editor Mode
        //1) uncheck the element
        d3.select("#compactNotationOption").node().title = "Compact notation can only be used in view mode";
        compactNotationContainer.node().disabled = true;
        compactNotationContainer.node().checked = false;
        options.compactNotationModule().enabled(false);
        options.literalFilter().enabled(false);
        graph.executeCompactNotationModule();
        graph.executeEmptyLiteralFilter();
        graph.lazyRefresh();
        compactNotationContainer.style("pointer-events", "none");
        d3.select("#compactNotationOption").style("color", "#979797");
      }
    }
    
    if ( modeOfOpString ) {
      if ( touchDevice === true ) {
        modeOfOpString.innerHTML = "touch able device detected";
      } else {
        modeOfOpString.innerHTML = "point & click device detected";
      }
    }
    var svgGraph = d3.selectAll(".vowlGraph");
    
    if ( editMode === true ) {
      options.leftSidebar().showSidebar(options.leftSidebar().getSidebarVisibility(), true);
      options.leftSidebar().hideCollapseButton(false);
      graph.options().editSidebar().updatePrefixUi();
      graph.options().editSidebar().updateElementWidth();
      svgGraph.on("dblclick.zoom", graph.modified_dblClickFunction);
      
    } else {
      svgGraph.on("dblclick.zoom", originalD3_dblClickFunction);
      options.leftSidebar().showSidebar(0);
      options.leftSidebar().hideCollapseButton(true);
      // hide hovered edit elements
      removeEditElements();
    }
    options.sidebar().updateShowedInformation();
    options.editSidebar().updateElementWidth();
    
  };
  
  function createLowerCasePrototypeMap( prototypeMap ){
    return d3.map(prototypeMap.values(), function ( Prototype ){
      return new Prototype().type().toLowerCase();
    });
  }
  
  function createNewNodeAtPosition( pos ){
    var aNode, prototype;
    var forceUpdate = true;
    // create a node of that id;
    
    var typeToCreate = d3.select("#defaultClass").node().title;
    prototype = NodePrototypeMap.get(typeToCreate.toLowerCase());
    aNode = new prototype(graph);
    var autoEditElement = false;
    if ( typeToCreate === "owl:Thing" ) {
      aNode.label("Thing");
    }
    else {
      aNode.label("NewClass");
      autoEditElement = true;
    }
    aNode.x = pos.x;
    aNode.y = pos.y;
    aNode.px = aNode.x;
    aNode.py = aNode.y;
    aNode.id("Class" + eN++);
    // aNode.paused(true);
    
    aNode.baseIri(d3.select("#iriEditor").node().value);
    aNode.iri(aNode.baseIri() + aNode.id());
    addNewNodeElement(aNode, forceUpdate);
    options.focuserModule().handle(aNode, true);
    aNode.frozen(graph.paused());
    aNode.locked(graph.paused());
    aNode.enableEditing(autoEditElement);
  }
  
  
  function addNewNodeElement( element ){
    unfilteredData.nodes.push(element);
    if ( classNodes.indexOf(element) === -1 )
      classNodes.push(element);
    
    generateDictionary(unfilteredData);
    graph.getUpdateDictionary();
    graph.fastUpdate();
  }
  
  graph.getTargetNode = function ( position ){
    var dx = position[0];
    var dy = position[1];
    var tN = null;
    var minDist = 1000000000000;
    // This is a bit OVERKILL for the computation of one node >> TODO: KD-TREE SEARCH
    unfilteredData.nodes.forEach(function ( el ){
      var cDist = Math.sqrt((el.x - dx) * (el.x - dx) + (el.y - dy) * (el.y - dy));
      if ( cDist < minDist ) {
        minDist = cDist;
        tN = el;
      }
    });
    if ( hoveredNodeElement ) {
      var offsetDist = hoveredNodeElement.actualRadius() + 30;
      if ( minDist > offsetDist ) return null;
      if ( tN.renderType() === "rect" ) return null;
      if ( tN === hoveredNodeElement && minDist <= hoveredNodeElement.actualRadius() ) {
        return tN;
      } else if ( tN === hoveredNodeElement && minDist > hoveredNodeElement.actualRadius() ) {
        return null;
      }
      return tN;
    }
    else {
      
      if ( minDist > (tN.actualRadius() + 30) )
        return null;
      else return tN;
      
    }
  };
  
  graph.genericPropertySanityCheck = function ( domain, range, typeString, header, action ){
    if ( domain === range && typeString === "rdfs:subClassOf" ) {
      graph.options().warningModule().showWarning(header,
        "rdfs:subClassOf can not be created as loops (domain == range)",
        action, 1, false);
      return false;
    }
    if ( domain === range && typeString === "owl:disjointWith" ) {
      graph.options().warningModule().showWarning(header,
        "owl:disjointWith  can not be created as loops (domain == range)",
        action, 1, false);
      return false;
    }
    // allProps[i].type()==="owl:allValuesFrom"  ||
    // allProps[i].type()==="owl:someValuesFrom"
    if ( domain.type() === "owl:Thing" && typeString === "owl:allValuesFrom" ) {
      graph.options().warningModule().showWarning(header,
        "owl:allValuesFrom can not originate from owl:Thing",
        action, 1, false);
      return false;
    }
    if ( domain.type() === "owl:Thing" && typeString === "owl:someValuesFrom" ) {
      graph.options().warningModule().showWarning(header,
        "owl:someValuesFrom can not originate from owl:Thing",
        action, 1, false);
      return false;
    }
    
    if ( range.type() === "owl:Thing" && typeString === "owl:allValuesFrom" ) {
      graph.options().warningModule().showWarning(header,
        "owl:allValuesFrom can not be connected to owl:Thing",
        action, 1, false);
      return false;
    }
    if ( range.type() === "owl:Thing" && typeString === "owl:someValuesFrom" ) {
      graph.options().warningModule().showWarning(header,
        "owl:someValuesFrom can not be connected to owl:Thing",
        action, 1, false);
      return false;
    }
    
    return true; // we can Change the domain or range
  };
  
  graph.checkIfIriClassAlreadyExist = function ( url ){
    // search for a class node with this url
    var allNodes = unfilteredData.nodes;
    for ( var i = 0; i < allNodes.length; i++ ) {
      if ( elementTools.isDatatype(allNodes[i]) === true || allNodes[i].type() === "owl:Thing" )
        continue;
      
      // now we are a real class;
      //get class IRI
      var classIRI = allNodes[i].iri();
      
      // this gives me the node for halo
      if ( url === classIRI ) {
        return allNodes[i];
      }
    }
    return false;
  };
  
  graph.classesSanityCheck = function ( classElement, targetType ){
    // this is added due to someValuesFrom properties
    // we should not be able to change a classElement to a owl:Thing
    // when it has a property attached to it that uses these restrictions
    //
    
    if ( targetType === "owl:Class" ) return true;
    
    else {
      // collect all properties which have that one as a domain or range
      var allProps = unfilteredData.properties;
      for ( var i = 0; i < allProps.length; i++ ) {
        if ( allProps[i].range() === classElement || allProps[i].domain() === classElement ) {
          // check for the type of that property
          if ( allProps[i].type() === "owl:someValuesFrom" ) {
            graph.options().warningModule().showWarning("Can not change class type",
              "The element has a property that is of type owl:someValuesFrom",
              "Element type not changed!", 1, true);
            return false;
          }
          if ( allProps[i].type() === "owl:allValuesFrom" ) {
            graph.options().warningModule().showWarning("Can not change class type",
              "The element has a property that is of type owl:allValuesFrom",
              "Element type not changed!", 1, true);
            return false;
          }
        }
      }
      
      
    }
    return true;
  };
  
  graph.propertyCheckExistenceChecker = function ( property, domain, range ){
    var allProps = unfilteredData.properties;
    var i;
    if ( property.type() === "rdfs:subClassOf" || property.type() === "owl:disjointWith" ) {
      
      for ( i = 0; i < allProps.length; i++ ) {
        if ( allProps[i] === property ) continue;
        if ( allProps[i].domain() === domain && allProps[i].range() === range && allProps[i].type() === property.type() ) {
          graph.options().warningModule().showWarning("Warning",
            "This triple already exist!",
            "Element not created!", 1, false);
          return false;
        }
        if ( allProps[i].domain() === range && allProps[i].range() === domain && allProps[i].type() === property.type() ) {
          graph.options().warningModule().showWarning("Warning",
            "Inverse assignment already exist! ",
            "Element not created!", 1, false);
          return false;
        }
      }
      return true;
    }
    return true;
  };
  
  // graph.checkForTripleDuplicate=function(property){
  //     var domain=property.domain();
  //     var range=property.range();
  //     console.log("checking for duplicates");
  //     var b1= domain.isPropertyAssignedToThisElement(property);
  //     var b2= range.isPropertyAssignedToThisElement(property);
  //
  //     console.log("test domain results in "+ b1);
  //     console.log("test range results in "+ b1);
  //
  //     if (b1  && b2 ){
  //         graph.options().warningModule().showWarning("Warning",
  //             "This triple already exist!",
  //             "Element not created!",1,false);
  //         return false;
  //     }
  //     return true;
  // };
  
  graph.sanityCheckProperty = function ( domain, range, typeString ){
    
    // check for duplicate triple in the element;
    
    
    if ( typeString === "owl:objectProperty" && graph.options().objectPropertyFilter().enabled() === true ) {
      graph.options().warningModule().showWarning("Warning",
        "Object properties are filtered out in the visualization!",
        "Element not created!", 1, false);
      return false;
    }
    
    if ( typeString === "owl:disjointWith" && graph.options().disjointPropertyFilter().enabled() === true ) {
      graph.options().warningModule().showWarning("Warning",
        "owl:disjointWith properties are filtered out in the visualization!",
        "Element not created!", 1, false);
      return false;
    }
    
    
    if ( domain === range && typeString === "rdfs:subClassOf" ) {
      graph.options().warningModule().showWarning("Warning",
        "rdfs:subClassOf can not be created as loops (domain == range)",
        "Element not created!", 1, false);
      return false;
    }
    if ( domain === range && typeString === "owl:disjointWith" ) {
      graph.options().warningModule().showWarning("Warning",
        "owl:disjointWith  can not be created as loops (domain == range)",
        "Element not created!", 1, false);
      return false;
    }
    
    if ( domain.type() === "owl:Thing" && typeString === "owl:someValuesFrom" ) {
      graph.options().warningModule().showWarning("Warning",
        "owl:someValuesFrom can not originate from owl:Thing",
        "Element not created!", 1, false);
      return false;
    }
    if ( domain.type() === "owl:Thing" && typeString === "owl:allValuesFrom" ) {
      graph.options().warningModule().showWarning("Warning",
        "owl:allValuesFrom can not originate from owl:Thing",
        "Element not created!", 1, false);
      return false;
    }
    
    if ( range.type() === "owl:Thing" && typeString === "owl:allValuesFrom" ) {
      graph.options().warningModule().showWarning("Warning",
        "owl:allValuesFrom can not be connected to owl:Thing",
        "Element not created!", 1, false);
      return false;
    }
    if ( range.type() === "owl:Thing" && typeString === "owl:someValuesFrom" ) {
      graph.options().warningModule().showWarning("Warning",
        "owl:someValuesFrom can not be connected to owl:Thing",
        "Element not created!", 1, false);
      return false;
    }
    return true; // we can create a property
  };
  
  function createNewObjectProperty( domain, range, draggerEndposition ){
    // check type of the property that we want to create;
    
    var defaultPropertyName = d3.select("#defaultProperty").node().title;
    
    // check if we are allow to create that property
    if ( graph.sanityCheckProperty(domain, range, defaultPropertyName) === false ) return false;
    
    
    var propPrototype = PropertyPrototypeMap.get(defaultPropertyName.toLowerCase());
    var aProp = new propPrototype(graph);
    aProp.id("objectProperty" + eP++);
    aProp.domain(domain);
    aProp.range(range);
    aProp.label("newObjectProperty");
    aProp.baseIri(d3.select("#iriEditor").node().value);
    aProp.iri(aProp.baseIri() + aProp.id());
    
    // check for duplicate;
    if ( graph.propertyCheckExistenceChecker(aProp, domain, range) === false ) {
      // delete aProp;
      // hope for garbage collection here -.-
      return false;
    }
    
    var autoEditElement = false;
    
    if ( defaultPropertyName === "owl:objectProperty" ) {
      autoEditElement = true;
    }
    var pX = 0.49 * (domain.x + range.x);
    var pY = 0.49 * (domain.y + range.y);
    
    if ( domain === range ) {
      // we use the dragger endposition to determine an angle to put the loop there;
      var dirD_x = draggerEndposition[0] - domain.x;
      var dirD_y = draggerEndposition[1] - domain.y;
      
      // normalize;
      var len = Math.sqrt(dirD_x * dirD_x + dirD_y * dirD_y);
      // it should be very hard to set the position on the same sport but why not handling this
      var nx = dirD_x / len;
      var ny = dirD_y / len;
      // is Nan in javascript like in c len==len returns false when it is not a number?
      if ( isNaN(len) ) {
        nx = 0;
        ny = -1;
      }
      
      // get domain actual raidus
      var offset = 2 * domain.actualRadius() + 50;
      pX = domain.x + offset * nx;
      pY = domain.y + offset * ny;
    }
    
    // add this property to domain and range;
    domain.addProperty(aProp);
    range.addProperty(aProp);
    
    
    // add this to the data;
    unfilteredData.properties.push(aProp);
    if ( properties.indexOf(aProp) === -1 )
      properties.push(aProp);
    graph.fastUpdate();
    aProp.labelObject().x = pX;
    aProp.labelObject().px = pX;
    aProp.labelObject().y = pY;
    aProp.labelObject().py = pY;
    
    aProp.frozen(graph.paused());
    aProp.locked(graph.paused());
    domain.frozen(graph.paused());
    domain.locked(graph.paused());
    range.frozen(graph.paused());
    range.locked(graph.paused());
    
    
    generateDictionary(unfilteredData);
    graph.getUpdateDictionary();
    
    options.focuserModule().handle(aProp);
    graph.activateHoverElementsForProperties(true, aProp, false, touchDevice);
    aProp.labelObject().increasedLoopAngle = true;
    aProp.enableEditing(autoEditElement);
  }
  
  graph.createDataTypeProperty = function ( node ){
    // random postion issues;
    clearTimeout(nodeFreezer);
    // tells user when element is filtered out
    if ( graph.options().datatypeFilter().enabled() === true ) {
      graph.options().warningModule().showWarning("Warning",
        "Datatype properties are filtered out in the visualization!",
        "Element not created!", 1, false);
      return;
    }
    
    
    var aNode, prototype;
    
    // create a default datatype Node >> HERE LITERAL;
    var defaultDatatypeName = d3.select("#defaultDatatype").node().title;
    if ( defaultDatatypeName === "rdfs:Literal" ) {
      prototype = NodePrototypeMap.get("rdfs:literal");
      aNode = new prototype(graph);
      aNode.label("Literal");
      aNode.iri("http://www.w3.org/2000/01/rdf-schema#Literal");
      aNode.baseIri("http://www.w3.org/2000/01/rdf-schema#");
    } else {
      prototype = NodePrototypeMap.get("rdfs:datatype");
      aNode = new prototype(graph);
      var identifier = "";
      if ( defaultDatatypeName === "undefined" ) {
        identifier = "undefined";
        
        aNode.label(identifier);
        // TODO : HANDLER FOR UNDEFINED DATATYPES!!<<<>>>>>>>>>>>..
        aNode.iri("http://www.undefinedDatatype.org/#" + identifier);
        aNode.baseIri("http://www.undefinedDatatype.org/#");
        aNode.dType(defaultDatatypeName);
      } else {
        identifier = defaultDatatypeName.split(":")[1];
        aNode.label(identifier);
        aNode.dType(defaultDatatypeName);
        aNode.iri("http://www.w3.org/2001/XMLSchema#" + identifier);
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
    if ( classNodes.indexOf(aNode) === -1 )
      classNodes.push(aNode);
    
    
    // add also the datatype Property to it
    var propPrototype = PropertyPrototypeMap.get("owl:datatypeproperty");
    var aProp = new propPrototype(graph);
    aProp.id("datatypeProperty" + eP++);
    
    // create the connection
    aProp.domain(node);
    aProp.range(aNode);
    aProp.label("newDatatypeProperty");
    
    
    // TODO: change its base IRI to proper value
    var ontoIri = d3.select("#iriEditor").node().value;
    aProp.baseIri(ontoIri);
    aProp.iri(ontoIri + aProp.id());
    // add this to the data;
    unfilteredData.properties.push(aProp);
    if ( properties.indexOf(aProp) === -1 )
      properties.push(aProp);
    graph.fastUpdate();
    generateDictionary(unfilteredData);
    graph.getUpdateDictionary();
    
    nodeFreezer = setTimeout(function (){
      if ( node && node.frozen() === true && node.pinned() === false && graph.paused() === false ) {
        node.frozen(graph.paused());
        node.locked(graph.paused());
      }
    }, 1000);
    options.focuserModule().handle(undefined);
    if ( node ) {
      node.frozen(true);
      node.locked(true);
    }
  };
  
  graph.removeNodesViaResponse = function ( nodesToRemove, propsToRemove ){
    var i, remId;
    // splice them;
    for ( i = 0; i < propsToRemove.length; i++ ) {
      remId = unfilteredData.properties.indexOf(propsToRemove[i]);
      if ( remId !== -1 )
        unfilteredData.properties.splice(remId, 1);
      remId = properties.indexOf(propsToRemove[i]);
      if ( remId !== -1 )
        properties.splice(remId, 1);
      propsToRemove[i] = null;
    }
    for ( i = 0; i < nodesToRemove.length; i++ ) {
      remId = unfilteredData.nodes.indexOf(nodesToRemove[i]);
      if ( remId !== -1 ) {
        unfilteredData.nodes.splice(remId, 1);
      }
      remId = classNodes.indexOf(nodesToRemove[i]);
      if ( remId !== -1 )
        classNodes.splice(remId, 1);
      nodesToRemove[i] = null;
    }
    graph.fastUpdate();
    generateDictionary(unfilteredData);
    graph.getUpdateDictionary();
    options.focuserModule().handle(undefined);
    nodesToRemove = null;
    propsToRemove = null;
    
  };
  
  graph.removeNodeViaEditor = function ( node ){
    var propsToRemove = [];
    var nodesToRemove = [];
    var datatypes = 0;
    
    var remId;
    
    nodesToRemove.push(node);
    for ( var i = 0; i < unfilteredData.properties.length; i++ ) {
      if ( unfilteredData.properties[i].domain() === node || unfilteredData.properties[i].range() === node ) {
        propsToRemove.push(unfilteredData.properties[i]);
        if ( unfilteredData.properties[i].type().toLocaleLowerCase() === "owl:datatypeproperty" &&
          unfilteredData.properties[i].range() !== node ) {
          nodesToRemove.push(unfilteredData.properties[i].range());
          datatypes++;
        }
      }
    }
    var removedItems = propsToRemove.length + nodesToRemove.length;
    if ( removedItems > 2 ) {
      var text = "You are about to delete 1 class and " + propsToRemove.length + " properties";
      if ( datatypes !== 0 ) {
        text = "You are about to delete 1 class, " + datatypes + " datatypes  and " + propsToRemove.length + " properties";
      }
      
      
      graph.options().warningModule().responseWarning(
        "Removing elements",
        text,
        "Awaiting response!", graph.removeNodesViaResponse, [nodesToRemove, propsToRemove], false);
      
      
      //
      // if (confirm("Remove :\n"+propsToRemove.length + " properties\n"+nodesToRemove.length+" classes? ")===false){
      //     return;
      // }else{
      //     // todo : store for undo delete button ;
      // }
    } else {
      // splice them;
      for ( i = 0; i < propsToRemove.length; i++ ) {
        remId = unfilteredData.properties.indexOf(propsToRemove[i]);
        if ( remId !== -1 )
          unfilteredData.properties.splice(remId, 1);
        remId = properties.indexOf(propsToRemove[i]);
        if ( remId !== -1 )
          properties.splice(remId, 1);
        propsToRemove[i] = null;
      }
      for ( i = 0; i < nodesToRemove.length; i++ ) {
        remId = unfilteredData.nodes.indexOf(nodesToRemove[i]);
        if ( remId !== -1 )
          unfilteredData.nodes.splice(remId, 1);
        remId = classNodes.indexOf(nodesToRemove[i]);
        if ( remId !== -1 )
          classNodes.splice(remId, 1);
        nodesToRemove[i] = null;
      }
      graph.fastUpdate();
      generateDictionary(unfilteredData);
      graph.getUpdateDictionary();
      options.focuserModule().handle(undefined);
      nodesToRemove = null;
      propsToRemove = null;
    }
  };
  
  graph.removePropertyViaEditor = function ( property ){
    property.domain().removePropertyElement(property);
    property.range().removePropertyElement(property);
    var remId;
    
    if ( property.type().toLocaleLowerCase() === "owl:datatypeproperty" ) {
      var datatype = property.range();
      remId = unfilteredData.nodes.indexOf(property.range());
      if ( remId !== -1 )
        unfilteredData.nodes.splice(remId, 1);
      remId = classNodes.indexOf(property.range());
      if ( remId !== -1 )
        classNodes.splice(remId, 1);
      datatype = null;
    }
    remId = unfilteredData.properties.indexOf(property);
    if ( remId !== -1 )
      unfilteredData.properties.splice(remId, 1);
    remId = properties.indexOf(property);
    if ( remId !== -1 )
      properties.splice(remId, 1);
    if ( property.inverse() ) {
      // so we have inverse
      property.inverse().inverse(0);
      
    }
    
    
    hoveredPropertyElement = undefined;
    graph.fastUpdate();
    generateDictionary(unfilteredData);
    graph.getUpdateDictionary();
    options.focuserModule().handle(undefined);
    property = null;
  };
  
  graph.executeColorExternalsModule = function (){
    options.colorExternalsModule().filter(unfilteredData.nodes, unfilteredData.properties);
  };
  
  graph.executeCompactNotationModule = function (){
    if ( unfilteredData ) {
      options.compactNotationModule().filter(unfilteredData.nodes, unfilteredData.properties);
    }
    
  };
  graph.executeEmptyLiteralFilter = function (){
    
    if ( unfilteredData && unfilteredData.nodes.length > 1 ) {
      options.literalFilter().filter(unfilteredData.nodes, unfilteredData.properties);
      unfilteredData.nodes = options.literalFilter().filteredNodes();
      unfilteredData.properties = options.literalFilter().filteredProperties();
    }
    
  };
  
  
  /** --------------------------------------------------------- **/
  /** -- animation functions for the nodes --                   **/
  /** --------------------------------------------------------- **/
  
  graph.animateDynamicLabelWidth = function (){
    var wantedWidth = options.dynamicLabelWidth();
    var i;
    for ( i = 0; i < classNodes.length; i++ ) {
      var nodeElement = classNodes[i];
      if ( elementTools.isDatatype(nodeElement) ) {
        nodeElement.animateDynamicLabelWidth(wantedWidth);
      }
    }
    for ( i = 0; i < properties.length; i++ ) {
      properties[i].animateDynamicLabelWidth(wantedWidth);
    }
  };
  
  
  /** --------------------------------------------------------- **/
  /** -- Touch behaviour functions --                   **/
  /** --------------------------------------------------------- **/
  
  graph.setTouchDevice = function ( val ){
    touchDevice = val;
  };
  
  graph.isTouchDevice = function (){
    return touchDevice;
  };
  
  graph.modified_dblClickFunction = function (){
    
    d3.event.stopPropagation();
    d3.event.preventDefault();
    // get position where we want to add the node;
    var grPos = getClickedScreenCoords(d3.event.clientX, d3.event.clientY, graph.translation(), graph.scaleFactor());
    createNewNodeAtPosition(grPos);
  };
  
  function doubletap(){
    var touch_time = d3.event.timeStamp;
    var numTouchers = 1;
    if ( d3.event && d3.event.touches && d3.event.touches.length )
      numTouchers = d3.event.touches.length;
    
    if ( touch_time - last_touch_time < 300 && numTouchers === 1 ) {
      d3.event.stopPropagation();
      if ( editMode === true ) {
        //graph.modified_dblClickFunction();
        d3.event.preventDefault();
        d3.event.stopPropagation();
        last_touch_time = touch_time;
        return true;
      }
    }
    last_touch_time = touch_time;
    return false;
  }
  
  
  function touchzoomed(){
    forceNotZooming = true;
    
    
    var touch_time = d3.event.timeStamp;
    if ( touch_time - last_touch_time < 300 && d3.event.touches.length === 1 ) {
      d3.event.stopPropagation();
      
      if ( editMode === true ) {
        //graph.modified_dblClickFunction();
        d3.event.preventDefault();
        d3.event.stopPropagation();
        zoom.translate(graphTranslation);
        zoom.scale(zoomFactor);
        graph.modified_dblTouchFunction();
      }
      else {
        forceNotZooming = false;
        if ( originalD3_touchZoomFunction )
          originalD3_touchZoomFunction();
      }
      return;
    }
    forceNotZooming = false;
    last_touch_time = touch_time;
    // TODO: WORK AROUND TO CHECK FOR ORIGINAL FUNCTION
    if ( originalD3_touchZoomFunction )
      originalD3_touchZoomFunction();
  }
  
  graph.modified_dblTouchFunction = function ( d ){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    var xy;
    if ( editMode === true ) {
      xy = d3.touches(d3.selectAll(".vowlGraph").node());
    }
    var grPos = getClickedScreenCoords(xy[0][0], xy[0][1], graph.translation(), graph.scaleFactor());
    createNewNodeAtPosition(grPos);
  };
  
  /** --------------------------------------------------------- **/
  /** -- Hover and Selection functions, adding edit elements --  **/
  /** --------------------------------------------------------- **/
  
  graph.ignoreOtherHoverEvents = function ( val ){
    if ( !arguments.length ) {
      return ignoreOtherHoverEvents;
    }
    else  ignoreOtherHoverEvents = val;
  };
  
  function delayedHiddingHoverElements( tbh ){
    if ( tbh === true ) return;
    if ( hoveredNodeElement ) {
      if ( hoveredNodeElement.editingTextElement === true ) return;
      delayedHider = setTimeout(function (){
        deleteGroupElement.classed("hidden", true);
        addDataPropertyGroupElement.classed("hidden", true);
        classDragger.hideDragger(true);
        if ( hoveredNodeElement && hoveredNodeElement.pinned() === false && graph.paused() === false && hoveredNodeElement.editingTextElement === false ) {
          hoveredNodeElement.frozen(false);
          hoveredNodeElement.locked(false);
        }
      }, 1000);
    }
    if ( hoveredPropertyElement ) {
      if ( hoveredPropertyElement.editingTextElement === true ) return;
      delayedHider = setTimeout(function (){
        deleteGroupElement.classed("hidden", true);
        addDataPropertyGroupElement.classed("hidden", true);
        classDragger.hideDragger(true);
        rangeDragger.hideDragger(true);
        domainDragger.hideDragger(true);
        shadowClone.hideClone(true);
        if ( hoveredPropertyElement && hoveredPropertyElement.focused() === true && graph.options().drawPropertyDraggerOnHover() === true ) {
          hoveredPropertyElement.labelObject().increasedLoopAngle = false;
          // lazy update
          recalculatePositions();
        }
        
        if ( hoveredPropertyElement && hoveredPropertyElement.pinned() === false && graph.paused() === false && hoveredPropertyElement.editingTextElement === false ) {
          hoveredPropertyElement.frozen(false);
          hoveredPropertyElement.locked(false);
        }
      }, 1000);
    }
    
  }
  
  
  // TODO : experimental code for updating dynamic label with and its hover element
  graph.hideHoverPropertyElementsForAnimation = function (){
    deleteGroupElement.classed("hidden", true);
  };
  graph.showHoverElementsAfterAnimation = function ( property, inversed ){
    setDeleteHoverElementPositionProperty(property, inversed);
    deleteGroupElement.classed("hidden", false);
    
  };
  
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
  
  function editElementHoverOn( touch ){
    if ( touch === true ) return;
    clearTimeout(delayedHider); // ignore touch behaviour
    
  }
  
  graph.killDelayedTimer = function (){
    clearTimeout(delayedHider);
    clearTimeout(nodeFreezer);
  };
  
  
  function editElementHoverOut( tbh ){
    if ( hoveredNodeElement ) {
      if ( graph.ignoreOtherHoverEvents() === true || tbh === true || hoveredNodeElement.editingTextElement === true ) return;
      delayedHider = setTimeout(function (){
        if ( graph.isADraggerActive() === true ) return;
        deleteGroupElement.classed("hidden", true);
        addDataPropertyGroupElement.classed("hidden", true);
        classDragger.hideDragger(true);
        if ( hoveredNodeElement && hoveredNodeElement.pinned() === false && graph.paused() === false ) {
          hoveredNodeElement.frozen(false);
          hoveredNodeElement.locked(false);
        }
        
      }, 1000);
    }
    if ( hoveredPropertyElement ) {
      if ( graph.ignoreOtherHoverEvents() === true || tbh === true || hoveredPropertyElement.editingTextElement === true ) return;
      delayedHider = setTimeout(function (){
        if ( graph.isADraggerActive() === true ) return;
        deleteGroupElement.classed("hidden", true);
        addDataPropertyGroupElement.classed("hidden", true);
        classDragger.hideDragger(true);
        if ( hoveredPropertyElement && hoveredPropertyElement.pinned() === false && graph.paused() === false ) {
          hoveredPropertyElement.frozen(false);
          hoveredPropertyElement.locked(false);
        }
        
      }, 1000);
    }
  }
  
  graph.activateHoverElementsForProperties = function ( val, property, inversed, touchBehaviour ){
    if ( editMode === false ) return; // nothing to do;
    
    if ( touchBehaviour === undefined )
      touchBehaviour = false;
    
    if ( val === true ) {
      clearTimeout(delayedHider);
      if ( hoveredPropertyElement ) {
        if ( hoveredPropertyElement.domain() === hoveredPropertyElement.range() ) {
          hoveredPropertyElement.labelObject().increasedLoopAngle = false;
          recalculatePositions();
        }
      }
      
      hoveredPropertyElement = property;
      if ( graph.options().drawPropertyDraggerOnHover() === true ) {
        
        
        if ( property.type() !== "owl:DatatypeProperty" ) {
          if ( property.domain() === property.range() ) {
            property.labelObject().increasedLoopAngle = true;
            recalculatePositions();
          }
          shadowClone.setParentProperty(property, inversed);
          rangeDragger.setParentProperty(property, inversed);
          rangeDragger.hideDragger(false);
          rangeDragger.addMouseEvents();
          domainDragger.setParentProperty(property, inversed);
          domainDragger.hideDragger(false);
          domainDragger.addMouseEvents();
          
          
        } else if ( property.type() === "owl:DatatypeProperty" ) {
          shadowClone.setParentProperty(property, inversed);
          rangeDragger.setParentProperty(property, inversed);
          rangeDragger.hideDragger(true);
          rangeDragger.addMouseEvents();
          domainDragger.setParentProperty(property, inversed);
          domainDragger.hideDragger(false);
          domainDragger.addMouseEvents();
        }
      }
      else { // hide when we dont want that option
        if ( graph.options().drawPropertyDraggerOnHover() === true ) {
          rangeDragger.hideDragger(true);
          domainDragger.hideDragger(true);
          shadowClone.hideClone(true);
          if ( property.domain() === property.range() ) {
            property.labelObject().increasedLoopAngle = false;
            recalculatePositions();
          }
        }
      }
      
      if ( hoveredNodeElement ) {
        if ( hoveredNodeElement && hoveredNodeElement.pinned() === false && graph.paused() === false ) {
          hoveredNodeElement.frozen(false);
          hoveredNodeElement.locked(false);
        }
      }
      hoveredNodeElement = undefined;
      deleteGroupElement.classed("hidden", false);
      setDeleteHoverElementPositionProperty(property, inversed);
      deleteGroupElement.selectAll("*").on("click", function (){
        if ( touchBehaviour && property.focused() === false ) {
          graph.options().focuserModule().handle(property);
          return;
        }
        graph.removePropertyViaEditor(property);
        d3.event.stopPropagation();
      });
      classDragger.hideDragger(true);
      addDataPropertyGroupElement.classed("hidden", true);
    } else {
      delayedHiddingHoverElements();
    }
  };
  
  graph.updateDraggerElements = function (){
    
    // set opacity style for all elements
    
    rangeDragger.draggerObject.classed("superOpacityElement", !graph.options().showDraggerObject());
    domainDragger.draggerObject.classed("superOpacityElement", !graph.options().showDraggerObject());
    classDragger.draggerObject.classed("superOpacityElement", !graph.options().showDraggerObject());
    
    nodeContainer.selectAll(".superHiddenElement").classed("superOpacityElement", !graph.options().showDraggerObject());
    labelContainer.selectAll(".superHiddenElement").classed("superOpacityElement", !graph.options().showDraggerObject());
    
    deleteGroupElement.selectAll(".superHiddenElement").classed("superOpacityElement", !graph.options().showDraggerObject());
    addDataPropertyGroupElement.selectAll(".superHiddenElement").classed("superOpacityElement", !graph.options().showDraggerObject());
    
    
  };
  
  function setAddDataPropertyHoverElementPosition( node ){
    var delX, delY = 0;
    if ( node.renderType() === "round" ) {
      var scale = 0.5 * Math.sqrt(2.0);
      var oX = scale * node.actualRadius();
      var oY = scale * node.actualRadius();
      delX = node.x - oX;
      delY = node.y + oY;
      addDataPropertyGroupElement.attr("transform", "translate(" + delX + "," + delY + ")");
    }
  }
  
  function setDeleteHoverElementPosition( node ){
    var delX, delY = 0;
    if ( node.renderType() === "round" ) {
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
  
  function setDeleteHoverElementPositionProperty( property, inversed ){
    if ( property && property.labelElement() ) {
      var pos = [property.labelObject().x, property.labelObject().y];
      var widthElement = parseFloat(property.getShapeElement().attr("width"));
      var heightElement = parseFloat(property.getShapeElement().attr("height"));
      var delX = pos[0] + 0.5 * widthElement + 6;
      var delY = pos[1] - 0.5 * heightElement - 6;
      // this is the lower element
      if ( property.labelElement().attr("transform") === "translate(0,15)" )
        delY += 15;
      // this is upper element
      if ( property.labelElement().attr("transform") === "translate(0,-15)" )
        delY -= 15;
      deleteGroupElement.attr("transform", "translate(" + delX + "," + delY + ")");
    } else {
      deleteGroupElement.classed("hidden", true);// hide when there is no property
    }
    
    
  }
  
  graph.activateHoverElements = function ( val, node, touchBehaviour ){
    if ( editMode === false ) {
      return; // nothing to do;
    }
    if ( touchBehaviour === undefined ) touchBehaviour = false;
    if ( val === true ) {
      if ( graph.options().drawPropertyDraggerOnHover() === true ) {
        rangeDragger.hideDragger(true);
        domainDragger.hideDragger(true);
        shadowClone.hideClone(true);
      }
      // make them visible
      clearTimeout(delayedHider);
      clearTimeout(nodeFreezer);
      if ( hoveredNodeElement && node.pinned() === false && graph.paused() === false ) {
        hoveredNodeElement.frozen(false);
        hoveredNodeElement.locked(false);
      }
      hoveredNodeElement = node;
      if ( node && node.frozen() === false && node.pinned() === false ) {
        node.frozen(true);
        node.locked(false);
      }
      if ( hoveredPropertyElement && hoveredPropertyElement.focused() === false ) {
        hoveredPropertyElement.labelObject().increasedLoopAngle = false;
        recalculatePositions();
        // update the loopAngles;
        
      }
      hoveredPropertyElement = undefined;
      deleteGroupElement.classed("hidden", false);
      setDeleteHoverElementPosition(node);
      
      
      deleteGroupElement.selectAll("*").on("click", function (){
        if ( touchBehaviour && node.focused() === false ) {
          graph.options().focuserModule().handle(node);
          return;
        }
        graph.removeNodeViaEditor(node);
        d3.event.stopPropagation();
      })
        .on("mouseover", function (){
          editElementHoverOn(node, touchBehaviour);
        })
        .on("mouseout", function (){
          editElementHoverOut(node, touchBehaviour);
        });
      
      addDataPropertyGroupElement.classed("hidden", true);
      classDragger.nodeElement.on("mouseover", editElementHoverOn)
        .on("mouseout", editElementHoverOut);
      classDragger.draggerObject.on("mouseover", editElementHoverOnHidden)
        .on("mouseout", editElementHoverOutHidden);
      
      // add the dragger element;
      if ( node.renderType() === "round" ) {
        classDragger.svgRoot(draggerLayer);
        classDragger.setParentNode(node);
        classDragger.hideDragger(false);
        addDataPropertyGroupElement.classed("hidden", false);
        setAddDataPropertyHoverElementPosition(node);
        addDataPropertyGroupElement.selectAll("*").on("click", function (){
          if ( touchBehaviour && node.focused() === false ) {
            graph.options().focuserModule().handle(node);
            return;
          }
          graph.createDataTypeProperty(node);
          d3.event.stopPropagation();
        })
          .on("mouseover", function (){
            editElementHoverOn(node, touchBehaviour);
          })
          .on("mouseout", function (){
            editElementHoverOut(node, touchBehaviour);
          });
      } else {
        classDragger.hideDragger(true);
        
      }
      
    } else {
      delayedHiddingHoverElements(node, touchBehaviour);
      
    }
  };
  
  
  return graph;
};
