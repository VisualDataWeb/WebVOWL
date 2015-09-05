var RectangularNode = require("./RectangularNode.js");

module.exports = (function () {

	var o = function (graph) {
		RectangularNode.apply(this, arguments);
	};
	o.prototype = Object.create(RectangularNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
