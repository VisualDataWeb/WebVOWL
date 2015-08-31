/**
 * Contains the logic for connecting the modes with the website.
 *
 * @param graph the graph that belongs to these controls
 * @param pickAndPin mode for picking and pinning of nodes
 * @param nodeScaling mode for toggling node scaling
 * @param compactNotation mode for toggling the compact node
 * @returns {{}}
 */
module.exports = function (graph, pickAndPin, nodeScaling, compactNotation) {

	var modeMenu = {},
		checkboxes = [];


	/**
	 * Connects the website with the available graph modes.
	 */
	modeMenu.setup = function () {
		addModeItem(pickAndPin, "pickandpin", "Pick & Pin", "#pickAndPinOption", false);
		addModeItem(nodeScaling, "nodescaling", "Node Scaling", "#nodeScalingOption", true);
		addModeItem(compactNotation, "compactnotation", "Compact Notation", "#compactNotationOption", true);
	};

	function addModeItem(module, identifier, modeName, selector, updateGraphOnClick) {
		var moduleOptionContainer,
			moduleCheckbox;

		moduleOptionContainer = d3.select(selector)
			.append("div")
			.classed("checkboxContainer", true)
			.datum({module: module, defaultState: module.enabled()});

		moduleCheckbox = moduleOptionContainer.append("input")
			.classed("moduleCheckbox", true)
			.attr("id", identifier + "ModuleCheckbox")
			.attr("type", "checkbox")
			.property("checked", module.enabled());

		// Store for easier resetting all modes
		checkboxes.push(moduleCheckbox);

		moduleCheckbox.on("click", function (d) {
			var isEnabled = moduleCheckbox.property("checked");
			d.module.enabled(isEnabled);

			if (updateGraphOnClick) {
				graph.update();
			}
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
			var defaultState = checkbox.datum().defaultState,
				isChecked = checkbox.property("checked");

			if (isChecked !== defaultState) {
				checkbox.property("checked", defaultState);
				// Call onclick event handlers programmatically
				checkbox.on("click")(checkbox.datum());
			}

			// Reset the module that is connected with the checkbox
			checkbox.datum().module.reset();
		});
	};


	return modeMenu;
};
