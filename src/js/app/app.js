var graph,
	options,
	untouchedOptions = webvowl.options(),
	resetOptionSelector = "#resetOption",
	graphSelector = "#graph",
	jsonURI = "benchmark",
	datatypeCollapser,
	subclassCollapser,
	statistics,
	pickAndPin,
	filterMenu,
	modeMenu,
	gravityMenu,
	pauseMenu,
	exportMenu;

function displayGraphStatistics() {
	d3.select("#statNodes")
		.text(statistics.nodeCount());
	d3.select("#statClass")
		.text(statistics.classCount());
	d3.select("#statDatatypes")
		.text(statistics.datatypeCount());
	d3.select("#statProp")
		.text(statistics.propertyCount());
}

function loadGraph() {
	d3.json("js/data/" + jsonURI + ".json", function (error, data) {
		options.data(data);
		graph.start();
		displayGraphInfo(data);
		displayGraphStatistics();
		adjustSize();
	});
}

function displayGraphInfo(data) {
	var header = data.header;

	d3.select("#title").text(header.title);
	d3.select("#about").attr("href", header.uri).text(header.uri);
	d3.select("#version").text(header.version);
	d3.select("#authors").text(header.author);
	d3.select("#description").text(header.description);
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

/**
 * Shows the information of the clicked element in the right info panel.
 */
function applyInformation(isAnythingSelected) {
	if (d3.event.defaultPrevented) {
		return;
	}

	var isTriggerActive = d3.select("#selection-details-trigger").classed("accordion-trigger-active");
	if (isAnythingSelected && !isTriggerActive) {
		d3.select("#selection-details-trigger").node().click();
	} else if (!isAnythingSelected && isTriggerActive) {
		d3.select("#selection-details-trigger").node().click();
		showSelectionAdvice();
		return;
	}

	function setSelectionInformationVisibility(showClasses, showProperties, showAdvice) {
		d3.select("#classSelectionInformation").classed("hidden", !showClasses);
		d3.select("#propertySelectionInformation").classed("hidden", !showProperties);
		d3.select("#noSelectionInformation").classed("hidden", !showAdvice);
	}

	function showClassInformations() {
		setSelectionInformationVisibility(true, false, false);
	}

	function showPropertyInformations() {
		setSelectionInformationVisibility(false, true, false);
	}

	function showSelectionAdvice() {
		console.log("whaat")
		setSelectionInformationVisibility(false, false, true);
	}

	if (this === undefined) {
		showSelectionAdvice();
		return;
	}

	if (this instanceof webvowl.labels.BaseLabel) {
		showPropertyInformations();

		setUriLabel(d3.select("#propname"), this.label(), this.uri());
		d3.select("#typeProp").text(this.type());

		if (this.inverse() !== undefined) {
			d3.select("#inverse").style("display", "block");
			setUriLabel(d3.select("#inverse span"), this.inverse().label(), this.inverse().uri());
		} else {
			d3.select("#inverse").style("display", "none");
		}

		if (this.minCardinality() !== undefined) {
			d3.select("#infoCardinality").style("display", "none");
			d3.select("#minCardinality").style("display", "block");
			d3.select("#minCardinality span").text(this.minCardinality());
			d3.select("#maxCardinality").style("display", "block");

			if (this.maxCardinality() !== undefined) {
				d3.select("#maxCardinality span").text(this.maxCardinality());
			} else {
				d3.select("#maxCardinality span").text("*");
			}

		} else if (this.cardinality() !== undefined) {
			d3.select("#minCardinality").style("display", "none");
			d3.select("#maxCardinality").style("display", "none");
			d3.select("#infoCardinality").style("display", "block");
			d3.select("#infoCardinality span").text(this.cardinality());
		} else {
			d3.select("#infoCardinality").style("display", "none");
			d3.select("#minCardinality").style("display", "none");
			d3.select("#maxCardinality").style("display", "none");
		}

		setUriLabel(d3.select("#domain"), this.range().label(), this.range().uri());
		setUriLabel(d3.select("#range"), this.domain().label(), this.domain().uri());
	} else if (this instanceof webvowl.nodes.BaseNode) {
		showClassInformations();

		setUriLabel(d3.select("#name"), this.label(), this.uri());

		/* Equivalent stuff. */
		var equivUriSpan = d3.select("#classEquivUri");
		var equivUriSpanParent = d3.select(equivUriSpan.node().parentNode);

		if (this.equivalent() !== undefined) {
			equivUriSpan.selectAll("*").remove();
			this.equivalent().forEach(function (element, index) {
				if (index > 0) {
					equivUriSpan.append("span").text(", ");
				}
				appendUriLabel(equivUriSpan, element.label(), element.uri());
			});

			equivUriSpanParent.classed("hidden", false);
		} else {
			equivUriSpanParent.classed("hidden", true);
		}
		d3.select("#typeNode").text(this.type());

		/* Disjoint stuff. */
		var disjointNodes = d3.select("#disjointNodes");
		var disjointNodesParent = d3.select(disjointNodes.node().parentNode);

		if (this.disjointWith() !== undefined) {
			disjointNodes.selectAll("*").remove();

			this.disjointWith().forEach(function (element, index) {
				if (index > 0) {
					disjointNodes.append("span").text(", ");
				}
				appendUriLabel(disjointNodes, element.label(), element.uri());
			});

			disjointNodesParent.classed("hidden", false);
		} else {
			disjointNodesParent.classed("hidden", true);
		}

	} else {
		showSelectionAdvice();
	}
}

/**
 *  Removes all existing child elements and appends an uri label.
 */
function setUriLabel(element, name, uri) {
	element.selectAll("*").remove();
	appendUriLabel(element, name, uri)
}

/**
 * Appends a field containing the name and if existing a hyperlink to the set uri.
 * @param element The element to append to.
 * @param name The label of the element.
 * @param uri The uri.
 */
function appendUriLabel(element, name, uri) {
	var tag;

	if (uri) {
		tag = element.append("a").attr("href", uri);
	} else {
		tag = element.append("span");
	}
	tag.text(name);
}

function setResetButton() {
	d3.select(resetOptionSelector)
		.append("a")
		.attr("id", "reset")
		.attr("href", "#")
		.property("type", "reset")
		.text("Reset")
		.on("click", resetGraph);

	function resetGraph() {
		options.classDistance(untouchedOptions.classDistance());
		options.datatypeDistance(untouchedOptions.datatypeDistance());
		options.charge(untouchedOptions.charge());
		options.gravity(untouchedOptions.gravity());
		options.linkStrength(untouchedOptions.linkStrength());
		graph.reset();
		graph.updateStyle();

		gravityMenu.reset();
	}
}

function initialize() {
	// Custom additional webvowl modules
	var selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(applyInformation);
	datatypeCollapser = webvowl.modules.datatypeCollapser();
	subclassCollapser = webvowl.modules.subclassCollapser();
	statistics = webvowl.modules.statistics();
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
	pauseMenu = webvowlApp.pauseMenu(graph);

	d3.select(window).on("resize", adjustSize);
	gravityMenu.setup();
	filterMenu.setup();
	modeMenu.setup();
	exportMenu.setup();
	setResetButton();
	pauseMenu.setup();
}
window.onload = initialize;
