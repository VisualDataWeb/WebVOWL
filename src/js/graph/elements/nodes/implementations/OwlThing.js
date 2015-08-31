var RoundNode = require("../RoundNode.js");

module.exports = (function () {

	var o = function (graph) {
		RoundNode.apply(this, arguments);

		var superDrawFunction = this.drawNode;

		this.label("Thing")
			.type("owl:Thing")
			.iri("http://www.w3.org/2002/07/owl#Thing")
			.radius(30);

		this.drawNode = function (element) {
			superDrawFunction(element, ["white", "special"]);
		};
	};
	o.prototype = Object.create(RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
