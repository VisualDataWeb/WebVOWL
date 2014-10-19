webvowl.labels.setoperatorproperty = (function () {

	var o = function (graph) {
		webvowl.labels.BaseLabel.apply(this, arguments);

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