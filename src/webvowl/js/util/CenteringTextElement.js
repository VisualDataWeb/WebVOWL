var textTools = require("./textTools")();
var AbstractTextElement = require("./AbstractTextElement");

module.exports = CenteringTextElement;
function CenteringTextElement( container, backgroundColor ){
  AbstractTextElement.apply(this, arguments);
  this.storedFullTextLines = [];
  this.storedSpanArrays = [];
  this.storedStyle = [];
  
}

CenteringTextElement.prototype = Object.create(AbstractTextElement.prototype);
CenteringTextElement.prototype.constructor = CenteringTextElement;

CenteringTextElement.prototype.addText = function ( text, prefix, suffix ){
  if ( text ) {
    this.addTextline(text, this.CSS_CLASSES.default, prefix, suffix);
  }
};

CenteringTextElement.prototype.addSubText = function ( text ){
  if ( text ) {
    this.addTextline(text, this.CSS_CLASSES.subtext, "(", ")");
  }
};

CenteringTextElement.prototype.addEquivalents = function ( text ){
  if ( text ) {
    this.addTextline(text, this.CSS_CLASSES.default);
  }
};

CenteringTextElement.prototype.addInstanceCount = function ( instanceCount ){
  if ( instanceCount ) {
    this.addTextline(instanceCount.toString(), this.CSS_CLASSES.instanceCount);
  }
};
CenteringTextElement.prototype.saveCorrespondingSpan = function ( correspondingSpan ){
  this.storedSpanArrays.push(correspondingSpan);
};
CenteringTextElement.prototype.saveFullTextLine = function ( fullText ){
  this.storedFullTextLines.push(fullText);
};
CenteringTextElement.prototype.saveStyle = function ( style ){
  this.storedStyle.push(style);
};

CenteringTextElement.prototype.updateAllTextElements = function (){
  // TODO : TEST THIS postPrefix >>>  _applyPreAndPostFix
  for ( var i = 0; i < this.storedSpanArrays.length; i++ ) {
    var truncatedText = textTools.truncate(this.storedFullTextLines[i], this._textBlock().datum().textWidth(), this.storedStyle[i]);
    this.storedSpanArrays[i].text(truncatedText);
  }
};


CenteringTextElement.prototype.addTextline = function ( text, style, prefix, postfix ){
  var truncatedText = textTools.truncate(text, this._textBlock().datum().textWidth(), style);
  this.saveFullTextLine(text);
  this.saveStyle(style);
  var tspan = this._textBlock().append("tspan")
    .classed(this.CSS_CLASSES.default, true)
    .classed(style, true)
    .text(this._applyPreAndPostFix(truncatedText, prefix, postfix))
    .attr("x", 0);
  this._repositionTextLine(tspan);
  this.saveCorrespondingSpan(tspan);
  
  this._repositionTextBlock();
};

CenteringTextElement.prototype._repositionTextLine = function ( tspan ){
  var fontSizeProperty = window.getComputedStyle(tspan.node()).getPropertyValue("font-size");
  var fontSize = parseFloat(fontSizeProperty);
  
  var siblingCount = this._lineCount() - 1;
  var lineDistance = siblingCount > 0 ? this.LINE_DISTANCE : 0;
  
  tspan.attr("dy", fontSize + lineDistance + "px");
};

CenteringTextElement.prototype.getTextBox = function (){
  return this._textBlock();
};


CenteringTextElement.prototype._repositionTextBlock = function (){
  // Nothing to do if no child elements exist
  var lineCount = this._lineCount();
  if ( lineCount < 1 ) {
    this._textBlock().attr("y", 0);
    return;
  }
  
  var textBlockHeight = this._textBlock().node().getBBox().height;
  this._textBlock().attr("y", -textBlockHeight * 0.5 + "px");
};

CenteringTextElement.prototype._lineCount = function (){
  return this._textBlock().property("childElementCount");
};
