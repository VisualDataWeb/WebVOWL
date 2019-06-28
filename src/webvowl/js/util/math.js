/**
 * Contains a collection of mathematical functions with some additional data
 * used for WebVOWL.
 */
module.exports = (function (){
  
  var math = {},
    loopFunction = d3.svg.line()
      .x(function ( d ){
        return d.x;
      })
      .y(function ( d ){
        return d.y;
      })
      .interpolate("cardinal")
      .tension(-1);
  
  
  /**
   * Calculates the normal vector of the path between the two nodes.
   * @param source the first node
   * @param target the second node
   * @param length the length of the calculated normal vector
   * @returns {{x: number, y: number}}
   */
  math.calculateNormalVector = function ( source, target, length ){
    var dx = target.x - source.x,
      dy = target.y - source.y;
    
    var nx = -dy,
      ny = dx;
    
    var vlength = Math.sqrt(nx * nx + ny * ny);
    
    var ratio = vlength !== 0 ? length / vlength : 0;
    
    return { "x": nx * ratio, "y": ny * ratio };
  };
  
  /**
   * Calculates the path for a link, if it is a loop. Currently only working for circlular nodes.
   * @param link the link
   * @returns {*}
   */
  
  
  
  math.getLoopPoints = function ( link ){
    var node = link.domain(),
      label = link.label();
    
    var fairShareLoopAngle = 360 / link.loops().length,
      fairShareLoopAngleWithMargin = fairShareLoopAngle * 0.8,
      loopAngle = Math.min(60, fairShareLoopAngleWithMargin);
    
    if ( label.increasedLoopAngle === true )
      loopAngle = 120;
    
    
    var dx = label.x - node.x,
      dy = label.y - node.y,
      labelRadian = Math.atan2(dy, dx),
      labelAngle = calculateAngle(labelRadian);
    
    var startAngle = labelAngle - loopAngle / 2,
      endAngle = labelAngle + loopAngle / 2;
    
    
    var arcFrom = calculateRadian(startAngle),
      arcTo = calculateRadian(endAngle),
      
      x1 = Math.cos(arcFrom) * node.actualRadius(),
      y1 = Math.sin(arcFrom) * node.actualRadius(),
      
      x2 = Math.cos(arcTo) * node.actualRadius(),
      y2 = Math.sin(arcTo) * node.actualRadius(),
      
      fixPoint1 = { "x": node.x + x1, "y": node.y + y1 },
      fixPoint2 = { "x": node.x + x2, "y": node.y + y2 };
    
    return [fixPoint1, fixPoint2];
  };
  math.calculateLoopPath = function ( link ){
    var node = link.domain(),
      label = link.label();
    
    
    var fairShareLoopAngle = 360 / link.loops().length,
      fairShareLoopAngleWithMargin = fairShareLoopAngle * 0.8,
      loopAngle = Math.min(60, fairShareLoopAngleWithMargin);
    
    if ( label.increasedLoopAngle === true )
      loopAngle = 120;
    
    var dx = label.x - node.x,
      dy = label.y - node.y,
      labelRadian = Math.atan2(dy, dx),
      labelAngle = calculateAngle(labelRadian);
    
    var startAngle = labelAngle - loopAngle / 2,
      endAngle = labelAngle + loopAngle / 2;
    
    var arcFrom = calculateRadian(startAngle),
      arcTo = calculateRadian(endAngle),
      
      x1 = Math.cos(arcFrom) * node.actualRadius(),
      y1 = Math.sin(arcFrom) * node.actualRadius(),
      
      x2 = Math.cos(arcTo) * node.actualRadius(),
      y2 = Math.sin(arcTo) * node.actualRadius(),
      
      fixPoint1 = { "x": node.x + x1, "y": node.y + y1 },
      fixPoint2 = { "x": node.x + x2, "y": node.y + y2 };
    
    return loopFunction([fixPoint1, link.label(), fixPoint2]);
  };
  
  math.calculateLoopPoints = function ( link ){
    var node = link.domain(),
      label = link.label();
    
    var fairShareLoopAngle = 360 / link.loops().length,
      fairShareLoopAngleWithMargin = fairShareLoopAngle * 0.8,
      loopAngle = Math.min(60, fairShareLoopAngleWithMargin);
    
    var dx = label.x - node.x,
      dy = label.y - node.y,
      labelRadian = Math.atan2(dy, dx),
      labelAngle = calculateAngle(labelRadian);
    
    var startAngle = labelAngle - loopAngle / 2,
      endAngle = labelAngle + loopAngle / 2;
    
    var arcFrom = calculateRadian(startAngle),
      arcTo = calculateRadian(endAngle),
      
      x1 = Math.cos(arcFrom) * node.actualRadius(),
      y1 = Math.sin(arcFrom) * node.actualRadius(),
      
      x2 = Math.cos(arcTo) * (node.actualRadius()),
      y2 = Math.sin(arcTo) * (node.actualRadius()),
      
      fixPoint1 = { "x": node.x + x1, "y": node.y + y1 },
      fixPoint2 = { "x": node.x + x2, "y": node.y + y2 };
    
    return [fixPoint1, link.label(), fixPoint2];
  };
  
  /**
   * @param angle
   * @returns {number} the radian of the angle
   */
  function calculateRadian( angle ){
    angle = angle % 360;
    if ( angle < 0 ) {
      angle = angle + 360;
    }
    return (Math.PI * angle) / 180;
  }
  
  /**
   * @param radian
   * @returns {number} the angle of the radian
   */
  function calculateAngle( radian ){
    return radian * (180 / Math.PI);
  }
  
  /**
   * Calculates the point where the link between the source and target node
   * intersects the border of the target node.
   * @param source the source node
   * @param target the target node
   * @param additionalDistance additional distance the
   * @returns {{x: number, y: number}}
   */
  math.calculateIntersection = function ( source, target, additionalDistance ){
    var dx = target.x - source.x,
      dy = target.y - source.y,
      length = Math.sqrt(dx * dx + dy * dy);
    
    if ( length === 0 ) {
      return { x: source.x, y: source.y };
    }
    
    var innerDistance = target.distanceToBorder(dx, dy);
    
    var ratio = (length - (innerDistance + additionalDistance)) / length,
      x = dx * ratio + source.x,
      y = dy * ratio + source.y;
    
    return { x: x, y: y };
  };
  
  /**
   * Calculates the position between the two points.
   * @param firstPoint
   * @param secondPoint
   * @returns {{x: number, y: number}}
   */
  math.calculateCenter = function ( firstPoint, secondPoint ){
    return {
      x: (firstPoint.x + secondPoint.x) / 2,
      y: (firstPoint.y + secondPoint.y) / 2
    };
  };
  
  
  return function (){
    /* Use a function here to keep a consistent style like webvowl.path.to.module()
     * despite having just a single math object. */
    return math;
  };
})();
