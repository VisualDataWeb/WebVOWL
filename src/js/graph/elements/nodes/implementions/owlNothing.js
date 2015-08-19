webvowl.nodes.owlnothing = (function () {

	var o = function (graph) {
		webvowl.nodes.TopOrBottomNode.apply(this, arguments);

		this.label("Nothing")
			.type("owl:Nothing")
			.iri("http://www.w3.org/2002/07/owl#Nothing");
	};
	o.prototype = Object.create(webvowl.nodes.TopOrBottomNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
