/**
 * The functions for controlling attributes of nodes of the force layout can't be modelled to the element hierarchy,
 * which is used for inheriting visual and OWL-like attributes.
 *
 * To reduce code redundancy the common functions for controlling the force layout node attributes are excluded into this
 * module, which can add them to the node objects.
 *
 * @type {{}}
 */
var nodeFunctions = {};
module.exports = function (){
  return nodeFunctions;
};


nodeFunctions.addTo = function ( node ){
  addFixedLocationFunctions(node);
};

function addFixedLocationFunctions( node ){
  var locked = false,
    frozen = false,
    halo = false,
    pinned = false;
  
  node.locked = function ( p ){
    if ( !arguments.length ) {
      return locked;
    }
    locked = p;
    applyFixedLocationAttributes();
    return node;
  };
  
  node.frozen = function ( p ){
    if ( !arguments.length ) {
      return frozen;
    }
    frozen = p;
    applyFixedLocationAttributes();
    return node;
  };
  
  node.halo = function ( p ){
    if ( !arguments.length ) {
      return halo;
    }
    halo = p;
    applyFixedLocationAttributes();
    return node;
  };
  
  node.pinned = function ( p ){
    if ( !arguments.length ) {
      return pinned;
    }
    pinned = p;
    applyFixedLocationAttributes();
    return node;
  };
  
  function applyFixedLocationAttributes(){
    if ( node.locked() || node.frozen() || node.pinned() ) {
      node.fixed = true;
    } else {
      node.fixed = false;
    }
  }
}
