/**
 * This module abuses the filter function a bit like the statistics module. Nothing is filtered.
 *
 * @returns {{}}
 */


module.exports = function ( graph ){
  
  var DEFAULT_STATE = false;
  
  var filter = {},
    nodes,
    properties,
    enabled = DEFAULT_STATE,
    filteredNodes,
    filteredProperties;
  
  
  /**
   * If enabled, redundant details won't be drawn anymore.
   * @param untouchedNodes
   * @param untouchedProperties
   */
  filter.filter = function ( untouchedNodes, untouchedProperties ){
    nodes = untouchedNodes;
    properties = untouchedProperties;
    graph.options().compactNotation(enabled);
    filteredNodes = nodes;
    filteredProperties = properties;
  };
  
  filter.enabled = function ( p ){
    if ( !arguments.length ) return enabled;
    enabled = p;
    return filter;
  };
  
  filter.reset = function (){
    enabled = DEFAULT_STATE;
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
