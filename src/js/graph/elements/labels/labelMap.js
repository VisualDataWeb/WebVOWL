var labels = [];
labels.push(require("./implementations/OwlDatatypeProperty.js"));
labels.push(require("./implementations/OwlDeprecatedProperty.js"));
labels.push(require("./implementations/OwlDisjointWith.js"));
labels.push(require("./implementations/OwlEquivalentProperty.js"));
labels.push(require("./implementations/OwlFunctionalProperty.js"));
labels.push(require("./implementations/OwlInverseFunctionalProperty.js"));
labels.push(require("./implementations/OwlObjectProperty.js"));
labels.push(require("./implementations/OwlSymmetricProperty.js"));
labels.push(require("./implementations/OwlTransitiveProperty.js"));
labels.push(require("./implementations/RdfProperty.js"));
labels.push(require("./implementations/RdfsSubClassOf.js"));
labels.push(require("./implementations/SetOperatorProperty.js"));

var map = d3.map(labels, function (Prototype) {
	return new Prototype().type();
});

module.exports = function () {
	return map;
};
