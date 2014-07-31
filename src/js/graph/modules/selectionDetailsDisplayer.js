webvowl.modules.selectionDetailsDisplayer = function (handlerFunction) {
	var viewer = {},
		lastSelectedElement;

	viewer.handle = function (selectedElement) {
		var isSelected = true;

		// Deselection of the focused element
		if (lastSelectedElement === selectedElement) {
			isSelected = false;
		}

		if (handlerFunction instanceof Function) {
			handlerFunction.call(selectedElement, isSelected);
		}

		if (isSelected) {
			lastSelectedElement = selectedElement;
		} else {
			lastSelectedElement = null;
		}
	};

	return viewer;
};