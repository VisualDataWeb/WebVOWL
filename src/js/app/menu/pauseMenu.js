/**
 * Contains the logic for the pause and resume button.
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
webvowlApp.pauseMenu = function (graph) {

	var pauseMenu = {},
		pauseButton;


	/**
	 * Adds the pause button to the website.
	 */
	pauseMenu.setup = function () {
		pauseButton = d3.select("#pauseOption")
			.append("a")
			.datum({paused: false})
			.attr("id", "pause")
			.attr("href", "#")
			.on("click", function (d) {
				if (d.paused) {
					graph.unfreeze();
				} else {
					graph.freeze();
				}
				d.paused = !d.paused;
				updatePauseButtonClass();
				updatePauseButtonText();
			});

		// Set these properties the first time manually
		updatePauseButtonClass();
		updatePauseButtonText();
	};

	function updatePauseButtonClass() {
		pauseButton.classed("paused", function (d) {
			return d.paused;
		});
	}

	function updatePauseButtonText() {
		if (pauseButton.datum().paused) {
			pauseButton.text("Resume");
		} else {
			pauseButton.text("Pause");
		}
	}


	return pauseMenu;
};
