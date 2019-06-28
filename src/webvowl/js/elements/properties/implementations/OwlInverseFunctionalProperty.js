var BaseProperty = require("../BaseProperty");

module.exports = (function (){
  
  var o = function ( graph ){
    BaseProperty.apply(this, arguments);
    
    this.attributes(["inverse functional"])
      .styleClass("inversefunctionalproperty")
      .type("owl:InverseFunctionalProperty");
  };
  o.prototype = Object.create(BaseProperty.prototype);
  o.prototype.constructor = o;
  
  return o;
}());
