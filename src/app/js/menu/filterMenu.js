/**
 * Contains the logic for connecting the filters with the website.
 *
 * @param graph required for calling a refresh after a filter change
 * @returns {{}}
 */
module.exports = function (graph) {

	var filterMenu = {},
		checkboxData = [],
		menuElement = d3.select("#m_filter"),
        menuControl= d3.select("#c_filter a"),
		nodeDegreeContainer = d3.select("#nodeDegreeFilteringOption"),
		graphDegreeLevel,
		defaultDegreeValue=0,
		degreeSlider;

    filterMenu.setDefaultDegreeValue=function(val){defaultDegreeValue=val;};
    filterMenu.getDefaultDegreeValue=function(){return defaultDegreeValue;};

	filterMenu.getGraphObject=function(){
		return graph;
	};
	/** some getter function  **/
	filterMenu.getCheckBoxContainer = function () {
		return checkboxData;
	};

	filterMenu.getDegreeSliderValue = function () {
		return degreeSlider.property("value");
	};
	/**
	 * Connects the website with graph filters.
	 * @param datatypeFilter filter for all datatypes
	 * @param objectPropertyFilter filter for all object properties
	 * @param subclassFilter filter for all subclasses
	 * @param disjointFilter filter for all disjoint with properties
	 * @param setOperatorFilter filter for all set operators with properties
	 * @param nodeDegreeFilter filters nodes by their degree
	 */
	filterMenu.setup = function (datatypeFilter, objectPropertyFilter, subclassFilter, disjointFilter, setOperatorFilter, nodeDegreeFilter) {
		// TODO: is this here really necessarry? << new menu visualization style?
        menuControl.on("mouseover",function(){
			var searchMenu=graph.options().searchMenu();
			searchMenu.hideSearchEntries();
		});
        menuControl.on("mouseleave", function () {
			filterMenu.highlightForDegreeSlider(false);
		});

		addFilterItem(datatypeFilter, "datatype", "Datatype properties", "#datatypeFilteringOption");
		addFilterItem(objectPropertyFilter, "objectProperty", "Object properties", "#objectPropertyFilteringOption");
		addFilterItem(subclassFilter, "subclass", "Solitary subclasses", "#subclassFilteringOption");
		addFilterItem(disjointFilter, "disjoint", "Class disjointness", "#disjointFilteringOption");
		addFilterItem(setOperatorFilter, "setoperator", "Set operators", "#setOperatorFilteringOption");

		addNodeDegreeFilter(nodeDegreeFilter, nodeDegreeContainer);
        addAnimationFinishedListener();
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

		filterCheckbox.on("click", function (silent) {
			// There might be no parameters passed because of a manual
			// invocation when resetting the filters
			var isEnabled = filterCheckbox.property("checked");
			filter.enabled(isEnabled);
			if (silent !== true) {
				// updating graph when silent is false or the parameter is not given.
				graph.update();
			}
		});

		filterContainer.append("label")
			.attr("for", identifier + "FilterCheckbox")
			.text(pluralNameOfFilteredItems);
	}

	function addNodeDegreeFilter(nodeDegreeFilter, container) {
		nodeDegreeFilter.setMaxDegreeSetter(function (maxDegree) {
			degreeSlider.attr("max", maxDegree);
			setSliderValue(degreeSlider, Math.min(maxDegree, degreeSlider.property("value")));
		});

		nodeDegreeFilter.setDegreeGetter(function () {
			return degreeSlider.property("value");
		});

		nodeDegreeFilter.setDegreeSetter(function (value) {
			setSliderValue(degreeSlider, value);
		});

		var sliderContainer,
			sliderValueLabel;

		sliderContainer = container.append("div")
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



		degreeSlider.on("change", function (silent) {
			if (silent !== true) {
				graph.update();
				graphDegreeLevel=degreeSlider.property("value");
			}
		});


		degreeSlider.on("input", function () {
			var degree = degreeSlider.property("value");
			sliderValueLabel.text(degree);
		});


		// adding wheel events
		degreeSlider.on("wheel",handleWheelEvent);
		degreeSlider.on("focusout",function(){
			if (degreeSlider.property("value")!==graphDegreeLevel) {
				graph.update();
			}
		});
	}

	function handleWheelEvent(){
		var wheelEvent=d3.event;

		var offset;
		if (wheelEvent.deltaY<0) offset=1;
		if (wheelEvent.deltaY>0) offset=-1;
		var maxDeg=parseInt(degreeSlider.attr("max"));
		var oldVal=parseInt(degreeSlider.property("value"));
		var newSliderValue=oldVal+offset;
		if (oldVal!==newSliderValue && (newSliderValue>=0 && newSliderValue<=maxDeg)) {
			// only update when they are different [reducing redundant updates]
			// set the new value and emit an update signal
			degreeSlider.property("value", newSliderValue);
			degreeSlider.on("input")();// <<-- sets the text value
			graph.update();
		}
		d3.event.preventDefault();
	}
	
	function setSliderValue(slider, value) {
		slider.property("value", value).on("input")();
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

		setSliderValue(degreeSlider, 0);
		degreeSlider.on("change")();
	};

	function addAnimationFinishedListener() {
        menuControl.node().addEventListener("animationend", function () {
            menuControl.classed("buttonPulse", false);
            menuControl.classed("filterMenuButtonHighlight", true);

        });
    }

    filterMenu.killButtonAnimation=function(){
        menuControl.classed("buttonPulse", false);
        menuControl.classed("filterMenuButtonHighlight", false);
	};


	filterMenu.highlightForDegreeSlider = function (enable) {
		if (!arguments.length) {
			enable = true;
		}
        menuControl.classed("highlighted", enable);
		nodeDegreeContainer.classed("highlighted", enable);
		// pulse button handling
		if (menuControl.classed("buttonPulse")===true && enable===true){
            menuControl.classed("buttonPulse", false);
			var timer= setTimeout(function() {
                menuControl.classed("buttonPulse", enable);
				clearTimeout(timer);
				// after the time is done, remove the pulse but stay highlighted
			}, 100);
		}else {
            menuControl.classed("buttonPulse", enable);
            menuControl.classed("filterMenuButtonHighlight", enable);
		}
	};


	/** importer functions **/
	// setting manually the values of the filter
	// no update of the gui settings, these are updated in updateSettings
	filterMenu.setCheckBoxValue = function (id, checked) {
		for (var i = 0; i < checkboxData.length; i++) {
			var cbdId = checkboxData[i].checkbox.attr("id");
			if (cbdId === id) {
				checkboxData[i].checkbox.property("checked", checked);
				break;
			}
		}
	};

	filterMenu.getCheckBoxValue=function(id){
        for (var i = 0; i < checkboxData.length; i++) {
            var cbdId = checkboxData[i].checkbox.attr("id");
            if (cbdId === id) {
                return checkboxData[i].checkbox.property("checked");

            }
        }
	};
	// set the value of the slider
	filterMenu.setDegreeSliderValue = function (val) {
		degreeSlider.property("value", val);
	};

	filterMenu.getDegreeSliderValue = function(){
		return degreeSlider.property("value");
	};

	// update the gui without invoking graph update (calling silent onclick function)
	filterMenu.updateSettings = function () {
		var silent = true;
		var sliderValue = degreeSlider.property("value");
		if (sliderValue > 0) {
			filterMenu.highlightForDegreeSlider(true);
		} else{
			filterMenu.highlightForDegreeSlider(false);
		}
		checkboxData.forEach(function (checkboxData) {
			var checkbox = checkboxData.checkbox;
			checkbox.on("click")(silent);
		});

		degreeSlider.on("input")();
		degreeSlider.on("change")();

	};

	return filterMenu;
};
