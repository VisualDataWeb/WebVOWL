var labels = [];
labels.push(require("./implementations/owlDatatypeProperty.js"));
labels.push(require("./implementations/owlDeprecatedProperty.js"));
labels.push(require("./implementations/owlDisjointWith.js"));
labels.push(require("./implementations/owlEquivalentProperty.js"));
labels.push(require("./implementations/owlInverseFunctionalProperty.js"));
labels.push(require("./implementations/owlObjectProperty.js"));
labels.push(require("./implementations/owlSymmetricProperty.js"));
labels.push(require("./implementations/owlTransitiveProperty.js"));
labels.push(require("./implementations/rdfProperty.js"));
labels.push(require("./implementations/rdfsSubClassOf.js"));
labels.push(require("./implementations/setOperatorProperty.js"));

var map = d3.map(labels, function(array, element) {
	return element.type();
});

module.exports = function() {
	return map;
};
