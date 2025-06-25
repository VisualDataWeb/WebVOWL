var unescape = require("lodash/unescape");
var web = import("./web_parser.js").then((web) => {
  web.init();
});

module.exports = function ( graph ){
  
  var ontologyMenu = {},
    loadingInfo = d3.select("#loading-info"),
    loadingProgress = d3.select("#loading-progress"),
    
    ontologyMenuTimeout,
    fileToLoad,
    stopTimer = false,
    loadingError = false,
    loadingStatusTimer,
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
  
  ontologyMenu.callbackLoad_Ontology_FromIRI = function ( parameter ){
    console.log(this.parameters)
  };
  
  
  ontologyMenu.callbackLoad_Ontology_From_DirectInput = function ( text, parameter ){
    console.log(this.arguments)
  };
  
  ontologyMenu.callbackLoad_JSON_FromURL = function ( parameter ){
    console.log(this.arguments)
  };
  
  ontologyMenu.callbackLoadFromOntology = function ( selectedFile, filename, local_threadId ){
    let reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const ext = filename.substr(filename.lastIndexOf(".") + 1);
        const data = reader.result
        var result = await parser.transform(data, "http://unkown", parser.MimeExtMap[ext], getLoader({}));
        loadingModule.loadFromOWL2VOWL(result, filename);
      } catch (e) {
        append_message("<br><span style='color:red'> Failed to convert the file.</span> " +
          " Ontology could not be loaded.<br>Is it a valid OWL ontology? Please check with <a target=\"_blank\"" +
          "href=\"http://visualdataweb.de/validator/\">OWL Validator</a>");

        graph.handleOnLoadingError();
      }
    };
    reader.readAsText(selectedFile);
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
