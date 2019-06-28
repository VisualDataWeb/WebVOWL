/**
 * A simple incomplete encapsulation of the d3 set, which is able to store webvowl
 * elements by using their id.
 */
module.exports = function ( array ){
  
  var set = {},
    d3Set = d3.set(array);
  
  set.has = function ( webvowlElement ){
    return d3Set.has(webvowlElement.id());
  };
  
  set.add = function ( webvowlElement ){
    return d3Set.add(webvowlElement.id());
  };
  
  set.remove = function ( webvowlElement ){
    return d3Set.remove(webvowlElement.id());
  };
  
  set.empty = function (){
    return d3Set.empty();
  };
  
  set.size = function (){
    return d3Set.size();
  };
  
  return set;
};
