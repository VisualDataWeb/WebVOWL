var CenteringTextElement = require("./util/CenteringTextElement");
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
        var iP_range=parentProperty.labelObject().linkRangeIntersection;
        var iP_domain=parentProperty.labelObject().linkDomainIntersection;
        ShadowClone.s_x = iP_domain.x;
        ShadowClone.s_y = iP_domain.y;
        ShadowClone.e_x = iP_range.x;
        ShadowClone.e_y = iP_range.y;

        ShadowClone.updateElement();

        ShadowClone.rootNodeLayer.remove();
        ShadowClone.rootNodeLayer=ShadowClone.rootElement.append('g');
        ShadowClone.rootNodeLayer.datum(parentProperty);
        // copy rendering element
        var rect = ShadowClone.rootNodeLayer.append("rect")
            .classed(parentProperty.styleClass(), true)
            .classed("property", true)
            .attr("x", -parentProperty.width() / 2)
            .attr("y", -parentProperty.height() / 2)
            .attr("width", parentProperty.width())
            .attr("height", parentProperty.height());


        if (parentProperty.visualAttributes()) {
            rect.classed(parentProperty.visualAttributes(), true);
        }

        var bgColor=parentProperty.backgroundColor();

        if (parentProperty.attributes().indexOf("deprecated")>-1){
            bgColor=undefined;
            rect.classed("deprecatedproperty", true);
        }else {
            rect.classed("deprecatedproperty", false);
        }
        rect.style("fill", bgColor);

        // add Text;
        var equivalentsString = parentProperty.equivalentsString();
        var suffixForFollowingEquivalents = equivalentsString ? "," : "";


        var textElement = new CenteringTextElement(ShadowClone.rootNodeLayer, bgColor);
        textElement.addText(parentProperty.labelForCurrentLanguage(), "", suffixForFollowingEquivalents);
        textElement.addEquivalents(equivalentsString);
        textElement.addSubText(parentProperty.indicationString());


        var cx=0.5* (ShadowClone.s_x + ShadowClone.e_x);
        var cy=0.5* (ShadowClone.s_y + ShadowClone.e_y);
        ShadowClone.rootNodeLayer.attr("transform","translate(" + cx  + "," + cy +")");
        ShadowClone.rootNodeLayer.classed("hidden",true);

    };

    ShadowClone.hideClone=function(val){
        ShadowClone.pathElement.classed("hidden",val);
        ShadowClone.rootNodeLayer.classed("hidden",val);
    };

    ShadowClone.hideParentProperty=function(val){

        var labelObj=ShadowClone.parent.labelElement();
        if (labelObj)
            ShadowClone.parent.hide(val);


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

    };



    ShadowClone.updateElement = function () {
        ShadowClone.pathElement.attr("x1", ShadowClone.s_x)
            .attr("y1", ShadowClone.s_y)
            .attr("x2", ShadowClone.e_x)
            .attr("y2", ShadowClone.e_y);
        var cx=0.5* (ShadowClone.s_x + ShadowClone.e_x);
        var cy=0.5* (ShadowClone.s_y + ShadowClone.e_y);
        ShadowClone.rootNodeLayer.attr("transform","translate(" + cx  + "," + cy +")");
    };

    ShadowClone.setPositionDomain=function (e_x,e_y){

        var rex=ShadowClone.parent.range().x;
        var rey=ShadowClone.parent.range().y;


        var dir_X= rex-e_x;
        var dir_Y= rey-e_y;

        var len=Math.sqrt(dir_X*dir_X+dir_Y*dir_Y);

        var nX=dir_X/len;
        var nY=dir_Y/len;


        ShadowClone.s_x=rex-nX*ShadowClone.parent.range().actualRadius();
        ShadowClone.s_y=rey-nY*ShadowClone.parent.range().actualRadius();



        ShadowClone.e_x=e_x;
        ShadowClone.e_y=e_y;
        ShadowClone.updateElement();
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


