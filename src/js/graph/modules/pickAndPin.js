webvowl.modules.pickAndPin = function () {
	var pap = {},
		enabled = false,
		pinnedNodes = [];

	pap.handle = function (clickedElement) {
		if (!enabled) {
			return;
		}

		if (clickedElement instanceof webvowl.nodes.RoundNode && !clickedElement.pinned()) {
			clickedElement.pinned(true);
			clickedElement.drawPin();
			pinnedNodes.push(clickedElement);
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
