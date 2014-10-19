webvowl.labels.rdfssubclassof = (function () {

	var o = function (graph) {
		webvowl.labels.BaseLabel.apply(this, arguments);

		// Disallow overwriting the label
		var label = "Subclass of";
		this.label = function (p) {
			if (!arguments.length) return label;
			return this;
		};

		this.linkType("dotted")
			.markerType("dotted")
			.styleClass("subclass")
			.type("rdfs:subClassOf");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());