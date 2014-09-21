webvowl.nodes.RoundNode = (function () {

	var o = function () {
		webvowl.nodes.BaseNode.call(this);

		var that = this,
			radius = 50,
			pinGroupElement,
			postUnpinAction;


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

		/**
		 * Draws the pin on a round node on a position depending on its radius.
		 * Because of the possibility to remove a pin on click, we need to be able to pass
		 * a function for post removal process here.
		 * @param [postRemoveAction] a function that will be executed after the deletion of the pin
		 */
		this.drawPin = function (postRemoveAction) {
			that.pinned(true);
			postUnpinAction = postRemoveAction || postUnpinAction;

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

		/**
		 * Removes the pin.
		 * After the pin removal, the passed function will be executed to e.g. refresh the graph.
		 */
		this.removePin = function () {
			that.pinned(false);
			if (pinGroupElement) {
				pinGroupElement.remove();
			}
			if (postUnpinAction instanceof Function) {
				postUnpinAction();
			}
		};

		/**
		 * Draws a circular node.
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
			drawTools.appendCircularClass(parentElement, that.radius(), cssClasses);

			// Add the text to the node
			textBlock = webvowl.util.textElement(parentElement);
			textBlock.addTextline(that.label());
			textBlock.addSubTextNode(that.indicationString());

			that.postDrawActions();
		};

		/**
		 * Common actions that should be invoked after drawing a node.
		 */
		this.postDrawActions = function() {
			that.addMouseListeners();
			if (that.pinned()) {
				that.drawPin();
			}
		};
	};
	o.prototype = Object.create(webvowl.nodes.BaseNode.prototype);
	o.prototype.constructor = o;

	return o;
}());