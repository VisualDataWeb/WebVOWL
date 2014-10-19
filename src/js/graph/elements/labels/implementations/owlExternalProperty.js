webvowl.labels.owlexternalproperty = (function () {

	var o = function (graph) {
		webvowl.labels.BaseLabel.apply(this, arguments);

		this.attributes(["external"])
			.styleClass("externalproperty")
			.type("owl:ExternalProperty");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());