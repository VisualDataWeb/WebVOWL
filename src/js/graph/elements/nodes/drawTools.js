/**
 * Contains reusable function for drawing nodes.
 */
webvowl.nodes.drawTools = (function () {

	var tools = {};

	/**
	 * Append a circular class node with the passed attributes.
	 * @param parent the parent element to which the circle will be appended
	 * @param radius
	 * @param cssClasses an array of additional css classes
	 * @returns {*}
	 */
	tools.appendCircularClass = function (parent, radius, cssClasses) {
		var circle = parent.append("circle")
			.classed("class", true)
			.attr("r", radius);

		addCssClasses(circle, cssClasses);

		return circle;
	};

	function addCssClasses(element, cssClasses) {
		if (cssClasses instanceof Array) {
			cssClasses.forEach(function (cssClass) {
				element.classed(cssClass, true);
			});
		}
	}

	/**
	 * Appends a rectangular class node with the passed attributes.
	 * @param parent the parent element to which the rectangle will be appended
	 * @param width
	 * @param height
	 * @param cssClasses an array of additional css classes
	 * @returns {*}
	 */
	tools.appendRectangularClass = function (parent, width, height, cssClasses) {
		var rectangle = parent.append("rect")
			.classed("class", true)
			.attr("x", -width / 2)
			.attr("y", -height / 2)
			.attr("width", width)
			.attr("height", height);

		addCssClasses(rectangle, cssClasses);

		return rectangle;
	};


	return function () {
		// Encapsulate into function to maintain default.module.path()
		return tools;
	};
})();
