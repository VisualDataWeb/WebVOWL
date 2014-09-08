webvowl.nodes.owlequivalentclass = (function () {

	var o = function () {
		webvowl.nodes.RoundNode.call(this);

		var that = this;

		this.styleClass("equivalentclass")
			.type("owl:equivalentClass");

		this.drawNode = function (parentElement) {
			var drawTools = webvowl.nodes.drawTools(),
				textBlock;

			that.nodeElement(parentElement);

			drawTools.appendCircularClass(parentElement, that.radius(), that.styleClass(), ["white", "embedded"]);
			drawTools.appendCircularClass(parentElement, that.radius() - 4, that.styleClass(), null);

			// Add the text to the node
			textBlock = webvowl.util.textElement(parentElement);
			textBlock.addTextline(that.label(), that.textAttribute());
			textBlock.addSubTextNode(that.indication(), that.textAttribute());
			appendEquivalentClasses(textBlock, that.equivalent());

			textBlock.repositionTextBlock();
			that.addMouseListeners();
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

			textBlock.addEquivalentSpan(equivalentNamesString, that.textAttribute());
		}
	};
	o.prototype = Object.create(webvowl.nodes.RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());