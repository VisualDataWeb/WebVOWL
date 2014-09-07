webvowlApp.app = function () {

	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		graphSelector = "#graph",
		jsonURI = "benchmark",
	// Modules for the webvowl app
		exportMenu,
		gravityMenu,
		filterMenu,
		modeMenu,
		resetMenu,
		pauseMenu,
		sidebar = webvowlApp.sidebar(),
		menuModules,
	// Graph modules
		statistics = webvowl.modules.statistics(),
		focuser = webvowl.modules.focuser(),
		selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation),
		datatypeCollapser = webvowl.modules.datatypeCollapser(),
		subclassCollapser = webvowl.modules.subclassCollapser(),
		pickAndPin = webvowl.modules.pickAndPin(graph);

	app.initialize = function () {
		options.graphContainerSelector(graphSelector);
		options.selectionModules().push(focuser);
		options.selectionModules().push(selectionDetailDisplayer);
		options.selectionModules().push(pickAndPin);
		options.filterModules().push(datatypeCollapser);
		options.filterModules().push(subclassCollapser);
		options.filterModules().push(statistics);
		loadGraph();

		exportMenu = webvowlApp.exportMenu(options.graphContainerSelector(), jsonURI);
		gravityMenu = webvowlApp.gravityMenu(graph);
		filterMenu = webvowlApp.filterMenu(graph, datatypeCollapser, subclassCollapser);
		modeMenu = webvowlApp.modeMenu(pickAndPin);
		resetMenu = webvowlApp.resetMenu(graph, [gravityMenu, filterMenu, modeMenu,
			focuser, selectionDetailDisplayer]);
		pauseMenu = webvowlApp.pauseMenu(graph);

		d3.select(window).on("resize", adjustSize);

		// setup all bottom bar modules
		menuModules = [exportMenu, gravityMenu, filterMenu, modeMenu, resetMenu, pauseMenu];
		menuModules.forEach(function (menu) {
			menu.setup();
		});
	};

	function loadGraph() {
		d3.json("js/data/" + jsonURI + ".json", function (error, data) {
			options.data(data);
			graph.start();
			sidebar.updateOntologyInformation(data, statistics);
			adjustSize();
		});
	}

	function adjustSize() {
		var svg = d3.select(graphSelector).select("svg"),
			height = window.innerHeight - 40,
			width = window.innerWidth - (window.innerWidth * 0.22);

		svg.attr("width", width)
			.attr("height", height);

		options.width(width)
			.height(height);
		graph.updateStyle();
	}

	return app;
};
