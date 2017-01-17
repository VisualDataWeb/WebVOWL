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
		minMagnification = 0.01,
		maxMagnification = 4,
		compactNotation = false,
		// some filters
		literalFilter,
		// menus
		gravityMenu,
		filterMenu,
		modeMenu,
		pausedMenu,
		pickAndPinModule,
		resetMenu,
		searchMenu,
		ontologyMenu,
		sidebar,
		navigationMenu,
		scaleNodesByIndividuals = false;


	options.sidebar= function(s){
		if (!arguments.length) return sidebar;
		sidebar = s;
		return options;

	};

	options.navigationMenu= function (m){
		if (!arguments.length) return navigationMenu;
		navigationMenu = m;
		return options;

	};
	options.ontologyMenu = function (m){
		if (!arguments.length) return ontologyMenu;
		ontologyMenu = m;
		return options;
	};

	options.searchMenu = function (m) {
		if (!arguments.length) return searchMenu;
		searchMenu = m;
		return options;
	};


	options.resetMenu = function (m) {
		if (!arguments.length) return resetMenu;
		resetMenu = m;
		return options;
	};

	options.pausedMenu = function (m) {
		if (!arguments.length) return pausedMenu;
		pausedMenu = m;
		return options;

	};

	options.pickAndPinModule = function (m) {
		if (!arguments.length) return pickAndPinModule;
		pickAndPinModule = m;
		return options;
	};

	options.gravityMenu = function (m) {
		if (!arguments.length) return gravityMenu;
		gravityMenu = m;
		return options;

	};

	options.filterMenu = function (m) {
		if (!arguments.length) return filterMenu;
		filterMenu = m;
		return options;
	};

	options.modeMenu = function (m) {
		if (!arguments.length) return modeMenu;
		modeMenu = m;
		return options;
	};

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

	options.literalFilter=function (p) {
		if (!arguments.length) return literalFilter;
		literalFilter=p;
		return options;
	};

	return options;
};
