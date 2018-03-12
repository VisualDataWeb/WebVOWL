module.exports = function (graph) {
	var focuser = {},
		focusedElement;

	focuser.handle = function (selectedElement,forced) {
		// Don't display details on a drag event, which will be prevented
		if (d3.event && d3.event.defaultPrevented && forced===undefined) {
			return;
		}
		if (focusedElement !== undefined) {
			focusedElement.toggleFocus();
		}

		if (focusedElement !== selectedElement && selectedElement) {
			selectedElement.toggleFocus();
			focusedElement = selectedElement;
		} else {
			focusedElement = undefined;
		}
		if (focusedElement && focusedElement.focused()){
            graph.options().editSidebar().updateSelectionInformation(focusedElement);
		}
		else{
            graph.options().editSidebar().updateSelectionInformation(undefined);
		}
	};

	/**
	 * Removes the focus if an element is focussed.
	 */
	focuser.reset = function () {
		if (focusedElement) {
			focusedElement.toggleFocus();
			focusedElement = undefined;
		}
	};

	return focuser;
};
