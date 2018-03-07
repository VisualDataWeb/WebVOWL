/**
 * Contains the logic for the sidebar.
 * @param graph the graph that belongs to these controls
 * @returns {{}}
 */
module.exports = function (graph) {

	var editSidebar = {},
		languageTools = webvowl.util.languageTools(),
		elementTools = webvowl.util.elementTools();

    editSidebar.setup=function(){
		console.log("Setup Edit SideBar");
        setupCollapsing();
        setupPrefixList();

	};

    function setupPrefixList(){
        var prefixListContainer=d3.select("#containerForPrefixURL");

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

            }

        }

        // THIS DOES NOT WORK >>> <<<
        // var editButtons=d3.selectAll(".prefixIRIElements::before");
        // console.log(editButtons);
        // var deleteButtons=d3.selectAll(".prefixIRIElements::after");
        // console.log(deleteButtons);


    }

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
