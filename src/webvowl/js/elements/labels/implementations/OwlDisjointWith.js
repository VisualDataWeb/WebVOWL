var BaseLabel = require("../BaseLabel.js");

module.exports = (function () {

	var o = function (graph) {
		BaseLabel.apply(this, arguments);

		var label = "Disjoint With";
		// Disallow overwriting the label
		this.label = function (p) {
			if (!arguments.length) return label;
			return this;
		};

		this.markerType("special")
			.linkType("special")
			.styleClass("disjointwith")
			.type("owl:disjointWith");
	};
	o.prototype = Object.create(BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());
