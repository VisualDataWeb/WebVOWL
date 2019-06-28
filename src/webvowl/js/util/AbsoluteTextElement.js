var textTools = require("./textTools")();
var AbstractTextElement = require("./AbstractTextElement");

module.exports = AbsoluteTextElement;
function AbsoluteTextElement( container, backgroundColor ){
  AbstractTextElement.apply(this, arguments);
}

AbsoluteTextElement.prototype = Object.create(AbstractTextElement.prototype);
AbsoluteTextElement.prototype.constructor = AbsoluteTextElement;

AbsoluteTextElement.prototype.addText = function ( text, yShift, prefix, suffix ){
  if ( text ) {
    this.addTextline(text, this.CSS_CLASSES.default, yShift, prefix, suffix);
  }
};

AbsoluteTextElement.prototype.addSubText = function ( text, yShift ){
  if ( text ) {
    this.addTextline(text, this.CSS_CLASSES.subtext, yShift, "(", ")");
  }
};

AbsoluteTextElement.prototype.addEquivalents = function ( text, yShift ){
  if ( text ) {
    this.addTextline(text, this.CSS_CLASSES.default, yShift);
  }
};

AbsoluteTextElement.prototype.addInstanceCount = function ( instanceCount, yShift ){
  if ( instanceCount ) {
    this.addTextline(instanceCount.toString(), this.CSS_CLASSES.instanceCount, yShift);
  }
};


AbsoluteTextElement.prototype.addTextline = function ( text, style, yShift, prefix, postfix ){
  var truncatedText = textTools.truncate(text, this._textBlock().datum().textWidth(yShift), style);
  
  var tspan = this._textBlock().append("tspan")
    .classed(this.CSS_CLASSES.default, true)
    .classed(style, true)
    .text(this._applyPreAndPostFix(truncatedText, prefix, postfix))
    .attr("x", 0);
  this._repositionTextLine(tspan, yShift);
};

AbsoluteTextElement.prototype._repositionTextLine = function ( tspan, yShift ){
  var fontSizeProperty = window.getComputedStyle(tspan.node()).getPropertyValue("font-size");
  var fontSize = parseFloat(fontSizeProperty);
  
  /* BBox height is not supported in Firefox for tspans and dominant-baseline doesn't work in some SVG editors */
  var approximatedShiftForVerticalCentering = (1 / 3) * fontSize;
  
  tspan.attr("y", approximatedShiftForVerticalCentering + (yShift || 0) + "px");
};
