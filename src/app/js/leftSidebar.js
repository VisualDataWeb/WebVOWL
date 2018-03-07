/**
 * Contains the logic for the sidebar.
 * @param graph the graph that belongs to these controls
 * @returns {{}}
 */
module.exports = function (graph) {

	var leftSidebar = {},
		languageTools = webvowl.util.languageTools(),
		elementTools = webvowl.util.elementTools();
    var collapseButton = d3.select("#leftSideBarCollapseButton");
    var visibleSidebar=0;
    var sideBarContent = d3.select("#leftSideBarContent");
    var sideBarContainer = d3.select("#containerForLeftSideBar");
    var defaultClassSelectionContainers=[];
    var defaultDatatypeSelectionContainers=[];
    var defaultPropertySelectionContainers=[];

	leftSidebar.setup=function(){
		console.log("Setup Left SideBar");
        setupCollapsing();
        leftSidebar.initSideBarAnimation();

        collapseButton.on("click",function(){
            graph.options().navigationMenu().hideAllMenus();
            var settingValue=parseInt(leftSidebar.getSidebarVisibility());
            console.log("LeftSidebar visible?"+settingValue);
            if (settingValue===0) leftSidebar.showSidebar(1);
            else                  leftSidebar.showSidebar(0);
        });

        setupSelectionContainers();

	};

	leftSidebar.hideCollapseButton=function(val){
	    sideBarContainer.classed("hidden",val);
    };


	function unselectAllElements(container){
	    for (var i=0;i<container.length;i++)
            container[i].classed("defaultSelected",false);
    }
    function selectThisDefaultElement(element){
        d3.select(element).classed("defaultSelected",true);
    }
    function updateDefaultNameInAccordion(element, identifier){
        d3.select("#"+identifier).node().innerHTML=element.innerHTML;
    }

    function classSelectorFunction(){
        unselectAllElements(defaultClassSelectionContainers);
        selectThisDefaultElement(this);
        updateDefaultNameInAccordion(this,"defaultClass");
    }
    function datatypeSelectorFunction(){
        unselectAllElements(defaultDatatypeSelectionContainers);
        selectThisDefaultElement(this);
        updateDefaultNameInAccordion(this,"defaultDatatype");
    }
    function propertySelectorFunction(){
        unselectAllElements(defaultDatatypeSelectionContainers);
        selectThisDefaultElement(this);
        updateDefaultNameInAccordion(this,"defaultProperty");
    }


	function setupSelectionContainers(){
        var classContainer    = d3.select("#classContainer");
        var datatypeContainer = d3.select("#datatypeContainer");
        var propertyContainer = d3.select("#propertyContainer");
        // create the supported elements

        var defaultClass="owl:Class";
        var defaultDatatype="rdfs:Literal";
        var defaultProperty="owl:objectProperty";

        var supportedClasses=graph.options().supportedClasses();
        var supportedDatatypes=graph.options().supportedDatatypes();
        var supportedProperties=graph.options().supportedProperties();
        var i;

        for (i=0;i<supportedClasses.length;i++){
            var aClassSelectionContainer;
            aClassSelectionContainer=classContainer.append("div");
            aClassSelectionContainer.classed("containerForDefaultSelection",true);
            aClassSelectionContainer.classed("noselect",true);
            aClassSelectionContainer.node().id="selectedClass"+supportedClasses[i];
            aClassSelectionContainer.node().innerHTML=supportedClasses[i];

            if (supportedClasses[i]===defaultClass){
                selectThisDefaultElement(aClassSelectionContainer.node());
            }
            aClassSelectionContainer.on("click", classSelectorFunction);
            defaultClassSelectionContainers.push(aClassSelectionContainer);
        }

        for (i=0;i<supportedDatatypes.length;i++){
            var aDTSelectionContainer=datatypeContainer.append("div");
            aDTSelectionContainer.classed("containerForDefaultSelection",true);
            aDTSelectionContainer.classed("noselect",true);
            aDTSelectionContainer.node().id="selectedDatatype"+supportedDatatypes[i];
            aDTSelectionContainer.node().innerHTML=supportedDatatypes[i];

            if (supportedDatatypes[i]===defaultDatatype){
                selectThisDefaultElement(aDTSelectionContainer.node());
            }
            aDTSelectionContainer.on("click",datatypeSelectorFunction);
            defaultDatatypeSelectionContainers.push(aDTSelectionContainer);
        }
        for (i=0;i<supportedProperties.length;i++){
           var aPropSelectionContainer=propertyContainer.append("div");
            aPropSelectionContainer.classed("containerForDefaultSelection",true);
            aPropSelectionContainer.classed("noselect",true);
            aPropSelectionContainer.node().id="selectedClass"+supportedProperties[i];
            aPropSelectionContainer.node().innerHTML=supportedProperties[i];
            aPropSelectionContainer.on("click",propertySelectorFunction);
            if (supportedProperties[i]===defaultProperty){
                selectThisDefaultElement(aPropSelectionContainer.node());
            }
            defaultPropertySelectionContainers.push(aPropSelectionContainer);
        }
    }

    function setupCollapsing() {
        // adapted version of this example: http://www.normansblog.de/simple-jquery-accordion/
        function collapseContainers(containers) {
            containers.classed("hidden", true);
        }

        function expandContainers(containers) {
            containers.classed("hidden", false);
        }

        var triggers = d3.selectAll(".accordion-trigger");

        // Collapse all inactive triggers on startup
        collapseContainers(d3.selectAll(".accordion-trigger:not(.accordion-trigger-active) + div"));

        triggers.on("click", function () {
            var selectedTrigger = d3.select(this);
            if (selectedTrigger.classed("accordion-trigger-active")) {
                // Collapse the active (which is also the selected) trigger
                collapseContainers(d3.select(selectedTrigger.node().nextElementSibling));
                selectedTrigger.classed("accordion-trigger-active", false);
            } else {
                // Collapse the other trigger ...
                // collapseContainers(d3.selectAll(".accordion-trigger-active + div"));
                // activeTriggers.classed("accordion-trigger-active", false);
                // ... and expand the selected one
                expandContainers(d3.select(selectedTrigger.node().nextElementSibling));
                selectedTrigger.classed("accordion-trigger-active", true);
            }
        });
    }

    leftSidebar.initSideBarAnimation=function(){
        // graphArea.node().addEventListener("animationend", function() {
        //     detailArea.classed("hidden", !visibleSidebar);
        //
        // });
    };

    leftSidebar.isSidebarVisible=function(){return visibleSidebar;};

    leftSidebar.updateSideBarVis=function(init){
        var vis=leftSidebar.getSidebarVisibility();
        leftSidebar.showSidebar(parseInt(vis),init);
    };

    leftSidebar.initSideBarAnimation=function() {
        sideBarContainer.node().addEventListener("animationend", function () {
            sideBarContent.classed("hidden", !visibleSidebar);
            if (visibleSidebar === true) {
                sideBarContainer.style("width", "200px");
                sideBarContent.classed("hidden",false);
            }
            else {
                sideBarContainer.style("width", "0px");
            }
            graph.updateCanvasContainerSize();
            graph.options().navigationMenu().updateScrollButtonVisibility();
        });
    };

    leftSidebar.showSidebar=function(val,init){
        // make val to bool
		console.log("wannt to show sidebar?"+val);
        if (val===1) {
            visibleSidebar=true;
            collapseButton.node().innerHTML="<";

            // call expand animation;
            sideBarContainer .style("-webkit-animation-name","l_sbExpandAnimation");
            sideBarContainer .style("-webkit-animation-duration","0.5s");

        }
        if (val===0) {
            visibleSidebar = false;
            sideBarContent.classed("hidden", true);
            collapseButton.node().innerHTML = ">";
            // call collapse animation
            sideBarContainer .style("-webkit-animation-name","l_sbCollapseAnimation");
            sideBarContainer .style("-webkit-animation-duration","0.5s");

        }
    };


    leftSidebar.getSidebarVisibility=function(){
        var isHidden=sideBarContent.classed("hidden");
        if (isHidden===false) return String(1);
        if (isHidden===true) return String(0);
    };

    return leftSidebar;
};
