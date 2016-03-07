var _ = require("lodash/core");

/**
 * Contains the logic for connecting the modes with the website.
 *
 * @param graph the graph that belongs to these controls
 * @returns {{}}
 */
module.exports = function (graph) {

	var COLOR_MODES = [{text: "Color gradient", type: "gradient"}, {text: "Same color", type: "same", default: true}];

	var modeMenu = {},
		checkboxes = [],
		colorModeDropdown;


	/**
	 * Connects the website with the available graph modes.
	 */
	modeMenu.setup = function (pickAndPin, nodeScaling, compactNotation, colorExternals) {
		addModeItem(pickAndPin, "pickandpin", "Pick & pin", "#pickAndPinOption", false);
		addModeItem(nodeScaling, "nodescaling", "Node scaling", "#nodeScalingOption", true);
		addModeItem(compactNotation, "compactnotation", "Compact notation", "#compactNotationOption", true);

		var container = addModeItem(colorExternals, "colorexternals", "Color externals", "#colorExternalsOption", true);
		colorModeDropdown = addExternalModeSelection(container, colorExternals);
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
		var dropdown = container.append("select");
		dropdown.selectAll("option").data(COLOR_MODES).enter()
			.append("option")
			.attr("selected", function (d) {return d.default ? "selected" : null;})
			.property("value", function (d) {return d.type;})
			.text(function (d) {return d.text;});

		dropdown.on("change", function () {
			var selectedMode = _.find(COLOR_MODES, {type: dropdown.property("value")});
			colorExternalsMode.colorModeType(selectedMode.type);

			if (colorExternalsMode.enabled()) {
				graph.update();
			}
		});

		return dropdown;
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

		colorModeDropdown.property("value", _.find(COLOR_MODES, {default: true}).type);
	};


	return modeMenu;
};
