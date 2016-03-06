var elementTools = require("../util/elementTools")();

module.exports = function () {
	var pap = {},
		enabled = false,
		pinnedNodes = [];

	pap.handle = function (selection) {
		if (!enabled) {
			return;
		}

		if (elementTools.isProperty(selection) && selection.inverse() && selection.inverse().pinned()) {
			return;
		}

		if (!selection.pinned()) {
			selection.drawPin();
			pinnedNodes.push(selection);
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
