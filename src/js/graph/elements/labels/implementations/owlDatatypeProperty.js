webvowl.labels.owldatatypeproperty = (function () {

	var o = function () {
		webvowl.labels.BaseLabel.call(this);

		this.attributes(["datatype"])
			.styleClass("datatypeproperty")
			.type("owl:DatatypeProperty");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());