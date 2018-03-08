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
        setupSupportedDatatypes();

	};

    function setupSupportedDatatypes(){
        var datatypeEditorSelection=d3.select("#typeEditor_datatype").node();
        var supportedDatatypes=["undefined", "xsd:boolean", "xsd:double", "xsd:integer", "xsd:string"];
        for (var i = 0; i < supportedDatatypes.length; i++) {
            var optB = document.createElement('option');
            optB.innerHTML = supportedDatatypes[i];
            datatypeEditorSelection.appendChild(optB);
        }
    }

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
        var prefixElements=graph.options().prefixList();
        for (var name in prefixElements){
            if (prefixElements.hasOwnProperty(name)){
            var prefixEditContainer=prefixListContainer.append("div");
                prefixEditContainer.classed("prefixIRIElements",true);
                prefixEditContainer.node().id="prefixContainerFor_"+name;

                // create edit button which enables the input fields
                var editButton=prefixEditContainer.append("span");
                editButton.classed("editPrefixButton",true);
                editButton.classed("noselect",true);
                editButton.node().innerHTML="\u270E";
                editButton.node().id="editButtonFor_"+name;
                editButton.node().title="Edit Prefix and URL";
                editButton.node().elementStyle="edit";

                // create input field for prefix
                var prefInput=prefixEditContainer.append("input");
                prefInput.classed("prefixInput",true);
                prefInput.node().type="text";
                prefInput.node().id="prefixInputFor_"+name;
                prefInput.node().autocomplete="off";
                prefInput.node().value=name;

                // create input field for prefix url
                var prefURL=prefixEditContainer.append("input");
                prefURL.classed("prefixURL",true);
                prefURL.node().type="text";
                prefURL.node().id="prefixURLFor_"+name;
                prefURL.node().autocomplete="off";
                prefURL.node().value=prefixElements[name];

                // disable the input fields (already defined elements can be edited later)
                prefInput.node().disabled=true;
                prefURL.node().disabled=true;

                // create the delete button
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

    function changeDatatypeType(element){
        var datatypeEditorSelection=d3.select("#typeEditor_datatype").node();
        var givenName=datatypeEditorSelection.value;
        var identifier=givenName.split(":")[1];

        if (datatypeEditorSelection.value!=="undefined"){
            d3.select("#element_iriEditor").node().disabled = true;
            d3.select("#element_labelEditor").node().disabled = true;
        }else{
            identifier="Undefined Datatype";
            d3.select("#element_iriEditor").node().disabled = false;
            d3.select("#element_labelEditor").node().disabled = false;
        }
        element.label(identifier);
        element.dType(givenName);
        element.iri("http://www.w3.org/2001/XMLSchema#"+identifier);
        element.baseIri("http://www.w3.org/2001/XMLSchema#");
        element.redrawLabelText();

        d3.select("#element_iriEditor").node().value=element.iri();
        d3.select("#element_labelEditor").node().value=element.labelForCurrentLanguage();
    }

    editSidebar.updateEditDeleteButtonIds=function(oldPrefix,newPrefix){
        d3.select("#prefixInputFor_"  + oldPrefix).node().id = "prefixInputFor_"  + newPrefix;
        d3.select("#prefixURLFor_"    + oldPrefix).node().id = "prefixURLFor_"    + newPrefix;
        d3.select("#deleteButtonFor_" + oldPrefix).node().id = "deleteButtonFor_" + newPrefix;
        d3.select("#editButtonFor_"   + oldPrefix).node().id = "editButtonFor_"   + newPrefix;
        d3.select("#prefixContainerFor_"   + oldPrefix).node().id = "prefixContainerFor_"   + newPrefix;
    };

    editSidebar.updateSelectionInformation=function(element){
        if( element === undefined){
            // show hint;
            d3.select("#selectedElementProperties").classed("hidden",true);
            d3.select("#selectedElementPropertiesEmptyHint").classed("hidden",false);
        }
        else{
            d3.select("#selectedElementProperties").classed("hidden",false);
            d3.select("#selectedElementPropertiesEmptyHint").classed("hidden",true);
            d3.select("#typeEditForm_datatype").classed("hidden",true);

            // set the element IRI, and labels
            d3.select("#element_iriEditor").node().value=element.iri();
            d3.select("#element_labelEditor").node().value=element.labelForCurrentLanguage();

            // check if we are allowed to change IRI OR LABEL
            d3.select("#element_iriEditor").node().disabled=false;
            d3.select("#element_labelEditor").node().disabled=false;

            if (element.type()==="rdfs:subClassOf"){
                d3.select("#element_iriEditor").node().value="http://www.w3.org/2000/01/rdf-schema#subClassOf";
                d3.select("#element_labelEditor").node().value="Subclass of";
                d3.select("#element_iriEditor").node().disabled=true;
                d3.select("#element_labelEditor").node().disabled=true;
            }
            if (element.type()==="owl:Thing"){
                d3.select("#element_iriEditor").node().value="http://www.w3.org/2002/07/owl#Thing";
                d3.select("#element_labelEditor").node().value="Thing";
                d3.select("#element_iriEditor").node().disabled=true;
                d3.select("#element_labelEditor").node().disabled=true;
            }
            if (element.type()==="rdfs:Datatype") {
                var datatypeEditorSelection=d3.select("#typeEditor_datatype");
                d3.select("#typeEditForm_datatype").classed("hidden",false);
                d3.select("#element_iriEditor").node().disabled = false;
                d3.select("#element_labelEditor").node().disabled = false;

                datatypeEditorSelection.node().value=element.dType();
                if (datatypeEditorSelection.node().value!=="undefined"){
                    d3.select("#element_iriEditor").node().disabled = true;
                    d3.select("#element_labelEditor").node().disabled = true;
                }
                // reconnect the element
                datatypeEditorSelection.on("change", function () {
                    changeDatatypeType(element);
                });

            }


            // add type selector
            var typeEditorSelection=d3.select("#typeEditor").node();
            var htmlCollection = typeEditorSelection.children;
            var numEntries = htmlCollection.length;
            var i;
            var elementPrototypes=getElementPrototypes(element);
            for (i = 0; i < numEntries; i++)
                htmlCollection[0].remove();

            for (i = 0; i < elementPrototypes.length; i++) {
                var optA = document.createElement('option');
                optA.innerHTML = elementPrototypes[i];
                typeEditorSelection.appendChild(optA);
            }
            // set the proper value in the selection
            typeEditorSelection.value=element.type();
            d3.select("#typeEditor").on("change",function(){
                elementTypeSelectionChanged(element);
            });

        }


    };

    function elementTypeSelectionChanged(element) {
        if (elementTools.isNode(element)){
            graph.changeNodeType(element);
        }

        if (elementTools.isProperty(element)){
            graph.changePropertyType(element);
        }
    }
    
    function getElementPrototypes(selectedElement){
        var availiblePrototypes=[];
        if (elementTools.isProperty(selectedElement)){
            //  console.log("The Property Map:-----------------------");
            if (selectedElement.type()==="owl:DatatypeProperty")
                availiblePrototypes.push("owl:DatatypeProperty");
            else
            {
                availiblePrototypes.push("owl:ObjectProperty");
                // handling loops !
                if (selectedElement.domain()!==selectedElement.range()) {
                    availiblePrototypes.push("rdfs:subClassOf");
                    availiblePrototypes.push("owl:disjointWith");
                }
            }
            // console.log(availiblePrototypes);
            return availiblePrototypes;
        }
        //  console.log("The Node Map:-----------------------");
        if(selectedElement.renderType()==="rect"){
            availiblePrototypes.push("rdfs:Literal");
            availiblePrototypes.push("rdfs:Datatype");
        }else {
            availiblePrototypes.push("owl:Class");
            availiblePrototypes.push("owl:Thing");
            //  TODO: ADD MORE TYPES
            // availiblePrototypes.push("owl:complementOf");
            // availiblePrototypes.push("owl:disjointUnionOf");
        }
        // console.log(availiblePrototypes);
        return availiblePrototypes;
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
