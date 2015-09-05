var RoundNode = require("../RoundNode.js");

module.exports = (function () {

	var o = function (graph) {
		RoundNode.apply(this, arguments);

		var superDrawFunction = this.drawNode;

		this.attributes(["rdf"])
			.label("Resource")
			.radius(30)
			.styleClass("rdfsresource")
			.type("rdfs:Resource");

		this.drawNode = function (element) {
			superDrawFunction(element, ["rdf", "special"]);
		};
	};
	o.prototype = Object.create(RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
