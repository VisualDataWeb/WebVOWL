var BaseLabel = require("../BaseLabel.js");

module.exports = (function () {

	var o = function (graph) {
		BaseLabel.apply(this, arguments);

		this.attributes(["datatype"])
			.styleClass("datatypeproperty")
			.type("owl:DatatypeProperty");
	};
	o.prototype = Object.create(BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());
