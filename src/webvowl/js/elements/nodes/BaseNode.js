var BaseElement = require("../BaseElement");
var forceLayoutNodeFunctions = require("../forceLayoutNodeFunctions")();

module.exports = (function () {

	var Base = function (graph) {
		BaseElement.apply(this, arguments);

		var that = this,
		// Basic attributes
			complement,
			disjointUnion,
			disjointWith,
			individuals = [],
			intersection,
			union,
			links,
		// Additional attributes
			maxIndividualCount,
		// Element containers
			nodeElement;


		// Properties
		this.complement = function (p) {
			if (!arguments.length) return complement;
			complement = p;
			return this;
		};

		this.disjointUnion = function (p) {
			if (!arguments.length) return disjointUnion;
			disjointUnion = p;
			return this;
		};

		this.disjointWith = function (p) {
			if (!arguments.length) return disjointWith;
			disjointWith = p;
			return this;
		};

		this.individuals = function (p) {
			if (!arguments.length) return individuals;
			individuals = p || [];
			return this;
		};

		this.intersection = function (p) {
			if (!arguments.length) return intersection;
			intersection = p;
			return this;
		};

		this.links = function (p) {
			if (!arguments.length) return links;
			links = p;
			return this;
		};

		this.maxIndividualCount = function (p) {
			if (!arguments.length) return maxIndividualCount;
			maxIndividualCount = p;
			return this;
		};

		this.nodeElement = function (p) {
			if (!arguments.length) return nodeElement;
			nodeElement = p;
			return this;
		};

		this.union = function (p) {
			if (!arguments.length) return union;
			union = p;
			return this;
		};


		/**
		 * Returns css classes generated from the data of this object.
		 * @returns {Array}
		 */
		that.collectCssClasses = function () {
			var cssClasses = [];

			if (typeof that.styleClass() === "string") {
				cssClasses.push(that.styleClass());
			}

			cssClasses = cssClasses.concat(that.visualAttributes());

			return cssClasses;
		};


		// Reused functions TODO refactor
		this.addMouseListeners = function () {
			// Empty node
			if (!that.nodeElement()) {
				console.warn(this);
				return;
			}

			that.nodeElement().selectAll("*")
				.on("mouseover", onMouseOver)
				.on("mouseout", onMouseOut);
		};

		function onMouseOver() {
			if (that.mouseEntered()) {
				return;
			}

			var selectedNode = that.nodeElement().node(),
				nodeContainer = selectedNode.parentNode;

			// Append hovered element as last child to the container list.
			nodeContainer.appendChild(selectedNode);

			that.setHoverHighlighting(true);

			that.mouseEntered(true);
		}

		function onMouseOut() {
			that.setHoverHighlighting(false);

			that.mouseEntered(false);
		}


		forceLayoutNodeFunctions.addTo(this);
	};

	Base.prototype = Object.create(BaseElement.prototype);
	Base.prototype.constructor = Base;


	return Base;
}());
