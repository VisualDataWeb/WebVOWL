/**
 * Contains the logic for the export button.
 *
 * @param graphSelector the associated graph svg selector
 * @returns {{}}
 */
module.exports = function (graphSelector) {

	var exportMenu = {},
		exportSvgButton,
		exportFilename,
		exportJsonButton,
		exportableJsonText;


	/**
	 * Adds the export button to the website.
	 */
	exportMenu.setup = function () {
		exportSvgButton = d3.select("#exportSvg")
			.on("click", exportSvg);
		exportJsonButton = d3.select("#exportJson")
			.on("click", exportJson);
	};

	exportMenu.setFilename = function (filename) {
		exportFilename = filename || "export";
	};

	exportMenu.setJsonText = function (jsonText) {
		exportableJsonText = jsonText;
	};

	function exportSvg() {
		// Get the d3js SVG element
		var graphSvg = d3.select(graphSelector).select("svg"),
			graphSvgCode,
			escapedGraphSvgCode,
			dataURI;

		// inline the styles, so that the exported svg code contains the css rules
		inlineVowlStyles();
		hideNonExportableElements();

		graphSvgCode = graphSvg.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.node().parentNode.innerHTML;

		// Insert the reference to VOWL
		graphSvgCode = "<!-- Created with WebVOWL (version " + webvowl.version + ")" +
		", http://vowl.visualdataweb.org -->\n" + graphSvgCode;

		escapedGraphSvgCode = escapeUnicodeCharacters(graphSvgCode);
		//btoa(); Creates a base-64 encoded ASCII string from a "string" of binary data.
		dataURI = "data:image/svg+xml;base64," + btoa(escapedGraphSvgCode);

		exportSvgButton.attr("href", dataURI)
			.attr("download", exportFilename + ".svg");

		// remove graphic styles for interaction to go back to normal
		removeVowlInlineStyles();
		showNonExportableElements();
	}

	function escapeUnicodeCharacters(text) {
		var textSnippets = [],
			i, textLength = text.length,
			character,
			charCode;

		for (i = 0; i < textLength; i++) {
			character = text.charAt(i);
			charCode = character.charCodeAt(0);

			if (charCode < 128) {
				textSnippets.push(character);
			} else {
				textSnippets.push("&#" + charCode + ";");
			}
		}

		return textSnippets.join("");
	}

	function inlineVowlStyles() {
		d3.selectAll(".text").style("font-family", "Helvetica, Arial, sans-serif").style("font-size", "12px");
		d3.selectAll(".subtext").style("font-size", "9px");
		d3.selectAll(".text.instance-count").style("fill", "#666");
		d3.selectAll(".external + text .instance-count").style("fill", "#aaa");
		d3.selectAll(".cardinality").style("font-size", "10px");
		d3.selectAll(".text, .embedded").style("pointer-events", "none");
		d3.selectAll(".class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty").style("fill", "#acf");
		d3.selectAll(".label .datatype, .datatypeproperty").style("fill", "#9c6");
		d3.selectAll(".rdf, .rdfproperty").style("fill", "#c9c");
		d3.selectAll(".literal, .node .datatype").style("fill", "#fc3");
		d3.selectAll(".deprecated, .deprecatedproperty").style("fill", "#ccc");
		d3.selectAll(".external, .externalproperty").style("fill", "#36c");
		d3.selectAll("path, .nofill").style("fill", "none");
		d3.selectAll(".symbol").style("fill", "#69c");
		d3.selectAll(".arrowhead, marker path").style("fill", "#000");
		d3.selectAll(".class, path, line, .fineline").style("stroke", "#000");
		d3.selectAll(".white, .subclass, .dottedMarker path, .subclassproperty, .external + text").style("fill", "#fff");
		d3.selectAll(".class.hovered, .property.hovered, path.arrowhead.hovered, .cardinality.hovered, .normalMarker path.hovered, .cardinality.focused, .normalMarker path.focused, circle.pin").style("fill", "#f00").style("cursor", "pointer");
		d3.selectAll(".focused, path.hovered").style("stroke", "#f00");
		d3.selectAll(".label .indirectHighlighting, .feature:hover").style("fill", "#f90");
		d3.selectAll(".class, path, line").style("stroke-width", "2");
		d3.selectAll(".fineline").style("stroke-width", "1");
		d3.selectAll(".special").style("stroke-dasharray", "8");
		d3.selectAll(".dotted").style("stroke-dasharray", "3");
		d3.selectAll("rect.focused, circle.focused").style("stroke-width", "4px");
		d3.selectAll(".nostroke").style("stroke", "none");
		d3.selectAll("#width-test").style("position", "absolute").style("float", "left").style("white-space", "nowrap").style("visibility", "hidden");
		d3.selectAll("marker path").style("stroke-dasharray", "50");
	}

	/**
	 * For example the pin of the pick&pin module should be invisible in the exported graphic.
	 */
	function hideNonExportableElements() {
		d3.selectAll(".hidden-in-export").style("display", "none");
	}

	function removeVowlInlineStyles() {
		d3.selectAll(".text, .subtext, .text.instance-count, .external + text .instance-count, .cardinality, .text, .embedded, .class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty, .label .datatype, .datatypeproperty, .rdf, .rdfproperty, .literal, .node .datatype, .deprecated, .deprecatedproperty, .external, .externalproperty, path, .nofill, .symbol, .arrowhead, marker path, .class, path, line, .fineline, .white, .subclass, .dottedMarker path, .subclassproperty, .external + text, .class.hovered, .property.hovered, path.arrowhead.hovered, .cardinality.hovered, .normalMarker path.hovered, .cardinality.focused, .normalMarker path.focused, circle.pin, .focused, path.hovered, .label .indirectHighlighting, .feature:hover, .class, path, line, .fineline, .special, .dotted, rect.focused, circle.focused, .nostroke, #width-test, marker path").attr("style", null);
	}

	function showNonExportableElements() {
		d3.selectAll(".hidden-in-export").style("display", null);
	}

	function exportJson() {
		if (!exportableJsonText) {
			alert("No graph data available.");
			// Stop the redirection to the path of the href attribute
			d3.event.preventDefault();
			return;
		}

		var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(exportableJsonText);
		exportJsonButton.attr("href", dataURI)
			.attr("download", exportFilename + ".json");
	}

	return exportMenu;
};
