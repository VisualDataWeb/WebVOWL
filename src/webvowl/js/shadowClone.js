
module.exports =  function (graph) {
    /** variable defs **/
    var ShadowClone={};
    ShadowClone.nodeId = 10003;
    ShadowClone.parent = undefined;
    ShadowClone.s_x = 0;
    ShadowClone.s_y = 0;
    ShadowClone.e_x = 0;
    ShadowClone.e_y = 0;
    ShadowClone.rootElement = undefined;
    ShadowClone.rootNodeLayer = undefined;
    ShadowClone.pathLayer=undefined;
    ShadowClone.nodeElement = undefined;
    ShadowClone.pathElement = undefined;
    ShadowClone.typus = "shadowClone";

    ShadowClone.type = function () {
            return ShadowClone.typus;
    };

    // TODO: We need the endPoint of the Link here!
    ShadowClone.parentNode = function () {
            return ShadowClone.parent;
    };

    ShadowClone.setParentProperty = function (parentProperty) {
        ShadowClone.parent = parentProperty;
        console.log(" SHADOW CLONE : >>>>>>>>>>>>>>>>>>>> IntersectionPoint: ");



        console.log(parentProperty.labelObject().linkRangeIntersection);

        var iP_range=parentProperty.labelObject().linkRangeIntersection;
        var iP_domain=parentProperty.labelObject().linkDomainIntersection;
        ShadowClone.s_x = iP_domain.x;
        ShadowClone.s_y = iP_domain.y;
        ShadowClone.e_x = iP_range.x;
        ShadowClone.e_y = iP_range.y;

        ShadowClone.updateElement();
        console.log("updated ELEMENT");
        console.log("Visible? "+ShadowClone.pathElement.classed("hidden"));



    };

    ShadowClone.hideClone=function(val){
        ShadowClone.pathElement.classed("hidden",val);
    };
    /** BASE HANDLING FUNCTIONS ------------------------------------------------- **/
    ShadowClone.id = function (index) {
        if (!arguments.length) {
            return ShadowClone.nodeId;
        }
        ShadowClone.nodeId = index;
    };

    ShadowClone.svgPathLayer=function(layer){
        ShadowClone.pathLayer= layer.append('g');
    };

    ShadowClone.svgRoot = function (root) {
        if (!arguments.length)
            return ShadowClone.rootElement;
        ShadowClone.rootElement = root;
        ShadowClone.rootNodeLayer = ShadowClone.rootElement.append('g');

    };

    /** DRAWING FUNCTIONS ------------------------------------------------- **/
    ShadowClone.drawClone = function () {
        ShadowClone.pathElement = ShadowClone.pathLayer.append('line')
                .classed("classNodeDragPath", true);
        ShadowClone.pathElement.attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", 0);
            console.log("SHADOWCLONE DRAWED!")
            // var lineData = [
            //     {"x": 0, "y": 0},
            //     {"x": 0, "y": 40},
            //     {"x": -40, "y": 0},
            //     {"x": 0, "y": -40},
            //     {"x": 0, "y": 0}
            // ];

    };



    ShadowClone.updateElement = function () {
        ShadowClone.pathElement.attr("x1", ShadowClone.s_x)
            .attr("y1", ShadowClone.s_y)
            .attr("x2", ShadowClone.e_x)
            .attr("y2", ShadowClone.e_y);
    };

    ShadowClone.setPosition= function (s_x,s_y) {
        ShadowClone.s_x=s_x;
        ShadowClone.s_y=s_y;

        // add normalized dir;

        var dex=ShadowClone.parent.domain().x;
        var dey=ShadowClone.parent.domain().y;

        var dir_X= s_x-dex;
        var dir_Y= s_y-dey;

        var len=Math.sqrt(dir_X*dir_X+dir_Y*dir_Y);

        var nX=dir_X/len;
        var nY=dir_Y/len;


        ShadowClone.e_x=dex+nX*ShadowClone.parent.domain().actualRadius();
        ShadowClone.e_y=dey+nY*ShadowClone.parent.domain().actualRadius();


        ShadowClone.updateElement();


    };


    /** MOUSE HANDLING FUNCTIONS ------------------------------------------------- **/

        return ShadowClone;
};


