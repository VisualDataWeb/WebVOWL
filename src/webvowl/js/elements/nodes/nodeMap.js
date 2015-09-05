var nodes = [];
nodes.push(require("./implementations/ExternalClass.js"));
nodes.push(require("./implementations/OwlClass.js"));
nodes.push(require("./implementations/OwlComplementOf.js"));
nodes.push(require("./implementations/OwlDeprecatedClass.js"));
nodes.push(require("./implementations/OwlEquivalentClass.js"));
nodes.push(require("./implementations/OwlIntersectionOf.js"));
nodes.push(require("./implementations/OwlNothing.js"));
nodes.push(require("./implementations/OwlThing.js"));
nodes.push(require("./implementations/OwlUnionOf.js"));
nodes.push(require("./implementations/RdfsClass.js"));
nodes.push(require("./implementations/RdfsDatatype.js"));
nodes.push(require("./implementations/RdfsLiteral.js"));
nodes.push(require("./implementations/RdfsResource.js"));

var map = d3.map(nodes, function (Prototype) {
	return new Prototype().type();
});

module.exports = function () {
	return map;
};
