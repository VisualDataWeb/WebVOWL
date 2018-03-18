
module.exports =  function (graph) {
    /** variable defs **/
    var warningModule={};
    var disableAllWarnings=false;
    var warningContainer=d3.select("#WarningErrorMessagesContent");
    var moduleContainer=d3.select("#WarningErrorMessages");


    warningModule.disableAllWarnings=function(val){
        disableAllWarnings=val;
    };
    function callback(msg){
        console.log("Message From CallBack "+msg);
    }
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

        if (header.length>0){
            var head= warningContainer.append("div");
            head.style("padding","5px");
            var titleHeader=head.append("div");
            // some classes
            titleHeader.style("display","inline-flex");
            titleHeader.node().innerHTML="<u>Header:</u>";
            titleHeader.style("padding-right","3px");
            var msgHeader=head.append("div");
            // some classes
            msgHeader.style("display","inline-flex");
            msgHeader.style("max-width","200px");

            msgHeader.node().innerHTML=header;
        }
        if (reason.length>0){
            var reasonContainer= warningContainer.append("div");
            reasonContainer.style("padding","5px");
            var reasonHeader=reasonContainer.append("div");
            // some classes
            reasonHeader.style("display","inline-flex");
            reasonHeader.style("padding-right","3px");

            reasonHeader.node().innerHTML="<u>Reason:</u>";
            var msgReason=reasonContainer.append("div");
            // some classes
            msgReason.style("display","inline-flex");
            msgReason.style("max-width","200px");
            msgReason.node().innerHTML=reason;
        }
        if (action.length>0){
            var actionContainer= warningContainer.append("div");
            actionContainer.style("padding","5px");
            var actionHeader=actionContainer.append("div");
            // some classes
            actionHeader.style("display","inline-flex");
            actionHeader.style("padding-right","8px");
            actionHeader.node().innerHTML="<u>Action:</u>";
            var msgAction=actionContainer.append("div");
            // some classes
            msgAction.style("display","inline-flex");
            msgAction.style("max-width","200px");
            msgAction.node().innerHTML=action;

        }



            var gotItButton = warningContainer.append("label");
            gotItButton.node().id = "killWarningErrorMessages";
            gotItButton.node().innerHTML = "Continue";
            d3.select("#killWarningErrorMessages").on("click",function(){
                moduleContainer.classed("hidden",true);
                callback(parameterArray[0],parameterArray[1],parameterArray[2],parameterArray[3]);// << THIS IS KINDA A HACK

            });

        var cancelButton= warningContainer.append("label");
        cancelButton.node().id = "cancelButton";
        cancelButton.node().innerHTML = "Cancel";
        cancelButton.on("click",function(){
            moduleContainer.classed("hidden",true);
        });
        moduleContainer.classed("hidden",false);



    };

    warningModule.showWarning=function(header,reason,action,type,forcedWarning){
        if (disableAllWarnings===true && forcedWarning && forcedWarning===false){
            moduleContainer.classed("hidden",true);
        }

        // clear children
        var oldContent=warningContainer.node().children;
        var numEntries = oldContent.length;

        for (var i = 0; i < numEntries; i++)
            oldContent[0].remove();


        // add new one;

        if (header.length>0){
           var head= warningContainer.append("div");
           head.style("padding","5px");
           var titleHeader=head.append("div");
           // some classes
            titleHeader.style("display","inline-flex");
            titleHeader.node().innerHTML="<u>Header:</u>";
            titleHeader.style("padding-right","3px");
            var msgHeader=head.append("div");
            // some classes
            msgHeader.style("display","inline-flex");
            msgHeader.style("max-width","200px");

            msgHeader.node().innerHTML=header;
        }
        if (reason.length>0){
            var reasonContainer= warningContainer.append("div");
            reasonContainer.style("padding","5px");
            var reasonHeader=reasonContainer.append("div");
            // some classes
            reasonHeader.style("display","inline-flex");
            reasonHeader.style("padding-right","3px");

            reasonHeader.node().innerHTML="<u>Reason:</u>";
            var msgReason=reasonContainer.append("div");
            // some classes
            msgReason.style("display","inline-flex");
            msgReason.style("max-width","200px");
            msgReason.node().innerHTML=reason;
        }
        if (action.length>0){
            var actionContainer= warningContainer.append("div");
            actionContainer.style("padding","5px");
            var actionHeader=actionContainer.append("div");
            // some classes
            actionHeader.style("display","inline-flex");
            actionHeader.style("padding-right","8px");
            actionHeader.node().innerHTML="<u>Action:</u>";
            var msgAction=actionContainer.append("div");
            // some classes
            msgAction.style("display","inline-flex");
            msgAction.style("max-width","200px");
            msgAction.node().innerHTML=action;

        }

        // add individual divs

        // we have 2 types of warnings
        // type 1 = only okay button
        // type 2 = okay, and cancel button,
        if (type===1) {
            var gotItButton = warningContainer.append("label");
            gotItButton.node().id = "killWarningErrorMessages";
            gotItButton.node().innerHTML = "Got It";
            d3.select("#killWarningErrorMessages").on("click",function(){
                moduleContainer.classed("hidden",true);
            });
        }
        moduleContainer.classed("hidden",false);



    };

    return warningModule;
};


