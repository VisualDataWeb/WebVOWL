var OwlThing = require("../elements/nodes/implementations/OwlThing");
var RdfsLiteral = require("../elements/nodes/implementations/RdfsLiteral");
var elementTools = require("../util/elementTools")();

var equivalentPropertyMerger = {};
module.exports = function (){
  return equivalentPropertyMerger;
};

var PREFIX = "GENERATED-MERGED_RANGE-";
var OBJECT_PROPERTY_DEFAULT_RANGE_TYPE = "owl:Thing";
var DATA_PROPERTY_DEFAULT_RANGE_TYPE = "rdfs:Literal";


equivalentPropertyMerger.merge = function ( properties, nodes, propertyMap, nodeMap, graph ){
  var totalNodeIdsToHide = d3.set();
  var processedPropertyIds = d3.set();
  var mergeNodes = [];
  
  for ( var i = 0; i < properties.length; i++ ) {
    var property = properties[i];
    var equivalents = property.equivalents().map(createIdToPropertyMapper(propertyMap));
    
    if ( equivalents.length === 0 || processedPropertyIds.has(property.id()) ) {
      continue;
    }
    
    var propertyWithEquivalents = equivalents.concat(property);
    
    var mergeNode = findMergeNode(propertyWithEquivalents, nodeMap);
    if ( !mergeNode ) {
      if ( mergeNode !== undefined ) {
        mergeNode = createDefaultMergeNode(property, graph);
        mergeNodes.push(mergeNode);
      }
    }
    
    var nodeIdsToHide = replaceRangesAndCollectNodesToHide(propertyWithEquivalents, mergeNode, properties,
      processedPropertyIds);
    for ( var j = 0; j < nodeIdsToHide.length; j++ ) {
      totalNodeIdsToHide.add(nodeIdsToHide[j]);
    }
  }
  
  return filterVisibleNodes(nodes.concat(mergeNodes), totalNodeIdsToHide);
};


function createIdToPropertyMapper( propertyMap ){
  return function ( id ){
    return propertyMap[id];
  };
}

function findMergeNode( propertyWithEquivalents, nodeMap ){
  var typeMap = mapPropertiesRangesToType(propertyWithEquivalents, nodeMap);
  var typeSet = d3.set(typeMap.keys());
  
  // default types are the fallback values and should be ignored for the type determination
  typeSet.remove(OBJECT_PROPERTY_DEFAULT_RANGE_TYPE);
  typeSet.remove(DATA_PROPERTY_DEFAULT_RANGE_TYPE);
  
  // exactly one type to chose from -> take the node of this type as range
  if ( typeSet.size() === 1 ) {
    var type = typeSet.values()[0];
    var ranges = typeMap.get(type);
    
    if ( ranges.length === 1 ) {
      return ranges[0];
    }
  }
}

function mapPropertiesRangesToType( properties, nodeMap ){
  var typeMap = d3.map();
  
  properties.forEach(function ( property ){
    if ( property === undefined ) //@ WORKAROUND
      return;
    
    var range = nodeMap[property.range()];
    var type = range.type();
    
    if ( !typeMap.has(type) ) {
      typeMap.set(type, []);
    }
    
    typeMap.get(type).push(range);
  });
  
  return typeMap;
}

function createDefaultMergeNode( property, graph ){
  var range;
  
  if ( elementTools.isDatatypeProperty(property) ) {
    range = new RdfsLiteral(graph);
  } else {
    range = new OwlThing(graph);
  }
  range.id(PREFIX + property.id());
  
  return range;
}

function replaceRangesAndCollectNodesToHide( propertyWithEquivalents, mergeNode, properties, processedPropertyIds ){
  var nodesToHide = [];
  
  propertyWithEquivalents.forEach(function ( property ){
    
    if ( property === undefined || mergeNode === undefined ) // @ WORKAROUND
      return;
    var oldRangeId = property.range();
    property.range(mergeNode.id());
    if ( !isDomainOrRangeOfOtherProperty(oldRangeId, properties) ) {
      nodesToHide.push(oldRangeId);
    }
    
    processedPropertyIds.add(property.id());
  });
  
  return nodesToHide;
}

function isDomainOrRangeOfOtherProperty( nodeId, properties ){
  for ( var i = 0; i < properties.length; i++ ) {
    var property = properties[i];
    if ( property.domain() === nodeId || property.range() === nodeId ) {
      return true;
    }
  }
  
  return false;
}

function filterVisibleNodes( nodes, nodeIdsToHide ){
  var filteredNodes = [];
  
  nodes.forEach(function ( node ){
    if ( !nodeIdsToHide.has(node.id()) ) {
      filteredNodes.push(node);
    }
  });
  
  return filteredNodes;
}
