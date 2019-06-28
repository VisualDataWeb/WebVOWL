var BaseProperty = require("../BaseProperty");

module.exports = (function (){
  
  var o = function ( graph ){
    BaseProperty.apply(this, arguments);
    
    this.labelVisible(false)
      .linkType("dashed")
      .markerType("white")
      .styleClass("setoperatorproperty")
      .type("setOperatorProperty");
  };
  o.prototype = Object.create(BaseProperty.prototype);
  o.prototype.constructor = o;
  
  return o;
}());
