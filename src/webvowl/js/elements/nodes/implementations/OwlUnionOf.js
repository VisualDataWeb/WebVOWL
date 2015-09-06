var SetOperatorNode = require("../SetOperatorNode.js");

module.exports = (function () {

	var o = function (graph) {
		SetOperatorNode.apply(this, arguments);

		var that = this;

		this.styleClass("unionof")
			.type("owl:unionOf");

		this.drawNode = function (element) {
			that.nodeElement(element);

			element.append("circle")
				.attr("class", that.type())
				.classed("class", true)
				.classed("special", true)
				.attr("r", that.actualRadius());

			var symbol = element.append("g").classed("embedded", true);

			symbol.append("circle")
				.attr("class", "symbol")
				.attr("r", (that.radius() - 15));
			symbol.append("circle")
				.attr("cx", 10)
				.attr("class", "symbol")
				.classed("fineline", true)
				.attr("r", (that.radius() - 15));
			symbol.append("circle")
				.attr("class", "nofill")
				.classed("fineline", true)
				.attr("r", (that.radius() - 15));
			symbol.append("path")
				.attr("class", "link")
				.attr("d", "m 1,-3 c 0,2 0,4 0,6 0,0 0,0 0,0 0,2 2,3 4,3 2,0 4,-1 4,-3 0,-2 0,-4 0,-6");

			symbol.attr("transform", "translate(-" + (that.radius() - 15) / 5 + ",-" + (that.radius() - 15) / 100 + ")");

			that.postDrawActions();
		};
	};
	o.prototype = Object.create(SetOperatorNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
