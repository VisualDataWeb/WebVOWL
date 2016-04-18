var BaseProperty = require("../BaseProperty");

module.exports = (function () {

	var o = function (graph) {
		BaseProperty.apply(this, arguments);

		this.linkType("values-from")
			.markerType("filled values-from")
			.styleClass("allvaluesfromproperty")
			.type("owl:allValuesFrom");
	};
	o.prototype = Object.create(BaseProperty.prototype);
	o.prototype.constructor = o;

	return o;
}());


