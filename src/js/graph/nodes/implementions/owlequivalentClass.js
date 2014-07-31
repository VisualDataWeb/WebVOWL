webvowl.nodes.owlequivalentclass = (function () {

	var o = function () {
		webvowl.nodes.RoundNode.call(this);

		var that = this,
			superDrawFunction = this.drawNode;

		this.styleClass("equivalentclass")
			.type("owl:equivalentClass");

		this.drawNode = function (element) {
			function appendEquivalentCircle() {
				element.append("circle")
					.classed("class", true)
					.attr("r", that.radius() - 4);
			}

			superDrawFunction(element, ["white", "embedded"], appendEquivalentCircle);
		};
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());