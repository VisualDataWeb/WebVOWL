module.exports = function () {
	var l = {},
		curvePoint,
		domain,
		inverse,
		layers,
		layerCount,
		layerIndex,
		loops,
		loopCount,
		loopIndex,
		property,
		range;


	l.curvePoint = function (p) {
		if (!arguments.length) return curvePoint;
		curvePoint = p;
		return l;
	};

	l.domain = function (p) {
		if (!arguments.length) return domain;
		domain = p;
		this.source = p;
		return l;
	};

	l.inverse = function (p) {
		if (!arguments.length) return inverse;
		inverse = p;
		return l;
	};

	l.layers = function (p) {
		if (!arguments.length) return layers;
		layers = p;
		return l;
	};

	l.layerCount = function (p) {
		if (!arguments.length) return layerCount;
		layerCount = p;
		return l;
	};

	l.layerIndex = function (p) {
		if (!arguments.length) return layerIndex;
		layerIndex = p;
		return l;
	};

	l.loops = function (p) {
		if (!arguments.length) return loops;
		loops = p;
		return l;
	};

	l.loopCount = function (p) {
		if (!arguments.length) return loopCount;
		loopCount = p;
		return l;
	};

	l.loopIndex = function (p) {
		if (!arguments.length) return loopIndex;
		loopIndex = p;
		return l;
	};

	l.property = function (p) {
		if (!arguments.length) return property;
		property = p;
		return l;
	};

	l.range = function (p) {
		if (!arguments.length) return range;
		range = p;
		this.target = p;
		return l;
	};

	// Define d3 properties
	Object.defineProperties(l, {
		"source": {writable: true},
		"target": {writable: true}
	});


	l.draw = function (linkGroup, markerContainer) {
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
				if (!l.property().isSpecialLink()) {
					return "url(#" + l.property().markerId() + ")";
				}
				return "";
			})
			.attr("marker-start", function (l) {
				if (l.inverse() && !l.inverse().isSpecialLink()) {
					return "url(#" + l.inverse().markerId() + ")";
				}
				return "";
			});
	};

	return l;
};
