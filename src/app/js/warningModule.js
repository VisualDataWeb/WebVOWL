
module.exports =  function (graph) {
    /** variable defs **/
    var warningModule={};
    var disableAllWarnings=false;
    var warningContainer=d3.select("#WarningErrorMessagesContent");
    warningContainer.style("top","0");
    var moduleContainer=d3.select("#WarningErrorMessages");
    moduleContainer.style("position","absolute");
    moduleContainer.style("top","0");
    var visibleWarning=false;

    moduleContainer.node().addEventListener("animationend", function () {
         if (visibleWarning===false) {
            moduleContainer.classed("hidden", true);
        }

    });

    warningModule.showExporterWarning=function(){
        var header = "Could not export ontology";
        var reason = "Identified unsupported element type, most likely (owl:Union)";
        var action = "Ontology not exported as TTL";

        warningModule.showWarning(header,reason,action,1,true);

    };


        warningModule.showEditorHint=function(){

        // clear children
        var oldContent=warningContainer.node().children;
        var numEntries = oldContent.length;

        for (var i = 0; i < numEntries; i++)
            oldContent[0].remove();
        // warningContainer.classed("editorHint")
        var ul=warningContainer.append('ul');
        ul.append('li').node().innerHTML="Create a class with <b>double click / tap</b> on empty canvas area.";
        ul.append('li').node().innerHTML="Edit names with <b>double click / tap</b> on element.</li>";
        ul.append('li').node().innerHTML="Selection of default constructors is provided in the left sidebar.";
        ul.append('li').node().innerHTML="Additional editing functionality is provided in the right sidebar.";



        var gotItButton = warningContainer.append("label");
        gotItButton.node().id = "killWarningErrorMessages";
        gotItButton.node().innerHTML = "Got It";
        d3.select("#killWarningErrorMessages").on("click",function(){
            visibleWarning=false;
            moduleContainer.style("-webkit-animation-name","warn_CollapseAnimation");
            moduleContainer.style("-webkit-animation-duration","0.5s");

        });

        visibleWarning=true;
        moduleContainer.classed("hidden",false);
        moduleContainer.style("-webkit-animation-name","warn_ExpandAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");
    };

    warningModule.disableAllWarnings=function(val){
        disableAllWarnings=val;
    };
    warningModule.responseWarning=function(header,reason,action, callback, parameterArray,forcedWarning){

        // TODO this has to be tested !!!
        if (disableAllWarnings===true && forcedWarning && forcedWarning===false){
            moduleContainer.classed("hidden",true);
            return;
        }

        var oldContent=warningContainer.node().children;
        var numEntries = oldContent.length;

        for (var i = 0; i < numEntries; i++)
            oldContent[0].remove();

        // add a darklord working the darkside of the force, so no one can do something
        // until the darklord has its answer!
        d3.select("#darthBane").classed("hidden",false);

        var graphWidht=0.5*graph.options().width();


        if (header.length>0){
            var head= warningContainer.append("div");
            head.style("padding","5px");
            var titleHeader=head.append("div");
            // some classes
            titleHeader.style("display","inline-flex");
            titleHeader.node().innerHTML="<b>Warning:</b>";
            titleHeader.style("padding-right","3px");
            var msgHeader=head.append("div");
            // some classes
            msgHeader.style("display","inline-flex");
            msgHeader.style("max-width",graphWidht+"px");

            msgHeader.node().innerHTML=header;
        }
        if (reason.length>0){
            var reasonContainer= warningContainer.append("div");
            reasonContainer.style("padding","5px");
            var reasonHeader=reasonContainer.append("div");
            // some classes
            reasonHeader.style("display","inline-flex");
            reasonHeader.style("padding-right","3px");

            reasonHeader.node().innerHTML="<b>Reason:</b>";
            var msgReason=reasonContainer.append("div");
            // some classes
            msgReason.style("display","inline-flex");
            msgReason.style("max-width",graphWidht+"px");
            msgReason.node().innerHTML=reason;
        }
        if (action.length>0){
            var actionContainer= warningContainer.append("div");
            actionContainer.style("padding","5px");
            var actionHeader=actionContainer.append("div");
            // some classes
            actionHeader.style("display","inline-flex");
            actionHeader.style("padding-right","8px");
            actionHeader.node().innerHTML="<b>Action:</b>";
            var msgAction=actionContainer.append("div");
            // some classes
            msgAction.style("display","inline-flex");
            msgAction.style("max-width",graphWidht+"px");
            msgAction.node().innerHTML=action;

        }



            var gotItButton = warningContainer.append("label");
            gotItButton.node().id = "killWarningErrorMessages";
            gotItButton.node().innerHTML = "Continue";
            d3.select("#killWarningErrorMessages").on("click",function(){
                visibleWarning=false;
                moduleContainer.style("-webkit-animation-name","warn_CollapseAnimation");
                moduleContainer.style("-webkit-animation-duration","0.5s");
                d3.select("#darthBane").classed("hidden",true);

                callback(parameterArray[0],parameterArray[1],parameterArray[2],parameterArray[3]);// << THIS IS KINDA A HACK

            });
        warningContainer.append("span").node().innerHTML="|";
        var cancelButton= warningContainer.append("label");
        cancelButton.node().id = "cancelButton";
        cancelButton.node().innerHTML = "Cancel";
        cancelButton.on("click",function(){
            visibleWarning=false;
            moduleContainer.style("-webkit-animation-name","warn_CollapseAnimation");
            moduleContainer.style("-webkit-animation-duration","0.5s");
            d3.select("#darthBane").classed("hidden",true);

        });
        moduleContainer.classed("hidden",false);
        visibleWarning=true;
        moduleContainer.style("-webkit-animation-name","warn_ExpandAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");



    };

    warningModule.showWarning=function(header,reason,action,type,forcedWarning,additionalOpts){
        if (disableAllWarnings===true && forcedWarning && forcedWarning===false){
            moduleContainer.classed("hidden",true);
        }

        // clear children
        var oldContent=warningContainer.node().children;
        var numEntries = oldContent.length;

        for (var i = 0; i < numEntries; i++)
            oldContent[0].remove();


        // add new one;
        var graphWidth=0.5*graph.options().width();

        if (header.length>0){
           var head= warningContainer.append("div");
           head.style("padding","5px");
           var titleHeader=head.append("div");
           // some classes
            titleHeader.style("display","inline-flex");
            titleHeader.node().innerHTML="<b>Warning:</b>";
            titleHeader.style("padding-right","3px");
            var msgHeader=head.append("div");
            // some classes
            msgHeader.style("display","inline-flex");
            msgHeader.style("max-width",graphWidth+"px");

            msgHeader.node().innerHTML=header;
        }
        if (reason.length>0){
            var reasonContainer= warningContainer.append("div");
            reasonContainer.style("padding","5px");
            var reasonHeader=reasonContainer.append("div");
            // some classes
            reasonHeader.style("display","inline-flex");
            reasonHeader.style("padding-right","3px");

            reasonHeader.node().innerHTML="<b>Reason:</b>";
            var msgReason=reasonContainer.append("div");
            // some classes
            msgReason.style("display","inline-flex");
            msgReason.style("max-width",graphWidth+"px");
            msgReason.node().innerHTML=reason;
        }
        if (action.length>0){
            var actionContainer= warningContainer.append("div");
            actionContainer.style("padding","5px");
            var actionHeader=actionContainer.append("div");
            // some classes
            actionHeader.style("display","inline-flex");
            actionHeader.style("padding-right","8px");
            actionHeader.node().innerHTML="<b>Action:</b>";
            var msgAction=actionContainer.append("div");
            // some classes
            msgAction.style("display","inline-flex");
            msgAction.style("max-width",graphWidth+"px");
            msgAction.node().innerHTML=action;

        }

        // add individual divs

        // we have 2 types of warnings
        // type 1 = only okay button
        // type 2 = ShowMe , and cancel button,
        var gotItButton;
        if (type===1) {
            gotItButton= warningContainer.append("label");
            gotItButton.node().id = "killWarningErrorMessages";
            gotItButton.node().innerHTML = "Got It";
            d3.select("#killWarningErrorMessages").on("click",function(){
                visibleWarning=false;
                moduleContainer.style("-webkit-animation-name","warn_CollapseAnimation");
                moduleContainer.style("-webkit-animation-duration","0.5s");
            });
        }


        if (type===2) {
            gotItButton = warningContainer.append("label");
            gotItButton.node().id = "killWarningErrorMessages";
            gotItButton.node().innerHTML = "Got It";
            d3.select("#killWarningErrorMessages").on("click",function(){
                visibleWarning=false;
                moduleContainer.style("-webkit-animation-name","warn_CollapseAnimation");
                moduleContainer.style("-webkit-animation-duration","0.5s");
            });
            warningContainer.append("span").node().innerHTML="|";
            var zoomToElementButton = warningContainer.append("label");
            zoomToElementButton.node().id = "zoomElementThing";
            zoomToElementButton.node().innerHTML = "Zoom to element ";
            d3.select("#zoomElementThing").on("click",function(){
                // assume the additional Element is for halo;
                graph.zoomToElementInGraph(additionalOpts);
            });
            warningContainer.append("span").node().innerHTML="|";
            var ShowElementButton = warningContainer.append("label");
            ShowElementButton.node().id = "showElementThing";
            ShowElementButton.node().innerHTML = "Indicate element";
            d3.select("#showElementThing").on("click",function(){
                // assume the additional Element is for halo;
                if (additionalOpts.halo()===false) {
                    additionalOpts.drawHalo();
                    graph.updatePulseIds([additionalOpts.id()]);
                }else{
                    additionalOpts.removeHalo();
                    additionalOpts.drawHalo();
                    graph.updatePulseIds([additionalOpts.id()]);
                }
            });

        }

        visibleWarning=true;
        moduleContainer.classed("hidden",false);
        moduleContainer.style("-webkit-animation-name","warn_ExpandAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");
        moduleContainer.classed("hidden",false);



    };

    return warningModule;
};


