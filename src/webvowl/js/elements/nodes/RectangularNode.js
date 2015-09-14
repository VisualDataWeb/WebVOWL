var BaseNode = require("./BaseNode");
var drawTools = require("./drawTools")();

module.exports = (function () {

	var o = function (graph) {
		BaseNode.apply(this, arguments);

		var that = this,
			height = 20,
			width = 60;


		// Properties
		this.height = function (p) {
			if (!arguments.length) return height;
			height = p;
			return this;
		};

		this.width = function (p) {
			if (!arguments.length) return width;
			width = p;
			return this;
		};


		// Functions
		// for compatibility reasons // TODO resolve
		this.actualRadius = function () {
			return width;
		};

		this.distanceToBorder = function(dx, dy) {
			var innerDistance,
				m_link = Math.abs(dy / dx),
				m_rect = that.height() / that.width();

			if (m_link <= m_rect) {
				var timesX = dx / (that.width() / 2),
					rectY = dy / timesX;
				innerDistance = Math.sqrt(Math.pow(that.width() / 2, 2) + Math.pow(rectY, 2));
			} else {
				var timesY = dy / (that.height() / 2),
					rectX = dx / timesY;
				innerDistance = Math.sqrt(Math.pow(that.height() / 2, 2) + Math.pow(rectX, 2));
			}

			return innerDistance;
		};

		this.setHoverHighlighting = function (enable) {
			that.nodeElement().selectAll("rect").classed("hovered", enable);
		};

		this.textWidth = function () {
			return this.width();
		};

		this.toggleFocus = function () {
			that.focused(!that.focused());
			that.nodeElement().select("rect").classed("focused", that.focused());
		};

		/**
		 * Draws the rectangular node.
		 * @param parentElement the element to which this node will be appended
		 * @param [additionalCssClasses] additional css classes
		 */
		this.draw = function (parentElement, additionalCssClasses) {
			var textBlock,
				cssClasses = that.collectCssClasses();

			that.nodeElement(parentElement);

			if (additionalCssClasses instanceof Array) {
				cssClasses = cssClasses.concat(additionalCssClasses);
			}
			drawTools.appendRectangularClass(parentElement, that.width(), that.height(), cssClasses, that.labelForCurrentLanguage());

			textBlock = require("../../util/textElement")(parentElement);
			textBlock.addText(that.labelForCurrentLanguage());

			that.addMouseListeners();
		};
	};
	o.prototype = Object.create(BaseNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
