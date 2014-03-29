var   foaf = document.getElementById('foaf')
    , muto = document.getElementById('muto')
    , personasonto = document.getElementById('personasonto')
    , graphTag = document.getElementById('graph')
    , exportSvg = document.getElementById('exportSvg')
    , linkDistanceClassSlider
    , linkDistanceClassLabel
    , linkDistanceLiteralSlider
    , linkDistanceLiteralLabel
    , jsonURI = "foaf"
    , onLoadCalled = false;

var bindListners = function() {
    foaf.addEventListener('click', function () {
        refreshOntology("foaf");
    });
    muto.addEventListener('click', function () {
        refreshOntology("muto");
    });
    personasonto.addEventListener('click', function () {
        refreshOntology("persona");
    });
    exportSvg.addEventListener('click', function () { 
        exportSVGDrawing();
    });
}
// adding styles inline to the svg elements
var loadGraphStyle = function () { 
  
  d3.selectAll(".text")
    .style("font-size", "12px")
    .style("font-family", "Helvetica, Arial, sans-serif")
    .style("pointer-events", "none");
 
  d3.selectAll(".embedded")
    .style("pointer-events", "none");

  d3.selectAll(".subtext")
    .style("font-size", "9px");

  d3.selectAll(".cardinality")
    .style("font-size", "10px");

  d3.selectAll(".class")
    .style("stroke", "#000")
    .style("stroke-width", "2")
    .style("fill", "#acf");

  d3.selectAll("path")
    .style("stroke", "#000")
    .style("stroke-width", "2")
    .style("fill", "none");

  d3.selectAll(".nofill")
    .style("fill", "none");

  d3.selectAll(".nostroke")
    .style("stroke", "none");

  d3.selectAll(".special")
    .style("stroke-dasharray", "8");    

  d3.selectAll(".dotted")
    .style("stroke-dasharray", "3"); 

  d3.selectAll(".fineline")
    .style("stroke","#000")  
    .style("stroke-width", "1");

  d3.selectAll(".object, .disjoint")
    .style("fill", "#acf");

  d3.selectAll(".rdf")
    .style("fill", "#c9c");

  d3.selectAll(".external")
    .style("fill", "#36c");

  d3.selectAll(".deprecated")
    .style("fill", "#ccc");

  d3.selectAll(".label .datatype")
    .style("fill", "#9c6");

  d3.selectAll(".literal, .node .datatype")
    .style("fill", "#fc3");

  d3.selectAll(".symbol")
    .style("fill", "#69c"); 

  d3.selectAll(".arrowhead, marker path")
    .style("fill", "#000");

  d3.selectAll("marker path")
    .style("stroke-dasharray", "50");

  d3.selectAll(".white, .dottedMarker path")
    .style("fill", "#fff");

  d3.selectAll(".svgGraph .text tspan:only-child, .svgGraph .text:empty")
    .style("dominant-baseline", "central");

  d3.selectAll(".subclass")
    .style("fill", "#ecf0f1");        

  d3.selectAll("rect.focused, circle.focused")
    .style("stroke-width", "4px");

  d3.selectAll(".cardinality.focused, marker path.focused")
    .style("fill","#f00");
};
var removeStyles = function () { 
    d3.selectAll(".class, .text, .embedded, .subtext, .cardinality, path, .nofill, .nostroke, .special, .dotted, .fineline, .object, .rdf, .external, .deprecated, .label .datatype, .literal, .node .datatype, .symbol, .arrowhead, marker path, .white, .dottedMarker path, .svgGraph .text tspan:only-child, .svgGraph .text:empty, .subclass, .disjoint")
        .attr("style", null);
};

var exportSVGDrawing = function exportSVGDrawingFunct () {
    // Get the d3js SVG element
    var   graph = document.getElementById('graph')
        , svg = graph.getElementsByTagName('svg')[0]
        , svgsrc
        , svgXML;

    loadGraphStyle(); //load the graphic styles

    svgsrc = d3.select(svg)
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    //btoa(); Creates a base-64 encoded ASCII string from a "string" of binary data.
    svgXML = 'data:image/svg+xml;base64,'+ btoa(svgsrc);
   
    d3.select(exportSvg)
        .attr("href", svgXML)
        .attr("download", jsonURI+".svg");

    removeStyles(); // remove graphic styles for interaction to go back to normal
};

var graphOptions = function graphOptionsFunct() {
    
    var   resetOption = document.getElementById('resetOption')
        , classSliderOption = document.getElementById('classSliderOption')
        , literalSliderOption = document.getElementById('literalSliderOption')
        , title = document.getElementById('title')
        , about = document.getElementById('about')
        , description = document.getElementById('description')
        , version = document.getElementById('version')
        , authors = document.getElementById('authors')
        , classSliderDiv
        , literalSliderDiv;

    d3.select(resetOption) 
        .append("a")
        .attr("id", "reset")
        .attr("href", "#")
        .property("type", "reset")
        .text("Reset")
        .on("click", resetGraph);

    // Append the link distance slider for classes
    classSliderDiv = d3.select(classSliderOption)
        .append("div")
        .attr("id", "classDistanceSlider");

    linkDistanceClassLabel = classSliderDiv.append("label")
        .attr("id", "rangeClassValue")
        .attr("for", "rangeClassSlider")
        .text(DEFAULT_VISIBLE_LINKDISTANCE);

    classSliderDiv.append("label")
        .attr("for", "rangeClassSlider")
        .text("Class Distance");
            
    linkDistanceClassSlider = classSliderDiv.append("input")
        .attr("id", "rangeClassSlider")
        .attr("type", "range")
        .attr("min", 10)
        .attr("max", 600)
        .attr("value", DEFAULT_VISIBLE_LINKDISTANCE)
        .attr("step", 10)
        .on("input", changeDistance);

    // Append the link distance slider for literals
    literalSliderDiv = d3.select(literalSliderOption)
        .append("div")
        .attr("id", "literalDistanceSlider");

    linkDistanceLiteralLabel = literalSliderDiv.append("label")
        .attr("id", "rangeLiteralValue")
        .attr("for", "rangeLiteralSlider")
        .text(DEFAULT_VISIBLE_LINKDISTANCE);

    literalSliderDiv.append("label")
        .attr("for", "rangeLiteralSlider")
        .text("Datatype Distance");

    linkDistanceLiteralSlider = literalSliderDiv.append("input")
        .attr("id", "rangeLiteralSlider")
        .attr("type", "range")
        .attr("min", 10)
        .attr("max", 600)
        .attr("value", DEFAULT_VISIBLE_LINKDISTANCE)
        .attr("step", 10)
        .on("input", changeDistance);


    d3.select(title)
        .text(json.info[0].title);
    d3.select(about)
        .attr("href", json.info[0].url)
        .text(json.info[0].url);
    d3.select(version)
        .text(json.info[0].version);
    d3.select(authors)
        .text(json.info[0].authors);
    d3.select(description)
        .text(json.info[0].description);
};

var loadGraph = function loadGraphFunct() {
    var   height = window.innerHeight - 40
        , width = window.innerWidth - (window.innerWidth * 0.22);

    d3.json("js/data/" + jsonURI + ".json", function(error, data) {
        json = data;
        drawGraph(graphTag, width, height);
    });
};

var onload = function onLoadFunct() {
    // Prevent multiple executions of the onload function
    if (onLoadCalled) {
        return;
    }
    onLoadCalled = true;
    loadGraph();
    bindListners();
};

function sizeChange() {
    var   graph = document.getElementById('graph')
        , svg = graph.getElementsByTagName('svg')[0]
        , tmpWidth = graph.offsetWidth;
    //d3.select("g").attr("transform", "scale(" + tmpWidth/900 + ")");
    d3.select(svg).attr("width", window.innerWidth - (window.innerWidth * 0.22));
    d3.select(svg).attr("height", window.innerHeight - 40);
};

document.onload = onload();

d3.select(window).on("resize", sizeChange);
