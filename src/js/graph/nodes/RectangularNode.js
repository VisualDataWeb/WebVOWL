webvowl.nodes.RectangularNode = (function () {

	var o = function () {
		webvowl.nodes.BaseNode.call(this);

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
		this.radius = function () {
			return width;
		};

		this.textWidth = function () {
			return this.width();
		};

		this.toggleFocus = function () {
			that.focused(!that.focused());
			that.nodeElement().select("rect").classed("focused", that.focused());
		};

		// Reused TODO refactor
		this.drawNode = function (element, cssClasses, additionalFunction) {
			that.nodeElement(element);

			element.append("rect")
				.classed(that.styleClass(), true)
				.classed("class", true)
				.classed("special", true)
				.attr("x", -that.width() / 2)
				.attr("y", -that.height() / 2)
				.attr("width", that.width())
				.attr("height", that.height());

			// Add all additional classes to the <circle> element which are needed by the specific class.
			if (cssClasses !== undefined) {
				cssClasses.forEach(function (cssClass) {
					if (typeof cssClass === "string") {
						element.select("rect").classed(cssClass, true);
					} else {
						console.log(cssClass + " is not a valid String to set class! - Element: " + element);
					}
				});
			}

			// If some additional style or element is need. For example equivalent class needs a second circle.
			if (additionalFunction instanceof Function) {
				additionalFunction();
			}

			var textBlock = webvowl.util.textElement(element);
			textBlock.addTextline(that.label());

			that.addMouseListeners();
		};
	};
	o.prototype = Object.create(webvowl.nodes.BaseNode.prototype);
	o.prototype.constructor = o;

	return o;
}());