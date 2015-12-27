module.exports = AbstractTextElement;

function AbstractTextElement(container) {
	var textBlock = container.append("text")
		.classed("text", true)
		.attr("text-anchor", "middle");

	this._textBlock = function () {
		return textBlock;
	};
}

AbstractTextElement.prototype.LINE_DISTANCE = 1;
AbstractTextElement.prototype.CSS_CLASSES = {
	default: "text",
	subtext: "subtext",
	instanceCount: "instance-count"
};

AbstractTextElement.prototype.translation = function (x, y) {
	this._textBlock().attr("transform", "translate(" + x + ", " + y + ")");
	return this;
};

AbstractTextElement.prototype.remove = function () {
	this._textBlock().remove();
	return this;
};

AbstractTextElement.prototype._applyPreAndPostFix = function (text, prefix, postfix) {
	if (prefix) {
		text = prefix + text;
	}
	if (postfix) {
		text += postfix;
	}
	return text;
};
