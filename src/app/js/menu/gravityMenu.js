/**
 * Contains the logic for setting up the gravity sliders.
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
module.exports = function ( graph ){
  
  var gravityMenu = {},
    sliders = [],
    options = graph.graphOptions(),
    defaultCharge = options.charge();
  
  
  /**
   * Adds the gravity sliders to the website.
   */
  gravityMenu.setup = function (){
    var menuEntry = d3.select("#m_gravity");
    menuEntry.on("mouseover", function (){
      var searchMenu = graph.options().searchMenu();
      searchMenu.hideSearchEntries();
    });
    addDistanceSlider("#classSliderOption", "class", "Class distance", options.classDistance);
    addDistanceSlider("#datatypeSliderOption", "datatype", "Datatype distance", options.datatypeDistance);
  };
  
  function addDistanceSlider( selector, identifier, label, distanceFunction ){
    var defaultLinkDistance = distanceFunction();
    
    var sliderContainer,
      sliderValueLabel;
    
    sliderContainer = d3.select(selector)
      .append("div")
      .datum({ distanceFunction: distanceFunction }) // connect the options-function with the slider
      .classed("distanceSliderContainer", true);
    
    var slider = sliderContainer.append("input")
      .attr("id", identifier + "DistanceSlider")
      .attr("type", "range")
      .attr("min", 10)
      .attr("max", 600)
      .attr("value", distanceFunction())
      .attr("step", 10);
    
    sliderContainer.append("label")
      .classed("description", true)
      .attr("for", identifier + "DistanceSlider")
      .text(label);
    
    sliderValueLabel = sliderContainer.append("label")
      .classed("value", true)
      .attr("for", identifier + "DistanceSlider")
      .text(distanceFunction());
    
    // Store slider for easier resetting
    sliders.push(slider);
    
    slider.on("focusout", function (){
      graph.updateStyle();
    });
    
    slider.on("input", function (){
      var distance = slider.property("value");
      distanceFunction(distance);
      adjustCharge(defaultLinkDistance);
      sliderValueLabel.text(distance);
      graph.updateStyle();
    });
    
    // add wheel event to the slider
    slider.on("wheel", function (){
      var wheelEvent = d3.event;
      var offset;
      if ( wheelEvent.deltaY < 0 ) offset = 10;
      if ( wheelEvent.deltaY > 0 ) offset = -10;
      var oldVal = parseInt(slider.property("value"));
      var newSliderValue = oldVal + offset;
      if ( newSliderValue !== oldVal ) {
        slider.property("value", newSliderValue);
        distanceFunction(newSliderValue);
        slider.on("input")(); // << set text and update the graphStyles
      }
      d3.event.preventDefault();
    });
  }
  
  function adjustCharge( defaultLinkDistance ){
    var greaterDistance = Math.max(options.classDistance(), options.datatypeDistance()),
      ratio = greaterDistance / defaultLinkDistance,
      newCharge = defaultCharge * ratio;
    
    options.charge(newCharge);
  }
  
  /**
   * Resets the gravity sliders to their default.
   */
  gravityMenu.reset = function (){
    sliders.forEach(function ( slider ){
      slider.property("value", function ( d ){
        // Simply reload the distance from the options
        return d.distanceFunction();
      });
      slider.on("input")();
    });
  };
  
  
  return gravityMenu;
};
