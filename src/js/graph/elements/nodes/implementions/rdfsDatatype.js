webvowl.nodes.rdfsdatatype = (function () {

	var o = function (graph) {
		webvowl.nodes.RectangularNode.apply(this, arguments);

		this.attributes(["datatype"])
			.type("rdfs:Datatype");
	};
	o.prototype = Object.create(webvowl.nodes.RectangularNode.prototype);
	o.prototype.constructor = o;

	return o;
}());