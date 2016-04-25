var BaseElement = require("../BaseElement");
var CenteringTextElement = require("../../util/CenteringTextElement");
var drawTools = require("../drawTools")();
var forceLayoutNodeFunctions = require("../forceLayoutNodeFunctions")();
var rectangularElementTools = require("../rectangularElementTools")();

module.exports = (function () {

	// Static variables
	var labelHeight = 28,
		labelWidth = 80,
		smallestRadius = labelHeight / 2;


	// Constructor, private variables and privileged methods
	var Base = function (graph) {
		BaseElement.apply(this, arguments);

		var that = this,
		// Basic attributes
			cardinality,
			domain,
			inverse,
			link,
			minCardinality,
			maxCardinality,
			range,
			subproperties,
			superproperties,
		// Style attributes
			linkType = "normal",
			markerType = "filled",
			labelVisible = true,
		// Element containers
			cardinalityElement,
			labelElement,
			linkGroup,
			markerElement,
		// Other
			pinGroupElement,
			redundantProperties = [];


		// Properties
		this.cardinality = function (p) {
			if (!arguments.length) return cardinality;
			cardinality = p;
			return this;
		};

		this.cardinalityElement = function (p) {
			if (!arguments.length) return cardinalityElement;
			cardinalityElement = p;
			return this;
		};

		this.domain = function (p) {
			if (!arguments.length) return domain;
			domain = p;
			return this;
		};

		this.inverse = function (p) {
			if (!arguments.length) return inverse;
			inverse = p;
			return this;
		};

		this.labelElement = function (p) {
			if (!arguments.length) return labelElement;
			labelElement = p;
			return this;
		};

		this.labelVisible = function (p) {
			if (!arguments.length) return labelVisible;
			labelVisible = p;
			return this;
		};

		this.link = function (p) {
			if (!arguments.length) return link;
			link = p;
			return this;
		};

		this.linkGroup = function (p) {
			if (!arguments.length) return linkGroup;
			linkGroup = p;
			return this;
		};

		this.linkType = function (p) {
			if (!arguments.length) return linkType;
			linkType = p;
			return this;
		};

		this.markerElement = function (p) {
			if (!arguments.length) return markerElement;
			markerElement = p;
			return this;
		};

		this.markerType = function (p) {
			if (!arguments.length) return markerType;
			markerType = p;
			return this;
		};

		this.maxCardinality = function (p) {
			if (!arguments.length) return maxCardinality;
			maxCardinality = p;
			return this;
		};

		this.minCardinality = function (p) {
			if (!arguments.length) return minCardinality;
			minCardinality = p;
			return this;
		};

		this.range = function (p) {
			if (!arguments.length) return range;
			range = p;
			return this;
		};

		this.redundantProperties = function (p) {
			if (!arguments.length) return redundantProperties;
			redundantProperties = p;
			return this;
		};

		this.subproperties = function (p) {
			if (!arguments.length) return subproperties;
			subproperties = p;
			return this;
		};

		this.superproperties = function (p) {
			if (!arguments.length) return superproperties;
			superproperties = p;
			return this;
		};


		// Functions
		this.distanceToBorder = function (dx, dy) {
			return rectangularElementTools.distanceToBorder(that, dx, dy);
		};

		this.linkHasMarker = function () {
			return linkType !== "dashed";
		};

		this.markerId = function () {
			return "marker" + that.id();
		};

		this.toggleFocus = function () {
			that.focused(!that.focused());
			labelElement.select("rect").classed("focused", that.focused());
		};


		// Reused functions TODO refactor
		this.draw = function (labelGroup) {
			function attachLabel(property) {
				var labelContainer = labelGroup.append("g")
					.datum(property)
					.classed("label", true)
					.attr("id", property.id());

				property.drawLabel(labelContainer);

				return labelContainer;
			}

			if (!that.labelVisible()) {
				return undefined;
			}

			that.labelElement(attachLabel(that));

			// Draw an inverse label and reposition both labels if necessary
			if (that.inverse()) {
				var yTransformation = (that.height() / 2) + 1 /* additional space */;
				that.inverse()
					.labelElement(attachLabel(that.inverse()));

				that.labelElement()
					.attr("transform", "translate(" + 0 + ",-" + yTransformation + ")");
				that.inverse()
					.labelElement()
					.attr("transform", "translate(" + 0 + "," + yTransformation + ")");
			}

			if (that.pinned()) {
				that.drawPin();
			} else if (that.inverse() && that.inverse().pinned()) {
				that.inverse().drawPin();
			}

			return that.labelElement();
		};

		this.addRect = function (labelContainer) {
			var rect = labelContainer.append("rect")
				.classed(that.styleClass(), true)
				.classed("property", true)
				.attr("x", -that.width() / 2)
				.attr("y", -that.height() / 2)
				.attr("width", that.width())
				.attr("height", that.height())
				.on("mouseover", function () {
					onMouseOver();
				})
				.on("mouseout", function () {
					onMouseOut();
				});

			rect.append("title")
				.text(that.labelForCurrentLanguage());

			if (that.visualAttributes()) {
				rect.classed(that.visualAttributes(), true);
			}
			if (that.backgroundColor()) {
				rect.style("fill", that.backgroundColor());
			}
		};
		this.drawLabel = function (labelContainer) {
			this.addRect(labelContainer);

			var textElement = new CenteringTextElement(labelContainer, this.backgroundColor());
			textElement.addText(this.labelForCurrentLanguage());
			textElement.addSubText(this.indicationString());
			this.addEquivalentsToLabel(textElement);
		};

		this.addEquivalentsToLabel = function (textBox) {
			if (that.equivalents()) {
				var equivalentLabels,
					equivalentString;

				equivalentLabels = that.equivalents().map(function (property) {
					return property.labelForCurrentLanguage();
				});
				equivalentString = equivalentLabels.join(", ");

				textBox.addEquivalents(equivalentString);
			}
		};

		this.drawCardinality = function (container) {
			var cardinalityText = this.generateCardinalityText();

			if (cardinalityText) {
				that.cardinalityElement(container);
				container.append("text")
					.classed("cardinality", true)
					.attr("text-anchor", "middle")
					.attr("dy", "0.5ex")
					.text(cardinalityText);
				return true; // drawing successful
			} else {
				return false;
			}
		};

		this.generateCardinalityText = function () {
			if (that.cardinality()) {
				return that.cardinality();
			} else if (that.minCardinality() || that.maxCardinality()) {
				var minBoundary = that.minCardinality() || "*";
				var maxBoundary = that.maxCardinality() || "*";
				return minBoundary + ".." + maxBoundary;
			}
		};

		that.setHighlighting = function (enable) {
			if (that.labelElement()) {
				that.labelElement().select("rect").classed("hovered", enable);
			}
			that.linkGroup().selectAll("path, text").classed("hovered", enable);
			that.markerElement().select("path").classed("hovered", enable);
			if (that.cardinalityElement()) {
				that.cardinalityElement().classed("hovered", enable);
			}

			var subAndSuperProperties = getSubAndSuperProperties();
			subAndSuperProperties.forEach(function (property) {
				property.labelElement().select("rect")
					.classed("indirect-highlighting", enable);
			});
		};

		/**
		 * Combines the sub- and superproperties into a single array, because
		 * they're often used equivalently.
		 * @returns {Array}
		 */
		function getSubAndSuperProperties() {
			var properties = [];

			if (that.subproperties()) {
				properties = properties.concat(that.subproperties());
			}
			if (that.superproperties()) {
				properties = properties.concat(that.superproperties());
			}

			return properties;
		}

		/**
		 * Foregrounds the property, its inverse and the link.
		 */
		this.foreground = function () {
			var selectedLabelGroup = that.labelElement().node().parentNode,
				labelContainer = selectedLabelGroup.parentNode,
				selectedLinkGroup = that.linkGroup().node(),
				linkContainer = that.linkGroup().node().parentNode;

			// Append hovered element as last child to the container list.
			labelContainer.appendChild(selectedLabelGroup);
			linkContainer.appendChild(selectedLinkGroup);
		};

		/**
		 * Foregrounds the sub- and superproperties of this property.
		 * This is separated from the foreground-function to prevent endless loops.
		 */
		function foregroundSubAndSuperProperties() {
			var subAndSuperProperties = getSubAndSuperProperties();

			subAndSuperProperties.forEach(function (property) {
				property.foreground();
			});
		}

		function onMouseOver() {
			if (that.mouseEntered()) {
				return;
			}
			that.mouseEntered(true);
			that.setHighlighting(true);

			that.foreground();
			foregroundSubAndSuperProperties();
		}

		function onMouseOut() {
			that.mouseEntered(false);
			that.setHighlighting(false);
		}

		this.drawPin = function () {
			that.pinned(true);
			pinGroupElement = drawTools.drawPin(that.labelElement(), 20, -25, this.removePin);
		};

		/**
		 * Removes the pin and refreshs the graph to update the force layout.
		 */
		this.removePin = function () {
			that.pinned(false);
			if (pinGroupElement) {
				pinGroupElement.remove();
			}
			graph.updateStyle();
		};


		forceLayoutNodeFunctions.addTo(this);
	};

	Base.prototype = Object.create(BaseElement.prototype);
	Base.prototype.constructor = Base;

	Base.prototype.height = function () {
		return labelHeight;
	};

	Base.prototype.width = function () {
		return labelWidth;
	};

	Base.prototype.actualRadius = function () {
		return smallestRadius;
	};

	Base.prototype.textWidth = Base.prototype.width;


	return Base;
}());
