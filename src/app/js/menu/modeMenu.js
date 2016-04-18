/**
 * Contains the logic for connecting the modes with the website.
 *
 * @param graph the graph that belongs to these controls
 * @returns {{}}
 */
module.exports = function (graph) {

	var SAME_COLOR_MODE = {text: "Same color", type: "same"};
	var GRADIENT_COLOR_MODE = {text: "Color gradient", type: "gradient"};

	var modeMenu = {},
		checkboxes = [],
		colorModeSwitch;


	/**
	 * Connects the website with the available graph modes.
	 */
	modeMenu.setup = function (pickAndPin, nodeScaling, compactNotation, colorExternals) {
		addModeItem(pickAndPin, "pickandpin", "Pick & pin", "#pickAndPinOption", false);
		addModeItem(nodeScaling, "nodescaling", "Node scaling", "#nodeScalingOption", true);
		addModeItem(compactNotation, "compactnotation", "Compact notation", "#compactNotationOption", true);

		var container = addModeItem(colorExternals, "colorexternals", "Color externals", "#colorExternalsOption", true);
		colorModeSwitch = addExternalModeSelection(container, colorExternals);
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

		return moduleOptionContainer;
	}

	function addExternalModeSelection(container, colorExternalsMode) {
		var button = container.append("button").datum({active: false}).classed("color-mode-switch", true);
		applyColorModeSwitchState(button, colorExternalsMode);

		button.on("click", function () {
			var data = button.datum();
			data.active = !data.active;
			applyColorModeSwitchState(button, colorExternalsMode);

			if (colorExternalsMode.enabled()) {
				graph.update();
			}
		});

		return button;
	}

	function applyColorModeSwitchState(element, colorExternalsMode) {
		var isActive = element.datum().active;
		var activeColorMode = getColorModeByState(isActive);

		element.classed("active", isActive)
			.text(activeColorMode.text);

		if (colorExternalsMode) {
			colorExternalsMode.colorModeType(activeColorMode.type);
		}
	}

	function getColorModeByState(isActive) {
		return isActive ? GRADIENT_COLOR_MODE : SAME_COLOR_MODE;
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

		// set the switch to active and simulate disabling
		colorModeSwitch.datum().active = true;
		colorModeSwitch.on("click")();
	};


	return modeMenu;
};
