webvowl.modules.focuser = function () {
	var focuser = {},
		focusedElement;

	focuser.handle = function (selectedElement) {
		// Don't display details on a drag event, which will be prevented
		if (d3.event.defaultPrevented) {
			return;
		}

		if (focusedElement !== undefined) {
			focusedElement.toggleFocus();
		}

		if (focusedElement !== selectedElement) {
			selectedElement.toggleFocus();
			focusedElement = selectedElement;
		} else {
			focusedElement = undefined;
		}
	};

	return focuser;
};