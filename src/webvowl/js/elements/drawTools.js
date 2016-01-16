/**
 * Contains reusable function for drawing nodes.
 */
module.exports = (function () {

	var tools = {};

	/**
	 * Append a circular class node with the passed attributes.
	 * @param parent the parent element to which the circle will be appended
	 * @param radius
	 * @param cssClasses an array of additional css classes
	 * @param [tooltip]
	 * @returns {*}
	 */
	tools.appendCircularClass = function (parent, radius, cssClasses, tooltip) {
		var circle = parent.append("circle")
			.classed("class", true)
			.attr("r", radius);

		addCssClasses(circle, cssClasses);
		addToolTip(circle, tooltip);

		return circle;
	};

	function addCssClasses(element, cssClasses) {
		if (cssClasses instanceof Array) {
			cssClasses.forEach(function (cssClass) {
				element.classed(cssClass, true);
			});
		}
	}

	function addToolTip(element, tooltip) {
		if (tooltip) {
			element.append("title").text(tooltip);
		}
	}

	/**
	 * Appends a rectangular class node with the passed attributes.
	 * @param parent the parent element to which the rectangle will be appended
	 * @param width
	 * @param height
	 * @param cssClasses an array of additional css classes
	 * @param [tooltip]
	 * @returns {*}
	 */
	tools.appendRectangularClass = function (parent, width, height, cssClasses, tooltip) {
		var rectangle = parent.append("rect")
			.classed("class", true)
			.attr("x", -width / 2)
			.attr("y", -height / 2)
			.attr("width", width)
			.attr("height", height);

		addCssClasses(rectangle, cssClasses);
		addToolTip(rectangle, tooltip);

		return rectangle;
	};

	tools.drawPin = function(container, dx, dy, onClick) {
		var pinGroupElement = container
			.append("g")
			.classed("hidden-in-export", true)
			.attr("transform", "translate(" + dx + "," + dy + ")");

		pinGroupElement.append("circle")
			.classed("class pin feature", true)
			.attr("r", 12)
			.on("click", function () {
				if (onClick) {
					onClick();
				}
				d3.event.stopPropagation();
			});

		pinGroupElement.append("line")
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("y1", 12)
			.attr("y2", 16);

		return pinGroupElement;
	};


	return function () {
		// Encapsulate into function to maintain default.module.path()
		return tools;
	};
})();
