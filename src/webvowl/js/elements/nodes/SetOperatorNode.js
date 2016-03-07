var AbsoluteTextElement = require("../../util/AbsoluteTextElement");
var BoxArrowLink = require("../links/BoxArrowLink");
var RoundNode = require("./RoundNode");


module.exports = (function () {

	var o = function (graph) {
		RoundNode.apply(this, arguments);

		var that = this,
			superHoverHighlightingFunction = that.setHoverHighlighting,
			superPostDrawActions = that.postDrawActions;

		this.setHoverHighlighting = function (enable) {
			superHoverHighlightingFunction(enable);

			// Highlight connected links when hovering the set operator
			that.links().forEach(function (link) {
				if (link instanceof BoxArrowLink) {
					link.property().setHighlighting(enable);
				}
			});
		};

		this.draw = function (element) {
			that.nodeElement(element);

			element.append("circle")
				.attr("class", that.collectCssClasses().join(" "))
				.classed("class", true)
				.attr("r", that.actualRadius());
		};

		this.postDrawActions = function () {
			superPostDrawActions();
			that.textBlock().remove();

			var textElement = new AbsoluteTextElement(that.nodeElement(), that.backgroundColor());

			var equivalentsString = that.equivalentsString();
			var offsetForFollowingEquivalents = equivalentsString ? -30 : -17;
			var suffixForFollowingEquivalents = equivalentsString ? "," : "";
			textElement.addText(that.labelForCurrentLanguage(), offsetForFollowingEquivalents, "",
				suffixForFollowingEquivalents);

			textElement.addEquivalents(equivalentsString, -17);

			textElement.addInstanceCount(that.individuals().length, 17);

			that.textBlock(textElement);
		};
	};
	o.prototype = Object.create(RoundNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
