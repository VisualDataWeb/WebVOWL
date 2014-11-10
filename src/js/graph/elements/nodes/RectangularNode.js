webvowl.nodes.RectangularNode = (function () {

	var o = function (graph) {
		webvowl.nodes.BaseNode.apply(this, arguments);

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
		this.drawNode = function (parentElement, additionalCssClasses) {
			var drawTools = webvowl.nodes.drawTools(),
				textBlock,
				cssClasses = that.collectCssClasses();

			that.nodeElement(parentElement);

			if (additionalCssClasses instanceof Array) {
				cssClasses = cssClasses.concat(additionalCssClasses);
			}
			drawTools.appendRectangularClass(parentElement, that.width(), that.height(), cssClasses, that.label());

			textBlock = webvowl.util.textElement(parentElement);
			textBlock.addTextline(that.label());

			that.addMouseListeners();
		};
	};
	o.prototype = Object.create(webvowl.nodes.BaseNode.prototype);
	o.prototype.constructor = o;

	return o;
}());