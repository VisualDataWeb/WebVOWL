var _ = require("lodash/array");
var elementTools = require("../util/elementTools")();

module.exports = function () {
	var pap = {},
		enabled = false,
		pinnedElements = [];

	pap.handle = function (selection) {
		if (!enabled) {
			return;
		}

		if (wasNotDragged()) {
			return;
		}

		if (elementTools.isProperty(selection)) {
			if (selection.inverse() && selection.inverse().pinned()) {
				return;
			} else if (hasNoParallelProperties(selection)) {
				return;
			}
		}

		if (!selection.pinned()) {
			selection.drawPin();
			pinnedElements.push(selection);
		}
	};

	function wasNotDragged() {
		return !d3.event.defaultPrevented;
	}

	function hasNoParallelProperties(property) {
		return _.intersection(property.domain().links(), property.range().links()).length === 1;
	}

	pap.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return pap;
	};

	pap.reset = function () {
		pinnedElements.forEach(function (element) {
			element.removePin();
		});
		// Clear the array of stored nodes
		pinnedElements.length = 0;
	};

	return pap;
};
