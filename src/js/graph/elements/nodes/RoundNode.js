webvowl.nodes.RoundNode = (function () {

	var o = function (graph) {
		webvowl.nodes.BaseNode.apply(this, arguments);

		var that = this,
			collapsible = false,
			radius = 50,
			pinGroupElement,
			collapsingGroupElement;


		// Properties
		this.collapsible = function (p) {
			if (!arguments.length) return collapsible;
			collapsible = p;
			return this;
		};

		/**
		 * This might not be equal to the actual radius, because the instance count is used for its calculation.
		 * @param p
		 * @returns {*}
		 */
		this.radius = function (p) {
			if (!arguments.length) return radius;
			radius = p;
			return this;
		};


		// Functions
		this.setHoverHighlighting = function (enable) {
			that.nodeElement().selectAll("circle").classed("hovered", enable);
		};

		this.textWidth = function () {
			return this.actualRadius() * 2;
		};

		this.toggleFocus = function () {
			that.focused(!that.focused());
			that.nodeElement().select("circle").classed("focused", that.focused());
		};

		this.actualRadius = function () {
			if (!graph.options().scaleNodesByInstances() || this.instances() <= 0) {
				return this.radius();
			} else {
				// we could "listen" for radius and maxInstanceCount changes, but this is easier
				var scale = d3.scale.log()
					.domain([1, this.maxInstanceCount()])
					.range([this.radius(), 2 * this.radius()]);

				return scale(this.instances());
			}
		};

		/**
		 * Draws the pin on a round node on a position depending on its radius.
		 */
		this.drawPin = function () {
			that.pinned(true);

			pinGroupElement = that.nodeElement()
				.append("g")
				.classed("hidden-in-export", true)
				.attr("transform", function () {
					var dx = (2 / 5) * that.actualRadius(),
						dy = (-7 / 10) * that.actualRadius();
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
		 * Removes the pin and refreshs the graph to update the force layout.
		 */
		this.removePin = function () {
			that.pinned(false);
			if (pinGroupElement) {
				pinGroupElement.remove();
			}
			graph.updateStyle();
		};

		this.drawCollapsingButton = function () {

			collapsingGroupElement = that.nodeElement()
				.append("g")
				.classed("hidden-in-export", true)
				.attr("transform", function () {
					var dx = (-2 / 5) * that.actualRadius(),
						dy = (1 / 2) * that.actualRadius();
					return "translate(" + dx + "," + dy + ")";
				});

			collapsingGroupElement.append("rect")
				.classed("class pin feature", true)
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 40)
				.attr("height", 24);

			collapsingGroupElement.append("line")
				.attr("x1", 13)
				.attr("y1", 12)
				.attr("x2", 27)
				.attr("y2", 12);

			collapsingGroupElement.append("line")
				.attr("x1", 20)
				.attr("y1", 6)
				.attr("x2", 20)
				.attr("y2", 18);
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
			drawTools.appendCircularClass(parentElement, that.actualRadius(), cssClasses, that.labelForCurrentLanguage());

			// Add the text to the node
			textBlock = webvowl.util.textElement(parentElement);
			textBlock.addTextline(that.labelForCurrentLanguage());
			textBlock.addSubTextNode(that.indicationString());

			that.postDrawActions();
		};

		/**
		 * Common actions that should be invoked after drawing a node.
		 */
		this.postDrawActions = function () {
			that.addMouseListeners();
			if (that.pinned()) {
				that.drawPin();
			}
			if (that.collapsible()) {
				that.drawCollapsingButton();
			}
		};
	};
	o.prototype = Object.create(webvowl.nodes.BaseNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
