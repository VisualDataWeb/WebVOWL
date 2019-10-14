/**
 * Contains the logic for the export button.
 * @returns {{}}
 */
module.exports = function ( graph ){
  
  var exportMenu = {},
    exportSvgButton,
    exportFilename,
    exportJsonButton,
    exportTurtleButton,
    exportTexButton,
    copyButton,
    exportableJsonText;
  
  var exportTTLModule = require("./exportTTLModule")(graph);
  
  
  String.prototype.replaceAll = function ( search, replacement ){
    var target = this;
    return target.split(search).join(replacement);
  };
  
  
  /**
   * Adds the export button to the website.
   */
  exportMenu.setup = function (){
    exportSvgButton = d3.select("#exportSvg")
      .on("click", exportSvg);
    exportJsonButton = d3.select("#exportJson")
      .on("click", exportJson);
    
    copyButton = d3.select("#copyBt")
      .on("click", copyUrl);
    
    exportTexButton = d3.select("#exportTex")
      .on("click", exportTex);
    
    exportTurtleButton = d3.select("#exportTurtle")
      .on("click", exportTurtle);
    
    var menuEntry = d3.select("#m_export");
    menuEntry.on("mouseover", function (){
      var searchMenu = graph.options().searchMenu();
      searchMenu.hideSearchEntries();
      exportMenu.exportAsUrl();
    });
  };
  function exportTurtle(){
    var success = exportTTLModule.requestExport();
    var result = exportTTLModule.resultingTTL_Content();
    var ontoTitle = "NewOntology";
    console.log("Exporter was successful: " + success);
    if ( success ) {
      // console.log("The result is : " + result);
      // var ontoTitle=graph.options().getGeneralMetaObjectProperty('title');
      // if (ontoTitle===undefined || ontoTitle.length===0)
      // 	ontoTitle="NewOntology";
      // else{
      // 	// language object -.-
      //    ontoTitle.replace(" ","_")
      // }
      
      // TODO: show TEXT in warning module?
      
      
      // // write the data
      var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(result);
      
      exportTurtleButton.attr("href", dataURI)
        .attr("download", ontoTitle + ".ttl");
      
      // okay restore old href?
      //  exportTurtleButton.attr("href", oldHref);
    } else {
      console.log("ShowWarning!");
      graph.options().warningModule().showExporterWarning();
      console.log("Stay on the page! " + window.location.href);
      exportTurtleButton.attr("href", window.location.href);
      d3.event.preventDefault(); // prevent the href to be called ( reloads the page otherwise )
    }
  }
  
  exportMenu.setFilename = function ( filename ){
    exportFilename = filename || "export";
  };
  
  exportMenu.setJsonText = function ( jsonText ){
    exportableJsonText = jsonText;
  };
  
  function copyUrl(){
    d3.select("#exportedUrl").node().focus();
    d3.select("#exportedUrl").node().select();
    document.execCommand("copy");
    graph.options().navigationMenu().hideAllMenus();
    d3.event.preventDefault(); // prevent the href to be called ( reloads the page otherwise )
  }
  
  function prepareOptionString( defOpts, currOpts ){
    var setOptions = 0;
    var optsString = "opts=";
    
    for ( var name in defOpts ) {
      // define key and value ;
      if ( defOpts.hasOwnProperty(name) ) {// for travis warning
        var def_value = defOpts[name];
        var cur_value = currOpts[name];
        if ( def_value !== cur_value ) {
          optsString += name + "=" + cur_value + ";";
          setOptions++;
        }
      }
    }
    optsString += "";
    if ( setOptions === 0 ) {
      return "";
    }
    return optsString;
  }
  
  exportMenu.exportAsUrl = function (){
    var currObj = {};
    currObj.sidebar = graph.options().sidebar().getSidebarVisibility();
    
    // identify default value given by ontology;
    var defOntValue = graph.options().filterMenu().getDefaultDegreeValue();
    var currentValue = graph.options().filterMenu().getDegreeSliderValue();
    if ( parseInt(defOntValue) === parseInt(currentValue) ) {
      currObj.doc = -1;
    } else {
      currObj.doc = currentValue;
    }
    
    currObj.cd = graph.options().classDistance();
    currObj.dd = graph.options().datatypeDistance();
    if ( graph.editorMode() === true ) {
      currObj.editorMode = "true";
    } else {
      currObj.editorMode = "false";
    }
    currObj.filter_datatypes = String(graph.options().filterMenu().getCheckBoxValue("datatypeFilterCheckbox"));
    currObj.filter_sco = String(graph.options().filterMenu().getCheckBoxValue("subclassFilterCheckbox"));
    currObj.filter_disjoint = String(graph.options().filterMenu().getCheckBoxValue("disjointFilterCheckbox"));
    currObj.filter_setOperator = String(graph.options().filterMenu().getCheckBoxValue("setoperatorFilterCheckbox"));
    currObj.filter_objectProperties = String(graph.options().filterMenu().getCheckBoxValue("objectPropertyFilterCheckbox"));
    currObj.mode_dynamic = String(graph.options().dynamicLabelWidth());
    currObj.mode_scaling = String(graph.options().modeMenu().getCheckBoxValue("nodescalingModuleCheckbox"));
    currObj.mode_compact = String(graph.options().modeMenu().getCheckBoxValue("compactnotationModuleCheckbox"));
    currObj.mode_colorExt = String(graph.options().modeMenu().getCheckBoxValue("colorexternalsModuleCheckbox"));
    currObj.mode_multiColor = String(graph.options().modeMenu().colorModeState());
    currObj.mode_pnp = String(graph.options().modeMenu().getCheckBoxValue("pickandpinModuleCheckbox"));
    currObj.debugFeatures = String(!graph.options().getHideDebugFeatures());
    currObj.rect = 0;
    
    var defObj = graph.options().initialConfig();
    var optsString = prepareOptionString(defObj, currObj);
    var urlString = String(location);
    var htmlElement;
    // when everything is default then there is nothing to write
    if ( optsString.length === 0 ) {
      // building up parameter list;
      
      // remove the all options form location
      var hashCode = location.hash;
      urlString = urlString.split(hashCode)[0];
      
      var lPos = hashCode.lastIndexOf("#");
      if ( lPos === -1 ) {
        htmlElement = d3.select("#exportedUrl").node();
        htmlElement.value = String(location);
        htmlElement.title = String(location);
        return;  // nothing to change in the location String
      }
      var newURL = hashCode.slice(lPos, hashCode.length);
      htmlElement = d3.select("#exportedUrl").node();
      htmlElement.value = urlString + newURL;
      htmlElement.title = urlString + newURL;
      return;
    }
    
    // generate the options string;
    var numParameters = (urlString.match(/#/g) || []).length;
    var newUrlString;
    if ( numParameters === undefined || numParameters === 0 ) {
      newUrlString = urlString + "#" + optsString;
    }
    if ( numParameters > 0 ) {
      var tokens = urlString.split("#");
      var i;
      if ( tokens[1].indexOf("opts=") >= 0 ) {
        tokens[1] = optsString;
        newUrlString = tokens[0];
      } else {
        newUrlString = tokens[0] + "#";
        newUrlString += optsString;
      }
      // append parameters
      for ( i = 1; i < tokens.length; i++ ) {
        if ( tokens[i].length > 0 ) {
          newUrlString += "#" + tokens[i];
        }
      }
    }
    // building up parameter list;
    htmlElement = d3.select("#exportedUrl").node();
    htmlElement.value = newUrlString;
    htmlElement.title = newUrlString;
    
  };
  
  function exportSvg(){
    graph.options().navigationMenu().hideAllMenus();
    // Get the d3js SVG element
    var graphSvg = d3.select(graph.options().graphContainerSelector()).select("svg"),
      graphSvgCode,
      escapedGraphSvgCode,
      dataURI;
    
    // inline the styles, so that the exported svg code contains the css rules
    inlineVowlStyles();
    hideNonExportableElements();
    
    graphSvgCode = graphSvg.attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .node().parentNode.innerHTML;
    
    // Insert the reference to VOWL
    graphSvgCode = "<!-- Created with WebVOWL (version " + webvowl.version + ")" +
      ", http://vowl.visualdataweb.org -->\n" + graphSvgCode;
    
    escapedGraphSvgCode = escapeUnicodeCharacters(graphSvgCode);
    //btoa(); Creates a base-64 encoded ASCII string from a "string" of binary data.
    dataURI = "data:image/svg+xml;base64," + btoa(escapedGraphSvgCode);
    
    
    exportSvgButton.attr("href", dataURI)
      .attr("download", exportFilename + ".svg");
    
    // remove graphic styles for interaction to go back to normal
    removeVowlInlineStyles();
    showNonExportableElements();
    graph.lazyRefresh();
  }
  
  function escapeUnicodeCharacters( text ){
    var textSnippets = [],
      i, textLength = text.length,
      character,
      charCode;
    
    for ( i = 0; i < textLength; i++ ) {
      character = text.charAt(i);
      charCode = character.charCodeAt(0);
      
      if ( charCode < 128 ) {
        textSnippets.push(character);
      } else {
        textSnippets.push("&#" + charCode + ";");
      }
    }
    
    return textSnippets.join("");
  }
  
  function inlineVowlStyles(){
    setStyleSensitively(".text", [{ name: "font-family", value: "Helvetica, Arial, sans-serif" }, {
      name: "font-size",
      value: "12px"
    }]);
    setStyleSensitively(".subtext", [{ name: "font-size", value: "9px" }]);
    setStyleSensitively(".text.instance-count", [{ name: "fill", value: "#666" }]);
    setStyleSensitively(".external + text .instance-count", [{ name: "fill", value: "#aaa" }]);
    setStyleSensitively(".cardinality", [{ name: "font-size", value: "10px" }]);
    setStyleSensitively(".text, .embedded", [{ name: "pointer-events", value: "none" }]);
    setStyleSensitively(".class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty, .allvaluesfromproperty, .somevaluesfromproperty", [{
      name: "fill",
      value: "#acf"
    }]);
    setStyleSensitively(".label .datatype, .datatypeproperty", [{ name: "fill", value: "#9c6" }]);
    setStyleSensitively(".rdf, .rdfproperty", [{ name: "fill", value: "#c9c" }]);
    setStyleSensitively(".literal, .node .datatype", [{ name: "fill", value: "#fc3" }]);
    setStyleSensitively(".deprecated, .deprecatedproperty", [{ name: "fill", value: "#ccc" }]);
    setStyleSensitively(".external, .externalproperty", [{ name: "fill", value: "#36c" }]);
    setStyleSensitively("path, .nofill", [{ name: "fill", value: "none" }]);
    setStyleSensitively("marker path", [{ name: "fill", value: "#000" }]);
    setStyleSensitively(".class, path, line, .fineline", [{ name: "stroke", value: "#000" }]);
    setStyleSensitively(".white, .subclass, .subclassproperty, .external + text", [{ name: "fill", value: "#fff" }]);
    setStyleSensitively(".class.hovered, .property.hovered, .cardinality.hovered, .cardinality.focused, circle.pin, .filled.hovered, .filled.focused", [{
      name: "fill",
      value: "#f00"
    }, { name: "cursor", value: "pointer" }]);
    setStyleSensitively(".focused, path.hovered", [{ name: "stroke", value: "#f00" }]);
    setStyleSensitively(".indirect-highlighting, .feature:hover", [{ name: "fill", value: "#f90" }]);
    setStyleSensitively(".values-from", [{ name: "stroke", value: "#69c" }]);
    setStyleSensitively(".symbol, .values-from.filled", [{ name: "fill", value: "#69c" }]);
    setStyleSensitively(".class, path, line", [{ name: "stroke-width", value: "2" }]);
    setStyleSensitively(".fineline", [{ name: "stroke-width", value: "1" }]);
    setStyleSensitively(".dashed, .anonymous", [{ name: "stroke-dasharray", value: "8" }]);
    setStyleSensitively(".dotted", [{ name: "stroke-dasharray", value: "3" }]);
    setStyleSensitively("rect.focused, circle.focused", [{ name: "stroke-width", value: "4px" }]);
    setStyleSensitively(".nostroke", [{ name: "stroke", value: "none" }]);
    setStyleSensitively("marker path", [{ name: "stroke-dasharray", value: "100" }]);
  }
  
  function setStyleSensitively( selector, styles ){
    var elements = d3.selectAll(selector);
    if ( elements.empty() ) {
      return;
    }
    
    styles.forEach(function ( style ){
      elements.each(function (){
        var element = d3.select(this);
        if ( !shouldntChangeInlineCss(element, style.name) ) {
          element.style(style.name, style.value);
        }
      });
    });
  }
  
  function shouldntChangeInlineCss( element, style ){
    return style === "fill" && hasBackgroundColorSet(element);
  }
  
  function hasBackgroundColorSet( element ){
    var data = element.datum();
    if ( data === undefined ) {
      return false;
    }
    return data.backgroundColor && !!data.backgroundColor();
  }
  
  /**
   * For example the pin of the pick&pin module should be invisible in the exported graphic.
   */
  function hideNonExportableElements(){
    d3.selectAll(".hidden-in-export").style("display", "none");
  }
  
  function removeVowlInlineStyles(){
    d3.selectAll(".text, .subtext, .text.instance-count, .external + text .instance-count, .cardinality, .text, .embedded, .class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty, .allvaluesfromproperty, .somevaluesfromproperty, .label .datatype, .datatypeproperty, .rdf, .rdfproperty, .literal, .node .datatype, .deprecated, .deprecatedproperty, .external, .externalproperty, path, .nofill, .symbol, .values-from.filled, marker path, .class, path, line, .fineline, .white, .subclass, .subclassproperty, .external + text, .class.hovered, .property.hovered, .cardinality.hovered, .cardinality.focused, circle.pin, .filled.hovered, .filled.focused, .focused, path.hovered, .indirect-highlighting, .feature:hover, .values-from, .class, path, line, .fineline, .dashed, .anonymous, .dotted, rect.focused, circle.focused, .nostroke, marker path")
      .each(function (){
        var element = d3.select(this);
        
        var inlineStyles = element.node().style;
        for ( var styleName in inlineStyles ) {
          if ( inlineStyles.hasOwnProperty(styleName) ) {
            if ( shouldntChangeInlineCss(element, styleName) ) {
              continue;
            }
            element.style(styleName, null);
          }
        }
        
        if ( element.datum && element.datum() !== undefined && element.datum().type ) {
          if ( element.datum().type() === "rdfs:subClassOf" ) {
            element.style("fill", null);
          }
        }
      });
    
    // repair svg icons in the menu;
    var scrollContainer = d3.select("#menuElementContainer").node();
    var controlElements = scrollContainer.children;
    var numEntries = controlElements.length;
    
    for ( var i = 0; i < numEntries; i++ ) {
      var currentMenu = controlElements[i].id;
      d3.select("#" + currentMenu).select("path").style("stroke-width", "0");
      d3.select("#" + currentMenu).select("path").style("fill", "#fff");
    }
    
    d3.select("#magnifyingGlass").style("stroke-width", "0");
    d3.select("#magnifyingGlass").style("fill", "#666");
    
  }
  
  function showNonExportableElements(){
    d3.selectAll(".hidden-in-export").style("display", null);
  }
  
  exportMenu.createJSON_exportObject = function (){
    var i, j, k; // an index variable for the for-loops
    
    /** get data for exporter **/
      if (!graph.options().data()) {return {};} // return an empty json object
      // extract onotology information;
    var unfilteredData = graph.getUnfilteredData();
    var ontologyComment = graph.options().data()._comment;
    var metaObj = graph.options().getGeneralMetaObject();
    var header = graph.options().data().header;
    
    if ( metaObj.iri && metaObj.iri !== header.iri ) {
      header.iri = metaObj.iri;
    }
    if ( metaObj.title && metaObj.title !== header.title ) {
      header.title = metaObj.title;
    }
    if ( metaObj.version && metaObj.version !== header.version ) {
      header.version = metaObj.version;
    }
    if ( metaObj.author && metaObj.author !== header.author ) {
      header.author = metaObj.author;
    }
    if ( metaObj.description && metaObj.description !== header.description ) {
      header.description = metaObj.description;
    }
    
    
    var exportText = {};
    exportText._comment = ontologyComment;
    exportText.header = header;
    exportText.namespace = graph.options().data().namespace;
    if ( exportText.namespace === undefined ) {
      exportText.namespace = []; // just an empty namespace array
    }
    // we do have now the unfiltered data which needs to be transfered to class/classAttribute and property/propertyAttribute
    
    
    // var classAttributeString='classAttribute:[ \n';
    var nodes = unfilteredData.nodes;
    var nLen = nodes.length; // hope for compiler unroll
    var classObjects = [];
    var classAttributeObjects = [];
    for ( i = 0; i < nLen; i++ ) {
      var classObj = {};
      var classAttr = {};
      classObj.id = nodes[i].id();
      classObj.type = nodes[i].type();
      classObjects.push(classObj);
      
      // define the attributes object
      classAttr.id = nodes[i].id();
      classAttr.iri = nodes[i].iri();
      classAttr.baseIri = nodes[i].baseIri();
      classAttr.label = nodes[i].label();
      
      if ( nodes[i].attributes().length > 0 ) {
        classAttr.attributes = nodes[i].attributes();
      }
      if ( nodes[i].comment() ) {
        classAttr.comment = nodes[i].comment();
      }
      if ( nodes[i].annotations() ) {
        classAttr.annotations = nodes[i].annotations();
      }
      if ( nodes[i].description() ) {
        classAttr.description = nodes[i].description();
      }
      
      
      if ( nodes[i].individuals().length > 0 ) {
        var classIndividualElements = [];
        var nIndividuals = nodes[i].individuals();
        for ( j = 0; j < nIndividuals.length; j++ ) {
          var indObj = {};
          indObj.iri = nIndividuals[j].iri();
          indObj.baseIri = nIndividuals[j].baseIri();
          indObj.labels = nIndividuals[j].label();
          if ( nIndividuals[j].annotations() ) {
            indObj.annotations = nIndividuals[j].annotations();
          }
          if ( nIndividuals[j].description() ) {
            indObj.description = nIndividuals[j].description();
          }
          if ( nIndividuals[j].comment() ) {
            indObj.comment = nIndividuals[j].comment();
          }
          classIndividualElements.push(indObj);
        }
        classAttr.individuals = classIndividualElements;
      }
      
      var equalsForAttributes = undefined;
      if ( nodes[i].equivalents().length > 0 ) {
        equalsForAttributes = [];
        var equals = nodes[i].equivalents();
        for ( j = 0; j < equals.length; j++ ) {
          var eqObj = {};
          var eqAttr = {};
          eqObj.id = equals[j].id();
          equalsForAttributes.push(equals[j].id());
          eqObj.type = equals[j].type();
          classObjects.push(eqObj);
          
          eqAttr.id = equals[j].id();
          eqAttr.iri = equals[j].iri();
          eqAttr.baseIri = equals[j].baseIri();
          eqAttr.label = equals[j].label();
          
          if ( equals[j].attributes().length > 0 ) {
            eqAttr.attributes = equals[j].attributes();
          }
          if ( equals[j].comment() ) {
            eqAttr.comment = equals[j].comment();
          }
          if ( equals[j].individuals().length > 0 ) {
            eqAttr.individuals = equals[j].individuals();
          }
          if ( equals[j].annotations() ) {
            eqAttr.annotations = equals[j].annotations();
          }
          if ( equals[j].description() ) {
            eqAttr.description = equals[j].description();
          }
          
          if ( equals[j].individuals().length > 0 ) {
            var e_classIndividualElements = [];
            var e_nIndividuals = equals[i].individuals();
            for ( k = 0; k < e_nIndividuals.length; k++ ) {
              var e_indObj = {};
              e_indObj.iri = e_nIndividuals[k].iri();
              e_indObj.baseIri = e_nIndividuals[k].baseIri();
              e_indObj.labels = e_nIndividuals[k].label();
              
              if ( e_nIndividuals[k].annotations() ) {
                e_indObj.annotations = e_nIndividuals[k].annotations();
              }
              if ( e_nIndividuals[k].description() ) {
                e_indObj.description = e_nIndividuals[k].description();
              }
              if ( e_nIndividuals[k].comment() ) {
                e_indObj.comment = e_nIndividuals[k].comment();
              }
              e_classIndividualElements.push(e_indObj);
            }
            eqAttr.individuals = e_classIndividualElements;
          }
          
          classAttributeObjects.push(eqAttr);
        }
      }
      if ( equalsForAttributes && equalsForAttributes.length > 0 ) {
        classAttr.equivalent = equalsForAttributes;
      }
      
      // classAttr.subClasses=nodes[i].subClasses(); // not needed
      // classAttr.instances=nodes[i].instances();
      
      //
      // .complement(element.complement)
      // .disjointUnion(element.disjointUnion)
      // .description(element.description)
      // .equivalents(element.equivalent)
      // .intersection(element.intersection)
      // .type(element.type) Ignore, because we predefined it
      // .union(element.union)
      classAttributeObjects.push(classAttr);
    }
    
    /** -- properties -- **/
    var properties = unfilteredData.properties;
    var pLen = properties.length; // hope for compiler unroll
    var propertyObjects = [];
    var propertyAttributeObjects = [];
    
    for ( i = 0; i < pLen; i++ ) {
      var pObj = {};
      var pAttr = {};
      pObj.id = properties[i].id();
      pObj.type = properties[i].type();
      propertyObjects.push(pObj);
      
      // // define the attributes object
      pAttr.id = properties[i].id();
      pAttr.iri = properties[i].iri();
      pAttr.baseIri = properties[i].baseIri();
      pAttr.label = properties[i].label();
      
      if ( properties[i].attributes().length > 0 ) {
        pAttr.attributes = properties[i].attributes();
      }
      if ( properties[i].comment() ) {
        pAttr.comment = properties[i].comment();
      }
      
      if ( properties[i].annotations() ) {
        pAttr.annotations = properties[i].annotations();
      }
      if ( properties[i].maxCardinality() ) {
        pAttr.maxCardinality = properties[i].maxCardinality();
      }
      if ( properties[i].minCardinality() ) {
        pAttr.minCardinality = properties[i].minCardinality();
      }
      if ( properties[i].cardinality() ) {
        pAttr.cardinality = properties[i].cardinality();
      }
      if ( properties[i].description() ) {
        pAttr.description = properties[i].description();
      }
      
      pAttr.domain = properties[i].domain().id();
      pAttr.range = properties[i].range().id();
      // sub properties;
      if ( properties[i].subproperties() ) {
        var subProps = properties[i].subproperties();
        var subPropsIdArray = [];
        for ( j = 0; j < subProps.length; j++ ) {
          if ( subProps[j].id )
            subPropsIdArray.push(subProps[j].id());
        }
        pAttr.subproperty = subPropsIdArray;
      }
      
      // super properties
      if ( properties[i].superproperties() ) {
        var superProps = properties[i].superproperties();
        var superPropsIdArray = [];
        for ( j = 0; j < superProps.length; j++ ) {
          if ( superProps[j].id )
            superPropsIdArray.push(superProps[j].id());
        }
        pAttr.superproperty = superPropsIdArray;
      }
      
      // check for inverse element
      if ( properties[i].inverse() ) {
        if ( properties[i].inverse().id )
          pAttr.inverse = properties[i].inverse().id();
      }
      propertyAttributeObjects.push(pAttr);
    }
    
    exportText.class = classObjects;
    exportText.classAttribute = classAttributeObjects;
    exportText.property = propertyObjects;
    exportText.propertyAttribute = propertyAttributeObjects;
    
    
    var nodeElements = graph.graphNodeElements();  // get visible nodes
    var propElements = graph.graphLabelElements(); // get visible labels
    // var jsonObj = JSON.parse(exportableJsonText);	   // reparse the original input json
    
    /** modify comment **/
    var comment = exportText._comment;
    var additionalString = " [Additional Information added by WebVOWL Exporter Version: " + "@@WEBVOWL_VERSION" + "]";
    // adding new string to comment only if it does not exist
    if ( comment.indexOf(additionalString) === -1 ) {
      exportText._comment = comment + " [Additional Information added by WebVOWL Exporter Version: " + "@@WEBVOWL_VERSION" + "]";
    }
    
    var classAttribute = exportText.classAttribute;
    var propAttribute = exportText.propertyAttribute;
    /**  remove previously stored variables **/
    for ( i = 0; i < classAttribute.length; i++ ) {
      var classObj_del = classAttribute[i];
      delete classObj_del.pos;
      delete classObj_del.pinned;
    }
    var propertyObj;
    for ( i = 0; i < propAttribute.length; i++ ) {
      propertyObj = propAttribute[i];
      delete propertyObj.pos;
      delete propertyObj.pinned;
    }
    /**  add new variables to jsonObj  **/
    // class attribute variables
    nodeElements.each(function ( node ){
      var nodeId = node.id();
      for ( i = 0; i < classAttribute.length; i++ ) {
        var classObj = classAttribute[i];
        if ( classObj.id === nodeId ) {
          // store relative positions
          classObj.pos = [parseFloat(node.x.toFixed(2)), parseFloat(node.y.toFixed(2))];
          if ( node.pinned() )
            classObj.pinned = true;
          break;
        }
      }
    });
    // property attribute variables
    for ( j = 0; j < propElements.length; j++ ) {
      var correspondingProp = propElements[j].property();
      for ( i = 0; i < propAttribute.length; i++ ) {
        propertyObj = propAttribute[i];
        if ( propertyObj.id === correspondingProp.id() ) {
          propertyObj.pos = [parseFloat(propElements[j].x.toFixed(2)), parseFloat(propElements[j].y.toFixed(2))];
          if ( propElements[j].pinned() )
            propertyObj.pinned = true;
          break;
        }
      }
    }
    /** create the variable for settings and set their values **/
    exportText.settings = {};
    
    // Global Settings
    var zoom = graph.scaleFactor();
    var paused = graph.paused();
    var translation = [parseFloat(graph.translation()[0].toFixed(2)), parseFloat(graph.translation()[1].toFixed(2))];
    exportText.settings.global = {};
    exportText.settings.global.zoom = zoom.toFixed(2);
    exportText.settings.global.translation = translation;
    exportText.settings.global.paused = paused;
    
    // shared variable declaration
    var cb_text;
    var isEnabled;
    var cb_obj;
    
    // Gravity Settings
    var classDistance = graph.options().classDistance();
    var datatypeDistance = graph.options().datatypeDistance();
    exportText.settings.gravity = {};
    exportText.settings.gravity.classDistance = classDistance;
    exportText.settings.gravity.datatypeDistance = datatypeDistance;
    
    // Filter Settings
    var fMenu = graph.options().filterMenu();
    var fContainer = fMenu.getCheckBoxContainer();
    var cbCont = [];
    for ( i = 0; i < fContainer.length; i++ ) {
      cb_text = fContainer[i].checkbox.attr("id");
      isEnabled = fContainer[i].checkbox.property("checked");
      cb_obj = {};
      cb_obj.id = cb_text;
      cb_obj.checked = isEnabled;
      cbCont.push(cb_obj);
    }
    var degreeSliderVal = fMenu.getDegreeSliderValue();
    exportText.settings.filter = {};
    exportText.settings.filter.checkBox = cbCont;
    exportText.settings.filter.degreeSliderValue = degreeSliderVal;
    
    // Modes Settings
    var mMenu = graph.options().modeMenu();
    var mContainer = mMenu.getCheckBoxContainer();
    var cb_modes = [];
    for ( i = 0; i < mContainer.length; i++ ) {
      cb_text = mContainer[i].attr("id");
      isEnabled = mContainer[i].property("checked");
      cb_obj = {};
      cb_obj.id = cb_text;
      cb_obj.checked = isEnabled;
      cb_modes.push(cb_obj);
    }
    var colorSwitchState = mMenu.colorModeState();
    exportText.settings.modes = {};
    exportText.settings.modes.checkBox = cb_modes;
    exportText.settings.modes.colorSwitchState = colorSwitchState;
    
    var exportObj = {};
    // todo: [ ] find better way for ordering the objects
    // hack for ordering of objects, so settings is after metrics
    exportObj._comment = exportText._comment;
    exportObj.header = exportText.header;
    exportObj.namespace = exportText.namespace;
    exportObj.metrics = exportText.metrics;
    exportObj.settings = exportText.settings;
    exportObj.class = exportText.class;
    exportObj.classAttribute = exportText.classAttribute;
    exportObj.property = exportText.property;
    exportObj.propertyAttribute = exportText.propertyAttribute;
    
    return exportObj;
  };
  
  function exportJson(){
    graph.options().navigationMenu().hideAllMenus();
    /**  check if there is data **/
    if ( !exportableJsonText ) {
      alert("No graph data available.");
      // Stop the redirection to the path of the href attribute
      d3.event.preventDefault();
      return;
    }
    
    var exportObj = exportMenu.createJSON_exportObject();
    
    // make a string again;
    var exportText = JSON.stringify(exportObj, null, '  ');
    // write the data
    var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(exportText);
    var jsonExportFileName = exportFilename;
    
    if ( !jsonExportFileName.endsWith(".json") )
      jsonExportFileName += ".json";
    exportJsonButton.attr("href", dataURI)
      .attr("download", jsonExportFileName);
  }
  
  var curveFunction = d3.svg.line()
    .x(function ( d ){
      return d.x;
    })
    .y(function ( d ){
      return d.y;
    })
    .interpolate("cardinal");
  var loopFunction = d3.svg.line()
    .x(function ( d ){
      return d.x;
    })
    .y(function ( d ){
      return d.y;
    })
    .interpolate("cardinal")
    .tension(-1);
  
  function exportTex(){
    var zoom = graph.scaleFactor();
    var grTranslate = graph.translation();
    var bbox = graph.getBoundingBoxForTex();
    var comment = " %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n";
    comment += " %        Generated with the experimental alpha version of the TeX exporter of WebVOWL (version 1.1.3) %%% \n";
    comment += " %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n\n";
    comment += " %   The content can be used as import in other TeX documents. \n";
    comment += " %   Parent document has to use the following packages   \n";
    comment += " %   \\usepackage{tikz}  \n";
    comment += " %   \\usepackage{helvet}  \n";
    comment += " %   \\usetikzlibrary{decorations.markings,decorations.shapes,decorations,arrows,automata,backgrounds,petri,shapes.geometric}  \n";
    comment += " %   \\usepackage{xcolor}  \n\n";
    comment += " %%%%%%%%%%%%%%% Example Parent Document %%%%%%%%%%%%%%%%%%%%%%%\n";
    comment += " %\\documentclass{article} \n";
    comment += " %\\usepackage{tikz} \n";
    comment += " %\\usepackage{helvet} \n";
    comment += " %\\usetikzlibrary{decorations.markings,decorations.shapes,decorations,arrows,automata,backgrounds,petri,shapes.geometric} \n";
    comment += " %\\usepackage{xcolor} \n\n";
    comment += " %\\begin{document} \n";
    comment += " %\\section{Example} \n";
    comment += " %  This is an example. \n";
    comment += " %  \\begin{figure} \n";
    comment += " %    \\input{<THIS_FILE_NAME>} % << tex file name for the graph \n";
    comment += " %    \\caption{A generated graph with TKIZ using alpha version of the TeX exporter of WebVOWL (version 1.1.3) } \n";
    comment += " %  \\end{figure} \n";
    comment += " %\\end{document} \n";
    comment += " %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n\n";
    
    
    var texString = comment + "\\definecolor{imageBGCOLOR}{HTML}{FFFFFF} \n" +
      "\\definecolor{owlClassColor}{HTML}{AACCFF}\n" +
      "\\definecolor{owlObjectPropertyColor}{HTML}{AACCFF}\n" +
      "\\definecolor{owlExternalClassColor}{HTML}{AACCFF}\n" +
      "\\definecolor{owlDatatypePropertyColor}{HTML}{99CC66}\n" +
      "\\definecolor{owlDatatypeColor}{HTML}{FFCC33}\n" +
      "\\definecolor{owlThingColor}{HTML}{FFFFFF}\n" +
      "\\definecolor{valuesFrom}{HTML}{6699CC}\n" +
      "\\definecolor{rdfPropertyColor}{HTML}{CC99CC}\n" +
      "\\definecolor{unionColor}{HTML}{6699cc}\n" +
      "\\begin{center} \n" +
      "\\resizebox{\\linewidth}{!}{\n" +
      
      "\\begin{tikzpicture}[framed]\n" +
      "\\clip (" + bbox[0] + "pt , " + bbox[1] + "pt ) rectangle (" + bbox[2] + "pt , " + bbox[3] + "pt);\n" +
      "\\tikzstyle{dashed}=[dash pattern=on 4pt off 4pt] \n" +
      "\\tikzstyle{dotted}=[dash pattern=on 2pt off 2pt] \n" +
      "\\fontfamily{sans-serif}{\\fontsize{12}{12}\\selectfont}\n \n";
    
    
    texString += "\\tikzset{triangleBlack/.style = {fill=black, draw=black, line width=1pt,scale=0.7,regular polygon, regular polygon sides=3} }\n";
    texString += "\\tikzset{triangleWhite/.style = {fill=white, draw=black, line width=1pt,scale=0.7,regular polygon, regular polygon sides=3} }\n";
    texString += "\\tikzset{triangleBlue/.style  = {fill=valuesFrom, draw=valuesFrom, line width=1pt,scale=0.7,regular polygon, regular polygon sides=3} }\n";
    
    texString += "\\tikzset{Diamond/.style = {fill=white, draw=black, line width=2pt,scale=1.2,regular polygon, regular polygon sides=4} }\n";
    
    
    texString += "\\tikzset{Literal/.style={rectangle,align=center,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "black, draw=black, dashed, line width=1pt, fill=owlDatatypeColor, minimum width=80pt,\n" +
      "minimum height = 20pt}}\n\n";
    
    texString += "\\tikzset{Datatype/.style={rectangle,align=center,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "black, draw=black, line width=1pt, fill=owlDatatypeColor, minimum width=80pt,\n" +
      "minimum height = 20pt}}\n\n";
    
    
    texString += "\\tikzset{owlClass/.style={circle, inner sep=0mm,align=center, \n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "black, draw=black, line width=1pt, fill=owlClassColor, minimum size=101pt}}\n\n";
    
    texString += "\\tikzset{anonymousClass/.style={circle, inner sep=0mm,align=center, \n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "black, dashed, draw=black, line width=1pt, fill=owlClassColor, minimum size=101pt}}\n\n";
    
    
    texString += "\\tikzset{owlThing/.style={circle, inner sep=0mm,align=center,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "black, dashed, draw=black, line width=1pt, fill=owlThingColor, minimum size=62pt}}\n\n";
    
    
    texString += "\\tikzset{owlObjectProperty/.style={rectangle,align=center,\n" +
      "inner sep=0mm,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "fill=owlObjectPropertyColor, minimum width=80pt,\n" +
      "minimum height = 25pt}}\n\n";
    
    texString += "\\tikzset{rdfProperty/.style={rectangle,align=center,\n" +
      "inner sep=0mm,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "fill=rdfPropertyColor, minimum width=80pt,\n" +
      "minimum height = 25pt}}\n\n";
    
    
    texString += "\\tikzset{owlDatatypeProperty/.style={rectangle,align=center,\n" +
      "fill=owlDatatypePropertyColor, minimum width=80pt,\n" +
      "inner sep=0mm,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "minimum height = 25pt}}\n\n";
    
    texString += "\\tikzset{rdfsSubClassOf/.style={rectangle,align=center,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "inner sep=0mm,\n" +
      "fill=imageBGCOLOR, minimum width=80pt,\n" +
      "minimum height = 25pt}}\n\n";
    
    texString += "\\tikzset{unionOf/.style={circle, inner sep=0mm,align=center,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "black, draw=black, line width=1pt, fill=unionColor, minimum size=25pt}}\n\n";
    
    texString += "\\tikzset{disjointWith/.style={circle, inner sep=0mm,align=center,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "black, draw=black, line width=1pt, fill=unionColor, minimum size=20pt}}\n\n";
    
    
    texString += "\\tikzset{owlEquivalentClass/.style={circle,align=center,\n" +
      "font={\\fontsize{12pt}{12}\\selectfont \\sffamily },\n" +
      "inner sep=0mm,\n" +
      "black, solid, draw=black, line width=3pt, fill=owlExternalClassColor, minimum size=101pt,\n" +
      "postaction = {draw,line width=1pt, white}}}\n\n";
    
    // draw a bounding box;
    
    // get bbox coordinates;
    
    
    graph.options().navigationMenu().hideAllMenus();
    /**  check if there is data **/
    if ( !exportableJsonText ) {
      alert("No graph data available.");
      // Stop the redirection to the path of the href attribute
      d3.event.preventDefault();
      return;
    }
    
    var i = 0, identifier;
    
    /** get data for exporter **/
    var nodeElements = graph.graphNodeElements();  // get visible nodes
    var propElements = graph.graphLabelElements(); // get visible labels
    var links = graph.graphLinkElements();
    
    // export only nodes;
    // draw Links;
    for ( i = 0; i < links.length; i++ ) {
      var link = links[i];
      // console.log("\n****************\nInverstigating Link for property "+link.property().labelForCurrentLanguage());
      
      var prop = link.property();
      var dx, dy, px, py, rx, ry;
      var colorStr = "black";
      var linkDomainIntersection;
      var linkRangeIntersection;
      var center;
      var linkStyle = "";
      var isLoop = "";
      var curvePoint;
      var pathStart;
      var pathEnd;
      var controlPoints;
      var len;
      var ahAngle;
      var pathLen;
      var markerOffset = 7;
      
      var arrowType = "triangleBlack";
      var linkWidth = ",line width=2pt";
      if ( prop.linkType ) {
        if ( prop.linkType() === "dotted" ) {
          //stroke-dasharray: 3;
          linkStyle = ", dotted ";
          arrowType = "triangleWhite";
        }
        if ( prop.linkType() === "dashed" ) {
          //stroke-dasharray: 3;
          linkStyle = ", dashed ";
        }
        
        if ( prop.linkType() === "values-from" ) {
          colorStr = "valuesFrom";
        }
        
      }
      
      var startX, startY, endX, endY, normX, normY, lg;
      
      if ( link.layers().length === 1 && !link.loops() ) {
        
        linkDomainIntersection = graph.math().calculateIntersection(link.range(), link.domain(), 1);
        linkRangeIntersection = graph.math().calculateIntersection(link.domain(), link.range(), 1);
        center = graph.math().calculateCenter(linkDomainIntersection, linkRangeIntersection);
        dx = linkDomainIntersection.x;
        dy = -linkDomainIntersection.y;
        px = center.x;
        py = -center.y;
        rx = linkRangeIntersection.x;
        ry = -linkRangeIntersection.y;
        
        
        pathStart = linkDomainIntersection;
        curvePoint = center;
        pathEnd = linkRangeIntersection;
        
        var nx = rx - px;
        var ny = ry - py;
        
        // normalize ;
        len = Math.sqrt(nx * nx + ny * ny);
        
        nx = nx / len;
        ny = ny / len;
        
        ahAngle = Math.atan2(ny, nx) * (180 / Math.PI);
        normX = nx;
        normY = ny;
      }
      else {
        if ( link.isLoop() ) {
          isLoop = ", tension=3";
          controlPoints = graph.math().calculateLoopPoints(link);
          pathStart = controlPoints[0];
          curvePoint = controlPoints[1];
          pathEnd = controlPoints[2];
        } else {
          curvePoint = link.label();
          pathStart = graph.math().calculateIntersection(curvePoint, link.domain(), 1);
          pathEnd = graph.math().calculateIntersection(curvePoint, link.range(), 1);
        }
        dx = pathStart.x;
        dy = -pathStart.y;
        px = curvePoint.x;
        py = -curvePoint.y;
        rx = pathEnd.x;
        ry = -pathEnd.y;
      }
      
      texString += "\\draw [" + colorStr + linkStyle + linkWidth + isLoop + "] plot [smooth] coordinates {(" +
        dx + "pt, " + dy + "pt) (" + px + "pt, " + py + "pt)  (" + rx + "pt, " + ry + "pt)};\n";
      
      
      if ( link.property().markerElement() === undefined ) continue;
      
      // add arrow head;
      
      
      if ( link.property().type() === "owl:someValuesFrom" || link.property().type() === "owl:allValuesFrom" ) {
        arrowType = "triangleBlue";
      }
      
      lg = link.pathObj();
      pathLen = Math.floor(lg.node().getTotalLength());
      var p1 = lg.node().getPointAtLength(pathLen - 4);
      var p2 = lg.node().getPointAtLength(pathLen);
      var markerCenter = lg.node().getPointAtLength(pathLen - 6);
      
      if ( link.property().type() === "setOperatorProperty" ) {
        p1 = lg.node().getPointAtLength(4);
        p2 = lg.node().getPointAtLength(0);
        markerCenter = lg.node().getPointAtLength(8);
        arrowType = "Diamond";
      }
      
      startX = p1.x;
      startY = p1.y;
      endX = p2.x;
      endY = p2.y;
      normX = endX - startX;
      normY = endY - startY;
      len = Math.sqrt(normX * normX + normY * normY);
      normX = normX / len;
      normY = normY / len;
      
      ahAngle = -1.0 * Math.atan2(normY, normX) * (180 / Math.PI);
      ahAngle -= 90;
      if ( link.property().type() === "setOperatorProperty" ) {
        ahAngle -= 45;
      }
      // console.log(link.property().labelForCurrentLanguage()+ ": "+normX+ " "+normY +"  "+ahAngle);
      rx = markerCenter.x;
      ry = markerCenter.y;
      if ( link.layers().length === 1 && !link.loops() ) {
        // markerOffset=-1*m
        ry = -1 * ry;
        texString += "\\node[" + arrowType + ", rotate=" + ahAngle + "] at (" + rx + "pt, " + ry + "pt)   (single_marker" + i + ") {};\n ";
      } else {
        ry = -1 * ry;
        texString += "\\node[" + arrowType + ", rotate=" + ahAngle + "] at (" + rx + "pt, " + ry + "pt)   (marker" + i + ") {};\n ";
      }
      
      // if   (link.isLoop()){
      //    rotAngle=-10+angle * (180 / Math.PI);
      // }
      
      // add cardinality;
      var cardinalityText = link.property().generateCardinalityText();
      if ( cardinalityText && cardinalityText.length > 0 ) {
        var cardinalityCenter = lg.node().getPointAtLength(pathLen - 18);
        var cx = cardinalityCenter.x - (10 * normY);
        var cy = cardinalityCenter.y + (10 * normX); // using orthonormal y Coordinate
        cy *= -1.0;
        var textColor = "black";
        if ( cardinalityText.indexOf("A") > -1 ) {
          cardinalityText = "$\\forall$";
        }
        if ( cardinalityText.indexOf("E") > -1 ) {
          cardinalityText = "$\\exists$";
        }
        
        
        texString += "\\node[font={\\fontsize{12pt}{12}\\selectfont \\sffamily },text=" + textColor + "] at (" + cx + "pt, " + cy + "pt)   (cardinalityText" + i + ") {" + cardinalityText + "};\n ";
      }
      
      
      if ( link.property().inverse() ) {
        lg = link.pathObj();
        pathLen = Math.floor(lg.node().getTotalLength());
        var p1_inv = lg.node().getPointAtLength(4);
        var p2_inv = lg.node().getPointAtLength(0);
        var markerCenter_inv = lg.node().getPointAtLength(6);
        startX = p1_inv.x;
        startY = p1_inv.y;
        endX = p2_inv.x;
        endY = p2_inv.y;
        normX = endX - startX;
        normY = endY - startY;
        len = Math.sqrt(normX * normX + normY * normY);
        normX = normX / len;
        normY = normY / len;
        
        ahAngle = -1.0 * Math.atan2(normY, normX) * (180 / Math.PI);
        ahAngle -= 90;
        //   console.log("INV>>\n "+link.property().inverse().labelForCurrentLanguage()+ ": "+normX+ " "+normY +"  "+ahAngle);
        rx = markerCenter_inv.x;
        ry = markerCenter_inv.y;
        if ( link.layers().length === 1 && !link.loops() ) {
          // markerOffset=-1*m
          ry = -1 * ry;
          texString += "\\node[" + arrowType + ", rotate=" + ahAngle + "] at (" + rx + "pt, " + ry + "pt)   (INV_single_marker" + i + ") {};\n ";
        } else {
          ry = -1 * ry;
          texString += "\\node[" + arrowType + ", rotate=" + ahAngle + "] at (" + rx + "pt, " + ry + "pt)   (INV_marker" + i + ") {};\n ";
        }
      }
      
      
    }
    
    
    nodeElements.each(function ( node ){
      
      px = node.x;
      py = -node.y;
      identifier = node.labelForCurrentLanguage();
      // console.log("Writing : "+ identifier);
      if ( identifier === undefined ) identifier = "";
      var qType = "owlClass";
      if ( node.type() === "owl:Thing" || node.type() === "owl:Nothing" )
        qType = "owlThing";
      
      if ( node.type() === "owl:equivalentClass" ) {
        qType = "owlEquivalentClass";
      }
      var textColorStr = "";
      if ( node.textBlock ) {
        var txtColor = node.textBlock()._textBlock().style("fill");
        if ( txtColor === "rgb(0, 0, 0)" ) {
          textColorStr = ", text=black";
        }
        if ( txtColor === "rgb(255, 255, 255)" ) {
          textColorStr = ", text=white";
        }
        
        
        var tspans = node.textBlock()._textBlock().node().children;
        if ( tspans[0] ) {
          identifier = tspans[0].innerHTML;
          if ( node.individuals() && node.individuals().length === parseInt(tspans[0].innerHTML) ) {
            identifier = "{\\color{gray} " + tspans[0].innerHTML + " }";
          }
          for ( var t = 1; t < tspans.length; t++ ) {
            if ( node.individuals() && node.individuals().length === parseInt(tspans[t].innerHTML) ) {
              identifier += "\\\\ {\\color{gray} " + tspans[t].innerHTML + " }";
            } else {
              identifier += "\\\\ {\\small " + tspans[t].innerHTML + " }";
            }
          }
        }
      }
      if ( node.type() === "rdfs:Literal" ) {
        qType = "Literal";
      }
      if ( node.type() === "rdfs:Datatype" ) {
        qType = "Datatype";
      }
      if ( node.attributes().indexOf("anonymous") !== -1 ) {
        qType = "anonymousClass";
      }
      
      
      if ( node.type() === "owl:unionOf" || node.type() === "owl:complementOf" || node.type() === "owl:disjointUnionOf" || node.type() === "owl:intersectionOf" )
        qType = "owlClass";
      
      var bgColorStr = "";
      var widthString = "";
      
      if ( node.type() === "rdfs:Literal" || node.type() === "rdfs:Datatype" ) {
        var width = node.width();
        widthString = ",minimum width=" + width + "pt";
      }
      else {
        widthString = ",minimum size=" + 2 * node.actualRadius() + "pt";
        
      }
      if ( node.backgroundColor() ) {
        var bgColor = node.backgroundColor();
        bgColor.toUpperCase();
        bgColor = bgColor.slice(1, bgColor.length);
        texString += "\\definecolor{Node" + i + "_COLOR}{HTML}{" + bgColor + "} \n ";
        bgColorStr = ", fill=Node" + i + "_COLOR ";
      }
      if ( node.attributes().indexOf("deprecated") > -1 ) {
        texString += "\\definecolor{Node" + i + "_COLOR}{HTML}{CCCCCC} \n ";
        bgColorStr = ", fill=Node" + i + "_COLOR ";
      }
      
      var leftPos = px - 7;
      var rightPos = px + 7;
      var txtOffset = py + 20;
      if ( node.type() !== "owl:unionOf" || node.type() !== "owl:disjointUnionOf" ) {
        texString += "\\node[" + qType + " " + widthString + " " + bgColorStr + " " + textColorStr + "] at (" + px + "pt, " + py + "pt)   (Node" + i + ") {" + identifier.replaceAll("_", "\\_ ") + "};\n";
      }
      if ( node.type() === "owl:unionOf" ) {
        // add symbol to it;
        texString += "\\node[" + qType + " " + widthString + " " + bgColorStr + " " + textColorStr + "] at (" + px + "pt, " + py + "pt)   (Node" + i + ") {};\n";
        texString += "\\node[unionOf   , text=black] at (" + leftPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[unionOf   , text=black] at (" + rightPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[unionOf ,fill=none   , text=black] at (" + leftPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[text=black] at (" + px + "pt, " + py + "pt)  (unionText13) {$\\mathbf{\\cup}$};\n";
        texString += "\\node[font={\\fontsize{12pt}{12}\\selectfont \\sffamily }" + textColorStr + "] at (" + px + "pt, " + txtOffset + "pt)   (Node_text" + i + ") {" + identifier.replaceAll("_", "\\_ ") + "};\n";
      }
      // OWL DISJOINT UNION OF
      if ( node.type() === "owl:disjointUnionOf" ) {
        texString += "\\node[" + qType + " " + widthString + " " + bgColorStr + " " + textColorStr + "] at (" + px + "pt, " + py + "pt)   (Node" + i + ") {};\n";
        texString += "\\node[unionOf   , text=black] at (" + leftPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[unionOf   , text=black] at (" + rightPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[unionOf ,fill=none   , text=black] at (" + leftPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[font={\\fontsize{12pt}{12}\\selectfont \\sffamily }" + textColorStr + "] at (" + px + "pt, " + py + "pt)  (disjointUnoinText" + i + ") {1};\n";
        texString += "\\node[font={\\fontsize{12pt}{12}\\selectfont \\sffamily }" + textColorStr + "] at (" + px + "pt, " + txtOffset + "pt)   (Node_text" + i + ") {" + identifier.replaceAll("_", "\\_ ") + "};\n";
      }
      // OWL COMPLEMENT OF
      if ( node.type() === "owl:complementOf" ) {
        // add symbol to it;
        texString += "\\node[" + qType + " " + widthString + " " + bgColorStr + " " + textColorStr + "] at (" + px + "pt, " + py + "pt)   (Node" + i + ") {};\n";
        texString += "\\node[unionOf   , text=black] at (" + px + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[font={\\fontsize{18pt}{18}\\selectfont \\sffamily }" + textColorStr + "] at (" + px + "pt, " + py + "pt)  (unionText13) {$\\neg$};\n";
        texString += "\\node[font={\\fontsize{12pt}{12}\\selectfont \\sffamily }" + textColorStr + "] at (" + px + "pt, " + txtOffset + "pt)   (Node_text" + i + ") {" + identifier.replaceAll("_", "\\_ ") + "};\n";
      }
      // OWL INTERSECTION OF
      if ( node.type() === "owl:intersectionOf" ) {
        texString += "\\node[" + qType + " " + widthString + " " + bgColorStr + " " + textColorStr + "] at (" + px + "pt, " + py + "pt)   (Node" + i + ") {};\n";
        texString += "\\node[unionOf   , text=black] at (" + leftPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[unionOf   , text=black] at (" + rightPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[unionOf ,fill=none   , text=black] at (" + leftPos + "pt, " + py + "pt)   (SymbolNode" + i + ") {};\n";
        
        // add now the outer colors;
        texString += "\\filldraw[even odd rule,fill=owlClassColor,line width=1pt] (" + leftPos + "pt, " + py + "pt) circle (12.5pt)  (" + rightPos + "pt, " + py + "pt) circle (12.5pt);\n ";
        
        // add texts
        texString += "\\node[font={\\fontsize{12pt}{12}\\selectfont \\sffamily }" + textColorStr + "] at (" + px + "pt, " + py + "pt)  (intersectionText" + i + ") {$\\cap$};\n";
        texString += "\\node[font={\\fontsize{12pt}{12}\\selectfont \\sffamily }" + textColorStr + "] at (" + px + "pt, " + txtOffset + "pt)   (Node_text" + i + ") {" + identifier.replaceAll("_", "\\_ ") + "};\n";
        
      }
      
      
      i++;
      
    });
    for ( i = 0; i < propElements.length; i++ ) {
      var correspondingProp = propElements[i].property();
      var p_px = propElements[i].x;
      var p_py = -propElements[i].y;
      identifier = correspondingProp.labelForCurrentLanguage();
      if ( identifier === undefined ) identifier = "";
      var textColorStr = "";
      if ( correspondingProp.textBlock && correspondingProp.textBlock() ) {
        var txtColor = correspondingProp.textBlock()._textBlock().style("fill");
        //  console.log("PropertyTextColor="+txtColor);
        if ( txtColor === "rgb(0, 0, 0)" ) {
          textColorStr = ", text=black";
        }
        if ( txtColor === "rgb(255, 255, 255)" ) {
          textColorStr = ", text=white";
        }
        var tspans = correspondingProp.textBlock()._textBlock().node().children;
        
        // identifier=node.textBlock()._textBlock().text();
        // console.log(tspans);
        if ( tspans[0] ) {
          identifier = tspans[0].innerHTML;
          
          for ( var t = 1; t < tspans.length; t++ ) {
            var spanText = tspans[t].innerHTML;
            if ( spanText.indexOf("(") > -1 ) {
              identifier += "\\\\ {\\small " + tspans[t].innerHTML + " }";
            }
            else {
              identifier += "\\\\ " + tspans[t].innerHTML;
            }
          }
        }
        else {
        }
      }
      if ( correspondingProp.type() === "setOperatorProperty" ) {
        continue; // this property does not have a label
      }
      var qType = "owlObjectProperty";
      if ( correspondingProp.type() === "owl:DatatypeProperty" ) {
        qType = "owlDatatypeProperty";
      }
      if ( correspondingProp.type() === "rdfs:subClassOf" ) {
        qType = "rdfsSubClassOf";
      }
      if ( correspondingProp.type() === "rdf:Property" ) {
        qType = "rdfProperty";
      }
      
      
      var bgColorStr = "";
      if ( correspondingProp.backgroundColor() ) {
        // console.log("Found backGround color");
        var bgColor = correspondingProp.backgroundColor();
        //console.log(bgColor);
        bgColor.toUpperCase();
        bgColor = bgColor.slice(1, bgColor.length);
        texString += "\\definecolor{property" + i + "_COLOR}{HTML}{" + bgColor + "} \n ";
        bgColorStr = ", fill=property" + i + "_COLOR ";
      }
      if ( correspondingProp.attributes().indexOf("deprecated") > -1 ) {
        texString += "\\definecolor{property" + i + "_COLOR}{HTML}{CCCCCC} \n ";
        bgColorStr = ", fill=property" + i + "_COLOR ";
      }
      
      var widthString = "";
      var width = correspondingProp.textWidth();
      widthString = ",minimum width=" + width + "pt";
      
      
      // OWL INTERSECTION OF
      if ( correspondingProp.type() === "owl:disjointWith" ) {
        var leftPos = p_px - 12;
        var rightPos = p_px + 12;
        var txtOffset = p_py - 20;
        texString += "\\node[" + qType + " " + widthString + " " + bgColorStr + " " + textColorStr + "] at (" + p_px + "pt, " + p_py + "pt)   (Node" + i + ") {};\n";
        texString += "\\node[disjointWith , text=black] at (" + leftPos + "pt, " + p_py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[disjointWith , text=black] at (" + rightPos + "pt, " + p_py + "pt)   (SymbolNode" + i + ") {};\n";
        texString += "\\node[font={\\fontsize{12pt}{12}\\selectfont \\sffamily }" + textColorStr + "] at (" + p_px + "pt, " + txtOffset + "pt)   (Node_text" + i + ") {";
        if ( graph.options().compactNotation() === false ) {
          texString += "(disjoint)";
        }
        texString += "};\n";
        continue;
      }
      
      
      if ( correspondingProp.inverse() ) {
        var inv_correspondingProp = correspondingProp.inverse();
        // create the rendering element for the inverse property;
        var inv_identifier = inv_correspondingProp.labelForCurrentLanguage();
        if ( inv_identifier === undefined ) inv_identifier = "";
        var inv_textColorStr = "";
        //console.log(inv_correspondingProp);
        //console.log(inv_correspondingProp.textBlock());
        
        if ( inv_correspondingProp.textBlock && inv_correspondingProp.textBlock() ) {
          
          var inv_txtColor = inv_correspondingProp.textBlock()._textBlock().style("fill");
          //  console.log("PropertyTextColor="+inv_txtColor);
          if ( inv_txtColor === "rgb(0, 0, 0)" ) {
            inv_textColorStr = ", text=black";
          }
          if ( inv_txtColor === "rgb(255, 255, 255)" ) {
            inv_textColorStr = ", text=white";
          }
          var inv_tspans = inv_correspondingProp.textBlock()._textBlock().node().children;
          
          // identifier=node.textBlock()._textBlock().text();
          //  console.log(inv_tspans);
          if ( inv_tspans[0] ) {
            inv_identifier = inv_tspans[0].innerHTML;
            
            for ( var inv_t = 1; inv_t < inv_tspans.length; inv_t++ ) {
              var ispanText = inv_tspans[inv_t].innerHTML;
              if ( ispanText.indexOf("(") > -1 ) {
                inv_identifier += "\\\\ {\\small " + inv_tspans[inv_t].innerHTML + " }";
              } else {
                inv_identifier += "\\\\ " + inv_tspans[inv_t].innerHTML;
              }
            }
          }
        }
        var inv_qType = "owlObjectProperty";
        var inv_bgColorStr = "";
        
        if ( inv_correspondingProp.backgroundColor() ) {
          //  console.log("Found backGround color");
          var inv_bgColor = inv_correspondingProp.backgroundColor();
          //   console.log(inv_bgColor);
          inv_bgColor.toUpperCase();
          inv_bgColor = inv_bgColor.slice(1, inv_bgColor.length);
          texString += "\\definecolor{inv_property" + i + "_COLOR}{HTML}{" + inv_bgColor + "} \n ";
          inv_bgColorStr = ", fill=inv_property" + i + "_COLOR ";
        }
        if ( inv_correspondingProp.attributes().indexOf("deprecated") > -1 ) {
          texString += "\\definecolor{inv_property" + i + "_COLOR}{HTML}{CCCCCC} \n ";
          inv_bgColorStr = ", fill=inv_property" + i + "_COLOR ";
        }
        
        var inv_widthString = "";
        var inv_width = inv_correspondingProp.textWidth();
        
        var pOY1 = p_py - 14;
        var pOY2 = p_py + 14;
        inv_widthString = ",minimum width=" + inv_width + "pt";
        texString += "% Createing Inverse Property \n";
        texString += "\\node[" + inv_qType + " " + inv_widthString + " " + inv_bgColorStr + " " + inv_textColorStr + "] at (" + p_px + "pt, " + pOY1 + "pt)   (property" + i + ") {" + inv_identifier.replaceAll("_", "\\_ ") + "};\n";
        texString += "% " + inv_qType + " vs " + qType + "\n";
        texString += "% " + inv_widthString + " vs " + widthString + "\n";
        texString += "% " + inv_bgColorStr + " vs " + bgColorStr + "\n";
        texString += "% " + inv_textColorStr + " vs " + textColorStr + "\n";
        
        texString += "\\node[" + qType + " " + widthString + " " + bgColorStr + " " + textColorStr + "] at (" + p_px + "pt, " + pOY2 + "pt)   (property" + i + ") {" + identifier.replaceAll("_", "\\_ ") + "};\n";
        
      } else {
        texString += "\\node[" + qType + " " + widthString + " " + bgColorStr + " " + textColorStr + "] at (" + p_px + "pt, " + p_py + "pt)   (property" + i + ") {" + identifier.replaceAll("_", "\\_ ") + "};\n";
      }
    }
    
    texString += "\\end{tikzpicture}\n}\n \\end{center}\n";
    
    //   console.log("Tex Output\n"+ texString);
    var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(texString);
    exportTexButton.attr("href", dataURI)
      .attr("download", exportFilename + ".tex");
    
    
  }
  
  function calculateRadian( angle ){
    angle = angle % 360;
    if ( angle < 0 ) {
      angle = angle + 360;
    }
    return (Math.PI * angle) / 180;
  }
  
  function calculateAngle( radian ){
    return radian * (180 / Math.PI);
  }
  
  return exportMenu;
};
