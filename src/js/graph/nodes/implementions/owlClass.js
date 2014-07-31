webvowl.nodes.owlclass = (function () {

	var o = function () {
		webvowl.nodes.RoundNode.call(this);

		this.styleClass("class")
			.type("owl:Class");
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());