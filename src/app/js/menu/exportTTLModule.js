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

        var property_success=exportProperties();
        var class_success=exportClasses();
		// release the reference from elements to this module;
        currentNodes=null;
        currentProperties=null;
        if (property_success===false || class_success===false)
            return false;
		return true;

	};

	function preparePrefixRepresentation(){
		var i;
        var allNodes=graph.getUnfilteredData().nodes;
        var allProps=graph.getUnfilteredData().properties;
		for (i=0;i<allNodes.length;i++){
		    var nodeIRI=prefixModule.getPrefixRepresentationForFullURI(allNodes[i].iri());
		    if (prefixModule.validURL(nodeIRI)===true)
                allNodes[i].prefixRepresentation="<"+nodeIRI+">";
		    else
                allNodes[i].prefixRepresentation=nodeIRI;
		}
        for (i=0;i<allProps.length;i++){
		    var propIRI=prefixModule.getPrefixRepresentationForFullURI(allProps[i].iri());
            if (prefixModule.validURL(propIRI)===true)
                allProps[i].prefixRepresentation="<"+propIRI+">";
            else
                allProps[i].prefixRepresentation=propIRI;
        }
	}

	function exportProperties(){
	    if (currentProperties.length===0) return; // we dont need to write that
        resultingTTLContent+="###  Property Definitions (Number of Property) "+currentProperties.length+" ###\r\n";
        for (var i=0;i<currentProperties.length;i++) {
            resultingTTLContent += "#  --------------------------- Property " + i + "------------------------- \r\n";
            var addedElement=extractPropertyDescription(currentProperties[i]);
            resultingTTLContent += addedElement ;
            //@ workaround for not supported elements
            if (addedElement.indexOf("WHYEMPTYNAME")!==-1){
                return false;
            }
        }
        return true;
	}


	function exportClasses(){
        if (currentNodes.length===0) return; // we dont need to write that
        resultingTTLContent+="###  Class Definitions (Number of Classes) "+currentNodes.length+" ###\r\n";
        for (var i=0;i<currentNodes.length;i++) {
            // check for node type here and return false
            resultingTTLContent += "#  --------------------------- Class  " + i + "------------------------- \r\n";
            var addedElement=extractClassDescription(currentNodes[i]);
            resultingTTLContent += addedElement ;
            if (addedElement.indexOf("WHYEMPTYNAME")!==-1){
                return false;
            }
        }
        return true;
    }

    function getPresentAttribute(selectedElement,element){
        var attr = selectedElement.attributes();
        return (attr.indexOf(element)>=0);
    }

    function extractClassDescription(node){
        var subject=node.prefixRepresentation;
        var predicate="rdf:type";
        var object=node.type();
        if (node.type()==="owl:equivalentClass")
            object="owl:Class";


        var objectDef=subject+" "+predicate+" "+object;
        if (getPresentAttribute(node,"deprecated")===true){
            objectDef+=", owl:DeprecatedProperty";
        }
        // equivalent class handeled using type itself!

        // check for equivalent classes;
        var indent=getIndent(subject);
        objectDef+="; \r\n";
        for (var e=0;e<node.equivalents().length;e++){
            var eqIRI=prefixModule.getPrefixRepresentationForFullURI(node.equivalents()[e].iri());
            var eqNode_prefRepresentation="";
            if (prefixModule.validURL(eqIRI)===true)
                eqNode_prefRepresentation="<"+eqIRI+">";
            else
                eqNode_prefRepresentation=eqIRI;
            objectDef+=indent+" owl:equivalentClass "+eqNode_prefRepresentation+" ;\r\n";
        }

        // if (getPresentAttribute(node,"equivalent")===true){
        //     objectDef+=", owl:EquivalentClass";
        // }




        var allProps=graph.getUnfilteredData().properties;
        var myProperties=[];
        var i;
        for (i=0;i<allProps.length;i++){
            if (allProps[i].domain()===node &&
                (   allProps[i].type()==="rdfs:subClassOf"||
                    allProps[i].type()==="owl:allValuesFrom"  ||
                    allProps[i].type()==="owl:someValuesFrom")
                )
            {
                myProperties.push(allProps[i]);
            }
            // special case disjoint with>> both domain and range get that property
            if ((allProps[i].domain()===node) &&
                allProps[i].type()==="owl:disjointWith"){
                myProperties.push(allProps[i]);
            }

            }
        for (i=0;i<myProperties.length;i++) {
            // depending on the property we have to do some things;

            // special case
            if (myProperties[i].type()==="owl:someValuesFrom"){
                objectDef += indent +" rdfs:subClassOf [ rdf:type owl:Restriction ; \r\n";
                objectDef += indent +"                   owl:onProperty "+myProperties[i].prefixRepresentation+";\r\n";
                if (myProperties[i].range().type() !== "owl:Thing" ) {
                    objectDef += indent +"                   owl:someValuesFrom " + myProperties[i].range().prefixRepresentation+"\r\n";
                }
                objectDef += indent +"                 ];\r\n";
                continue;
            }

            if (myProperties[i].type()==="owl:allValuesFrom"){
                objectDef += indent +" rdfs:subClassOf [ rdf:type owl:Restriction ; \r\n";
                objectDef += indent +"                   owl:onProperty "+myProperties[i].prefixRepresentation+";\r\n";
                if (myProperties[i].range().type() !== "owl:Thing" ) {
                    objectDef += indent +"                   owl:allValuesFrom " + myProperties[i].range().prefixRepresentation+"\r\n";
                }
                objectDef += indent +"                 ];\r\n";
                continue;
            }

            if (myProperties[i].range().type() !== "owl:Thing" ) {
                objectDef += indent +" "+ myProperties[i].prefixRepresentation +
                    " " + myProperties[i].range().prefixRepresentation + " ;\r\n";


            }
        }


        objectDef+=general_Label_languageExtractor(indent, node.label(), "rdfs:label", true);
        return objectDef;

    }

	function extractPropertyDescription(property){
        var subject=property.prefixRepresentation;
        if (subject.length===0){
            console.log("THIS SHOULD NOT HAPPEN");
            var propIRI=prefixModule.getPrefixRepresentationForFullURI(property.iri());
            console.log("FOUND "+propIRI);


        }
        var predicate="rdf:type";
        var object=property.type();

        var objectDef=subject+" "+predicate+" "+object;
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

        if (property.inverse()){
            objectDef+="; \r\n";
            objectDef+=indent+" owl:inverseOf "+property.inverse().prefixRepresentation;
        }

        // check for domain and range;

		var closeStatement=false;
        var domain=property.domain();
        var range=property.range();

		if (domain.type()==="owl:Thing" && range.type()==="owl:Thing"){
			// we do not write domain and range
            if (typeof property.label() !=="object" && property.label().length===0){
            	closeStatement=true;
			}
		}


		if (closeStatement===true){
			objectDef+=" . \r\n";
			return objectDef;
		}
        objectDef+="; \r\n";
        var labelDescription;


		if (domain.type()==="owl:Thing" && range.type()==="owl:Thing") {
            labelDescription = general_Label_languageExtractor(indent, property.label(), "rdfs:label", true);
            objectDef+=labelDescription;
        }
		else{
			// do not close the statement;
            labelDescription = general_Label_languageExtractor(indent, property.label(), "rdfs:label");
            objectDef+=labelDescription;
            if (domain.type()!=="owl:Thing"){
                objectDef+=indent+ " rdfs:domain "+ domain.prefixRepresentation+";\r\n";
			}
            if (range.type()!=="owl:Thing"){
                objectDef+=indent+ " rdfs:range "+ range.prefixRepresentation+";\r\n";
            }

            // close statement now;

            var s_needUpdate = objectDef;
            var s_lastPtr = s_needUpdate.lastIndexOf(";");
            objectDef=s_needUpdate.substring(0, s_lastPtr) + ". \r\n";
		}

        // console.log("-----------------------------");
        // console.log(objectDef);
        // console.log("-----------------------------");
        return objectDef;

    }


	exportTTLModule.resultingTTL_Content=function(){
		return resultingTTLContent;
	};

	function getIndent(name){
	    if (name===undefined){
	        return "WHYEMPTYNAME?";
        }
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
            					getOntologyDescription(indent)+
                                getOntologyVersion(indent)+
                                getOntologyAuthor(indent);

        // close the statement;
        var s_needUpdate = resultingTTLContent;
        var s_lastPtr = s_needUpdate.lastIndexOf(";");
        resultingTTLContent= s_needUpdate.substring(0, s_lastPtr) + ". \r\n";
	}

	function getOntologyTitle(indent){
       return general_languageExtractor(indent,"title", "dc:title");
	}

	function getOntologyDescription(indent){
		return general_languageExtractor(indent,"description", "dc:description");
	}
    function getOntologyAuthor(indent){
	    var languageElement=graph.options().getGeneralMetaObjectProperty('author');
	    if (languageElement) {
            if (typeof languageElement !== "object") {
                if (languageElement.length === 0)
                    return ""; // an empty string
                var aString = indent + " dc:creator " + '"' + languageElement + '";\r\n';
                return aString;
            }
            // we assume this thing is an array;
            var authorString = indent + " dc:creator " + '"';
            for (var i = 0; i < languageElement.length - 1; i++) {
                authorString += languageElement[i] + ", ";
            }
            authorString += languageElement[languageElement.length - 1] + '";\r\n';
            return authorString;
        }else{
            return ""; // an empty string
        }
    }
    function getOntologyVersion(indent){
        var languageElement=graph.options().getGeneralMetaObjectProperty('version');
        if (languageElement){
            if (typeof languageElement!=="object"){
                if (languageElement.length===0)
                    return ""; // an empty string
            }
            return general_languageExtractor(indent,"version", "owl:versionInfo");
        }else return ""; // an empty string
    }

	function general_languageExtractor(indent, metaObjectDescription, annotationDescription,endStatement){
        var languageElement=graph.options().getGeneralMetaObjectProperty(metaObjectDescription);

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
