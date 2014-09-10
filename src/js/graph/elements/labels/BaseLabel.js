webvowl.labels.BaseLabel = (function () {

	// Static variables
	var attributesToWrite = ["functional", "inverseFunctional", "transitive", "symmetric"],
		labelHeight = 28,
		labelWidth = 80;


	// Constructor, private variables and privileged methods
	var base = function () {
		webvowl.elements.BaseElement.call(this);

		var that = this,
		// Basic attributes
			cardinality,
			domain,
			inverse,
			link,
			minCardinality,
			maxCardinality,
			range,
			subproperty,
		// Style attributes
			linkType = "normal",
			markerType = "normal",
			labelVisible = true,
		// Element containers
			cardinalityElement,
			labelElement,
			linkElement,
			markerElement;


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

		this.linkElement = function (p) {
			if (!arguments.length) return linkElement;
			linkElement = p;
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

		this.subproperty = function (p) {
			if (!arguments.length) return subproperty;
			subproperty = p;
			return this;
		};


		// Functions
		this.isSpecialLink = function () {
			return linkType === "special";
		};

		this.markerId = function () {
			return "marker" + that.id();
		};

		this.propertyClass = function () {
			return "property" + that.id();
		};

		this.toggleFocus = function () {
			that.focused(!that.focused());
			labelElement.select("rect").classed("focused", that.focused());
		};


		// Reused functions TODO refactor
		this.drawProperty = function (labelGroup) {
			function attachLabel(property) {
				labelGroup.classed(property.id(), true);

				// Draw the label and its background
				var label = labelGroup.append("g")
					.datum(property)
					.classed("label", true)
					.attr("id", property.propertyClass());
				property.addRect(label);

				// Attach the text and perhaps special elements
				var textBox = webvowl.util.textElement(label);
				if (property instanceof webvowl.labels.owldisjointwith) {
					property.addDisjointLabel(labelGroup, textBox);
					return label;
				} else {
					textBox.addTextline(property.label());
				}

				property.addAttributesToLabel(textBox);
				property.addEquivalentsToLabel(textBox);

				return label;
			}

			// Draw no label by default
			if (!this.labelVisible()) {
				return undefined;
			}

			this.labelElement(attachLabel(this));

			// Draw an inverse label and reposition both labels if necessary
			if (this.inverse()) {
				var yTransformation = (this.labelHeight() / 2) + 1 /* additional space */;
				this.inverse()
					.labelElement(attachLabel(this.inverse()));

				this.labelElement()
					.attr("transform", "translate(" + 0 + ",-" + yTransformation + ")");
				this.inverse()
					.labelElement()
					.attr("transform", "translate(" + 0 + "," + yTransformation + ")");
			}

			return this.labelElement();
		};

		this.addRect = function (groupTag) {
			groupTag.append("rect")
				.classed(this.styleClass(), true)
				.classed("property", true)
				.attr("x", -this.labelWidth() / 2)
				.attr("y", -this.labelHeight() / 2)
				.attr("width", this.labelWidth())
				.attr("height", this.labelHeight())
				.on("mouseover", function () {
					onMouseOver();
					highlightSubproperties(true);
				})
				.on("mouseout", function () {
					onMouseOut();
					highlightSubproperties(false);
				});
		};
		this.addDisjointLabel = function (groupTag, textTag) {
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

			textTag.addSubTextNode("disjoint", null);
			textTag.setTranslation(0, 20);
		};
		this.addAttributesToLabel = function (textBox) {
			var subAttributes = "";

			if (this.attribute()) {
				this.attribute().forEach(function (currentAttribute) {
					if (attributesToWrite.contains(currentAttribute)) {
						subAttributes = subAttributes.concat(currentAttribute);
					}
				});
			}

			if (subAttributes) {
				textBox.addSubTextNode(subAttributes);
			}
		};
		this.addEquivalentsToLabel = function (textBox) {
			if (this.equivalent()) {
				var equivalentLabels,
					equivalentString;

				equivalentLabels = this.equivalent().map(function (property) {
					return property.label();
				});
				equivalentString = equivalentLabels.join(", ");

				textBox.addEquivalentSpan(equivalentString, null);
			}
		};
		this.drawCardinality = function (cardinalityGroup) {
			if (this.minCardinality() === undefined &&
				this.maxCardinality() === undefined &&
				this.cardinality() === undefined) {
				return undefined;
			}

			// Drawing cardinality groups
			this.cardinalityElement(cardinalityGroup.classed("cardinality", true)
				.classed(this.propertyClass(), true));

			var cardText = cardinalityGroup.append("text")
				.classed("cardinality", true)
				.attr("text-anchor", "middle");

			if (this.minCardinality() !== undefined) {
				var cardString = this.minCardinality();
				cardString = cardString.concat(" .. ");
				cardString = cardString.concat(this.maxCardinality() !== undefined ? this.maxCardinality() : "*");

				cardText.text(cardString);
			} else if (this.cardinality() !== undefined) {
				cardText.text(this.cardinality());
			}

			return this.cardinalityElement();
		};
		this.hasAttribute = function (attributeToSearch) {
			if (!this.attribute() || !attributeToSearch) {
				return false;
			}

			return this.attribute().contains(attributeToSearch);
		};
		function onMouseOver() {
			if (that.mouseEntered()) {
				return;
			}

			var selectedLabelGroup = that.labelElement().node().parentNode,
				labelContainer = selectedLabelGroup.parentNode;

			that.labelElement().select("rect").classed("hovered", true);
			that.linkElement().selectAll("path, text").classed("hovered", true);
			that.markerElement().select("path").classed("hovered", true);

			// Append hovered element as last child to the container list.
			labelContainer.appendChild(selectedLabelGroup);

			that.mouseEntered(true);
		}

		function onMouseOut() {
			that.labelElement().select("rect").classed("hovered", false);
			that.linkElement().selectAll("path, text").classed("hovered", false);
			that.markerElement().select("path").classed("hovered", false);

			that.mouseEntered(false);
		}

		var highlightSubproperties = function (classed) {
			if (that.subproperty() === undefined) {
				return;
			}

			that.subproperty().forEach(function (property) {
				property.labelElement().select("rect")
					.classed("indirectHighlighting", classed);
			});
		};
	};

	base.prototype = Object.create(webvowl.elements.BaseElement.prototype);
	base.prototype.constructor = base;

	base.prototype.labelHeight = function () {
		return labelHeight;
	};

	base.prototype.labelWidth = function () {
		return labelWidth;
	};

	base.prototype.textWidth = base.prototype.labelWidth;


	return base;
}());