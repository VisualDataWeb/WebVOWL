/**
 * Contains the logic for connecting the modes with the website.
 *
 * @param graph the graph that belongs to these controls
 * @returns {{}}
 */
module.exports = function ( graph ){
  
  var SAME_COLOR_MODE = { text: "Multicolor", type: "same" };
  var GRADIENT_COLOR_MODE = { text: "Multicolor", type: "gradient" };
  
  var modeMenu = {},
    checkboxes = [],
    colorModeSwitch;
  
  var dynamicLabelWidthCheckBox;
  // getter and setter for the state of color modes
  modeMenu.colorModeState = function ( s ){
    if ( !arguments.length ) return colorModeSwitch.datum().active;
    colorModeSwitch.datum().active = s;
    return modeMenu;
  };
  
  
  modeMenu.setDynamicLabelWidth = function ( val ){
    dynamicLabelWidthCheckBox.property("checked", val);
  };
  // getter for checkboxes
  modeMenu.getCheckBoxContainer = function (){
    return checkboxes;
  };
  // getter for the color switch [needed? ]
  modeMenu.colorModeSwitch = function (){
    return colorModeSwitch;
  };
  
  /**
   * Connects the website with the available graph modes.
   */
  modeMenu.setup = function ( pickAndPin, nodeScaling, compactNotation, colorExternals ){
    var menuEntry = d3.select("#m_modes");
    menuEntry.on("mouseover", function (){
      var searchMenu = graph.options().searchMenu();
      searchMenu.hideSearchEntries();
    });
    addCheckBoxD("labelWidth", "Dynamic label width", "#dynamicLabelWidth", graph.options().dynamicLabelWidth, 1);
    addCheckBox("editorMode", "Editing ", "#editMode", graph.editorMode);
    addModeItem(pickAndPin, "pickandpin", "Pick & pin", "#pickAndPinOption", false);
    addModeItem(nodeScaling, "nodescaling", "Node scaling", "#nodeScalingOption", true);
    addModeItem(compactNotation, "compactnotation", "Compact notation", "#compactNotationOption", true);
    var container = addModeItem(colorExternals, "colorexternals", "Color externals", "#colorExternalsOption", true);
    colorModeSwitch = addExternalModeSelection(container, colorExternals);
  };
  function addCheckBoxD( identifier, modeName, selector, onChangeFunc, updateLvl ){
    var moduleOptionContainer = d3.select(selector)
      .append("div")
      .classed("checkboxContainer", true);
    
    var moduleCheckbox = moduleOptionContainer.append("input")
      .classed("moduleCheckbox", true)
      .attr("id", identifier + "ModuleCheckbox")
      .attr("type", "checkbox")
      .property("checked", onChangeFunc());
    
    moduleCheckbox.on("click", function ( d ){
      var isEnabled = moduleCheckbox.property("checked");
      onChangeFunc(isEnabled);
      d3.select("#maxLabelWidthSlider").node().disabled = !isEnabled;
      d3.select("#maxLabelWidthvalueLabel").classed("disabledLabelForSlider", !isEnabled);
      d3.select("#maxLabelWidthDescriptionLabel").classed("disabledLabelForSlider", !isEnabled);
      
      if ( updateLvl > 0 ) {
        graph.animateDynamicLabelWidth();
        // graph.lazyRefresh();
      }
    });
    moduleOptionContainer.append("label")
      .attr("for", identifier + "ModuleCheckbox")
      .text(modeName);
    if ( identifier === "editorMode" ) {
      moduleOptionContainer.append("label")
        .attr("style", "font-size:10px;padding-top:3px")
        .text("(experimental)");
    }
    
    dynamicLabelWidthCheckBox = moduleCheckbox;
  }
  
  function addCheckBox( identifier, modeName, selector, onChangeFunc ){
    var moduleOptionContainer = d3.select(selector)
      .append("div")
      .classed("checkboxContainer", true);
    
    var moduleCheckbox = moduleOptionContainer.append("input")
      .classed("moduleCheckbox", true)
      .attr("id", identifier + "ModuleCheckbox")
      .attr("type", "checkbox")
      .property("checked", onChangeFunc());
    
    moduleCheckbox.on("click", function ( d ){
      var isEnabled = moduleCheckbox.property("checked");
      onChangeFunc(isEnabled);
      if ( isEnabled === true )
        graph.showEditorHintIfNeeded();
    });
    moduleOptionContainer.append("label")
      .attr("for", identifier + "ModuleCheckbox")
      .text(modeName);
    if ( identifier === "editorMode" ) {
      moduleOptionContainer.append("label")
        .attr("style", "font-size:10px;padding-top:3px")
        .text(" (experimental)");
    }
  }
  
  function addModeItem( module, identifier, modeName, selector, updateGraphOnClick ){
    var moduleOptionContainer,
      moduleCheckbox;
    
    moduleOptionContainer = d3.select(selector)
      .append("div")
      .classed("checkboxContainer", true)
      .datum({ module: module, defaultState: module.enabled() });
    
    moduleCheckbox = moduleOptionContainer.append("input")
      .classed("moduleCheckbox", true)
      .attr("id", identifier + "ModuleCheckbox")
      .attr("type", "checkbox")
      .property("checked", module.enabled());
    
    // Store for easier resetting all modes
    checkboxes.push(moduleCheckbox);
    
    moduleCheckbox.on("click", function ( d, silent ){
      var isEnabled = moduleCheckbox.property("checked");
      d.module.enabled(isEnabled);
      if ( updateGraphOnClick && silent !== true ) {
        graph.executeColorExternalsModule();
        graph.executeCompactNotationModule();
        graph.lazyRefresh();
      }
    });
    
    moduleOptionContainer.append("label")
      .attr("for", identifier + "ModuleCheckbox")
      .text(modeName);
    
    return moduleOptionContainer;
  }
  
  function addExternalModeSelection( container, colorExternalsMode ){
    var button = container.append("button").datum({ active: false }).classed("color-mode-switch", true);
    applyColorModeSwitchState(button, colorExternalsMode);
    
    button.on("click", function ( silent ){
      var data = button.datum();
      data.active = !data.active;
      applyColorModeSwitchState(button, colorExternalsMode);
      if ( colorExternalsMode.enabled() && silent !== true ) {
        graph.executeColorExternalsModule();
        graph.lazyRefresh();
      }
    });
    
    return button;
  }
  
  function applyColorModeSwitchState( element, colorExternalsMode ){
    var isActive = element.datum().active;
    var activeColorMode = getColorModeByState(isActive);
    
    element.classed("active", isActive)
      .text(activeColorMode.text);
    
    if ( colorExternalsMode ) {
      colorExternalsMode.colorModeType(activeColorMode.type);
    }
  }
  
  function getColorModeByState( isActive ){
    return isActive ? GRADIENT_COLOR_MODE : SAME_COLOR_MODE;
  }
  
  /**
   * Resets the modes to their default.
   */
  modeMenu.reset = function (){
    checkboxes.forEach(function ( checkbox ){
      var defaultState = checkbox.datum().defaultState,
        isChecked = checkbox.property("checked");
      
      if ( isChecked !== defaultState ) {
        checkbox.property("checked", defaultState);
        // Call onclick event handlers programmatically
        checkbox.on("click")(checkbox.datum());
      }
      
      // Reset the module that is connected with the checkbox
      checkbox.datum().module.reset();
    });
    
    // set the switch to active and simulate disabling
    colorModeSwitch.datum().active = true;
    colorModeSwitch.on("click")();
  };
  
  /** importer functions **/
  // setting manually the values of the filter
  // no update of the gui settings, these are updated in updateSettings
  modeMenu.setCheckBoxValue = function ( id, checked ){
    for ( var i = 0; i < checkboxes.length; i++ ) {
      var cbdId = checkboxes[i].attr("id");
      
      if ( cbdId === id ) {
        checkboxes[i].property("checked", checked);
        break;
      }
    }
  };
  modeMenu.getCheckBoxValue = function ( id ){
    for ( var i = 0; i < checkboxes.length; i++ ) {
      var cbdId = checkboxes[i].attr("id");
      if ( cbdId === id ) {
        return checkboxes[i].property("checked");
      }
    }
  };
  
  modeMenu.setColorSwitchState = function ( state ){
    // need the !state because we simulate later a click
    modeMenu.colorModeState(!state);
  };
  modeMenu.setColorSwitchStateUsingURL = function ( state ){
    // need the !state because we simulate later a click
    modeMenu.colorModeState(!state);
    colorModeSwitch.on("click")(true);
  };
  
  
  modeMenu.updateSettingsUsingURL = function (){
    var silent = true;
    checkboxes.forEach(function ( checkbox ){
      checkbox.on("click")(checkbox.datum(), silent);
    });
  };
  
  modeMenu.updateSettings = function (){
    var silent = true;
    checkboxes.forEach(function ( checkbox ){
      checkbox.on("click")(checkbox.datum(), silent);
    });
    // this simulates onclick and inverts its state
    colorModeSwitch.on("click")(silent);
  };
  return modeMenu;
};
