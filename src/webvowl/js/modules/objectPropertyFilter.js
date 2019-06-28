var elementTools = require("../util/elementTools")();


module.exports = function (){
  
  var filter = {},
    nodes,
    properties,
    enabled = false,
    filteredNodes,
    filteredProperties;
  
  
  /**
   * If enabled, all object properties and things without any other property are filtered.
   * @param untouchedNodes
   * @param untouchedProperties
   */
  filter.filter = function ( untouchedNodes, untouchedProperties ){
    nodes = untouchedNodes;
    properties = untouchedProperties;
    
    if ( this.enabled() ) {
      removeObjectProperties();
    }
    
    filteredNodes = nodes;
    filteredProperties = properties;
  };
  
  function removeObjectProperties(){
    properties = properties.filter(isNoObjectProperty);
    nodes = nodes.filter(isNoFloatingThing);
  }
  
  function isNoObjectProperty( property ){
    return !elementTools.isObjectProperty(property);
  }
  
  function isNoFloatingThing( node ){
    var isNoThing = !elementTools.isThing(node);
    var hasNonFilteredProperties = hasPropertiesOtherThanObjectProperties(node, properties);
    return isNoThing || hasNonFilteredProperties;
  }
  
  function hasPropertiesOtherThanObjectProperties( node, properties ){
    for ( var i = 0; i < properties.length; i++ ) {
      var property = properties[i];
      if ( property.domain() !== node && property.range() !== node ) {
        continue;
      }
      
      if ( isNoObjectProperty(property) ) {
        return true;
      }
    }
    
    return false;
  }
  
  filter.enabled = function ( p ){
    if ( !arguments.length ) return enabled;
    enabled = p;
    return filter;
  };
  
  
  // Functions a filter must have
  filter.filteredNodes = function (){
    return filteredNodes;
  };
  
  filter.filteredProperties = function (){
    return filteredProperties;
  };
  
  
  return filter;
};
