module.exports = function ( graph ){
  /** some constants **/
  var PREDEFINED = 0,
    FILE_UPLOAD = 1,
    JSON_URL = 2,
    IRI_URL = 3;
  
  var PROGRESS_BAR_ERROR = 0,
    PROGRESS_BAR_BUSY = 1,
    PROGRESS_BAR_PERCENT = 2,
    progressBarMode = 1;
  
  var loadingWasSuccessFul = false;
  var missingImportsWarning = false;
  var showLoadingDetails = false;
  var visibilityStatus = true;
  
  var DEFAULT_JSON_NAME = "foaf"; // This file is loaded by default
  var conversion_sessionId;
  
  /** variable defs **/
  var loadingModule = {},
    menuContainer = d3.select("#loading-info"),
    loadingInfoContainer = d3.select("#loadingInfo-container"),
    detailsButton = d3.select("#show-loadingInfo-button"),
    closeButton = d3.select("#loadingIndicator_closeButton"),
    ontologyMenu,
    ontologyIdentifierFromURL;
  
  /** functon defs **/
  loadingModule.checkForScreenSize = function (){
    // checks for window size and adjusts the loading indicator
    var w = graph.options().width(),
      h = graph.options().height();
    
    if ( w < 270 ) {
      d3.select("#loading-info").classed("hidden", true);
    } else {
      // check if it should be visible
      if ( visibilityStatus === true ) {
        d3.select("#loading-info").classed("hidden", false);
      } else {
        d3.select("#loading-info").classed("hidden", true);
      }
    }
    if ( h < 150 ) {
      d3.select("#loadingInfo_msgBox").classed("hidden", true);
    } else {
      d3.select("#loadingInfo_msgBox").classed("hidden", false);
    }
    if ( h < 80 ) {
      d3.select("#progressBarContext").classed("hidden", true);
      d3.select("#layoutLoadingProgressBarContainer").style("height", "20px");
    } else {
      d3.select("#progressBarContext").classed("hidden", false);
      d3.select("#layoutLoadingProgressBarContainer").style("height", "50px");
    }
  };
  
  loadingModule.getMessageVisibilityStatus = function (){
    return visibilityStatus;
  };
  
  loadingModule.getProgressBarMode = function (){
    return progressBarMode;
  };
  
  loadingModule.successfullyLoadedOntology = function (){
    return loadingWasSuccessFul;
  };
  
  loadingModule.missingImportsWarning = function (){
    return missingImportsWarning;
  };
  
  loadingModule.setOntologyMenu = function ( m ){
    ontologyMenu = m;
  };
  
  loadingModule.showErrorDetailsMessage = function (){
    loadingModule.showLoadingIndicator();
    loadingModule.expandDetails();
    d3.select("#loadingIndicator_closeButton").classed("hidden", true);
    loadingModule.scrollDownDetails();
  };
  
  loadingModule.showWarningDetailsMessage = function (){
    d3.select("#currentLoadingStep").style("color", "#ff0");
    loadingModule.showLoadingIndicator();
    loadingModule.expandDetails();
    d3.select("#loadingIndicator_closeButton").classed("hidden", false);
    loadingModule.scrollDownDetails();
  };
  
  loadingModule.scrollDownDetails = function (){
    var scrollingElement = d3.select("#loadingInfo-container").node();
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  };
  
  loadingModule.hideLoadingIndicator = function (){
    d3.select("#loading-info").classed("hidden", true);
    visibilityStatus = false;
  };
  
  loadingModule.showLoadingIndicator = function (){
    d3.select("#loading-info").classed("hidden", false);
    visibilityStatus = true;
    
  };
  
  /** -- SETUP -- **/
  loadingModule.setup = function (){
    // create connections for close and details button;
    loadingInfoContainer.classed("hidden", !showLoadingDetails);
    detailsButton.on("click", function (){
      showLoadingDetails = !showLoadingDetails;
      loadingInfoContainer.classed("hidden", !showLoadingDetails);
      detailsButton.classed("accordion-trigger-active", showLoadingDetails);
    });
    
    closeButton.on("click", function (){
      menuContainer.classed("hidden", true);
    });
    loadingModule.setBusyMode();
  };
  
  loadingModule.updateSize = function (){
    showLoadingDetails = !(loadingInfoContainer.classed("hidden"));
    loadingInfoContainer.classed("hidden", !showLoadingDetails);
    detailsButton.classed("accordion-trigger-active", showLoadingDetails);
  };
  
  loadingModule.getDetailsState = function (){
    return showLoadingDetails;
  };
  
  loadingModule.expandDetails = function (){
    showLoadingDetails = true;
    loadingInfoContainer.classed("hidden", !showLoadingDetails);
    detailsButton.classed("accordion-trigger-active", showLoadingDetails);
  };
  
  loadingModule.collapseDetails = function (){
    showLoadingDetails = false;
    loadingInfoContainer.classed("hidden", !showLoadingDetails);
    detailsButton.classed("accordion-trigger-active", showLoadingDetails);
  };
  
  loadingModule.setBusyMode = function (){
    d3.select("#currentLoadingStep").style("color", "#fff");
    d3.select("#progressBarValue").node().innherHTML = "";
    d3.select("#progressBarValue").style("width", "20%");
    d3.select("#progressBarValue").classed("busyProgressBar", true);
    progressBarMode = PROGRESS_BAR_BUSY;
  };
  
  loadingModule.setSuccessful = function (){
    d3.select("#currentLoadingStep").style("color", "#0f0");
  };
  
  loadingModule.setErrorMode = function (){
    d3.select("#currentLoadingStep").style("color", "#f00");
    d3.select("#progressBarValue").style("width", "0%");
    d3.select("#progressBarValue").classed("busyProgressBar", false);
    d3.select("#progressBarValue").node().innherHTML = "";
    progressBarMode = PROGRESS_BAR_ERROR;
  };
  
  loadingModule.setPercentMode = function (){
    d3.select("#currentLoadingStep").style("color", "#fff");
    d3.select("#progressBarValue").classed("busyProgressBar", false);
    d3.select("#progressBarValue").node().innherHTML = "0%";
    d3.select("#progressBarValue").style("width", "0%");
    progressBarMode = PROGRESS_BAR_PERCENT;
  };
  
  loadingModule.setPercentValue = function ( val ){
    d3.select("#progressBarValue").node().innherHTML = val;
  };
  
  loadingModule.emptyGraphContentError = function (){
    graph.clearGraphData();
    ontologyMenu.append_message_toLastBulletPoint("<span style='color:red;'>failed</span>");
    ontologyMenu.append_message_toLastBulletPoint("<br><span style=\"color:red;\">Error: Received empty graph</span>");
    loadingWasSuccessFul = false;
    graph.handleOnLoadingError();
    loadingModule.setErrorMode();
  };
  
  loadingModule.isThreadCanceled = function (){
    
  };
  
  loadingModule.initializeLoader = function ( storeCache ){
    if ( storeCache === true && graph.getCachedJsonObj() !== null ) {
      // save cached ontology;
      var cachedContent = JSON.stringify(graph.getCachedJsonObj());
      var cachedName = ontologyIdentifierFromURL;
      ontologyMenu.setCachedOntology(cachedName, cachedContent);
    }
    conversion_sessionId = -10000;
    ontologyMenu.setConversionID(conversion_sessionId);
    ontologyMenu.stopLoadingTimer();
    graph.clearGraphData();
    loadingModule.setBusyMode();
    loadingModule.showLoadingIndicator();
    loadingModule.collapseDetails();
    missingImportsWarning = false;
    d3.select("#loadingIndicator_closeButton").classed("hidden", true);
    ontologyMenu.clearDetailInformation();
  };
  
  /** ------------------ URL Interpreter -------------- **/
  loadingModule.parseUrlAndLoadOntology = function ( storeCache ){
    var autoStore = true;
    if ( storeCache === false ) {
      autoStore = false;
    }
    
    graph.clearAllGraphData();
    loadingModule.initializeLoader(autoStore);
    var urlString = String(location);
    var parameterArray = identifyParameter(urlString);
    ontologyIdentifierFromURL = DEFAULT_JSON_NAME;
    loadGraphOptions(parameterArray); // identifies and loads configuration values
    var loadingMethod = identifyOntologyLoadingMethod(ontologyIdentifierFromURL);
    d3.select("#progressBarValue").node().innerHTML = " ";
    switch ( loadingMethod ) {
      case 0:
        loadingModule.from_presetOntology(ontologyIdentifierFromURL);
        break;
      case 1:
        loadingModule.from_FileUpload(ontologyIdentifierFromURL);
        break;
      case 2:
        loadingModule.from_JSON_URL(ontologyIdentifierFromURL);
        break;
      case 3:
        loadingModule.from_IRI_URL(ontologyIdentifierFromURL);
        break;
      default:
        console.log("Could not identify loading method , or not IMPLEMENTED YET");
    }
  };
  
  /** ------------------- LOADING --------------------- **/
  // the loading module splits into 3 branches
  // 1] PresetOntology Loading
  // 2] File Upload
  // 3] Load From URL / IRI
  
  loadingModule.from_JSON_URL = function ( fileName ){
    var filename = decodeURIComponent(fileName.slice("url=".length));
    ontologyIdentifierFromURL = filename;
    
    var ontologyContent = "";
    if ( ontologyMenu.cachedOntology(filename) ) {
      ontologyMenu.append_bulletPoint("Loading already cached ontology: " + filename);
      ontologyContent = ontologyMenu.cachedOntology(filename);
      loadingWasSuccessFul = true; // cached Ontology should be true;
      parseOntologyContent(ontologyContent);
      
    } else {
      // involve the o2v conveter;
      ontologyMenu.append_message("Retrieving ontology from JSON URL " + filename);
      requestServerTimeStampForJSON_URL(ontologyMenu.callbackLoad_JSON_FromURL, ["read?json=" + filename, filename]);
    }
  };
  
  function requestServerTimeStampForJSON_URL( callback, parameter ){
    d3.xhr("serverTimeStamp", "application/text", function ( error, request ){
      if ( error ) {
        // could not get server timestamp -> no connection to owl2vowl
        ontologyMenu.append_bulletPoint("Could not establish connection to OWL2VOWL service");
        fallbackForJSON_URL(callback, parameter);
      } else {
        conversion_sessionId = request.responseText;
        ontologyMenu.setConversionID(conversion_sessionId);
        parameter.push(conversion_sessionId);
        callback(parameter);
      }
    });
    
  }
  
  loadingModule.requestServerTimeStampForDirectInput = function ( callback, text ){
    d3.xhr("serverTimeStamp", "application/text", function ( error, request ){
      if ( error ) {
        // could not get server timestamp -> no connection to owl2vowl
        ontologyMenu.append_bulletPoint("Could not establish connection to OWL2VOWL service");
        loadingModule.setErrorMode();
        ontologyMenu.append_message_toLastBulletPoint("<br><span style='color:red'>Could not connect to OWL2VOWL service </span>");
        loadingModule.showErrorDetailsMessage();
        d3.select("#progressBarValue").style("width", "0%");
        d3.select("#progressBarValue").classed("busyProgressBar", false);
        d3.select("#progressBarValue").text("0%");
        
      } else {
        conversion_sessionId = request.responseText;
        ontologyMenu.setConversionID(conversion_sessionId);
        callback(text, ["conversionID" + conversion_sessionId, conversion_sessionId]);
      }
    });
  };
  
  loadingModule.from_IRI_URL = function ( fileName ){
    // owl2vowl converters the given ontology url and returns json file;
    var filename = decodeURIComponent(fileName.slice("iri=".length));
    ontologyIdentifierFromURL = filename;
    
    var ontologyContent = "";
    if ( ontologyMenu.cachedOntology(filename) ) {
      ontologyMenu.append_bulletPoint("Loading already cached ontology: " + filename);
      ontologyContent = ontologyMenu.cachedOntology(filename);
      loadingWasSuccessFul = true; // cached Ontology should be true;
      parseOntologyContent(ontologyContent);
    } else {
      // involve the o2v conveter;
      var encoded = encodeURIComponent(filename);
      ontologyMenu.append_bulletPoint("Retrieving ontology from IRI: " + filename);
      requestServerTimeStampForIRI_Converte(ontologyMenu.callbackLoad_Ontology_FromIRI, ["convert?iri=" + encoded, filename]);
    }
  };
  
  loadingModule.fromFileDrop = function ( fileName, file ){
    d3.select("#progressBarValue").node().innerHTML = " ";
    loadingModule.initializeLoader(false);
    
    ontologyMenu.append_bulletPoint("Retrieving ontology from dropped file: " + fileName);
    var ontologyContent = "";
    
    // two options here
    //1] Direct Json Upload
    if ( fileName.match(/\.json$/) ) {
      ontologyMenu.setConversionID(-10000);
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function (){
        ontologyContent = reader.result;
        ontologyIdentifierFromURL = fileName;
        parseOntologyContent(ontologyContent);
      };
    } else {
      //2] File Upload to OWL2VOWL Converter
      // 1) check if we can get a timeStamp;
      var parameterArray = [file, fileName];
      requestServerTimeStamp(ontologyMenu.callbackLoadFromOntology, parameterArray);
    }
  };
  
  
  loadingModule.from_FileUpload = function ( fileName ){
    loadingModule.setBusyMode();
    var filename = decodeURIComponent(fileName.slice("file=".length));
    ontologyIdentifierFromURL = filename;
    var ontologyContent = "";
    if ( ontologyMenu.cachedOntology(filename) ) {
      ontologyMenu.append_bulletPoint("Loading already cached ontology: " + filename);
      ontologyContent = ontologyMenu.cachedOntology(filename);
      loadingWasSuccessFul = true; // cached Ontology should be true;
      parseOntologyContent(ontologyContent);
      
    } else {
      // d3.select("#currentLoadingStep").node().innerHTML="Loading ontology from file "+ filename;
      ontologyMenu.append_bulletPoint("Retrieving ontology from file: " + filename);
      // get the file
      var selectedFile = d3.select("#file-converter-input").property("files")[0];
      // No selection -> this was triggered by the iri. Unequal names -> reuploading another file
      if ( !selectedFile || (filename && (filename !== selectedFile.name)) ) {
        ontologyMenu.append_message_toLastBulletPoint("<br><span style=\"color:red;\">No cached version of \"" + filename + "\" was found.</span><br>Please reupload the file.");
        loadingModule.setErrorMode();
        d3.select("#progressBarValue").classed("busyProgressBar", false);
        graph.handleOnLoadingError();
        return;
      } else {
        filename = selectedFile.name;
      }


// two options here
//1] Direct Json Upload
      if ( filename.match(/\.json$/) ) {
        ontologyMenu.setConversionID(-10000);
        var reader = new FileReader();
        reader.readAsText(selectedFile);
        reader.onload = function (){
          ontologyContent = reader.result;
          ontologyIdentifierFromURL = filename;
          parseOntologyContent(ontologyContent);
        };
      } else {
//2] File Upload to OWL2VOWL Converter
        // 1) check if we can get a timeStamp;
        var parameterArray = [selectedFile, filename];
        requestServerTimeStamp(ontologyMenu.callbackLoadFromOntology, parameterArray);
      }
    }
  };
  
  function fallbackForJSON_URL( callback, parameter ){
    ontologyMenu.append_message_toLastBulletPoint("<br>Trying to convert with other communication protocol.");
    callback(parameter);
    
  }
  
  function fallbackConversion( parameter ){
    ontologyMenu.append_message_toLastBulletPoint("<br>Trying to convert with other communication protocol.");
    var file = parameter[0];
    var name = parameter[1];
    var formData = new FormData();
    formData.append("ontology", file);
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "convert", true);
    var ontologyContent = "";
    xhr.onload = function (){
      if ( xhr.status === 200 ) {
        ontologyContent = xhr.responseText;
        ontologyMenu.setCachedOntology(name, ontologyContent);
        ontologyIdentifierFromURL = name;
        missingImportsWarning = true; // using this variable for warnings
        ontologyMenu.append_message_toLastBulletPoint("<br>Success, <span style='color:yellow'>but you are using a deprecated OWL2VOWL service!<span>");
        parseOntologyContent(ontologyContent);
      }
    };
    
    // check what this thing is doing;
    xhr.onreadystatechange = function (){
      if ( xhr.readyState === 4 && xhr.status === 0 ) {
        ontologyMenu.append_message_toLastBulletPoint("<br>Old protocol also failed to establish connection to OWL2VOWL service!");
        loadingModule.setErrorMode();
        ontologyMenu.append_bulletPoint("Failed to load ontology");
        ontologyMenu.append_message_toLastBulletPoint("<br><span style='color:red'>Could not connect to OWL2VOWL service </span>");
        loadingModule.showErrorDetailsMessage();
      }
    };
    xhr.send(formData);
  }
  
  function requestServerTimeStampForIRI_Converte( callback, parameterArray ){
    d3.xhr("serverTimeStamp", "application/text", function ( error, request ){
      loadingModule.setBusyMode();
      if ( error ) {
        // could not get server timestamp -> no connection to owl2vowl
        ontologyMenu.append_bulletPoint("Could not establish connection to OWL2VOWL service");
        loadingModule.setErrorMode();
        ontologyMenu.append_bulletPoint("Failed to load ontology");
        ontologyMenu.append_message_toLastBulletPoint("<br><span style='color:red'>Could not connect to OWL2VOWL service </span>");
        loadingModule.showErrorDetailsMessage();
      } else {
        conversion_sessionId = request.responseText;
        ontologyMenu.setConversionID(conversion_sessionId);
        // update paramater for new communication paradigm
        parameterArray[0] = parameterArray[0] + "&sessionId=" + conversion_sessionId;
        parameterArray.push(conversion_sessionId);
        callback(parameterArray);
      }
    });
  }
  
  function requestServerTimeStamp( callback, parameterArray ){
    d3.xhr("serverTimeStamp", "application/text", function ( error, request ){
      if ( error ) {
        // could not get server timestamp -> no connection to owl2vowl
        ontologyMenu.append_bulletPoint("Could not establish connection to OWL2VOWL service");
        fallbackConversion(parameterArray); // tries o2v version0.3.4 communication
      } else {
        conversion_sessionId = request.responseText;
        ontologyMenu.setConversionID(conversion_sessionId);
        console.log("Request Session ID:" + conversion_sessionId);
        callback(parameterArray[0], parameterArray[1], conversion_sessionId);
      }
    });
  }
  
  loadingModule.directInput = function ( text ){
    ontologyMenu.clearDetailInformation();
    parseOntologyContent(text);
  };
  
  loadingModule.loadFromOWL2VOWL = function ( ontoContent, filename ){
    loadingWasSuccessFul = false;
    
    var old = d3.select("#bulletPoint_container").node().innerHTML;
    if ( old.indexOf("(with warnings)") !== -1 ) {
      missingImportsWarning = true;
    }
    
    if ( ontologyMenu.cachedOntology(ontoContent) ) {
      ontologyMenu.append_bulletPoint("Loading already cached ontology: " + filename);
      parseOntologyContent(ontoContent);
    } else { // set parse the ontology content;
      parseOntologyContent(ontoContent);
    }
  };
  
  loadingModule.from_presetOntology = function ( selectedOntology ){
    ontologyMenu.append_bulletPoint("Retrieving ontology: " + selectedOntology);
    loadPresetOntology(selectedOntology);
  };
  
  function loadPresetOntology( ontology ){
    // check if already cached in ontology menu?
    var f2r;
    var loadingNewOntologyForEditor=false;
    if ( ontology.indexOf("new_ontology") !== -1 ) {
      loadingModule.hideLoadingIndicator();
      graph.showEditorHintIfNeeded();
      f2r = "./data/new_ontology.json";
      loadingNewOntologyForEditor=true;
    }
    
    loadingWasSuccessFul = false;
    var ontologyContent = "";
    if ( ontologyMenu.cachedOntology(ontology) ) {
      ontologyMenu.append_bulletPoint("Loading already cached ontology: " + ontology);
      ontologyContent = ontologyMenu.cachedOntology(ontology);
      loadingWasSuccessFul = true; // cached Ontology should be true;
      loadingModule.showLoadingIndicator();
      parseOntologyContent(ontologyContent);
      
    } else {
      // read the file name
      
      var fileToRead = "./data/" + ontology + ".json";
      if ( f2r ) {
        fileToRead = f2r;
      } // overwrite the newOntology Index
      // read file
      d3.xhr(fileToRead, "application/json", function ( error, request ){
        var loadingSuccessful = !error;
        if ( loadingSuccessful ) {
          ontologyContent = request.responseText;
          parseOntologyContent(ontologyContent);
        } else {

          if (loadingNewOntologyForEditor){
            ontologyContent = '{\n' +
              '  "_comment": "Empty ontology for WebVOWL Editor",\n' +
              '  "header": {\n' +
              '    "languages": [\n' +
              '      "en"\n' +
              '    ],\n' +
              '    "baseIris": [\n' +
              '      "http://www.w3.org/2000/01/rdf-schema"\n' +
              '    ],\n' +
              '    "iri": "http://visualdataweb.org/newOntology/",\n' +
              '    "title": {\n' +
              '      "en": "New ontology"\n' +
              '    },\n' +
              '    "description": {\n' +
              '      "en": "New ontology description"\n' +
              '    }\n' +
              '  },\n' +
              '  "namespace": [],\n' +
              '  "metrics": {\n' +
              '    "classCount": 0,\n' +
              '    "datatypeCount": 0,\n' +
              '    "objectPropertyCount": 0,\n' +
              '    "datatypePropertyCount": 0,\n' +
              '    "propertyCount": 0,\n' +
              '    "nodeCount": 0,\n' +
              '    "individualCount": 0\n' +
              '  }\n' +
              '}\n';
            parseOntologyContent(ontologyContent);
          }else{
          // some error occurred
          ontologyMenu.append_bulletPoint("Failed to load: " + ontology);
          if (error.status===0){ // assumption this is CORS error when running locally (error status == 0)
            ontologyMenu.append_message_toLastBulletPoint(" <span style='color: red'>ERROR STATUS:</span> " + error.status);
            if (window.location.toString().startsWith("file:/")){
              ontologyMenu.append_message_toLastBulletPoint("<br><p>WebVOWL runs in a local instance.</p>");
              ontologyMenu.append_message_toLastBulletPoint("<p>CORS prevents to automatically load files on host system.</p>");
              ontologyMenu.append_message_toLastBulletPoint("<p>You can load preprocessed ontologies (i.e. VOWL-JSON files) using the upload feature in the ontology menu or by dragging the files and dropping them on the canvas.</p>");
              ontologyMenu.append_message_toLastBulletPoint("<p><i>Hint: </i>Note that the conversion of ontologies into the VOWL-JSON format is not part of WebVOWL but requires an additional converter such as OWL2VOWL.</p>");
              ontologyMenu.append_message_toLastBulletPoint("<p>Ontologies can be created using the editor mode (i.e. activate editing mode in <b>Modes</b> menu and create a new ontology using the <b>Ontology</b> menu.</p>");
            }
          }else {
            ontologyMenu.append_message_toLastBulletPoint(" <span style='color: red'>ERROR STATUS:</span> " + error.status);
          }



          graph.handleOnLoadingError();
          loadingModule.setErrorMode();
          }
        }
      });
    }
  }
  
  
  /** -- PARSE JSON CONTENT -- **/
  function parseOntologyContent( content ){
    
    ontologyMenu.append_bulletPoint("Reading ontology graph ... ");
    var _loader = ontologyMenu.getLoadingFunction();
    _loader(content, ontologyIdentifierFromURL, "noAlternativeNameYet");
  }
  
  loadingModule.notValidJsonFile = function (){
    graph.clearGraphData();
    ontologyMenu.append_message_toLastBulletPoint(" <span style='color:red;'>failed</span>");
    ontologyMenu.append_message_toLastBulletPoint("<br><span style='color:red;'>Error: Received empty graph</span>");
    loadingWasSuccessFul = false;
    graph.handleOnLoadingError();
    
  };
  
  loadingModule.validJsonFile = function (){
    ontologyMenu.append_message_toLastBulletPoint("done");
    loadingWasSuccessFul = true;
  };
  
  
  /** --- HELPER FUNCTIONS **/
  
  function identifyParameter( url ){
    var numParameters = (url.match(/#/g) || []).length;
    // create parameters array
    var paramArray = [];
    if ( numParameters > 0 ) {
      var tokens = url.split("#");
      // skip the first token since it is the address of the server
      for ( var i = 1; i < tokens.length; i++ ) {
        if ( tokens[i].length === 0 ) {
          // this token belongs actually to the last paramArray
          paramArray[paramArray.length - 1] = paramArray[paramArray.length - 1] + "#";
        } else {
          paramArray.push(tokens[i]);
        }
      }
    }
    return paramArray;
  }
  
  
  function loadGraphOptions( parameterArray ){
    var optString = "opts=";
    
    function loadDefaultConfig(){
      graph.options().setOptionsFromURL(graph.options().defaultConfig(), false);
    }
    
    function loadCustomConfig( opts ){
      var changeEditingFlag = false;
      var defObj = graph.options().defaultConfig();
      for ( var i = 0; i < opts.length; i++ ) {
        var keyVal = opts[i].split('=');
        if ( keyVal[0] === "editorMode" ) {
          changeEditingFlag = true;
        }
        defObj[keyVal[0]] = keyVal[1];
      }
      graph.options().setOptionsFromURL(defObj, changeEditingFlag);
    }
    
    function identifyOptions( paramArray ){
      if ( paramArray[0].indexOf(optString) >= 0 ) {
        // parse the parameters;
        var parameterLength = paramArray[0].length;
        var givenOptionsStr = paramArray[0].substr(5, parameterLength - 6);
        var optionsArray = givenOptionsStr.split(';');
        loadCustomConfig(optionsArray);
      } else {
        ontologyIdentifierFromURL = paramArray[0];
        loadDefaultConfig();
      }
    }
    
    function identifyOptionsAndOntology( paramArray ){
      
      if ( paramArray[0].indexOf(optString) >= 0 ) {
        // parse the parameters;
        var parameterLength = paramArray[0].length;
        var givenOptionsStr = paramArray[0].substr(5, parameterLength - 6);
        var optionsArray = givenOptionsStr.split(';');
        loadCustomConfig(optionsArray);
      } else {
        loadDefaultConfig();
      }
      ontologyIdentifierFromURL = paramArray[1];
    }
    
    switch ( parameterArray.length ) {
      case 0:
        loadDefaultConfig();
        break;
      case 1:
        identifyOptions(parameterArray);
        break;
      case 2:
        identifyOptionsAndOntology(parameterArray);
        break;
      default :
        console.log("To many input parameters , loading default config");
        loadDefaultConfig();
        ontologyIdentifierFromURL = "ERROR_TO_MANY_INPUT_PARAMETERS";
    }
  }
  
  
  function identifyOntologyLoadingMethod( url ){
    var iriKey = "iri=";
    var urlKey = "url=";
    var fileKey = "file=";
    
    var method = -1;
    if ( url.substr(0, fileKey.length) === fileKey ) {
      method = FILE_UPLOAD;
    } else if ( url.substr(0, urlKey.length) === urlKey ) {
      method = JSON_URL;
    } else if ( url.substr(0, iriKey.length) === iriKey ) {
      method = IRI_URL;
    } else {
      method = PREDEFINED;
    }
    return method;
  }
  
  return loadingModule;
}
;


