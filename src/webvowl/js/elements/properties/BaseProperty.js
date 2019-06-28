var BaseElement = require("../BaseElement");
var CenteringTextElement = require("../../util/CenteringTextElement");
var drawTools = require("../drawTools")();
var forceLayoutNodeFunctions = require("../forceLayoutNodeFunctions")();
var rectangularElementTools = require("../rectangularElementTools")();
var math = require("../../util/math")();

module.exports = (function (){
  
  // Static variables
  var labelHeight = 28,
    labelWidth = 80,
    smallestRadius = labelHeight / 2;
  
  
  // Constructor, private variables and privileged methods
  var Base = function ( graph ){
    BaseElement.apply(this, arguments);
    
    var that = this,
      // Basic attributes
      cardinality,
      domain,
      inverse,
      link,
      minCardinality,
      maxCardinality,
      range,
      subproperties,
      superproperties,
      // Style attributes
      linkType = "normal",
      markerType = "filled",
      labelVisible = true,
      // Element containers
      cardinalityElement,
      labelElement,
      linkGroup,
      markerElement,
      // Other
      ignoreLocalHoverEvents,
      fobj,
      pinGroupElement,
      haloGroupElement,
      myWidth = 80,
      defaultWidth = 80,
      shapeElement,
      textElement,
      parent_labelObject,
      backupFullIri,
      
      redundantProperties = [];
    
    
    this.existingPropertyIRI = function ( url ){
      return graph.options().editSidebar().checkForExistingURL(url);
    };
    
    this.getHalos = function (){
      return haloGroupElement;
    };
    
    this.getPin = function (){
      return pinGroupElement;
    };
    this.labelObject = function ( lo, once ){
      if ( !arguments.length ) {
        return parent_labelObject;
      }
      else {
        parent_labelObject = lo;
        if ( that.inverse() && once !== true ) {
          that.inverse().labelObject(lo, true);
        }
        
      }
    };
    this.hide = function ( val ){
      that.labelElement().classed("hidden", val);
      that.linkGroup().classed("hidden", val);
      if ( that.cardinalityElement() )
        that.cardinalityElement().classed("hidden", val);
    };
    
    // Properties
    this.cardinality = function ( p ){
      if ( !arguments.length ) return cardinality;
      cardinality = p;
      return this;
    };
    
    this.cardinalityElement = function ( p ){
      if ( !arguments.length ) return cardinalityElement;
      cardinalityElement = p;
      return this;
    };
    
    this.domain = function ( p ){
      if ( !arguments.length ) return domain;
      domain = p;
      return this;
    };
    
    this.inverse = function ( p ){
      if ( !arguments.length ) return inverse;
      inverse = p;
      return this;
    };
    
    this.labelElement = function ( p ){
      if ( !arguments.length ) return labelElement;
      labelElement = p;
      return this;
    };
    
    this.labelVisible = function ( p ){
      if ( !arguments.length ) return labelVisible;
      labelVisible = p;
      return this;
    };
    
    this.link = function ( p ){
      if ( !arguments.length ) return link;
      link = p;
      return this;
    };
    
    this.linkGroup = function ( p ){
      if ( !arguments.length ) return linkGroup;
      linkGroup = p;
      return this;
    };
    
    this.linkType = function ( p ){
      if ( !arguments.length ) return linkType;
      linkType = p;
      return this;
    };
    
    this.markerElement = function ( p ){
      if ( !arguments.length ) return markerElement;
      markerElement = p;
      return this;
    };
    
    this.markerType = function ( p ){
      if ( !arguments.length ) return markerType;
      markerType = p;
      return this;
    };
    
    this.maxCardinality = function ( p ){
      if ( !arguments.length ) return maxCardinality;
      maxCardinality = p;
      return this;
    };
    
    this.minCardinality = function ( p ){
      if ( !arguments.length ) return minCardinality;
      minCardinality = p;
      return this;
    };
    
    this.range = function ( p ){
      if ( !arguments.length ) return range;
      range = p;
      return this;
    };
    
    this.redundantProperties = function ( p ){
      if ( !arguments.length ) return redundantProperties;
      redundantProperties = p;
      return this;
    };
    
    this.subproperties = function ( p ){
      if ( !arguments.length ) return subproperties;
      subproperties = p;
      return this;
    };
    
    this.superproperties = function ( p ){
      if ( !arguments.length ) return superproperties;
      superproperties = p;
      return this;
    };
    
    
    // Functions
    this.distanceToBorder = function ( dx, dy ){
      return rectangularElementTools.distanceToBorder(that, dx, dy);
    };
    
    this.linkHasMarker = function (){
      return linkType !== "dashed";
    };
    
    this.markerId = function (){
      return "marker" + that.id();
    };
    
    this.toggleFocus = function (){
      that.focused(!that.focused());
      labelElement.select("rect").classed("focused", that.focused());
      graph.resetSearchHighlight();
      graph.options().searchMenu().clearText();
    };
    this.getShapeElement = function (){
      return shapeElement;
    };
    
    this.textBlock = function (){
      return textElement;
    };
    
    this.redrawElement = function (){
      shapeElement.remove();
      textElement.remove();
      
      that.drawLabel(that.labelElement());
      that.animateDynamicLabelWidth(graph.options().dynamicLabelWidth());
      
      
      // shapeElement=this.addRect(that.labelElement());
      //
      // var equivalentsString = that.equivalentsString();
      // var suffixForFollowingEquivalents = equivalentsString ? "," : "";
      //
      // textElement = new CenteringTextElement(labelContainer, this.backgroundColor());
      // textElement.addText(this.labelForCurrentLanguage(), "", suffixForFollowingEquivalents);
      // textElement.addEquivalents(equivalentsString);
      // textElement.addSubText(this.indicationString());
      
    };
    
    // Reused functions TODO refactor
    this.draw = function ( labelGroup ){
      function attachLabel( property ){
        var labelContainer = labelGroup.append("g")
          .datum(property)
          .classed("label", true)
          .attr("id", property.id());
        
        property.drawLabel(labelContainer);
        return labelContainer;
      }
      
      if ( !that.labelVisible() ) {
        return undefined;
      }
      if ( graph.options().dynamicLabelWidth() === true ) myWidth = Math.min(that.getMyWidth(), graph.options().maxLabelWidth());
      else                              myWidth = defaultWidth;
      
      that.labelElement(attachLabel(that));
      // Draw an inverse label and reposition both labels if necessary
      if ( that.inverse() ) {
        var yTransformation = (that.height() / 2) + 1 /* additional space */;
        that.inverse()
          .labelElement(attachLabel(that.inverse()));
        
        that.labelElement()
          .attr("transform", "translate(" + 0 + ",-" + yTransformation + ")");
        that.inverse()
          .labelElement()
          .attr("transform", "translate(" + 0 + "," + yTransformation + ")");
      }
      
      if ( that.pinned() ) {
        that.drawPin();
      } else if ( that.inverse() && that.inverse().pinned() ) {
        that.inverse().drawPin();
      }
      
      if ( that.halo() )
        that.drawHalo(false);
      
      return that.labelElement();
    };
    
    this.addRect = function ( labelContainer ){
      var rect = labelContainer.append("rect")
        .classed(that.styleClass(), true)
        .classed("property", true)
        .attr("x", -that.width() / 2)
        .attr("y", -that.height() / 2)
        .attr("width", that.width())
        .attr("height", that.height())
        .on("mouseover", function (){
          onMouseOver();
        })
        .on("mouseout", function (){
          onMouseOut();
        });
      
      rect.append("title")
        .text(that.labelForCurrentLanguage());
      
      if ( that.visualAttributes() ) {
        rect.classed(that.visualAttributes(), true);
      }
      
      var bgColor = that.backgroundColor();
      
      if ( that.attributes().indexOf("deprecated") > -1 ) {
        bgColor = undefined;
        rect.classed("deprecatedproperty", true);
      } else {
        rect.classed("deprecatedproperty", false);
      }
      rect.style("fill", bgColor);
      
      return rect;
    };
    this.drawLabel = function ( labelContainer ){
      shapeElement = this.addRect(labelContainer);
      
      var equivalentsString = that.equivalentsString();
      var suffixForFollowingEquivalents = equivalentsString ? "," : "";
      
      var bgColor = that.backgroundColor();
      if ( that.attributes().indexOf("deprecated") > -1 ) {
        bgColor = undefined;
      }
      textElement = new CenteringTextElement(labelContainer, bgColor);
      textElement.addText(this.labelForCurrentLanguage(), "", suffixForFollowingEquivalents);
      textElement.addEquivalents(equivalentsString);
      textElement.addSubText(this.indicationString());
    };
    
    this.equivalentsString = function (){
      var equivalentProperties = that.equivalents();
      if ( !equivalentProperties ) {
        return;
      }
      
      return equivalentProperties
        .map(function ( property ){
          if ( property === undefined || typeof(property) === "string" ) { // @WORKAROUND
            return "ERROR";
          }
          return property.labelForCurrentLanguage();
        })
        .join(", ");
    };
    
    this.drawCardinality = function ( container ){
      var cardinalityText = this.generateCardinalityText();
      
      if ( cardinalityText ) {
        that.cardinalityElement(container);
        if ( cardinalityText.indexOf("A") === 0 && cardinalityText.length === 1 ) {
          
          // replacing text elements to svg elements;
          container.classed("cardinality", true)
            .attr("text-anchor", "middle")
            .append("path")
            .classed("cardinality", true)
            .attr("d", "m -8.8832678,-11.303355 -7.97e-4,0 0.717374,1.833297 8.22987151,21.371761 8.66826659,-21.2123526 0.797082,-1.9927054 0.02471,0 -0.8218553,1.9927054 -2.2517565,5.4201577 -12.4444429,8e-6 -2.2019394,-5.5795821 z")
            .style("fill", "none")
            .attr("transform", "matrix(0.5,0,0,0.5,0.5,0.5)");
          return true;
        } else if ( cardinalityText.indexOf("E") === 0 && cardinalityText.length === 1 ) {
          container.classed("cardinality", true)
            .attr("text-anchor", "middle")
            .append("path")
            .classed("cardinality", true)
            .attr("d", "m -5.5788451,-8.0958763 10.8749368,0 0,8.34681523 -9.5707468,0.040132 9.5707468,-0.040132 0,8.42707237 -10.9150654,0")
            .style("fill", "none")
            .attr("transform", "matrix(0.5,0,0,0.5,0.5,0.5)");
          return true;
        }
        else {
          container.append("text")
            .classed("cardinality", true)
            .attr("text-anchor", "middle")
            .attr("dy", "0.5ex")
            .text(cardinalityText);
          return true; // drawing successful
        }
      } else {
        return false;
      }
    };
    
    this.generateCardinalityText = function (){
      if ( that.cardinality() ) {
        return that.cardinality();
      } else if ( that.minCardinality() || that.maxCardinality() ) {
        var minBoundary = that.minCardinality() || "*";
        var maxBoundary = that.maxCardinality() || "*";
        return minBoundary + ".." + maxBoundary;
      }
    };
    
    that.setHighlighting = function ( enable ){
      if ( that.labelElement && that.labelElement() ) {
        that.labelElement().select("rect").classed("hovered", enable);
      }
      that.linkGroup().selectAll("path, text").classed("hovered", enable);
      if ( that.markerElement() ) {
        that.markerElement().select("path").classed("hovered", enable);
        if ( that.cardinalityElement() ) {
          that.cardinalityElement().selectAll("path").classed("hovered-MathSymbol", enable);
          that.cardinalityElement().classed("hovered", enable);
        }
      }
      var subAndSuperProperties = getSubAndSuperProperties();
      subAndSuperProperties.forEach(function ( property ){
        
        if ( property.labelElement && property.labelElement() ) {
          property.labelElement().select("rect")
            .classed("indirect-highlighting", enable);
        }
        
      });
      var inversed = false;
      
      if ( graph.ignoreOtherHoverEvents() === false ) {
        if ( that.inverse() ) {
          inversed = true;
        }
        
        if ( graph.isTouchDevice() === false ) {
          graph.activateHoverElementsForProperties(enable, that, inversed);
        }
        else {
          that.labelElement().select("rect").classed("hovered", false);
          that.linkGroup().selectAll("path, text").classed("hovered", false);
          if ( that.markerElement() ) {
            that.markerElement().select("path").classed("hovered", false);
            if ( that.cardinalityElement() ) {
              that.cardinalityElement().classed("hovered", false);
            }
          }
          graph.activateHoverElementsForProperties(enable, that, inversed, true);
        }
      }
    };
    
    /**
     * Combines the sub- and superproperties into a single array, because
     * they're often used equivalently.
     * @returns {Array}
     */
    function getSubAndSuperProperties(){
      var properties = [];
      
      if ( that.subproperties() ) {
        properties = properties.concat(that.subproperties());
      }
      if ( that.superproperties() ) {
        properties = properties.concat(that.superproperties());
      }
      
      return properties;
    }
    
    /**
     * Foregrounds the property, its inverse and the link.
     */
    this.foreground = function (){
      // check for additional objects that we can highlight
      if ( !that.labelElement() )
        return;
      if ( that.labelElement().node().parentNode === null ) {
        return;
      }
      var selectedLabelGroup = that.labelElement().node().parentNode,
        labelContainer = selectedLabelGroup.parentNode,
        selectedLinkGroup = that.linkGroup().node(),
        linkContainer = that.linkGroup().node().parentNode;
      if ( that.animationProcess() === false ) {
        labelContainer.appendChild(selectedLabelGroup);
      }
      linkContainer.appendChild(selectedLinkGroup);
    };
    
    /**
     * Foregrounds the sub- and superproperties of this property.
     * This is separated from the foreground-function to prevent endless loops.
     */
    function foregroundSubAndSuperProperties(){
      var subAndSuperProperties = getSubAndSuperProperties();
      
      subAndSuperProperties.forEach(function ( property ){
        if ( property.foreground ) property.foreground();
      });
    }
    
    function onMouseOver(){
      if ( that.mouseEntered() || ignoreLocalHoverEvents === true ) {
        return;
      }
      that.mouseEntered(true);
      that.setHighlighting(true);
      that.foreground();
      foregroundSubAndSuperProperties();
    }
    
    function onMouseOut(){
      that.mouseEntered(false);
      that.setHighlighting(false);
    }
    
    this.drawPin = function (){
      that.pinned(true);
      if ( graph.options().dynamicLabelWidth() === true ) myWidth = that.getMyWidth();
      else                              myWidth = defaultWidth;
      
      if ( that.inverse() ) {
        // check which element is rendered on top and add a pin to it
        var tr_that = that.labelElement().attr("transform");
        var tr_inv = that.inverse().labelElement().attr("transform");
        
        var thatY = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(tr_that)[2];
        var invY = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(tr_inv)[2];
        
        if ( thatY < invY )
          pinGroupElement = drawTools.drawPin(that.labelElement(), -0.5 * that.width() + 10, -25, this.removePin, graph.options().showDraggerObject, graph.options().useAccuracyHelper());
        else
          pinGroupElement = drawTools.drawPin(that.inverse().labelElement(), -0.5 * that.inverse().width() + 10, -25, this.removePin, graph.options().showDraggerObject, graph.options().useAccuracyHelper());
        
      }
      else {
        pinGroupElement = drawTools.drawPin(that.labelElement(), -0.5 * that.width() + 10, -25, this.removePin, graph.options().showDraggerObject, graph.options().useAccuracyHelper());
      }
      
      
    };
    
    /**
     * Removes the pin and refreshs the graph to update the force layout.
     */
    this.removePin = function (){
      that.pinned(false);
      if ( pinGroupElement ) {
        pinGroupElement.remove();
      }
      graph.updateStyle();
    };
    
    this.removeHalo = function (){
      that.halo(false);
      if ( haloGroupElement ) {
        haloGroupElement.remove();
        haloGroupElement = null;
      }
    };
    
    this.animationProcess = function (){
      var animRuns = false;
      if ( that.getHalos() ) {
        var haloGr = that.getHalos();
        var haloEls = haloGr.selectAll(".searchResultA");
        animRuns = haloGr.attr("animationRunning");
        
        if ( typeof animRuns !== "boolean" ) {
          // parse this to a boolean value
          animRuns = (animRuns === 'true');
        }
        if ( animRuns === false ) {
          haloEls.classed("searchResultA", false);
          haloEls.classed("searchResultB", true);
        }
      }
      return animRuns;
    };
    
    this.drawHalo = function ( pulseAnimation ){
      that.halo(true);
      var offset = 0;
      if ( that.labelElement() && that.labelElement().node() ) {
        var labelNode = that.labelElement().node();
        var labelContainer = labelNode.parentNode;
        // do this only if animation is not running
        if ( that.animationProcess() === false )
          labelContainer.appendChild(labelNode);
      }
      haloGroupElement = drawTools.drawRectHalo(that, that.width(), that.height(), offset);
      if ( haloGroupElement ) {
        var haloNode = haloGroupElement.node();
        var haloContainer = haloNode.parentNode;
        haloContainer.appendChild(haloNode);
      }
      var selectedNode;
      var nodeContainer;
      if ( that.pinned() ) {
        selectedNode = pinGroupElement.node();
        nodeContainer = selectedNode.parentNode;
        nodeContainer.appendChild(selectedNode);
      }
      if ( that.inverse() && that.inverse().pinned() ) {
        if ( that.inverse().getPin() ) {
          selectedNode = that.inverse().getPin().node();
          nodeContainer = selectedNode.parentNode;
          nodeContainer.appendChild(selectedNode);
        }
      }
      if ( pulseAnimation === false ) {
        var pulseItem = haloGroupElement.selectAll(".searchResultA");
        pulseItem.classed("searchResultA", false);
        pulseItem.classed("searchResultB", true);
        pulseItem.attr("animationRunning", false);
      }
    };
    
    this.getMyWidth = function (){
      var text = that.labelForCurrentLanguage();
      myWidth = measureTextWidth(text, "text") + 20;
      // check for sub names;
      var indicatorText = that.indicationString();
      var indicatorWidth = measureTextWidth(indicatorText, "subtext") + 20;
      if ( indicatorWidth > myWidth )
        myWidth = indicatorWidth;
      
      return myWidth;
    };
    
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
    
    this.textWidth = function (){
      return myWidth;
    };
    this.width = function (){
      return myWidth;
    };
    
    this.animateDynamicLabelWidth = function ( dynamic ){
      that.removeHalo();
      if ( shapeElement === undefined ) {// this handles setOperatorProperties which dont have a shapeElement!
        return;
      }
      
      var h = that.height();
      if ( dynamic === true ) {
        myWidth = Math.min(that.getMyWidth(), graph.options().maxLabelWidth());
        shapeElement.transition().tween("attr", function (){
        })
          .ease('linear')
          .duration(100)
          .attr({ x: -myWidth / 2, y: -h / 2, width: myWidth, height: h })
          .each("end", function (){
            that.updateTextElement();
          });
      } else {
        // Static width for property labels = 80
        myWidth = defaultWidth;
        that.updateTextElement();
        shapeElement.transition().tween("attr", function (){
        })
          .ease('linear')
          .duration(100)
          .attr({ x: -myWidth / 2, y: -h / 2, width: myWidth, height: h });
      }
      if ( that.pinned() === true && pinGroupElement ) {
        var dx = -0.5 * myWidth + 10,
          dy = -25;
        pinGroupElement.transition()
          .tween("attr.translate", function (){
          })
          .attr("transform", "translate(" + dx + "," + dy + ")")
          .ease('linear')
          .duration(100);
      }
    };
    
    this.redrawLabelText = function (){
      textElement.remove();
      that.addTextLabelElement();
      that.animateDynamicLabelWidth(graph.options().dynamicLabelWidth());
      shapeElement.select("title").text(that.labelForCurrentLanguage());
    };
    
    this.addTextLabelElement = function (){
      var labelContainer = that.labelElement();
      
      var equivalentsString = that.equivalentsString();
      var suffixForFollowingEquivalents = equivalentsString ? "," : "";
      
      textElement = new CenteringTextElement(labelContainer, this.backgroundColor());
      textElement.addText(this.labelForCurrentLanguage(), "", suffixForFollowingEquivalents);
      textElement.addEquivalents(equivalentsString);
      textElement.addSubText(this.indicationString());
    };
    
    this.updateTextElement = function (){
      textElement.updateAllTextElements();
    };
    this.enableEditing = function ( autoEditing ){
      if ( autoEditing === false )
        return;
      that.raiseDoubleClickEdit(true);
    };
    
    this.raiseDoubleClickEdit = function ( forceIRISync ){
      d3.selectAll(".foreignelements").remove();
      if ( that.labelElement() === undefined || this.type() === "owl:disjointWith" || this.type() === "rdfs:subClassOf" ) {
        console.log("No Container found");
        return;
      }
      if ( fobj !== undefined ) {
        that.labelElement().selectAll(".foreignelements").remove();
      }
      backupFullIri = undefined;
      graph.options().focuserModule().handle(undefined);
      graph.options().focuserModule().handle(that);
      that.editingTextElement = true;
      ignoreLocalHoverEvents = true;
      that.labelElement().selectAll("rect").classed("hoveredForEditing", true);
      that.frozen(true);
      graph.killDelayedTimer();
      graph.ignoreOtherHoverEvents(false);
      fobj = that.labelElement().append("foreignObject")
        .attr("x", -0.5 * that.textWidth())
        .attr("y", -13)
        .attr("height", 25)
        .attr("class", "foreignelements")
        .on("dragstart", function (){
          return false;
        }) // remove drag operations of text element)
        .attr("width", that.textWidth() - 2);
      // adding a Style to the fObject
      //
      //
      //
      var editText = fobj.append("xhtml:input")
        .attr("class", "nodeEditSpan")
        .attr("id", that.id())
        .attr("align", "center")
        .attr("contentEditable", "true")
        .on("dragstart", function (){
          return false;
        }); // remove drag operations of text element)
      
      var bgColor = '#f00';
      var txtWidth = that.textWidth() - 2;
      editText.style({
        // 'line-height': '30px',
        'align': 'center',
        'color': 'black',
        'width': txtWidth + "px",
        'background-color': bgColor,
        'border-bottom': '2px solid black'
      });
      var txtNode = editText.node();
      txtNode.value = that.labelForCurrentLanguage();
      txtNode.focus();
      txtNode.select();
      if ( d3.event.stopPropagation ) d3.event.stopPropagation();
      if ( d3.event.sourceEvent && d3.event.sourceEvent.stopPropagation ) d3.event.sourceEvent.stopPropagation();
      
      // add some events that relate to this object
      editText.on("click", function (){
        if ( d3.event.stopPropagation ) d3.event.stopPropagation();
        if ( d3.event.sourceEvent && d3.event.sourceEvent.stopPropagation ) d3.event.sourceEvent.stopPropagation();
        
      });
      // // remove hover Events for now;
      editText.on("mouseout", function (){
        if ( d3.event.stopPropagation ) d3.event.stopPropagation();
        if ( d3.event.sourceEvent && d3.event.sourceEvent.stopPropagation ) d3.event.sourceEvent.stopPropagation();
      });
      editText.on("mousedown", function (){
        if ( d3.event.stopPropagation ) d3.event.stopPropagation();
        if ( d3.event.sourceEvent && d3.event.sourceEvent.stopPropagation ) d3.event.sourceEvent.stopPropagation();
      })
        .on("keydown", function (){
          
          if ( d3.event.keyCode === 13 ) {
            this.blur();
            that.frozen(false); // << releases the not after selection
            that.locked(false);
          }
        })
        .on("keyup", function (){
          if ( forceIRISync ) {
            var labelName = editText.node().value;
            var resourceName = labelName.replaceAll(" ", "_");
            var syncedIRI = that.baseIri() + resourceName;
            backupFullIri = syncedIRI;
            
            d3.select("#element_iriEditor").node().title = syncedIRI;
            d3.select("#element_iriEditor").node().value = graph.options().prefixModule().getPrefixRepresentationForFullURI(syncedIRI);
          }
          d3.select("#element_labelEditor").node().value = editText.node().value;
          
        })
        .on("blur", function (){
          
          
          that.editingTextElement = false;
          ignoreLocalHoverEvents = false;
          that.labelElement().selectAll("rect").classed("hoveredForEditing", false);
          var newLabel = editText.node().value;
          that.labelElement().selectAll(".foreignelements").remove();
          // that.setLabelForCurrentLanguage(classNameConvention(editText.node().value));
          that.label(newLabel);
          that.backupLabel(newLabel);
          that.redrawLabelText();
          updateHoverElements(true);
          graph.showHoverElementsAfterAnimation(that, false);
          graph.ignoreOtherHoverEvents(false);
          
          
          that.frozen(graph.paused());
          that.locked(graph.paused());
          that.domain().frozen(graph.paused());
          that.domain().locked(graph.paused());
          that.range().frozen(graph.paused());
          that.range().locked(graph.paused());
          graph.removeEditElements();
          if ( backupFullIri ) {
            // console.log("Checking if element is Identical ?");
            var sanityCheckResult = graph.options().editSidebar().checkProperIriChange(that, backupFullIri);
            if ( sanityCheckResult !== false ) {
              graph.options().warningModule().showWarning("Already seen this property",
                "Input IRI: " + backupFullIri + " for element: " + that.labelForCurrentLanguage() + " already been set",
                "Continuing with duplicate property!", 1, false, sanityCheckResult);
            }
            that.iri(backupFullIri);
          }
          graph.options().focuserModule().handle(undefined);
          graph.options().focuserModule().handle(that);
          graph.updatePropertyDraggerElements(that);
          
          
        });	// add a foreiner element to this thing;
      
    };
    
    // update hover elements
    function updateHoverElements( enable ){
      if ( graph.ignoreOtherHoverEvents() === false ) {
        var inversed = false;
        if ( that.inverse() ) {
          inversed = true;
        }
        if ( enable === true ) {
          graph.activateHoverElementsForProperties(enable, that, inversed);
        }
      }
    }
    
    that.copyInformation = function ( other ){
      that.label(other.label());
      that.iri(other.iri());
      that.baseIri(other.baseIri());
      if ( other.type() === "owl:ObjectProperty" ||
        other.type() === "owl:DatatypeProperty" ) {
        that.backupLabel(other.label());
        // console.log("copied backup label"+that.backupLabel());
      }
      if ( other.backupLabel() !== undefined ) {
        that.backupLabel(other.backupLabel());
      }
    };
    
    forceLayoutNodeFunctions.addTo(this);
  };
  
  Base.prototype = Object.create(BaseElement.prototype);
  Base.prototype.constructor = Base;
  
  Base.prototype.height = function (){
    return labelHeight;
  };
  
  Base.prototype.width = function (){
    return labelWidth;
  };
  
  Base.prototype.actualRadius = function (){
    return smallestRadius;
  };
  
  Base.prototype.textWidth = Base.prototype.width;
  
  
  return Base;
}());
