webvowl.labels.owldisjointwith = (function () {

	var o = function (graph) {
		webvowl.labels.BaseLabel.apply(this, arguments);

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
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());