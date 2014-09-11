webvowl.labels.owldeprecatedproperty = (function () {

	var o = function () {
		webvowl.labels.BaseLabel.call(this);

		this.attributes(["deprecated"])
			.styleClass("deprecatedproperty")
			.type("owl:DeprecatedProperty");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());