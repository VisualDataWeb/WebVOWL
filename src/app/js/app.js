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
		searchMenu = require("./menu/searchMenu")(graph),
		navigationMenu = require("./menu/navigationMenu")(graph),
		sidebar = require("./sidebar")(graph),
	// Graph modules
		colorExternalsSwitch = webvowl.modules.colorExternalsSwitch(graph),
		compactNotationSwitch = webvowl.modules.compactNotationSwitch(graph),
		datatypeFilter = webvowl.modules.datatypeFilter(),
		disjointFilter = webvowl.modules.disjointFilter(),
		focuser = webvowl.modules.focuser(),
		emptyLiteralFilter=webvowl.modules.emptyLiteralFilter(),
		nodeDegreeFilter = webvowl.modules.nodeDegreeFilter(filterMenu),
		nodeScalingSwitch = webvowl.modules.nodeScalingSwitch(graph),
		objectPropertyFilter = webvowl.modules.objectPropertyFilter(),
		pickAndPin = webvowl.modules.pickAndPin(),
		selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation),
		statistics = webvowl.modules.statistics(),
		subclassFilter = webvowl.modules.subclassFilter(),
		progress=document.getElementById("myProgress"),
		setOperatorFilter = webvowl.modules.setOperatorFilter();

	app.initialize = function () {
		options.graphContainerSelector(GRAPH_SELECTOR);
		options.selectionModules().push(focuser);
		options.selectionModules().push(selectionDetailDisplayer);
		options.selectionModules().push(pickAndPin);
		options.filterModules().push(emptyLiteralFilter);
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
		searchMenu.setup();
		navigationMenu.setup();

		// give the options the pointer to the some menus for import and export
		options.literalFilter(emptyLiteralFilter);
		options.filterMenu(filterMenu);
		options.modeMenu(modeMenu);
		options.gravityMenu(gravityMenu);
		options.pausedMenu(pauseMenu);
		options.pickAndPinModule(pickAndPin);
		options.resetMenu(resetMenu);
		options.searchMenu(searchMenu);
		options.ontologyMenu(ontologyMenu);
		options.navigationMenu(navigationMenu);
		options.sidebar(sidebar);
		graph.start();
		adjustSize();
	};

	function loadOntologyFromText(jsonText, filename, alternativeFilename) {
		pauseMenu.reset();

		if (jsonText===undefined && filename===undefined){
			console.log("Nothing to load");
			return;
		}

		var data;
		if (jsonText) {
			// validate JSON FILE
			var validJSON;
			try {
				data =JSON.parse(jsonText);
				validJSON=true;
			} catch (e){
				validJSON=false;
			}
			if (validJSON===false){
				// the server output is not a valid json file
				console.log("Retrieved data is not valid! (JSON.parse Error)");
				ontologyMenu.emptyGraphError();
				return;
			}

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

		//@WORKAROUND
		// check if data has classes and properties;
		var classCount				  = parseInt(data.metrics.classCount);
		var objectPropertyCount		  = parseInt(data.metrics.objectPropertyCount);
		var datatypePropertyCount	  = parseInt(data.metrics.datatypePropertyCount);

		if (classCount === 0 && objectPropertyCount===0 && datatypePropertyCount===0 ){
			// generate message for the user;
			ontologyMenu.emptyGraphError();
		}

		exportMenu.setJsonText(jsonText);
		options.data(data);
		graph.load();
		
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
		navigationMenu.updateVisibilityStatus();
	}
	return app;
};
