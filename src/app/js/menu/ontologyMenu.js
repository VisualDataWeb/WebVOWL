var unescape = require("lodash/unescape");

module.exports = function ( graph ){
  
  var ontologyMenu = {},
    loadingInfo = d3.select("#loading-info"),
    loadingProgress = d3.select("#loading-progress"),
    
    ontologyMenuTimeout,
    fileToLoad,
    stopTimer = false,
    loadingError = false,
    loadingStatusTimer,
    conversion_sessionId,
    cachedConversions = {},
    loadingModule,
    loadOntologyFromText;
  var currentLoadedOntologyName = "";
  
  String.prototype.beginsWith = function ( string ){
    return (this.indexOf(string) === 0);
  };
  
  ontologyMenu.getLoadingFunction = function (){
    return loadOntologyFromText;
  };
  
  ontologyMenu.clearCachedVersion = function (){
    if ( cachedConversions[currentLoadedOntologyName] ) {
      cachedConversions[currentLoadedOntologyName] = undefined;
    }
  };
  
  
  ontologyMenu.reloadCachedOntology = function (){
    ontologyMenu.clearCachedVersion();
    graph.clearGraphData();
    loadingModule.parseUrlAndLoadOntology(false);
  };
  
  ontologyMenu.cachedOntology = function ( ontoName ){
    currentLoadedOntologyName = ontoName;
    if ( cachedConversions[ontoName] ) {
      var locStr = String(location.hash);
      d3.select("#reloadSvgIcon").node().disabled = false;
      graph.showReloadButtonAfterLayoutOptimization(true);
      if ( locStr.indexOf("#file") > -1 ) {
        d3.select("#reloadSvgIcon").node().disabled = true;
        d3.select("#reloadCachedOntology").node().title = "reloading original version not possible, please reload the file";
        d3.select("#reloadSvgIcon").classed("disabledReloadElement", true);
        d3.select("#svgStringText").style("fill", "gray");
        d3.select("#svgStringText").classed("noselect", true);
      }
      else {
        d3.select("#reloadCachedOntology").node().title = "generate new visualization and overwrite cached ontology";
        d3.select("#reloadSvgIcon").classed("disabledReloadElement", false);
        d3.select("#svgStringText").style("fill", "black");
        d3.select("#svgStringText").classed("noselect", true);
      }
    } else {
      graph.showReloadButtonAfterLayoutOptimization(false);
      
    }
    return cachedConversions[ontoName];
  };
  ontologyMenu.setCachedOntology = function ( ontoName, ontoContent ){
    cachedConversions[ontoName] = ontoContent;
    currentLoadedOntologyName = ontoName;
  };
  
  ontologyMenu.getErrorStatus = function (){
    return loadingError;
  };
  
  ontologyMenu.setup = function ( _loadOntologyFromText ){
    loadOntologyFromText = _loadOntologyFromText;
    loadingModule = graph.options().loadingModule();
    var menuEntry = d3.select("#m_select");
    menuEntry.on("mouseover", function (){
      var searchMenu = graph.options().searchMenu();
      searchMenu.hideSearchEntries();
    });
    
    setupConverterButtons();
    setupUploadButton();
    
    var descriptionButton = d3.select("#error-description-button").datum({ open: false });
    descriptionButton.on("click", function ( data ){
      var errorContainer = d3.select("#error-description-container");
      var errorDetailsButton = d3.select(this);
      
      // toggle the state
      data.open = !data.open;
      var descriptionVisible = data.open;
      if ( descriptionVisible ) {
        errorDetailsButton.text("Hide error details");
      } else {
        errorDetailsButton.text("Show error details");
      }
      errorContainer.classed("hidden", !descriptionVisible);
    });
    
    setupUriListener();
    loadingModule.setOntologyMenu(ontologyMenu);
  };
  
  
  function setupUriListener(){
    // reload ontology when hash parameter gets changed manually
    d3.select(window).on("hashchange", function (){
      var oldURL = d3.event.oldURL, newURL = d3.event.newURL;
      if ( oldURL !== newURL ) {
        // don't reload when just the hash parameter gets appended
        if ( newURL === oldURL + "#" ) {
          return;
        }
        updateNavigationHrefs();
        loadingModule.parseUrlAndLoadOntology();
      }
    });
    updateNavigationHrefs();
  }
  
  ontologyMenu.stopLoadingTimer = function (){
    stopTimer = true;
    clearTimeout(loadingStatusTimer);
  };
  
  /**
   * Quick fix: update all anchor tags that are used as buttons because a click on them
   * changes the url and this will load an other ontology.
   */
  function updateNavigationHrefs(){
    d3.selectAll("#menuElementContainer > li > a").attr("href", location.hash || "#");
  }
  
  ontologyMenu.setIriText = function ( text ){
    d3.select("#iri-converter-input").node().value = text;
    d3.select("#iri-converter-button").attr("disabled", false);
    d3.select("#iri-converter-form").on("submit")();
  };
  
  ontologyMenu.clearDetailInformation = function (){
    var bpContainer = d3.select("#bulletPoint_container");
    var htmlCollection = bpContainer.node().children;
    var numEntries = htmlCollection.length;
    
    for ( var i = 0; i < numEntries; i++ ) {
      htmlCollection[0].remove();
    }
  };
  ontologyMenu.append_message = function ( msg ){
    // forward call
    append_message(msg);
  };
  function append_message( msg ){
    var bpContainer = d3.select("#bulletPoint_container");
    var div = bpContainer.append("div");
    div.node().innerHTML = msg;
    loadingModule.scrollDownDetails();
  }
  
  ontologyMenu.append_message_toLastBulletPoint = function ( msg ){
    // forward call
    append_message_toLastBulletPoint(msg);
  };
  
  ontologyMenu.append_bulletPoint = function ( msg ){
    // forward call
    append_bulletPoint(msg);
  };
  function append_message_toLastBulletPoint( msg ){
    var bpContainer = d3.select("#bulletPoint_container");
    var htmlCollection = bpContainer.node().getElementsByTagName("LI");
    var lastItem = htmlCollection.length - 1;
    if ( lastItem >= 0 ) {
      var oldText = htmlCollection[lastItem].innerHTML;
      htmlCollection[lastItem].innerHTML = oldText + msg;
    }
    loadingModule.scrollDownDetails();
  }
  
  function append_bulletPoint( msg ){
    var bp_container = d3.select("#bulletPoint_container");
    var bp = bp_container.append("li");
    bp.node().innerHTML = msg;
    d3.select("#currentLoadingStep").node().innerHTML = msg;
    loadingModule.scrollDownDetails();
  }
  
  
  function setupConverterButtons(){
    var iriConverterButton = d3.select("#iri-converter-button");
    var iriConverterInput = d3.select("#iri-converter-input");
    
    iriConverterInput.on("input", function (){
      keepOntologySelectionOpenShortly();
      
      var inputIsEmpty = iriConverterInput.property("value") === "";
      iriConverterButton.attr("disabled", inputIsEmpty || undefined);
    }).on("click", function (){
      keepOntologySelectionOpenShortly();
    });
    
    d3.select("#iri-converter-form").on("submit", function (){
      var inputName = iriConverterInput.property("value");
      
      // remove first spaces
      var clearedName = inputName.replace(/%20/g, " ");
      while ( clearedName.beginsWith(" ") ) {
        clearedName = clearedName.substr(1, clearedName.length);
      }
      // remove ending spaces
      while ( clearedName.endsWith(" ") ) {
        clearedName = clearedName.substr(0, clearedName.length - 1);
      }
      // check if iri is actually an url for a json file (ends with .json)
      // create lowercase filenames;
      inputName = clearedName;
      var lc_iri = inputName.toLowerCase();
      if ( lc_iri.endsWith(".json") ) {
        location.hash = "url=" + inputName;
        iriConverterInput.property("value", "");
        iriConverterInput.on("input")();
      } else {
        location.hash = "iri=" + inputName;
        iriConverterInput.property("value", "");
        iriConverterInput.on("input")();
      }
      d3.event.preventDefault();
      return false;
    });
  }
  
  function setupUploadButton(){
    var input = d3.select("#file-converter-input"),
      inputLabel = d3.select("#file-converter-label"),
      uploadButton = d3.select("#file-converter-button");
    
    input.on("change", function (){
      var selectedFiles = input.property("files");
      if ( selectedFiles.length <= 0 ) {
        inputLabel.text("Select ontology file");
        uploadButton.property("disabled", true);
      } else {
        inputLabel.text(selectedFiles[0].name);
        fileToLoad = selectedFiles[0].name;
        uploadButton.property("disabled", false);
        uploadButton.node().click();
        // close menu;
        graph.options().navigationMenu().hideAllMenus();
      }
    });
    
    uploadButton.on("click", function (){
      var selectedFile = input.property("files")[0];
      if ( !selectedFile ) {
        return false;
      }
      var newHashParameter = "file=" + selectedFile.name;
      // Trigger the reupload manually, because the iri is not changing
      if ( location.hash === "#" + newHashParameter ) {
        loadingModule.parseUrlAndLoadOntology();
      } else {
        location.hash = newHashParameter;
      }
    });
  }
  
  function setLoadingStatusInfo( message ){
    // check if there is a owl2vowl li item;
    var o2vConverterContainer = d3.select("#o2vConverterContainer");
    if ( !o2vConverterContainer.node() ) {
      var bp_container = d3.select("#bulletPoint_container");
      var div = bp_container.append("div");
      o2vConverterContainer = div.append("ul");
      o2vConverterContainer.attr("id", "o2vConverterContainer");
      o2vConverterContainer.style("margin-left", "-25px");
    }
    // clear o2vConverterContainer;
    var htmlCollection = o2vConverterContainer.node().children;
    var numEntries = htmlCollection.length;
    for ( var i = 0; i < numEntries; i++ ) {
      htmlCollection[0].remove();
    }
    // split tokens provided by o2v messages
    var tokens = message.split("* ");
    var liForToken;
    for ( var t = 0; t < tokens.length; t++ ) {
      var tokenMessage = tokens[t];
      // create li for tokens;
      if ( tokenMessage.length > 0 ) {
        liForToken = o2vConverterContainer.append("li");
        liForToken.attr("type", "disc");
        liForToken.node().innerHTML = tokenMessage.replace(/\n/g, "<br>");
      }
    }
    if ( liForToken )
      liForToken.node().innerHTML += "<br>";
    
    loadingModule.scrollDownDetails();
  }
  
  ontologyMenu.setLoadingStatusInfo = function ( message ){
    // forward call
    setLoadingStatusInfo(message);
  };
  
  function getLoadingStatusOnceCallBacked( callback, parameter ){
    d3.xhr("loadingStatus?sessionId=" + conversion_sessionId, "application/text", function ( error, request ){
      if ( error ) {
        console.log("ontologyMenu getLoadingStatusOnceCallBacked throws error");
        console.log("---------Error -----------");
        console.log(error);
        console.log("---------Request -----------");
        console.log(request);
      }
      setLoadingStatusInfo(request.responseText);
      callback(parameter);
    });
  }
  
  function getLoadingStatusTimeLooped(){
    d3.xhr("loadingStatus?sessionId=" + conversion_sessionId, "application/text", function ( error, request ){
      if ( error ) {
        console.log("ontologyMenu getLoadingStatusTimeLooped throws error");
        console.log("---------Error -----------");
        console.log(error);
        console.log("---------Request -----------");
        console.log(request);
      }
      if ( stopTimer === false ) {
        setLoadingStatusInfo(request.responseText);
        timedLoadingStatusLogger();
      }
    });
  }
  
  function timedLoadingStatusLogger(){
    clearTimeout(loadingStatusTimer);
    if ( stopTimer === false ) {
      loadingStatusTimer = setTimeout(function (){
        getLoadingStatusTimeLooped();
      }, 1000);
    }
  }
  
  function callbackUpdateLoadingMessage( msg ){
    d3.xhr("loadingStatus", "application/text", function ( error, request ){
      if ( request !== undefined ) {
        setLoadingStatusInfo(request.responseText + "<br>" + msg);
      } else {
        append_message(msg);
      }
    });
  }
  
  ontologyMenu.setConversionID = function ( id ){
    conversion_sessionId = id;
  };
  
  ontologyMenu.callbackLoad_Ontology_FromIRI = function ( parameter ){
    var relativePath = parameter[0];
    var ontoName = parameter[1];
    var localThreadId = parameter[2];
    stopTimer = false;
    timedLoadingStatusLogger();
    d3.xhr(relativePath, "application/json", function ( error, request ){
      var loadingSuccessful = !error;
      // check if error occurred or responseText is empty
      if ( (error !== null && error.status === 500) || (request && request.responseText.length === 0) ) {
        clearTimeout(loadingStatusTimer);
        stopTimer = true;
        getLoadingStatusOnceCallBacked(callbackFromIRI_URL_ERROR, [error, request, localThreadId]);
      }
      var jsonText;
      if ( loadingSuccessful ) {
        clearTimeout(loadingStatusTimer);
        stopTimer = true;
        jsonText = request.responseText;
        getLoadingStatusOnceCallBacked(callbackFromIRI_Success, [jsonText, ontoName, localThreadId]);
      }
    });
  };
  
  
  ontologyMenu.callbackLoad_Ontology_From_DirectInput = function ( text, parameter ){
    var input = text;
    var sessionId = parameter[1];
    stopTimer = false;
    timedLoadingStatusLogger();
    
    var formData = new FormData();
    formData.append("input", input);
    formData.append("sessionId", sessionId);
    var xhr = new XMLHttpRequest();
    
    xhr.open("POST", "directInput", true);
    xhr.onload = function (){
      clearTimeout(loadingStatusTimer);
      stopTimer = true;
      getLoadingStatusOnceCallBacked(callbackForConvert, [xhr, input, sessionId]);
    };
    timedLoadingStatusLogger();
    xhr.send(formData);
    
  };
  function callbackFromIRI_Success( parameter ){
    var local_conversionId = parameter[2];
    if ( local_conversionId !== conversion_sessionId ) {
      console.log("The conversion process for file:" + parameter[1] + " has been canceled!");
      ontologyMenu.conversionFinished(local_conversionId);
      return;
    }
    loadingModule.loadFromOWL2VOWL(parameter[0], parameter[1]);
    ontologyMenu.conversionFinished();
    
  }
  
  function callbackFromDirectInput_Success( parameter ){
    var local_conversionId = parameter[1];
    if ( local_conversionId !== conversion_sessionId ) {
      console.log("The conversion process for file:" + parameter[1] + " has been canceled!");
      ontologyMenu.conversionFinished(local_conversionId);
      return;
    }
    loadingModule.loadFromOWL2VOWL(parameter[0], "DirectInputConversionID" + local_conversionId);
    ontologyMenu.conversionFinished();
    
  }
  
  ontologyMenu.getConversionId = function (){
    return conversion_sessionId;
  };
  
  ontologyMenu.callbackLoad_JSON_FromURL = function ( parameter ){
    var relativePath = parameter[0];
    var ontoName = parameter[1];
    var local_conversionId = parameter[2];
    stopTimer = false;
    timedLoadingStatusLogger();
    d3.xhr(relativePath, "application/json", function ( error, request ){
      var loadingSuccessful = !error;
      // check if error occurred or responseText is empty
      if ( (error !== null && error.status === 500) || (request && request.responseText.length === 0) ) {
        clearTimeout(loadingStatusTimer);
        stopTimer = true;
        loadingSuccessful = false;
        console.log(request);
        console.log(request.responseText.length);
        getLoadingStatusOnceCallBacked(callbackFromJSON_URL_ERROR, [error, request, local_conversionId]);
      }
      if ( loadingSuccessful ) {
        clearTimeout(loadingStatusTimer);
        stopTimer = true;
        var jsonText = request.responseText;
        getLoadingStatusOnceCallBacked(callbackFromJSON_Success, [jsonText, ontoName, local_conversionId]);
      }
    });
  };
  
  function callbackFromJSON_Success( parameter ){
    var local_conversionId = parameter[2];
    if ( local_conversionId !== conversion_sessionId ) {
      console.log("The conversion process for file:" + parameter[1] + " has been canceled!");
      return;
    }
    loadingModule.loadFromOWL2VOWL(parameter[0], parameter[1]);
  }
  
  function callbackFromJSON_URL_ERROR( parameter ){
    var error = parameter[0];
    var request = parameter[1];
    var local_conversionId = parameter[2];
    if ( local_conversionId !== conversion_sessionId ) {
      console.log("This thread has been canceled!!");
      ontologyMenu.conversionFinished(local_conversionId);
      return;
    }
    callbackUpdateLoadingMessage("<br><span style='color:red'> Failed to convert the file.</span> " +
      " Ontology could not be loaded.<br>Is it a valid OWL ontology? Please check with <a target=\"_blank\"" +
      "href=\"http://visualdataweb.de/validator/\">OWL Validator</a>");
    
    if ( error !== null && error.status === 500 ) {
      append_message("<span style='color:red'>Could not find ontology  at the URL</span>");
    }
    if ( request && request.responseText.length === 0 ) {
      append_message("<span style='color:red'>Received empty graph</span>");
    }
    graph.handleOnLoadingError();
    ontologyMenu.conversionFinished();
  }
  
  
  function callbackFromIRI_URL_ERROR( parameter ){
    var error = parameter[0];
    var request = parameter[1];
    var local_conversionId = parameter[2];
    if ( local_conversionId !== conversion_sessionId ) {
      console.log("This thread has been canceled!!");
      ontologyMenu.conversionFinished(local_conversionId);
      return;
    }
    callbackUpdateLoadingMessage("<br><span style='color:red'> Failed to convert the file.</span> " +
      " Ontology could not be loaded.<br>Is it a valid OWL ontology? Please check with <a target=\"_blank\"" +
      "href=\"http://visualdataweb.de/validator/\">OWL Validator</a>");
    
    if ( error !== null && error.status === 500 ) {
      append_message("<span style='color:red'>Could not find ontology  at the URL</span>");
    }
    if ( request && request.responseText.length === 0 ) {
      append_message("<span style='color:red'>Received empty graph</span>");
    }
    graph.handleOnLoadingError();
    ontologyMenu.conversionFinished();
  }
  
  function callbackFromDirectInput_ERROR( parameter ){
    
    var error = parameter[0];
    var request = parameter[1];
    var local_conversionId = parameter[2];
    if ( local_conversionId !== conversion_sessionId ) {
      console.log("The loading process for direct input has been canceled!");
      return;
    }
    // callbackUpdateLoadingMessage("<br> <span style='color:red'> Failed to convert the file.</span> "+
    //     "Ontology could not be loaded.<br>Is it a valid OWL ontology? Please check with <a target=\"_blank\"" +
    //     "href=\"http://visualdataweb.de/validator/\">OWL Validator</a>");
    if ( error !== null && error.status === 500 ) {
      append_message("<span style='color:red'>Could not convert direct input</span>");
    }
    if ( request && request.responseText.length === 0 ) {
      append_message("<span style='color:red'>Received empty graph</span>");
    }
    
    graph.handleOnLoadingError();
    ontologyMenu.conversionFinished();
  }
  
  ontologyMenu.callbackLoadFromOntology = function ( selectedFile, filename, local_threadId ){
    callbackLoadFromOntology(selectedFile, filename, local_threadId);
  };
  
  function callbackLoadFromOntology( selectedFile, filename, local_threadId ){
    stopTimer = false;
    timedLoadingStatusLogger();
    
    var formData = new FormData();
    formData.append("ontology", selectedFile);
    formData.append("sessionId", local_threadId);
    var xhr = new XMLHttpRequest();
    
    xhr.open("POST", "convert", true);
    xhr.onload = function (){
      clearTimeout(loadingStatusTimer);
      stopTimer = true;
      console.log(xhr);
      getLoadingStatusOnceCallBacked(callbackForConvert, [xhr, filename, local_threadId]);
    };
    timedLoadingStatusLogger();
    xhr.send(formData);
  }
  
  function callbackForConvert( parameter ){
    var xhr = parameter[0];
    var filename = parameter[1];
    var local_threadId = parameter[2];
    if ( local_threadId !== conversion_sessionId ) {
      console.log("The conversion process for file:" + filename + " has been canceled!");
      ontologyMenu.conversionFinished(local_threadId);
      return;
    }
    if ( xhr.status === 200 ) {
      loadingModule.loadFromOWL2VOWL(xhr.responseText, filename);
      ontologyMenu.conversionFinished();
    } else {
      var uglyJson=xhr.responseText;
      var jsonResut=JSON.parse(uglyJson);
      var niceJSON=JSON.stringify(jsonResut, 'null', '  ');
      niceJSON= niceJSON.replace(new RegExp('\r?\n','g'), '<br />');
      callbackUpdateLoadingMessage("Failed to convert the file. " +
          "<br />Server answer: <br />"+
          "<hr>"+niceJSON+ "<hr>"+
        "Ontology could not be loaded.<br />Is it a valid OWL ontology? Please check with <a target=\"_blank\"" +
        "href=\"http://visualdataweb.de/validator/\">OWL Validator</a>");
      
      graph.handleOnLoadingError();
      ontologyMenu.conversionFinished();
    }
  }
  
  ontologyMenu.conversionFinished = function ( id ){
    var local_id = conversion_sessionId;
    if ( id ) {
      local_id = id;
    }
    d3.xhr("conversionDone?sessionId=" + local_id, "application/text", function ( error, request ){
      if ( error ) {
        console.log("ontologyMenu conversionFinished throws error");
        console.log("---------Error -----------");
        console.log(error);
        console.log("---------Request -----------");
        console.log(request);
      }
    });
  };
  
  function keepOntologySelectionOpenShortly(){
    // Events in the menu should not be considered
    var ontologySelection = d3.select("#select .toolTipMenu");
    ontologySelection.on("click", function (){
      d3.event.stopPropagation();
    }).on("keydown", function (){
      d3.event.stopPropagation();
    });
    
    ontologySelection.style("display", "block");
    
    function disableKeepingOpen(){
      ontologySelection.style("display", undefined);
      
      clearTimeout(ontologyMenuTimeout);
      d3.select(window).on("click", undefined).on("keydown", undefined);
      ontologySelection.on("mouseover", undefined);
    }
    
    // Clear the timeout to handle fast calls of this function
    clearTimeout(ontologyMenuTimeout);
    ontologyMenuTimeout = setTimeout(function (){
      disableKeepingOpen();
    }, 3000);
    
    // Disable forced open selection on interaction
    d3.select(window).on("click", function (){
      disableKeepingOpen();
    }).on("keydown", function (){
      disableKeepingOpen();
    });
    
    ontologySelection.on("mouseover", function (){
      disableKeepingOpen();
    });
  }
  
  ontologyMenu.showLoadingStatus = function ( visible ){
    if ( visible === true ) {
      displayLoadingIndicators();
    }
    else {
      hideLoadingInformations();
    }
  };
  
  function displayLoadingIndicators(){
    d3.select("#layoutLoadingProgressBarContainer").classed("hidden", false);
    loadingInfo.classed("hidden", false);
    loadingProgress.classed("hidden", false);
  }
  
  function hideLoadingInformations(){
    loadingInfo.classed("hidden", true);
  }
  
  return ontologyMenu;
};
