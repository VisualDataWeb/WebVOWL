var elementTools = require("./elementTools")();

module.exports = (function (){
  
  var tools = {};
  
  /**
   * Filters the passed nodes and removes dangling properties.
   * @param nodes
   * @param properties
   * @param shouldKeepNode function that returns true if the node should be kept
   * @returns {{nodes: Array, properties: Array}} the filtered nodes and properties
   */
  tools.filterNodesAndTidy = function ( nodes, properties, shouldKeepNode ){
    var removedNodes = require("./set")(),
      cleanedNodes = [],
      cleanedProperties = [];
    
    nodes.forEach(function ( node ){
      if ( shouldKeepNode(node) ) {
        cleanedNodes.push(node);
      } else {
        removedNodes.add(node);
      }
    });
    
    properties.forEach(function ( property ){
      if ( propertyHasVisibleNodes(removedNodes, property) ) {
        cleanedProperties.push(property);
      } else if ( elementTools.isDatatypeProperty(property) ) {
        // Remove floating datatypes/literals, because they belong to their datatype property
        var index = cleanedNodes.indexOf(property.range());
        if ( index >= 0 ) {
          cleanedNodes.splice(index, 1);
        }
      }
    });
    
    return {
      nodes: cleanedNodes,
      properties: cleanedProperties
    };
  };
  
  /**
   * Returns true, if the domain and the range of this property have not been removed.
   * @param removedNodes
   * @param property
   * @returns {boolean} true if property isn't dangling
   */
  function propertyHasVisibleNodes( removedNodes, property ){
    return !removedNodes.has(property.domain()) && !removedNodes.has(property.range());
  }
  
  
  return function (){
    return tools;
  };
})();
