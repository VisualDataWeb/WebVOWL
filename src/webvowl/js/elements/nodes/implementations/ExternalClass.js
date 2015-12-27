var RoundNode = require("../RoundNode");

module.exports = (function () {

	var o = function (graph) {
		RoundNode.apply(this, arguments);

		var that = this;
		var superDrawFunction = that.draw;

		this.attributes(["external"])
			.type("ExternalClass");

		this.draw = function (element) {
			superDrawFunction(element);

			if (this.backgroundColor()) {
				element.select("circle").style("fill", this.backgroundColor());
			}
		};
	};
	o.prototype = Object.create(RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
