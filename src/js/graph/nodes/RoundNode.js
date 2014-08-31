webvowl.nodes.RoundNode = (function () {

	var o = function () {
		webvowl.nodes.BaseNode.call(this);

		var that = this,
			radius = 50,
			pinGroupElement;


		// Properties
		this.radius = function (p) {
			if (!arguments.length) return radius;
			radius = p;
			return this;
		};


		// Functions
		this.textWidth = function () {
			return this.radius() * 2;
		};

		this.toggleFocus = function () {
			that.focused(!that.focused());
			that.nodeElement().select("circle").classed("focused", that.focused());
		};

		this.drawPin = function () {
			that.pinned(true);
			pinGroupElement = that.nodeElement()
				.append("g")
				.classed("hidden-in-export", true)
				.attr("transform", function () {
					var dx = (2 / 5) * that.radius(),
						dy = (-7 / 10) * that.radius();
					return "translate(" + dx + "," + dy + ")";
				});

			pinGroupElement.append("circle")
				.classed("class pin feature", true)
				.attr("r", 12)
				.on("click", function () {
					that.removePin();
					d3.event.stopPropagation();
				});

			pinGroupElement.append("line")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", 12)
				.attr("y2", 16);
		};

		this.removePin = function () {
			that.pinned(false);
			if (pinGroupElement) {
				pinGroupElement.remove();
			}
		};

		/**
		 * Draws a circular node.
		 * @param parentElement the element to which this node will be appended
		 * @param cssClasses additional css classes
		 */
		this.drawNode = function (parentElement, cssClasses) {
			var drawTools = webvowl.nodes.drawTools(),
				textBlock;

			that.nodeElement(parentElement);

			drawTools.appendCircularClass(parentElement, that.radius(), that.styleClass(), cssClasses);

			// Add the text to the node
			textBlock = webvowl.util.textElement(parentElement);
			textBlock.addTextline(that.label(), that.textAttribute());
			textBlock.addSubTextNode(that.indication(), that.textAttribute());

			textBlock.repositionTextBlock();
			that.addMouseListeners();
		};
	};
	o.prototype = Object.create(webvowl.nodes.BaseNode.prototype);
	o.prototype.constructor = o;

	return o;
}());