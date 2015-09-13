/**
 * A linkPart reprents a link d3 can use.
 * @param _domain
 * @param _range
 * @param _link
 */
module.exports = function (_domain, _range, _link) {
	var linkPart = {},
		domain = _domain,
		link = _link,
		range = _range;

	// Define d3 properties
	Object.defineProperties(linkPart, {
		"source": {value: domain, writable: true},
		"target": {value: range, writable: true}
	});


	linkPart.domain = function () {
		return domain;
	};

	linkPart.link = function () {
		return link;
	};

	linkPart.range = function () {
		return range;
	};


	linkPart.draw = function (linkGroup, markerContainer) {
		var property = link.property();
		var inverse = property.inverse();

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
				var inverse = l.inverse();
				if (inverse && !inverse.isSpecialLink()) {
					return "url(#" + inverse.markerId() + ")";
				}
				return "";
			});
	};

	return linkPart;
};
