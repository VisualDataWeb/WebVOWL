/**
 * Contains the logic for the reset button.
 *
 * @param graph the associated webvowl graph
 * @param resettableMenues menues that can be resetted
 * @returns {{}}
 */
webvowlApp.resetMenu = function (graph, resettableMenues) {

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

		resettableMenues.forEach(function(menu) {
			menu.reset();
		});

		graph.updateStyle();
	}


	return resetMenu;
};
