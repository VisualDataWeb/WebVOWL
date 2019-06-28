var BaseProperty = require("../elements/properties/BaseProperty");
var BaseNode = require("../elements/nodes/BaseNode");
var DatatypeNode = require("../elements/nodes/DatatypeNode");
var Thing = require("../elements/nodes/implementations/OwlThing");
var ObjectProperty = require("../elements/properties/implementations/OwlObjectProperty");
var DatatypeProperty = require("../elements/properties/implementations/OwlDatatypeProperty");
var RdfsSubClassOf = require("../elements/properties/implementations/RdfsSubClassOf");
var Label = require("../elements/links/Label");


var tools = {};
module.exports = function (){
  return tools;
};

tools.isLabel = function ( element ){
  return element instanceof Label;
};

tools.isNode = function ( element ){
  return element instanceof BaseNode;
};

tools.isDatatype = function ( node ){
  return node instanceof DatatypeNode;
};

tools.isThing = function ( node ){
  return node instanceof Thing;
};

tools.isProperty = function ( element ){
  return element instanceof BaseProperty;
};

tools.isObjectProperty = function ( element ){
  return element instanceof ObjectProperty;
};

tools.isDatatypeProperty = function ( element ){
  return element instanceof DatatypeProperty;
};

tools.isRdfsSubClassOf = function ( property ){
  return property instanceof RdfsSubClassOf;
};
