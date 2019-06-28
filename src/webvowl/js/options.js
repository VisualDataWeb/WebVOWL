module.exports = function (){
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
    dynamicLabelWidth = true,
    // some filters
    literalFilter,
    // menus
    gravityMenu,
    filterMenu,
    loadingModule,
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
    compactNotationModule,
    objectPropertyFilter,
    subclassFilter,
    setOperatorFilter,
    maxLabelWidth = 120,
    metadataObject = {},
    generalOntologyMetaData = {},
    disjointPropertyFilter,
    rectangularRep = false,
    warningModule,
    prefixModule,
    drawPropertyDraggerOnHover = true,
    showDraggerObject = false,
    directInputModule,
    scaleNodesByIndividuals = true,
    useAccuracyHelper = true,
    showRenderingStatistic = true,
    showInputModality = false,
    hideDebugOptions = true,
    nodeDegreeFilter,
    debugMenu,
    
    supportedDatatypes = ["rdfs:Literal", "xsd:boolean", "xsd:double", "xsd:integer", "xsd:string", "undefined"],
    supportedClasses = ["owl:Thing", "owl:Class", "owl:DeprecatedClass"],
    supportedProperties = ["owl:objectProperty",
      "rdfs:subClassOf",
      "owl:disjointWith",
      "owl:allValuesFrom",
      "owl:someValuesFrom"
    ],
    prefixList = {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      dc: 'http://purl.org/dc/elements/1.1/#',
      xml: 'http://www.w3.org/XML/1998/namespace'
    };
  
  options.clearMetaObject = function (){
    generalOntologyMetaData = {};
  };
  options.clearGeneralMetaObject = function (){
    generalOntologyMetaData = {};
  };
  
  options.debugMenu = function ( val ){
    if ( !arguments.length ) return debugMenu;
    debugMenu = val;
  };
  
  options.getHideDebugFeatures = function (){
    return hideDebugOptions;
  };
  options.executeHiddenDebugFeatuers = function (){
    hideDebugOptions = !hideDebugOptions;
    d3.selectAll(".debugOption").classed("hidden", hideDebugOptions);
    if ( hideDebugOptions === false ) {
      graphObject.setForceTickFunctionWithFPS();
    }
    else {
      graphObject.setDefaultForceTickFunction();
    }
    if ( debugMenu ) {
      debugMenu.updateSettings();
    }
    options.setHideDebugFeaturesForDefaultObject(hideDebugOptions);
  };
  
  
  options.addOrUpdateGeneralObjectEntry = function ( property, value ){
    if ( generalOntologyMetaData.hasOwnProperty(property) ) {
      //console.log("Updating Property:"+ property);
      if ( property === "iri" ) {
        if ( validURL(value) === false ) {
          warningModule.showWarning("Invalid Ontology IRI", "Input IRI does not represent an URL", "Restoring previous IRI for ontology", 1, false);
          return false;
        }
      }
      generalOntologyMetaData[property] = value;
    } else {
      generalOntologyMetaData[property] = value;
    }
    return true;
  };
  
  options.getGeneralMetaObjectProperty = function ( property ){
    if ( generalOntologyMetaData.hasOwnProperty(property) ) {
      return generalOntologyMetaData[property];
    }
  };
  
  options.getGeneralMetaObject = function (){
    return generalOntologyMetaData;
  };
  
  options.addOrUpdateMetaObjectEntry = function ( property, value ){
    
    if ( metadataObject.hasOwnProperty(property) ) {
      metadataObject[property] = value;
    } else {
      metadataObject[property] = value;
    }
  };
  
  options.getMetaObjectProperty = function ( property ){
    if ( metadataObject.hasOwnProperty(property) ) {
      return metadataObject[property];
    }
  };
  options.getMetaObject = function (){
    return metadataObject;
  };
  
  
  options.prefixList = function (){
    return prefixList;
  };
  options.addPrefix = function ( prefix, url ){
    prefixList[prefix] = url;
  };
  
  function validURL( str ){
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(str);
  }
  
  options.updatePrefix = function ( oldPrefix, newPrefix, oldURL, newURL ){
    if ( oldPrefix === newPrefix && oldURL === newURL ) {
      //	console.log("Nothing to update");
      return true;
    }
    if ( oldPrefix === newPrefix && oldURL !== newURL && validURL(newURL) === true ) {
      //  console.log("Update URL");
      prefixList[oldPrefix] = newURL;
    } else if ( oldPrefix === newPrefix && oldURL !== newURL && validURL(newURL) === false ) {
      if ( validURL(newURL) === false ) {
        warningModule.showWarning("Invalid Prefix IRI", "Input IRI does not represent an IRI", "You should enter a valid IRI in form of a URL", 1, false);
        return false;
      }
      
      return false;
    }
    if ( oldPrefix !== newPrefix && validURL(newURL) === true ) {
      
      // sanity check
      if ( prefixList.hasOwnProperty(newPrefix) ) {
        //  console.log("Already have this prefix!");
        warningModule.showWarning("Prefix Already Exist", "Prefix: " + newPrefix + " is already defined", "You should use an other one", 1, false);
        return false;
      }
      options.removePrefix(oldPrefix);
      options.addPrefix(newPrefix, newURL);
      editSidebar.updateEditDeleteButtonIds(oldPrefix, newPrefix);
      return true;
    }
    
    //	console.log("Is new URL ("+newURL+") valid?  >> "+validURL(newURL));
    if ( validURL(newURL) === false ) {
      warningModule.showWarning("Invalid Prefix IRI", "Input IRI does not represent an URL", "You should enter a valid URL", 1, false);
      
    }
    return false;
  };
  
  options.removePrefix = function ( prefix ){
    delete prefixList[prefix];
  };
  
  
  options.supportedDatatypes = function (){
    return supportedDatatypes;
  };
  options.supportedClasses = function (){
    return supportedClasses;
  };
  options.supportedProperties = function (){
    return supportedProperties;
  };
  
  options.datatypeFilter = function ( val ){
    if ( !arguments.length ) return datatypeFilter;
    datatypeFilter = val;
  };
  
  options.showDraggerObject = function ( val ){
    if ( !arguments.length ) {
      return showDraggerObject;
    }
    showDraggerObject = val;
  };
  options.useAccuracyHelper = function ( val ){
    if ( !arguments.length ) {
      return useAccuracyHelper;
    }
    useAccuracyHelper = val;
  };
  options.showAccuracyHelper = function ( val ){
    if ( !arguments.length ) {
      return options.showDraggerObject();
    }
    options.showDraggerObject(val);
  };
  options.showRenderingStatistic = function ( val ){
    if ( !arguments.length ) {
      return showRenderingStatistic;
    }
    showRenderingStatistic = val;
  };
  options.showInputModality = function ( val ){
    if ( !arguments.length ) {
      return showInputModality;
    }
    showInputModality = val;
  };
  
  options.drawPropertyDraggerOnHover = function ( val ){
    if ( !arguments.length ) return drawPropertyDraggerOnHover;
    drawPropertyDraggerOnHover = val;
  };
  
  options.warningModule = function ( val ){
    if ( !arguments.length ) return warningModule;
    warningModule = val;
  };
  options.directInputModule = function ( val ){
    if ( !arguments.length ) return directInputModule;
    directInputModule = val;
  };
  options.prefixModule = function ( val ){
    if ( !arguments.length ) return prefixModule;
    prefixModule = val;
  };
  
  options.focuserModule = function ( val ){
    if ( !arguments.length ) return focuserModule;
    focuserModule = val;
  };
  options.colorExternalsModule = function ( val ){
    if ( !arguments.length ) return colorExternalsModule;
    colorExternalsModule = val;
  };
  options.compactNotationModule = function ( val ){
    if ( !arguments.length ) return compactNotationModule;
    compactNotationModule = val;
  };
  
  options.maxLabelWidth = function ( val ){
    if ( !arguments.length ) return maxLabelWidth;
    maxLabelWidth = val;
  };
  options.objectPropertyFilter = function ( val ){
    if ( !arguments.length ) return objectPropertyFilter;
    objectPropertyFilter = val;
  };
  options.disjointPropertyFilter = function ( val ){
    if ( !arguments.length ) return disjointPropertyFilter;
    disjointPropertyFilter = val;
  };
  options.subclassFilter = function ( val ){
    if ( !arguments.length ) return subclassFilter;
    subclassFilter = val;
  };
  options.setOperatorFilter = function ( val ){
    if ( !arguments.length ) return setOperatorFilter;
    setOperatorFilter = val;
  };
  options.leftSidebar = function ( val ){
    if ( !arguments.length ) return leftSidebar;
    leftSidebar = val;
  };
  options.editSidebar = function ( val ){
    if ( !arguments.length ) return editSidebar;
    editSidebar = val;
  };
  
  options.zoomSlider = function ( val ){
    if ( !arguments.length ) return zoomSlider;
    zoomSlider = val;
  };
  
  options.graphObject = function ( val ){
    if ( !arguments.length ) return graphObject;
    graphObject = val;
  };
  
  
  var defaultOptionsConfig = {};
  defaultOptionsConfig.sidebar = "1";
  defaultOptionsConfig.doc = -1;
  defaultOptionsConfig.cd = 200;
  defaultOptionsConfig.dd = 120;
  defaultOptionsConfig.editorMode = "false";
  defaultOptionsConfig.filter_datatypes = "false";
  defaultOptionsConfig.filter_objectProperties = "false";
  defaultOptionsConfig.filter_sco = "false";
  defaultOptionsConfig.filter_disjoint = "true";
  defaultOptionsConfig.filter_setOperator = "false";
  defaultOptionsConfig.mode_dynamic = "true";
  defaultOptionsConfig.mode_scaling = "true";
  defaultOptionsConfig.mode_compact = "false";
  defaultOptionsConfig.mode_colorExt = "true";
  defaultOptionsConfig.mode_multiColor = "false";
  defaultOptionsConfig.debugFeatures = "false";
  defaultOptionsConfig.rect = 0;
  
  
  options.initialConfig = function (){
    var initCfg = {};
    initCfg.sidebar = "1";
    initCfg.doc = -1;
    initCfg.cd = 200;
    initCfg.dd = 120;
    initCfg.editorMode = "false";
    initCfg.filter_datatypes = "false";
    initCfg.filter_objectProperties = "false";
    initCfg.filter_sco = "false";
    initCfg.filter_disjoint = "true";
    initCfg.filter_setOperator = "false";
    initCfg.mode_dynamic = "true";
    initCfg.mode_scaling = "true";
    initCfg.mode_compact = "false";
    initCfg.mode_colorExt = "true";
    initCfg.mode_multiColor = "false";
    initCfg.mode_pnp = "false";
    initCfg.debugFeatures = "false";
    initCfg.rect = 0;
    return initCfg;
  };
  
  options.setEditorModeForDefaultObject = function ( val ){
    defaultOptionsConfig.editorMode = String(val);
  };
  options.setHideDebugFeaturesForDefaultObject = function ( val ){
    defaultOptionsConfig.debugFeatures = String(!val);
  };
  
  function updateConfigObject(){
    defaultOptionsConfig.sidebar = options.sidebar().getSidebarVisibility();
    defaultOptionsConfig.cd = options.classDistance();
    defaultOptionsConfig.dd = options.datatypeDistance();
    defaultOptionsConfig.filter_datatypes = String(options.filterMenu().getCheckBoxValue("datatypeFilterCheckbox"));
    defaultOptionsConfig.filter_sco = String(options.filterMenu().getCheckBoxValue("subclassFilterCheckbox"));
    defaultOptionsConfig.filter_disjoint = String(options.filterMenu().getCheckBoxValue("disjointFilterCheckbox"));
    defaultOptionsConfig.filter_setOperator = String(options.filterMenu().getCheckBoxValue("setoperatorFilterCheckbox"));
    defaultOptionsConfig.filter_objectProperties = String(options.filterMenu().getCheckBoxValue("objectPropertyFilterCheckbox"));
    defaultOptionsConfig.mode_dynamic = String(options.dynamicLabelWidth());
    defaultOptionsConfig.mode_scaling = String(options.modeMenu().getCheckBoxValue("nodescalingModuleCheckbox"));
    defaultOptionsConfig.mode_compact = String(options.modeMenu().getCheckBoxValue("compactnotationModuleCheckbox"));
    defaultOptionsConfig.mode_colorExt = String(options.modeMenu().getCheckBoxValue("colorexternalsModuleCheckbox"));
    defaultOptionsConfig.mode_multiColor = String(options.modeMenu().colorModeState());
    defaultOptionsConfig.mode_pnp = String(options.modeMenu().getCheckBoxValue("pickandpinModuleCheckbox"));
    defaultOptionsConfig.rect = 0;
  }
  
  options.defaultConfig = function (){
    updateConfigObject();
    return defaultOptionsConfig;
  };
  
  options.exportMenu = function ( val ){
    if ( !arguments.length ) return exportMenu;
    exportMenu = val;
  };
  
  options.rectangularRepresentation = function ( val ){
    if ( !arguments.length ) {
      return rectangularRep;
    } else {
      var intVal = parseInt(val);
      if ( intVal === 0 ) {
        rectangularRep = false;
      } else {
        rectangularRep = true;
      }
    }
  };
  
  options.dynamicLabelWidth = function ( val ){
    if ( !arguments.length )
      return dynamicLabelWidth;
    else {
      dynamicLabelWidth = val;
    }
  };
  options.sidebar = function ( s ){
    if ( !arguments.length ) return sidebar;
    sidebar = s;
    return options;
    
  };
  
  options.navigationMenu = function ( m ){
    if ( !arguments.length ) return navigationMenu;
    navigationMenu = m;
    return options;
    
  };
  
  options.ontologyMenu = function ( m ){
    if ( !arguments.length ) return ontologyMenu;
    ontologyMenu = m;
    return options;
  };
  
  options.searchMenu = function ( m ){
    if ( !arguments.length ) return searchMenu;
    searchMenu = m;
    return options;
  };
  
  options.resetMenu = function ( m ){
    if ( !arguments.length ) return resetMenu;
    resetMenu = m;
    return options;
  };
  
  options.pausedMenu = function ( m ){
    if ( !arguments.length ) return pausedMenu;
    pausedMenu = m;
    return options;
  };
  
  options.pickAndPinModule = function ( m ){
    if ( !arguments.length ) return pickAndPinModule;
    pickAndPinModule = m;
    return options;
  };
  
  options.gravityMenu = function ( m ){
    if ( !arguments.length ) return gravityMenu;
    gravityMenu = m;
    return options;
  };
  
  options.filterMenu = function ( m ){
    if ( !arguments.length ) return filterMenu;
    filterMenu = m;
    return options;
  };
  
  options.modeMenu = function ( m ){
    if ( !arguments.length ) return modeMenu;
    modeMenu = m;
    return options;
  };
  
  options.charge = function ( p ){
    if ( !arguments.length ) return charge;
    charge = +p;
    return options;
  };
  
  options.classDistance = function ( p ){
    if ( !arguments.length ) return classDistance;
    classDistance = +p;
    return options;
  };
  
  options.compactNotation = function ( p ){
    
    if ( !arguments.length ) return compactNotation;
    compactNotation = p;
    return options;
  };
  
  options.data = function ( p ){
    if ( !arguments.length ) return data;
    data = p;
    return options;
  };
  
  options.datatypeDistance = function ( p ){
    if ( !arguments.length ) return datatypeDistance;
    datatypeDistance = +p;
    return options;
  };
  
  options.filterModules = function ( p ){
    if ( !arguments.length ) return filterModules;
    filterModules = p;
    return options;
  };
  
  options.graphContainerSelector = function ( p ){
    if ( !arguments.length ) return graphContainerSelector;
    graphContainerSelector = p;
    return options;
  };
  
  options.gravity = function ( p ){
    if ( !arguments.length ) return gravity;
    gravity = +p;
    return options;
  };
  
  options.height = function ( p ){
    if ( !arguments.length ) return height;
    height = +p;
    return options;
  };
  
  options.linkStrength = function ( p ){
    if ( !arguments.length ) return linkStrength;
    linkStrength = +p;
    return options;
  };
  
  options.loopDistance = function ( p ){
    if ( !arguments.length ) return loopDistance;
    loopDistance = p;
    return options;
  };
  
  options.minMagnification = function ( p ){
    if ( !arguments.length ) return minMagnification;
    minMagnification = +p;
    return options;
  };
  
  options.maxMagnification = function ( p ){
    if ( !arguments.length ) return maxMagnification;
    maxMagnification = +p;
    return options;
  };
  
  options.scaleNodesByIndividuals = function ( p ){
    if ( !arguments.length ) return scaleNodesByIndividuals;
    scaleNodesByIndividuals = p;
    return options;
  };
  
  options.selectionModules = function ( p ){
    if ( !arguments.length ) return selectionModules;
    selectionModules = p;
    return options;
  };
  
  options.width = function ( p ){
    if ( !arguments.length ) return width;
    width = +p;
    return options;
  };
  
  options.literalFilter = function ( p ){
    if ( !arguments.length ) return literalFilter;
    literalFilter = p;
    return options;
  };
  options.nodeDegreeFilter = function ( p ){
    if ( !arguments.length ) return nodeDegreeFilter;
    nodeDegreeFilter = p;
    return options;
  };
  
  options.loadingModule = function ( p ){
    if ( !arguments.length ) return loadingModule;
    loadingModule = p;
    return options;
  };
  
  // define url loadable options;
  // update all set values in the default object
  options.setOptionsFromURL = function ( opts, changeEditFlag ){
    if ( opts.sidebar !== undefined ) sidebar.showSidebar(parseInt(opts.sidebar), true);
    if ( opts.doc ) {
      var asInt = parseInt(opts.doc);
      filterMenu.setDegreeSliderValue(asInt);
      graphObject.setGlobalDOF(asInt);
      // reset the value to be -1;
      defaultOptionsConfig.doc = -1;
    }
    var settingFlag = false;
    if ( opts.editorMode ) {
      if ( opts.editorMode === "true" ) settingFlag = true;
      d3.select("#editorModeModuleCheckbox").node().checked = settingFlag;
      
      if ( changeEditFlag && changeEditFlag === true ) {
        graphObject.editorMode(settingFlag);
      }
      
      // update config object
      defaultOptionsConfig.editorMode = opts.editorMode;
      
    }
    if ( opts.cd ) { // class distance
      options.classDistance(opts.cd); // class distance
      defaultOptionsConfig.cd = opts.cd;
    }
    if ( opts.dd ) { // data distance
      options.datatypeDistance(opts.dd);
      defaultOptionsConfig.cd = opts.cd;
    }
    if ( opts.cd || opts.dd ) options.gravityMenu().reset(); // reset the values so the slider is updated;
    
    
    settingFlag = false;
    if ( opts.filter_datatypes ) {
      if ( opts.filter_datatypes === "true" ) settingFlag = true;
      filterMenu.setCheckBoxValue("datatypeFilterCheckbox", settingFlag);
      defaultOptionsConfig.filter_datatypes = opts.filter_datatypes;
    }
    if ( opts.debugFeatures ) {
      if ( opts.debugFeatures === "true" ) settingFlag = true;
      hideDebugOptions = settingFlag;
      if ( options.getHideDebugFeatures() === false ) {
        options.executeHiddenDebugFeatuers();
      }
      defaultOptionsConfig.debugFeatures = opts.debugFeatures;
    }
    
    settingFlag = false;
    if ( opts.filter_objectProperties ) {
      if ( opts.filter_objectProperties === "true" ) settingFlag = true;
      filterMenu.setCheckBoxValue("objectPropertyFilterCheckbox", settingFlag);
      defaultOptionsConfig.filter_objectProperties = opts.filter_objectProperties;
    }
    settingFlag = false;
    if ( opts.filter_sco ) {
      if ( opts.filter_sco === "true" ) settingFlag = true;
      filterMenu.setCheckBoxValue("subclassFilterCheckbox", settingFlag);
      defaultOptionsConfig.filter_sco = opts.filter_sco;
    }
    settingFlag = false;
    if ( opts.filter_disjoint ) {
      if ( opts.filter_disjoint === "true" ) settingFlag = true;
      filterMenu.setCheckBoxValue("disjointFilterCheckbox", settingFlag);
      defaultOptionsConfig.filter_disjoint = opts.filter_disjoint;
    }
    settingFlag = false;
    if ( opts.filter_setOperator ) {
      if ( opts.filter_setOperator === "true" ) settingFlag = true;
      filterMenu.setCheckBoxValue("setoperatorFilterCheckbox", settingFlag);
      defaultOptionsConfig.filter_setOperator = opts.filter_setOperator;
    }
    filterMenu.updateSettings();
    
    // modesMenu
    settingFlag = false;
    if ( opts.mode_dynamic ) {
      if ( opts.mode_dynamic === "true" ) settingFlag = true;
      modeMenu.setDynamicLabelWidth(settingFlag);
      dynamicLabelWidth = settingFlag;
      defaultOptionsConfig.mode_dynamic = opts.mode_dynamic;
    }
    // settingFlag=false;
    // THIS SHOULD NOT BE SET USING THE OPTIONS ON THE URL
    // if (opts.mode_picnpin) {
    //     graph.options().filterMenu().setCheckBoxValue("pickandpin ModuleCheckbox", settingFlag);
    // }
    
    settingFlag = false;
    if ( opts.mode_pnp ) {
      if ( opts.mode_pnp === "true" ) settingFlag = true;
      modeMenu.setCheckBoxValue("pickandpinModuleCheckbox", settingFlag);
      defaultOptionsConfig.mode_pnp = opts.mode_pnp;
    }
    
    settingFlag = false;
    if ( opts.mode_scaling ) {
      if ( opts.mode_scaling === "true" ) settingFlag = true;
      modeMenu.setCheckBoxValue("nodescalingModuleCheckbox", settingFlag);
      defaultOptionsConfig.mode_scaling = opts.mode_scaling;
    }
    
    settingFlag = false;
    if ( opts.mode_compact ) {
      if ( opts.mode_compact === "true" ) settingFlag = true;
      modeMenu.setCheckBoxValue("compactnotationModuleCheckbox", settingFlag);
      defaultOptionsConfig.mode_compact = opts.mode_compact;
    }
    
    settingFlag = false;
    if ( opts.mode_colorExt ) {
      if ( opts.mode_colorExt === "true" ) settingFlag = true;
      modeMenu.setCheckBoxValue("colorexternalsModuleCheckbox", settingFlag);
      defaultOptionsConfig.mode_colorExt = opts.mode_colorExt;
    }
    
    settingFlag = false;
    if ( opts.mode_multiColor ) {
      if ( opts.mode_multiColor === "true" ) settingFlag = true;
      modeMenu.setColorSwitchStateUsingURL(settingFlag);
      defaultOptionsConfig.mode_multiColor = opts.mode_multiColor;
    }
    modeMenu.updateSettingsUsingURL();
    options.rectangularRepresentation(opts.rect);
  };
  
  return options;
};
