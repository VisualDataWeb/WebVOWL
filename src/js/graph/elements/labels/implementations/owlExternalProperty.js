webvowl.labels.owlexternalproperty = (function () {

	var o = function () {
		webvowl.labels.BaseLabel.call(this);

		this.attribute(["external"])
			.styleClass("externalproperty")
			.type("owl:ExternalProperty");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());