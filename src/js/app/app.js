var graph,
	options,
	untouchedOptions = webvowl.options(),
	classDistanceOptionSelector = "#classSliderOption",
	datatypeDistanceOptionSelector = "#datatypeSliderOption",
	datatypeCollapsingOptionSelector = "#datatypeCollapsingOption",
	subclassCollapsingOptionSelector = "#subclassCollapsingOption",
	exportButtonSelector = "#exportSvg",
	pauseOptionSelector = "#pauseOption",
	resetOptionSelector = "#resetOption",
	graphSelector = "#graph",
	classSlider,
	datatypeSlider,
	classSliderLabel,
	datatypeSliderLabel,
	jsonURI = "benchmark",
	datatypeCollapser,
	subclassCollapser,
	statistics;

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

	d3.select("#title")
	  .text(header.title);
	d3.select("#about")
	  .attr("href", header.uri)
	  .text(header.uri);
	d3.select("#version")
	  .text(header.version);
	d3.select("#authors")
	  .text(header.author);
	d3.select("#description")
	  .text(header.description);
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

function bindSliders() {
	var classSliderDiv,
		datatypeSliderDiv;

	// Append the link distance slider for classes
	classSliderDiv = d3.select(classDistanceOptionSelector)
		.append("div")
		.attr("id", "classDistanceSlider");

	classSliderLabel = classSliderDiv.append("label")
		.attr("id", "rangeClassValue")
		.attr("for", "rangeClassSlider")
		.text(options.classDistance());

	classSliderDiv.append("label")
		.attr("for", "rangeClassSlider")
		.text("Class Distance");

	classSlider = classSliderDiv.append("input")
		.attr("id", "rangeClassSlider")
		.attr("type", "range")
		.attr("min", 10)
		.attr("max", 600)
		.attr("value", options.classDistance())
		.attr("step", 10);

	classSlider.on("input", function () {
		classSliderChanged();
		options.classDistance(classSlider.property("value"));
		graph.updateStyle();
	});


	// Append the link distance slider for datatypes
	datatypeSliderDiv = d3.select(datatypeDistanceOptionSelector)
		.append("div")
		.attr("id", "datatypeDistanceSlider");

	datatypeSliderLabel = datatypeSliderDiv.append("label")
		.attr("id", "rangeDatatypeValue")
		.attr("for", "rangeDatatypeSlider")
		.text(options.datatypeDistance());

	datatypeSliderDiv.append("label")
		.attr("for", "rangeDatatypeSlider")
		.text("Datatype Distance");

	datatypeSlider = datatypeSliderDiv.append("input")
		.attr("id", "rangeDatatypeSlider")
		.attr("type", "range")
		.attr("min", 10)
		.attr("max", 600)
		.attr("value", options.datatypeDistance())
		.attr("step", 10);

	datatypeSlider.on("input", function () {
		datatypeSliderChanged();
		options.datatypeDistance(datatypeSlider.property("value"));
		graph.updateStyle();
	});
}

function classSliderChanged() {
	var distance = classSlider.property("value");
	classSliderLabel.html(distance);
}

function datatypeSliderChanged() {
	var distance = datatypeSlider.property("value");
	datatypeSliderLabel.html(distance);
}

function bindFilters() {
	function bindFilter(filter, filterName, filterNamePlural, selector) {
		var collapsingOptionContainer,
			collapsingCheckbox,
			identifier = filterName.toLowerCase();

		collapsingOptionContainer = d3.select(selector)
			.append("div")
			.classed("collapsingCheckboxContainer", true)
			.attr("id", identifier + "CollapsingCheckboxContainer");

		collapsingCheckbox = collapsingOptionContainer.append("input")
			.classed("collapsingCheckbox", true)
			.attr("id", identifier + "CollapsingCheckbox")
			.attr("type", "checkbox")
			.attr("value", identifier + "Collapsing");

		collapsingCheckbox.on("click", function () {
			var isEnabled = collapsingCheckbox.property("checked");
			filter.enabled(isEnabled);
			graph.update();
		});

		collapsingOptionContainer.append("label")
			.attr("for", identifier + "CollapsingCheckbox")
			.text("Hide " + filterNamePlural);
	}

	bindFilter(datatypeCollapser, "datatype", "Datatypes", datatypeCollapsingOptionSelector);
	bindFilter(subclassCollapser, "subclass", "Subclasses", subclassCollapsingOptionSelector);
}

/**
 * Shows the information of the clicked element in the right info panel.
 */
function applyInformation(isSelected) {
	function toggleAccordion() {
		if (isSelected) {
			if (d3.select("#ui-accordion-accordion-header-2").attr("aria-selected") !== "true") {
				// Select the correct item from accordion menu and open it.
				d3.select("#ui-accordion-accordion-header-2").node().click();
			}
		} else {
			if (d3.select("#ui-accordion-accordion-header-2").attr("aria-selected") === "true") {
				// Select the correct item from accordion menu and close it.
				d3.select("#ui-accordion-accordion-header-2").node().click();
			}

		}
	}

	toggleAccordion.call(this);

	if (this === undefined) {
		hideInformationPanel();
		return;
	}

	if (this instanceof webvowl.labels.BaseLabel) {
		hideNodeInformations();

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
		d3.select("#class").classed("hidden", false);
		d3.select("#prop").classed("hidden", true);
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
		hideInformationPanel();
	}
}

function hideNodeInformations() {
	d3.select("#prop").classed("hidden", false);
	d3.select("#class").classed("hidden", true);
}

function hideInformationPanel() {
	d3.select("#prop").classed("hidden", true);
	d3.select("#class").classed("hidden", true);
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

		classSlider.property("value", options.classDistance());
		classSliderChanged();
		datatypeSlider.property("value", options.datatypeDistance());
		datatypeSliderChanged();
	}
}

function setPauseButton() {
	var pauseButton = d3.select(pauseOptionSelector)
		.append("a")
		.datum({paused: false})
		.attr("id", "pause")
		.attr("href", "#")
		.on("click", function (d) {
			if (d.paused) {
				graph.unfreeze();
			} else {
				graph.freeze();
			}
			d.paused = !d.paused;
			setPauseButtonText();
			setPauseButtonClass();
		});
	// Set these properties the first time manually
	setPauseButtonClass();
	setPauseButtonText();

	function setPauseButtonClass() {
		pauseButton.classed("paused", function (d) {
			return d.paused;
		});
	}

	function setPauseButtonText() {
		if (pauseButton.datum().paused) {
			pauseButton.text("Resume");
		} else {
			pauseButton.text("Pause");
		}
	}
}

function setExportButton() {
	var exportButton = d3.select(exportButtonSelector)
		.on("click", exportSVG);

	function exportSVG() {
		// Get the d3js SVG element
		var graphSvg = d3.select(graphSelector).select("svg"),
			svgsrc,
			svgXML;

		// inline the styles, so that the exported svg code contains the css rules
		inlineVowlStyles();

		svgsrc = graphSvg.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.node().parentNode.innerHTML;

		//btoa(); Creates a base-64 encoded ASCII string from a "string" of binary data.
		svgXML = "data:image/svg+xml;base64," + btoa(svgsrc);

		exportButton.attr("href", svgXML)
			.attr("download", jsonURI + ".svg");

		// remove graphic styles for interaction to go back to normal
		removeVowlInlineStyles();
	}

	function inlineVowlStyles() {
		d3.selectAll(".text").style("font-family", "Helvetica, Arial, sans-serif").style("font-size", "12px");
		d3.selectAll(".subtext").style("font-size", "9px");
		d3.selectAll(".cardinality").style("font-size", "10px");
		d3.selectAll(".text, .embedded").style("pointer-events", "none");
		d3.selectAll(".class, path").style("stroke-width", "2");
		d3.selectAll(".fineline").style("stroke-width", "1");
		d3.selectAll(".special").style("stroke-dasharray", "8");
		d3.selectAll(".dotted").style("stroke-dasharray", "3");
		d3.selectAll("rect.focused, circle.focused").style("stroke-width", "4px");
		d3.selectAll(".nostroke").style("stroke", "none");
		d3.selectAll(".class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, " +
				".transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty")
			.style("fill", "#acf");
		d3.selectAll(".label .datatype, .datatypeproperty").style("fill", "#9c6");
		d3.selectAll(".rdf, .rdfproperty").style("fill", "#c9c");
		d3.selectAll(".literal, .node .datatype").style("fill", "#fc3");
		d3.selectAll(".deprecated, .deprecatedproperty").style("fill", "#ccc");
		d3.selectAll(".external, .externalproperty").style("fill", "#36c");
		d3.selectAll(".symbol").style("fill", "#69c");
		d3.selectAll(".arrowhead, marker path").style("fill", "#000");
		d3.selectAll(".class, path, .fineline").style("stroke", "#000");
		d3.selectAll(".white, .subclass, .dottedMarker path, .subclassproperty").style("fill", "#fff");
		d3.selectAll("path, .nofill").style("fill", "none");
		d3.selectAll(".class.hovered, .property.hovered, path.arrowhead.hovered, .cardinality.hovered, " +
				".normalMarker path.hovered, .cardinality.focused, .normalMarker path.focused").style("fill", "#f00")
			.style("cursor", "pointer");
		d3.selectAll(".focused, path.hovered").style("stroke", "#f00");
		d3.selectAll(".label .indirectHighlighting").style("fill", "#f90");
		d3.selectAll("#width-test").style("position", "absolute").style("float", "left").style("white-space", "nowrap")
			.style("visibility", "hidden");
		d3.selectAll(".vowlGraph .text tspan:only-child, .vowlGraph .cardinality").style("dominant-baseline", "central");
		d3.selectAll("marker path").style("stroke-dasharray", "50");
	}

	function removeVowlInlineStyles() {
		d3.selectAll(".text, .subtext, .cardinality, .text, .embedded, .class, path, .fineline, .special, .dotted, " +
			"rect.focused, circle.focused, .nostroke, .class, .object, .disjoint, .objectproperty, .disjointwith, " +
			".equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, " +
			".symmetricproperty, .label .datatype, .datatypeproperty, .rdf, .rdfproperty, .literal, .node .datatype, " +
			".deprecated, .deprecatedproperty, .external, .externalproperty, .symbol, .arrowhead, marker path, .class, " +
			"path, .fineline, .white, .subclass, .dottedMarker path, .subclassproperty, path, .nofill, .class.hovered, " +
			".property.hovered, path.arrowhead.hovered, .cardinality.hovered, .normalMarker path.hovered, " +
			".cardinality.focused, .normalMarker path.focused, .focused, path.hovered, .label .indirectHighlighting, " +
			"#width-test, .vowlGraph .text tspan:only-child, .vowlGraph .cardinality, marker path").attr("style", null);
	}
}
function initialize() {
	// Custom additional webvowl modules
	var selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(applyInformation);
	datatypeCollapser = webvowl.modules.datatypeCollapser();
	subclassCollapser = webvowl.modules.subclassCollapser();
	statistics = webvowl.modules.statistics();

	graph = new webvowl.Graph();
	options = graph.getGraphOptions();
	options.graphContainerSelector(graphSelector);
	options.clickModules().push(selectionDetailDisplayer);
	options.filterModules().push(datatypeCollapser);
	options.filterModules().push(subclassCollapser);
	options.filterModules().push(statistics);
	loadGraph();

	d3.select(window).on("resize", adjustSize);
	bindSliders();
	bindFilters();
	setExportButton();
	setResetButton();
	setPauseButton();
}
window.onload = initialize;
