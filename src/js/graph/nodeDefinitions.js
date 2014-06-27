'use strict';

var webvowl = webvowl || {};
webvowl.nodes = webvowl.nodes || {};
var LITERAL_HEIGHT = 20,
	LITERAL_WIDTH = 60,
	CLASS_RADIUS = 50,
	THING_RADIUS = 30,
	SPECIAL_OPERATIONS_RADIUS = 40;

webvowl.nodes.base = {
	typus: "node",
	focused: false,
	mouseEntered: false,
	label: "Nodename",
	disjointWith: undefined,
	nodeTag: undefined,
	drawnAs: undefined,
	textAttribute: undefined,
	isNormalVisibility: function () {
		return true;
	},
	/**
	 * Selects the first <circle> element and set the css attribute "focused".
	 * If other element should be highlighted override function!
	 */
	toggleFocus: function () {
		if (this.focused) {
			this.nodeTag.select("circle").classed("focused", false);
			this.focused = false;
		} else {
			this.nodeTag.select("circle").classed("focused", true);
			this.focused = true;
		}
	},
	getTextWidth: function () {
		return this.radius * 2;
	},
	/**
	 * Method to draw the node. Standard classes for the <circle> element are:
	 * class and it's own attribute (drawnAs).
	 * @param element The element to apply to.
	 * @param classesForNode Optional, all classes which needed to be applied to the BASE <circle>.
	 * @param additionalFunction Optional, additional function for special features.
	 */
	drawNode: function (element, classesForNode, additionalFunction) {
		var data = element.datum();
		data.nodeTag = element;

		// Default circle element. The base for nearly all nodes.
		element.append("circle")
			.classed("class", true)
			.classed(data.drawnAs !== undefined ? data.drawnAs : "null", true)
			.attr("r", data.radius);

		// Add all additional classes to the <circle> element which are needed by the specific class.
		if (classesForNode !== undefined) {
			classesForNode.forEach(function (curElement) {
				if (typeof curElement === "string") {
					element.select("circle").classed(curElement, true);
				} else {
					console.log(curElement + " is not a valid String to set class! - Element: " + element);
				}
			});
		}

		// If some additional style or element is need. For example equivalent class needs a second circle.
		if (additionalFunction) {
			additionalFunction.call();
		}

		// Adding the text to the node
		var textBlock = new TextElement(element);
		textBlock.addTextline(data.label, data.textAttribute);
		textBlock.addSubTextNode(data.indication, data.textAttribute);

		if (data.equivalent) {
			var equivNames = data.equivalent.map(function (node) {
					return node.label;
				}),
				equivNamesString = equivNames.join(", ");

			textBlock.addEquivalentSpan(equivNamesString, data.textAttribute);
		}

		textBlock.repositionTextBlock();
		data.addMouseEnterLeave();
	},
	drawDatatype: function (element, classesForNode, additionalFunction) {
		var data = element.datum();
		data.nodeTag = element;

		element.append("rect")
			.classed(data.drawnAs !== undefined ? data.drawnAs : "null", true)
			.classed("class", true)
			.classed("special", true)
			.attr("x", -LITERAL_WIDTH / 2)
			.attr("y", -LITERAL_HEIGHT / 2)
			.attr("width", LITERAL_WIDTH)
			.attr("height", LITERAL_HEIGHT);

		// Add all additional classes to the <circle> element which are needed by the specific class.
		if (classesForNode !== undefined) {
			classesForNode.forEach(function (curElement) {
				if (typeof curElement === "string") {
					element.select("rect").classed(curElement, true);
				} else {
					console.log(curElement + " is not a valid String to set class! - Element: " + element);
				}
			});
		}

		// If some additional style or element is need. For example equivalent class needs a second circle.
		if (additionalFunction) {
			additionalFunction.call();
		}

		var textBlock = new TextElement(element);
		textBlock.addTextline(data.label);

		data.addMouseEnterLeave();
	},
	mouseEnter: function () {
		var that = d3.select(this).datum();

		if (that.mouseEntered) {
			return;
		}

		var selectedNode = that.nodeTag.node(),
			nodeContainer = selectedNode.parentNode;

		// Append hovered element as last child to the container list.
		nodeContainer.appendChild(selectedNode);
		that.mouseEntered = true;
	},
	mouseLeave: function () {
		var that = d3.select(this).datum();

		that.mouseEntered = false;
		// Future use
	},
	addMouseEnterLeave: function () {

		// Empty node
		if (!this.nodeTag) {
			console.warn(this);
			return;
		}

		var firstElement = this.nodeTag.node().firstChild;

		d3.select(firstElement)
			.on("mouseenter", this.mouseEnter)
			.on("mouseleave", this.mouseLeave);
	}
};

webvowl.nodes.owlClass = {
	label: "Class",
	maxTextWidth: 2 * CLASS_RADIUS,
	radius: CLASS_RADIUS,
	drawnAs: "class"
};

webvowl.nodes.rdfsClass = {
	label: "Class",
	maxTextWidth: 2 * CLASS_RADIUS,
	radius: CLASS_RADIUS,
	drawnAs: "rdf"
};

webvowl.nodes.ExternalClass = {
	label: "Class",
	indication: "external",
	maxTextWidth: 2 * CLASS_RADIUS,
	radius: CLASS_RADIUS,
	drawnAs: "external",
	textAttribute: "white"
};

webvowl.nodes.owlDeprecatedClass = {
	label: "Class",
	indication: "deprecated",
	maxTextWidth: 2 * CLASS_RADIUS,
	radius: CLASS_RADIUS,
	drawnAs: "deprecated"
};

webvowl.nodes.owlThing = {
	label: "Thing",
	maxTextWidth: 2 * THING_RADIUS,
	radius: THING_RADIUS,
	drawnAs: "thing",
	drawNode: function (element) {
		webvowl.nodes.base.drawNode(element, ["white", "special"]);
	}
};

webvowl.nodes.rdfsResource = {
	label: "Resource",
	maxTextWidth: 2 * THING_RADIUS,
	radius: THING_RADIUS,
	drawnAs: "rdfsresource",
	drawNode: function (element) {
		webvowl.nodes.base.drawNode(element, ["rdf", "special"]);
	}
};

webvowl.nodes.owlequivalentClass = {
	label: "Equivalent",
	maxTextWidth: 2 * CLASS_RADIUS,
	radius: CLASS_RADIUS,
	drawnAs: "equivalentclass",
	drawNode: function (element) {
		webvowl.nodes.base.drawNode(element, ["white", "embedded"], appendEquivCircle);

		function appendEquivCircle() {
			element.append("circle")
				.attr("class", "class")
				.attr("r", function (data) {
					return data.radius - 4;
				});
		}
	}
};

webvowl.nodes.rdfsDatatype = {
	label: "Datatype",
	maxTextWidth: LITERAL_WIDTH,
	radius: THING_RADIUS,
	height: LITERAL_HEIGHT,
	width: LITERAL_WIDTH,
	drawnAs: "datatype",
	isNormalVisibility: function () {
		return false;
	},
	toggleFocus: function () {
		if (this.focused) {
			this.nodeTag.select("rect").classed("focused", false);
			this.focused = false;
		} else {
			this.nodeTag.select("rect").classed("focused", true);
			this.focused = true;
		}
	},
	getTextWidth: function () {
		return this.width;
	},
	drawNode: function (element) {
		webvowl.nodes.base.drawDatatype(element);
	}
};

webvowl.nodes.rdfsLiteral = {
	label: "Literal",
	maxTextWidth: LITERAL_WIDTH,
	radius: THING_RADIUS,
	height: LITERAL_HEIGHT,
	width: LITERAL_WIDTH,
	drawnAs: "literal",
	isNormalVisibility: function () {
		return false;
	},
	toggleFocus: function () {
		webvowl.nodes.rdfsDatatype.toggleFocus.call(this);
	},
	getTextWidth: function () {
		return this.width;
	},
	drawNode: function (element) {
		webvowl.nodes.base.drawDatatype(element);
	}
};

webvowl.nodes.owlunionOf = {
	label: "Union Of",
	radius: SPECIAL_OPERATIONS_RADIUS,
	drawnAs: "unionof",
	drawNode: function (element) {
		this.nodeTag = element;

		element.append("circle")
			.attr("class", this.type)
			.classed("class", true)
			.classed("special", true)
			.attr("r", function (data) {
				return data.radius;
			});

		var symbol = element.append("g").classed("embedded", true);

		symbol.append("circle")
			.attr("class", "symbol")
			.attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
		symbol.append("circle")
			.attr("cx", 10)
			.attr("class", "symbol")
			.classed("fineline", true)
			.attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
		symbol.append("circle")
			.attr("class", "nofill")
			.classed("fineline", true)
			.attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
		symbol.append("path")
			.attr("class", "link")
			.attr("d", "m 1,-3 c 0,2 0,4 0,6 0,0 0,0 0,0 0,2 2,3 4,3 2,0 4,-1 4,-3 0,-2 0,-4 0,-6");
		symbol.attr("transform", "translate(-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 5 + ",-" +
			(SPECIAL_OPERATIONS_RADIUS - 15) / 100 + ")");

		this.addMouseEnterLeave();
	}
};

webvowl.nodes.owlintersectionOf = {
	label: "Intersection Of",
	radius: SPECIAL_OPERATIONS_RADIUS,
	drawnAs: "intersectionof",
	drawNode: function (element) {
		this.nodeTag = element;

		element.append("circle")
			.attr("class", this.type)
			.classed("class", true)
			.classed("special", true)
			.attr("r", function (data) {
				return data.radius;
			});

		var symbol = element.append("g").classed("embedded", true);

		symbol.append("path")
			.attr("class", "nostroke")
			.classed("symbol", true).attr("d", "m 24.777,0.771 c0,16.387-13.607,23.435-19.191,23.832S-15.467," +
				"14.526-15.467,0.424S-1.216-24.4,5.437-24.4 C12.09-24.4,24.777-15.616,24.777,0.771z");
		symbol.append("circle")
			.attr("class", "nofill")
			.classed("fineline", true)
			.attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
		symbol.append("circle")
			.attr("cx", 10)
			.attr("class", "nofill")
			.classed("fineline", true)
			.attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
		symbol.append("path")
			.attr("class", "nofill")
			.attr("d", "m 9,5 c 0,-2 0,-4 0,-6 0,0 0,0 0,0 0,0 0,-1.8 -1,-2.3 -0.7,-0.6 -1.7,-0.8 -2.9," +
				"-0.8 -1.2,0 -2,0 -3,0.8 -0.7,0.5 -1,1.4 -1,2.3 0,2 0,4 0,6");
		symbol.attr("transform", "translate(-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 5 + ",-" +
			(SPECIAL_OPERATIONS_RADIUS - 15) / 100 + ")");

		this.addMouseEnterLeave();
	}
};

webvowl.nodes.owlcomplementOf = {
	label: "Complement Of",
	radius: SPECIAL_OPERATIONS_RADIUS,
	drawnAs: "complementof",
	drawNode: function (element) {
		this.nodeTag = element;

		element.append("circle")
			.attr("class", this.type)
			.classed("class", true)
			.classed("special", true)
			.attr("r", function (data) {
				return data.radius;
			});

		var symbol = element.append("g").classed("embedded", true);

		symbol.append("circle")
			.attr("class", "symbol")
			.classed("fineline", true)
			.attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
		symbol.append("path")
			.attr("class", "nofill")
			.attr("d", "m -7,-1.5 12,0 0,6");
		symbol.attr("transform", "translate(-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 100 + ",-" +
			(SPECIAL_OPERATIONS_RADIUS - 15) / 100 + ")");

		this.addMouseEnterLeave();
	}
};
