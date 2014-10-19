webvowl.labels.rdfproperty = (function () {

	var o = function (graph) {
		webvowl.labels.BaseLabel.apply(this, arguments);

		this.attributes(["rdf"])
			.styleClass("rdfproperty")
			.type("rdf:Property");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());