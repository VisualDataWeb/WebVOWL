webvowl.labels.owltransitiveproperty = (function () {

	var o = function () {
		webvowl.labels.BaseLabel.call(this);

		this.attributes(["transitive"])
			.styleClass("transitiveproperty")
			.type("owl:TransitiveProperty");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());