var DatatypeNode = require("../DatatypeNode");

module.exports = (function () {

	var o = function (graph) {
		DatatypeNode.apply(this, arguments);

		this.attributes(["datatype"])
			.type("rdfs:Datatype");
	};
	o.prototype = Object.create(DatatypeNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
