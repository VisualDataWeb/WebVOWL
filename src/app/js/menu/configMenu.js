module.exports = function ( graph ){
  var configMenu = {},
    checkboxes = [];
  
  
  configMenu.setup = function (){
    var menuEntry = d3.select("#m_modes");
    menuEntry.on("mouseover", function (){
      var searchMenu = graph.options().searchMenu();
      searchMenu.hideSearchEntries();
    });
    
    addCheckBox("showZoomSlider", "Zoom controls", "#zoomSliderOption", graph.options().zoomSlider().showSlider, 0);
    addLabelWidthSlider("#maxLabelWidthSliderOption", "maxLabelWidth", "Max label width", graph.options().maxLabelWidth);
  };
  
  
  function addLabelWidthSlider( selector, identifier, label, onChangeFunction ){
    var sliderContainer,
      sliderValueLabel;
    
    sliderContainer = d3.select(selector)
      .append("div")
      .classed("distanceSliderContainer", true);
    
    var slider = sliderContainer.append("input")
      .attr("id", identifier + "Slider")
      .attr("type", "range")
      .attr("min", 20)
      .attr("max", 600)
      .attr("value", onChangeFunction())
      .attr("step", 10);
    sliderContainer.append("label")
      .classed("description", true)
      .attr("for", identifier + "Slider")
      .attr("id", identifier + "DescriptionLabel")
      .text(label);
    sliderValueLabel = sliderContainer.append("label")
      .classed("value", true)
      .attr("for", identifier + "Slider")
      .attr("id", identifier + "valueLabel")
      .text(onChangeFunction());
    
    slider.on("input", function (){
      var value = slider.property("value");
      onChangeFunction(value);
      sliderValueLabel.text(value);
      if ( graph.options().dynamicLabelWidth() === true )
        graph.animateDynamicLabelWidth();
    });
    
    // add wheel event to the slider
    slider.on("wheel", function (){
      if ( slider.node().disabled === true ) return;
      var wheelEvent = d3.event;
      var offset;
      if ( wheelEvent.deltaY < 0 ) offset = 10;
      if ( wheelEvent.deltaY > 0 ) offset = -10;
      var oldVal = parseInt(slider.property("value"));
      var newSliderValue = oldVal + offset;
      if ( newSliderValue !== oldVal ) {
        slider.property("value", newSliderValue);
        onChangeFunction(newSliderValue);
        slider.on("input")(); // << set text and update the graphStyles
      }
      d3.event.preventDefault();
    });
  }
  
  function addCheckBox( identifier, modeName, selector, onChangeFunc, updateLvl ){
    var configOptionContainer = d3.select(selector)
      .append("div")
      .classed("checkboxContainer", true);
    var configCheckbox = configOptionContainer.append("input")
      .classed("moduleCheckbox", true)
      .attr("id", identifier + "ConfigCheckbox")
      .attr("type", "checkbox")
      .property("checked", onChangeFunc());
    
    
    configCheckbox.on("click", function ( silent ){
      var isEnabled = configCheckbox.property("checked");
      onChangeFunc(isEnabled);
      if ( silent !== true ) {
        // updating graph when silent is false or the parameter is not given.
        if ( updateLvl === 1 ) {
          graph.lazyRefresh();
          //graph.redrawWithoutForce
        }
        if ( updateLvl === 2 ) {
          graph.update();
        }
        
        if ( updateLvl === 3 ) {
          graph.updateDraggerElements();
        }
      }
      
    });
    checkboxes.push(configCheckbox);
    configOptionContainer.append("label")
      .attr("for", identifier + "ConfigCheckbox")
      .text(modeName);
  }
  
  configMenu.setCheckBoxValue = function ( identifier, value ){
    for ( var i = 0; i < checkboxes.length; i++ ) {
      var cbdId = checkboxes[i].attr("id");
      if ( cbdId === identifier ) {
        checkboxes[i].property("checked", value);
        break;
      }
    }
  };
  
  configMenu.getCheckBoxValue = function ( id ){
    for ( var i = 0; i < checkboxes.length; i++ ) {
      var cbdId = checkboxes[i].attr("id");
      if ( cbdId === id ) {
        return checkboxes[i].property("checked");
      }
    }
  };
  
  configMenu.updateSettings = function (){
    var silent = true;
    checkboxes.forEach(function ( checkbox ){
      checkbox.on("click")(silent);
    });
  };
  
  return configMenu;
};
