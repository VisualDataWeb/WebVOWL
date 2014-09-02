webvowl.nodes.owlthing = (function () {

	var o = function () {
		webvowl.nodes.RoundNode.call(this);

		var superDrawFunction = this.drawNode;

		this.label("Thing")
			.radius(30)
			.styleClass("thing")
			.type("owl:Thing");

		this.drawNode = function (element) {
			superDrawFunction(element, ["white", "special"]);
		};
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());