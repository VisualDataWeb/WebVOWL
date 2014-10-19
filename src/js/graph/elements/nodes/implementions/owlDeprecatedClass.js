webvowl.nodes.owldeprecatedclass = (function () {

	var o = function (graph) {
		webvowl.nodes.RoundNode.apply(this, arguments);

		this.attributes(["deprecated"])
			.styleClass("deprecated")
			.type("owl:DeprecatedClass");
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());