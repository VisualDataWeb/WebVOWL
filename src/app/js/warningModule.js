
module.exports =  function (graph) {
    /** variable defs **/
    var warningModule={};
    var superContainer=d3.select("#WarningErrorMessages");
    var _messageContainers=[];
    var _messageContext=[];
    var _visibleStatus=[];

    var _filterHintId;
    var _editorHintId;
    var _messageId=-1;
    superContainer.style("display", "inline-block");
    var cssStyleIndex=0;

    function findCSS_Index(){
        var css=document.styleSheets[1].cssRules;
        for (var i=0;i<css.length;i++){
            var entry=css[i];
            if (entry.name==="msg_CollapseAnimation"){
                cssStyleIndex=i;
            }
        }
    }
    findCSS_Index();

    warningModule.addMessageBox=function(){
        // add a container;
        _messageId++;
        var messageContainer=d3.select("#WarningErrorMessages").append("div");
        messageContainer.node().id="messageContainerId_"+_messageId;

        var messageContext=messageContainer.append("div");
        messageContext.node().id="messageContextId_"+_messageId;
        messageContext.style("top","0");
        messageContainer.style("position","relative");
        messageContainer.style("width","100%");
        //save in array
        _messageContainers.push(messageContainer);
        _messageContext.push(messageContext);

        // add animation to the container
        messageContainer.node().addEventListener("animationend", function () {
            var containerId=this.id;
            var tokens=containerId.split("_")[1];
            var mContainer=d3.select("#"+containerId);
            // get number of children
            mContainer.classed("hidden",!_visibleStatus[tokens]);
            // clean up DOM
            if (!_visibleStatus[tokens]) {
                mContainer.remove();
                _messageContext[tokens]=null;
                _messageContainers[tokens]=null;
            }
        });

        // set visible flag that is used in end of animation
        _visibleStatus[_messageId]=true;
        return _messageId;
    };

    warningModule.createMessageContext=function(id){
        var warningContainer=_messageContext[id];
        var moduleContainer=_messageContainers[id];
        var generalHint=warningContainer.append('div');
        generalHint.node().innerHTML="";
        _editorHintId=id;
        /** Editing mode activated. You can now modify an existing ontology or create a new one via the <em>ontology</em> menu. You can save any ontology using the <em>export</em> menu (and exporting it as TTL file).**/
        generalHint.node().innerHTML+="Editing mode activated.<br>" +
            "You can now modify an existing ontology or create a new one via the <em>ontology</em> menu.<br>" +
            "You can save any ontology using the <em>export</em> menu (and exporting it as TTL file).";

        generalHint.style("padding", "5px");
        generalHint.style("line-height", "1.2em");
        generalHint.style("font-size", "1.2em");


        var ul=warningContainer.append('ul');
        ul.append('li').node().innerHTML="Create a class with <b>double click / tap</b> on empty canvas area.";
        ul.append('li').node().innerHTML="Edit names with <b>double click / tap</b> on element.</li>";
        ul.append('li').node().innerHTML="Selection of default constructors is provided in the left sidebar.";
        ul.append('li').node().innerHTML="Additional editing functionality is provided in the right sidebar.";


        var gotItButton = warningContainer.append("label");
        gotItButton.node().id = "killWarningErrorMessages_"+id;
        gotItButton.node().innerHTML = "Got It";
        gotItButton.on("click",warningModule.closeMessage);

        moduleContainer.classed("hidden",false);
        moduleContainer.style("-webkit-animation-name","warn_ExpandAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");
    };

    warningModule.showMessage=function(id){
        var moduleContainer=_messageContainers[id];
        moduleContainer.classed("hidden",false);
        moduleContainer.style("-webkit-animation-name","warn_ExpandAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");
    };

    warningModule.closeMessage=function(id){
        var nId;
        if (id===undefined ){
            var givenId=this.id;
            nId=givenId.split("_")[1];
        } else {
            nId=id;
        }
        if (id && id.indexOf("_")!==-1){
            nId=id.split("_")[1];
        }
        _visibleStatus[nId]=false;
        // get module;
        var moduleContainer=_messageContainers[nId];
        moduleContainer.style("-webkit-animation-name","warn_CollapseAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");

        var m_height=moduleContainer.node().getBoundingClientRect().height;

        // find my id in the children
        var pNode=moduleContainer.node().parentNode;

        var followingChildren=[];
        var pChild=pNode.children;
        var pChild_len=pChild.length;
        var containerId=moduleContainer.node().id;
        var found_me=false;
        for (var i=0;i<pChild_len;i++){
            if (found_me===true){
                followingChildren.push(pChild[i].id);
            }

            if (containerId===pChild[i].id){
                found_me=true;
            }

        }

        for (var fc=0; fc<followingChildren.length;fc++){
            var child=d3.select("#"+followingChildren[fc]);
            // get the document style and overwrite it;
            var superCss=document.styleSheets[1].cssRules[cssStyleIndex];
            // remove the existing 0% and 100% rules
            superCss.deleteRule("0%");
            superCss.deleteRule("100%");

            superCss.appendRule("0%   {top: 0;}");
            superCss.appendRule("100% {top: -"+m_height+"px;");

            child.style("-webkit-animation-name","msg_CollapseAnimation");
            child.style("-webkit-animation-duration","0.5s");
            child.node().addEventListener("animationend", function () {
                var c=d3.select(this);
                c.style("-webkit-animation-name","");
                c.style("-webkit-animation-duration","");
            });
        }
    };

    warningModule.closeFilterHint=function(){
        if (_messageContainers[_filterHintId]){
            _messageContainers[_filterHintId].classed("hidden",true);
            _messageContainers[_filterHintId].remove();
            _messageContainers[_filterHintId]=null;
            _messageContext[_filterHintId]=null;
            _visibleStatus[_filterHintId]=false;
        }
    };

    warningModule.showEditorHint=function(){
        var id=warningModule.addMessageBox();
        warningModule.createMessageContext(id);
    };


    warningModule.responseWarning=function(header,reason,action, callback, parameterArray,forcedWarning){
        var id=warningModule.addMessageBox();
        var warningContainer=_messageContext[id];
        var moduleContainer=_messageContainers[id];
        _visibleStatus[id]=true;
        d3.select("#blockGraphInteractions").classed("hidden",false);
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

        var gotItButton = warningContainer.append("label");
        gotItButton.node().id = "killWarningErrorMessages_"+id;
        gotItButton.node().innerHTML = "Continue";
        gotItButton.on("click",function(){
            warningModule.closeMessage(this.id);
            d3.select("#blockGraphInteractions").classed("hidden",true);
            callback(parameterArray[0],parameterArray[1],parameterArray[2],parameterArray[3]);
        });
        warningContainer.append("span").node().innerHTML="|";
        var cancelButton= warningContainer.append("label");
        cancelButton.node().id = "cancelButton_"+id;
        cancelButton.node().innerHTML = "Cancel";
        cancelButton.on("click",function(){
            warningModule.closeMessage(this.id);
            d3.select("#blockGraphInteractions").classed("hidden",true);
        });
        moduleContainer.classed("hidden",false);
        moduleContainer.style("-webkit-animation-name","warn_ExpandAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");
    };

    warningModule.showFilterHint=function(){
        var id=warningModule.addMessageBox();
        var warningContainer=_messageContext[id];
        var moduleContainer=_messageContainers[id];
        _visibleStatus[id]=true;

        _filterHintId=id;
        var generalHint=warningContainer.append('div');
        /** Editing mode activated. You can now modify an existing ontology or create a new one via the <em>ontology</em> menu. You can save any ontology using the <em>export</em> menu (and exporting it as TTL file).**/
        generalHint.node().innerHTML="Collapsing filter activated.<br>" +
            "The number of visualized elements has been automatically reduced.<br>" +
            "Use the degree of collapsing slider in the <em>filter</em> menu to adjust the visualization.<br><br>"+
            "<em>Note:</em> A performance decrease could be experienced with a growing amount of visual elements in the graph.";


        generalHint.style("padding", "5px");
        generalHint.style("line-height", "1.2em");
        generalHint.style("font-size", "1.2em");

        var gotItButton = warningContainer.append("label");
        gotItButton.node().id = "killFilterMessages_"+id;
        gotItButton.node().innerHTML = "Got It";
        gotItButton.on("click",warningModule.closeMessage);

        moduleContainer.classed("hidden",false);
        moduleContainer.style("-webkit-animation-name","warn_ExpandAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");
    };

    warningModule.showWarning=function(header,reason,action,type,forcedWarning,additionalOpts){
        var id=warningModule.addMessageBox();
        var warningContainer=_messageContext[id];
        var moduleContainer=_messageContainers[id];
        _visibleStatus[id]=true;

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

        var gotItButton;
        if (type===1) {
            gotItButton= warningContainer.append("label");
            gotItButton.node().id = "killWarningErrorMessages_"+id;
            gotItButton.node().innerHTML = "Got It";
            gotItButton.on("click",warningModule.closeMessage);
        }

        if (type===2) {
            gotItButton = warningContainer.append("label");
            gotItButton.node().id = "killWarningErrorMessages_"+id;
            gotItButton.node().innerHTML = "Got It";
            gotItButton.on("click",warningModule.closeMessage);
            warningContainer.append("span").node().innerHTML="|";
            var zoomToElementButton = warningContainer.append("label");
            zoomToElementButton.node().id = "zoomElementThing_"+id;
            zoomToElementButton.node().innerHTML = "Zoom to element ";
            zoomToElementButton.on("click",function(){
                // assume the additional Element is for halo;
                graph.zoomToElementInGraph(additionalOpts);
            });
            warningContainer.append("span").node().innerHTML="|";
            var ShowElementButton = warningContainer.append("label");
            ShowElementButton.node().id = "showElementThing_"+id;
            ShowElementButton.node().innerHTML = "Indicate element";
            ShowElementButton.on("click",function(){
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
        moduleContainer.classed("hidden",false);
        moduleContainer.style("-webkit-animation-name","warn_ExpandAnimation");
        moduleContainer.style("-webkit-animation-duration","0.5s");
        moduleContainer.classed("hidden",false);
    };

    return warningModule;
};


