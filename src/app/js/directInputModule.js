module.exports = function ( graph ){
  /** variable defs **/
  var directInputModule = {};
  var inputContainer = d3.select("#DirectInputContent");
  inputContainer.style("top", "0");
  inputContainer.style("position", "absolute");
  var textArea = d3.select("#directInputTextArea");
  var visibleContainer = false;
  
  inputContainer.style("border", "1px solid black");
  inputContainer.style("padding", "5px");
  inputContainer.style("background", "#fff");
  
  
  // connect upload and close button;
  directInputModule.handleDirectUpload = function (){
    
    var text = textArea.node().value;
    var jsonOBJ;
    try {
      jsonOBJ = JSON.parse(text);
      graph.options().loadingModule().directInput(text);
      // close if successful
      if ( jsonOBJ.class.length > 0 ) {
        directInputModule.setDirectInputMode(false);
      }
    }
    catch ( e ) {
      try {
        // Initialize;
        graph.options().loadingModule().initializeLoader();
        graph.options().loadingModule().requestServerTimeStampForDirectInput(
          graph.options().ontologyMenu().callbackLoad_Ontology_From_DirectInput, text
        );
      } catch ( error2 ) {
        console.log("Error " + error2);
        d3.select("#Error_onLoad").classed("hidden", false);
        d3.select("#Error_onLoad").node().innerHTML = "Failed to convert the input!";
      }
    }
  };
  
  directInputModule.handleCloseButton = function (){
    directInputModule.setDirectInputMode(false);
  };
  
  directInputModule.updateLayout = function (){
    var w = graph.options().width();
    var h = graph.options().height();
    textArea.style("width", 0.4 * w + "px");
    textArea.style("height", 0.7 * h + "px");
  };
  
  directInputModule.setDirectInputMode = function ( val ){
    if ( !val ) {
      visibleContainer = !visibleContainer;
    }
    else {
      visibleContainer = val;
    }
    // update visibility;
    directInputModule.updateLayout();
    d3.select("#Error_onLoad").classed("hidden", true);
    inputContainer.classed("hidden", !visibleContainer);
  };
  
  
  d3.select("#directUploadBtn").on("click", directInputModule.handleDirectUpload);
  d3.select("#close_directUploadBtn").on("click", directInputModule.handleCloseButton);
  
  return directInputModule;
};


