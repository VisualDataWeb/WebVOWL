webvowl.nodes.externalclass = (function () {

	var o = function () {
		webvowl.nodes.RoundNode.call(this);

		this.attributes(["external"])
			.styleClass("external")
			.type("ExternalClass");
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());