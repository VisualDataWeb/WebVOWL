webvowl.nodes.rdfsliteral = (function () {

	var o = function () {
		webvowl.nodes.RectangularNode.call(this);

		var superDrawFunction = this.drawNode;

		this.label("Literal")
			.styleClass("literal")
			.type("rdfs:Literal");

		this.drawNode = function (element) {
			superDrawFunction(element, ["special"]);
		};
	};
	o.prototype = Object.create(webvowl.nodes.RectangularNode.prototype);
	o.prototype.constructor = o;

	return o;
}());