webvowl.nodes.owlthing = (function () {

	var o = function (graph) {
		webvowl.nodes.RoundNode.apply(this, arguments);

		var superDrawFunction = this.drawNode;

		this.label("Thing")
			.radius(30)
			.styleClass("thing")
			.type("owl:Thing")
			.iri("http://www.w3.org/2002/07/owl#Thing");

		this.drawNode = function (element) {
			superDrawFunction(element, ["white", "special"]);
		};
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
