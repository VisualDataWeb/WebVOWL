var nodes = [];
nodes.push(require("./implementations/ExternalClass.js"));
nodes.push(require("./implementations/owlClass.js"));
nodes.push(require("./implementations/owlcomplementOf.js"));
nodes.push(require("./implementations/owlDeprecatedClass.js"));
nodes.push(require("./implementations/owlequivalentClass.js"));
nodes.push(require("./implementations/owlintersectionOf.js"));
nodes.push(require("./implementations/owlNothing.js"));
nodes.push(require("./implementations/owlThing.js"));
nodes.push(require("./implementations/owlunionOf.js"));
nodes.push(require("./implementations/rdfsClass.js"));
nodes.push(require("./implementations/rdfsDatatype.js"));
nodes.push(require("./implementations/rdfsLiteral.js"));
nodes.push(require("./implementations/rdfsResource.js"));

var map = d3.map(nodes, function(array, element) {
	return element.type();
});

module.exports = function() {
	return map;
};
