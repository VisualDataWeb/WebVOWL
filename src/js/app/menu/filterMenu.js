/**
 * Contains the logic for connecting the filters with the website.
 *
 * @param graph required for calling a refresh after a filter change
 * @param datatypeFilter filter for all datatypes
 * @param subclassFilter filter for all subclasses
 * @returns {{}}
 */
webvowlApp.filterMenu = function (graph, datatypeFilter, subclassFilter) {

	var filterMenu = {},
		datatypeFilterContainerSelector = "#datatypeCollapsingOption",
		subclassFilterCotnainerSelector = "#subclassCollapsingOption";


	/**
	 * Connects the website with graph filters.
	 */
	filterMenu.setup = function () {
		addFilterItem(datatypeFilter, "datatype", "Datatypes", datatypeFilterContainerSelector);
		addFilterItem(subclassFilter, "subclass", "Subclasses", subclassFilterCotnainerSelector);
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
			.attr("type", "checkbox");

		filterCheckbox.on("click", function () {
			var isEnabled = filterCheckbox.property("checked");
			filter.enabled(isEnabled);
			graph.update();
		});

		filterContainer.append("label")
			.attr("for", identifier + "FilterCheckbox")
			.text("Hide " + pluralNameOfFilteredItems);
	}

	return filterMenu;
};
