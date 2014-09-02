webvowl.nodes.rdfsclass = (function () {

	var o = function () {
		webvowl.nodes.RoundNode.call(this);

		this.styleClass("rdf")
			.type("rdfs:Class");
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());