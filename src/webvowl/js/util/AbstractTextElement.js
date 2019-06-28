module.exports = AbstractTextElement;

function AbstractTextElement( container, backgroundColor ){
  var textBlock = container.append("text")
    .classed("text", true)
    .style("fill", this._getTextColor(backgroundColor))
    .attr("text-anchor", "middle");
  
  this._textBlock = function (){
    return textBlock;
  };
}

AbstractTextElement.prototype.LINE_DISTANCE = 1;
AbstractTextElement.prototype.CSS_CLASSES = {
  default: "text",
  subtext: "subtext",
  instanceCount: "instance-count"
};
AbstractTextElement.prototype.DARK_TEXT_COLOR = "#000";
AbstractTextElement.prototype.LIGHT_TEXT_COLOR = "#fff";

AbstractTextElement.prototype.translation = function ( x, y ){
  this._textBlock().attr("transform", "translate(" + x + ", " + y + ")");
  return this;
};

AbstractTextElement.prototype.remove = function (){
  this._textBlock().remove();
  return this;
};

AbstractTextElement.prototype._applyPreAndPostFix = function ( text, prefix, postfix ){
  if ( prefix ) {
    text = prefix + text;
  }
  if ( postfix ) {
    text += postfix;
  }
  return text;
};

AbstractTextElement.prototype._getTextColor = function ( rawBackgroundColor ){
  if ( !rawBackgroundColor ) {
    return AbstractTextElement.prototype.DARK_TEXT_COLOR;
  }
  
  var backgroundColor = d3.rgb(rawBackgroundColor);
  if ( calculateLuminance(backgroundColor) > 0.5 ) {
    return AbstractTextElement.prototype.DARK_TEXT_COLOR;
  } else {
    return AbstractTextElement.prototype.LIGHT_TEXT_COLOR;
  }
};

function calculateLuminance( color ){
  return 0.3 * (color.r / 255) + 0.59 * (color.g / 255) + 0.11 * (color.b / 255);
}
