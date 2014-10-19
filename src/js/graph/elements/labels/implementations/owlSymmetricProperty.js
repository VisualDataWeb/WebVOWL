webvowl.labels.owlsymmetricproperty = (function () {

	var o = function (graph) {
		webvowl.labels.BaseLabel.apply(this, arguments);

		this.attributes(["symmetric"])
			.styleClass("symmetricproperty")
			.type("owl:SymmetricProperty");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());