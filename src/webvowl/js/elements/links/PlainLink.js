var Label = require('./Label');


module.exports = PlainLink;

/**
 * A link connects at least two VOWL nodes.
 * The properties connecting the VOWL nodes are stored separately into the label.
 * @param domain
 * @param range
 * @param property
 */
function PlainLink(domain, range, property) {
	var layers,
		layerIndex,
		loops,
		loopIndex,
		label = new Label(property, this);

	var backPart = require("./linkPart")(domain, label, this),
		frontPart = require("./linkPart")(label, range, this);


	this.layers = function (p) {
		if (!arguments.length) return layers;
		layers = p;
		return this;
	};

	this.layerIndex = function (p) {
		if (!arguments.length) return layerIndex;
		layerIndex = p;
		return this;
	};

	this.loops = function (p) {
		if (!arguments.length) return loops;
		loops = p;
		return this;
	};

	this.loopIndex = function (p) {
		if (!arguments.length) return loopIndex;
		loopIndex = p;
		return this;
	};


	this.domain = function () {
		return domain;
	};

	this.label = function () {
		return label;
	};

	this.linkParts = function () {
		return [frontPart, backPart];
	};

	this.range = function () {
		return range;
	};

}


PlainLink.prototype.draw = function (linkGroup, markerContainer) {
	var property = this.label().property();
	var inverse = this.label().inverse();

	property.linkGroup(linkGroup);
	if (inverse) {
		inverse.linkGroup(linkGroup);
	}

	// Marker for this property
	property.markerElement(markerContainer.append("marker")
		.datum(property)
		.attr("id", property.markerId())
		.attr("viewBox", "0 -8 14 16")
		.attr("refX", 12)
		.attr("refY", 0)
		.attr("markerWidth", 12)  // ArrowSize
		.attr("markerHeight", 12)
		.attr("markerUnits", "userSpaceOnUse")
		.attr("orient", "auto")  // Orientation of Arrow
		.attr("class", property.markerType() + "Marker"));
	property.markerElement()
		.append("path")
		.attr("d", "M0,-8L12,0L0,8Z");

	// Marker for the inverse property
	if (inverse) {
		inverse.markerElement(markerContainer.append("marker")
			.datum(inverse)
			.attr("id", inverse.markerId())
			.attr("viewBox", "0 -8 14 16")
			.attr("refX", 0)
			.attr("refY", 0)
			.attr("markerWidth", 12)  // ArrowSize
			.attr("markerHeight", 12)
			.attr("markerUnits", "userSpaceOnUse")
			.attr("orient", "auto")  // Orientation of Arrow
			.attr("class", inverse.markerType() + "Marker"));
		inverse.markerElement().append("path")
			.attr("d", "M12,-8L0,0L12,8Z");
	}

	// Draw the link
	linkGroup.append("path")
		.classed("link-path", true)
		.classed(this.domain().cssClassOfNode(), true)
		.classed(this.range().cssClassOfNode(), true)
		.classed(property.linkType(), true)
		.attr("marker-end", function (l) {
			if (l.label().property().linkHasMarker()) {
				return "url(#" + l.label().property().markerId() + ")";
			}
			return "";
		})
		.attr("marker-start", function (l) {
			var inverse = l.label().inverse();
			if (inverse && inverse.linkHasMarker()) {
				return "url(#" + inverse.markerId() + ")";
			}
			return "";
		});
};

PlainLink.prototype.inverse = function () {
	return this.label().inverse();
};

PlainLink.prototype.isLoop = function () {
	return this.domain().equals(this.range());
};

PlainLink.prototype.property = function () {
	return this.label().property();
};

