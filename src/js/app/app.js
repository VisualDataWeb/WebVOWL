webvowlApp.app = function () {

	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		graphSelector = "#graph",
		jsonBasePath = "js/data/",
		defaultJsonName = "foaf", // This file is loaded by default
	// Modules for the webvowl app
		ontologyMenu,
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
		nodeDegreeFilter = webvowl.modules.nodeDegreeFilter(),
		setOperatorFilter = webvowl.modules.setOperatorFilter(),
		nodeScalingSwitch = webvowl.modules.nodeScalingSwitch(graph),
		compactNotationSwitch = webvowl.modules.compactNotationSwitch(graph),
		pickAndPin = webvowl.modules.pickAndPin(),
	// Selections for the app
		loadingError = d3.select("#loading-error"),
		loadingProgress = d3.select("#loading-progress");

	app.initialize = function () {
		options.graphContainerSelector(graphSelector);
		options.selectionModules().push(focuser);
		options.selectionModules().push(selectionDetailDisplayer);
		options.selectionModules().push(pickAndPin);
		options.filterModules().push(statistics);
		options.filterModules().push(datatypeFilter);
		options.filterModules().push(subclassFilter);
		options.filterModules().push(disjointFilter);
		options.filterModules().push(setOperatorFilter);
		options.filterModules().push(nodeScalingSwitch);
		options.filterModules().push(nodeDegreeFilter);
		options.filterModules().push(compactNotationSwitch);

		parseUrlAndLoadOntology();

		ontologyMenu = webvowlApp.ontologyMenu();
		exportMenu = webvowlApp.exportMenu(options.graphContainerSelector());
		gravityMenu = webvowlApp.gravityMenu(graph);
		filterMenu = webvowlApp.filterMenu(graph, datatypeFilter, subclassFilter, disjointFilter, setOperatorFilter, nodeDegreeFilter);
		modeMenu = webvowlApp.modeMenu(graph, pickAndPin, nodeScalingSwitch, compactNotationSwitch);
		pauseMenu = webvowlApp.pauseMenu(graph);
		resetMenu = webvowlApp.resetMenu(graph, [gravityMenu, filterMenu, modeMenu,
			focuser, selectionDetailDisplayer, pauseMenu]);

		d3.select(window).on("resize", adjustSize);

		// setup all bottom bar modules
		setupableMenues = [ontologyMenu, exportMenu, gravityMenu, filterMenu, modeMenu, resetMenu, pauseMenu, sidebar];
		setupableMenues.forEach(function (menu) {
			menu.setup();
		});

		// reload ontology when hash parameter gets changed manually
		d3.select(window).on("hashchange", function () {
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
			hashParameter = defaultJsonName;
		}

		var ontologyOptions = d3.selectAll(".select li").classed("selected-ontology", false);

		// IRI parameter
		var iriKey = "iri=";
		if (hashParameter.substr(0, iriKey.length) === iriKey) {
			var iri = hashParameter.slice(iriKey.length);
			loadOntology("converter.php?iri=" + encodeURIComponent(iri));

			d3.select("#converter-option").classed("selected-ontology", true);
		} else {
			// id of an existing ontology as parameter
			loadOntology(jsonBasePath + hashParameter + ".json");

			ontologyOptions.each(function () {
				var ontologyOption = d3.select(this);
				if (ontologyOption.select("a").size() > 0) {

					if (ontologyOption.select("a").attr("href") === "#" + hashParameter) {
						ontologyOption.classed("selected-ontology", true);
					}
				}
			});
		}
	}

	function loadOntology(relativePath) {
		loadingError.classed("hidden", true);
		loadingProgress.classed("hidden", false);

		d3.xhr(relativePath, 'application/json', function (error, request) {
			pauseMenu.reset();

			var loadingFailed = !!error;
			if (loadingFailed) {
				d3.select("#custom-error-message").text(error.response || "");
			}

			loadingError.classed("hidden", !loadingFailed);
			loadingProgress.classed("hidden", true);

			var jsonText, data;
			if (!loadingFailed) {
				jsonText = request.responseText;
				data = JSON.parse(jsonText);
			}

			exportMenu.setJsonText(jsonText);

			options.data(data);
			graph.reload();
			sidebar.updateOntologyInformation(data, statistics);

			var filename = relativePath.slice(relativePath.lastIndexOf("/") + 1);
			exportMenu.setFilename(filename.split(".")[0]);
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

	return app;
};
