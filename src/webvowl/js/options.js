module.exports = function () {
	var options = {},
		data,
		graphContainerSelector,
		classDistance = 200,
		datatypeDistance = 120,
		loopDistance = 100,
		charge = -500,
		gravity = 0.025,
		linkStrength = 1,
		height = 600,
		width = 800,
		selectionModules = [],
		filterModules = [],
		minMagnification = 0.1,
		maxMagnification = 4,
		compactNotation = false,
		scaleNodesByIndividuals = false;


	options.charge = function (p) {
		if (!arguments.length) return charge;
		charge = +p;
		return options;
	};

	options.classDistance = function (p) {
		if (!arguments.length) return classDistance;
		classDistance = +p;
		return options;
	};

	options.compactNotation = function (p) {
		if (!arguments.length) return compactNotation;
		compactNotation = p;
		return options;
	};

	options.data = function (p) {
		if (!arguments.length) return data;
		data = p;
		return options;
	};

	options.datatypeDistance = function (p) {
		if (!arguments.length) return datatypeDistance;
		datatypeDistance = +p;
		return options;
	};

	options.filterModules = function (p) {
		if (!arguments.length) return filterModules;
		filterModules = p;
		return options;
	};

	options.graphContainerSelector = function (p) {
		if (!arguments.length) return graphContainerSelector;
		graphContainerSelector = p;
		return options;
	};

	options.gravity = function (p) {
		if (!arguments.length) return gravity;
		gravity = +p;
		return options;
	};

	options.height = function (p) {
		if (!arguments.length) return height;
		height = +p;
		return options;
	};

	options.linkStrength = function (p) {
		if (!arguments.length) return linkStrength;
		linkStrength = +p;
		return options;
	};

	options.loopDistance = function (p) {
		if (!arguments.length) return loopDistance;
		loopDistance = p;
		return options;
	};

	options.minMagnification = function (p) {
		if (!arguments.length) return minMagnification;
		minMagnification = +p;
		return options;
	};

	options.maxMagnification = function (p) {
		if (!arguments.length) return maxMagnification;
		maxMagnification = +p;
		return options;
	};

	options.scaleNodesByIndividuals = function (p) {
		if (!arguments.length) return scaleNodesByIndividuals;
		scaleNodesByIndividuals = p;
		return options;
	};

	options.selectionModules = function (p) {
		if (!arguments.length) return selectionModules;
		selectionModules = p;
		return options;
	};

	options.width = function (p) {
		if (!arguments.length) return width;
		width = +p;
		return options;
	};

	return options;
};
