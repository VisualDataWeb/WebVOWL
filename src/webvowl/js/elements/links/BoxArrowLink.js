var PlainLink = require("./PlainLink");


module.exports = BoxArrowLink;

function BoxArrowLink( domain, range, property ){
  PlainLink.apply(this, arguments);
}

BoxArrowLink.prototype = Object.create(PlainLink.prototype);
BoxArrowLink.prototype.constructor = BoxArrowLink;


BoxArrowLink.prototype.draw = function ( linkGroup, markerContainer ){
  var property = this.label().property();
  var inverse = this.label().inverse();
  
  createPropertyMarker(markerContainer, property);
  if ( inverse ) {
    createInverseMarker(markerContainer, inverse);
  }
  
  PlainLink.prototype.draw.apply(this, arguments);
  
  // attach the markers to the link
  linkGroup.attr("marker-start", "url(#" + property.markerId() + ")");
  if ( inverse ) {
    linkGroup.attr("marker-end", "url(#" + inverse.markerId() + ")");
  }
};


function createPropertyMarker( markerContainer, inverse ){
  var inverseMarker = appendBasicMarker(markerContainer, inverse);
  inverseMarker.attr("refX", -8);
  inverseMarker.append("path")
    .attr("d", "M0,-8L8,0L0,8L-8,0L0,-8L8,0")
    .classed(inverse.markerType(), true);
  
  inverse.markerElement(inverseMarker);
}

function createInverseMarker( markerContainer, property ){
  var marker = appendBasicMarker(markerContainer, property);
  marker.attr("refX", 8);
  marker.append("path")
    .attr("d", "M0,-8L8,0L0,8L-8,0L0,-8L8,0")
    .classed(property.markerType(), true);
  
  property.markerElement(marker);
}

function appendBasicMarker( markerContainer, property ){
  return markerContainer.append("marker")
    .datum(property)
    .attr("id", property.markerId())
    .attr("viewBox", "-10 -10 20 20")
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("markerUnits", "userSpaceOnUse")
    .attr("orient", "auto");
}
