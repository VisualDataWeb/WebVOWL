webvowl.options = function () {
	/**
	 * @constructor
	 */
	var options = {},
		data,
		graphContainerSelector,
		defaultLinkDistance = 260,
		classDistance = defaultLinkDistance,
		datatypeDistance = defaultLinkDistance,
		charge = -1000,
		gravity = 0.025,
		linkStrength = 0.7,
		height = 600,
		width = 800,
		clickModules = [],
		filterModules = [],
		minMagnification = 0.1,
		maxMagnification = 4;

	/* Read-only properties */
	options.defaultLinkDistance = function () {
		return defaultLinkDistance;
	};

	/* Properties with read-write access */
	options.clickModules = function (p) {
		if (!arguments.length) return clickModules;
		clickModules = p;
		return options;
	};

	options.filterModules = function (p) {
		if (!arguments.length) return filterModules;
		filterModules = p;
		return options;
	};

	options.data = function (p) {
		if (!arguments.length) return data;
		data = p;
		return options;
	};

	options.graphContainerSelector = function (p) {
		if (!arguments.length) return graphContainerSelector;
		graphContainerSelector = p;
		return options;
	};

	options.classDistance = function (p) {
		if (!arguments.length) return classDistance;
		classDistance = +p;
		return options;
	};

	options.datatypeDistance = function (p) {
		if (!arguments.length) return datatypeDistance;
		datatypeDistance = +p;
		return options;
	};

	options.charge = function (p) {
		if (!arguments.length) return charge;
		charge = +p;
		return options;
	};

	options.gravity = function (p) {
		if (!arguments.length) return gravity;
		gravity = +p;
		return options;
	};

	options.linkStrength = function (p) {
		if (!arguments.length) return linkStrength;
		linkStrength = +p;
		return options;
	};

	options.height = function (p) {
		if (!arguments.length) return height;
		height = +p;
		return options;
	};

	options.width = function (p) {
		if (!arguments.length) return width;
		width = +p;
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

	return options;
};