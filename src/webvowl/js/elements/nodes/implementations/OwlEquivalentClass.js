var RoundNode = require("../RoundNode");
var drawTools = require("../../drawTools")();

module.exports = (function () {

	var o = function (graph) {
		RoundNode.apply(this, arguments);

		var CIRCLE_SIZE_DIFFERENCE = 4;

		var that = this,
			superActualRadiusFunction = that.actualRadius;

		this.styleClass("equivalentclass")
			.type("owl:equivalentClass");

		this.actualRadius = function () {
			return superActualRadiusFunction() + CIRCLE_SIZE_DIFFERENCE;
		};


		this.draw = function (parentElement) {
			var cssClasses = that.collectCssClasses();

			that.nodeElement(parentElement);

			// draw the outer circle at first and afterwards the inner circle
			drawTools.appendCircularClass(parentElement, that.actualRadius(), ["white", "embedded"]);
			drawTools.appendCircularClass(parentElement, that.actualRadius() - CIRCLE_SIZE_DIFFERENCE, cssClasses, that.labelForCurrentLanguage(), that.backgroundColor());

			that.postDrawActions();
		};

		/**
		 * Sets the hover highlighting of this node.
		 * @param enable
		 */
		that.setHoverHighlighting = function (enable) {
			that.nodeElement().selectAll("circle:last-of-type").classed("hovered", enable);
		};
	};
	o.prototype = Object.create(RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
