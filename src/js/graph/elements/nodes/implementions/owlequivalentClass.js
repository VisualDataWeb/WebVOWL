webvowl.nodes.owlequivalentclass = (function () {

	var o = function (graph) {
		webvowl.nodes.RoundNode.apply(this, arguments);

		var that = this;

		this.styleClass("equivalentclass")
			.type("owl:equivalentClass");

		this.drawNode = function (parentElement) {
			var drawTools = webvowl.nodes.drawTools(),
				textBlock,
				cssClasses = that.collectCssClasses();

			that.nodeElement(parentElement);

			drawTools.appendCircularClass(parentElement, that.actualRadius(), ["white", "embedded"]);
			drawTools.appendCircularClass(parentElement, that.actualRadius() - 4, cssClasses, that.labelForCurrentLanguage());

			that.postDrawActions();
			appendEquivalentClasses(that.textBlock(), that.equivalents());
		};

		function appendEquivalentClasses(textBlock, equivalentClasses) {
			if (typeof equivalentClasses === "undefined") {
				return;
			}

			var equivalentNames,
				equivalentNamesString;

			equivalentNames = equivalentClasses.map(function (node) {
				return node.labelForCurrentLanguage();
			});
			equivalentNamesString = equivalentNames.join(", ");

			textBlock.addEquivalents(equivalentNamesString);
		}

		/**
		 * Sets the hover highlighting of this node.
		 * @param enable
		 */
		that.setHoverHighlighting = function (enable) {
			that.nodeElement().selectAll("circle:last-of-type").classed("hovered", enable);
		};
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
