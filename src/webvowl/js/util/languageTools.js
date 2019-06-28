var constants = require("./constants")();

/**
 * Encapsulates methods which return a label in a specific language for a preferred language.
 */
module.exports = (function (){
  
  var languageTools = {};
  
  
  languageTools.textInLanguage = function ( textObject, preferredLanguage ){
    if ( typeof textObject === "undefined" ) {
      return undefined;
    }
    
    if ( typeof textObject === "string" ) {
      return textObject;
    }
    
    if ( preferredLanguage && textObject.hasOwnProperty(preferredLanguage) ) {
      return textObject[preferredLanguage];
    }
    
    var textForLanguage = searchLanguage(textObject, "en");
    if ( textForLanguage ) {
      return textForLanguage;
    }
    textForLanguage = searchLanguage(textObject, constants.LANG_UNDEFINED);
    if ( textForLanguage ) {
      return textForLanguage;
    }
    
    return textObject[constants.LANG_IRIBASED];
  };
  
  
  function searchLanguage( textObject, preferredLanguage ){
    for ( var language in textObject ) {
      if ( language === preferredLanguage && textObject.hasOwnProperty(language) ) {
        return textObject[language];
      }
    }
  }
  
  return function (){
    /* Use a function here to keep a consistent style like webvowl.path.to.module()
     * despite having just a single languageTools object. */
    return languageTools;
  };
})();
