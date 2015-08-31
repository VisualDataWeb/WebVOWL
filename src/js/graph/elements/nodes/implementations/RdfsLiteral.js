var DatatypeNode = require("../DatatypeNode.js");

module.exports = (function () {

	var o = function (graph) {
		DatatypeNode.apply(this, arguments);

		var superDrawFunction = this.drawNode,
			superLabelFunction = this.label;

		this.attributes(["datatype"])
			.label("Literal")
			.styleClass("literal")
			.type("rdfs:Literal")
			.iri("http://www.w3.org/2000/01/rdf-schema#Literal");

		this.drawNode = function (element) {
			superDrawFunction(element, ["special"]);
		};

		this.label = function (p) {
			if (!arguments.length) return superLabelFunction();
			return this;
		};
	};
	o.prototype = Object.create(DatatypeNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
