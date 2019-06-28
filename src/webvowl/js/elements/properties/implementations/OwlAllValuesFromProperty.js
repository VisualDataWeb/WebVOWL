var BaseProperty = require("../BaseProperty");

module.exports = (function (){
  
  var o = function ( graph ){
    BaseProperty.apply(this, arguments);
    
    var superGenerateCardinalityText = this.generateCardinalityText;
    
    this.linkType("values-from")
      .markerType("filled values-from")
      .styleClass("allvaluesfromproperty")
      .type("owl:allValuesFrom");
    
    this.generateCardinalityText = function (){
      var cardinalityText = "A";
      
      var superCardinalityText = superGenerateCardinalityText();
      if ( superCardinalityText ) {
        cardinalityText += ", " + superCardinalityText;
      }
      
      return cardinalityText;
    };
  };
  o.prototype = Object.create(BaseProperty.prototype);
  o.prototype.constructor = o;
  
  return o;
}());


