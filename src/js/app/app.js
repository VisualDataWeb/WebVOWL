webvowlApp.app = function () {

	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		graphSelector = "#graph",
		defaultJsonFilename = "benchmark.json", // This file is loaded by default
	// Modules for the webvowl app
		exportMenu,
		gravityMenu,
		filterMenu,
		modeMenu,
		resetMenu,
		pauseMenu,
		sidebar = webvowlApp.sidebar(),
		setupableMenues,
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
		loadOntology(defaultJsonFilename);

		exportMenu = webvowlApp.exportMenu(options.graphContainerSelector(), "export");
		gravityMenu = webvowlApp.gravityMenu(graph);
		filterMenu = webvowlApp.filterMenu(graph, datatypeCollapser, subclassCollapser);
		modeMenu = webvowlApp.modeMenu(pickAndPin);
		resetMenu = webvowlApp.resetMenu(graph, [gravityMenu, filterMenu, modeMenu,
			focuser, selectionDetailDisplayer]);
		pauseMenu = webvowlApp.pauseMenu(graph);

		d3.select(window).on("resize", adjustSize);

		// setup all bottom bar modules
		setupableMenues = [exportMenu, gravityMenu, filterMenu, modeMenu, resetMenu, pauseMenu, sidebar];
		setupableMenues.forEach(function (menu) {
			menu.setup();
		});

		setOntologySelectionButtons();
	};

	function loadOntology(jsonFilename) {
		d3.json("js/data/" + jsonFilename, function (error, data) {
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

	function setOntologySelectionButtons() {
		d3.select("#foaf").on("click", function () {
			loadOntology("foaf.json");
		});
		d3.select("#muto").on("click", function () {
			loadOntology("muto.json");
		});
		d3.select("#personasonto").on("click", function () {
			loadOntology("personasonto.json");
		});
		d3.select("#benchmarkonto").on("click", function () {
			loadOntology("benchmark.json");
		});
		d3.select("#geonames").on("click", function () {
			loadOntology("geonames.json");
		});
		d3.select("#marine").on("click", function () {
			loadOntology("marinetlo.json");
		});
		d3.select("#marine2").on("click", function () {
			loadOntology("marinetloimarine.json");
		});
		d3.select("#sioc").on("click", function () {
			loadOntology("sioc.json");
		});
	}

	return app;
};
