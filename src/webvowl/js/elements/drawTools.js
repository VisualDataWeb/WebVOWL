/**
 * Contains reusable function for drawing nodes.
 */
module.exports = (function (){
  
  var tools = {};
  
  /**
   * Append a circular class node with the passed attributes.
   * @param parent the parent element to which the circle will be appended
   * @param radius
   * @param [cssClasses] an array of additional css classes
   * @param [tooltip]
   * @param [backgroundColor]
   * @returns {*}
   */
  tools.appendCircularClass = function ( parent, radius, cssClasses, tooltip, backgroundColor ){
    var circle = parent.append("circle")
      .classed("class", true)
      .attr("r", radius);
    
    addCssClasses(circle, cssClasses);
    addToolTip(circle, tooltip);
    addBackgroundColor(circle, backgroundColor);
    
    return circle;
  };
  
  function addCssClasses( element, cssClasses ){
    if ( cssClasses instanceof Array ) {
      cssClasses.forEach(function ( cssClass ){
        element.classed(cssClass, true);
      });
    }
  }
  
  function addToolTip( element, tooltip ){
    if ( tooltip ) {
      element.append("title").text(tooltip);
    }
  }
  
  function addBackgroundColor( element, backgroundColor ){
    if ( backgroundColor ) {
      element.style("fill", backgroundColor);
    }
  }
  
  /**
   * Appends a rectangular class node with the passed attributes.
   * @param parent the parent element to which the rectangle will be appended
   * @param width
   * @param height
   * @param [cssClasses] an array of additional css classes
   * @param [tooltip]
   * @param [backgroundColor]
   * @returns {*}
   */
  tools.appendRectangularClass = function ( parent, width, height, cssClasses, tooltip, backgroundColor ){
    var rectangle = parent.append("rect")
      .classed("class", true)
      .attr("x", -width / 2)
      .attr("y", -height / 2)
      .attr("width", width)
      .attr("height", height);
    
    addCssClasses(rectangle, cssClasses);
    addToolTip(rectangle, tooltip);
    addBackgroundColor(rectangle, backgroundColor);
    
    return rectangle;
  };
  
  tools.drawPin = function ( container, dx, dy, onClick, accuraciesHelperFunction, useAccuracyHelper ){
    var pinGroupElement = container
      .append("g")
      .classed("hidden-in-export", true)
      .attr("transform", "translate(" + dx + "," + dy + ")");
    
    var base = pinGroupElement.append("circle")
      .classed("class pin feature", true)
      .attr("r", 12)
      .on("click", function (){
        if ( onClick ) {
          onClick();
        }
        d3.event.stopPropagation();
      });
    
    pinGroupElement.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 12)
      .attr("y2", 16);
    
    if ( useAccuracyHelper === true ) {
      pinGroupElement.append("circle")
        .attr("r", 15)
        .attr("cx", -7)
        .attr("cy", -7)
        .classed("superHiddenElement ", true)
        .classed("superOpacityElement", !accuraciesHelperFunction())
        .on("click", function (){
          if ( onClick ) {
            onClick();
          }
          d3.event.stopPropagation();
        })
        .on("mouseover", function (){
          base.classed("feature_hover", true);
        })
        .on("mouseout", function (){
          base.classed("feature_hover", false);
        })
      ;
      
    }
    
    
    return pinGroupElement;
  };
  
  tools.drawRectHalo = function ( node, width, height, offset ){
    var container;
    if ( node.nodeElement )
      container = node.nodeElement();
    else
      container = node.labelElement();
    
    if ( !container ) {
      // console.log("no container found");
      return;
    }
    
    var haloGroupElement = container
      .append("g")
      .classed("hidden-in-export", true);
    
    haloGroupElement.append("rect")
      .classed("searchResultA", true)
      .attr("x", (-width - offset) / 2)
      .attr("y", (-offset - height) / 2)
      .attr("width", width + offset)
      .attr("height", height + offset);
    haloGroupElement.attr("animationRunning", true);
    
    haloGroupElement.node().addEventListener("webkitAnimationEnd", function (){
      var test = haloGroupElement.selectAll(".searchResultA");
      test.classed("searchResultA", false)
        .classed("searchResultB", true);
      haloGroupElement.attr("animationRunning", false);
    });
    haloGroupElement.node().addEventListener("animationend", function (){
      var test = haloGroupElement.selectAll(".searchResultA");
      test.classed("searchResultA", false)
        .classed("searchResultB", true);
      haloGroupElement.attr("animationRunning", false);
    });
    
    
    return haloGroupElement;
    
  };
  tools.drawHalo = function ( container, radius ){
    if ( container === undefined ) {
      return null;
      // there is no element to add the halo to;
      // this means the node was not rendered previously
    }
    
    var haloGroupElement = container
      .append("g")
      .classed("hidden-in-export", true);
    
    
    haloGroupElement.append("circle", ":first-child")
      .classed("searchResultA", true)
      .attr("r", radius + 15);
    haloGroupElement.attr("animationRunning", true);
    
    
    haloGroupElement.node().addEventListener("webkitAnimationEnd", function (){
      var test = haloGroupElement.selectAll(".searchResultA");
      test.classed("searchResultA", false)
        .classed("searchResultB", true)
        .attr("animationRunning", false);
      haloGroupElement.attr("animationRunning", false);
    });
    haloGroupElement.node().addEventListener("animationend", function (){
      var test = haloGroupElement.selectAll(".searchResultA");
      test.classed("searchResultA", false)
        .classed("searchResultB", true)
        .attr("animationRunning", false);
      haloGroupElement.attr("animationRunning", false);
    });
    
    return haloGroupElement;
  };
  
  return function (){
    // Encapsulate into function to maintain default.module.path()
    return tools;
  };
})();
