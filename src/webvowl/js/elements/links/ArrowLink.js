var PlainLink = require("./PlainLink");


module.exports = ArrowLink;

function ArrowLink(domain, range, property) {
	PlainLink.apply(this, arguments);
}

ArrowLink.prototype = Object.create(PlainLink.prototype);
ArrowLink.prototype.constructor = ArrowLink;


ArrowLink.prototype.draw = function (linkGroup, markerContainer) {
	var property = this.label().property();
	var inverse = this.label().inverse();

	createPropertyMarker(markerContainer, property);
	if (inverse) {
		createInverseMarker(markerContainer, inverse);
	}

	PlainLink.prototype.draw.apply(this, arguments);

	// attach the markers to the link
	linkGroup.attr("marker-end", "url(#" + property.markerId() + ")");
	if (inverse) {
		linkGroup.attr("marker-start", "url(#" + inverse.markerId() + ")");
	}
};

function createPropertyMarker(markerContainer, property) {
	var marker = appendBasicMarker(markerContainer, property);
	marker.attr("refX", 12);
	marker.append("path")
		.attr("d", "M0,-8L12,0L0,8Z")
		.classed(property.markerType(), true);

	property.markerElement(marker);
}

function createInverseMarker(markerContainer, inverse) {
	var inverseMarker = appendBasicMarker(markerContainer, inverse);
	inverseMarker.append("path")
		.attr("d", "M12,-8L0,0L12,8Z")
		.classed(inverse.markerType(), true);

	inverse.markerElement(inverseMarker);
}

function appendBasicMarker(markerContainer, property) {
	return markerContainer.append("marker")
		.datum(property)
		.attr("id", property.markerId())
		.attr("viewBox", "0 -8 14 16")
		.attr("markerWidth", 12)
		.attr("markerHeight", 12)
		.attr("markerUnits", "userSpaceOnUse")
		.attr("orient", "auto");
}
