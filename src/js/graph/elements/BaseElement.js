/**
 * The base element for all visual elements of webvowl.
 */
webvowl.elements.BaseElement = (function () {

	var base = function () {
		// Basic attributes
		var equivalent,
			id,
			label,
			type,
			uri,
		// Additional attributes
			attribute = [],
			visualAttribute,
			comment,
			equivalentBase,
		// Style attributes
			focused = false,
			indications = [],
			mouseEntered = false,
			styleClass,
			visible = true;


		// Properties
		this.attribute = function (p) {
			if (!arguments.length) return attribute;
			attribute = p;
			return this;
		};

		this.comment = function (p) {
			if (!arguments.length) return comment;
			comment = p;
			return this;
		};

		this.equivalent = function (p) {
			if (!arguments.length) return equivalent;
			equivalent = p;
			return this;
		};

		this.equivalentBase = function (p) {
			if (!arguments.length) return equivalentBase;
			equivalentBase = p;
			return this;
		};

		this.focused = function (p) {
			if (!arguments.length) return focused;
			focused = p;
			return this;
		};

		this.id = function (p) {
			if (!arguments.length) return id;
			id = p;
			return this;
		};

		this.indications = function (p) {
			if (!arguments.length) return indications;
			indications = p;
			return this;
		};

		this.label = function (p) {
			if (!arguments.length) return label;
			label = p || "DEFAULT_LABEL";
			return this;
		};

		this.mouseEntered = function (p) {
			if (!arguments.length) return mouseEntered;
			mouseEntered = p;
			return this;
		};

		this.styleClass = function (p) {
			if (!arguments.length) return styleClass;
			styleClass = p;
			return this;
		};

		this.type = function (p) {
			if (!arguments.length) return type;
			type = p;
			return this;
		};

		this.uri = function (p) {
			if (!arguments.length) return uri;
			uri = p;
			return this;
		};

		this.visible = function (p) {
			if (!arguments.length) return visible;
			visible = p;
			return this;
		};

		this.visualAttribute = function (p) {
			if (!arguments.length) return visualAttribute;
			visualAttribute = p;
			return this;
		};

		this.indicationString = function() {
			return this.indications().join(", ");
		};
	};

	base.prototype.constructor = base;


	return base;
}());
