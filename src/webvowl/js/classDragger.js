module.exports = function ( graph ){
  /** variable defs **/
  var Class_dragger = {};
  Class_dragger.nodeId = 10001;
  Class_dragger.parent = undefined;
  Class_dragger.x = 0;
  Class_dragger.y = 0;
  Class_dragger.rootElement = undefined;
  Class_dragger.rootNodeLayer = undefined;
  Class_dragger.pathLayer = undefined;
  Class_dragger.mouseEnteredVar = false;
  Class_dragger.mouseButtonPressed = false;
  Class_dragger.nodeElement = undefined;
  Class_dragger.draggerObject = undefined;
  Class_dragger.pathElement = undefined;
  Class_dragger.typus = "Class_dragger";
  
  Class_dragger.type = function (){
    return Class_dragger.typus;
  };
  
  Class_dragger.parentNode = function (){
    return Class_dragger.parent;
  };
  
  Class_dragger.hideClass_dragger = function ( val ){
    Class_dragger.pathElement.classed("hidden", val);
    Class_dragger.nodeElement.classed("hidden", val);
    Class_dragger.draggerObject.classed("hidden", val);
  };
  
  Class_dragger.setParentNode = function ( parentNode ){
    Class_dragger.parent = parentNode;
    
    if ( Class_dragger.mouseButtonPressed === false ) {
      if ( Class_dragger.parent.actualRadius && Class_dragger.parent.actualRadius() ) {
        Class_dragger.x = Class_dragger.parent.x + 10 + Class_dragger.parent.actualRadius();
        Class_dragger.y = Class_dragger.parent.y + 10 + Class_dragger.parent.actualRadius();
      } else {
        Class_dragger.x = Class_dragger.parent.x + 60;
        Class_dragger.y = Class_dragger.parent.y + 60;
      }
    }
    Class_dragger.updateElement();
  };
  
  Class_dragger.hideDragger = function ( val ){
    if ( Class_dragger.pathElement ) Class_dragger.pathElement.classed("hidden", val);
    if ( Class_dragger.nodeElement ) Class_dragger.nodeElement.classed("hidden", val);
    if ( Class_dragger.draggerObject ) Class_dragger.draggerObject.classed("hidden", val);
    
  };
  /** BASE HANDLING FUNCTIONS ------------------------------------------------- **/
  Class_dragger.id = function ( index ){
    if ( !arguments.length ) {
      return Class_dragger.nodeId;
    }
    Class_dragger.nodeId = index;
  };
  
  Class_dragger.svgPathLayer = function ( layer ){
    Class_dragger.pathLayer = layer.append('g');
  };
  
  Class_dragger.svgRoot = function ( root ){
    if ( !arguments.length )
      return Class_dragger.rootElement;
    Class_dragger.rootElement = root;
    Class_dragger.rootNodeLayer = Class_dragger.rootElement.append('g');
    Class_dragger.addMouseEvents();
  };
  
  /** DRAWING FUNCTIONS ------------------------------------------------- **/
  Class_dragger.drawNode = function (){
    Class_dragger.pathElement = Class_dragger.pathLayer.append('line')
      .classed("classNodeDragPath", true);
    Class_dragger.pathElement.attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 0);
    
    // var lineData = [
    //     {"x": 0, "y": 0},
    //     {"x": 0, "y": 40},
    //     {"x": -40, "y": 0},
    //     {"x": 0, "y": -40},
    //     {"x": 0, "y": 0}
    // ];
    
    var lineData = [
      { "x": -40, "y": 0 }, // start
      { "x": -20, "y": -10 },
      { "x": 20, "y": -50 },
      { "x": -10, "y": 0 }, // center
      { "x": 20, "y": 50 },
      { "x": -20, "y": 10 },
      { "x": -40, "y": 0 }
    ];
    
    
    var lineFunction = d3.svg.line()
      .x(function ( d ){
        return d.x;
      })
      .y(function ( d ){
        return d.y;
      })
      .interpolate("basis-closed");
    var pathData = "M 20,40 C 0,15 0,-15 20,-40 L -40,0 Z";
    // var pathData="M 20,40 C 0,15 0,-15 20,-40 20,-40 -35.22907,-23.905556 -45.113897,0.06313453 -35.22907,20.095453 20,40 20,40 Z";
    // var pathData="M 39.107144,51.25 C 0,17.362169 0,-13.75 39.285715,-49.821429 c 0,0 -69.58321,34.511175 -100.714286,50.35714329 C -22.96643,20.324376 39.107144,51.25 39.107144,51.25 Z";
    
    Class_dragger.nodeElement = Class_dragger.rootNodeLayer.append('path').attr("d", pathData);
    Class_dragger.nodeElement.classed("classDraggerNode", true);
    Class_dragger.draggerObject = Class_dragger.rootNodeLayer.append("circle");
    if ( graph.options().useAccuracyHelper() ) {
      Class_dragger.draggerObject.attr("r", 40)
        .attr("cx", 0)
        .attr("cy", 0)
        .classed("superHiddenElement", true);
      Class_dragger.draggerObject.classed("superOpacityElement", !graph.options().showDraggerObject());
    }
    
    
  };
  
  Class_dragger.updateElement = function (){
    
    // Class_dragger.pathLayer.attr("transform", "translate(" + Class_dragger.x + "," + Class_dragger.y + ")");
    // Class_dragger.rootElement.attr("transform", "translate(" + Class_dragger.x + "," + Class_dragger.y + ")");
    if ( Class_dragger.pathElement ) {
      
      // compute start point ;
      
      
      var sX = Class_dragger.parent.x,
        sY = Class_dragger.parent.y,
        eX = Class_dragger.x,
        eY = Class_dragger.y;
      
      
      // this is used only when you dont have a proper layout ordering;
      var dirX = eX - sX;
      var dirY = eY - sY;
      var len = Math.sqrt((dirX * dirX) + (dirY * dirY));
      
      var nX = dirX / len;
      var nY = dirY / len;
      
      var ppX = sX + nX * Class_dragger.parent.actualRadius();
      var ppY = sY + nY * Class_dragger.parent.actualRadius();
      
      var ncx = nX * 15;
      var ncy = nY * 15;
      Class_dragger.draggerObject.attr("cx", ncx)
        .attr("cy", ncy);
      
      Class_dragger.pathElement.attr("x1", ppX)
        .attr("y1", ppY)
        .attr("x2", eX)
        .attr("y2", eY);
    }
    var angle = Math.atan2(Class_dragger.parent.y - Class_dragger.y, Class_dragger.parent.x - Class_dragger.x) * 180 / Math.PI;
    
    Class_dragger.nodeElement.attr("transform", "translate(" + Class_dragger.x + "," + Class_dragger.y + ")" + "rotate(" + angle + ")");
    Class_dragger.draggerObject.attr("transform", "translate(" + Class_dragger.x + "," + Class_dragger.y + ")");
    // console.log("update Elmenent root element"+Class_dragger.x + "," + Class_dragger.y );
    //
    // Class_dragger.nodeElement.attr("transform", function (d) {
    //     return "rotate(" + angle + ")";
    // });
  };
  
  /** MOUSE HANDLING FUNCTIONS ------------------------------------------------- **/
  
  Class_dragger.addMouseEvents = function (){
    // console.log("adding mouse events");
    Class_dragger.rootNodeLayer.selectAll("*").on("mouseover", Class_dragger.onMouseOver)
      .on("mouseout", Class_dragger.onMouseOut)
      .on("click", function (){
      })
      .on("dblclick", function (){
      })
      .on("mousedown", Class_dragger.mouseDown)
      .on("mouseup", Class_dragger.mouseUp);
  };
  
  Class_dragger.mouseDown = function (){
    Class_dragger.nodeElement.style("cursor", "move");
    Class_dragger.nodeElement.classed("classDraggerNodeHovered", true);
    Class_dragger.mouseButtonPressed = true;
    console.log("Mouse DOWN from Dragger");
  };
  
  Class_dragger.mouseUp = function (){
    Class_dragger.nodeElement.style("cursor", "auto");
    Class_dragger.mouseButtonPressed = false;
    console.log("Mouse UP from Dragger");
  };
  
  
  Class_dragger.mouseEntered = function ( p ){
    if ( !arguments.length ) return Class_dragger.mouseEnteredVar;
    Class_dragger.mouseEnteredVar = p;
    return Class_dragger;
  };
  
  Class_dragger.selectedViaTouch = function ( val ){
    Class_dragger.nodeElement.classed("classDraggerNode", !val);
    Class_dragger.nodeElement.classed("classDraggerNodeHovered", val);
    
  };
  
  Class_dragger.onMouseOver = function (){
    if ( Class_dragger.mouseEntered() ) {
      return;
    }
    Class_dragger.nodeElement.classed("classDraggerNode", false);
    Class_dragger.nodeElement.classed("classDraggerNodeHovered", true);
    var selectedNode = Class_dragger.rootElement.node(),
      nodeContainer = selectedNode.parentNode;
    nodeContainer.appendChild(selectedNode);
    
    Class_dragger.mouseEntered(true);
    
  };
  Class_dragger.onMouseOut = function (){
    if ( Class_dragger.mouseButtonPressed === true )
      return;
    Class_dragger.nodeElement.classed("classDraggerNodeHovered", false);
    Class_dragger.nodeElement.classed("classDraggerNode", true);
    Class_dragger.mouseEntered(false);
  };
  
  Class_dragger.setPosition = function ( x, y ){
    
    Class_dragger.x = x;
    Class_dragger.y = y;
    Class_dragger.updateElement();
  };
  
  Class_dragger.setAdditionalClassForClass_dragger = function ( name, val ){
    // console.log("Class_dragger should sett the class here")
    // Class_dragger.nodeElement.classed(name,val);
    
  };
  return Class_dragger;
};


