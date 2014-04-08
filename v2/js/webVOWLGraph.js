"use strict";

/*jshint devel:true*/
/*global d3*/

/* ################ VARIABLES ################ */
var   GRAPH_WIDTH = window.innerWidth
    , GRAPH_HEIGHT = window.innerHeight
    , DEFAULT_VISIBLE_LINKDISTANCE = 160
    , visibleLinkDistance = DEFAULT_VISIBLE_LINKDISTANCE
    , visibleLiteralLinkDistance = DEFAULT_VISIBLE_LINKDISTANCE
    , CHARGE = -1000
    , LITERAL_HEIGHT = 20
    , LITERAL_WIDTH = 60
    , CLASS_RADIUS = 50
    , THING_RADIUS = 30
    , SPECIAL_OPERATIONS_RADIUS = 40
    , LABEL_HEIGHT = 28
    , LABEL_WIDTH = 80
    , ADDITIONAL_TEXT_SPACE = 4
    , CARDINALITY_HDISTANCE = 20
    , CARDINALITY_VDISTANCE = 10
    , SPACE_BETWEEN_SPANS = 12
    , force
    , svg
    , label
    , link
    , linkPath
    , cardinalities
    , node
    , json
    , lastFocusedNode
    , curveFunction = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        }).interpolate("cardinal")
    , loopFunction = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        }).interpolate("cardinal")
        .tension(-1)
    , zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", zoomed);


/* ################################ STARTING GRAPH ################################ */
function drawGraph(graphContainerElement, width, height) {
    /* ################ SVG CONTAINER ################ */
    var graphContainer = d3.select(graphContainerElement).attr("id", "graph");

    /* CUSTOMIZATION */
    if (width !== undefined) {
        GRAPH_WIDTH = width;
    }

    if (height !== undefined) {
        GRAPH_HEIGHT = height;
    }

    // Remove an existing graph
    graphContainer.select(".svgGraph").remove();

    svg = graphContainer
        .append("svg")
        .classed("svgGraph", true)
        .attr("width", GRAPH_WIDTH)
        .attr("height", GRAPH_HEIGHT)
        .call(zoom)
        .append("g");

    graphOptions();

    /* ################ FORCE LAYOUT ################ */

    /* Initialize fields */
    initialize();

    /* Creates the force layout with data from the json file */
    force = d3.layout.force()
        .charge(getCharge())
        .distance(getLinkDistance)
        .gravity(0.025)
        .linkStrength(0.7) // Flexibility of links
        .size([GRAPH_WIDTH, GRAPH_HEIGHT])
        .nodes(json.nodes)
        .links(json.links)
        .on("tick", tick)
        .start();

    /* Per-type markers, as they don't inherit styles */
    var defs = svg.append("defs");
    json.links.forEach(function (l, i) {
        l.id = i;
        if (!isSpecialLink(l)) {
            addMarker(defs, l, false);
            if (l.inverse) {
                addMarker(defs, l, true);
            }
        }
    });

    /* ################ LINKS ################ */

    /* Creates links groups */
    link = svg.selectAll(".link")
        .data(json.links)
        .enter().append("g")
        .attr("class", function (d) {
            return getMarkerId(d, true) + " " + getMarkerId(d, false);
        })
        .classed("link", true);
    /* Creates link paths */
    linkPath = link.append("path")
        .attr("class", function (d) {
            return d.type;
        })
        .classed("link-path", true)
        .attr("marker-end", function (l) {
            if (!isSpecialLink(l)) {
                return "url(#" + getMarkerId(l, false) + ")";
            }
            return "";
        })
        .attr("marker-start", function (l) {
            if (l.inverse && !isSpecialLink(l)) {
                return "url(#" + getMarkerId(l, true) + ")";
            }
            return "";
        });


    /* ################ LABELS ################ */

    /* Creates label groups */
    label = svg.selectAll(".label")
        .data(json.links)
        .enter().append("g")
        .classed("label", true);

    /* Exclude links without label */
    label = label.filter(function (d) {
        var needsLabel = d.valueTo || d.valueFrom;
        if (d.propertyTo === "disjoint") {
            needsLabel = true;
        }
        return needsLabel;
    });

    /* First only add single labels */
    label.filter(
        function (d) {
            return !d.inverse;
        }).each(function (d) {
            addLabel(d3.select(this), d, "to");
        });

    /* Then add double labels */
    label.filter(
        function (d) {
            return d.inverse;
        }).each(function (d) {
            addLabel(d3.select(this), d, "to");
            addLabel(d3.select(this), d, "from");
        });


    /* ############### CARDINALITIES ############### */

    cardinalities = svg.selectAll(".cardinality")
        .data(json.links).enter()
        .append("g").classed("cardinality", true);

    cardinalities = cardinalities.filter(function (l) {
        return l.cardTo || l.cardFrom;
    });

    cardinalities.filter(
        function (l) {
            return l.cardTo;
        }).each(function () {
            addCardinality(d3.select(this), "to");
        });

    cardinalities.filter(
        function (l) {
            return l.cardFrom;
        }).each(function () {
            addCardinality(d3.select(this), "from");
        });

    /* ################ NODES ################ */

    var drag = d3.behavior.drag()
        .on("dragstart", function (d) {
            d3.event.sourceEvent.stopPropagation(); // Prevent panning
            d.fixed = true;
        })
        .on("drag", function (d) {
            d.px = d3.event.x;
            d.py = d3.event.y;
            force.resume();
        })
        .on("dragend", function (d) {
            d.fixed = false;
        });

    /* Creates node groups */
    node = svg.selectAll(".node")
        .data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        /*.on("click", function (d) {
         if (d3.event.defaultPrevented) {
         return;
         } // ignore drag
         // First remove all children vom <div> box and afterwards add new information
         alert("Name: " + d.name + "\nType: " + d.type);
         })*/
        .on("mouseover", function(d){
           if(d.linkIDs){
               d.linkIDs.forEach(function(entry){
                   d3.select(link[0][entry]).select("path").classed("hovered", true);
               })
           }
        })
        .on("mouseout", function(d){
            if(d.linkIDs){
                d.linkIDs.forEach(function(entry){
                    d3.select(link[0][entry]).select("path").classed("hovered", false);
                })
            }
        })
        .call(drag);

// Adds the correct type to node.
    node.each(function (d) {
        var element = d3.select(this);
        switch (d.type) {
            case "class":
                addClass(element, d);
                break;
            case "thing":
                addThing(element, d);
                break;
            case "equivalent":
                addEquivalentClass(element, d);
                break;
            case "deprecated":
                addDeprecatedClass(element, d);
                break;
            case "external":
                addExternalClass(element, d);
                break;
            case "literal":
                addLiteral(element, d);
                break;
            case "datatype":
                addDatatype(element, d);
                break;
            case "rdfsClass":
                addRDFSClass(element, d);
                break;
            case "rdfsResource":
                addRDFSResource(element, d);
                break;
            case "intersection":
                addIntersectionClass(element, d);
                break;
            case "union":
                addUnionClass(element, d);
                break;
            case "complement":
                addComplementClass(element, d);
                break;
            default:
                console.log("PROBLEM DURING DRAWING CLASSES - UNKNOWN TYPE: " + d.type);
        }
    });

    /* ################ GET DETAILS ################ */
    getNodeInfo();
    getLinkInfo();
}

/* Calculates the new positions of the nodes and links */
var tick = function tickFunct() {

    linkPath.attr("d", function (l) {
        // Process self links in a separate function
        if (l.source === l.target) {
            return calculateSelfLinkPath(l);
        }

        // Calculate these every time to get nicer curved arrows
        var   pathStart = calculateIntersection(l.target, l.source, 1)
            , pathEnd = calculateIntersection(l.source, l.target, 1)
            , curvePoint = calculateCurvePoint(pathStart, pathEnd, l);
        l.curvePoint = curvePoint;

        return curveFunction([calculateIntersection(l.curvePoint, l.source, 1),
            curvePoint, calculateIntersection(l.curvePoint, l.target, 1)]);
    });

    node.attr("transform", function (node) {
        return "translate(" + node.x + "," + node.y + ")";
    });

    cardinalities.selectAll("g").attr("transform", function (l) {
        var   group = d3.select(this)
            , pos;
        if (group.classed("to")) {
            pos = calculateIntersection(l.curvePoint, l.source, CARDINALITY_HDISTANCE);
        } else {
            pos = calculateIntersection(l.curvePoint, l.target, CARDINALITY_HDISTANCE);
        }

        var n = calculateNormalVector(l.curvePoint, l.source, CARDINALITY_VDISTANCE);

        if (l.source.index < l.target.index) {
            n.x = -n.x;
            n.y = -n.y;
        }

        return "translate(" + (pos.x + n.x) + "," + (pos.y + n.y) + ")";
    });

    label.selectAll("g").attr("transform", function (l) {
        var   group = d3.select(this)
            , midX = l.curvePoint.x
            , midY = l.curvePoint.y;

        if (l.inverse) {
            if (group.classed("to")) {
                midY += (LABEL_HEIGHT / 2 + 1);
            } else if (group.classed("from")) {
                midY -= (LABEL_HEIGHT / 2 + 1);
            }
        }

        return "translate(" + midX + "," + midY + ")";
    });
};

/* ################ FUNCTIONS ################ */

/* Add String function to calculate the text field length */
String.prototype.width = function (textStyle) {
    // Set a default value
    if (!textStyle) {
        textStyle = "text";
    }
    var d = d3.select("body")
            .append("div")
            .attr("class", textStyle)
            .attr("id", "width-test") // tag this element to identify it
            .text(this),
        w = document.getElementById("width-test").offsetWidth;
    d.remove();
    return w;
};

/* Function to truncate a string */
String.prototype.truncate = function (maxLength, textStyle) {
    maxLength -= ADDITIONAL_TEXT_SPACE;
    if (isNaN(maxLength) || maxLength <= 0) {
        return this;
    }

    var   text = this
        , textLength = this.length
        , textWidth
        , ratio;

    while (true) {
        textWidth = text.width(textStyle);
        if (textWidth <= maxLength) {
            break;
        }

        ratio = textWidth / maxLength;
        textLength = Math.floor(textLength / ratio);
        text = text.substring(0, textLength);
    }

    if (this.length > textLength) {
        return this.substring(0, textLength - 3) + "...";
    }
    return this;
};

/* Checks whether the passed node is a special node */
var isSpecialLink = function isSpecialLinkFunct(link) {
    if (link.type === "special") {
        return true;
    }
    return false;
};

/* Reset zoom and pan properties */
var resetGraph = function resetGraphFunct() {
    zoom.translate([0, 0]).scale(1);
    svg.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    if (linkDistanceClassSlider !== undefined) {
        linkDistanceClassSlider.property("value", DEFAULT_VISIBLE_LINKDISTANCE);
    }
    if (linkDistanceLiteralSlider !== undefined) {
        linkDistanceLiteralSlider.property("value", DEFAULT_VISIBLE_LINKDISTANCE);
    }
    changeDistance();
    // also reset additional details displayed
    d3.select("#otherDetails").classed("hidden", true);
};

/* Initialize various fields */
var initialize = function initializeFunct() {
    for (var i = 0; i < json.nodes.length; i++) {
        var   node = json.nodes[i]
            , maxTextWidth
        	, radius;
        switch (node.type) {
            case "deprecated":
            case "external":
            case "equivalent":
            case "rdfsClass":
            case "class":
                radius = CLASS_RADIUS;
                maxTextWidth = 2 * CLASS_RADIUS;
                break;
            case "union":
            case "intersection":
            case "complement":
                radius = SPECIAL_OPERATIONS_RADIUS;
                break;
            case "rdfsResource":
            case "thing":
                radius = THING_RADIUS;
                maxTextWidth = 2 * THING_RADIUS;
                break;
            case "literal":
            case "datatype":
                node.height = LITERAL_HEIGHT;
                node.width = LITERAL_WIDTH;
                maxTextWidth = LITERAL_WIDTH;
                break;
        }
        node.maxTextWidth = maxTextWidth;
        node.radius = radius;
    }

    // Count multi edges and self links
    json.links.forEach(function (link) {
        var i = 0;
        // Don't count multiple times the same source-target combination
        if (isNaN(link.multiLinkCount)) {
            var sameLinks = [];

            // Search all links with the source and target
            json.links.forEach(function (otherLink) {
                if ((link.source === otherLink.source && link.target === otherLink.target) ||
                    (link.target === otherLink.source && link.source === otherLink.target)) {
                    sameLinks.push(otherLink);
                }
            });

            // Set the total amount and its index for every node
            for (i = 0; i < sameLinks.length; i++) {
                sameLinks[i].multiLinkCount = sameLinks.length;
                sameLinks[i].multiLinkIndex = i;
            }
        }

        if (isNaN(link.selfLinkCount)) {
            var selfLinks = [];

            json.links.forEach(function (otherLink) {
                if ((link.source === otherLink.source) && (link.target === otherLink.target)) {
                    selfLinks.push(otherLink);
                }
            });

            for (i = 0; i < selfLinks.length; i++) {
                selfLinks[i].selfLinkCount = selfLinks.length;
                selfLinks[i].selfLinkIndex = i;
            }
        }
    });

    refreshSlider();
};

/* Calculates the point where the link between the source and target node
 * intersects the border of the target node */
function calculateIntersection(source, target, additionalDistance) {
    var   dx = target.x - source.x
    	, dy = target.y - source.y
        , innerDistance = target.radius;

    if (target.type === "literal" ||
        target.type === "datatype") {
        var   m_link = Math.abs(dy / dx)
        	, m_rect = target.height / target.width;

        if (m_link <= m_rect) {
            var   timesX = dx / (target.width / 2)
            	, rectY = dy / timesX;
            innerDistance = Math.sqrt(Math.pow(target.width / 2, 2) + rectY * rectY);
        } else {
            var  timesY = dy / (target.height / 2)
            	, rectX = dx / timesY;
            innerDistance = Math.sqrt(Math.pow(target.height / 2, 2) + rectX * rectX);
        }
    }

    var   length = Math.sqrt(dx * dx + dy * dy)
    	, ratio = (length - (innerDistance + additionalDistance)) / length
    	, x = dx * ratio + source.x
    	, y = dy * ratio + source.y;

    return {x: x, y: y};
};

/* Adjusts the containers current scale and position */
function zoomed() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};

/* Calculate the visible link distance */
var calculateLinkDistance = function calculateLinkDistanceFunct(l, visibleLinkDistance) {
    var distance = visibleLinkDistance;
    distance += l.target.radius;
    distance += l.source.radius;
    return distance;
};

/* Returns the link distance of the passed link */
var getLinkDistance = function getLinkDistanceFunct(l) {
    // Differentiate between class and literal nodes
    if (l.source.type === "literal" || l.target.type === "literal" ||
        l.source.type === "datatype" || l.target.type === "datatype") {
        return calculateLinkDistance(l, visibleLiteralLinkDistance)
    } else {
        return calculateLinkDistance(l, visibleLinkDistance)
    }
};

/* Refreshs the slider */
var refreshSlider = function refreshSliderFunct() {
    if (linkDistanceClassSlider !== undefined) {
        linkDistanceClassSlider.property("value", visibleLinkDistance);
    }
    if (linkDistanceClassLabel !== undefined) {
        linkDistanceClassLabel.html(visibleLinkDistance);
    }
    if (linkDistanceLiteralSlider !== undefined) {
        linkDistanceLiteralSlider.property("value", visibleLiteralLinkDistance);
    }
    if (linkDistanceLiteralLabel !== undefined) {
        linkDistanceLiteralLabel.html(visibleLiteralLinkDistance);
    }
};

/* Change linkDistance and charge */
var changeDistance = function changeDistanceFunct() {
    // Convert newDistance to int
    visibleLinkDistance = +linkDistanceClassSlider.property("value");
    visibleLiteralLinkDistance = +linkDistanceLiteralSlider.property("value");

    // Adjust charge and restart force layout
    force.charge(getCharge());
    force.start();

    refreshSlider();
};

var getCharge = function getChargeFunct() {
    var   nodeCharge = (visibleLinkDistance / DEFAULT_VISIBLE_LINKDISTANCE) * CHARGE
    	, literalCharge = (visibleLiteralLinkDistance / DEFAULT_VISIBLE_LINKDISTANCE) * CHARGE;
    return Math.min(nodeCharge, literalCharge);
};

/* Calculates the normal vector between two points */
function calculateNormalVector(source, target, length) {
    var   dx = target.x - source.x
    	, dy = target.y - source.y

    	, nx = -dy
    	, ny = dx

    	, vlength = Math.sqrt(nx * nx + ny * ny)
    	, ratio = length / vlength;

    return {"x": nx * ratio, "y": ny * ratio};
};

/* Calculates a point between two points for curves */
function calculateCurvePoint(source, target, l) {
    var   distance = calculateMultiLinkDistance(l)

    // Find the center of the two points
    	, dx = target.x - source.x
    	, dy = target.y - source.y

    	, cx = source.x + dx / 2
    	, cy = source.y + dy / 2

    	, n = calculateNormalVector(source, target, distance);

    if (l.source.index < l.target.index) {
        n.x = -n.x;
        n.y = -n.y;
    }

    if (l.multiLinkIndex % 2 !== 0) {
        n.x = -n.x;
        n.y = -n.y;
    }

    return {"x": cx + n.x, "y": cy + n.y};
};

/* Calculate the optimal Multi Link distance */
function calculateMultiLinkDistance(l) {
    var   level = Math.floor((l.multiLinkIndex - l.multiLinkCount % 2) / 2) + 1
    	, oddConstant = (l.multiLinkCount % 2) * 15
    	, distance = 0;
    switch (level) {
        case 1:
            distance = 20 + oddConstant;
            break;
        case 2:
            distance = 45 + oddConstant;
            break;
    }
    return distance * (visibleLinkDistance / DEFAULT_VISIBLE_LINKDISTANCE);
};

/* Calculates the radian of an angle */
function calculateRadian(angle) {
    angle = angle % 360;
    if (angle < 0) {
        angle = angle + 360;
    }
    var arc = (2 * Math.PI * angle) / 360;
    if (arc < 0) {
        arc = arc + (2 * Math.PI);
    }
    return arc;
};

/* Calculates links to itself and stores the point for the labels. Currently only working for circle nodes! */
function calculateSelfLinkPath(l) {
    var   node = l.source

    	, loopShiftAngle = 360 / l.selfLinkCount
    	, loopAngle = Math.min(60, loopShiftAngle * 0.8)

    	, arcFrom = calculateRadian(loopShiftAngle * l.selfLinkIndex)
    	, arcTo = calculateRadian((loopShiftAngle * l.selfLinkIndex) + loopAngle)

    	, x1 = Math.cos(arcFrom) * node.radius
    	, y1 = Math.sin(arcFrom) * node.radius

    	, x2 = Math.cos(arcTo) * node.radius
    	, y2 = Math.sin(arcTo) * node.radius

    	, fixPoint1 = {"x": node.x + x1, "y": node.y + y1}
    	, fixPoint2 = {"x": node.x + x2, "y": node.y + y2}

    	, distanceMultiplier = 2.5
    	, dx = ((x1 + x2) / 2) * distanceMultiplier
    	, dy = ((y1 + y2) / 2) * distanceMultiplier
    	, curvePoint = {"x": node.x + dx, "y": node.y + dy};
    l.curvePoint = curvePoint;

    return loopFunction([fixPoint1, curvePoint, fixPoint2]);
};

/* ################ MARKERS ################ */

/* Returns an id to get the marker to the matching link */
function getMarkerId(l, inverse) {
    return (l.type ? l.type : "normal") + l.id + (inverse ? "inverse" : "");
};

/* Function that adds markers according to the used links */
function addMarker(defs, link, inverse) {
    defs.append("marker")
        .attr("id", getMarkerId(link, inverse))
        .attr("viewBox", "0 -8 14 16")
        .attr("refX", inverse ? 0 : 12)
        .attr("refY", 0)
        .attr("markerWidth", 12)  // ArrowSize
        .attr("markerHeight", 12)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")  // Orientation of Arrow
        .attr("class", (link.type ? link.type : "normal") + "Marker")
        .append("path")
        .attr("d", function () {
            return inverse ? "M12,-8L0,0L12,8Z" : "M0,-8L12,0L0,8Z";
        });
};

/* Methods to create hover effect for the specification */
function labelMouseOver(tag) {
    d3.selectAll("marker#" + tag)
        .select("path")
        .classed("hovered", true);

    d3.selectAll("." + tag)
        .selectAll("path, text")
        .classed("hovered", true);
};
function labelMouseOut(tag) {
    d3.selectAll("marker#" + tag)
        .select("path")
        .classed("hovered", false);

    d3.selectAll("." + tag)
        .selectAll("path, text")
        .classed("hovered", false);
};
function indirectHighlightOn(tag) {
    d3.selectAll("." + tag)
        .selectAll("rect")
        .classed("indirectHighlighting", true);
};
function indirectHighlightOff(tag) {
    d3.selectAll("." + tag)
        .selectAll("rect")
        .classed("indirectHighlighting", false);
};

/* Highlights the marker and link for the given label and direction */
function labelMouseEnter(linkData, direction) {
    var inverse = direction === "from";

    d3.selectAll("marker#" + getMarkerId(linkData, inverse))
        .select("path").classed("hovered", true);

    d3.selectAll("." + getMarkerId(linkData, inverse))
        .selectAll("path, text")
        .classed("hovered", true);

    svg.selectAll(".label").sort(function (a, b) { // select the parent and sort the path's
        if (a.id === linkData.id && b.id !== linkData.id) {
            return 1; // a is hovered
        } else if (a.id !== linkData.id && b.id === linkData.id) {
            return -1; // b is hovered
        } else {
            // workaround to make sorting in chrome for these elements stable
            return a.id - b.id; // compare unique values
        }
    });
};

/* Removes highlighting of marker and link for the given label and direction */
function labelMouseLeave(linkData, direction) {
    var inverse = direction === "from";
    d3.selectAll("marker#" + getMarkerId(linkData, inverse))
        .select("path").classed("hovered", false);

    d3.selectAll("." + getMarkerId(linkData, inverse))
        .selectAll("path, text").classed("hovered", false);
};

/* Function to add rectangles as label background */
function addLabelRect(label, data, direction) {
    label.append("rect")
        .attr("class", function () {
            var property = data.propertyTo;
            if (direction === "from") {
                property = data.propertyFrom;
            }
            return (property ? property : "object");
        })
        .classed("property", true)
        .attr("x", -LABEL_WIDTH / 2)
        .attr("y", -LABEL_HEIGHT / 2)
        .attr("width", LABEL_WIDTH)
        .attr("height", LABEL_HEIGHT)
        .on("mouseenter", function (linkData) {
            labelMouseEnter(linkData, direction);
            highlightSubproperties(linkData, direction, true);
        })
        .on("mouseleave", function (linkData) {
            labelMouseLeave(linkData, direction);
            highlightSubproperties(linkData, direction, false);
        });
};

/* Add the label to a link in the given direction */
function addLabel(link, data, direction) {
    var label = link.append("g")
        .attr("id", "label" + data.id + direction)
        .classed(direction, true);

    addLabelRect(label, data, direction);
    if (data.propertyTo === "disjoint") {
        addDisjointLabel(label);
        return;
    }
    var labelText = label.append("text")
        .classed("text", true)
        .attr("text-anchor", "middle");


    addLabelText(labelText, data, direction);
    addPropertyToLabel(labelText, data, direction);
    addSubPropertyLabel(labelText, data, direction);
};

/* Adds a new <tspan> to the label */
function addLabelText(element, d, direction) {
    element.append("tspan")
        .attr("class", function () {
            // If no type in any direction default class "text"
            var classConst = "";

            if (d.typeTo !== undefined || d.typeFrom !== undefined) {
                classConst = classConst.concat("mainText");
            } else {
                classConst = classConst.concat("text");
            }

            /* Adds additional classes according to the properties. */
            switch(d.propertyTo){
                case "external":
                    classConst = classConst.concat(" white");
                    return classConst;
                default:
            }

            switch(d.propertyFrom){
                case "external":
                    classConst = classConst.concat(" white");
                    return classConst;
                default:
            }

            return classConst;
        })
        .text(function () {
            var value;
            if (direction === "to") {
                value = d.valueTo;
            } else if (direction === "from") {
                value = d.valueFrom;
            } else {
                value = d.valueTo ? d.valueTo : d.valueFrom;
            }
            return value.toString().truncate(LABEL_WIDTH);
        });
};

/* Adds a new <tspan> to the existing <text> in the label position */
function addPropertyToLabel(label, d, direction) {
    var property;
    if (direction === "to") {
        if (!d.typeTo) {
            return;
        }
        property = d.typeTo;
    } else if (direction === "from") {
        if (!d.typeFrom) {
            return;
        }
        property = d.typeFrom;
    } else {
        var anyProperty = d.typeTo ? d.typeTo : d.typeFrom;
        if (anyProperty) {
            property = anyProperty;
        } else {
            return;
        }
    }

    // Insert the brackets at the beginning for receiving the correct length
    var trimmedPropertyText = ")(" + property.toString().truncate(LABEL_WIDTH, "subtext");
    label.append("tspan")
        .attr("x", 0).attr("y", 9)
        .attr("class", "subtext")
        .text("(" + trimmedPropertyText.substr(2) + ")");
};

/* Adds a new <tspan> to the existing <text> in the label position */
function addSubPropertyLabel(label, d, direction) {
    var subProperty;
    if (direction === "to") {
        if (!d.equivPropTo) {
            return;
        }
        subProperty = d.equivPropTo;
    } else if (direction === "from") {
        if (!d.subPropFrom) {
            return;
        }
        subProperty = d.subPropFrom;
    } else {
        var anyProperty = d.equivPropTo ? d.equivPropTo : d.subPropFrom;
        if (anyProperty) {
            subProperty = anyProperty;
        } else {
            return;
        }
    }

    // Insert the brackets at the beginning for receiving the correct length
    var trimmedPropertyText = "][" + subProperty.toString().truncate(LABEL_WIDTH, "subtext");
    label.append("tspan")
        .attr("x", 0).attr("y", 9)
        .attr("class", "subtext")
        .text("[" + trimmedPropertyText.substr(2) + "]");
};

function addDisjointLabel(label) {
    label.append("circle")
        .classed("symbol", true)
        .classed("fineline", true)
        .attr("cx", -12.5)
        .attr("r", 10);
    label.append("circle")
        .classed("symbol", true)
        .classed("fineline", true)
        .attr("cx", 12.5)
        .attr("r", 10);

    var text = label.append("text")
        .classed("text", true)
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0,20)");
    text.append("tspan")
        .classed("subtext", true)
        .text("(disjoint)");
};

function addCardinality(link, direction) {
    var card = link.append("g")
        .attr("class", function (l) {
            return getMarkerId(l, direction === "to");
        })
        .classed(direction, true);


    card.append("text")
        .classed("cardinality", true)
        .attr("text-anchor", "middle")
        .text(function (d) {
            return direction === "to" ? d.cardTo : d.cardFrom;
        });
};

/* Adds a new line of text to the element. */
function addTextline(element, word, additionalClass) {
    if (element === undefined || word === undefined) {
        return;
    }
    element.append("tspan")
        .attr("class", additionalClass)
        .classed("text", true)
        .attr("x", 0)
        .attr("y",function () {
            return (element.property("childNodes").length - 1) * SPACE_BETWEEN_SPANS;
        }).text(word);
}

/* Adds a new line of text to the element. */
function addSubTextNode(element, word, additionalClass) {
    if (element === undefined || word === undefined) {
        return;
    }
    element.append("tspan")
        .attr("class", additionalClass)
        .classed("text", true)
        .classed("subtext", true)
        .attr("x", 0)
        .attr("y",function () {
            return (element.property("childNodes").length - 1) * SPACE_BETWEEN_SPANS;
        }).text(word);
};

/*Adds <text> block to element. */
function addTextBlock(element) {
    element.append("text")
        .classed("text", true)
        .attr("text-anchor", "middle");
};

/* Adds new literal. */
function addLiteral(element, data) {
    if (element === undefined) {
        return;
    }

    if (data !== undefined) {
        element.append("rect")
            .attr("class", data.type)
            .classed("class", true)
            .classed("special", true)
            .attr("x", -LITERAL_WIDTH / 2)
            .attr("y", -LITERAL_HEIGHT / 2)
            .attr("width", LITERAL_WIDTH)
            .attr("height", LITERAL_HEIGHT);
    } else {
        element.append("rect")
            .attr("class", "literal")
            .classed("class", true)
            .attr("x", -LITERAL_WIDTH / 2)
            .attr("y", -LITERAL_HEIGHT / 2)
            .attr("width", LITERAL_WIDTH)
            .attr("height", LITERAL_HEIGHT);
    }

    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth));
    } else {
        addTextline(element.select("text"), "Literal");
    }
};

/* Adds new literal. */
function addDatatype(element, data) {
    if (element === undefined) {
        return;
    }

    if (data !== undefined) {
        element.append("rect")
            .attr("class", data.type)
            .classed("class", true)
            .attr("x", -LITERAL_WIDTH / 2)
            .attr("y", -LITERAL_HEIGHT / 2)
            .attr("width", LITERAL_WIDTH)
            .attr("height", LITERAL_HEIGHT);
    } else {
        element.append("rect")
            .attr("class", "datatype")
            .classed("class", true)
            .attr("x", -LITERAL_WIDTH / 2)
            .attr("y", -LITERAL_HEIGHT / 2)
            .attr("width", LITERAL_WIDTH)
            .attr("height", LITERAL_HEIGHT);
    }

    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth));
    } else {
        addTextline(element.select("text"), "Datatype");
    }
};

/* Appends thing node. */
function addThing(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", "class")
            .classed("white", true)
            .classed("special", true)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "class")
            .classed("white", true)
            .classed("special", true)
            .attr("r", THING_RADIUS);
    }
    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth));
    } else {
        addTextline(element.select("text"), "Thing");
    }
};

/* Appends rdfs:Resource node. */
function addRDFSResource(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", "class")
            .classed("rdf", true)
            .classed("special", true)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "class")
            .classed("rdf", true)
            .classed("special", true)
            .attr("r", THING_RADIUS);
    }
    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth));
    } else {
        addTextline(element.select("text"), "Resource");
    }
};

/* Appends class node. */
function addClass(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", data.type)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "class")
            .attr("r", CLASS_RADIUS);
    }
    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth));
    } else {
        addTextline(element.select("text"), "Class");
    }
};

/* Appends rdfs:class node. */
function addRDFSClass(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", "class")
            .classed("rdf", true)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "rdf")
            .classed("rdf", true)
            .attr("r", CLASS_RADIUS);
    }
    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth));
    } else {
        addTextline(element.select("text"), "Class");
    }
};


/* Appends equivalentClass node. */
function addEquivalentClass(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", "class white embedded")
            .attr("r", data.radius);
        element.append("circle")
            .attr("class", "class")
            .attr("r", function () {
                return data.radius - 4;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "class")
            .attr("r", CLASS_RADIUS - 4);

        element.append("circle")
            .attr("class", "link")
            .attr("r", CLASS_RADIUS);
    }
    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth));

        var   equivNames = data.equivalentClasses.map(function(node) {return node.name;})
            , equivNamesString = equivNames.join(", ");
        addSubTextNode(element.select("text"), "[" + equivNamesString.truncate(data.maxTextWidth) + "]");
    } else {
        addTextline(element.select("text"), "EquivalentClass");
    }

    // Center the complete textblock.
    var rePositiony = (element.select("text").property("childElementCount") - 1) * SPACE_BETWEEN_SPANS / 2;
    element.select("text").attr("transform", function () {
        return "translate(0,-" + rePositiony + ")";
    });
};

/* Appends externalClass node.*/
function addExternalClass(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", data.type)
            .classed("class", true)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "external")
            .classed("class", true)
            .attr("r", CLASS_RADIUS);
    }
    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth), "white");
    } else {
        addTextline(element.select("text"), "External", "white");
    }
    addSubTextNode(element.select("text"), "(external)", "white");

    // Center the complete textblock.
    var rePositiony = (element.select("text").property("childElementCount") - 1) * SPACE_BETWEEN_SPANS / 2;
    element.select("text").attr("transform", function () {
        return "translate(0,-" + rePositiony + ")";
    });
};

/* Appends deprecatedClass node.*/
function addDeprecatedClass(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", data.type)
            .classed("class", true)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "deprecated")
            .classed("class", true)
            .attr("r", CLASS_RADIUS);
    }
    // Adds text
    addTextBlock(element);
    if (data !== undefined) {
        addTextline(element.select("text"), data.name.truncate(data.maxTextWidth));
    } else {
        addTextline(element.select("text"), "Deprecated");
    }
    addSubTextNode(element.select("text"), "(deprecated)");

    // Center the complete textblock.
    var rePositiony = (element.select("text").property("childElementCount") - 1) * SPACE_BETWEEN_SPANS / 2;
    element.select("text").attr("transform", function () {
        return "translate(0,-" + rePositiony + ")";
    });
};

/* Appends intersectionClass node.*/
function addIntersectionClass(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", data.type)
            .classed("class", true)
            .classed("special", true)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "intersection")
            .classed("class", true)
            .classed("special", true)
            .attr("r", SPECIAL_OPERATIONS_RADIUS);
    }
    var symbol = element.append("g").classed("embedded", true);

    symbol.append("path")
        .attr("class", "nostroke")
        .classed("symbol", true).attr("d", "m 24.777,0.771 c0,16.387-13.607,23.435-19.191,23.832S-15.467,14.526-15.467,0.424S-1.216-24.4,5.437-24.4 C12.09-24.4,24.777-15.616,24.777,0.771z");
    symbol.append("circle")
        .attr("class", "nofill")
        .classed("fineline", true)
        .attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
    symbol.append("circle")
        .attr("cx", 10)
        .attr("class", "nofill")
        .classed("fineline", true)
        .attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
    symbol.append("path")
        .attr("class", "nofill")
        .attr("d", "m 9,5 c 0,-2 0,-4 0,-6 0,0 0,0 0,0 0,0 0,-1.8 -1,-2.3 -0.7,-0.6 -1.7,-0.8 -2.9,-0.8 -1.2,0 -2,0 -3,0.8 -0.7,0.5 -1,1.4 -1,2.3 0,2 0,4 0,6");
    symbol.attr("transform", "translate(-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 5 + ",-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 100 + ")");
};

/* Appends unionClass node.*/
function addUnionClass(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", data.type)
            .classed("class", true)
            .classed("special", true)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "union")
            .classed("class", true)
            .classed("special", true)
            .attr("r", SPECIAL_OPERATIONS_RADIUS);
    }
    var symbol = element.append("g")
        .classed("embedded", true);

    symbol.append("circle")
        .attr("class", "symbol")
        .attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
    symbol.append("circle")
        .attr("cx", 10)
        .attr("class", "symbol")
        .classed("fineline", true)
        .attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
    symbol.append("circle")
        .attr("class", "nofill")
        .classed("fineline", true)
        .attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
    symbol.append("path")
        .attr("class", "link")
        .attr("d", "m 1,-3 c 0,2 0,4 0,6 0,0 0,0 0,0 0,2 2,3 4,3 2,0 4,-1 4,-3 0,-2 0,-4 0,-6");
    symbol.attr("transform", "translate(-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 5 + ",-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 100 + ")");
};

/* Appends complementClass node.*/
function addComplementClass(element, data) {
    if (element === undefined) {
        return;
    }

    // If element has data, normally in the force-directed graph.
    if (data !== undefined) {
        element.append("circle")
            .attr("class", data.type)
            .classed("class", true)
            .classed("special", true)
            .attr("r", function () {
                return data.radius;
            });
    }
    // If no data exists, justs to make a prototype without functions.
    else {
        element.append("circle")
            .attr("class", "complement")
            .classed("class", true)
            .classed("special", true)
            .attr("r", SPECIAL_OPERATIONS_RADIUS);
    }
    var symbol = element.append("g").classed("embedded", true);

    symbol.append("circle")
        .attr("class", "symbol")
        .classed("fineline", true)
        .attr("r", (SPECIAL_OPERATIONS_RADIUS - 15));
    symbol.append("path")
        .attr("class", "nofill")
        .attr("d", "m -7,-1.5 12,0 0,6");
    symbol.attr("transform", "translate(-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 100 + ",-" + (SPECIAL_OPERATIONS_RADIUS - 15) / 100 + ")");
};

/* Returns the type of the selected element, either node or label. */
var getKindOfElement = function getKindOfElementFunct(element) {
    if (element.classed("node")) {
        return "node";
    }

    var theParent = element.node().parentNode;
    if (theParent !== undefined && d3.select(theParent).classed("label")) {
        return "label";
    }

    return undefined;
};

/* Toggles the highlighting of the given node. */
var toggleNodeFocus = function toggleNodeFocusFunct(node) {
    var   firstChildElement = node.select("*")
    	, hasFocusClass = firstChildElement.classed("focused");

    if (hasFocusClass) {
        firstChildElement.classed("focused", false);
    } else {
        firstChildElement.classed("focused", true);
    }
};

/* Toggles the highlighting of the given label. */
var toggleLabelFocus = function toggleLabelFocusFunct(labelToHigh) {
    var   inverse = labelToHigh.classed("from")
    	, rectOfNode = labelToHigh.select("rect")
    	, notHasFocusClass = !rectOfNode.classed("focused");

    rectOfNode.classed("focused", notHasFocusClass);

    d3.selectAll("marker#" + getMarkerId(labelToHigh.datum(), inverse))
        .select("path").classed("focused", notHasFocusClass);

    d3.selectAll("." + getMarkerId(labelToHigh.datum(), inverse))
        .selectAll("path, text")
        .classed("focused", notHasFocusClass);
};

/* Sets focus on the clicked element. */
var focusOnElement = function focusOnElementFunct(element) {
    var   lastFocusedElement
        , currentNode = element.node();

    // Remove highlighting of last element if exists.
    if (lastFocusedNode !== undefined) {
        lastFocusedElement = d3.select(lastFocusedNode);
        var kindOfLastElement = getKindOfElement(lastFocusedElement);

        if (kindOfLastElement === "node") {
            toggleNodeFocus(lastFocusedElement);
        } else if (kindOfLastElement === "label") {
            toggleLabelFocus(lastFocusedElement);
        }
    }

    // If the same element was clicked before, not highlighting again.
    if (lastFocusedNode === currentNode) {
        hideInfoField();
        lastFocusedNode = undefined;
        return;
    }
    lastFocusedNode = currentNode;

    var kindOfThisElement = getKindOfElement(element);

    if (kindOfThisElement === "node") {
        toggleNodeFocus(element);
    } else if (kindOfThisElement === "label") {
        toggleLabelFocus(element);
    }
};

var getNodeInfo = function getNodeInfoFunct() {
    var node = svg.selectAll(".node")
        .on("click", function(d)
        {
            d3.select("#otherDetails").classed("hidden", false);
            d3.select("#class").classed("hidden", false);
            d3.select("#prop").classed("hidden", true);

            setUriLabel(d3.select("#name"), d.name, d.uri);

            var equivUriSpan = d3.select("#classEquivUri");
            
            if (equivUriSpan.node() === null) {
                /*
                    Do absolutely nothing -- this is for specVOWL.js
                    Otherwise typeError null
                */
            } else {
                var equivUriSpanParent = d3.select(equivUriSpan.node().parentNode);
                if (d.equivalentClasses !== undefined) {
                    listUriLabels(equivUriSpan, d.equivalentClasses);
                    equivUriSpanParent.classed("hidden", false);
                } else {
                    equivUriSpanParent.classed("hidden", true);
                }
            }
            d3.select("#typeNode").text(getTypeNode(d.type));

            var disjointNodes = d3.select("#disjointNodes");
            if (equivUriSpan.node() === null) {
                /*
                    Do absolutely nothing -- this is for specVOWL.js
                    Otherwise typeError null
                */
            } else {
                var disjointNodesParent = d3.select(disjointNodes.node().parentNode);
                if (d.disjoints !== undefined) {
                    listUriLabels(disjointNodes, d.disjoints);
                    disjointNodesParent.classed("hidden", false);
                } else {
                    disjointNodesParent.classed("hidden", true);
                }
            }

            focusOnElement(d3.select(this));
        });
};

/* Sets a listing of uri labels of the passed array of nodes */
var listUriLabels = function listUriLabelsFunct(element, nodes) {
    element.selectAll("*").remove();
    nodes.forEach(function (node, index) {
        if (index > 0) {
            element.append("span").text(", ");
        }
        appendUriLabel(element, node.name, node.uri);
    });
};

/* Removes all existing child elements and appends an uri label */
var setUriLabel = function setUriLabelFunct(element, name, uri) {
    element.selectAll("*").remove();
    appendUriLabel(element, name, uri)
};

/* Appends a field containing the name and if existing a hyperlink to the set uri */
var appendUriLabel = function appendUriLabelFunct(element, name, uri) {
    var tag;
    if (uri) {
        tag = element.append("a").attr("href", uri);
    } else {
        tag = element.append("span");
    }
    tag.text(name);
};

var getTypeNode = function(type) {
    switch(type) {
        case "class":
            return "OWL Class";
        case "thing":
            return "Thing";
        case "external":
            return "External Class";
        case "equivalent":
            return "Equivalent Class";
        case "deprecated":
            return "Deprecated Class";
        case "rdfsClass":
            return "RDFS Class";
        case "rdfsResource":
            return "RDFS Resource";
        case "literal":
            return "Literal";
        case "datatype":
            return "Datatype";
        case "union":
            return "Union Of";
        case "intersection":
            return "Intersection Of";
        case "complement":
            return "Complement Of";
    }
};

var getTypeLink = function(type) {
    switch(type) {
        case "object":
            return "Object Property";
        case "datatype":
            return "Datatype Property";
        case "rdf":
            return "RDF Property";
        case "deprecated":
            return "Deprecated Property";
        case "external":
            return "External Property";
        case "disjoint":
            return "Disjoint With";
        case "subclass":
            return "Subclass of";
        default:
            return "Object Property";
    }
};

var getLinkInfo = function getLinkInfoFunct() {
    /* We have to separate "from" labels by their class, because the stored data
       is the data of the link which is identical in both directions */
    svg.selectAll(".label .from")
        .on("click", function(l)
        {
            hideNodeInfoFields();
            setUriLabel(d3.select("#propname"), l.valueFrom, l.uriFrom);
            d3.select("#typeProp").text(getTypeLink(l.propertyFrom));

            if (l.inverse === true) {
                d3.select("#inverse").style("display","block");
                setUriLabel(d3.select("#inverse span"), l.valueTo, l.uriTo);
            } else {
                d3.select("#inverse").style("display","none");
            }
            if (l.cardTo !== undefined) {
                d3.select("#minCardinality").style("display","block");
                d3.select("#minCardinality span").text(l.cardFrom);
            } else {
                d3.select("#minCardinality").style("display","none");
            }
            if (l.cardFrom !== undefined) {
                d3.select("#maxCardinality").style("display","block");
                d3.select("#maxCardinality span").text(l.cardTo);
            } else {
                d3.select("#maxCardinality").style("display","none");
            }
            //d3.select("#inverse").text(l.valueTo);
            setUriLabel(d3.select("#domain"), l.target.name, l.target.uri);
            setUriLabel(d3.select("#range"), l.source.name, l.source.uri);

            focusOnElement(d3.select(this));
        });

    svg.selectAll(".label .to")
        .on("click", function(l)
        {
            hideNodeInfoFields();
            setUriLabel(d3.select("#propname"), l.valueTo, l.uriTo);
            d3.select("#typeProp").text(getTypeLink(l.propertyTo));

            if (l.inverse === true) {
                d3.select("#inverse").style("display","block");
                setUriLabel(d3.select("#inverse span"), l.valueFrom, l.uriFrom);
            } else {
                d3.select("#inverse").style("display","none");
            }
            if (l.cardTo !== undefined) {
                d3.select("#minCardinality").style("display","block");
                d3.select("#minCardinality span").text(l.cardTo);
            } else {
                d3.select("#minCardinality").style("display","none");
            }
            if (l.cardFrom !== undefined) {
                d3.select("#maxCardinality").style("display","block");
                d3.select("#maxCardinality span").text(l.cardFrom);
            } else {
                d3.select("#maxCardinality").style("display","none");
            }

            setUriLabel(d3.select("#domain"), l.source.name, l.source.uri);
            setUriLabel(d3.select("#range"), l.target.name, l.target.uri);

            focusOnElement(d3.select(this));
        });
};

/* Highlights related subproperties if they are set */
var highlightSubproperties = function highlightSubpropertiesFunct(link, direction, classed) {
    var subproperties = link.subpropertiesTo;

    if (direction === "from") {
        subproperties = link.subpropertiesFrom;
    }

    if (subproperties === undefined) {
        return;
    }

    subproperties.forEach(function(l) {
        d3.select("#label" + l.id + (l.direction ? l.direction : "to"))
            .select("rect")
            .classed("indirectHighlighting", classed);
    });
};

var hideNodeInfoFields = function hideNodeInfoFieldsFunct() {
    d3.select("#otherDetails").classed("hidden", false);
    d3.select("#prop").classed("hidden", false);
    d3.select("#class").classed("hidden", true);
};

var hideInfoField = function hideNodeInfoFieldsFunct() {
    d3.select("#otherDetails").classed("hidden", true);
};

function refreshOntology(jsonFile) {
    clearCanvas();
    jsonURI = jsonFile;
    loadGraph();
};

var clearCanvas = function clearCanvasFunct() {
    var   graphTag = document.getElementById('graph')
        , svg = graphTag.getElementsByTagName("svg")[0];
    d3.select(svg).remove();
    d3.select(reset).remove();
    d3.selectAll(".slideOption > *").remove();
    hideInfoField();
    zoom.translate([0, 0]).scale(1);
};