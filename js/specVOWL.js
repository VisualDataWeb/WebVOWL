var   graphTag = document.getElementById('graph')
    , linkDistanceClassSlider
    , linkDistanceClassLabel
    , linkDistanceLiteralLabel
    , linkDistanceLiteralSlider
    , onLoadCalled = false;
// Set the default graph data
var jsonURI = "foaf_spec";

var graphOptions = function graphOptionsFunct() {

    var   resetOption = document.getElementById('resetOption')
        , sliderOption = document.getElementById('sliderOption');

    d3.select(resetOption) 
        .append("button")
        .attr("id", "reset")
        .property("type", "reset")
        .text("Reset")
        .on("click", resetGraph);

    var slidDiv = d3.select(sliderOption)
        .append("div")
        .attr("id", "distanceSlider");

    linkDistanceClassLabel = slidDiv.append("label")
        .attr("for", "distanceSlider")
        .text(DEFAULT_VISIBLE_LINKDISTANCE);
    linkDistanceLiteralLabel = linkDistanceClassLabel;

    linkDistanceClassSlider = slidDiv.append("input")
        .attr("type", "range")
        .attr("min", 10)
        .attr("max", 600)
        .attr("value", DEFAULT_VISIBLE_LINKDISTANCE)
        .attr("step", 10)
        .on("input", changeDistance);
    linkDistanceLiteralSlider = linkDistanceClassSlider;
};

var loadGraph = function loadGraphFunct() {
    var   height = 600
        , width = document.getElementById("example").offsetWidth;

    d3.json("js/data/" + jsonURI + ".json", function(error, data) {
        json = data;
        drawGraph(graphTag, width, height);
    });
};

var onload = function onloadFunct() {
    // Prevent multiple executions of the onload function
    if (onLoadCalled) {
        return;
    }
    onLoadCalled = true;
    loadGraph();
};
document.onload = onload();