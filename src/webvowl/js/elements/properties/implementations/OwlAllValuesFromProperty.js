var BaseProperty = require("../BaseProperty");

module.exports = (function () {

	var o = function (graph) {
		BaseProperty.apply(this, arguments);
		
		var superDrawCardinality = this.drawCardinality;

		this.linkType("values-from")
			.markerType("filled values-from")
			.styleClass("allvaluesfromproperty")
			.type("owl:allValuesFrom");
		
		this.drawCardinality = function (container) {
			superDrawCardinality(container);

			var symbol = container.append("g");
			symbol.append("path")
				.attr("d", "M-8,-10L0,10L8,-10M6,-4L-6,-4")
				.attr("transform", "scale(.5)")
				.classed("values-from", true);

			return true;
		};
	};
	o.prototype = Object.create(BaseProperty.prototype);
	o.prototype.constructor = o;

	return o;
}());


