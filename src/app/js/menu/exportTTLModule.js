/**
 * Contains the logic for the export button.
 * @returns {{}}
 */
module.exports = function (graph) {
	var exportTTLModule={};
	var resultingTTLContent="";
	var currentNodes;
	var currentProperties;
    var prefixModule=webvowl.util.prefixTools(graph);

	exportTTLModule.requestExport=function(){
        prefixModule.updatePrefixModel();
        resultingTTLContent="";
        currentNodes=graph.getClassDataForTtlExport();
        currentProperties=graph.getPropertyDataForTtlExport();

        prepareHeader();
        preparePrefixList();
        prepareOntologyDef();
        resultingTTLContent+="#################################################################\r\n\r\n";

        preparePrefixRepresentation();

        exportProperties();
        exportClasses();

		// release the reference from elements to this module;
        currentNodes=null;
        currentProperties=null;
		return true;
	};

	function preparePrefixRepresentation(){
		var i;
        var allNodes=graph.getUnfilteredData().nodes;
        var allProps=graph.getUnfilteredData().properties;
		for (i=0;i<allNodes.length;i++){
            allNodes[i].prefixRepresentation=prefixModule.getPrefixRepresentationForFullURI(allNodes[i].iri());
		}
        for (i=0;i<allProps.length;i++){
            allProps[i].prefixRepresentation=prefixModule.getPrefixRepresentationForFullURI(allProps[i].iri());
        }
	}

	function exportProperties(){
	    if (currentProperties.length===0) return; // we dont need to write that
        resultingTTLContent+="###  Property Definitions (Number of Property) "+currentProperties.length+" ###\r\n";
        for (var i=0;i<currentProperties.length;i++) {
            resultingTTLContent += "#  "+currentProperties[i].prefixRepresentation +"  --------------------------- Property " + i + "------------------------- \r\n";
            resultingTTLContent += extractPropertyDescription(currentProperties[i]);
        }
	}

	function exportClasses(){
        if (currentNodes.length===0) return; // we dont need to write that
        resultingTTLContent+="###  Class Definitions (Number of Classes) "+currentNodes.length+" ###\r\n";
        for (var i=0;i<currentNodes.length;i++) {
            resultingTTLContent += "#  "+currentNodes[i].prefixRepresentation +"  --------------------------- Class  " + i + "------------------------- \r\n";
            resultingTTLContent += extractClassDescription(currentNodes[i]);
        }
    }

    function getPresentAttribute(selectedElement,element){
        var attr = selectedElement.attributes();
        return (attr.indexOf(element)>=0);
    }

    function extractClassDescription(node){
        var subject=node.prefixRepresentation;
        //  console.log("subject:"+ subject);
        var predicate="rdf:type";
        var object=node.type();

        var objectDef=subject+" "+predicate+" "+object;
        console.log("---------> "+objectDef);
        console.log("attributes");
        var attr = node.attributes();
        console.log(attr);
        if (getPresentAttribute(node,"deprecated")===true){
            objectDef+=", owl:DeprecatedProperty";
        }
        if (getPresentAttribute(node,"equivalent")===true){
            objectDef+=", owl:EquivalentClass";
        }


        objectDef+="; \r\n";
        var indent=getIndent(subject);
        var allProps=graph.getUnfilteredData().properties;
        var myProperties=[];
        var i;
        for (i=0;i<allProps.length;i++){
            if (allProps[i].domain()===node && allProps[i].type()==="rdfs:subClassOf"){
                myProperties.push(allProps[i]);
            }
        }
        for (i=0;i<myProperties.length;i++) {
            // depending on the property we have to do some things;
            //        console.log("Adding additional Property to this class");
            if (myProperties[i].range().type !== "own:Thing") {
                objectDef += indent +" "+ myProperties[i].prefixRepresentation +
                    " " + myProperties[i].range().prefixRepresentation + " ;\r\n";


            }
        }


        objectDef+=general_Label_languageExtractor(indent, node.label(), "rdfs:label", true);
        return objectDef;

    }

	function extractPropertyDescription(property){
        var subject=property.prefixRepresentation;
        //  console.log("subject:"+ subject);
        var predicate="rdf:type";
        var object=property.type();

        var objectDef=subject+" "+predicate+" "+object;
        console.log("---------> "+objectDef);
        if (getPresentAttribute(property,"deprecated")===true){
            objectDef+=", owl:DeprecatedProperty";
        }
        if (getPresentAttribute(property,"functional")===true){
            objectDef+=", owl:FunctionalProperty";
        }
        if (getPresentAttribute(property,"inverse functional")===true){
            objectDef+=", owl:InverseFunctionalProperty";
        }
        if (getPresentAttribute(property,"symmetric")===true){
            objectDef+=", owl:SymmetricProperty";
        }
        if (getPresentAttribute(property,"transitive")===true){
            objectDef+=", owl:TransitiveProperty";
        }
		var indent=getIndent(subject);


        // check for domain and range;

		var closeStatement=false;
        var domain=property.domain();
        var range=property.range();

        console.log("Domain Type "+ domain.type());
        console.log("Range Type "+ range.type());
		if (domain.type()==="owl:Thing" && range.type()==="owl:Thing"){
			// we do not write domain and range
            if (typeof property.label() !=="object" && property.label().length===0){
            	closeStatement=true;
			}
		}

		console.log("Should we close the staement?"+ closeStatement);
		if (closeStatement===true){
			objectDef+=" . \r\n";
			return objectDef;
		}
        objectDef+="; \r\n";
        var labelDescription;


		if (domain.type()==="owl:Thing" && range.type()==="owl:Thing") {
			console.log("Range and Domain are from type OWL:THING!");
            labelDescription = general_Label_languageExtractor(indent, property.label(), "rdfs:label", true);
            console.log("Resulting Language Description:"+labelDescription);
            objectDef+=labelDescription;

        }
		else{
			// do not close the statement;
            labelDescription = general_Label_languageExtractor(indent, property.label(), "rdfs:label");
            objectDef+=labelDescription;
            if (domain.type()!=="owl:Thing"){
                console.log("Adding Domain >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                objectDef+=indent+ " rdfs:domain "+ domain.prefixRepresentation+";\r\n";
			}
            if (range.type()!=="owl:Thing"){
            	console.log("Adding range >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                objectDef+=indent+ " rdfs:range "+ range.prefixRepresentation+";\r\n";
            }

            // close statement now;

            var s_needUpdate = objectDef;
            var s_lastPtr = s_needUpdate.lastIndexOf(";");
            objectDef=s_needUpdate.substring(0, s_lastPtr) + ". \r\n";
		}



		console.log("-----------------------------");
        console.log(objectDef);
        console.log("-----------------------------");
        return objectDef;

    }


	exportTTLModule.resultingTTL_Content=function(){
		return resultingTTLContent;
	};

	function getIndent(name){
		return new Array(name.length+1).join(" ");
	}

	function prepareHeader(){
        resultingTTLContent+="#################################################################\r\n";
        resultingTTLContent+="###  Generated by the WebVOWL Editor (version 0.0.2)" +
            " http://visualdataweb.de/webvowl_editor/   ###\r\n";
        resultingTTLContent+="#################################################################\r\n\r\n";

    }

    function preparePrefixList(){
        var ontoIri=graph.options().getGeneralMetaObjectProperty('iri');
		var prefixList=graph.options().prefixList();
        var prefixDef=[];
        prefixDef.push('@prefix : \t\t<'+ontoIri+'> .');
        for (var name in prefixList){
            if (prefixList.hasOwnProperty(name)){
                prefixDef.push('@prefix '+name+': \t\t<'+prefixList[name]+'> .');
            }
        }
        prefixDef.push('@base \t\t\t<'+ontoIri+'> .\r\n');

        for  (var i=0;i<prefixDef.length;i++){
            resultingTTLContent+=prefixDef[i]+'\r\n';
        }
    }

    function prepareOntologyDef(){
        var ontoIri=graph.options().getGeneralMetaObjectProperty('iri');
		var indent=getIndent('<'+ontoIri+'>');
        resultingTTLContent  += '<'+ontoIri+'> rdf:type owl:Ontology ;\r\n' +
            					getOntologyTitle(indent) +
            					getOntologyDescription(indent);

	}

	function getOntologyTitle(indent){
       return general_languageExtractor(indent,"title", "dc:title");
	}

	function getOntologyDescription(indent){
		return general_languageExtractor(indent,"description", "dc:description",true);
	}

	function general_languageExtractor(indent, metaObjectDescription, annotationDescription,endStatement){
        var languageElement=graph.options().getGeneralMetaObjectProperty(metaObjectDescription);
        console.log(languageElement);
        if (typeof languageElement=== 'object'){
            var resultingLanguages=[];
            for (var name in languageElement){
                if (languageElement.hasOwnProperty(name)){
                    var content=languageElement[name];
                    if (name==="undefined"){
                        resultingLanguages.push(indent+ " "+annotationDescription  + ' "'+content+'"@en; \r\n');
                    }
                    else{
                        resultingLanguages.push(indent+ " "+annotationDescription  + ' "'+content+'"@'+name+'; \r\n');
                    }
                }
            }
            // create resulting titles;
            console.log(resultingLanguages);
            var resultingString="";
            for (var i=0;i<resultingLanguages.length;i++){
                resultingString+=resultingLanguages[i];
            }
            if (endStatement && endStatement===true){
                var needUpdate=resultingString;
                var lastPtr=needUpdate.lastIndexOf(";");
                return needUpdate.substring(0,lastPtr)+". \r\n";
			}else {
                return resultingString;
            }

        }else{
            if (endStatement && endStatement===true) {
                var s_needUpdate = indent + " " + annotationDescription + ' "' + languageElement + '"@en; \r\n';
                var s_lastPtr = s_needUpdate.lastIndexOf(";");
                return s_needUpdate.substring(0, s_lastPtr) + ". \r\n";
            }
            return indent+ " "+ annotationDescription+ ' "'+languageElement+'"@en;\r\n';
        }
	}

    function general_Label_languageExtractor(indent, label, annotationDescription,endStatement){
        var languageElement=label;
        console.log(languageElement+ "<<<<<<<<<<<,,-");
        if (typeof languageElement=== 'object'){
            var resultingLanguages=[];
            for (var name in languageElement){
                if (languageElement.hasOwnProperty(name)){
                    var content=languageElement[name];
                    if (name==="undefined"){
                        resultingLanguages.push(indent+ " "+annotationDescription  + ' "'+content+'"@en; \r\n');
                    }
                    else{
                        resultingLanguages.push(indent+ " "+annotationDescription  + ' "'+content+'"@'+name+'; \r\n');
                    }
                }
            }
            // create resulting titles;
            console.log(resultingLanguages);
            var resultingString="";
            for (var i=0;i<resultingLanguages.length;i++){
                resultingString+=resultingLanguages[i];
            }
            if (endStatement && endStatement===true){
                var needUpdate=resultingString;
                var lastPtr=needUpdate.lastIndexOf(";");
                return needUpdate.substring(0,lastPtr)+". \r\n";
            }else {
                return resultingString;
            }

        }else{
            if (endStatement && endStatement===true) {
                var s_needUpdate = indent + " " + annotationDescription + ' "' + languageElement + '"@en; \r\n';
                var s_lastPtr = s_needUpdate.lastIndexOf(";");
                return s_needUpdate.substring(0, s_lastPtr) + ". \r\n";
            }
            return indent+ " "+ annotationDescription+ ' "'+languageElement+'"@en; \r\n';
        }
    }

	return exportTTLModule;
};
