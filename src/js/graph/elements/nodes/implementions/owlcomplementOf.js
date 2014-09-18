webvowl.nodes.owlcomplementof = (function () {

	var radius = 40;

	var o = function () {
		webvowl.nodes.RoundNode.call(this);

		var that = this;

		this.radius(radius)
			.styleClass("intersectionof")
			.type("owl:intersectionOf");

		this.drawNode = function (element) {
			that.nodeElement(element);

			element.append("circle")
				.attr("class", that.type())
				.classed("class", true)
				.classed("special", true)
				.attr("r", that.radius());

			var symbol = element.append("g").classed("embedded", true);

			symbol.append("circle")
				.attr("class", "symbol")
				.classed("fineline", true)
				.attr("r", (that.radius() - 15));
			symbol.append("path")
				.attr("class", "nofill")
				.attr("d", "m -7,-1.5 12,0 0,6");
			symbol.attr("transform", "translate(-" + (that.radius() - 15) / 100 + ",-" +
				(that.radius() - 15) / 100 + ")");

			that.postDrawActions();
		};
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());