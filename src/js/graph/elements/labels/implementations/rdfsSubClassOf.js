webvowl.labels.rdfssubclassof = (function () {

	var o = function (graph) {
		webvowl.labels.BaseLabel.apply(this, arguments);

		var that = this,
			superDrawFunction = that.drawProperty,
			label = "Subclass of";

		this.drawProperty = function(labelGroup) {
			that.labelVisible(!graph.options().compactNotation());
			return superDrawFunction(labelGroup);
		};

		// Disallow overwriting the label
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
