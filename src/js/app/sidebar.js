/**
 * Contains the logic for the sidebar.
 *
 * @returns {{}}
 */
webvowlApp.sidebar = function () {

	var sidebar = {};


	/**
	 * Setup the menu bar.
	 */
	sidebar.setup = function () {
		setupCollapsing();
	};

	function setupCollapsing() {
		// adapted version of this example: http://www.normansblog.de/simple-jquery-accordion/
		function collapseContainers(containers) {
			containers.style("display", "none");
		}

		function expandContainers(containers) {
			containers.style("display", null);
		}

		var triggers = d3.selectAll(".accordion-trigger");

		// Collapse all inactive triggers on startup
		collapseContainers(d3.selectAll(".accordion-trigger:not(.accordion-trigger-active) + div"));

		triggers.on("click", function () {
			var selectedTrigger = d3.select(this),
				activeTriggers = d3.selectAll(".accordion-trigger-active");

			if (selectedTrigger.classed("accordion-trigger-active")) {
				// Collapse the active (which is also the selected) trigger
				collapseContainers(d3.select(selectedTrigger.node().nextElementSibling));
				selectedTrigger.classed("accordion-trigger-active", false);
			} else {
				// Collapse the other trigger ...
				collapseContainers(d3.selectAll(".accordion-trigger-active + div"));
				activeTriggers.classed("accordion-trigger-active", false);
				// ... and expand the selected one
				expandContainers(d3.select(selectedTrigger.node().nextElementSibling));
				selectedTrigger.classed("accordion-trigger-active", true);
			}
		});
	}

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
		d3.select("#about").attr("href", header.uri).attr("target", "_blank").text(header.uri);
		d3.select("#version").text(header.version);
		d3.select("#authors").text(header.author);
		d3.select("#description").text(header.description);
	}

	function displayGraphStatistics(statistics) {
		d3.select("#classCount")
			.text(statistics.classCount());
		d3.select("#datatypeCount")
			.text(statistics.datatypeCount());
		d3.select("#propertyCount")
			.text(statistics.propertyCount());
		d3.select("#nodeCount")
			.text(statistics.nodeCount());
		d3.select("#edgeCount")
			.text(statistics.edgeCount());
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

		var equivalentUriSpan = d3.select("#propEquivUri");
		displayEquivalentElements(property.equivalent(), equivalentUriSpan);

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

		setUriLabel(d3.select("#domain"), property.domain().label(), property.domain().uri());
		setUriLabel(d3.select("#range"), property.range().label(), property.range().uri());

		displayAttributes(property.attributes(), d3.select("#propAttributes"));
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
			tag = element.append("a").attr("href", uri).attr("target", "_blank");
		} else {
			tag = element.append("span");
		}
		tag.text(name);
	}

	function displayAttributes(attributes, textSpan) {
		var spanParent = d3.select(textSpan.node().parentNode);

		if (attributes && attributes.length > 0) {
			textSpan.text(attributes.join(", "));

			spanParent.classed("hidden", false);
		} else {
			spanParent.classed("hidden", true);
		}
	}

	function displayNodeInformation(node) {
		showClassInformations();

		setUriLabel(d3.select("#name"), node.label(), node.uri());

		/* Equivalent stuff. */
		var equivalentUriSpan = d3.select("#classEquivUri");
		displayEquivalentElements(node.equivalent(), equivalentUriSpan);

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

		displayAttributes(node.attributes(), d3.select("#classAttributes"));
	}

	function showClassInformations() {
		setSelectionInformationVisibility(true, false, false);
	}

	function displayEquivalentElements(equivalentElements, equivalentUriSpan) {
		var equivalentUriSpanParent = d3.select(equivalentUriSpan.node().parentNode);

		if (equivalentElements && equivalentElements.length) {
			equivalentUriSpan.selectAll("*").remove();
			equivalentElements.forEach(function (element, index) {
				if (index > 0) {
					equivalentUriSpan.append("span").text(", ");
				}
				appendUriLabel(equivalentUriSpan, element.label(), element.uri());
			});

			equivalentUriSpanParent.classed("hidden", false);
		} else {
			equivalentUriSpanParent.classed("hidden", true);
		}
	}


	return sidebar;
};
