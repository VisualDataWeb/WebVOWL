/**
 * Contains the logic for the reset button.
 *
 * @param graph the associated webvowl graph
 * @param gravityMenu the gravity menu
 * @returns {{}}
 */
webvowlApp.resetMenu = function (graph, gravityMenu) {

	var resetMenu = {},
		options = graph.getGraphOptions(),
		untouchedOptions = webvowl.options();


	/**
	 * Adds the reset button to the website.
	 */
	resetMenu.setup = function () {
		d3.select("#resetOption")
			.append("a")
			.attr("id", "reset")
			.attr("href", "#")
			.property("type", "reset")
			.text("Reset")
			.on("click", resetGraph);
	};

	function resetGraph() {
		options.classDistance(untouchedOptions.classDistance());
		options.datatypeDistance(untouchedOptions.datatypeDistance());
		options.charge(untouchedOptions.charge());
		options.gravity(untouchedOptions.gravity());
		options.linkStrength(untouchedOptions.linkStrength());
		graph.reset();
		graph.updateStyle();

		gravityMenu.reset();
	}

	/**
	 * Exists for compatibility reasons.
	 */
	resetMenu.reset = function () {
	};


	return resetMenu;
};
