webvowl.labels.owldeprecatedproperty = (function () {

	var o = function (graph) {
		webvowl.labels.BaseLabel.apply(this, arguments);

		this.attributes(["deprecated"])
			.styleClass("deprecatedproperty")
			.type("owl:DeprecatedProperty");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());