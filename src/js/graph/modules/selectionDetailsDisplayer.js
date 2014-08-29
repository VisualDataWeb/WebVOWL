webvowl.modules.selectionDetailsDisplayer = function (handlerFunction) {
	var viewer = {},
		lastSelectedElement;

	viewer.handle = function (selectedElement) {
		// Don't display details on a drag event, which will be prevented
		if (d3.event.defaultPrevented) {
			return;
		}

		var isSelection = true;

		// Deselection of the focused element
		if (lastSelectedElement === selectedElement) {
			isSelection = false;
		}

		if (handlerFunction instanceof Function) {
			if (isSelection) {
				handlerFunction(selectedElement);
			} else {
				handlerFunction(null);
			}
		}

		if (isSelection) {
			lastSelectedElement = selectedElement;
		} else {
			lastSelectedElement = null;
		}
	};

	return viewer;
};