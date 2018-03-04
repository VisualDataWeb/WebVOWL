/**
 * Contains the navigation "engine"
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
module.exports = function (graph) {
    var zoomSlider  = {};
    var minMag=graph.options().minMagnification(),
        maxMag=graph.options().maxMagnification();
    var defZoom;

    // some timers;
    var t_zoomOut;
    var t_zoomIn;

    var zoomValue;
    var showSlider=true;

    var w = graph.options().width();
    var h = graph.options().height();
    defZoom = Math.min(w, h) / 1000;
    var slider;

    function clearAllTimers() {
        cancelAnimationFrame(t_zoomOut);
        cancelAnimationFrame(t_zoomIn);
    }

    function timed_zoomOut(){
        zoomValue=0.98*zoomValue;
        // fail saves
        if (zoomValue < minMag) { zoomValue = minMag;}
        graph.setSliderZoom(zoomValue);
       // clearTimeout(t_zoomOut);
        t_zoomOut=requestAnimationFrame(timed_zoomOut);
    }

    function timed_zoomIn(){
        zoomValue=1.02*zoomValue;
        // fail saves
        if (zoomValue > maxMag) { zoomValue = maxMag;}
        graph.setSliderZoom(zoomValue);
    //    clearTimeout(t_zoomIn);
        t_zoomIn=requestAnimationFrame(timed_zoomIn);
    }



    zoomSlider.setup = function () {

        slider= d3.select("#zoomSliderParagraph").append("input")
            .datum({})
            .attr("id","zoomSliderElement")
            // .classed("slideOption",true)
            .attr("type", "range")
            // .attr("orient","vertical")
            .attr("value", defZoom)
            .attr("min", minMag)
            .attr("max", maxMag)
            .attr("step", (maxMag - minMag) / 40)
            .attr("title","zoom factor")
            .on("input", function(){
            zoomSlider.zooming();});

        // fixing zoom out button long click thing;
        d3.select("#zoomOutButton").on("mousedown",function(){
            graph.options().navigationMenu().hideAllMenus();
            zoomValue=graph.scaleFactor();
            t_zoomOut = requestAnimationFrame(timed_zoomOut);
        })
            .on("touchstart",function(){
                graph.options().navigationMenu().hideAllMenus();
                zoomValue=graph.scaleFactor();
                t_zoomOut = requestAnimationFrame(timed_zoomOut);
            })
            .on("mouseup",clearAllTimers)
            .on("touchend",clearAllTimers)
            .on("touchcancel",clearAllTimers)
            .attr("title","zoom out");

        d3.select("#zoomInButton").on("mousedown",function(){
            graph.options().navigationMenu().hideAllMenus();
            zoomValue=graph.scaleFactor();
            t_zoomIn = requestAnimationFrame(timed_zoomIn);
          })
            .on("touchstart",function(){
                graph.options().navigationMenu().hideAllMenus();
                zoomValue=graph.scaleFactor();
                t_zoomIn = requestAnimationFrame(timed_zoomIn);
            })
            .on("mouseup",clearAllTimers)
            .on("touchend",clearAllTimers)
            .on("touchcancel",clearAllTimers)
            .attr("title","zoom in");

        d3.select("#centerGraphButton").on("click",function(){
                graph.options().navigationMenu().hideAllMenus();
                graph.forceRelocationEvent();
        }).attr("title","center graph");

    };

    zoomSlider.showSlider=function(val){
        if (!arguments.length) return showSlider;
        d3.select("#zoomSlider").classed("hidden",!val);
        showSlider=val;
    };

    zoomSlider.zooming=function(){
        graph.options().navigationMenu().hideAllMenus();
        var zoomValue=slider.property("value");
        slider.attr("value", zoomValue);
        graph.setSliderZoom(zoomValue);
    };

    zoomSlider.updateZoomSliderValue=function(val){
        if(slider){
            slider.attr("value",val);
            slider.property("value",val);
        }
    };

    return zoomSlider;
};
