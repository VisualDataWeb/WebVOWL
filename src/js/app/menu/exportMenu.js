/**
 * Contains the logic for the export button.
 *
 * @param graphSelector the associated graph svg selector
 * @param ontologyName the ontology name used in the export filename
 * @returns {{}}
 */
webvowlApp.exportMenu = function (graphSelector, ontologyName) {

	var exportMenu = {},
		exportButton;


	/**
	 * Adds the export button to the website.
	 */
	exportMenu.setup = function () {
		exportButton = d3.select("#exportSvg")
			.on("click", exportSVG);
	};

	function exportSVG() {
		// Get the d3js SVG element
		var graphSvg = d3.select(graphSelector).select("svg"),
			graphSvgCode,
			encodedGraphSvgCode;

		// inline the styles, so that the exported svg code contains the css rules
		inlineVowlStyles();

		graphSvgCode = graphSvg.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.node().parentNode.innerHTML;

		//btoa(); Creates a base-64 encoded ASCII string from a "string" of binary data.
		encodedGraphSvgCode = "data:image/svg+xml;base64," + btoa(graphSvgCode);

		exportButton.attr("href", encodedGraphSvgCode)
			.attr("download", ontologyName + ".svg");

		// remove graphic styles for interaction to go back to normal
		removeVowlInlineStyles();
	}

	function inlineVowlStyles() {
		d3.selectAll(".text").style("font-family", "Helvetica, Arial, sans-serif").style("font-size", "12px");
		d3.selectAll(".subtext").style("font-size", "9px");
		d3.selectAll(".cardinality").style("font-size", "10px");
		d3.selectAll(".text, .embedded").style("pointer-events", "none");
		d3.selectAll(".class, path, line").style("stroke-width", "2");
		d3.selectAll(".fineline").style("stroke-width", "1");
		d3.selectAll(".special").style("stroke-dasharray", "8");
		d3.selectAll(".dotted").style("stroke-dasharray", "3");
		d3.selectAll("rect.focused, circle.focused").style("stroke-width", "4px");
		d3.selectAll(".nostroke").style("stroke", "none");
		d3.selectAll(".class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty").style("fill", "#acf");
		d3.selectAll(".label .datatype, .datatypeproperty").style("fill", "#9c6");
		d3.selectAll(".rdf, .rdfproperty").style("fill", "#c9c");
		d3.selectAll(".literal, .node .datatype").style("fill", "#fc3");
		d3.selectAll(".deprecated, .deprecatedproperty").style("fill", "#ccc");
		d3.selectAll(".external, .externalproperty").style("fill", "#36c");
		d3.selectAll(".symbol").style("fill", "#69c");
		d3.selectAll("path, .nofill").style("fill", "none");
		d3.selectAll(".arrowhead, marker path").style("fill", "#000");
		d3.selectAll(".class, path, line, .fineline").style("stroke", "#000");
		d3.selectAll(".white, .subclass, .dottedMarker path, .subclassproperty").style("fill", "#fff");
		d3.selectAll(".class.hovered, .property.hovered, path.arrowhead.hovered, .cardinality.hovered, .normalMarker path.hovered, .cardinality.focused, .normalMarker path.focused, circle.pin").style("fill", "#f00").style("cursor", "pointer");
		d3.selectAll(".focused, path.hovered").style("stroke", "#f00");
		d3.selectAll(".label .indirectHighlighting, .feature:hover").style("fill", "#f90");
		d3.selectAll("#width-test").style("position", "absolute").style("float", "left").style("white-space", "nowrap").style("visibility", "hidden");
		d3.selectAll(".vowlGraph .text tspan:only-child, .vowlGraph .cardinality").style("dominant-baseline", "central");
		d3.selectAll("marker path").style("stroke-dasharray", "50");
	}

	function removeVowlInlineStyles() {
		d3.selectAll(".text, .subtext, .cardinality, .text, .embedded, .class, path, line, .fineline, .special, .dotted, rect.focused, circle.focused, .nostroke, .class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty, .label .datatype, .datatypeproperty, .rdf, .rdfproperty, .literal, .node .datatype, .deprecated, .deprecatedproperty, .external, .externalproperty, .symbol, .arrowhead, marker path, .class, path, line, .fineline, .white, .subclass, .dottedMarker path, .subclassproperty, path, .nofill, .class.hovered, .property.hovered, path.arrowhead.hovered, .cardinality.hovered, .normalMarker path.hovered, .cardinality.focused, .normalMarker path.focused, circle.pin, .focused, path.hovered, .label .indirectHighlighting, .feature:hover, #width-test, .vowlGraph .text tspan:only-child, .vowlGraph .cardinality, marker path").attr("style", null);
	}


	return exportMenu;
};
