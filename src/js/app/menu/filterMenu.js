/**
 * Contains the logic for connecting the filters with the website.
 *
 * @param graph required for calling a refresh after a filter change
 * @param datatypeFilter filter for all datatypes
 * @param subclassFilter filter for all subclasses
 * @param disjointFilter filter for all disjoint with properties
 * @returns {{}}
 */
webvowlApp.filterMenu = function (graph, datatypeFilter, subclassFilter, disjointFilter) {

	var filterMenu = {},
		checkboxes = [];


	/**
	 * Connects the website with graph filters.
	 */
	filterMenu.setup = function () {
		addFilterItem(datatypeFilter, "datatype", "All datatypes", "#datatypeFilteringOption");
		addFilterItem(subclassFilter, "subclass", "Solitary subclass.", "#subclassFilteringOption");
		addFilterItem(disjointFilter, "disjoint", "Disjoint Withs", "#disjointFilteringOption");
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
		checkboxes.push(filterCheckbox);

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

	/**
	 * Resets the filters (and also filtered elements) to their default.
	 */
	filterMenu.reset = function () {
		checkboxes.forEach(function (checkbox) {
			var isChecked = checkbox.property("checked");
			if (isChecked) {
				checkbox.property("checked", false);
				// Call onclick event handlers programmatically
				checkbox.on("click")();
			}
		});
	};


	return filterMenu;
};
