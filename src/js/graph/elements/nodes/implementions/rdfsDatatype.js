webvowl.nodes.rdfsdatatype = (function () {

	var o = function () {
		webvowl.nodes.RectangularNode.call(this);

		this.attributes(["datatype"])
			.styleClass("datatype")
			.type("rdfs:Datatype");
	};
	o.prototype = Object.create(webvowl.nodes.RectangularNode.prototype);
	o.prototype.constructor = o;

	return o;
}());