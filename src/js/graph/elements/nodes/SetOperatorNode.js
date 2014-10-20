webvowl.nodes.SetOperatorNode = (function () {

	var radius = 40;

	var o = function (graph) {
		webvowl.nodes.RoundNode.apply(this, arguments);

		var that = this,
			superHoverHighlightingFunction = this.setHoverHighlighting;

		this.radius(radius);

		this.setHoverHighlighting = function (enable) {
			superHoverHighlightingFunction(enable);

			d3.selectAll(".special." + that.cssClassOfNode()).classed("hovered", enable);
		};
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());