var elementTools = require("../util/elementTools")();

module.exports = function () {
	var pap = {},
		enabled = false,
		pinnedElements = [];

	pap.handle = function (selection) {
		if (!enabled) {
			return;
		}

		if (elementTools.isProperty(selection) && selection.inverse() && selection.inverse().pinned()) {
			return;
		}

		if (!selection.pinned()) {
			selection.drawPin();
			pinnedElements.push(selection);
		}
	};

	pap.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return pap;
	};

	pap.reset = function () {
		pinnedElements.forEach(function(element) {
			element.removePin();
		});
		// Clear the array of stored nodes
		pinnedElements.length = 0;
	};

	return pap;
};
