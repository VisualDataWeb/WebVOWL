var SetOperatorNode = require("../SetOperatorNode.js");

module.exports = (function () {

	var o = function (graph) {
		SetOperatorNode.apply(this, arguments);

		var that = this;

		this.styleClass("intersectionof")
			.type("owl:intersectionOf");

		this.draw = function (element) {
			that.nodeElement(element);

			element.append("circle")
				.attr("class", that.type())
				.classed("class", true)
				.classed("special", true)
				.attr("r", that.actualRadius());

			var symbol = element.append("g").classed("embedded", true);

			symbol.append("path")
				.attr("class", "nostroke")
				.classed("symbol", true).attr("d", "m 24.777,0.771 c0,16.387-13.607,23.435-19.191,23.832S-15.467," +
					"14.526-15.467,0.424S-1.216-24.4,5.437-24.4 C12.09-24.4,24.777-15.616,24.777,0.771z");
			symbol.append("circle")
				.attr("class", "nofill")
				.classed("fineline", true)
				.attr("r", (that.radius() - 15));
			symbol.append("circle")
				.attr("cx", 10)
				.attr("class", "nofill")
				.classed("fineline", true)
				.attr("r", (that.radius() - 15));
			symbol.append("path")
				.attr("class", "nofill")
				.attr("d", "m 9,5 c 0,-2 0,-4 0,-6 0,0 0,0 0,0 0,0 0,-1.8 -1,-2.3 -0.7,-0.6 -1.7,-0.8 -2.9," +
					"-0.8 -1.2,0 -2,0 -3,0.8 -0.7,0.5 -1,1.4 -1,2.3 0,2 0,4 0,6");

			symbol.attr("transform", "translate(-" +  (that.radius() - 15) / 5 + ",-" + (that.radius() - 15) / 100 + ")");

			that.postDrawActions();
		};
	};
	o.prototype = Object.create(SetOperatorNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
