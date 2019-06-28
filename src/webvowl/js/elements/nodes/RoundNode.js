var BaseNode = require("./BaseNode");
var CenteringTextElement = require("../../util/CenteringTextElement");
var drawTools = require("../drawTools")();

module.exports = (function (){
  
  var o = function ( graph ){
    BaseNode.apply(this, arguments);
    
    var that = this,
      collapsible = false,
      radius = 50,
      collapsingGroupElement,
      pinGroupElement,
      haloGroupElement = null,
      rectangularRepresentation = false,
      renderingElement,
      textBlock;
    
    this.setRectangularRepresentation = function ( val ){
      rectangularRepresentation = val;
    };
    this.getRectangularRepresentation = function (){
      return rectangularRepresentation;
    };
    
    this.getHalos = function (){
      return haloGroupElement;
    };
    
    // Properties
    this.collapsible = function ( p ){
      if ( !arguments.length ) return collapsible;
      collapsible = p;
      return this;
    };
    
    this.textBlock = function ( p ){
      if ( !arguments.length ) return textBlock;
      textBlock = p;
      return this;
    };
    
    /**
     * This might not be equal to the actual radius, because the instance count is used for its calculation.
     * @param p
     * @returns {*}
     */
    this.radius = function ( p ){
      if ( !arguments.length ) return radius;
      radius = p;
      return this;
    };
    
    
    // Functions
    this.setHoverHighlighting = function ( enable ){
      that.nodeElement().selectAll("circle").classed("hovered", enable);
    };
    
    this.textWidth = function ( yOffset ){
      var availableWidth = this.actualRadius() * 2;
      
      // if the text is not placed in the center of the circle, it can't have the full width
      if ( yOffset ) {
        var relativeOffset = Math.abs(yOffset) / this.actualRadius();
        var isOffsetInsideOfNode = relativeOffset <= 1;
        
        if ( isOffsetInsideOfNode ) {
          availableWidth = Math.cos(relativeOffset) * availableWidth;
        } else {
          availableWidth = 0;
        }
      }
      
      return availableWidth;
    };
    
    this.toggleFocus = function (){
      that.focused(!that.focused());
      if ( that.nodeElement() )
        that.nodeElement().select("circle").classed("focused", that.focused());
      graph.resetSearchHighlight();
      graph.options().searchMenu().clearText();
      
    };
    
    this.actualRadius = function (){
      if ( !graph.options().scaleNodesByIndividuals() || that.individuals().length <= 0 ) {
        return that.radius();
      } else {
        // we could "listen" for radius and maxIndividualCount changes, but this is easier
        var MULTIPLIER = 8,
          additionalRadius = Math.log(that.individuals().length + 1) * MULTIPLIER + 5;
        
        return that.radius() + additionalRadius;
      }
    };
    
    this.distanceToBorder = function (){
      return that.actualRadius();
    };
    
    this.removeHalo = function (){
      if ( that.halo() ) {
        that.halo(false);
        if ( haloGroupElement ) {
          haloGroupElement.remove();
        }
      }
    };
    
    this.drawHalo = function ( pulseAnimation ){
      that.halo(true);
      if ( rectangularRepresentation === true ) {
        haloGroupElement = drawTools.drawRectHalo(that.nodeElement(), 80, 80, 5);
      } else {
        haloGroupElement = drawTools.drawHalo(that.nodeElement(), that.actualRadius(), this.removeHalo);
      }
      if ( pulseAnimation === false ) {
        var pulseItem = haloGroupElement.selectAll(".searchResultA");
        pulseItem.classed("searchResultA", false);
        pulseItem.classed("searchResultB", true);
        pulseItem.attr("animationRunning", false);
      }
    };
    
    /**
     * Draws the pin on a round node on a position depending on its radius.
     */
    this.drawPin = function (){
      that.pinned(true);
      var dx = (-3.5 / 5) * that.actualRadius(),
        dy = (-7 / 10) * that.actualRadius();
      pinGroupElement = drawTools.drawPin(that.nodeElement(), dx, dy, this.removePin, graph.options().showDraggerObject, graph.options().useAccuracyHelper());
      
      
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
    
    this.drawCollapsingButton = function (){
      
      collapsingGroupElement = that.nodeElement()
        .append("g")
        .classed("hidden-in-export", true)
        .attr("transform", function (){
          var dx = (-2 / 5) * that.actualRadius(),
            dy = (1 / 2) * that.actualRadius();
          return "translate(" + dx + "," + dy + ")";
        });
      
      collapsingGroupElement.append("rect")
        .classed("class pin feature", true)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 40)
        .attr("height", 24);
      
      collapsingGroupElement.append("line")
        .attr("x1", 13)
        .attr("y1", 12)
        .attr("x2", 27)
        .attr("y2", 12);
      
      collapsingGroupElement.append("line")
        .attr("x1", 20)
        .attr("y1", 6)
        .attr("x2", 20)
        .attr("y2", 18);
    };
    
    /**
     * Draws a circular node.
     * @param parentElement the element to which this node will be appended
     * @param [additionalCssClasses] additional css classes
     */
    this.draw = function ( parentElement, additionalCssClasses ){
      var cssClasses = that.collectCssClasses();
      that.nodeElement(parentElement);
      
      var bgColor = that.backgroundColor();
      if ( bgColor === null ) bgColor = undefined;
      if ( that.attributes().indexOf("deprecated") > -1 ) {
        bgColor = undefined;
      }
      if ( additionalCssClasses instanceof Array ) {
        cssClasses = cssClasses.concat(additionalCssClasses);
      }
      if ( rectangularRepresentation === true ) {
        renderingElement = drawTools.appendRectangularClass(parentElement, 80, 80, cssClasses, that.labelForCurrentLanguage(), bgColor);
      } else {
        renderingElement = drawTools.appendCircularClass(parentElement, that.actualRadius(), cssClasses, that.labelForCurrentLanguage(), bgColor);
      }
      that.postDrawActions(parentElement);
    };
    
    this.redrawElement = function (){
      renderingElement.remove();
      textBlock.remove();
      var bgColor = that.backgroundColor();
      if ( that.attributes().indexOf("deprecated") > -1 ) {
        bgColor = undefined;
      }
      
      var cssClasses = that.collectCssClasses();
      
      if ( rectangularRepresentation === true ) {
        renderingElement = drawTools.appendRectangularClass(that.nodeElement(), 80, 80, cssClasses, that.labelForCurrentLanguage(), bgColor);
      } else {
        renderingElement = drawTools.appendCircularClass(that.nodeElement(), that.actualRadius(), cssClasses, that.labelForCurrentLanguage(), bgColor);
      }
      that.postDrawActions(that.nodeElement());
    };
    /**
     * Common actions that should be invoked after drawing a node.
     */
    this.postDrawActions = function (){
      that.textBlock(createTextBlock());
      
      that.addMouseListeners();
      if ( that.pinned() ) {
        that.drawPin();
      }
      if ( that.halo() ) {
        that.drawHalo(false);
      }
      if ( that.collapsible() ) {
        that.drawCollapsingButton();
      }
    };
    
    this.redrawLabelText = function (){
      that.textBlock().remove();
      that.textBlock(createTextBlock());
      renderingElement.select("title").text(that.labelForCurrentLanguage());
    };
    function createTextBlock(){
      var bgColor = that.backgroundColor();
      if ( that.attributes().indexOf("deprecated") > -1 )
        bgColor = undefined;
      
      var textBlock = new CenteringTextElement(that.nodeElement(), bgColor);
      
      var equivalentsString = that.equivalentsString();
      var suffixForFollowingEquivalents = equivalentsString ? "," : "";
      
      textBlock.addText(that.labelForCurrentLanguage(), "", suffixForFollowingEquivalents);
      textBlock.addEquivalents(equivalentsString);
      if ( !graph.options().compactNotation() ) {
        textBlock.addSubText(that.indicationString());
      }
      textBlock.addInstanceCount(that.individuals().length);
      
      return textBlock;
    }
    
    this.equivalentsString = function (){
      var equivalentClasses = that.equivalents();
      if ( !equivalentClasses ) {
        return;
      }
      
      return equivalentClasses
        .map(function ( node ){
          return node.labelForCurrentLanguage();
        })
        .join(", ");
    };
  };
  o.prototype = Object.create(BaseNode.prototype);
  o.prototype.constructor = o;
  
  return o;
}());
