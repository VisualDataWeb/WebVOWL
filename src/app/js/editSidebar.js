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


    editSidebar.clearMetaObjectValue=function(){
        d3.select("#titleEditor").node().value="";
        d3.select("#iriEditor").node().value="";
        d3.select("#versionEditor").node().value="";
        d3.select("#authorsEditor").node().value="";
        d3.select("#descriptionEditor").node().value="";
        // todo add clear description;
    };

    editSidebar.setup = function () {
        setupCollapsing();
        setupPrefixList();
        setupAddPrefixButton();
        setupSupportedDatatypes();


        d3.select("#titleEditor")
            .on("change", function () {
                graph.options().addOrUpdateGeneralObjectEntry("title",d3.select("#titleEditor").node().value);
            })
            .on("keydown", function () {
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
        d3.select("#descriptionEditor")
            .on("change", function () {
                graph.options().addOrUpdateGeneralObjectEntry("description",d3.select("#descriptionEditor").node().value);
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
            identifier = "undefined";
            d3.select("#element_iriEditor").node().disabled = false;
            d3.select("#element_labelEditor").node().disabled = false;
        }
        element.label(identifier);
        element.dType(givenName);
        element.iri("http://www.w3.org/2001/XMLSchema#" + identifier);
        element.baseIri("http://www.w3.org/2001/XMLSchema#");
        element.redrawLabelText();

        d3.select("#element_iriEditor").node().value = prefixModule.getPrefixRepresentationForFullURI(element.iri());
        d3.select("#element_iriEditor").node().title = element.iri();
        d3.select("#element_labelEditor").node().value = element.labelForCurrentLanguage();
    }


    function identifyExternalCharacteristicForElement(ontoIRI,elementIRI){
        return (elementIRI.indexOf(ontoIRI)===-1);

    }
    function defaultIriValue(element){
        // get the iri of that element;
        if (graph.options().getGeneralMetaObject().iri){
            var str2Compare=graph.options().getGeneralMetaObject().iri+element.id();
            return element.iri()===str2Compare;
        }
        return false;
    }

    function getURLFROMPrefixedVersion(element){
        var url = d3.select("#element_iriEditor").node().value;
        var base=graph.options().getGeneralMetaObjectProperty("iri");
        if (validURL(url)===false){

            // make better usability
            // try to split element;
            var tokens=url.split(":");

            //console.log("try to split the input into prefix:name")
            console.log("Tokens");
            console.log(tokens);
            console.log("---------------");
            // TODO MORE VALIDATION TESTS
            if (tokens.length===2){
                var pr=tokens[0];
                var name=tokens[1];
                if (pr.length>0){
                    var basePref=graph.options().prefixList()[pr];
                    if (basePref===undefined){
                        console.log("ERROR __________________");
                        graph.options().warningModule().showWarning("Invalid Element IRI",
                            "Could not resolve prefix '"+ basePref+"'",
                            "Restoring previous IRI for Element"+element.iri(),1,false);
                        d3.select("#element_iriEditor").node().value=element.iri();
                        return;

                    }
                    // check if url is not empty

                    if (name.length===0){
                        graph.options().warningModule().showWarning("Invalid Element IRI",
                            "Input IRI is EMPTY",
                            "Restoring previous IRI for Element"+element.iri(),1,false);
                        console.log("NO INPUT PROVIDED");
                        d3.select("#element_iriEditor").node().value=element.iri();
                        return;

                    }
                    url=basePref+name;
                }
                else{
                    url=base+name;
                }
            }else{
                if (url.length===0){
                    //
                    console.log("NO INPUT PROVIDED");
                    d3.select("#element_iriEditor").node().value=element.iri();
                    return;
                }
                // failed to identify anything useful
                console.log("Tryig to use the input!");
                url=base+url;
            }
        }
        return url;
    }

    function changeIriForElement(element) {
        var  url=getURLFROMPrefixedVersion(element);
        var base=graph.options().getGeneralMetaObjectProperty("iri");
        var sanityCheckResult;
        if (elementTools.isNode(element)){

            sanityCheckResult=graph.checkIfIriClassAlreadyExist(url);
            if  (sanityCheckResult===false) {
                element.iri(url);
            }else{
                // throw warnign
                graph.options().warningModule().showWarning("Already seen this class",
                    "Input IRI: "+url+" for element: "+ element.labelForCurrentLanguage()+" already been set",
                    "Restoring previous IRI for Element : "+element.iri(),2,false, sanityCheckResult);

                 editSidebar.updateSelectionInformation(element);
                return;

            }
        }
        if (elementTools.isProperty(element)===true) {
            sanityCheckResult=editSidebar.checkProperIriChange(element,url);
            if (sanityCheckResult!== false){
                graph.options().warningModule().showWarning("Already seen this property",
                    "Input IRI: "+url+" for element: "+ element.labelForCurrentLanguage()+" already been set",
                    "Restoring previous IRI for Element : "+element.iri(),1,false, sanityCheckResult);

                editSidebar.updateSelectionInformation(element);
                return;
            }
        }

        // if (element.existingPropertyIRI(url)===true){
        //     console.log("I Have seen this Particular URL already "+url);
        //     graph.options().warningModule().showWarning("Already Seen This one ",
        //         "Input IRI For Element"+ element.labelForCurrentLanguage()+" already been set  ",
        //         "Restoring previous IRI for Element"+element.iri(),1,false);
        //     d3.select("#element_iriEditor").node().value=graph.options().prefixModule().getPrefixRepresentationForFullURI(element.iri());
        //     editSidebar.updateSelectionInformation(element);
        //     return;
        // }

        element.iri(url);
        if (identifyExternalCharacteristicForElement(base,url)===true){
            addAttribute(element,"external");
            // background color for external element;
            element.backgroundColor("#36C");
            element.redrawElement();
            element.redrawLabelText();
            // handle visual selection

        }else{
            removeAttribute(element,"external");
            // background color for external element;
            element.backgroundColor(undefined);
            element.redrawElement();
            element.redrawLabelText();

        }

        if (element.focused()){
            graph.options().focuserModule().handle(element,true); // unfocus
            graph.options().focuserModule().handle(element,true); // focus
        }
        // graph.options().focuserModule().handle(undefined);



        d3.select("#element_iriEditor").node().value=prefixModule.getPrefixRepresentationForFullURI(url);
        editSidebar.updateSelectionInformation(element);
    }

    function validURL(str) {
        var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(str);
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

    editSidebar.checkForExistingURL=function(url){
            var i;
            var allProps=graph.getUnfilteredData().properties;
            for( i=0;  i< allProps.length; i++) {
                if (allProps[i].iri()===url) return true;
            }
            return false;

    };
    editSidebar.checkProperIriChange = function (element,url){
        console.log("Element changed Label");
        console.log("Testing URL "+url);
        if (element.type()==="rdfs:subClassOf" || element.type()==="owl:disjointWith"){
            console.log("ignore this for now, already handled in the type and domain range changer");
        }else{
            var i;
            var allProps=graph.getUnfilteredData().properties;
            for( i=0;  i< allProps.length; i++) {
                if (allProps[i] === element) continue;
                if (allProps[i].iri()===url) return allProps[i];
            }
        }
        return false;
    };

    editSidebar.updateSelectionInformation = function (element) {

        if (element === undefined) {
            // show hint;
            d3.select("#selectedElementProperties").classed("hidden", true);
            d3.select("#selectedElementPropertiesEmptyHint").classed("hidden", false);
            selectedElementForCharacteristics = null;
            editSidebar.updateElementWidth();
        }
        else {
            d3.select("#selectedElementProperties").classed("hidden", false);
            d3.select("#selectedElementPropertiesEmptyHint").classed("hidden", true);
            d3.select("#typeEditForm_datatype").classed("hidden", true);

            // set the element IRI, and labels
            d3.select("#element_iriEditor").node().value = element.iri();
            d3.select("#element_labelEditor").node().value = element.labelForCurrentLanguage();
            d3.select("#element_iriEditor").node().title=element.iri();

            d3.select("#element_iriEditor")
                .on("change", function () {
                    var elementIRI=element.iri();
                    var prefixed=graph.options().prefixModule().getPrefixRepresentationForFullURI(elementIRI);
                    if (prefixed===d3.select("#element_iriEditor").node().value){
                        console.log("Iri is identical, nothing has changed!");
                        return;
                    }

                    changeIriForElement(element);
                })
                .on("keydown", function () {
                    d3.event.stopPropagation();
                    if (d3.event.keyCode === 13) {
                        d3.event.preventDefault();
                        console.log("IRI CHANGED Via ENTER pressed");
                        changeIriForElement(element);
                        d3.select("#element_iriEditor").node().title=element.iri();
                    }
                });

            var forceIRISync=defaultIriValue(element);
            d3.select("#element_labelEditor")
                .on("change", function () {
                    var sanityCheckResult;
                    console.log("Element changed Label");
                    var url=getURLFROMPrefixedVersion(element);
                    if (element.iri()!==url) {
                        if (elementTools.isProperty(element) === true) {
                            sanityCheckResult = editSidebar.checkProperIriChange(element, url);
                            if (sanityCheckResult !== false) {
                                graph.options().warningModule().showWarning("Already seen this property",
                                    "Input IRI: " + url + " for element: " + element.labelForCurrentLanguage() + " already been set",
                                    "Continuing with duplicate property!", 1, false, sanityCheckResult);
                                editSidebar.updateSelectionInformation(element);
                                return;
                            }
                        }

                        if (elementTools.isNode(element) === true) {
                            sanityCheckResult = graph.checkIfIriClassAlreadyExist(url);
                            if (sanityCheckResult !== false) {
                                graph.options().warningModule().showWarning("Already seen this Class",
                                    "Input IRI: " + url + " for element: " + element.labelForCurrentLanguage() + " already been set",
                                    "Restoring previous IRI for Element : " + element.iri(), 2, false, sanityCheckResult);

                                editSidebar.updateSelectionInformation(element);
                                return;
                            }
                        }
                        element.iri(url);
                    }
                    changeLabelForElement(element);
                    editSidebar.updateSelectionInformation(element); // prevents that it will be changed if node is still active
                })
                .on("keydown", function () {
                    d3.event.stopPropagation();
                    if (d3.event.keyCode === 13) {
                        d3.event.preventDefault();
                        var sanityCheckResult;
                        console.log("Element changed Label");
                        var url=getURLFROMPrefixedVersion(element);
                        if (element.iri()!==url) {
                            if (elementTools.isProperty(element) === true) {
                                sanityCheckResult = editSidebar.checkProperIriChange(element, url);
                                if (sanityCheckResult !== false) {
                                    graph.options().warningModule().showWarning("Already seen this property",
                                        "Input IRI: " + url + " for element: " + element.labelForCurrentLanguage() + " already been set",
                                        "Continuing with duplicate property!", 1, false, sanityCheckResult);

                                    editSidebar.updateSelectionInformation(element);
                                    return;
                                }
                            }

                            if (elementTools.isNode(element) === true) {
                                sanityCheckResult = graph.checkIfIriClassAlreadyExist(url);
                                if (sanityCheckResult !== false) {
                                    graph.options().warningModule().showWarning("Already seen this Class",
                                        "Input IRI: " + url + " for element: " + element.labelForCurrentLanguage() + " already been set",
                                        "Restoring previous IRI for Element : " + element.iri(), 2, false, sanityCheckResult);

                                    editSidebar.updateSelectionInformation(element);
                                    return;
                                }
                            }
                            element.iri(url);
                        }
                        changeLabelForElement(element);
                    }
                })
                .on("keyup", function(){
                    if (forceIRISync){
                            var labelName= d3.select("#element_labelEditor").node().value;
                            var resourceName=labelName.replaceAll(" ","_");
                            var syncedIRI=element.baseIri()+resourceName;

                            //element.iri(syncedIRI);
                            d3.select("#element_iriEditor").node().title=element.iri();
                            d3.select("#element_iriEditor").node().value=prefixModule.getPrefixRepresentationForFullURI(syncedIRI);
                        }
                });
            // check if we are allowed to change IRI OR LABEL
            d3.select("#element_iriEditor").node().disabled = false;
            d3.select("#element_labelEditor").node().disabled = false;

            if (element.type() === "rdfs:subClassOf") {
                d3.select("#element_iriEditor").node().value = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
                d3.select("#element_iriEditor").node().title= "http://www.w3.org/2000/01/rdf-schema#subClassOf";
                d3.select("#element_labelEditor").node().value = "Subclass of";
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;
            }
            if (element.type() === "owl:Thing") {
                d3.select("#element_iriEditor").node().value = "http://www.w3.org/2002/07/owl#Thing";
                d3.select("#element_iriEditor").node().title= "http://www.w3.org/2002/07/owl#Thing";
                d3.select("#element_labelEditor").node().value = "Thing";
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;
            }

            if (element.type() === "owl:disjointWith") {
                d3.select("#element_iriEditor").node().value = "http://www.w3.org/2002/07/owl#disjointWith";
                d3.select("#element_iriEditor").node().title= "http://www.w3.org/2002/07/owl#disjointWith";
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;
            }

            if (element.type() === "rdfs:Literal") {
                d3.select("#element_iriEditor").node().value = "http://www.w3.org/2000/01/rdf-schema#Literal";
                d3.select("#element_iriEditor").node().title = "http://www.w3.org/2000/01/rdf-schema#Literal";
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;
                element.iri("http://www.w3.org/2000/01/rdf-schema#Literal");
            }
            if (element.type() === "rdfs:Datatype") {
                var datatypeEditorSelection = d3.select("#typeEditor_datatype");
                d3.select("#typeEditForm_datatype").classed("hidden", false);
                element.iri("http://www.w3.org/2000/01/rdf-schema#Datatype");
                d3.select("#element_iriEditor").node().value = "http://www.w3.org/2000/01/rdf-schema#Datatype";
                d3.select("#element_iriEditor").node().title = "http://www.w3.org/2000/01/rdf-schema#Datatype";
                d3.select("#element_iriEditor").node().disabled = true;
                d3.select("#element_labelEditor").node().disabled = true;

                datatypeEditorSelection.node().value = element.dType();
                if (datatypeEditorSelection.node().value === "undefined") {
                    d3.select("#element_iriEditor").node().disabled = true; // always prevent IRI modifications
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
                typeEditorSelection.removeChild(htmlCollection[0]);

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
            var fullURI=d3.select("#element_iriEditor").node().value;
            d3.select("#element_iriEditor").node().value=prefixModule.getPrefixRepresentationForFullURI(fullURI);
            d3.select("#element_iriEditor").node().title=fullURI;
            editSidebar.updateElementWidth();
        }

    };

    editSidebar.updateGeneralOntologyInfo=function(){
        var preferredLanguage = graph && graph.language ? graph.language() : null;

      // get it from graph.options
        var generalMetaObj=graph.options().getGeneralMetaObject();
        if (generalMetaObj.hasOwnProperty("title")) {
            // title has language to it -.-
            if (typeof generalMetaObj.title==="object") {
                d3.select("#titleEditor").node().value = languageTools.textInLanguage(generalMetaObj.title, preferredLanguage);
            }else
            d3.select("#titleEditor").node().value = generalMetaObj.title;
        }
        if (generalMetaObj.hasOwnProperty("iri"))     d3.select("#iriEditor")    .node().value=generalMetaObj.iri;
        if (generalMetaObj.hasOwnProperty("version")) d3.select("#versionEditor").node().value=generalMetaObj.version;
        if (generalMetaObj.hasOwnProperty("author"))  d3.select("#authorsEditor").node().value=generalMetaObj.author;


        if (generalMetaObj.hasOwnProperty("description")){

            if (typeof generalMetaObj.description==="object")
                d3.select("#descriptionEditor").node().value=
                    languageTools.textInLanguage(generalMetaObj.description, preferredLanguage);
            else
                d3.select("#descriptionEditor").node().value=generalMetaObj.description;
        }
        else
            d3.select("#descriptionEditor").node().value="No Description";
    };

    editSidebar.updateElementWidth=function () {
        var height = window.innerHeight - 40;
        var lsb_offset=d3.select("#logo").node().getBoundingClientRect().height+5;
        var lsb_height=height-lsb_offset;
        d3.select("#containerForLeftSideBar").style("top",lsb_offset+"px");
        d3.select("#leftSideBarCollapseButton").style("top",lsb_offset+"px");
        d3.select("#containerForLeftSideBar").style("height",lsb_height+"px");

    var div_width = d3.select("#generalDetailsEdit").node().getBoundingClientRect().width ;
    div_width+=10;
    // title :
    //     //TODO layout bug<< bounding rect returns wrong value oO
    //     console.log("Div WIDTH="+d3.select("#generalDetailsEdit").node().getBoundingClientRect());

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
        if (containerWidth!==0) {
            var prefixWdith = d3.selectAll(".prefixInput").node().getBoundingClientRect().width;
            d3.selectAll(".prefixURL").style("width", containerWidth - prefixWdith - 45 + "px");
        }



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
                charSelectionNode.node().removeChild(htmlCollection[0]);
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
            if (elementTools.isDatatypeProperty(element)===true){
                arrayOfPropertyChars=["deprecated", "functional"];
            }
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
            if ( graph.changeNodeType(element)===false) {
                //restore old value

                if (elementTools.isDatatype(element)===true){

                }
                editSidebar.updateSelectionInformation(element);
            }
        }

        if (elementTools.isProperty(element)){
            if (graph.changePropertyType(element)===false){
                //restore old value
                editSidebar.updateSelectionInformation(element);

            }
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
