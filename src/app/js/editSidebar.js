/**
 * Contains the logic for the sidebar.
 * @param graph the graph that belongs to these controls
 * @returns {{}}
 */
module.exports = function (graph) {

	var editSidebar = {},
		languageTools = webvowl.util.languageTools(),
		elementTools = webvowl.util.elementTools();

	var oldPrefix, oldPrefixURL;
    var prefix_editMode=false;
    editSidebar.setup=function(){
		console.log("Setup Edit SideBar");
        setupCollapsing();
        setupPrefixList();
        setupAddPrefixButton();

	};

    function setupAddPrefixButton() {
        var btn=d3.select("#addPrefixButton");
        btn.on("click",function(){
            // check if we are still in editMode?
            if (prefix_editMode===false){
                // create new line entry;
                var name="emptyPrefixEntry";
                var prefixListContainer=d3.select("#prefixURL_Container");
                var prefixEditContainer=prefixListContainer.append("div");
                prefixEditContainer.classed("prefixIRIElements",true);
                prefixEditContainer.node().id="prefixContainerFor_"+name;

                var editButton=prefixEditContainer.append("span");
                editButton.classed("editPrefixButton",true);
                editButton.classed("noselect",true);
                editButton.node().innerHTML="\u2714";
                editButton.node().id="editButtonFor_"+name;
                editButton.node().title="Edit Prefix and URL";
                editButton.node().elementStyle="save";


                var prefInput=prefixEditContainer.append("input");
                prefInput.classed("prefixInput",true);
                prefInput.node().type="text";
                prefInput.node().id="prefixInputFor_"+name;
                prefInput.node().autocomplete="off";
                prefInput.node().value="";


                var prefURL=prefixEditContainer.append("input");
                prefURL.classed("prefixURL",true);
                prefURL.node().type="text";
                prefURL.node().id="prefixURLFor_"+name;
                prefURL.node().autocomplete="off";
                prefURL.node().value="";

                prefInput.node().disabled=false;
                prefURL.node().disabled=false;
                prefix_editMode=true;


                var deleteButton=prefixEditContainer.append("span");
                deleteButton.classed("deletePrefixButton",true);
                deleteButton.classed("noselect",true);
                deleteButton.node().innerHTML="\u2717";
                deleteButton.node().id="deleteButtonFor_"+name;
                deleteButton.node().title="Delete  Prefix and URL";

                // connect the buttons;

                editButton.on("click",enablePrefixEdit);
                deleteButton.on("click",deletePrefixLine);

                // swap focus to prefixInput

                prefInput.node().focus();
                oldPrefix=name;
                oldPrefixURL="";
            }
        });

    }

    function setupPrefixList(){
        var prefixListContainer=d3.select("#prefixURL_Container");

        /*
         <div class="prefixIRIElements" id="prefixContainer">
         <input class="prefixInput " type="text" id="AA" value="" autocomplete="off">
         <input class="prefixURL" type="text" id="BB" value="" autocomplete="off">
         </div>
        * */

        var prefixElements=graph.options().prefixList();
        for (var name in prefixElements){
            if (prefixElements.hasOwnProperty(name)){
            var prefixEditContainer=prefixListContainer.append("div");
                prefixEditContainer.classed("prefixIRIElements",true);
                prefixEditContainer.node().id="prefixContainerFor_"+name;

                var editButton=prefixEditContainer.append("span");
                editButton.classed("editPrefixButton",true);
                editButton.classed("noselect",true);
                editButton.node().innerHTML="\u270E";
                editButton.node().id="editButtonFor_"+name;
                editButton.node().title="Edit Prefix and URL";
                editButton.node().elementStyle="edit";


                var prefInput=prefixEditContainer.append("input");
                prefInput.classed("prefixInput",true);
                prefInput.node().type="text";
                prefInput.node().id="prefixInputFor_"+name;
                prefInput.node().autocomplete="off";
                prefInput.node().value=name;


                var prefURL=prefixEditContainer.append("input");
                prefURL.classed("prefixURL",true);
                prefURL.node().type="text";
                prefURL.node().id="prefixURLFor_"+name;
                prefURL.node().autocomplete="off";
                prefURL.node().value=prefixElements[name];

                prefInput.node().disabled=true;
                prefURL.node().disabled=true;


                var deleteButton=prefixEditContainer.append("span");
                deleteButton.classed("deletePrefixButton",true);
                deleteButton.classed("noselect",true);
                deleteButton.node().innerHTML="\u2717";
                deleteButton.node().id="deleteButtonFor_"+name;
                deleteButton.node().title="Delete  Prefix and URL";

                editButton.on("click",enablePrefixEdit);
                deleteButton.on("click",deletePrefixLine);
            }
        }
    }


    function deletePrefixLine() {
        var selector=this.id.split("_")[1];
        console.log( "Delete button for selector:"+selector);
        d3.select("#prefixContainerFor_"+ selector).remove();
        graph.options().removePrefix(selector);
        prefix_editMode=false; // <<TODO make some sanity checks
    }

    function enablePrefixEdit(){
        var selector=this.id.split("_")[1];
        var stl=this.elementStyle;
        if (stl==="edit") {
            d3.select("#prefixInputFor_" + selector).node().disabled = false;
            d3.select("#prefixURLFor_" + selector).node().disabled = false;
            // change the button content
            this.innerHTML = "\u2714";
            this.elementStyle="save";
            oldPrefix=d3.select("#prefixInputFor_" + selector).node().value;
            oldPrefixURL=d3.select("#prefixURLFor_" + selector).node().value;
            prefix_editMode=true;
        }
        if (stl==="save") {
            var newPrefixURL=d3.select("#prefixURLFor_" + selector).node().value;
            var newPrefix=d3.select("#prefixInputFor_" + selector).node().value;
            if (graph.options().updatePrefix(oldPrefix,newPrefix,oldPrefixURL,newPrefixURL)===true){
                d3.select("#prefixInputFor_" + newPrefix).node().disabled = true;
                d3.select("#prefixURLFor_" + newPrefix).node().disabled = true;
                // change the button content
                this.innerHTML = "\u270E";
                this.elementStyle="edit";
                prefix_editMode=false;
            }
        }
    }

    editSidebar.updateEditDeleteButtonIds=function(oldPrefix,newPrefix){
        d3.select("#prefixInputFor_"  + oldPrefix).node().id = "prefixInputFor_"  + newPrefix;
        d3.select("#prefixURLFor_"    + oldPrefix).node().id = "prefixURLFor_"    + newPrefix;
        d3.select("#deleteButtonFor_" + oldPrefix).node().id = "deleteButtonFor_" + newPrefix;
        d3.select("#editButtonFor_"   + oldPrefix).node().id = "editButtonFor_"   + newPrefix;
        d3.select("#prefixContainerFor_"   + oldPrefix).node().id = "prefixContainerFor_"   + newPrefix;
    };

    function setupCollapsing() {
        // TODO : Decision , for now I want to have the control over the collapse expand operation of the
        // TODO : elements, otherwise the old approach will also randomly collapse other containers

        // adapted version of this example: http://www.normansblog.de/simple-jquery-accordion/
        function collapseContainers(containers) {
            containers.classed("hidden", true);
        }

        function expandContainers(containers) {
            containers.classed("hidden", false);
        }

        var triggers = d3.selectAll(".accordion-trigger");

        // Collapse all inactive triggers on startup
        // collapseContainers(d3.selectAll(".accordion-trigger:not(.accordion-trigger-active) + div"));

        triggers.on("click", function () {
            var selectedTrigger = d3.select(this);
            if (selectedTrigger.classed("accordion-trigger-active")) {
                // Collapse the active (which is also the selected) trigger
                collapseContainers(d3.select(selectedTrigger.node().nextElementSibling));
                selectedTrigger.classed("accordion-trigger-active", false);
            } else {
                // Collapse the other trigger ...
                // collapseContainers(d3.selectAll(".accordion-trigger-active + div"));

                // ... and expand the selected one
                expandContainers(d3.select(selectedTrigger.node().nextElementSibling));
                selectedTrigger.classed("accordion-trigger-active", true);
            }
        });
    }
    return editSidebar;
};
