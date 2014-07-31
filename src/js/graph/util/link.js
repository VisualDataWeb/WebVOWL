webvowl.util.link = function () {
	var l = {},
		curvePoint,
		domain,
		inverse,
		layers,
		layerCount,
		layerIndex,
		loops,
		loopCount,
		loopIndex,
		property,
		range;


	l.curvePoint = function (p) {
		if (!arguments.length) return curvePoint;
		curvePoint = p;
		return l;
	};

	l.domain = function (p) {
		if (!arguments.length) return domain;
		domain = p;
		this.source = p;
		return l;
	};

	l.inverse = function (p) {
		if (!arguments.length) return inverse;
		inverse = p;
		return l;
	};

	l.layers = function (p) {
		if (!arguments.length) return layers;
		layers = p;
		return l;
	};

	l.layerCount = function (p) {
		if (!arguments.length) return layerCount;
		layerCount = p;
		return l;
	};

	l.layerIndex = function (p) {
		if (!arguments.length) return layerIndex;
		layerIndex = p;
		return l;
	};

	l.loops = function (p) {
		if (!arguments.length) return loops;
		loops = p;
		return l;
	};

	l.loopCount = function (p) {
		if (!arguments.length) return loopCount;
		loopCount = p;
		return l;
	};

	l.loopIndex = function (p) {
		if (!arguments.length) return loopIndex;
		loopIndex = p;
		return l;
	};

	l.property = function (p) {
		if (!arguments.length) return property;
		property = p;
		return l;
	};

	l.range = function (p) {
		if (!arguments.length) return range;
		range = p;
		this.target = p;
		return l;
	};

	// Define d3 properties
	Object.defineProperties(l, {
		"source": {writable: true},
		"target": {writable: true}
	});

	return l;
};