var BaseProperty = require("../BaseProperty");

module.exports = (function () {

	var o = function (graph) {
		BaseProperty.apply(this, arguments);

		var that = this,
			superDrawFunction = that.draw,
			label = "Subclass of";

		this.draw = function (labelGroup) {
			that.labelVisible(!graph.options().compactNotation());
			return superDrawFunction(labelGroup);
		};

		// Disallow overwriting the label
		this.label = function (p) {
			if (!arguments.length) return label;
			return this;
		};

		this.linkType("dotted")
			.markerType("white")
			.styleClass("subclass")
			.type("rdfs:subClassOf");
	};
	o.prototype = Object.create(BaseProperty.prototype);
	o.prototype.constructor = o;

	return o;
}());
