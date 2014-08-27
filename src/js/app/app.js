var graph,
	options,
	graphSelector = "#graph",
	jsonURI = "benchmark",
	datatypeCollapser,
	subclassCollapser,
	statistics,
	pickAndPin,
	exportMenu,
	gravityMenu,
	filterMenu,
	modeMenu,
	resetMenu,
	pauseMenu,
	sidebar;

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

function initialize() {
	statistics = webvowl.modules.statistics();
	sidebar = webvowlApp.sidebar(statistics);

	// Custom additional webvowl modules
	var selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation);
	datatypeCollapser = webvowl.modules.datatypeCollapser();
	subclassCollapser = webvowl.modules.subclassCollapser();
	pickAndPin = webvowl.modules.pickAndPin();

	graph = new webvowl.Graph();
	options = graph.getGraphOptions();
	options.graphContainerSelector(graphSelector);
	options.clickModules().push(selectionDetailDisplayer);
	options.clickModules().push(pickAndPin);
	options.filterModules().push(datatypeCollapser);
	options.filterModules().push(subclassCollapser);
	options.filterModules().push(statistics);
	loadGraph();

	exportMenu = webvowlApp.exportMenu(options.graphContainerSelector(), jsonURI);
	gravityMenu = webvowlApp.gravityMenu(graph);
	filterMenu = webvowlApp.filterMenu(graph, datatypeCollapser, subclassCollapser);
	modeMenu = webvowlApp.modeMenu(pickAndPin);
	resetMenu = webvowlApp.resetMenu(graph, gravityMenu);
	pauseMenu = webvowlApp.pauseMenu(graph);

	d3.select(window).on("resize", adjustSize);
	gravityMenu.setup();
	filterMenu.setup();
	modeMenu.setup();
	exportMenu.setup();
	resetMenu.setup();
	pauseMenu.setup();
}
window.onload = initialize;
