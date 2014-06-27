var graph,
	options,
	untouchedOptions = webvowl.graphOptions(),
	classDistanceOptionSelector = "#classSliderOption",
	datatypeDistanceOptionSelector = "#datatypeSliderOption",
	pauseOptionSelector = "#pauseOption",
	resetOptionSelector = "#resetOption",
	graphSelector = "#graph",
	classSlider,
	datatypeSlider,
	classSliderLabel,
	datatypeSliderLabel,
	jsonURI = "benchmark";

function loadGraph() {
	d3.json("js/data/" + jsonURI + ".json", function (error, data) {
		options.data(data);
		graph.start();
		displayGraphInfo(data);
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

/**
 * Shows the information of the clicked element in the right info panel.
 */
function applyInformation() {
	if (this === undefined) {
		hideInfoFields();
		return;
	}

	if (this.typus === "label") {
		var linkData = this.linkTag.datum();
		hideNodeInfoFields();

		setUriLabel(d3.select("#propname"), this.label, this.uri);
		d3.select("#typeProp").text(this.type);

		if (this.inverse !== undefined) {
			d3.select("#inverse").style("display", "block");
			setUriLabel(d3.select("#inverse span"), this.inverse.label, this.inverse.uri);
		} else {
			d3.select("#inverse").style("display", "none");
		}

		if (this.minCardinality !== undefined) {
			d3.select("#infoCardinality").style("display", "none");
			d3.select("#minCardinality").style("display", "block");
			d3.select("#minCardinality span").text(this.minCardinality);
			d3.select("#maxCardinality").style("display", "block");

			if (this.maxCardinality !== undefined) {
				d3.select("#maxCardinality span").text(this.maxCardinality);
			} else {
				d3.select("#maxCardinality span").text("*");
			}

		} else if (this.cardinality !== undefined) {
			d3.select("#minCardinality").style("display", "none");
			d3.select("#maxCardinality").style("display", "none");
			d3.select("#infoCardinality").style("display", "block");
			d3.select("#infoCardinality span").text(this.cardinality);
		} else {
			d3.select("#infoCardinality").style("display", "none");
			d3.select("#minCardinality").style("display", "none");
			d3.select("#maxCardinality").style("display", "none");
		}

		setUriLabel(d3.select("#domain"), linkData.target.label, linkData.target.uri);
		setUriLabel(d3.select("#range"), linkData.source.label, linkData.source.uri);
	} else if (this.typus === "node") {
		d3.select("#otherDetails").classed("hidden", false);
		d3.select("#class").classed("hidden", false);
		d3.select("#prop").classed("hidden", true);
		setUriLabel(d3.select("#name"), this.label, this.uri);

		/* Equivalent stuff. */
		var equivUriSpan = d3.select("#classEquivUri");
		var equivUriSpanParent = d3.select(equivUriSpan.node().parentNode);

		if (this.equivalent !== undefined) {
			equivUriSpan.selectAll("*").remove();
			this.equivalent.forEach(function (element, index) {
				if (index > 0) {
					equivUriSpan.append("span").text(", ");
				}
				appendUriLabel(equivUriSpan, element.label, element.uri);
			});

			equivUriSpanParent.classed("hidden", false);
		} else {
			equivUriSpanParent.classed("hidden", true);
		}
		d3.select("#typeNode").text(this.type);

		/* Disjoint stuff. */
		var disjointNodes = d3.select("#disjointNodes");
		var disjointNodesParent = d3.select(disjointNodes.node().parentNode);

		if (this.disjointWith !== undefined) {
			disjointNodes.selectAll("*").remove();

			this.disjointWith.forEach(function (element, index) {
				if (index > 0) {
					disjointNodes.append("span").text(", ");
				}
				appendUriLabel(disjointNodes, element.label, element.uri);
			});

			disjointNodesParent.classed("hidden", false);
		} else {
			disjointNodesParent.classed("hidden", true);
		}

	} else {
		hideInfoFields();
	}
}

/**
 * Hides the node informations.
 */
function hideNodeInfoFields() {
	d3.select("#otherDetails").classed("hidden", false);
	d3.select("#prop").classed("hidden", false);
	d3.select("#class").classed("hidden", true);
}

/**
 * Hides the info panel.
 */
function hideInfoFields() {
	d3.select("#otherDetails").classed("hidden", true);
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
	d3.select(pauseOptionSelector)
		.append("a")
		.datum({paused: false})
		.attr("id", "pause")
		.attr("href", "#")
		.text("Pause")
		.on("click", function (d) {
			if (d.paused) {
				graph.unfreeze();
			} else {
				graph.freeze();
			}
			d.paused = !d.paused;
		});
}

(function initialize() {
	graph = new webvowl.Graph();
	options = graph.getGraphOptions();
	options.graphContainerSelector(graphSelector);
	options.infoFunction = applyInformation;
	loadGraph();

	d3.select(window).on("resize", adjustSize);
	bindSliders();
	setResetButton();
	setPauseButton();
})();