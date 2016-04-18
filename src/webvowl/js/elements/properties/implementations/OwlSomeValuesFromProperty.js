var BaseProperty = require("../BaseProperty");

module.exports = (function () {

	var o = function (graph) {
		BaseProperty.apply(this, arguments);

		var superDrawCardinality = this.drawCardinality;
		
		this.linkType("values-from")
			.markerType("filled values-from")
			.styleClass("somevaluesfromproperty")
			.type("owl:someValuesFrom");

		this.drawCardinality = function (container) {
			superDrawCardinality(container);

			var symbol = container.append("g");
			symbol.append("path")
				.attr("d", "M-6,-10L6,-10L6,10L-6,10M6,0L-6,0")
				.attr("transform", "scale(.5)")
				.classed("values-from", true);

			return true;
		};
	};
	o.prototype = Object.create(BaseProperty.prototype);
	o.prototype.constructor = o;

	return o;
}());


