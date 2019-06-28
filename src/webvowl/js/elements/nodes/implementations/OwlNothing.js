var OwlThing = require("./OwlThing");

module.exports = (function (){
  
  var o = function ( graph ){
    OwlThing.apply(this, arguments);
    
    this.label("Nothing")
      .type("owl:Nothing")
      .iri("http://www.w3.org/2002/07/owl#Nothing");
  };
  o.prototype = Object.create(OwlThing.prototype);
  o.prototype.constructor = o;
  
  return o;
}());
