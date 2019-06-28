var SetOperatorNode = require("../elements/nodes/SetOperatorNode");
var OwlThing = require("../elements/nodes/implementations/OwlThing");
var OwlNothing = require("../elements/nodes/implementations/OwlNothing");
var elementTools = require("../util/elementTools")();

module.exports = function (){
  
  var statistics = {},
    nodeCount,
    occurencesOfClassAndDatatypeTypes = {},
    edgeCount,
    occurencesOfPropertyTypes = {},
    classCount,
    datatypeCount,
    datatypePropertyCount,
    objectPropertyCount,
    propertyCount,
    totalIndividualCount,
    filteredNodes,
    filteredProperties;
  
  
  statistics.filter = function ( classesAndDatatypes, properties ){
    resetStoredData();
    
    storeTotalCounts(classesAndDatatypes, properties);
    storeClassAndDatatypeCount(classesAndDatatypes);
    storePropertyCount(properties);
    
    storeOccurencesOfTypes(classesAndDatatypes, occurencesOfClassAndDatatypeTypes);
    storeOccurencesOfTypes(properties, occurencesOfPropertyTypes);
    
    storeTotalIndividualCount(classesAndDatatypes);
    
    filteredNodes = classesAndDatatypes;
    filteredProperties = properties;
  };
  
  function resetStoredData(){
    nodeCount = 0;
    edgeCount = 0;
    classCount = 0;
    datatypeCount = 0;
    datatypePropertyCount = 0;
    objectPropertyCount = 0;
    propertyCount = 0;
    totalIndividualCount = 0;
  }
  
  function storeTotalCounts( classesAndDatatypes, properties ){
    nodeCount = classesAndDatatypes.length;
    
    var seenProperties = require("../util/set")(), i, l, property;
    for ( i = 0, l = properties.length; i < l; i++ ) {
      property = properties[i];
      if ( !seenProperties.has(property) ) {
        edgeCount += 1;
      }
      
      seenProperties.add(property);
      if ( property.inverse() ) {
        seenProperties.add(property.inverse());
      }
    }
  }
  
  function storeClassAndDatatypeCount( classesAndDatatypes ){
    // Each datatype should be counted just a single time
    var datatypeSet = d3.set(),
      hasThing = false,
      hasNothing = false;
    classCount = 0;
    var old = 0, newcc = 0;
    classesAndDatatypes.forEach(function ( node ){
      if ( elementTools.isDatatype(node) ) {
        datatypeSet.add(node.defaultLabel());
      } else if ( !(node instanceof SetOperatorNode) ) {
        if ( node instanceof OwlThing ) {
          hasThing = true;
        } else if ( node instanceof OwlNothing ) {
          hasNothing = true;
        } else {
          old = classCount;
          var adds = 1 + countElementArray(node.equivalents());
          classCount += adds;
          newcc = classCount;
        }
      } else if ( node instanceof SetOperatorNode ) {
        old = classCount;
        classCount += 1;
        newcc = classCount;
      }
    });
    
    // count things and nothings just a single time
    // classCount += hasThing ? 1 : 0;
    // classCount += hasNothing ? 1 : 0;
    
    datatypeCount = datatypeSet.size();
  }
  
  function storePropertyCount( properties ){
    for ( var i = 0, l = properties.length; i < l; i++ ) {
      var property = properties[i];
      var attr;
      var result = false;
      if ( property.attributes ) {
        attr = property.attributes();
        if ( attr && attr.indexOf("datatype") !== -1 ) {
          result = true;
        }
      }
      if ( result === true ) {
        datatypePropertyCount += getExtendedPropertyCount(property);
      } else if ( elementTools.isObjectProperty(property) ) {
        objectPropertyCount += getExtendedPropertyCount(property);
      }
    }
    propertyCount = objectPropertyCount + datatypePropertyCount;
  }
  
  function getExtendedPropertyCount( property ){
    // count the property itself
    var count = 1;
    
    // and count properties this property represents
    count += countElementArray(property.equivalents());
    count += countElementArray(property.redundantProperties());
    
    return count;
  }
  
  function countElementArray( properties ){
    if ( properties ) {
      return properties.length;
    }
    return 0;
  }
  
  function storeOccurencesOfTypes( elements, storage ){
    elements.forEach(function ( element ){
      var type = element.type(),
        typeCount = storage[type];
      
      if ( typeof typeCount === "undefined" ) {
        typeCount = 0;
      } else {
        typeCount += 1;
      }
      storage[type] = typeCount;
    });
  }
  
  function storeTotalIndividualCount( nodes ){
    var sawIndividuals = {};
    var totalCount = 0;
    for ( var i = 0, l = nodes.length; i < l; i++ ) {
      var individuals = nodes[i].individuals();
      
      var tempCount = 0;
      for ( var iA = 0; iA < individuals.length; iA++ ) {
        if ( sawIndividuals[individuals[iA].iri()] === undefined ) {
          sawIndividuals[individuals[iA].iri()] = 1; // this iri for that individual is now set to 1 >> seen it
          tempCount++;
        }
      }
      totalCount += tempCount;
    }
    totalIndividualCount = totalCount;
    sawIndividuals = {}; // clear the object
    
  }
  
  
  statistics.nodeCount = function (){
    return nodeCount;
  };
  
  statistics.occurencesOfClassAndDatatypeTypes = function (){
    return occurencesOfClassAndDatatypeTypes;
  };
  
  statistics.edgeCount = function (){
    return edgeCount;
  };
  
  statistics.occurencesOfPropertyTypes = function (){
    return occurencesOfPropertyTypes;
  };
  
  statistics.classCount = function (){
    return classCount;
  };
  
  statistics.datatypeCount = function (){
    return datatypeCount;
  };
  
  statistics.datatypePropertyCount = function (){
    return datatypePropertyCount;
  };
  
  statistics.objectPropertyCount = function (){
    return objectPropertyCount;
  };
  
  statistics.propertyCount = function (){
    return propertyCount;
  };
  
  statistics.totalIndividualCount = function (){
    return totalIndividualCount;
  };
  
  
  // Functions a filter must have
  statistics.filteredNodes = function (){
    return filteredNodes;
  };
  
  statistics.filteredProperties = function (){
    return filteredProperties;
  };
  
  
  return statistics;
};
