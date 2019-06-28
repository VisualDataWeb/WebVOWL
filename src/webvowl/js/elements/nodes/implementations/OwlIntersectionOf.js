var SetOperatorNode = require("../SetOperatorNode");

module.exports = (function (){
  
  var o = function ( graph ){
    SetOperatorNode.apply(this, arguments);
    
    var that = this,
      superDrawFunction = that.draw,
      INTERSECTION_BACKGROUND_PATH = createIntersectionPath();
    
    this.styleClass("intersectionof")
      .type("owl:intersectionOf");
    
    this.draw = function ( element ){
      superDrawFunction(element);
      
      var symbol = element.append("g").classed("embedded", true);
      
      var symbolRadius = 10;
      symbol.append("path")
        .attr("class", "nostroke")
        .classed("symbol", true)
        .attr("d", INTERSECTION_BACKGROUND_PATH);
      symbol.append("circle")
        .attr("class", "nofill")
        .classed("fineline", true)
        .attr("r", symbolRadius);
      symbol.append("circle")
        .attr("cx", 10)
        .attr("class", "nofill")
        .classed("fineline", true)
        .attr("r", symbolRadius);
      symbol.append("path")
        .attr("class", "nofill")
        .attr("d", "m 9,5 c 0,-2 0,-4 0,-6 0,0 0,0 0,0 0,0 0,-1.8 -1,-2.3 -0.7,-0.6 -1.7,-0.8 -2.9," +
          "-0.8 -1.2,0 -2,0 -3,0.8 -0.7,0.5 -1,1.4 -1,2.3 0,2 0,4 0,6")
        .attr("transform", "scale(.5)translate(5,0)");
      
      symbol.attr("transform",
        "translate(-" + (that.radius() - 15) / 7 + ",-" + (that.radius() - 15) / 100 + ")");
      
      that.postDrawActions();
    };
    
    function createIntersectionPath(){
      var height = 18;
      
      var offsetX = 5;
      var offsetY = -(height / 2);
      
      var bezierX = 7;
      var bezierY = 5;
      var bottomBezierY = height - bezierY;
      
      var startPosition = "M" + offsetX + "," + offsetY;
      var rightSide = "c" + bezierX + "," + bezierY + " " + bezierX + "," + bottomBezierY + " 0," + height;
      var leftSide = "c" + -bezierX + "," + -bezierY + " " + -bezierX + "," + -bottomBezierY + " 0," + -height;
      
      return startPosition + rightSide + leftSide;
    }
  };
  o.prototype = Object.create(SetOperatorNode.prototype);
  o.prototype.constructor = o;
  
  return o;
}());
