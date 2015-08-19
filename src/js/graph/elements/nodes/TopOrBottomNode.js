webvowl.nodes.TopOrBottomNode = (function () {

	var o = function (graph) {
		webvowl.nodes.RoundNode.apply(this, arguments);

		var superDrawFunction = this.drawNode;

		this.radius(30);

		this.drawNode = function (element) {
			superDrawFunction(element, ["white", "special"]);
		};
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
