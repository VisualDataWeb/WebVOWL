module.exports = function () {

	var app = {},
		updateTimer,
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
		options.filterModules().push(emptyLiteralFilter);

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
		options.filterMenu(filterMenu);
		options.modeMenu(modeMenu);
		options.gravityMenu(gravityMenu);
		options.pausedMenu(pauseMenu);
		options.pickAndPinModule(pickAndPin);
		options.resetMenu(resetMenu);
		options.searchMenu(searchMenu);
		options.ontologyMenu(ontologyMenu);
		options.navigationMenu(navigationMenu);
		graph.start();
		adjustSize();
	};

	function loadOntologyFromText(jsonText, filename, alternativeFilename) {
		pauseMenu.reset();
		setProgressValue(10);
		var data;
		if (jsonText) {
			setProgressValue(15);
			data = JSON.parse(jsonText);
			setProgressValue(20);
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
		setProgressValue(30);
		exportMenu.setJsonText(jsonText);
		setProgressValue(40);
		options.data(data);
		setProgressValue(50);
		graph.load();
		setProgressValue(90);
		sidebar.updateOntologyInformation(data, statistics);
		exportMenu.setFilename(filename);
		setProgressValue(100);



	}
	function setProgressValue(val){
		var progContainer= d3.select("#myProgress");



		// console.log("Setting value to " + val + "%");
		// var testEntry = document.createElement('div');
		// if (val === 0) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass0");
		// }
		// if (val === 10) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass10");
		// }
		// if (val === 20) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass20");
		// }
		// if (val === 30) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass30");
		// }
		// if (val === 40) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass40");
		// }
		// if (val === 50) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass50");
		// }
		// if (val === 60) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass60");
		// }
		// if (val === 70) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass70");
		// }
		// if (val === 80) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass80");
		// }
		// if (val === 90) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass90");
		// }
		// if (val === 100) {
		// 	console.log("Called " + val + "%");
		// 	testEntry.setAttribute('class', "barClass100");
		// }
		//
		// //progContainer.node().appendChild(testEntry);
		//
		// //barClass






	}

	function adjustSize() {
		requestNavigationMenuUpdate();
	}

	function requestNavigationMenuUpdate(){
		if (updateTimer===undefined){
			updateTimer=setTimeout(updateNavigationMenu,50);
		}
	}
	function updateNavigationMenu(){
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
		updateTimer=undefined;
	}

	return app;
};
