var TopOrBottomNode = require("../TopOrBottomNode.js");

module.exports = (function () {

	var o = function (graph) {
		TopOrBottomNode.apply(this, arguments);

		this.label("Thing")
			.type("owl:Thing")
			.iri("http://www.w3.org/2002/07/owl#Thing");
	};
	o.prototype = Object.create(TopOrBottomNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
