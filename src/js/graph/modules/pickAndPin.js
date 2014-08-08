webvowl.modules.pickAndPin = function () {
	var pap = {},
		enabled = false;

	pap.handle = function (clickedElement) {
		if (!enabled) {
			return;
		}

		if (clickedElement instanceof webvowl.nodes.RoundNode && !clickedElement.pinned()) {
			clickedElement.pinned(true);
			clickedElement.drawPin();
		}
	};

	pap.enabled = function (p) {
		if (!arguments.length) return enabled;
		enabled = p;
		return pap;
	};

	return pap;
};
