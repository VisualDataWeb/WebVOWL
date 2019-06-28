/**
 * Contains the logic for the reset button.
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
module.exports = function ( graph ){
  
  var resetMenu = {},
    options = graph.graphOptions(),
    resettableModules,
    untouchedOptions = webvowl.options();
  
  
  /**
   * Adds the reset button to the website.
   * @param _resettableModules modules that can be resetted
   */
  resetMenu.setup = function ( _resettableModules ){
    resettableModules = _resettableModules;
    d3.select("#reset-button").on("click", resetGraph);
    var menuEntry = d3.select("#resetOption");
    menuEntry.on("mouseover", function (){
      var searchMenu = graph.options().searchMenu();
      searchMenu.hideSearchEntries();
    });
  };
  
  function resetGraph(){
    graph.resetSearchHighlight();
    graph.options().searchMenu().clearText();
    options.classDistance(untouchedOptions.classDistance());
    options.datatypeDistance(untouchedOptions.datatypeDistance());
    options.charge(untouchedOptions.charge());
    options.gravity(untouchedOptions.gravity());
    options.linkStrength(untouchedOptions.linkStrength());
    graph.reset();
    
    resettableModules.forEach(function ( module ){
      module.reset();
    });
    
    graph.updateStyle();
  }
  
  
  return resetMenu;
};
