webvowl.modules.focuser = function () {
	var focuser = {},
		focusedElement;

	focuser.handle = function (clickedElement) {
		if (d3.event.defaultPrevented) {
			return;
		}

		if (focusedElement !== undefined) {
			focusedElement.toggleFocus();
		}

		if (focusedElement !== clickedElement) {
			clickedElement.toggleFocus();
			focusedElement = clickedElement;
		} else {
			focusedElement = undefined;
		}
	};

	return focuser;
};