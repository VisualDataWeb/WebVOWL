var forceLayoutNodeFunctions = require("../forceLayoutNodeFunctions")();


module.exports = Label;

/**
 * A label represents the element(s) which further describe a link.
 * It encapsulates the property and its inverse property.
 * @param property the property; the inverse is inferred
 * @param link the link this label belongs to
 */
function Label(property, link) {
	forceLayoutNodeFunctions.addTo(this);

	this.link = function () {
		return link;
	};

	this.property = function () {
		return property;
	};
}

Label.prototype.actualRadius = function () {
	return this.property().actualRadius();
};

Label.prototype.draw = function (container) {
	return this.property().draw(container);
};

Label.prototype.inverse = function () {
	return this.property().inverse();
};

Label.prototype.equals = function (other) {
	if (!other) {
		return false;
	}

	var instance = other instanceof Label;
	var equalProperty = this.property().equals(other.property());

	var equalInverse = false;
	if (this.inverse()) {
		equalInverse = this.inverse().equals(other.inverse());
	} else if (!other.inverse()) {
		equalInverse = true;
	}

	return instance && equalProperty && equalInverse;
};
