/**
 * Contains the logic for connecting the modes with the website.
 *
 * @param pickAndPin mode for picking and pinning of nodes
 * @returns {{}}
 */
webvowlApp.modeMenu = function (pickAndPin) {

	var modeMenu = {},
		checkboxes = [];


	/**
	 * Connects the website with the available graph modes.
	 */
	modeMenu.setup = function () {
		addModeItem(pickAndPin, "pickandpin", "Pick & Pin", "#pickAndPinOption");
	};

	function addModeItem(mode, identifier, modeName, selector) {
		var moduleOptionContainer,
			moduleCheckbox;

		moduleOptionContainer = d3.select(selector)
			.append("div")
			.classed("checkboxContainer", true);

		moduleCheckbox = moduleOptionContainer.append("input")
			.classed("moduleCheckbox", true)
			.attr("id", identifier + "ModuleCheckbox")
			.attr("type", "checkbox");

		// Store for easier resetting all modes
		checkboxes.push(moduleCheckbox);

		moduleCheckbox.on("click", function () {
			var isEnabled = moduleCheckbox.property("checked");
			mode.enabled(isEnabled);
		});

		moduleOptionContainer.append("label")
			.attr("for", identifier + "ModuleCheckbox")
			.text(modeName);
	}

	/**
	 * Resets the modes to their default.
	 */
	modeMenu.reset = function () {
		checkboxes.forEach(function (checkbox) {
			var isChecked = checkbox.property("checked");
			if (isChecked) {
				checkbox.property("checked", false);
				// Call onclick event handlers programmatically
				checkbox.on("click")();
			}
		});
	};


	return modeMenu;
};
