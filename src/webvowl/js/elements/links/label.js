var forceLayoutNodeFunctions = require("../forceLayoutNodeFunctions")();


/**
 * A label represents the element(s) which further describe a link.
 * It encapsulates the property and its inverse property.
 * @param property the property; the inverse is inferred
 * @param link the link this label belongs to
 */
module.exports = function (property, link) {
	forceLayoutNodeFunctions.addTo(this);

	this.actualRadius = function () {
		return property.actualRadius();
	};

	this.draw = function (container) {
		return property.draw(container);
	};

	this.inverse = function () {
		return property.inverse();
	};

	this.link = function () {
		return link;
	};

	this.property = function () {
		return property;
	};
};
