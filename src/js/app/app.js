webvowlApp.app = function () {

	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		graphSelector = "#graph",
		jsonBasePath = "js/data/",
		defaultJsonPath = jsonBasePath + "benchmark.json", // This file is loaded by default
	// Modules for the webvowl app
		exportMenu,
		gravityMenu,
		filterMenu,
		modeMenu,
		resetMenu,
		pauseMenu,
		sidebar = webvowlApp.sidebar(graph),
		setupableMenues,
	// Graph modules
		statistics = webvowl.modules.statistics(),
		focuser = webvowl.modules.focuser(),
		selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation),
		datatypeFilter = webvowl.modules.datatypeFilter(),
		subclassFilter = webvowl.modules.subclassFilter(),
		disjointFilter = webvowl.modules.disjointFilter(),
		pickAndPin = webvowl.modules.pickAndPin();

	app.initialize = function () {
		options.graphContainerSelector(graphSelector);
		options.selectionModules().push(focuser);
		options.selectionModules().push(selectionDetailDisplayer);
		options.selectionModules().push(pickAndPin);
		options.filterModules().push(statistics);
		options.filterModules().push(datatypeFilter);
		options.filterModules().push(subclassFilter);
		options.filterModules().push(disjointFilter);

		setOntologySelectionButtons();
		parseUrlAndLoadOntology();

		exportMenu = webvowlApp.exportMenu(options.graphContainerSelector());
		gravityMenu = webvowlApp.gravityMenu(graph);
		filterMenu = webvowlApp.filterMenu(graph, datatypeFilter, subclassFilter, disjointFilter);
		modeMenu = webvowlApp.modeMenu(graph, pickAndPin);
		resetMenu = webvowlApp.resetMenu(graph, [gravityMenu, filterMenu, modeMenu,
			focuser, selectionDetailDisplayer]);
		pauseMenu = webvowlApp.pauseMenu(graph);

		d3.select(window).on("resize", adjustSize);

		// setup all bottom bar modules
		setupableMenues = [exportMenu, gravityMenu, filterMenu, modeMenu, resetMenu, pauseMenu, sidebar];
		setupableMenues.forEach(function (menu) {
			menu.setup();
		});

		// reload ontology when hash parameter gets changed manually
		d3.select(window).on("hashchange", function() {
			if (d3.event.oldURL !== d3.event.newURL) {
				parseUrlAndLoadOntology();
			}
		});
	};

	function parseUrlAndLoadOntology() {
		// slice the "#" character
		var hashParameter = location.hash.slice(1);

		if (!hashParameter) {
			loadOntology(defaultJsonPath);
			return;
		}

		var ontologySelection = d3.select("#select").select("#" + hashParameter);

		if (ontologySelection.size() < 1) {
			loadOntology(defaultJsonPath);
		} else {
			ontologySelection.on("click")();
		}
	}

	function loadOntology(relativePath) {
		d3.json(relativePath, function (error, data) {
			options.data(data);
			graph.start();
			sidebar.updateOntologyInformation(data, statistics);

			var filename = relativePath.slice(relativePath.lastIndexOf("/") + 1);
			exportMenu.setFilename(filename.split(".")[0] + ".svg");
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
			loadOntology(jsonBasePath + "foaf.json");
		});
		d3.select("#muto").on("click", function () {
			loadOntology(jsonBasePath + "muto.json");
		});
		d3.select("#personasonto").on("click", function () {
			loadOntology(jsonBasePath + "personasonto.json");
		});
		d3.select("#benchmarkonto").on("click", function () {
			loadOntology(jsonBasePath + "benchmark.json");
		});
		d3.select("#geonames").on("click", function () {
			loadOntology(jsonBasePath + "geonames.json");
		});
		d3.select("#marine").on("click", function () {
			loadOntology(jsonBasePath + "marinetlo.json");
		});
		d3.select("#marine2").on("click", function () {
			loadOntology(jsonBasePath + "marinetloimarine.json");
		});
		d3.select("#sioc").on("click", function () {
			loadOntology(jsonBasePath + "sioc.json");
		});
		d3.select("#ontovibe").on("click", function () {
			loadOntology(jsonBasePath + "ontovibe.json");
		});
		d3.select("#prov").on("click", function () {
			loadOntology(jsonBasePath + "prov.json");
		});
	}

	return app;
};
