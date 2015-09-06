/**
 * Contains the logic for the reset button.
 *
 * @param graph the associated webvowl graph
 * @param resettableModules modules that can be resetted
 * @returns {{}}
 */
module.exports = function (graph, resettableModules) {

	var resetMenu = {},
		options = graph.graphOptions(),
		untouchedOptions = webvowl.options();


	/**
	 * Adds the reset button to the website.
	 */
	resetMenu.setup = function () {
		d3.select("#reset-button").on("click", resetGraph);
	};

	function resetGraph() {
		options.classDistance(untouchedOptions.classDistance());
		options.datatypeDistance(untouchedOptions.datatypeDistance());
		options.charge(untouchedOptions.charge());
		options.gravity(untouchedOptions.gravity());
		options.linkStrength(untouchedOptions.linkStrength());
		graph.reset();

		resettableModules.forEach(function (module) {
			module.reset();
		});

		graph.updateStyle();
	}


	return resetMenu;
};
