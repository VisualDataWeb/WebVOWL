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
		datatypeCollapsingOptionSelector = "#datatypeCollapsingOption",
		subclassCollapsingOptionSelector = "#subclassCollapsingOption";


	/**
	 * Connects the website with graph filters.
	 */
	filterMenu.setup = function () {
		bindFilter(datatypeFilter, "datatype", "Datatypes", datatypeCollapsingOptionSelector);
		bindFilter(subclassFilter, "subclass", "Subclasses", subclassCollapsingOptionSelector);
	};

	function bindFilter(filter, identifier, filterNamePlural, selector) {
		var collapsingOptionContainer,
			collapsingCheckbox;

		collapsingOptionContainer = d3.select(selector)
			.append("div")
			.classed("checkboxContainer", true)
			.attr("id", identifier + "CollapsingCheckboxContainer");

		collapsingCheckbox = collapsingOptionContainer.append("input")
			.classed("collapsingCheckbox", true)
			.attr("id", identifier + "CollapsingCheckbox")
			.attr("type", "checkbox")
			.attr("value", identifier + "Collapsing");

		collapsingCheckbox.on("click", function () {
			var isEnabled = collapsingCheckbox.property("checked");
			filter.enabled(isEnabled);
			graph.update();
		});

		collapsingOptionContainer.append("label")
			.attr("for", identifier + "CollapsingCheckbox")
			.text("Hide " + filterNamePlural);
	}

	return filterMenu;
};
