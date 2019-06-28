module.exports = function (){
  
  var filter = {},
    filteredNodes,
    filteredProperties;
  
  
  filter.filter = function ( nodes, properties ){
    
    // Filter the data
    
    filteredNodes = nodes;
    filteredProperties = properties;
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
