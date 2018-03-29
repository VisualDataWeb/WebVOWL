module.exports = function () {
	var options = {},
		data,
		graphContainerSelector,
		classDistance = 200,
		datatypeDistance = 120,
		loopDistance = 150,
		charge = -500,
		gravity = 0.025,
		linkStrength = 1,
		height = 600,
		width = 800,
		selectionModules = [],
		filterModules = [],
		minMagnification = 0.01,
		maxMagnification = 4,
		compactNotation = false,
		dynamicLabelWidth=true,
		// some filters
		literalFilter,
		// menus
		gravityMenu,
		filterMenu,
		modeMenu,
		pausedMenu,
		pickAndPinModule,
		resetMenu,
		searchMenu,
		ontologyMenu,
		sidebar,
		leftSidebar,
		editSidebar,
		navigationMenu,
		exportMenu,
		graphObject,
        zoomSlider,
        datatypeFilter,
        focuserModule,
        colorExternalsModule,
        objectPropertyFilter,
        subclassFilter,
        setOperatorFilter,
        maxLabelWidth=120,
		metadataObject={},
		generalOntologyMetaData={},
        disjointPropertyFilter,
        rectangularRep=false,
        warningModule,
        prefixModule,
        drawPropertyDraggerOnHover=true,
        scaleNodesByIndividuals = true,
        showDraggerObject=false,

        supportedDatatypes=["rdfs:Literal", "xsd:boolean", "xsd:double", "xsd:integer", "xsd:string","undefined"],
        supportedClasses=["owl:Thing","owl:Class","owl:DeprecatedClass"],
        supportedProperties=["owl:objectProperty",
			"rdfs:subClassOf",
			"owl:disjointWith",
			"owl:allValuesFrom",
    		"owl:someValuesFrom"
		],
		prefixList={
            rdf:'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    		rdfs:'http://www.w3.org/2000/01/rdf-schema#',
    		owl:'http://www.w3.org/2002/07/owl#',
    	    xsd:'http://www.w3.org/2001/XMLSchema#',
    		dc:'http://purl.org/dc/elements/1.1/#',
            xml:'http://www.w3.org/XML/1998/namespace'
		};

	options.clearMetaObject=function(){
        generalOntologyMetaData={};
	};
    options.clearGeneralMetaObject=function(){
        generalOntologyMetaData={};
    };

	options.addOrUpdateGeneralObjectEntry=function(property,value) {
        if (generalOntologyMetaData.hasOwnProperty(property)) {
        	console.log("Updating Property:"+ property);
        	if (property==="iri"){
				if (validURL(value)===false){
					warningModule.showWarning("Invalid Ontology IRI","Input IRI does not represent an URL","Restoring previous IRI for ontology",1,false);
					return false;
				}
        	}

        	console.log("updating "+property+ "from "+generalOntologyMetaData[property]+ " to "+value);
            generalOntologyMetaData[property] = value;
        } else {
            generalOntologyMetaData[property] = value;
        }
        return true;
    };

    options.getGeneralMetaObjectProperty=function(property){
        if (generalOntologyMetaData.hasOwnProperty(property)) {
            return generalOntologyMetaData[property];
        }
    };

    options.getGeneralMetaObject=function(){
        return generalOntologyMetaData;
    };

    options.addOrUpdateMetaObjectEntry=function(property,value){

		if (metadataObject.hasOwnProperty(property)){
			metadataObject[property]=value;
		}else{
			metadataObject[property]=value;
		}
	};

	options.getMetaObjectProperty=function(property){
		 if (metadataObject.hasOwnProperty(property)) {
             return metadataObject[property];
         }
	};
	options.getMetaObject=function(){
		return metadataObject;
	};


	options.prefixList=function () {
		return prefixList;
    };
    options.addPrefix=function(prefix,url){
		console.log("TODO: add "+prefix+" "+url);
		prefixList[prefix]=url;
	};

    function validURL(str) {
        var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(str);
    }

    options.updatePrefix=function(oldPrefix,newPrefix, oldURL,newURL){
    	if (oldPrefix===newPrefix && oldURL===newURL){
    		console.log("Nothing to update");
    		return true;
		}
        if (oldPrefix===newPrefix && oldURL!==newURL && validURL(newURL)===true){
            console.log("Update URL");
			prefixList[oldPrefix]=newURL;
        }else if (oldPrefix===newPrefix && oldURL!==newURL && validURL(newURL)===false){
            if (validURL(newURL)===false){
                warningModule.showWarning("Invalid Prefix IRI","Input IRI does not represent an IRI","You should enter a valid IRI in form of a URL",1,false);
                return false;
            }

            return false;
		}
        if (oldPrefix!==newPrefix && validURL(newURL)===true){

        	// sanity check
			if (prefixList.hasOwnProperty(newPrefix)){
                console.log("Already have this prefix!");
                warningModule.showWarning("Prefix Already Exist","Prefix: "+newPrefix+ " is already defined","You should use an other one",1,false);
				return false;
			}
			options.removePrefix(oldPrefix);
			options.addPrefix(newPrefix,newURL);
			editSidebar.updateEditDeleteButtonIds(oldPrefix,newPrefix);
			return true;
		}

		console.log("Is new URL ("+newURL+") valid?  >> "+validURL(newURL));
        if (validURL(newURL)===false){
            warningModule.showWarning("Invalid Prefix IRI","Input IRI does not represent an URL","You should enter a valid URL",1,false);

        }
		return false;
    };

    options.removePrefix=function(prefix){
        delete prefixList[prefix];
    };


    options.supportedDatatypes  = function(){ return supportedDatatypes;  };
	options.supportedClasses    = function(){ return supportedClasses;    };
	options.supportedProperties = function(){ return supportedProperties; };

    options.datatypeFilter=function(val){
        if (!arguments.length) return datatypeFilter;
        datatypeFilter=val;
    };

    options.showDraggerObject=function(val){
        if (!arguments.length){
        	return showDraggerObject;}
        showDraggerObject=val;
    };
    options.drawPropertyDraggerOnHover=function(val){
        if (!arguments.length) return drawPropertyDraggerOnHover;
        drawPropertyDraggerOnHover=val;
    };

    options.warningModule=function(val){
        if (!arguments.length) return warningModule;
        warningModule=val;
    };
    options.prefixModule=function(val){
        if (!arguments.length) return prefixModule;
        prefixModule=val;
    };

    options.focuserModule=function(val){
        if (!arguments.length) return focuserModule;
        focuserModule=val;
    };options.colorExternalsModule=function(val){
        if (!arguments.length) return colorExternalsModule;
        colorExternalsModule=val;
    };
    options.maxLabelWidth=function(val){
        if (!arguments.length) return maxLabelWidth;
        maxLabelWidth=val;
    };
    options.objectPropertyFilter=function(val){
        if (!arguments.length) return objectPropertyFilter;
        objectPropertyFilter=val;
    };
    options.disjointPropertyFilter=function(val){
        if (!arguments.length) return disjointPropertyFilter;
        disjointPropertyFilter=val;
    };
    options.subclassFilter=function(val){
        if (!arguments.length) return subclassFilter;
        subclassFilter=val;
    };
    options.setOperatorFilter=function(val){
        if (!arguments.length) return setOperatorFilter;
        setOperatorFilter=val;
    };
    options.leftSidebar=function(val){
        if (!arguments.length) return leftSidebar;
        leftSidebar=val;
    };
	options.editSidebar=function(val){
        if (!arguments.length) return editSidebar;
        editSidebar=val;
    };



    options.zoomSlider=function(val){
		if (!arguments.length) return zoomSlider;
		zoomSlider=val;
	};

	options.graphObject=function(val){
		if (!arguments.length) return graphObject;
		graphObject=val;
	};

	options.defaultConfig=function(){
        var defaultOptionsConfig={};
        defaultOptionsConfig.sidebar="1";
        defaultOptionsConfig.doc=-1;
        defaultOptionsConfig.cd=200;
        defaultOptionsConfig.dd=120;
        defaultOptionsConfig.filter_datatypes="false";
        defaultOptionsConfig.filter_objectProperties="false";
        defaultOptionsConfig.filter_sco="false";
        defaultOptionsConfig.filter_disjoint="true";
        defaultOptionsConfig.filter_setOperator="false";
        defaultOptionsConfig.mode_dynamic="true";
        defaultOptionsConfig.mode_scaling="true";
        defaultOptionsConfig.mode_compact="false";
        defaultOptionsConfig.mode_colorExt="true";
        defaultOptionsConfig.mode_multiColor="false";
        defaultOptionsConfig.rect=0;
		return defaultOptionsConfig;
	};

	options.exportMenu=function(val){
        if (!arguments.length) return exportMenu;
        exportMenu=val;
	};

	options.rectangularRepresentation=function(val){
		if (!arguments.length){
			return rectangularRep;
		}else{
			var intVal=parseInt(val);
			if ( intVal===0 ){
				rectangularRep=false;
			}else{
				rectangularRep=true;
			}
		}
	};

    options.dynamicLabelWidth=function(val){
        if (!arguments.length)
        	return dynamicLabelWidth;
        else{
            dynamicLabelWidth=val;
		}
	};
	options.sidebar= function(s){
		if (!arguments.length) return sidebar;
		sidebar = s;
		return options;

	};

	options.navigationMenu= function (m){
		if (!arguments.length) return navigationMenu;
		navigationMenu = m;
		return options;

	};

	options.ontologyMenu = function (m){
		if (!arguments.length) return ontologyMenu;
		ontologyMenu = m;
		return options;
	};

	options.searchMenu = function (m) {
		if (!arguments.length) return searchMenu;
		searchMenu = m;
		return options;
	};

	options.resetMenu = function (m) {
		if (!arguments.length) return resetMenu;
		resetMenu = m;
		return options;
	};

	options.pausedMenu = function (m) {
		if (!arguments.length) return pausedMenu;
		pausedMenu = m;
		return options;
	};

	options.pickAndPinModule = function (m) {
		if (!arguments.length) return pickAndPinModule;
		pickAndPinModule = m;
		return options;
	};

	options.gravityMenu = function (m) {
		if (!arguments.length) return gravityMenu;
		gravityMenu = m;
		return options;
	};

	options.filterMenu = function (m) {
		if (!arguments.length) return filterMenu;
		filterMenu = m;
		return options;
	};

	options.modeMenu = function (m) {
		if (!arguments.length) return modeMenu;
		modeMenu = m;
		return options;
	};

	options.charge = function (p) {
		if (!arguments.length) return charge;
		charge = +p;
		return options;
	};

	options.classDistance = function (p) {
		if (!arguments.length) return classDistance;
		classDistance = +p;
		return options;
	};

	options.compactNotation = function (p) {
		if (!arguments.length) return compactNotation;
		compactNotation = p;
		return options;
	};

	options.data = function (p) {
		if (!arguments.length) return data;
		data = p;
		return options;
	};

	options.datatypeDistance = function (p) {
		if (!arguments.length) return datatypeDistance;
		datatypeDistance = +p;
		return options;
	};

	options.filterModules = function (p) {
		if (!arguments.length) return filterModules;
		filterModules = p;
		return options;
	};

	options.graphContainerSelector = function (p) {
		if (!arguments.length) return graphContainerSelector;
		graphContainerSelector = p;
		return options;
	};

	options.gravity = function (p) {
		if (!arguments.length) return gravity;
		gravity = +p;
		return options;
	};

	options.height = function (p) {
		if (!arguments.length) return height;
		height = +p;
		return options;
	};

	options.linkStrength = function (p) {
		if (!arguments.length) return linkStrength;
		linkStrength = +p;
		return options;
	};

	options.loopDistance = function (p) {
		if (!arguments.length) return loopDistance;
		loopDistance = p;
		return options;
	};

	options.minMagnification = function (p) {
		if (!arguments.length) return minMagnification;
		minMagnification = +p;
		return options;
	};

	options.maxMagnification = function (p) {
		if (!arguments.length) return maxMagnification;
		maxMagnification = +p;
		return options;
	};

	options.scaleNodesByIndividuals = function (p) {
		if (!arguments.length) return scaleNodesByIndividuals;
		scaleNodesByIndividuals = p;
		return options;
	};

	options.selectionModules = function (p) {
		if (!arguments.length) return selectionModules;
		selectionModules = p;
		return options;
	};

	options.width = function (p) {
		if (!arguments.length) return width;
		width = +p;
		return options;
	};

	options.literalFilter=function (p) {
		if (!arguments.length) return literalFilter;
		literalFilter=p;
		return options;
	};


	// define url loadable options;
    options.setOptionsFromURL=function(opts){
        if (opts.sidebar!==undefined) sidebar.showSidebar(parseInt(opts.sidebar),true);
        if (opts.doc ){
            filterMenu.setDegreeSliderValue(opts.doc);
            graphObject.setGlobalDOF(opts.doc);
        }

        if (opts.cd ) options.classDistance(opts.cd); // class distance
        if (opts.dd ) options.datatypeDistance(opts.dd); // data distance
        if (opts.cd || opts.dd) options.gravityMenu().reset(); // reset the values so the slider is updated;
        var settingFlag=false;
        if (opts.filter_datatypes){
            if (opts.filter_datatypes==="true") settingFlag=true;
            filterMenu.setCheckBoxValue("datatypeFilterCheckbox",settingFlag);
        }
        settingFlag=false;
        if (opts.filter_objectProperties){
            if (opts.filter_objectProperties==="true") settingFlag=true;
            filterMenu.setCheckBoxValue("objectPropertyFilterCheckbox",settingFlag);
        }
        settingFlag=false;
        if (opts.filter_sco){
            if (opts.filter_sco==="true") settingFlag=true;
            filterMenu.setCheckBoxValue("subclassFilterCheckbox",settingFlag);
        }
        settingFlag=false;
        if (opts.filter_disjoint){
            if (opts.filter_disjoint==="true") settingFlag=true;
            filterMenu.setCheckBoxValue("disjointFilterCheckbox",settingFlag);
        }
        settingFlag=false;
        if (opts.filter_setOperator){
            if (opts.filter_setOperator==="true") settingFlag=true;
            filterMenu.setCheckBoxValue("setoperatorFilterCheckbox",settingFlag);
        }
        filterMenu.updateSettings();

        // modesMenu
        settingFlag=false;
        if (opts.mode_dynamic) {
            if (opts.mode_dynamic==="true") settingFlag=true;
            modeMenu.setDynamicLabelWidth(settingFlag);
            dynamicLabelWidth=settingFlag;
        }
        // settingFlag=false;
        // THIS SHOULD NOT BE SET USING THE OPTIONS ON THE URL
        // if (opts.mode_picnpin) {
        //     graph.options().filterMenu().setCheckBoxValue("pickandpinModuleCheckbox", settingFlag);
        // }

        settingFlag=false;
        if (opts.mode_scaling) {
            if (opts.mode_scaling==="true") settingFlag=true;
            modeMenu.setCheckBoxValue("nodescalingModuleCheckbox", settingFlag);
        }

        settingFlag=false;
        if (opts.mode_compact) {
            if (opts.mode_compact==="true") settingFlag=true;
            modeMenu.setCheckBoxValue("compactnotationModuleCheckbox", settingFlag);
        }

        settingFlag=false;
        if (opts.mode_colorExt) {
            if (opts.mode_colorExt==="true") settingFlag=true;
            modeMenu.setCheckBoxValue("colorexternalsModuleCheckbox",settingFlag);
        }

        settingFlag=false;
        if (opts.mode_multiColor) {
            if (opts.mode_multiColor==="true") settingFlag=true;
            modeMenu.setColorSwitchStateUsingURL(settingFlag);
        }
        modeMenu.updateSettingsUsingURL();
        options.rectangularRepresentation(opts.rect);
    };

	return options;
};
