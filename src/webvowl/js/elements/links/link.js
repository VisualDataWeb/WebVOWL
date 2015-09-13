module.exports = function (_domain, _range, _property) {

	var link = {},
		domain = _domain,
		layers,
		layerCount,
		layerIndex,
		loops,
		loopCount,
		loopIndex,
		property = _property,
		range = _range;

	var backPart = require("./linkPart")(domain, property, link),
		frontPart = require("./linkPart")(property, range, link);


	link.layers = function (p) {
		if (!arguments.length) return layers;
		layers = p;
		return link;
	};

	link.layerCount = function (p) {
		if (!arguments.length) return layerCount;
		layerCount = p;
		return link;
	};

	link.layerIndex = function (p) {
		if (!arguments.length) return layerIndex;
		layerIndex = p;
		return link;
	};

	link.loops = function (p) {
		if (!arguments.length) return loops;
		loops = p;
		return link;
	};

	link.loopCount = function (p) {
		if (!arguments.length) return loopCount;
		loopCount = p;
		return link;
	};

	link.loopIndex = function (p) {
		if (!arguments.length) return loopIndex;
		loopIndex = p;
		return link;
	};


	link.backPart = function () {
		return backPart;
	};

	link.domain = function () {
		return domain;
	};

	link.draw = function (linkGroup, markerContainer) {
		frontPart.draw(linkGroup, markerContainer);
		backPart.draw(linkGroup, markerContainer);
	};

	link.frontPart = function () {
		return frontPart;
	};

	link.inverse = function () {
		return property ? property.inverse() : undefined;
	};

	link.linkParts = function () {
		return [link.frontPart(), link.backPart()];
	};

	link.property = function () {
		return property;
	};

	link.range = function () {
		return range;
	};


	return link;
};
