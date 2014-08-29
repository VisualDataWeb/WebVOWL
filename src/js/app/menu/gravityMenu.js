/**
 * Contains the logic for setting up the gravity sliders.
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
webvowlApp.gravityMenu = function (graph) {

	var gravityMenu = {},
		sliders = [],
		options = graph.graphOptions(),
		classSlider,
		datatypeSlider,
		classSliderLabel,
		datatypeSliderLabel;


	/**
	 * Adds the gravity sliders to the website.
	 */
	gravityMenu.setup = function () {
		addDistanceSlider("#classSliderOption", "class", "Class Distance", options.classDistance);
		addDistanceSlider("#datatypeSliderOption", "datatype", "Datatype Distance", options.datatypeDistance);
	};

	function addDistanceSlider(selector, identifier, label, distanceFunction) {
		var sliderContainer,
			sliderValueLabel;

		sliderContainer = d3.select(selector)
			.append("div")
			.datum({distanceFunction: distanceFunction}) // connect the options-function with the slider
			.classed("distanceSliderContainer", true);

		sliderValueLabel = sliderContainer.append("label")
			.classed("distanceSliderValue", true)
			.attr("for", identifier + "DistanceSlider")
			.text(distanceFunction());

		sliderContainer.append("label")
			.classed("distanceSliderLabel", true)
			.attr("for", identifier + "DistanceSlider")
			.text(label);

		var slider = sliderContainer.append("input")
			.attr("id", identifier + "DistanceSlider")
			.attr("type", "range")
			.attr("min", 10)
			.attr("max", 600)
			.attr("value", distanceFunction())
			.attr("step", 10);

		// Store slider for easier resetting
		sliders.push(slider);

		slider.on("input", function () {
			var distance = slider.property("value");
			distanceFunction(distance);
			sliderValueLabel.text(distance);
			graph.updateStyle();
		});
	}

	/**
	 * Resets the gravity sliders to their default.
	 */
	gravityMenu.reset = function () {
		sliders.forEach(function (slider) {
			slider.property("value", function (d) {
				// Simply reload the distance from the options
				return d.distanceFunction();
			});
			slider.on("input")();
		});
	};


	return gravityMenu;
};
