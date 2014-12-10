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

		setupConverterButton();
		parseUrlAndLoadOntology();

		exportMenu = webvowlApp.exportMenu(options.graphContainerSelector());
		gravityMenu = webvowlApp.gravityMenu(graph);
		filterMenu = webvowlApp.filterMenu(graph, datatypeFilter, subclassFilter, disjointFilter);
		modeMenu = webvowlApp.modeMenu(graph, pickAndPin);
		pauseMenu = webvowlApp.pauseMenu(graph);
		resetMenu = webvowlApp.resetMenu(graph, [gravityMenu, filterMenu, modeMenu,
			focuser, selectionDetailDisplayer, pauseMenu]);

		d3.select(window).on("resize", adjustSize);

		// setup all bottom bar modules
		setupableMenues = [exportMenu, gravityMenu, filterMenu, modeMenu, resetMenu, pauseMenu, sidebar];
		setupableMenues.forEach(function (menu) {
			menu.setup();
		});

		// reload ontology when hash parameter gets changed manually
		d3.select(window).on("hashchange", function() {
			var oldURL = d3.event.oldURL, newURL = d3.event.newURL;

			if (oldURL !== newURL) {
				// don't reload when just the hash parameter gets appended
				if (newURL === oldURL + "#") {
					return;
				}

				updateNavigationHrefs();
				parseUrlAndLoadOntology();
			}
		});

		updateNavigationHrefs();

		graph.start();
		adjustSize();
	};

	/**
	 * Quick fix: update all anchor tags that are used as buttons because a click on them
	 * changes the url and this will load an other ontology.
	 */
	function updateNavigationHrefs() {
		d3.selectAll("#optionsMenu > li > a").attr("href", location.hash || "#");
	}

	function parseUrlAndLoadOntology() {
		// slice the "#" character
		var hashParameter = location.hash.slice(1);

		if (!hashParameter) {
			loadOntology(defaultJsonPath);
			return;
		}

		// IRI parameter
		var iriKey = "iri=";
		if (hashParameter.substr(0, iriKey.length) === iriKey) {
			var iri = hashParameter.slice(iriKey.length);
			loadOntology("/converter.php?iri=" + iri);
			return;
		}

		// id of an existing ontology as parameter
		loadOntology(jsonBasePath + hashParameter + ".json");
	}

	function loadOntology(relativePath) {
		d3.json(relativePath, function (error, data) {
			pauseMenu.reset();

			var loadingFailed = !!error;
			d3.select(graphSelector).select("svg").classed("hidden", loadingFailed);
			d3.select("#loading-info").classed("hidden", !loadingFailed);

			if (loadingFailed) {
				if (data) {
					d3.select("#custom-error-message").text(data.message || "");
				}
				return;
			}

			options.data(data);
			graph.reload();
			sidebar.updateOntologyInformation(data, statistics);

			var filename = relativePath.slice(relativePath.lastIndexOf("/") + 1);
			exportMenu.setFilename(filename.split(".")[0] + ".svg");
		});
	}

	function adjustSize() {
		var graphContainer = d3.select(graphSelector),
			svg = graphContainer.select("svg"),
			height = window.innerHeight - 40,
			width = window.innerWidth - (window.innerWidth * 0.22);

		graphContainer.style("height", height + "px");
		svg.attr("width", width)
			.attr("height", height);

		options.width(width)
			.height(height);
		graph.updateStyle();
	}

	function setupConverterButton() {
		function setActionAttribute() {
			d3.select(".converter-form").attr("action", "#iri=" + d3.select("#convert-iri").property("value"));
		}

		// Call it initially because there might be a value already in the input field
		setActionAttribute();
		d3.select("#convert-iri").on("change", function() {
			setActionAttribute();
		});
	}

	return app;
};
