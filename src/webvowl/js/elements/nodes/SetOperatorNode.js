var RoundNode = require("./RoundNode");

module.exports = (function () {

	var radius = 40;

	var o = function (graph) {
		RoundNode.apply(this, arguments);

		var that = this,
			superHoverHighlightingFunction = that.setHoverHighlighting,
			superPostDrawActions = that.postDrawActions;

		this.radius(radius);

		this.setHoverHighlighting = function (enable) {
			superHoverHighlightingFunction(enable);

			// Highlight connected links when hovering the set operator
			d3.selectAll(".link ." + that.cssClassOfNode()).classed("hovered", enable);
		};

		this.draw = function (element) {
			that.nodeElement(element);

			element.append("circle")
				.attr("class", that.type())
				.classed("class", true)
				.classed("dashed", true)
				.attr("r", that.actualRadius());
		};

		this.postDrawActions = function () {
			superPostDrawActions();

			that.textBlock().clear();
			that.textBlock().addInstanceCount(that.individuals().length);
			that.textBlock().setTranslation(0, 10);
		};
	};
	o.prototype = Object.create(RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
