
module.exports =  function (graph) {
    /** variable defs **/
    var Domain_dragger={};
    Domain_dragger.nodeId = 10002;
    Domain_dragger.parent = undefined;
    Domain_dragger.x = 0;
    Domain_dragger.y = 0;
    Domain_dragger.rootElement = undefined;
    Domain_dragger.rootNodeLayer = undefined;
    Domain_dragger.pathLayer=undefined;
    Domain_dragger.mouseEnteredVar = false;
    Domain_dragger.mouseButtonPressed = false;
    Domain_dragger.nodeElement = undefined;
    Domain_dragger.draggerObject= undefined;

    Domain_dragger.pathElement = undefined;
    Domain_dragger.typus = "Domain_dragger";

    Domain_dragger.type = function () {
            return Domain_dragger.typus;
    };


    // TODO: We need the endPoint of the Link here!
    Domain_dragger.parentNode = function () {
            return Domain_dragger.parent;
    };

    Domain_dragger.hide_dragger=function(val){
        Domain_dragger.pathElement.classed("hidden",val);
        Domain_dragger.nodeElement.classed("hidden",val);
        Domain_dragger.draggerObject.classed("hidden",val);
    };

    Domain_dragger.reDrawEverthing=function(){
        Domain_dragger.setParentProperty(Domain_dragger.parent);
    };
    Domain_dragger.updateDomain=function(newDomain){
        Domain_dragger.parent.domain(newDomain);
    };

    Domain_dragger.setParentProperty = function (parentProperty) {
        Domain_dragger.parent = parentProperty;

        // get link range intersection;


        var iP=parentProperty.labelObject().linkDomainIntersection;

        Domain_dragger.x = iP.x;
        Domain_dragger.y = iP.y;

        Domain_dragger.updateElement();
    };

    Domain_dragger.hideDragger=function(val){
        Domain_dragger.pathElement.classed("hidden",val);
        Domain_dragger.nodeElement.classed("hidden",val);
        Domain_dragger.draggerObject.classed("hidden",val);


    };
    /** BASE HANDLING FUNCTIONS ------------------------------------------------- **/
    Domain_dragger.id = function (index) {
        if (!arguments.length) {
            return Domain_dragger.nodeId;
        }
        Domain_dragger.nodeId = index;
    };

    Domain_dragger.svgPathLayer=function(layer){
        Domain_dragger.pathLayer= layer.append('g');
    };

    Domain_dragger.svgRoot = function (root) {
        if (!arguments.length)
            return Domain_dragger.rootElement;
        Domain_dragger.rootElement = root;
        Domain_dragger.rootNodeLayer = Domain_dragger.rootElement.append('g');
        Domain_dragger.addMouseEvents();
    };

    /** DRAWING FUNCTIONS ------------------------------------------------- **/
    Domain_dragger.drawNode = function () {
            Domain_dragger.pathElement = Domain_dragger.pathLayer.append('line')
                .classed("classNodeDragPath", true);
            Domain_dragger.pathElement.attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", 0);

            //TODO : MAKE BETTER VISUSAL ELEMET

            var pathData="M 23.373417,20.387873 C 13.136963,7.8080757 13.226248,-7.1983946 23.462702,-19.778192 c 0,0 -7.160003,9.706399 -14.6176657,16.2584803 -4.3321873,3.8061316 -8.50241083,3.64598079 -8.50241083,3.64598079 0,0 5.03041503,-0.36689716 8.51278743,2.95595121 C 13.842494,7.8408476 23.373417,20.387873 23.373417,20.387873 Z";
            pathData="m 7.0847073,19.756528 c -10.236454,-12.5797976 -10.147169,-27.5862679 0.089285,-40.166065 0,0 -22.7816793,24.0830515 -19.9525333,17.9315451 1.647481,-3.5821733 -10.175476,2.38553353 -10.175476,2.38553353 0,0 12.785263,7.07904217 10.204344,2.01265027 -1.81993,-3.5725547 19.8343803,17.8363361 19.8343803,17.8363361 z";
            pathData="M -0.15224119,19.50399 C -10.388695,6.9241923 -10.433339,-8.0376351 -0.19688479,-20.617432 c 0,0 -21.21917921,21.09197977 -18.39003321,14.9404734 1.647481,-3.5821732 -10.175476,5.3319621 -10.175476,5.3319621 0,0 12.651335,10.0701136 10.070416,5.0037217 C -20.511908,1.0861705 -0.15224119,19.50399 -0.15224119,19.50399 Z"
            Domain_dragger.nodeElement =Domain_dragger.rootNodeLayer.append('path').attr("d", pathData);
            Domain_dragger.nodeElement.classed("classDraggerNode",true);
            Domain_dragger.draggerObject=Domain_dragger.rootNodeLayer.append("circle");
            Domain_dragger.draggerObject.attr("r", 40)
                .attr("cx", 0)
                .attr("cy", 0)
                .classed("superHiddenElement",true)
                .append("title").text("Add Touch Object Property");



    };
    Domain_dragger.updateElementViaRangeDragger=function(x,y){
        var range_x=x;
        var range_y=y;

        var dex=Domain_dragger.parent.domain().x;
        var dey=Domain_dragger.parent.domain().y;

        var dir_X= x-dex;
        var dir_Y= y-dey;

        var len=Math.sqrt(dir_X*dir_X+dir_Y*dir_Y);

        var nX=dir_X/len;
        var nY=dir_Y/len;


        var ep_range_x=dex+nX*Domain_dragger.parent.domain().actualRadius();
        var ep_range_y=dey+nY*Domain_dragger.parent.domain().actualRadius();

        var angle = Math.atan2(ep_range_y-range_y  , ep_range_x-range_x ) * 180 / Math.PI ;
        Domain_dragger.nodeElement.attr("transform","translate(" + ep_range_x  + "," + ep_range_y  + ")"+"rotate(" + angle + ")");
    };


    Domain_dragger.updateElement = function (isLoop) {
        // TODO : Loop DOMAIN RANGE ELEMENTSs
        if (Domain_dragger.mouseButtonPressed===true || Domain_dragger.parent===undefined) return;

        var range_x=Domain_dragger.parent.domain().x;
        var range_y=Domain_dragger.parent.domain().y;



        var ep_range_x=Domain_dragger.parent.labelObject().linkDomainIntersection.x;
        var ep_range_y=Domain_dragger.parent.labelObject().linkDomainIntersection.y;

        var angle = Math.atan2(ep_range_y-range_y  , ep_range_x-range_x ) * 180 / Math.PI +180;
        Domain_dragger.nodeElement.attr("transform","translate(" + ep_range_x  + "," + ep_range_y  + ")"+"rotate(" + angle + ")");
    };

        /** MOUSE HANDLING FUNCTIONS ------------------------------------------------- **/

        Domain_dragger.addMouseEvents = function () {
            var rootLayer=Domain_dragger.rootNodeLayer.selectAll("*");
            rootLayer.on("mouseover", Domain_dragger.onMouseOver)
                .on("mouseout", Domain_dragger.onMouseOut)
                 .on("click", function(){
                 })
                 .on("dblclick", function(){
                 })
                .on("mousedown", Domain_dragger.mouseDown)
                .on("mouseup", Domain_dragger.mouseUp);
        };

        Domain_dragger.mouseDown = function () {
            Domain_dragger.nodeElement.style("cursor", "move");
            Domain_dragger.nodeElement.classed("classDraggerNodeHovered", true);
            Domain_dragger.mouseButtonPressed = true;
        };

        Domain_dragger.mouseUp = function () {
            Domain_dragger.nodeElement.style("cursor", "auto");
            Domain_dragger.nodeElement.classed("classDraggerNodeHovered", false);
            Domain_dragger.mouseButtonPressed = false;
        };


        Domain_dragger.mouseEntered = function (p) {
            if (!arguments.length) return Domain_dragger.mouseEnteredVar;
            Domain_dragger.mouseEnteredVar = p;
            return Domain_dragger;
        };

        Domain_dragger.selectedViaTouch=function(val){
             Domain_dragger.nodeElement.classed("classDraggerNode", !val);
            Domain_dragger.nodeElement.classed("classDraggerNodeHovered", val);

        };

        Domain_dragger.onMouseOver = function () {
            if (Domain_dragger.mouseEntered()) {
                return;
            }
            Domain_dragger.nodeElement.classed("classDraggerNode", false);
            Domain_dragger.nodeElement.classed("classDraggerNodeHovered", true);
            var selectedNode = Domain_dragger.rootElement.node(),
                nodeContainer = selectedNode.parentNode;
            nodeContainer.appendChild(selectedNode);

            Domain_dragger.mouseEntered(true);

        };
        Domain_dragger.onMouseOut = function () {
            if (Domain_dragger.mouseButtonPressed === true)
                return;
            Domain_dragger.nodeElement.classed("classDraggerNodeHovered", false);
            Domain_dragger.nodeElement.classed("classDraggerNode", true);
            Domain_dragger.mouseEntered(false);
        };

        Domain_dragger.setPosition=function(x,y){
            var range_x=Domain_dragger.parent.range().x;
            var range_y=Domain_dragger.parent.range().y;

            // var position of the rangeEndPoint
            var ep_range_x=x;
            var ep_range_y=y;

            var angle = Math.atan2(range_y-ep_range_y  , range_x-ep_range_x ) * 180 / Math.PI+180;
            Domain_dragger.nodeElement.attr("transform","translate(" + ep_range_x  + "," + ep_range_y  + ")"+"rotate(" + angle + ")");
            // if (Range_dragger.pathElement) {
            Domain_dragger.x=x;
            Domain_dragger.y=y;

        };

        Domain_dragger.setAdditionalClassForClass_dragger = function (name, val) {
            // console.log("Class_dragger should sett the class here")
            // Class_dragger.nodeElement.classed(name,val);

        };
        return Domain_dragger;
};


