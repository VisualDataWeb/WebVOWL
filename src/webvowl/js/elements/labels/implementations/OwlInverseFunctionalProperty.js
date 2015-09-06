var BaseLabel = require("../BaseLabel.js");

module.exports = (function () {

	var o = function (graph) {
		BaseLabel.apply(this, arguments);

		this.attributes(["inverse functional"])
			.styleClass("inversefunctionalproperty")
			.type("owl:InverseFunctionalProperty");
	};
	o.prototype = Object.create(BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());
