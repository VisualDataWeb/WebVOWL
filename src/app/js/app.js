module.exports = function () {

	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		languageTools = webvowl.util.languageTools(),
		GRAPH_SELECTOR = "#graph",
	// Modules for the webvowl app
		exportMenu = require("./menu/exportMenu")(graph),
		filterMenu = require("./menu/filterMenu")(graph),
		gravityMenu = require("./menu/gravityMenu")(graph),
		modeMenu = require("./menu/modeMenu")(graph),
		ontologyMenu = require("./menu/ontologyMenu")(graph),
		pauseMenu = require("./menu/pauseMenu")(graph),
		resetMenu = require("./menu/resetMenu")(graph),
		searchMenu = require("./menu/searchMenu")(graph),
		navigationMenu = require("./menu/navigationMenu")(graph),
		sidebar = require("./sidebar")(graph),
	// Graph modules
		colorExternalsSwitch = webvowl.modules.colorExternalsSwitch(graph),
		compactNotationSwitch = webvowl.modules.compactNotationSwitch(graph),
		datatypeFilter = webvowl.modules.datatypeFilter(),
		disjointFilter = webvowl.modules.disjointFilter(),
		focuser = webvowl.modules.focuser(),
		emptyLiteralFilter=webvowl.modules.emptyLiteralFilter(),
		nodeDegreeFilter = webvowl.modules.nodeDegreeFilter(filterMenu),
		nodeScalingSwitch = webvowl.modules.nodeScalingSwitch(graph),
		objectPropertyFilter = webvowl.modules.objectPropertyFilter(),
		pickAndPin = webvowl.modules.pickAndPin(),
		selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation),
		statistics = webvowl.modules.statistics(),
		subclassFilter = webvowl.modules.subclassFilter(),
		setOperatorFilter = webvowl.modules.setOperatorFilter();

	app.initialize = function () {
		options.graphContainerSelector(GRAPH_SELECTOR);
		options.selectionModules().push(focuser);
		options.selectionModules().push(selectionDetailDisplayer);
		options.selectionModules().push(pickAndPin);
		options.filterModules().push(emptyLiteralFilter);
		options.filterModules().push(statistics);
		options.filterModules().push(datatypeFilter);
		options.filterModules().push(objectPropertyFilter);
		options.filterModules().push(subclassFilter);
		options.filterModules().push(disjointFilter);
		options.filterModules().push(setOperatorFilter);
		options.filterModules().push(nodeScalingSwitch);
		options.filterModules().push(nodeDegreeFilter);
		options.filterModules().push(compactNotationSwitch);
		options.filterModules().push(colorExternalsSwitch);


		d3.select(window).on("resize", adjustSize);

		exportMenu.setup();
		gravityMenu.setup();
		filterMenu.setup(datatypeFilter, objectPropertyFilter, subclassFilter, disjointFilter, setOperatorFilter, nodeDegreeFilter);
		modeMenu.setup(pickAndPin, nodeScalingSwitch, compactNotationSwitch, colorExternalsSwitch);
		pauseMenu.setup();
		sidebar.setup();


        var agentVersion=getInternetExplorerVersion();
        console.log("agent Version "+agentVersion);
       	if (agentVersion> 0 && agentVersion<= 11) {
        	console.log("this agent is not supported");
			d3.select("#browserCheck").classed("hidden", false);
			d3.select("#killWarning" ).classed("hidden", true);
			d3.select("#optionsArea" ).classed("hidden", true);
			d3.select("#logo").classed("hidden", true);
        } else {
			d3.select("#logo").classed("hidden", false);
			if (agentVersion===12) {
                d3.select("#browserCheck").classed("hidden", false);
                d3.select("#killWarning").classed("hidden", false);
            } else {
                d3.select("#browserCheck").classed("hidden", true);
			}

            resetMenu.setup([gravityMenu, filterMenu, modeMenu, focuser, selectionDetailDisplayer, pauseMenu]);
			searchMenu.setup();
			navigationMenu.setup();

			// give the options the pointer to the some menus for import and export
			options.literalFilter(emptyLiteralFilter);
			options.filterMenu(filterMenu);
			options.modeMenu(modeMenu);
			options.gravityMenu(gravityMenu);
			options.pausedMenu(pauseMenu);
			options.pickAndPinModule(pickAndPin);
			options.resetMenu(resetMenu);
			options.searchMenu(searchMenu);
			options.ontologyMenu(ontologyMenu);
			options.navigationMenu(navigationMenu);
			options.sidebar(sidebar);
            ontologyMenu.setup(loadOntologyFromText);

			graph.start();
			adjustSize();
			// graph.updateSideBarVis(true);

			var defZoom;
			var w = graph.options().width();
			var h = graph.options().height();
			defZoom = Math.min(w, h) / 1000;

			// initialize the values;
            d3.select("#sidebarExpandButton").on("click",function(){
                var settingValue=parseInt(graph.getSidebarVisibility());
                if (settingValue===1) graph.showSidebar(0);
                else  graph.showSidebar(1);
            });
			graph.setDefaultZoom(defZoom);
			graph.initSideBarAnimation();
        }
	};

	function loadOntologyFromText(jsonText, filename, alternativeFilename) {
		pauseMenu.reset();

		if (jsonText===undefined && filename===undefined){
			console.log("Nothing to load");
			return;
		}

		var data;
		if (jsonText) {
			// validate JSON FILE
			var validJSON;
			try {
				data =JSON.parse(jsonText);
				validJSON=true;
			} catch (e){
				validJSON=false;
			}
			if (validJSON===false){
				// the server output is not a valid json file
				console.log("Retrieved data is not valid! (JSON.parse Error)");
				ontologyMenu.emptyGraphError();
				return;
			}

			if (!filename) {
				// First look if an ontology title exists, otherwise take the alternative filename
				var ontologyNames = data.header ? data.header.title : undefined;
				var ontologyName = languageTools.textInLanguage(ontologyNames);

				if (ontologyName) {
					filename = ontologyName;
				} else {
					filename = alternativeFilename;
				}
			}
		}

		//@WORKAROUND
		// check if data has classes and properties;
		var classCount				  = parseInt(data.metrics.classCount);
		var objectPropertyCount		  = parseInt(data.metrics.objectPropertyCount);
		var datatypePropertyCount	  = parseInt(data.metrics.datatypePropertyCount);

		if (classCount === 0 && objectPropertyCount===0 && datatypePropertyCount===0 ){
			// generate message for the user;
			ontologyMenu.emptyGraphError();
		}

		exportMenu.setJsonText(jsonText);
		options.data(data);
		graph.load();
		
		sidebar.updateOntologyInformation(data, statistics);
		exportMenu.setFilename(filename);
	}

	function adjustSize() {
		var graphContainer = d3.select(GRAPH_SELECTOR),
			svg = graphContainer.select("svg"),
			height = window.innerHeight - 40,
			width = window.innerWidth - (window.innerWidth * 0.22);

		if (graph.getSidebarVisibility()==="0"){
            height = window.innerHeight - 40 ;
            width = window.innerWidth;

        }

		graphContainer.style("height", height + "px");
		svg.attr("width", width)
			.attr("height", height);

		options.width(width)
			.height(height);
		graph.updateStyle();



		navigationMenu.updateVisibilityStatus();
		// update also the padding options of loading and the logo positions;
		var warningDiv=d3.select("#browserCheck");
		if (warningDiv.classed("hidden")===false ) {
            var offset=10+warningDiv.node().getBoundingClientRect().height;
            d3.select("#logo").style("padding", offset+"px 10px");
        }else {
			// remove the dynamic padding from the logo element;
            d3.select("#logo").style("padding", "10px");
        }
	}

	function getInternetExplorerVersion(){
        var ua,
            re,
            rv = -1;

        // check for edge
        var isEdge=/(?:\b(MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:|\bEdge\/)(\d+)/.test(navigator.userAgent);
        if (isEdge){
            rv  = parseInt("12");
            return rv;
        }

        var isIE11 = /Trident.*rv[ :]*11\./.test(navigator.userAgent);
        if (isIE11){
            rv  = parseInt("11");
            return rv;
        }
        if (navigator.appName === "Microsoft Internet Explorer") {
            ua = navigator.userAgent;
            re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        } else if (navigator.appName === "Netscape") {
            ua = navigator.userAgent;
            re = new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})");
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return rv;
	}

	return app;
};
