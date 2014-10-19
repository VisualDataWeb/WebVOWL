webvowl.nodes.externalclass = (function () {

	var o = function (graph) {
		webvowl.nodes.RoundNode.apply(this, arguments);

		this.attributes(["external"])
			.styleClass("external")
			.type("ExternalClass");
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());