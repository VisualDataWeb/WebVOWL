var tools = {};
module.exports = function (){
  return tools;
};

tools.distanceToBorder = function ( rect, dx, dy ){
  var width = rect.width(),
    height = rect.height();
  
  var innerDistance,
    m_link = Math.abs(dy / dx),
    m_rect = height / width;
  
  if ( m_link <= m_rect ) {
    var timesX = dx / (width / 2),
      rectY = dy / timesX;
    innerDistance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(rectY, 2));
  } else {
    var timesY = dy / (height / 2),
      rectX = dx / timesY;
    innerDistance = Math.sqrt(Math.pow(height / 2, 2) + Math.pow(rectX, 2));
  }
  
  return innerDistance;
};
