/**
 * Contains the logic for the sidebar.
 * @param graph the graph that belongs to these controls
 * @returns {{}}
 */
module.exports = function (graph) {

    var editSidebar = {},
        languageTools = webvowl.util.languageTools(),
        elementTools = webvowl.util.elementTools();

    var prefixModule=webvowl.util.prefixTools(graph);
    var selectedElementForCharacteristics;
    var oldPrefix, oldPrefixURL;
    var prefix_editMode = false;
    editSidebar.setup = function () {
        setupCollapsing();
        setupPrefixList();
        setupAddPrefixButton();
        setupSupportedDatatypes();


        console.log("creating title editor handler");
        console.log(d3.select("#titleEditor"));
        d3.select("#titleEditor")
            .on("change", function () {
                console.log("change title editor");
                graph.options().addOrUpdateGeneralObjectEntry("title",d3.select("#titleEditor").node().value);
            })
            .on("keydown", function () {
                console.log("A Key is Pressed");
                d3.event.stopPropagation();
                if (d3.event.keyCode === 13) {
                    d3.event.preventDefault();
                    graph.options().addOrUpdateGeneralObjectEntry("title",d3.select("#titleEditor").node().value);
                }
            });
        d3.select("#iriEditor")
            .on("change", function () {
                if (graph.options().addOrUpdateGeneralObjectEntry("iri",d3.select("#iriEditor").node().value)===false){
                    // restore value
                    d3.select("#iriEditor").node().value=graph.options().getGeneralMetaObjectProperty('iri');
                }
            })
            .on("keydown", function () {
                d3.event.stopPropagation();
                if (d3.event.keyCode === 13) {
                    d3.event.preventDefault();
                    if (graph.options().addOrUpdateGeneralObjectEntry("iri",d3.select("#iriEditor").node().value)===false){
                        // restore value
                        d3.select("#iriEditor").node().value=graph.options().getGeneralMetaObjectProperty('iri');
                    }
                }
            });
        d3.select("#versionEditor")
            .on("change", function () {
                graph.options().addOrUpdateGeneralObjectEntry("version",d3.select("#versionEditor").node().value);
            })
            .on("keydown", function () {
                d3.event.stopPropagation();
                if (d3.event.keyCode === 13) {
                    d3.event.preventDefault();
                    graph.options().addOrUpdateGeneralObjectEntry("version",d3.select("#versionEditor").node().value);
                }
            });
        d3.select("#authorsEditor")
            .on("change", function () {
                graph.options().addOrUpdateGeneralObjectEntry("author",d3.select("#authorsEditor").node().value);
            })
            .on("keydown", function () {
                d3.event.stopPropagation();
                if (d3.event.keyCode === 13) {
                    d3.event.preventDefault();
                    graph.options().addOrUpdateGeneralObjectEntry("author",d3.select("#authorsEditor").node().value);
                }
            });


    };

    function setupSupportedDatatypes() {
        var datatypeEditorSelection = d3.select("#typeEditor_datatype").node();
        var supportedDatatypes = ["undefined", "xsd:boolean", "xsd:double", "xsd:integer", "xsd:string"];
        for (var i = 0; i < supportedDatatypes.length; i++) {
            var optB = document.createElement('option');
            optB.innerHTML = supportedDatatypes[i];
            datatypeEditorSelection.appendChild(optB);
        }
    }

    function setupAddPrefixButton() {
        var btn = d3.select("#addPrefixButton");
        btn.on("click", function () {

            // check if we are still in editMode?
            if (prefix_editMode === false) {
                // create new line entry;
                var name = "emptyPrefixEntry";
                var prefixListContainer = d3.select("#prefixURL_Container");
                var prefixEditContainer = prefixListContainer.append("div");
                prefixEditContainer.classed("prefixIRIElements", true);
                prefixEditContainer.node().id = "prefixContainerFor_" + name;

                var editButton = prefixEditContainer.append("span");
                editButton.classed("editPrefixButton", true);
                editButton.classed("noselect", true);
                editButton.node().innerHTML = "\u2714";
                editButton.node().id = "editButtonFor_" + name;
                editButton.node().title = "Save new prefix and IRI";
                editButton.node().elementStyle = "save";

                var prefInput = prefixEditContainer.append("input");
                prefInput.classed("prefixInput", true);
                prefInput.node().type = "text";
                prefInput.node().id = "prefixInputFor_" + name;
                prefInput.node().autocomplete = "off";
                prefInput.node().value = "";

                var prefURL = prefixEditContainer.append("input");
                prefURL.classed("prefixURL", true);
                prefURL.node().type = "text";
                prefURL.node().id = "prefixURLFor_" + name;
                prefURL.node().autocomplete = "off";
                prefURL.node().value = "";

                prefInput.node().disabled = false;
                prefURL.node().disabled = false;
                prefix_editMode = true;

                var deleteButton = prefixEditContainer.append("span");
                deleteButton.classed("deletePrefixButton", true);
                deleteButton.classed("noselect", true);
                deleteButton.node().innerHTML = "\u2717";
                deleteButton.node().id = "deleteButtonFor_" + name;
                deleteButton.node().title = "Delete prefix and IRI";

                // connect the buttons;
                editButton.on("click", enablePrefixEdit);
                deleteButton.on("click", deletePrefixLine);

                editSidebar.updateElementWidth();
                // swap focus to prefixInput
                prefInput.node().focus();
                oldPrefix = name;
                oldPrefixURL = "";
                d3.select("#addPrefixButton").node().innerHTML="Save Prefix";
            }else{
                //console.log("execute the save action");
                d3.select("#editButtonFor_emptyPrefixEntry").node().click();
            }

        });

    }

    function setupPrefixList() {
        var prefixListContainer = d3.select("#prefixURL_Container");
        var prefixElements = graph.options().prefixList();
        for (var name in prefixElements) {
            if (prefixElements.hasOwnProperty(name)) {
                var prefixEditContainer = prefixListContainer.append("div");
                prefixEditContainer.classed("prefixIRIElements", true);
                prefixEditContainer.node().id = "prefixContainerFor_" + name;

                // create edit button which enables the input fields
                var editButton = prefixEditContainer.append("span");
                editButton.classed("editPrefixButton", true);
                editButton.classed("noselect", true);
                editButton.node().innerHTML = "\u270E";
                editButton.node().id = "editButtonFor_" + name;
                editButton.node().title = "Edit prefix and IRI";
                editButton.node().elementStyle = "edit";

                // create input field for prefix
                var prefInput = prefixEditContainer.append("input");
                prefInput.classed("prefixInput", true);
                prefInput.node().type = "text";
                prefInput.node().id = "prefixInputFor_" + name;
                prefInput.node().autocomplete = "off";
                prefInput.node().value = name;

                // create input field for prefix url
                var prefURL = prefixEditContainer.append("input");
                prefURL.classed("prefixURL", true);
                prefURL.node().type = "text";
                prefURL.node().id = "prefixURLFor_" + name;
                prefURL.node().autocomplete = "off";
                prefURL.node().value = prefixElements[name];
                prefURL.node().title= prefixElements[name];
                // disable the input fields (already defined elements can be edited later)
                prefInput.node().disabled = true;
                prefURL.node().disabled = true;

                // create the delete button
                var deleteButton = prefixEditContainer.append("span");
                deleteButton.classed("deletePrefixButton", true);
                deleteButton.classed("noselect", true);
                deleteButton.node().innerHTML = "\u2717";
                deleteButton.node().id = "deleteButtonFor_" + name;
                deleteButton.node().title = "Delete prefix and IRI";

                editButton.on("click", enablePrefixEdit);
                deleteButton.on("click", deletePrefixLine);

                // EXPERIMENTAL

                if (name==="rdf"  ||
                    name==="rdfs" ||
                    name==="xsd"  ||
                    name==="owl"
                ){
                    // make them invis so the spacing does not change
                    deleteButton.classed("invisiblePrefixButton",true);
                    deleteButton.classed("deletePrefixButton", false);
                    editButton.classed("invisiblePrefixButton",true);
                    editButton.classed("editPrefixButton",false);
                    editButton.node().disabled=true;
                    deleteButton.node().disabled=true;
                }
            }
        }
        prefixModule.updatePrefixModel();
    }

    function deletePrefixLine() {
        if (this.disabled===true) return;
        d3.select("#addPrefixButton").node().innerHTML="Add Prefix";
        var selector = this.id.split("_")[1];
        d3.select("#prefixContainerFor_" + selector).remove();
        graph.options().removePrefix(selector);
        prefix_editMode = false; // <<TODO make some sanity checks
        prefixModule.updatePrefixModel();
    }

    function enablePrefixEdit() {
        if (this.disabled===true) return;
        console.log("this");
        console.log(this);
        var selector = this.id.split("_")[1];
        var stl = this.elementStyle;
        if (stl === "edit") {
            d3.select("#prefixInputFor_" + selector).node().disabled = false;
            d3.select("#prefixURLFor_" + selector).node().disabled = false;
            // change the button content
            this.innerHTML = "\u2714";
            this.elementStyle = "save";
            oldPrefix = d3.select("#prefixInputFor_" + selector).node().value;
            oldPrefixURL = d3.select("#prefixURLFor_" + selector).node().value;
            prefix_editMode = true;
            this.title = "Save new prefix and IRI";
        }
        if (stl === "save") {
            var newPrefixURL = d3.select("#prefixURLFor_" + selector).node().value;
            var newPrefix = d3.select("#prefixInputFor_" + selector).node().value;


            if (graph.options().updatePrefix(oldPrefix, newPrefix, oldPrefixURL, newPrefixURL) === true) {
                d3.select("#prefixInputFor_" + newPrefix).node().disabled = true;
                d3.select("#prefixURLFor_" + newPrefix).node().disabled = true;
                d3.select("#addPrefixButton").node().innerHTML="Add Prefix";
                this.title = "Edit prefix and IRI";

                // change the button content
                this.innerHTML = "\u270E";
                this.elementStyle = "edit";
                prefix_editMode = false;
                prefixModule.updatePrefixModel();
            }
        }
    }

    function changeDatatypeType(element) {
        var datatypeEditorSelection = d3.select("#typeEditor_datatype").node();
        var givenName = datatypeEditorSelection.value;
        var identifier = givenName.split(":")[1];

        if (datatypeEditorSelection.value !== "undefined") {
            d3.select("#element_iriEditor").node().disabled = true;
            d3.select("#element_labelEditor").node().disabled = true;
        } else {
            identifier = "Undefined Datatype";
            d3.select("#element_iriEditor").node().disabled = false;
            d3.select("#element_labelEditor").node().disabled = false;
        }
        element.label(identifier);
        element.dType(givenName);
        element.iri("http://www.w3.org/2001/XMLSchema#" + identifier);
        element.baseIri("http://www.w3.org/2001/XMLSchema#");
        element.redrawLabelText();

        d3.select("#element_iriEditor").node().value = element.iri();
        d3.select("#element_labelEditor").node().value = element.labelForCurrentLanguage();
    }

    function changeIriForElement(element) {
        var url = d3.select("#element_iriEditor").node().value;

        // TODO : IF VALID URL ?
         // NO >> TRY TO SEE IF THERE IS A PREFIX THAT EXIST
         //       THEN SET URI TO THE PREFIX + URL -BASE URI

        element.iri(url);
        d3.select("#element_iriEditor").node().value=prefixModule.getPrefixRepresentationForFullURI(url);

    }

    function changeLabelForElement(element) {
        element.label(d3.select("#element_labelEditor").node().value);
        element.redrawLabelText();
    }

    editSidebar.updateEditDeleteButtonIds = function (oldPrefix, newPrefix) {
        d3.select("#prefixInputFor_" + oldPrefix).node().id = "prefixInputFor_" + newPrefix;
        d3.select("#prefixURLFor_" + oldPrefix).node().id = "prefixURLFor_" + newPrefix;
        d3.select("#deleteButtonFor_" + oldPrefix).node().id = "deleteButtonFor_" + newPrefix;
        d3.select("#editButtonFor_" + oldPrefix).node().id = "editButtonFor_" + newPrefix;
        d3.select("#prefixContainerFor_" + oldPrefix).node().id = "prefixContainerFor_" + newPrefix;
    };

    editSidebar.updateSelectionInformation = function (element) {
        if (element === undefined) {
            // show hint;
            d3.select("#selectedElementProperties").classed("hidden", true);
            d3.select("#selectedElementPropertiesEmptyHint").classed("hidden", false);
            selectedElementForCharacteristics = null;
        }
        else {
            d3.select("#selectedElementProperties").classed("hidden", false);
            d3.select("#selectedElementPropertiesEmptyHint").classed("hidden", true);
            d3.select("#typeEditForm_datatype").classed("hidden", true);

            // set the element IRI, and labels
            d3.select("#element_iriEditor").node().value = element.iri();
            d3.select("#element_labelEditor").node().value = element.labelForCurrentLanguage();


            d3.select("#element_iriEditor")
                .on("change", function () {
                    changeIriForElement(element);
                })
                .on("keydown", function () {
                    d3.event.stopPropagation();
                    if (d3.event.keyCode === 13) {
                        d3.event.preventDefault();
                        changeIriForElement(element);
                    }
                });


            d3.select("#element_labelEditor")
                .on("change", function () {
                    changeLabelForElement(element);
                })
                .on("keydown", function () {
                    d3.event.stopPropagation();
                    if (d3.event.keyCode === 13) {
                        d3.event.preventDefault();
                        changeLabelForElement(element);
                    }
                });
            // check if we are allowed to change IRI OR LABEL
            d3.select("#element_iriEditor").node().disabled = false;
            d3.select("#element_labelEditor").node().disabled = false;

            if (element.type() === "rdfs:subClassOf") {
                d3.select("#element_iriEditor").node().value = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
                d3.select("#element_labelEditor").node().value = "Subclass of";
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;
            }
            if (element.type() === "owl:Thing") {
                d3.select("#element_iriEditor").node().value = "http://www.w3.org/2002/07/owl#Thing";
                d3.select("#element_labelEditor").node().value = "Thing";
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;
            }
            if (element.type() === "rdfs:Literal") {
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;
            }
            if (element.type() === "rdfs:Datatype") {
                var datatypeEditorSelection = d3.select("#typeEditor_datatype");
                d3.select("#typeEditForm_datatype").classed("hidden", false);
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;

                datatypeEditorSelection.node().value = element.dType();
                if (datatypeEditorSelection.node().value === "undefined") {
                    d3.select("#element_iriEditor").node().disabled = false;
                    d3.select("#element_labelEditor").node().disabled = false;
                }
                // reconnect the element
                datatypeEditorSelection.on("change", function () {
                    changeDatatypeType(element);
                });
            }

            // add type selector
            var typeEditorSelection = d3.select("#typeEditor").node();
            var htmlCollection = typeEditorSelection.children;
            var numEntries = htmlCollection.length;
            var i;
            var elementPrototypes = getElementPrototypes(element);
            for (i = 0; i < numEntries; i++)
                htmlCollection[0].remove();

            for (i = 0; i < elementPrototypes.length; i++) {
                var optA = document.createElement('option');
                optA.innerHTML = elementPrototypes[i];
                typeEditorSelection.appendChild(optA);
            }
            // set the proper value in the selection
            typeEditorSelection.value = element.type();
            d3.select("#typeEditor").on("change", function () {
                elementTypeSelectionChanged(element);
            });


            // add characteristics selection
            var needChar = elementNeedsCharacteristics(element);
            d3.select("#property_characteristics_Container").classed("hidden", !needChar);
            if (needChar === true) {
                addElementsCharacteristics(element);
            }
            editSidebar.updateElementWidth();
            var fullURI=d3.select("#element_iriEditor").node().value;
            d3.select("#element_iriEditor").node().value=prefixModule.getPrefixRepresentationForFullURI(fullURI);

        }

    };

    editSidebar.updateGeneralOntologyInfo=function(){
      // get it from graph.options
        var generalMetaObj=graph.options().getGeneralMetaObject();
        if (generalMetaObj.hasOwnProperty("title")) {
            // title has language to it -.-
            if (typeof generalMetaObj.title==="object") {
                console.log("ITS AN OBJECT!!!>>>>>>>>>>>>>>");
                var preferredLanguage = graph && graph.language ? graph.language() : null;
                d3.select("#titleEditor").node().value = languageTools.textInLanguage(generalMetaObj.title, preferredLanguage);
            }else
            d3.select("#titleEditor").node().value = generalMetaObj.title;
        }
        if (generalMetaObj.hasOwnProperty("iri"))     d3.select("#iriEditor")    .node().value=generalMetaObj.iri;
        if (generalMetaObj.hasOwnProperty("version")) d3.select("#versionEditor").node().value=generalMetaObj.version;
        if (generalMetaObj.hasOwnProperty("author"))  d3.select("#authorsEditor").node().value=generalMetaObj.author;


    };

    editSidebar.updateElementWidth=function () {
    var div_width = d3.select("#generalDetailsEdit").node().getBoundingClientRect().width + 10;
    // title :

    var title_labelWidth   = d3.select("#titleEditor-label"  ).node().getBoundingClientRect().width + 20;
    var iri_labelWidth     = d3.select("#iriEditor-label"    ).node().getBoundingClientRect().width + 20;
    var version_labelWidth = d3.select("#versionEditor-label").node().getBoundingClientRect().width + 20;
    var author_labelWidth  = d3.select("#authorsEditor-label").node().getBoundingClientRect().width + 20;
    //find max width;
    var maxW = 0;
    maxW = Math.max(maxW, title_labelWidth);
    maxW = Math.max(maxW, iri_labelWidth);
    maxW = Math.max(maxW, version_labelWidth);
    maxW = Math.max(maxW, author_labelWidth);

    var meta_inputWidth = div_width - maxW - 10;

    d3.select("#titleEditor"  ).style("width", meta_inputWidth + "px");
    d3.select("#iriEditor"    ).style("width", meta_inputWidth + "px");
    d3.select("#versionEditor").style("width", meta_inputWidth + "px");
    d3.select("#authorsEditor").style("width", meta_inputWidth + "px");
    //

    var elementIri_width  = d3.select("#element_iriEditor-label").node().getBoundingClientRect().width + 20;
    var elementLabel_width  = d3.select("#element_labelEditor-label").node().getBoundingClientRect().width + 20;
    var elementType_width  = d3.select("#typeEditor-label").node().getBoundingClientRect().width + 20;
    var elementDType_width  = d3.select("#typeEditor_datatype-label").node().getBoundingClientRect().width + 20;

    maxW=0;
    maxW = Math.max(maxW, elementIri_width);
    maxW = Math.max(maxW, elementLabel_width);
    maxW = Math.max(maxW, elementType_width);
    maxW = Math.max(maxW, elementDType_width);
    var selectedElement_inputWidth = div_width - maxW - 10;

    d3.select("#element_iriEditor"    ).style("width", selectedElement_inputWidth + "px");
    d3.select("#element_labelEditor"  ).style("width", selectedElement_inputWidth + "px");
    d3.select("#typeEditor"           ).style("width", selectedElement_inputWidth+4 + "px");
    d3.select("#typeEditor_datatype"  ).style("width", selectedElement_inputWidth+4 + "px");

    // update prefix Element width;

        var containerWidth=d3.select("#containerForPrefixURL").node().getBoundingClientRect().width;
        var prefixWdith=d3.selectAll(".prefixInput").node().getBoundingClientRect().width;
        d3.selectAll(".prefixURL").style("width", containerWidth-prefixWdith-45+ "px");


    // var desc_width = div_width - 30;
    // d3.select("#descriptionEditor").style("width", desc_width + "px");
    //
    //
    // //same for the property and class selection
    // var propIRI_labelWidth = d3.select("#propIRI-Editor-label").node().getBoundingClientRect().width + 10;
    // var propName_labelWidth = d3.select("#propnameEditor-label").node().getBoundingClientRect().width + 10;
    // var propType_labelWidth = d3.select("#proptypeEditor-label").node().getBoundingClientRect().width + 10;
    //
    // var nodeIRI_labelWidth = d3.select("#nodeIRI-Editor-label").node().getBoundingClientRect().width + 10;
    // var datatype_labelWidth = d3.select("#datatypeEditor-label").node().getBoundingClientRect().width + 10;
    // var nodeName_labelWidth = d3.select("#nameEditor-label").node().getBoundingClientRect().width + 10;
    // var nodetype_labelWidth = d3.select("#typeEditor-label").node().getBoundingClientRect().width + 10;
    //
    // var maxW_prop = 0, maxW_node = 0;
    // maxW_prop = Math.max(maxW_prop, propIRI_labelWidth);
    // maxW_prop = Math.max(maxW_prop, propName_labelWidth);
    // maxW_prop = Math.max(maxW_prop, propType_labelWidth);
    //
    // maxW_node = Math.max(maxW_node, nodeIRI_labelWidth);
    // maxW_node = Math.max(maxW_node, nodeName_labelWidth);
    // maxW_node = Math.max(maxW_node, nodetype_labelWidth);
    //
    // var node_inputWidth = div_width - maxW_node - 10;
    // var prop_inputWidth = div_width - maxW_prop - 10;
    //
    //
    // var dataTypeWidth = div_width - datatype_labelWidth - 10;
    //
    // // update the sizes;
    // d3.select("#nodeIRI-Editor").style("width", node_inputWidth + "px").style("height", title_labelHeight + "px");
    // d3.select("#nameEditor").style("width", node_inputWidth + "px").style("height", title_labelHeight + "px");
    // var nodeTypeWidth = node_inputWidth + 4;
    // d3.select("#typeEditor").style("width", nodeTypeWidth + "px");
    // d3.select("#datatypeEditor").style("width", dataTypeWidth + "px");
    //
    // d3.select("#propIRI-Editor").style("width", prop_inputWidth + "px").style("height", title_labelHeight + "px");
    // d3.select("#propnameEditor").style("width", prop_inputWidth + "px").style("height", title_labelHeight + "px");
    // var propTypeWidth = prop_inputWidth + 4;
    // d3.select("#proptypeEditor").style("width", propTypeWidth + "px");
    };

    function addElementsCharacteristics(element){
        // save selected element for checkbox handler
        selectedElementForCharacteristics=element;
        var i;
        // KILL old elements
        var charSelectionNode=d3.select("#property_characteristics_Selection");
        var htmlCollection = charSelectionNode.node().children;
        if (htmlCollection) {
            var numEntries = htmlCollection.length;
            for (var q = 0; q < numEntries; q++) {
                htmlCollection[0].remove();
            }
        }
        // datatypes kind of ignored by the elementsNeedCharacteristics function
        // so we need to check if we are a node or not
        if (element.attributes().indexOf("external")>-1){
            // add external span to the div;
            var externalCharSpan=charSelectionNode.append("span");
            externalCharSpan.classed("spanForCharSelection",true);
            externalCharSpan.node().innerHTML="external";
        }
        var filterContainer,
            filterCheckbox;
        if (elementTools.isNode(element)===true){
            // add the deprecated characteristic;
            var arrayOfNodeChars=["deprecated"];
            for (i=0;i<arrayOfNodeChars.length;i++){
                filterContainer = charSelectionNode
                    .append("div")
                    .classed("checkboxContainer", true)
                    .style("padding-top","2px");

                filterCheckbox = filterContainer.append("input")
                    .classed("filterCheckbox", true)
                    .attr("id", "CharacteristicsCheckbox"+i)
                    .attr("type", "checkbox")
                    .attr("characteristics", arrayOfNodeChars[i])
                    .property("checked", getPresentAttribute(element,arrayOfNodeChars[i]));
                //
                filterContainer.append("label")
                    .attr("for", "CharacteristicsCheckbox"+i)
                    .text(arrayOfNodeChars[i]);

                filterCheckbox.on("click", handleCheckBoxClick);

            }
        }

        else{
            // add the deprecated characteristic;
            var arrayOfPropertyChars=["deprecated","inverse functional", "functional", "transitive"];
            for (i=0;i<arrayOfPropertyChars.length;i++){
                filterContainer = charSelectionNode
                    .append("div")
                    .classed("checkboxContainer", true)
                    .style("padding-top","2px");

                filterCheckbox = filterContainer.append("input")
                    .classed("filterCheckbox", true)
                    .attr("id", "CharacteristicsCheckbox"+i)
                    .attr("type", "checkbox")
                    .attr("characteristics", arrayOfPropertyChars[i])
                    .property("checked", getPresentAttribute(element,arrayOfPropertyChars[i]));
                //
                filterContainer.append("label")
                    .attr("for", "CharacteristicsCheckbox"+i)
                    .text(arrayOfPropertyChars[i]);

                filterCheckbox.on("click", handleCheckBoxClick);

            }
        }


    }

    function getPresentAttribute(selectedElement,element){
        return (selectedElement.attributes().indexOf(element)>=0);
    }

    function handleCheckBoxClick(){
        var checked=this.checked;
        var char=this.getAttribute("characteristics");
        if (checked===true){
            addAttribute(selectedElementForCharacteristics,char);
        }else{
            removeAttribute(selectedElementForCharacteristics,char);
        }
        // graph.executeColorExternalsModule();
        selectedElementForCharacteristics.redrawElement();
        // workaround to have the node still be focused as rendering element
        selectedElementForCharacteristics.focused(false);
        selectedElementForCharacteristics.toggleFocus();

    }


    function addAttribute(selectedElement,char){
        if (selectedElement.attributes().indexOf(char) === -1) {
            // not found add it
            var attr = selectedElement.attributes();
            attr.push(char);
            selectedElement.attributes(attr);
        }// indications string update;
        if (selectedElement.indications().indexOf(char) === -1) {
           var indications = selectedElement.indications();
           indications.push(char);
           selectedElement.indications(indications);
        }
        // add visual attributes
        var visAttr;
        if (selectedElement.visualAttributes().indexOf(char) === -1) {
            visAttr= selectedElement.visualAttributes();
            visAttr.push(char);
            selectedElement.visualAttributes(visAttr);
        }
        if (getPresentAttribute(selectedElement,"external") && getPresentAttribute(selectedElement,"deprecated")){
            visAttr = selectedElement.visualAttributes();
            var visInd=visAttr.indexOf("external");
            if (visInd>-1) {
                visAttr.splice(visInd, 1);
            }
            selectedElement.visualAttributes(visAttr);
        }

    }

    function removeAttribute(selectedElement,element) {
        var attr = selectedElement.attributes();
        var indications = selectedElement.indications();
        var visAttr = selectedElement.visualAttributes();
        var attrInd = attr.indexOf(element);
        if (attrInd >= 0) {
            attr.splice(attrInd, 1);
        }
        var indInd = indications.indexOf(element);
        if (indInd > -1) {
            indications.splice(indInd, 1);
        }
        var visInd = visAttr.indexOf(element);
        if (visInd > -1) {
            visAttr.splice(visInd, 1);
        }
        selectedElement.attributes(attr);
        selectedElement.indications(indications);
        selectedElement.visualAttributes(visAttr);
        if (element === "deprecated") {
            // set its to its original Style
            //typeBaseThign
            // todo : fix all different types
            if (selectedElement.type() === "owl:Class") selectedElement.styleClass("class");
            if (selectedElement.type() === "owl:DatatypeProperty") selectedElement.styleClass("datatypeproperty");
            if (selectedElement.type() === "owl:ObjectProperty") selectedElement.styleClass("objectproperty");
            if (selectedElement.type() === "owl:disjointWith") selectedElement.styleClass("disjointwith");
        }
    }


    function elementNeedsCharacteristics(element){
        //TODO: Add more types
        if ( element.type()==="owl:Thing" ||
                    element.type()==="rdfs:subClassOf" ||
                    element.type()==="rdfs:Literal" ||
                    element.type()==="rdfs:Datatype" ||
                    element.type()==="rdfs:disjointWith")
            return false;

        // if (element.attributes().indexOf("external")||
        //     element.attributes().indexOf("deprecated"))
        //     return true;
       return true;

    }

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
        // TODO the text should be also complied with the prefixes loaded into the ontology
        if (elementTools.isProperty(selectedElement)){
            if (selectedElement.type()==="owl:DatatypeProperty")
                availiblePrototypes.push("owl:DatatypeProperty");
            else
            {
                availiblePrototypes.push("owl:ObjectProperty");
                // handling loops !
                if (selectedElement.domain()!==selectedElement.range()) {
                    availiblePrototypes.push("rdfs:subClassOf");
                }
                availiblePrototypes.push("owl:disjointWith");
                availiblePrototypes.push("owl:allValuesFrom");
                availiblePrototypes.push("owl:someValuesFrom");
            }
            return availiblePrototypes;
        }
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
            editSidebar.updateElementWidth();
        });
    }
    return editSidebar;
};
