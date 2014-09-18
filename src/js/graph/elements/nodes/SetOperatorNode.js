webvowl.nodes.SetOperatorNode = (function () {

	var radius = 40;

	var o = function () {
		webvowl.nodes.RoundNode.call(this);

		this.radius(radius);
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());