var BaseProperty = require("../BaseProperty");

module.exports = (function (){
  
  var o = function ( graph ){
    BaseProperty.apply(this, arguments);
    
    this.attributes(["datatype"])
      .styleClass("datatypeproperty")
      .type("owl:DatatypeProperty");
  };
  o.prototype = Object.create(BaseProperty.prototype);
  o.prototype.constructor = o;
  
  return o;
}());
