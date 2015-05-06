/**
 * Contains the logic for connecting the filters with the website.
 *
 * @param graph required for calling a refresh after a filter change
 * @param datatypeFilter filter for all datatypes
 * @param subclassFilter filter for all subclasses
 * @param disjointFilter filter for all disjoint with properties
 * @param setOperatorFilter filter for all set operators with properties
 * @param nodeDegreeFilter filters nodes by their degree
 * @returns {{}}
 */
webvowlApp.filterMenu = function (graph, datatypeFilter, subclassFilter, disjointFilter, setOperatorFilter, nodeDegreeFilter) {

	var filterMenu = {},
		checkboxData = [],
		degreeSlider;


	/**
	 * Connects the website with graph filters.
	 */
	filterMenu.setup = function () {
		addFilterItem(datatypeFilter, "datatype", "Datatype prop.", "#datatypeFilteringOption");
		addFilterItem(subclassFilter, "subclass", "Solitary subclass.", "#subclassFilteringOption");
		addFilterItem(disjointFilter, "disjoint", "Disjointness info", "#disjointFilteringOption");
		addFilterItem(setOperatorFilter, "setoperator", "Set operators", "#setOperatorFilteringOption");

		addNodeDegreeFilter("#nodeDegreeFilteringOption");
	};


	function addFilterItem(filter, identifier, pluralNameOfFilteredItems, selector) {
		var filterContainer,
			filterCheckbox;

		filterContainer = d3.select(selector)
			.append("div")
			.classed("checkboxContainer", true);

		filterCheckbox = filterContainer.append("input")
			.classed("filterCheckbox", true)
			.attr("id", identifier + "FilterCheckbox")
			.attr("type", "checkbox")
			.property("checked", filter.enabled());

		// Store for easier resetting
		checkboxData.push({checkbox: filterCheckbox, defaultState: filter.enabled()});

		filterCheckbox.on("click", function () {
			// There might be no parameters passed because of a manual
			// invocation when resetting the filters
			var isEnabled = filterCheckbox.property("checked");
			filter.enabled(isEnabled);
			graph.update();
		});

		filterContainer.append("label")
			.attr("for", identifier + "FilterCheckbox")
			.text(pluralNameOfFilteredItems);
	}

	function addNodeDegreeFilter(selector) {
		nodeDegreeFilter.setMaxDegreeSetter(function(maxDegree) {
			degreeSlider.attr("max", maxDegree);
			degreeSlider.property("value", Math.min(maxDegree, degreeSlider.property("value")));
		});

		nodeDegreeFilter.setDegreeQueryFunction(function () {
			return degreeSlider.property("value");
		});

		var sliderContainer,
			sliderValueLabel;

		sliderContainer = d3.select(selector)
			.append("div")
			.classed("distanceSliderContainer", true);

		degreeSlider = sliderContainer.append("input")
			.attr("id", "nodeDegreeDistanceSlider")
			.attr("type", "range")
			.attr("min", 0)
			.attr("step", 1);

		sliderContainer.append("label")
			.classed("description", true)
			.attr("for", "nodeDegreeDistanceSlider")
			.text("Degree of collapsing");

		sliderValueLabel = sliderContainer.append("label")
			.classed("value", true)
			.attr("for", "nodeDegreeDistanceSlider")
			.text(0);

		degreeSlider.on("change", function () {
			graph.update();
		});

		degreeSlider.on("input", function() {
			var degree = degreeSlider.property("value");
			sliderValueLabel.text(degree);
		});
	}

	/**
	 * Resets the filters (and also filtered elements) to their default.
	 */
	filterMenu.reset = function () {
		checkboxData.forEach(function (checkboxData) {
			var checkbox = checkboxData.checkbox,
				enabledByDefault = checkboxData.defaultState,
				isChecked = checkbox.property("checked");

			if (isChecked !== enabledByDefault) {
				checkbox.property("checked", enabledByDefault);
				// Call onclick event handlers programmatically
				checkbox.on("click")();
			}
		});

		degreeSlider.property("value", 0);
		degreeSlider.on("change")();
		degreeSlider.on("input")();
	};


	return filterMenu;
};
