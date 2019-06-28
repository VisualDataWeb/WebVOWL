module.exports = (function (){
  
  var constants = {};
  
  constants.LANG_IRIBASED = "IRI-based";
  constants.LANG_UNDEFINED = "undefined";
  
  return function (){
    /* Use a function here to keep a consistent style like webvowl.path.to.module()
     * despite having just a single object. */
    return constants;
  };
})();
