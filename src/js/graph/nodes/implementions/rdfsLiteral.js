webvowl.nodes.rdfsliteral = (function () {

	var o = function () {
		webvowl.nodes.RectangularNode.call(this);

		this.label("Literal")
			.styleClass("literal")
			.type("rdfs:Literal");
	};
	o.prototype = Object.create(webvowl.nodes.RectangularNode.prototype);
	o.prototype.constructor = o;

	return o;
}());