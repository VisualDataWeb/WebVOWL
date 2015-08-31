var RoundNode = require("../RoundNode.js");

module.exports = (function () {

	var o = function (graph) {
		RoundNode.apply(this, arguments);

		this.attributes(["external"])
			.type("ExternalClass");
	};
	o.prototype = Object.create(RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
