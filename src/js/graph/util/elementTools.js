var BaseLabel = require("../elements/labels/BaseLabel.js");
var BaseNode = require("../elements/nodes/BaseNode.js");
var DatatypeNode = require("../elements/nodes/DatatypeNode.js");
var ObjectProperty = require("../elements/labels/implementations/OwlObjectProperty.js");
var DatatypeProperty = require("../elements/labels/implementations/OwlDatatypeProperty.js");
var RdfsSubClassOf = require("../elements/labels/implementations/RdfsSubClassOf.js");

module.exports = (function () {
	var tools = {};

	tools.isLabel = function (element) {
		return element instanceof BaseLabel;
	};

	tools.isNode = function (element) {
		return element instanceof BaseNode;
	};

	tools.isDatatype = function (node) {
		return node instanceof DatatypeNode;
	};

	tools.isObjectProperty = function (element) {
		return element instanceof ObjectProperty;
	};

	tools.isDatatypeProperty = function (element) {
		return element instanceof DatatypeProperty;
	};

	tools.isRdfsSubClassOf = function (property) {
		return property instanceof RdfsSubClassOf;
	};

	return function () {
		return tools;
	};
})();
