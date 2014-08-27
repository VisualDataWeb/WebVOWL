/**
 * Contains the logic for setting up the gravity sliders.
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
webvowlApp.gravityMenu = function (graph) {

	var gravityMenu = {},
		options = graph.getGraphOptions(),
		classSlider,
		datatypeSlider,
		classSliderLabel,
		datatypeSliderLabel;


	/**
	 * Adds the gravity sliders to the website.
	 */
	gravityMenu.setup = function () {
		addClassDistanceSlider();
		addDatatypeDistanceSlider();
	};

	function addClassDistanceSlider() {
		var classSliderDiv = d3.select("#classSliderOption")
			.append("div")
			.attr("id", "classDistanceSlider");

		classSliderLabel = classSliderDiv.append("label")
			.attr("id", "rangeClassValue")
			.attr("for", "rangeClassSlider")
			.text(options.classDistance());

		classSliderDiv.append("label")
			.attr("for", "rangeClassSlider")
			.text("Class Distance");

		classSlider = classSliderDiv.append("input")
			.attr("id", "rangeClassSlider")
			.attr("type", "range")
			.attr("min", 10)
			.attr("max", 600)
			.attr("value", options.classDistance())
			.attr("step", 10);

		classSlider.on("input", function () {
			classSliderChanged();
			options.classDistance(classSlider.property("value"));
			graph.updateStyle();
		});
	}

	function addDatatypeDistanceSlider() {
		var datatypeSliderDiv = d3.select("#datatypeSliderOption")
			.append("div")
			.attr("id", "datatypeDistanceSlider");

		datatypeSliderLabel = datatypeSliderDiv.append("label")
			.attr("id", "rangeDatatypeValue")
			.attr("for", "rangeDatatypeSlider")
			.text(options.datatypeDistance());

		datatypeSliderDiv.append("label")
			.attr("for", "rangeDatatypeSlider")
			.text("Datatype Distance");

		datatypeSlider = datatypeSliderDiv.append("input")
			.attr("id", "rangeDatatypeSlider")
			.attr("type", "range")
			.attr("min", 10)
			.attr("max", 600)
			.attr("value", options.datatypeDistance())
			.attr("step", 10);

		datatypeSlider.on("input", function () {
			datatypeSliderChanged();
			options.datatypeDistance(datatypeSlider.property("value"));
			graph.updateStyle();
		});
	}

	function classSliderChanged() {
		var distance = classSlider.property("value");
		classSliderLabel.html(distance);
	}

	function datatypeSliderChanged() {
		var distance = datatypeSlider.property("value");
		datatypeSliderLabel.html(distance);
	}

	/**
	 * Resets the gravity sliders to their default.
	 */
	gravityMenu.reset = function () {
		classSlider.property("value", options.classDistance());
		classSliderChanged();
		datatypeSlider.property("value", options.datatypeDistance());
		datatypeSliderChanged();
	};


	return gravityMenu;
};
