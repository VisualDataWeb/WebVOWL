/** @WORKAROUND CODE:
 * clears empty literals that are provided by owl2vowl: 0.2.2x*/


module.exports = function (){
  
  var filter = {},
    enabled = true,
    filteredNodes,
    removedNodes,
    filteredProperties;
  
  filter.enabled = function ( val ){
    if ( !arguments.length ) {
      return enabled;
    }
    enabled = val;
  };
  
  filter.filter = function ( nodes, properties ){
    if ( enabled === false ) {
      filteredNodes = nodes;
      filteredProperties = properties;
      removedNodes = [];
      return;
    }
    var literalUsageMap = [];
    var thingUsageMap = [];
    var node;
    for ( var i = 0; i < properties.length; i++ ) {
      // get property range;
      var prop = properties[i];
      
      // checking for literals
      if ( prop.range() ) {
        node = prop.range();
        if ( node.type() === "rdfs:Literal" ) {
          literalUsageMap[node.id()] = 1;
        }
      }
      // checking for thing
      if ( prop.range() ) {
        node = prop.range();
        if ( node.type() === "owl:Thing" ) {
          thingUsageMap[node.id()] = 1;
        }
      }
      if ( prop.domain() ) {
        node = prop.domain();
        if ( node.type() === "owl:Thing" ) {
          thingUsageMap[node.id()] = 1;
        }
      }
      
    }
    var nodesToRemove = [];
    var newNodes = [];
    // todo: test and make it faster
    for ( i = 0; i < nodes.length; i++ ) {
      var nodeId = nodes[i].id();
      if ( nodes[i].type() === "rdfs:Literal" ) {
        if ( literalUsageMap[nodeId] === undefined ) {
          nodesToRemove.push(nodeId);
        }
        else {
          newNodes.push(nodes[i]);
        }
        // check for node type == OWL:THING
      } else if ( nodes[i].type() === "owl:Thing" ) {
        if ( thingUsageMap[nodeId] === undefined ) {
          nodesToRemove.push(nodeId);
        }
        else {
          newNodes.push(nodes[i]);
        }
      } else {
        newNodes.push(nodes[i]);
      }
    }
    
    filteredNodes = newNodes;
    filteredProperties = properties;
    removedNodes = nodesToRemove;
  };
  
  
  // Functions a filter must have
  filter.filteredNodes = function (){
    return filteredNodes;
  };
  
  filter.removedNodes = function (){
    return removedNodes;
  };
  
  filter.filteredProperties = function (){
    return filteredProperties;
  };
  
  
  return filter;
};
