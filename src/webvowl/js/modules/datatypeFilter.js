var elementTools = require("../util/elementTools")();
var filterTools = require("../util/filterTools")();

module.exports = function (){
  
  var filter = {},
    nodes,
    properties,
    enabled = false,
    filteredNodes,
    filteredProperties;
  
  
  /**
   * If enabled, all datatypes and literals including connected properties are filtered.
   * @param untouchedNodes
   * @param untouchedProperties
   */
  filter.filter = function ( untouchedNodes, untouchedProperties ){
    nodes = untouchedNodes;
    properties = untouchedProperties;
    
    if ( this.enabled() ) {
      removeDatatypesAndLiterals();
    }
    
    filteredNodes = nodes;
    filteredProperties = properties;
  };
  
  function removeDatatypesAndLiterals(){
    var filteredData = filterTools.filterNodesAndTidy(nodes, properties, isNoDatatypeOrLiteral);
    
    nodes = filteredData.nodes;
    properties = filteredData.properties;
  }
  
  function isNoDatatypeOrLiteral( node ){
    return !elementTools.isDatatype(node);
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
