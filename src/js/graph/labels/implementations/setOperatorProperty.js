webvowl.labels.setoperatorproperty = (function () {

	var o = function () {
		webvowl.labels.BaseLabel.call(this);

		this.markerType("special")
			.labelVisible(false)
			.linkType("special")
			.styleClass("setoperatorproperty")
			.type("setOperatorProperty");
	};
	o.prototype = Object.create(webvowl.labels.BaseLabel.prototype);
	o.prototype.constructor = o;

	return o;
}());