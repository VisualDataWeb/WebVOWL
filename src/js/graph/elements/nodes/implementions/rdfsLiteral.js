webvowl.nodes.rdfsliteral = (function () {

	var o = function () {
		webvowl.nodes.RectangularNode.call(this);

		var superDrawFunction = this.drawNode,
			superLabelFunction = this.label;

		this.attributes(["datatype"])
			.label("Literal")
			.styleClass("literal")
			.type("rdfs:Literal");

		this.drawNode = function (element) {
			superDrawFunction(element, ["special"]);
		};

		this.label = function (p) {
			if (!arguments.length) return superLabelFunction();
			return this;
		};
	};
	o.prototype = Object.create(webvowl.nodes.RectangularNode.prototype);
	o.prototype.constructor = o;

	return o;
}());