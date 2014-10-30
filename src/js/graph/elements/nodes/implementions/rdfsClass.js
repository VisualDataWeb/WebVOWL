webvowl.nodes.rdfsclass = (function () {

	var o = function (graph) {
		webvowl.nodes.RoundNode.apply(this, arguments);

		this.attributes(["rdf"])
			.type("rdfs:Class");
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());