module.exports = function () {

	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		languageTools = webvowl.util.languageTools(),
		GRAPH_SELECTOR = "#graph",
	// Modules for the webvowl app
		exportMenu = require("./menu/exportMenu")(graph),
		filterMenu = require("./menu/filterMenu")(graph),
		gravityMenu = require("./menu/gravityMenu")(graph),
		modeMenu = require("./menu/modeMenu")(graph),
		ontologyMenu = require("./menu/ontologyMenu")(graph),
		pauseMenu = require("./menu/pauseMenu")(graph),
		resetMenu = require("./menu/resetMenu")(graph),
		sidebar = require("./sidebar")(graph),
	// Graph modules
		colorExternalsSwitch = webvowl.modules.colorExternalsSwitch(graph),
		compactNotationSwitch = webvowl.modules.compactNotationSwitch(graph),
		datatypeFilter = webvowl.modules.datatypeFilter(),
		disjointFilter = webvowl.modules.disjointFilter(),
		focuser = webvowl.modules.focuser(),
		nodeDegreeFilter = webvowl.modules.nodeDegreeFilter(filterMenu),
		nodeScalingSwitch = webvowl.modules.nodeScalingSwitch(graph),
		objectPropertyFilter = webvowl.modules.objectPropertyFilter(),
		pickAndPin = webvowl.modules.pickAndPin(),
		selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation),
		statistics = webvowl.modules.statistics(),
		subclassFilter = webvowl.modules.subclassFilter(),
		setOperatorFilter = webvowl.modules.setOperatorFilter();

	app.initialize = function () {
		options.graphContainerSelector(GRAPH_SELECTOR);
		options.selectionModules().push(focuser);
		options.selectionModules().push(selectionDetailDisplayer);
		options.selectionModules().push(pickAndPin);
		options.filterModules().push(statistics);
		options.filterModules().push(datatypeFilter);
		options.filterModules().push(objectPropertyFilter);
		options.filterModules().push(subclassFilter);
		options.filterModules().push(disjointFilter);
		options.filterModules().push(setOperatorFilter);
		options.filterModules().push(nodeScalingSwitch);
		options.filterModules().push(nodeDegreeFilter);
		options.filterModules().push(compactNotationSwitch);
		options.filterModules().push(colorExternalsSwitch);

		d3.select(window).on("resize", adjustSize);

		exportMenu.setup();
		gravityMenu.setup();
		filterMenu.setup(datatypeFilter, objectPropertyFilter, subclassFilter, disjointFilter, setOperatorFilter, nodeDegreeFilter);
		modeMenu.setup(pickAndPin, nodeScalingSwitch, compactNotationSwitch, colorExternalsSwitch);
		pauseMenu.setup();
		sidebar.setup();
		ontologyMenu.setup(loadOntologyFromText);
		resetMenu.setup([gravityMenu, filterMenu, modeMenu, focuser, selectionDetailDisplayer, pauseMenu]);

		graph.start();
		adjustSize();
	};

	function loadOntologyFromText(jsonText, filename, alternativeFilename) {
		pauseMenu.reset();

		var data;
		if (jsonText) {
			data = JSON.parse(jsonText);

			if (!filename) {
				// First look if an ontology title exists, otherwise take the alternative filename
				var ontologyNames = data.header ? data.header.title : undefined;
				var ontologyName = languageTools.textInLanguage(ontologyNames);

				if (ontologyName) {
					filename = ontologyName;
				} else {
					filename = alternativeFilename;
				}
			}
		}

		exportMenu.setJsonText(jsonText);

		options.data(data);
		graph.reload();
		sidebar.updateOntologyInformation(data, statistics);

		exportMenu.setFilename(filename);
	}

	function adjustSize() {
		var graphContainer = d3.select(GRAPH_SELECTOR),
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
