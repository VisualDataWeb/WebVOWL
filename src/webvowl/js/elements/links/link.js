module.exports = function (_domain, _range, _property) {

	var link = {},
		domain = _domain,
		layers,
		layerIndex,
		loops,
		loopIndex,
		label = require("./label")(_property),
		range = _range;

	var backPart = require("./linkPart")(domain, label, link),
		frontPart = require("./linkPart")(label, range, link);


	link.layers = function (p) {
		if (!arguments.length) return layers;
		layers = p;
		return link;
	};

	link.layerIndex = function (p) {
		if (!arguments.length) return layerIndex;
		layerIndex = p;
		return link;
	};

	link.loops = function (p) {
		if (!arguments.length) return loops;
		loops = p;
		return link;
	};

	link.loopIndex = function (p) {
		if (!arguments.length) return loopIndex;
		loopIndex = p;
		return link;
	};


	link.backPart = function () {
		return backPart;
	};

	link.domain = function () {
		return domain;
	};

	link.frontPart = function () {
		return frontPart;
	};

	link.inverse = function () {
		return label.inverse();
	};

	link.label = function () {
		return label;
	};

	link.linkParts = function () {
		return [link.frontPart(), link.backPart()];
	};

	link.property = function () {
		return label.property();
	};

	link.range = function () {
		return range;
	};


	link.draw = function (linkGroup, markerContainer) {
		var property = label.property();
		var inverse = label.inverse();

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
			.classed(domain.cssClassOfNode(), true)
			.classed(range.cssClassOfNode(), true)
			.classed(property.linkType(), true)
			.attr("marker-end", function (l) {
				if (!l.label().property().isSpecialLink()) {
					return "url(#" + l.label().property().markerId() + ")";
				}
				return "";
			})
			.attr("marker-start", function (l) {
				var inverse = l.label().inverse();
				if (inverse && !inverse.isSpecialLink()) {
					return "url(#" + inverse.markerId() + ")";
				}
				return "";
			});
	};


	return link;
};
