/**
 * Contains the search "engine"
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
module.exports = function ( graph ){
  var searchMenu = {},
    dictionary = [],
    entryNames = [],
    searchLineEdit,
    mergedStringsList,
    mergedIdList,
    maxEntries = 6,
    dictionaryUpdateRequired = true,
    labelDictionary,
    inputText,
    viewStatusOfSearchEntries = false;
  
  var results = [];
  var resultID = [];
  var c_locate = d3.select("#locateSearchResult");
  var c_search = d3.select("#c_search");
  var m_search = d3.select("#m_search"); // << dropdown container;
  
  
  String.prototype.beginsWith = function ( string ){
    return (this.indexOf(string) === 0);
  };
  
  searchMenu.requestDictionaryUpdate = function (){
    dictionaryUpdateRequired = true;
    // clear possible pre searched entries
    var htmlCollection = m_search.node().children;
    var numEntries = htmlCollection.length;
    
    for ( var i = 0; i < numEntries; i++ )
      htmlCollection[0].remove();
    searchLineEdit.node().value = "";
  };
  
  
  function updateSearchDictionary(){
    labelDictionary = graph.getUpdateDictionary();
    dictionaryUpdateRequired = false;
    dictionary = [];
    entryNames = [];
    var idList = [];
    var stringList = [];
    
    var i;
    for ( i = 0; i < labelDictionary.length; i++ ) {
      var lEntry = labelDictionary[i].labelForCurrentLanguage();
      idList.push(labelDictionary[i].id());
      stringList.push(lEntry);
      // add all equivalents to the search space;
      if ( labelDictionary[i].equivalents && labelDictionary[i].equivalents().length > 0 ) {
        var eqs = labelDictionary[i].equivalentsString();
        var eqsLabels = eqs.split(", ");
        for ( var e = 0; e < eqsLabels.length; e++ ) {
          idList.push(labelDictionary[i].id());
          stringList.push(eqsLabels[e]);
        }
      }
    }
    
    mergedStringsList = [];
    mergedIdList = [];
    var indexInStringList = -1;
    var currentString;
    var currentObjectId;
    
    for ( i = 0; i < stringList.length; i++ ) {
      if ( i === 0 ) {
        // just add the elements
        mergedStringsList.push(stringList[i]);
        mergedIdList.push([]);
        mergedIdList[0].push(idList[i]);
        continue;
      }
      else {
        currentString = stringList[i];
        currentObjectId = idList[i];
        indexInStringList = mergedStringsList.indexOf(currentString);
      }
      if ( indexInStringList === -1 ) {
        mergedStringsList.push(stringList[i]);
        mergedIdList.push([]);
        var lastEntry = mergedIdList.length;
        mergedIdList[lastEntry - 1].push(currentObjectId);
      } else {
        mergedIdList[indexInStringList].push(currentObjectId);
      }
    }
    
    for ( i = 0; i < mergedStringsList.length; i++ ) {
      var aString = mergedStringsList[i];
      var correspondingIdList = mergedIdList[i];
      var idListResult = "[ ";
      for ( var j = 0; j < correspondingIdList.length; j++ ) {
        idListResult = idListResult + correspondingIdList[j].toString();
        idListResult = idListResult + ", ";
      }
      idListResult = idListResult.substring(0, idListResult.length - 2);
      idListResult = idListResult + " ]";
      
      dictionary.push(aString);
      entryNames.push(aString);
    }
  }
  
  searchMenu.setup = function (){
    // clear dictionary;
    dictionary = [];
    searchLineEdit = d3.select("#search-input-text");
    searchLineEdit.on("input", userInput);
    searchLineEdit.on("keydown", userNavigation);
    searchLineEdit.on("click", toggleSearchEntryView);
    searchLineEdit.on("mouseover", hoverSearchEntryView);
    
    c_locate.on("click", function (){
      graph.locateSearchResult();
    });
    
    c_locate.on("mouseover", function (){
      searchMenu.hideSearchEntries();
    });
    
  };
  
  function hoverSearchEntryView(){
    updateSelectionStatusFlags();
    searchMenu.showSearchEntries();
  }
  
  function toggleSearchEntryView(){
    if ( viewStatusOfSearchEntries ) {
      searchMenu.hideSearchEntries();
    } else {
      searchMenu.showSearchEntries();
    }
  }
  
  searchMenu.hideSearchEntries = function (){
    m_search.style("display", "none");
    viewStatusOfSearchEntries = false;
  };
  
  searchMenu.showSearchEntries = function (){
    m_search.style("display", "block");
    viewStatusOfSearchEntries = true;
  };
  
  function ValidURL( str ){
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(str);
    
  }
  
  
  function updateSelectionStatusFlags(){
    if ( searchLineEdit.node().value.length === 0 ) {
      createSearchEntries();
      return;
    }
    handleAutoCompletion();
  }
  
  function userNavigation(){
    if ( dictionaryUpdateRequired ) {
      updateSearchDictionary();
    }
    
    var htmlCollection = m_search.node().children;
    var numEntries = htmlCollection.length;
    
    
    var move = 0;
    var i;
    var selectedEntry = -1;
    for ( i = 0; i < numEntries; i++ ) {
      var atr = htmlCollection[i].getAttribute('class');
      if ( atr === "dbEntrySelected" ) {
        selectedEntry = i;
      }
    }
    if ( d3.event.keyCode === 13 ) {
      if ( selectedEntry >= 0 && selectedEntry < numEntries ) {
        // simulate onClick event
        htmlCollection[selectedEntry].onclick();
        searchMenu.hideSearchEntries();
      }
      else if ( numEntries === 0 ) {
        inputText = searchLineEdit.node().value;
        // check if input text ends or begins with with space
        // remove first spaces
        var clearedText = inputText.replace(/%20/g, " ");
        while ( clearedText.beginsWith(" ") ) {
          clearedText = clearedText.substr(1, clearedText.length);
        }
        // remove ending spaces
        while ( clearedText.endsWith(" ") ) {
          clearedText = clearedText.substr(0, clearedText.length - 1);
        }
        var iri = clearedText.replace(/ /g, "%20");
        
        var valid = ValidURL(iri);
        // validate url:
        if ( valid ) {
          var ontM = graph.options().ontologyMenu();
          ontM.setIriText(iri);
          searchLineEdit.node().value = "";
        }
        else {
          console.log(iri + " is not a valid URL!");
        }
      }
    }
    if ( d3.event.keyCode === 38 ) {
      move = -1;
      searchMenu.showSearchEntries();
    }
    if ( d3.event.keyCode === 40 ) {
      move = +1;
      searchMenu.showSearchEntries();
    }
    
    var newSelection = selectedEntry + move;
    if ( newSelection !== selectedEntry ) {
      
      if ( newSelection < 0 && selectedEntry <= 0 ) {
        htmlCollection[0].setAttribute('class', "dbEntrySelected");
      }
      
      if ( newSelection >= numEntries ) {
        htmlCollection[selectedEntry].setAttribute('class', "dbEntrySelected");
      }
      if ( newSelection >= 0 && newSelection < numEntries ) {
        htmlCollection[newSelection].setAttribute('class', "dbEntrySelected");
        if ( selectedEntry >= 0 )
          htmlCollection[selectedEntry].setAttribute('class', "dbEntry");
      }
    }
  }
  
  searchMenu.getSearchString = function (){
    return searchLineEdit.node().value;
  };
  
  
  function clearSearchEntries(){
    var htmlCollection = m_search.node().children;
    var numEntries = htmlCollection.length;
    for ( var i = 0; i < numEntries; i++ ) {
      htmlCollection[0].remove();
    }
    results = [];
    resultID = [];
    
  }
  
  function createSearchEntries(){
    inputText = searchLineEdit.node().value;
    var i;
    var lc_text = inputText.toLowerCase();
    var token;
    
    for ( i = 0; i < dictionary.length; i++ ) {
      var tokenElement = dictionary[i];
      if ( tokenElement === undefined ) {
        //@WORKAROUND : nodes with undefined labels are skipped
        //@FIX: these nodes are now not added to the dictionary
        continue;
      }
      token = dictionary[i].toLowerCase();
      if ( token.indexOf(lc_text) > -1 ) {
        results.push(dictionary[i]);
        resultID.push(i);
      }
    }
  }
  
  function measureTextWidth( text, textStyle ){
    // Set a default value
    if ( !textStyle ) {
      textStyle = "text";
    }
    var d = d3.select("body")
        .append("div")
        .attr("class", textStyle)
        .attr("id", "width-test") // tag this element to identify it
        .attr("style", "position:absolute; float:left; white-space:nowrap; visibility:hidden;")
        .text(text),
      w = document.getElementById("width-test").offsetWidth;
    d.remove();
    return w;
  }
  
  function cropText( input ){
    var maxWidth = 250;
    var textStyle = "dbEntry";
    var truncatedText = input;
    var textWidth;
    var ratio;
    var newTruncatedTextLength;
    while ( true ) {
      textWidth = measureTextWidth(truncatedText, textStyle);
      if ( textWidth <= maxWidth ) {
        break;
      }
      
      ratio = textWidth / maxWidth;
      newTruncatedTextLength = Math.floor(truncatedText.length / ratio);
      
      // detect if nothing changes
      if ( truncatedText.length === newTruncatedTextLength ) {
        break;
      }
      
      truncatedText = truncatedText.substring(0, newTruncatedTextLength);
    }
    
    if ( input.length > truncatedText.length ) {
      return input.substring(0, truncatedText.length - 6);
    }
    return input;
  }
  
  function createDropDownElements(){
    var numEntries;
    var copyRes = results;
    var i;
    var token;
    var newResults = [];
    var newResultsIds = [];
    
    var lc_text = searchLineEdit.node().value.toLowerCase();
    // set the number of shown results to be maxEntries or less;
    numEntries = results.length;
    if ( numEntries > maxEntries )
      numEntries = maxEntries;
    
    
    for ( i = 0; i < numEntries; i++ ) {
      // search for the best entry
      var indexElement = 1000000;
      var lengthElement = 1000000;
      var bestElement = -1;
      for ( var j = 0; j < copyRes.length; j++ ) {
        token = copyRes[j].toLowerCase();
        var tIe = token.indexOf(lc_text);
        var tLe = token.length;
        if ( tIe > -1 && tIe <= indexElement && tLe <= lengthElement ) {
          bestElement = j;
          indexElement = tIe;
          lengthElement = tLe;
        }
      }
      newResults.push(copyRes[bestElement]);
      newResultsIds.push(resultID[bestElement]);
      copyRes[bestElement] = "";
    }
    
    // add the results to the entry menu
    //******************************************
    numEntries = results.length;
    if ( numEntries > maxEntries )
      numEntries = maxEntries;
    
    var filteredOutElements = 0;
    for ( i = 0; i < numEntries; i++ ) {
      //add results to the dropdown menu
      var testEntry = document.createElement('li');
      testEntry.setAttribute('elementID', newResultsIds[i]);
      testEntry.onclick = handleClick(newResultsIds[i]);
      testEntry.setAttribute('class', "dbEntry");
      
      var entries = mergedIdList[newResultsIds[i]];
      var eLen = entries.length;
      
      var croppedText = cropText(newResults[i]);
      
      var el0 = entries[0];
      var allSame = true;
      var nodeMap = graph.getNodeMapForSearch();
      var visible = eLen;
      if ( eLen > 1 ) {
        for ( var q = 0; q < eLen; q++ ) {
          if ( nodeMap[entries[q]] === undefined ) {
            visible--;
          }
        }
      }
      
      for ( var a = 0; a < eLen; a++ ) {
        if ( el0 !== entries[a] ) {
          allSame = false;
        }
      }
      if ( croppedText !== newResults[i] ) {
        // append ...(#numElements) if needed
        if ( eLen > 1 && allSame === false ) {
          if ( eLen !== visible )
            croppedText += "... (" + visible + "/" + eLen + ")";
        }
        else {
          croppedText += "...";
        }
        testEntry.title = newResults[i];
      }
      else {
        if ( eLen > 1 && allSame === false ) {
          if ( eLen !== visible )
            croppedText += " (" + visible + "/" + eLen + ")";
          else
            croppedText += " (" + eLen + ")";
        }
      }
      
      var searchEntryNode = d3.select(testEntry);
      if ( eLen === 1 || allSame === true ) {
        if ( nodeMap[entries[0]] === undefined ) {
          searchEntryNode.style("color", "#979797");
          testEntry.title = newResults[i] + "\nElement is filtered out.";
          testEntry.onclick = function (){
          };
          d3.select(testEntry).style("cursor", "default");
          filteredOutElements++;
        }
      } else {
        if ( visible < 1 ) {
          searchEntryNode.style("color", "#979797");
          testEntry.onclick = function (){
          };
          testEntry.title = newResults[i] + "\nAll elements are filtered out.";
          d3.select(testEntry).style("cursor", "default");
          filteredOutElements++;
        } else {
          searchEntryNode.style("color", "");
        }
        if ( visible < eLen && visible > 1 ) {
          testEntry.title = newResults[i] + "\n" + visible + "/" + eLen + " elements are visible.";
        }
      }
      searchEntryNode.node().innerHTML = croppedText;
      m_search.node().appendChild(testEntry);
    }
  }
  
  
  function handleAutoCompletion(){
    /**  pre condition: autoCompletion has already a valid text**/
    clearSearchEntries();
    createSearchEntries();
    createDropDownElements();
  }
  
  function userInput(){
    c_locate.classed("highlighted", false);
    c_locate.node().title = "Nothing to locate";
    
    if ( dictionaryUpdateRequired ) {
      updateSearchDictionary();
    }
    graph.resetSearchHighlight();
    
    if ( dictionary.length === 0 ) {
      console.log("dictionary is empty");
      return;
    }
    inputText = searchLineEdit.node().value;
    
    clearSearchEntries();
    if ( inputText.length !== 0 ) {
      createSearchEntries();
      createDropDownElements();
    }
    
    searchMenu.showSearchEntries();
  }
  
  function handleClick( elementId ){
    
    return function (){
      var id = elementId;
      var correspondingIds = mergedIdList[id];
      
      // autoComplete the text for the user
      var autoComStr = entryNames[id];
      searchLineEdit.node().value = autoComStr;
      
      graph.resetSearchHighlight();
      graph.highLightNodes(correspondingIds);
      c_locate.node().title = "Locate search term";
      if ( autoComStr !== inputText ) {
        handleAutoCompletion();
      }
      searchMenu.hideSearchEntries();
    };
  }
  
  searchMenu.clearText = function (){
    searchLineEdit.node().value = "";
    c_locate.classed("highlighted", false);
    c_locate.node().title = "Nothing to locate";
    var htmlCollection = m_search.node().children;
    var numEntries = htmlCollection.length;
    for ( var i = 0; i < numEntries; i++ ) {
      htmlCollection[0].remove();
    }
  };
  
  return searchMenu;
};
