/**
 * This module abuses the filter function a bit like the statistics module. Nothing is filtered.
 *
 * @returns {{}}
 */
module.exports = function ( graph ){
  
  var DEFAULT_STATE = true;
  
  var filter = {},
    nodes,
    properties,
    enabled = DEFAULT_STATE,
    filteredNodes,
    filteredProperties;
  
  
  /**
   * If enabled, the scaling of nodes according to individuals will be enabled.
   * @param untouchedNodes
   * @param untouchedProperties
   */
  filter.filter = function ( untouchedNodes, untouchedProperties ){
    nodes = untouchedNodes;
    properties = untouchedProperties;
    
    graph.options().scaleNodesByIndividuals(enabled);
    
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
