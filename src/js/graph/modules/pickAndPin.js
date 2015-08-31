var elementTools = require("../util/elementTools.js");

module.exports = function () {
	var pap = {},
		enabled = false,
		pinnedNodes = [];

	pap.handle = function (selectedElement) {
		if (!enabled) {
			return;
		}

		if (!elementTools.isDatatype(selectedElement) && !selectedElement.pinned()) {
			selectedElement.drawPin();
			pinnedNodes.push(selectedElement);
		}
	};

	pap.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return pap;
	};

	pap.reset = function () {
		var i = 0, l = pinnedNodes.length;
		for (; i < l; i++) {
			pinnedNodes[i].removePin();
		}
		// Clear the array of stored nodes
		pinnedNodes.length = 0;
	};

	return pap;
};
