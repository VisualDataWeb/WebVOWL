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

			drawTools.appendCircularClass(parentElement, that.radius(), ["white", "embedded"]);
			drawTools.appendCircularClass(parentElement, that.radius() - 4, cssClasses);

			// Add the text to the node
			textBlock = webvowl.util.textElement(parentElement);
			textBlock.addTextline(that.label());
			textBlock.addSubTextNode(that.indicationString());
			appendEquivalentClasses(textBlock, that.equivalent());

			that.postDrawActions();
		};

		function appendEquivalentClasses(textBlock, equivalentClasses) {
			if (typeof equivalentClasses === "undefined") {
				return;
			}

			var equivalentNames,
				equivalentNamesString;

			equivalentNames = equivalentClasses.map(function (node) {
				return node.label();
			});
			equivalentNamesString = equivalentNames.join(", ");

			textBlock.addEquivalentSpan(equivalentNamesString);
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