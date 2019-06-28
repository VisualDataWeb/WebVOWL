var _ = require("lodash/array");
var elementTools = require("../util/elementTools")();

module.exports = function (){
  var pap = {},
    enabled = false,
    pinnedElements = [];
  
  pap.addPinnedElement = function ( element ){
    // check if element is already in list
    var indexInArray = pinnedElements.indexOf(element);
    if ( indexInArray === -1 ) {
      pinnedElements.push(element);
    }
  };
  
  pap.handle = function ( selection, forced ){
    if ( !enabled ) {
      return;
    }
    
    if ( !forced ) {
      if ( wasNotDragged() ) {
        return;
      }
    }
    if ( elementTools.isProperty(selection) ) {
      if ( selection.inverse() && selection.inverse().pinned() ) {
        return;
      } else if ( hasNoParallelProperties(selection) ) {
        return;
      }
    }
    
    if ( !selection.pinned() ) {
      selection.drawPin();
      pap.addPinnedElement(selection);
    }
  };
  
  function wasNotDragged(){
    return !d3.event.defaultPrevented;
  }
  
  function hasNoParallelProperties( property ){
    return _.intersection(property.domain().links(), property.range().links()).length === 1;
  }
  
  pap.enabled = function ( p ){
    if ( !arguments.length ) return enabled;
    enabled = p;
    return pap;
  };
  
  pap.reset = function (){
    pinnedElements.forEach(function ( element ){
      element.removePin();
    });
    // Clear the array of stored nodes
    pinnedElements.length = 0;
  };
  
  return pap;
};
