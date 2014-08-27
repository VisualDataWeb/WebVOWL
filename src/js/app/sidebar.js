/**
 * Contains the logic for the sidebar.
 *
 * @returns {{}}
 */
webvowlApp.sidebar = function () {

	var sidebar = {};


	/**
	 * Updates the information of the passed ontology.
	 * @param data the graph data
	 * @param statistics the statistics module
	 */
	sidebar.updateOntologyInformation = function (data, statistics) {
		displayGraphInformation(data);
		displayGraphStatistics(statistics);
	};

	function displayGraphInformation(data) {
		var header = data.header;

		d3.select("#title").text(header.title);
		d3.select("#about").attr("href", header.uri).text(header.uri);
		d3.select("#version").text(header.version);
		d3.select("#authors").text(header.author);
		d3.select("#description").text(header.description);
	}

	function displayGraphStatistics(statistics) {
		d3.select("#statNodes")
			.text(statistics.nodeCount());
		d3.select("#statClass")
			.text(statistics.classCount());
		d3.select("#statDatatypes")
			.text(statistics.datatypeCount());
		d3.select("#statProp")
			.text(statistics.propertyCount());
	}

	/**
	 * Update the information of the selected node.
	 * @param selectedElement the selection or null if nothing is selected
	 */
	sidebar.updateSelectionInformation = function (selectedElement) {
		// Click event was prevented when dragging
		if (d3.event.defaultPrevented) {
			return;
		}


		var isTriggerActive = d3.select("#selection-details-trigger").classed("accordion-trigger-active");
		if (selectedElement && !isTriggerActive) {
			d3.select("#selection-details-trigger").node().click();
		} else if (!selectedElement && isTriggerActive) {
			d3.select("#selection-details-trigger").node().click();
			showSelectionAdvice();
			return;
		}

		if (selectedElement instanceof webvowl.labels.BaseLabel) {
			displayLabelInformation(selectedElement);
		} else if (selectedElement instanceof webvowl.nodes.BaseNode) {
			displayNodeInformation(selectedElement);
		}
	};

	function showSelectionAdvice() {
		setSelectionInformationVisibility(false, false, true);
	}

	function setSelectionInformationVisibility(showClasses, showProperties, showAdvice) {
		d3.select("#classSelectionInformation").classed("hidden", !showClasses);
		d3.select("#propertySelectionInformation").classed("hidden", !showProperties);
		d3.select("#noSelectionInformation").classed("hidden", !showAdvice);
	}

	function displayLabelInformation(property) {
		showPropertyInformations();

		setUriLabel(d3.select("#propname"), property.label(), property.uri());
		d3.select("#typeProp").text(property.type());

		if (property.inverse() !== undefined) {
			d3.select("#inverse").style("display", "block");
			setUriLabel(d3.select("#inverse span"), property.inverse().label(), property.inverse().uri());
		} else {
			d3.select("#inverse").style("display", "none");
		}

		if (property.minCardinality() !== undefined) {
			d3.select("#infoCardinality").style("display", "none");
			d3.select("#minCardinality").style("display", "block");
			d3.select("#minCardinality span").text(property.minCardinality());
			d3.select("#maxCardinality").style("display", "block");

			if (property.maxCardinality() !== undefined) {
				d3.select("#maxCardinality span").text(property.maxCardinality());
			} else {
				d3.select("#maxCardinality span").text("*");
			}

		} else if (property.cardinality() !== undefined) {
			d3.select("#minCardinality").style("display", "none");
			d3.select("#maxCardinality").style("display", "none");
			d3.select("#infoCardinality").style("display", "block");
			d3.select("#infoCardinality span").text(property.cardinality());
		} else {
			d3.select("#infoCardinality").style("display", "none");
			d3.select("#minCardinality").style("display", "none");
			d3.select("#maxCardinality").style("display", "none");
		}

		setUriLabel(d3.select("#domain"), property.range().label(), property.range().uri());
		setUriLabel(d3.select("#range"), property.domain().label(), property.domain().uri());
	}

	function showPropertyInformations() {
		setSelectionInformationVisibility(false, true, false);
	}

	function setUriLabel(element, name, uri) {
		element.selectAll("*").remove();
		appendUriLabel(element, name, uri);
	}

	function appendUriLabel(element, name, uri) {
		var tag;

		if (uri) {
			tag = element.append("a").attr("href", uri);
		} else {
			tag = element.append("span");
		}
		tag.text(name);
	}

	function displayNodeInformation(node) {
		showClassInformations();

		setUriLabel(d3.select("#name"), node.label(), node.uri());

		/* Equivalent stuff. */
		var equivUriSpan = d3.select("#classEquivUri");
		var equivUriSpanParent = d3.select(equivUriSpan.node().parentNode);

		if (node.equivalent() !== undefined) {
			equivUriSpan.selectAll("*").remove();
			node.equivalent().forEach(function (element, index) {
				if (index > 0) {
					equivUriSpan.append("span").text(", ");
				}
				appendUriLabel(equivUriSpan, element.label(), element.uri());
			});

			equivUriSpanParent.classed("hidden", false);
		} else {
			equivUriSpanParent.classed("hidden", true);
		}
		d3.select("#typeNode").text(node.type());

		/* Disjoint stuff. */
		var disjointNodes = d3.select("#disjointNodes");
		var disjointNodesParent = d3.select(disjointNodes.node().parentNode);

		if (node.disjointWith() !== undefined) {
			disjointNodes.selectAll("*").remove();

			node.disjointWith().forEach(function (element, index) {
				if (index > 0) {
					disjointNodes.append("span").text(", ");
				}
				appendUriLabel(disjointNodes, element.label(), element.uri());
			});

			disjointNodesParent.classed("hidden", false);
		} else {
			disjointNodesParent.classed("hidden", true);
		}
	}

	function showClassInformations() {
		setSelectionInformationVisibility(true, false, false);
	}


	return sidebar;
};
