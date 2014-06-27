'use strict';
// allow console etc and allow global strict statement
/* jshint devel:true, globalstrict:true */
// global variablename:can be overridden
/* global d3:false, TextElement:false */

var webvowl = webvowl || {};
webvowl.labels = webvowl.labels || {};

var TYPE_DISJOINT = "owl:disjointWith";

/**
 * The legal attributes to write under the labels name.
 * @type {string[]}
 */
var attributesToWrite = ["functional", "inverseFunctional", "transitive", "symmetric"];
var LABEL_HEIGHT = 28,
	LABEL_WIDTH = 80;

webvowl.labels.base = {
	typus: "label",
	label: undefined,
	focused: false,
	mouseEntered: false,
	markerTag: undefined,
	labelTag: undefined,
	cardinalityTag: undefined,
	subproperty: undefined,
	maxCardinality: undefined,
	minCardinality: undefined,
	cardinality: undefined,
	graphContainer: undefined,
	toggleFocus: function () {
		if (this.focused) {
			this.labelTag.select("rect").classed("focused", false);
			this.focused = false;
		} else {
			this.labelTag.select("rect").classed("focused", true);
			this.focused = true;
		}
	},
	getTextWidth: function () {
		return LABEL_WIDTH;
	},
	drawProperty: function (labelGroup, graphContainer) {
		this.graphContainer = graphContainer;

		var that = this;

		function attachLabel(property) {
			labelGroup.classed(property.id, true);

			// Draw the label and its background
			var label = labelGroup.append("g")
				.datum(property)
				.classed("label", true)
				.attr("id", property.getPropertyClass());
			property.addRect(label);

			// Attach the text and perhaps special elements
			var textBox = new TextElement(label);
			switch (property.drawnAs) {
				case 'disjointwith':
					property.addDisjointLabel(labelGroup, textBox);
					return label;
				case 'externalproperty':
					textBox.addTextline(property.label, "white");
					break;
				default:
					textBox.addTextline(property.label);
			}
			property.addAttributesToLabel(textBox);
			property.addEquivalentsToLabel(textBox);

			return label;
		}

		// Draw no label by default
		if (this.label === undefined) {
			return undefined;
		}

		this.labelTag = attachLabel(this);

		// Draw an inverse label and reposition both labels if necessary
		if (this.inverse) {
			var yTransformation = (LABEL_HEIGHT / 2) + 1 /* additional space */;
			this.inverse.labelTag = attachLabel(this.inverse);

			this.labelTag.attr("transform", "translate(" + 0 + ",-" + yTransformation + ")");
			this.inverse.labelTag.attr("transform", "translate(" + 0 + "," + yTransformation + ")");
		}

		return this.labelTag;
	},
	drawLink: function (linkGroup) {
		this.linkTag = linkGroup;
		if (this.inverse) {
			this.inverse.linkTag = linkGroup;
		}

		// Add required markers
		var markerDef = this.graphContainer.select("defs"),
			inverse = this.inverse;

		// Marker for this property
		this.markerTag = markerDef.append("marker")
			.datum(this)
			.attr("id", this.getMarkerId())
			.attr("viewBox", "0 -8 14 16")
			.attr("refX", 12)
			.attr("refY", 0)
			.attr("markerWidth", 12)  // ArrowSize
			.attr("markerHeight", 12)
			.attr("markerUnits", "userSpaceOnUse")
			.attr("orient", "auto")  // Orientation of Arrow
			.attr("class", this.markerType + "Marker");
		this.markerTag.append("path")
			.attr("d", "M0,-8L12,0L0,8Z");

		// Marker for the inverse property
		if (inverse) {
			inverse.markerTag = markerDef.append("marker")
				.datum(inverse)
				.attr("id", inverse.getMarkerId())
				.attr("viewBox", "0 -8 14 16")
				.attr("refX", 0)
				.attr("refY", 0)
				.attr("markerWidth", 12)  // ArrowSize
				.attr("markerHeight", 12)
				.attr("markerUnits", "userSpaceOnUse")
				.attr("orient", "auto")  // Orientation of Arrow
				.attr("class", inverse.markerType + "Marker");
			inverse.markerTag.append("path")
				.attr("d", "M12,-8L0,0L12,8Z");
		}

		// Draw the link
		linkGroup.append("path")
			.classed("link-path", true)
			.classed(this.linkType, true)
			.attr("marker-end", function (l) {
				if (!isSpecialLink(l.property)) {
					return "url(#" + l.property.getMarkerId() + ")";
				}
				return "";
			})
			.attr("marker-start", function (l) {
				if (l.inverse && !isSpecialLink(l.inverse)) {
					return "url(#" + l.inverse.getMarkerId() + ")";
				}
				return "";
			});
	},
	addRect: function (groupTag) {
		var that = this;

		groupTag.append("rect")
			.classed(this.drawnAs, true)
			.classed("property", true)
			.attr("x", -LABEL_WIDTH / 2)
			.attr("y", -LABEL_HEIGHT / 2)
			.attr("width", LABEL_WIDTH)
			.attr("height", LABEL_HEIGHT)
			.on("mouseenter", function () {
				that.labelMouseEnter();
				that.highlightSubproperties(true);
			})
			.on("mouseleave", function () {
				that.labelMouseLeave();
				that.highlightSubproperties(false);
			});
	},
	addDisjointLabel: function (groupTag, textTag) {
		groupTag.append("circle")
			.classed("symbol", true)
			.classed("fineline", true)
			.classed("embedded", true)
			.attr("cx", -12.5)
			.attr("r", 10);

		groupTag.append("circle")
			.classed("symbol", true)
			.classed("fineline", true)
			.classed("embedded", true)
			.attr("cx", 12.5)
			.attr("r", 10);

		textTag.addSubTextNode("disjoint");
		textTag.setTranslation(0, 20);
	},
	addAttributesToLabel: function (textBox) {
		var subAttributes = "";

		if (this.attribute) {
			this.attribute.forEach(function (currentAttribute) {
				if (attributesToWrite.contains(currentAttribute)) {
					subAttributes = subAttributes.concat(currentAttribute);
				}
			});
		}

		if (subAttributes) {
			textBox.addSubTextNode(subAttributes);
		}
	},
	addEquivalentsToLabel: function (textBox) {
		if (this.equivalent) {
			var equivalentLabels,
				equivalentString;

			equivalentLabels = this.equivalent.map(function (property) {
				return property.label;
			});
			equivalentString = equivalentLabels.join(", ");

			textBox.addEquivalentSpan(equivalentString);
		}
	},
	getPropertyClass: function () {
		return "property" + this.id;
	},
	getMarkerId: function () {
		return "marker" + this.id;
	},
	drawCardinality: function (cardinalityGroup) {
		if (this.minCardinality === undefined && this.maxCardinality === undefined && this.cardinality === undefined) {
			return undefined;
		}

		// Drawing cardinality groups
		this.cardinalityTag = cardinalityGroup.classed("cardinality", true)
			.classed(this.getPropertyClass(), true);

		var cardText = cardinalityGroup.append("text")
			.classed("cardinality", true)
			.attr("text-anchor", "middle");

		if (this.minCardinality !== undefined) {
			var cardString = this.minCardinality;
			cardString = cardString.concat(" .. ");
			cardString = cardString.concat(this.maxCardinality !== undefined ? this.maxCardinality : "*");

			cardText.text(cardString);
		} else if (this.cardinality !== undefined) {
			cardText.text(this.cardinality);
		}

		return this.cardinalityTag;
	},
	hasAttribute: function (attributeToSearch) {
		if (!this.attribute || !attributeToSearch) {
			return false;
		}

		return this.attribute.contains(attributeToSearch);
	},
	/* Highlights the marker and link for the given label and direction */
	labelMouseEnter: function () {
		if (this.mouseEntered) {
			return;
		}

		var selectedLabelGroup = this.labelTag.node().parentNode,
			labelContainer = selectedLabelGroup.parentNode;

		this.markerTag.select("path").classed("hovered", true);

		this.linkTag.selectAll("path, text")
			.classed("hovered", true);

		// Append hovered element as last child to the container list.
		labelContainer.appendChild(selectedLabelGroup);

		this.mouseEntered = true;
	},
	/* Removes highlighting of marker and link for the given label and direction */
	labelMouseLeave: function () {
		this.markerTag
			.select("path").classed("hovered", false);

		this.linkTag.selectAll("path, text").classed("hovered", false);
		this.mouseEntered = false;
	},

	/* Highlights related subproperties if they are set */
	highlightSubproperties: function (classed) {
		if (this.subproperty === undefined) {
			return;
		}

		this.subproperty.forEach(function (l) {
			l.labelTag.select("rect")
				.classed("indirectHighlighting", classed);
		});
	}
};

webvowl.labels.owlObjectProperty = {
	drawnAs: 'objectproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.owlDatatypeProperty = {
	drawnAs: 'datatypeproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.rdfProperty = {
	drawnAs: 'rdfproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.owlExternalProperty = {
	drawnAs: 'externalproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.owlDeprecatedProperty = {
	drawnAs: 'deprecatedproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.subclassProperty = {
	drawnAs: 'subclassproperty',
	linkType: 'dotted',
	markerType: 'dotted'
};

webvowl.labels.specialProperty = {
	drawnAs: 'specialproperty',
	linkType: 'special',
	markerType: 'special'
};

webvowl.labels.owldisjointWith = {
	label: 'Disjoint With',
	drawnAs: 'disjointwith',
	linkType: 'special',
	markerType: 'special'
};

webvowl.labels.owlFunctionalProperty = {
	drawnAs: 'functionalproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.owlInverseFunctionalProperty = {
	drawnAs: 'inversefunctionalproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.owlTransitiveProperty = {
	drawnAs: 'transitiveproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.owlSymmetricProperty = {
	drawnAs: 'symmetricproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.owlequivalentProperty = {
	drawnAs: 'equivalentproperty',
	linkType: 'normal',
	markerType: 'normal'
};

webvowl.labels.setOperatorProperty = {
	drawnAs: 'setoperatorproperty',
	linkType: 'special',
	markerType: 'special'
};

var isSpecialLink = function isSpecialLinkFunct(property) {
	return property.linkType === "special";
};