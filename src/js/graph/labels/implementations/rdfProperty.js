webvowl.labels.rdfproperty = (function () {

	var o = function () {
		webvowl.labels.BaseLabel.call(this);

		this.styleClass("rdfproperty")
			.type("rdf:Property");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());