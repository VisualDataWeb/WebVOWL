module.exports = function () {

	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		languageTools = webvowl.util.languageTools(),
		GRAPH_SELECTOR = "#graph",
	// Modules for the webvowl app
		exportMenu     = require("./menu/exportMenu")     (graph),
		filterMenu     = require("./menu/filterMenu")     (graph),
		gravityMenu    = require("./menu/gravityMenu")    (graph),
		modeMenu       = require("./menu/modeMenu")       (graph),
		ontologyMenu   = require("./menu/ontologyMenu")   (graph),
		pauseMenu      = require("./menu/pauseMenu")      (graph),
		resetMenu      = require("./menu/resetMenu")      (graph),
		searchMenu     = require("./menu/searchMenu")     (graph),
		navigationMenu = require("./menu/navigationMenu") (graph),
        zoomSlider     = require("./menu/zoomSlider")     (graph),
		sidebar        = require("./sidebar")             (graph),
        configMenu     = require("./menu/configMenu")     (graph),
		loadingModule  = require("./loadingModule")       (graph),


	// Graph modules
		colorExternalsSwitch 	 = webvowl.modules.colorExternalsSwitch(graph),
		compactNotationSwitch 	 = webvowl.modules.compactNotationSwitch(graph),
		datatypeFilter 			 = webvowl.modules.datatypeFilter(),
		disjointFilter 			 = webvowl.modules.disjointFilter(),
		focuser 				 = webvowl.modules.focuser(),
		emptyLiteralFilter		 = webvowl.modules.emptyLiteralFilter(),
		nodeDegreeFilter 		 = webvowl.modules.nodeDegreeFilter(filterMenu),
		nodeScalingSwitch 		 = webvowl.modules.nodeScalingSwitch(graph),
		objectPropertyFilter 	 = webvowl.modules.objectPropertyFilter(),
		pickAndPin 				 = webvowl.modules.pickAndPin(),
		selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation),
		statistics 				 = webvowl.modules.statistics(),
		subclassFilter 			 = webvowl.modules.subclassFilter(),
		setOperatorFilter 		 = webvowl.modules.setOperatorFilter();

	app.initialize = function () {
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(f){return setTimeout(f, 1000/60);}; // simulate calling code 60
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function(requestID){clearTimeout(requestID);}; //fall back

        options.graphContainerSelector(GRAPH_SELECTOR);
		options.selectionModules().push(focuser);
		options.selectionModules().push(selectionDetailDisplayer );
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
		loadingModule.setup();

        var agentVersion=getInternetExplorerVersion();
       	if (agentVersion> 0 && agentVersion<= 11) {
            console.log("Agent version "+agentVersion);
        	console.log("This agent is not supported");
			d3.select("#browserCheck").classed("hidden", false);
			d3.select("#killWarning" ).classed("hidden", true);
			d3.select("#optionsArea" ).classed("hidden", true);
			d3.select("#logo").classed("hidden", true);
        } else {
			d3.select("#logo").classed("hidden", false);
			if (agentVersion===12) {
				// allow Mircosoft Edge Browser but with warning
                d3.select("#browserCheck").classed("hidden", false);
                d3.select("#killWarning").classed("hidden", false);
            } else {
                d3.select("#browserCheck").classed("hidden", true);
			}

            resetMenu.setup([gravityMenu, filterMenu, modeMenu, focuser, selectionDetailDisplayer, pauseMenu]);
			searchMenu.setup();
			navigationMenu.setup();
			zoomSlider.setup();

			// give the options the pointer to the some menus for import and export
			options.literalFilter(emptyLiteralFilter);
			options.loadingModule(loadingModule);
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
			options.exportMenu(exportMenu);
			options.graphObject(graph);
			options.zoomSlider(zoomSlider);
            ontologyMenu.setup(loadOntologyFromText);
            configMenu.setup();
			graph.start();
			adjustSize();

			var defZoom;
			var w = graph.options().width();
			var h = graph.options().height();
			defZoom = Math.min(w, h) / 1000;
			graph.setDefaultZoom(defZoom);

			// prevent backspace reloading event
            var htmlBody=d3.select("body");
            d3.select(document).on("keydown", function (e) {
                if (d3.event.keyCode === 8 && d3.event.target===htmlBody.node() ) {
                	// we could add here an alert
                    d3.event.preventDefault();
                }
            });
			loadingModule.parseUrlAndLoadOntology(); // loads automatically the ontology provided by the parameters
        }
	};

	function loadOntologyFromText(jsonText, filename, alternativeFilename) {
		pauseMenu.reset();
		graph.options().navigationMenu().hideAllMenus();

		if ((jsonText===undefined && filename===undefined) || (jsonText.length===0)){
            loadingModule.notValidJsonFile();
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
                loadingModule.notValidJsonFile();
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


		// check if we have graph data
        var classCount =0;
		if (data.class!==undefined){
			classCount=data.class.length;
		}

		if (classCount === 0 ){
			// generate message for the user;
			loadingModule.emptyGraphContentError();
		}else {
            loadingModule.validJsonFile();
            ontologyMenu.setCachedOntology(filename, jsonText);
            exportMenu.setJsonText(jsonText);
            options.data(data);
            graph.options().loadingModule().setPercentMode();
            graph.load();
            sidebar.updateOntologyInformation(data, statistics);
            exportMenu.setFilename(filename);
            graph.updateZoomSliderValueFromOutside();
            adjustSize();
        }
	}

	function adjustSize() {
		var graphContainer = d3.select(GRAPH_SELECTOR),
			svg = graphContainer.select("svg"),
			height = window.innerHeight - 40,
			width = window.innerWidth - (window.innerWidth * 0.22);

		if (sidebar.getSidebarVisibility()==="0"){
            height = window.innerHeight - 40 ;
            width = window.innerWidth;
        }

        graph.adjustingGraphSize(true);
		graphContainer.style("height", height + "px");
		svg.attr("width", width)
			.attr("height", height);

		options.width ( width  )
			   .height( height );

		graph.updateStyle();
        adjustSliderSize();

        d3.select("#loadingInfo-container").style("height",0.5*(height-80)+"px");
        loadingModule.checkForScreenSize();

		// update also the padding options of loading and the logo positions;
		var warningDiv=d3.select("#browserCheck");
		if (warningDiv.classed("hidden")===false ) {
            var offset=10+warningDiv.node().getBoundingClientRect().height;
            d3.select("#logo").style("padding", offset+"px 10px");
        }else {
			// remove the dynamic padding from the logo element;
            d3.select("#logo").style("padding", "10px");
        }

        // scrollbar tests;
		var element =d3.select("#menuElementContainer").node();
        var maxScrollLeft = element.scrollWidth - element.clientWidth;
        var leftButton=d3.select("#scrollLeftButton");
        var rightButton=d3.select("#scrollRightButton");
        if (maxScrollLeft>0){
        	// show both and then check how far is bar;
         	rightButton.classed("hidden",false);
            leftButton.classed("hidden",false);
            navigationMenu.updateScrollButtonVisibility();
         }else{
        	// hide both;
            rightButton.classed("hidden",true);
            leftButton.classed("hidden",true);
		}

	}

    function adjustSliderSize(){
		// TODO: refactor and put this into the slider it self
        var height = window.innerHeight - 40;
        var fullHeight=height;
        var zoomOutPos=height-30;
        var sliderHeight=150;
        if (fullHeight<150) {
            // hide the slider button;
            d3.select("#zoomSliderParagraph").classed("hidden", true);
            d3.select("#zoomOutButton").classed("hidden", true);
            d3.select("#zoomInButton").classed("hidden", true);
            d3.select("#centerGraphButton").classed("hidden", true);
            return;
        }
        d3.select("#zoomSliderParagraph").classed("hidden",false);
        d3.select("#zoomOutButton").classed("hidden",false);
        d3.select("#zoomInButton").classed("hidden",false);
        d3.select("#centerGraphButton").classed("hidden",false);

        var zoomInPos=zoomOutPos-20;
        var centerPos=zoomInPos-20;
        if (fullHeight<280){
            // hide the slider button;
            d3.select("#zoomSliderParagraph").classed("hidden",true);
            d3.select("#zoomOutButton").style("top",zoomOutPos+"px");
            d3.select("#zoomInButton").style("top",zoomInPos+"px");
            d3.select("#centerGraphButton").style("top",centerPos+"px");
            return;
        }

        var sliderPos=zoomOutPos-sliderHeight;
        zoomInPos=sliderPos-20;
        centerPos=zoomInPos-20;
        d3.select("#zoomSliderParagraph").classed("hidden",false);
        d3.select("#zoomOutButton").style("top",zoomOutPos+"px");
        d3.select("#zoomInButton").style("top",zoomInPos+"px");
        d3.select("#centerGraphButton").style("top",centerPos+"px");
        d3.select("#zoomSliderParagraph").style("top",sliderPos+"px");
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
