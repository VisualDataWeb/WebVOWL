/**
 * Contains the logic for the pause and resume button.
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
module.exports = function ( graph ){
  
  var pauseMenu = {},
    pauseButton;
  
  
  /**
   * Adds the pause button to the website.
   */
  pauseMenu.setup = function (){
    var menuEntry = d3.select("#pauseOption");
    menuEntry.on("mouseover", function (){
      var searchMenu = graph.options().searchMenu();
      searchMenu.hideSearchEntries();
    });
    pauseButton = d3.select("#pause-button")
      .datum({ paused: false })
      .on("click", function ( d ){
        graph.paused(!d.paused);
        d.paused = !d.paused;
        updatePauseButton();
        pauseButton.classed("highlighted", d.paused);
      });
    // Set these properties the first time manually
    updatePauseButton();
  };
  
  pauseMenu.setPauseValue = function ( value ){
    pauseButton.datum().paused = value;
    graph.paused(value);
    pauseButton.classed("highlighted", value);
    updatePauseButton();
  };
  
  function updatePauseButton(){
    updatePauseButtonClass();
    updatePauseButtonText();
  }
  
  function updatePauseButtonClass(){
    pauseButton.classed("paused", function ( d ){
      return d.paused;
    });
  }
  
  function updatePauseButtonText(){
    if ( pauseButton.datum().paused ) {
      pauseButton.text("Resume");
    } else {
      pauseButton.text("Pause");
    }
  }
  
  pauseMenu.reset = function (){
    // resuming
    pauseMenu.setPauseValue(false);
  };
  
  
  return pauseMenu;
};
