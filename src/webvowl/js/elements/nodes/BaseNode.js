var BaseElement = require("../BaseElement");
var forceLayoutNodeFunctions = require("../forceLayoutNodeFunctions")();

module.exports = (function () {

	var Base = function (graph) {
		BaseElement.apply(this, arguments);

		var that = this,
		// Basic attributes
			complement,
			disjointUnion,
			disjointWith,
			individuals = [],
			intersection,
			union,
			links,
            rendertype="round",
		// Additional attributes
			maxIndividualCount,
            fobj, // foreigner object for editing
		// Element containers
			nodeElement;
        that.editingTextElement=false;


        this.copyInformation=function(other){
            console.log(other.labelForCurrentLanguage());
            that.label(other.label());
            that.complement(other.complement());
            that.iri(other.iri());
            that.baseIri(other.baseIri());
        };

        this.enableEditing=function(autoEditing){
        	if (autoEditing===false)  return;
        	else that.raiseDoubleClickEdit(true);
		};

        this.raiseDoubleClickEdit=function(forceIRISync){
            console.log("executing node doubleClick >> EDITING LABEL "+that.labelForCurrentLanguage());
            d3.selectAll(".foreignelements").remove();
            if (nodeElement===undefined || this.type()==="owl:Thing" || this.type()==="rdfs:Literal") {
                 console.log("No Container found");
                 return;
            }
            if (fobj!=undefined){
                 nodeElement.selectAll(".foreignelements").remove();
            }

            that.editingTextElement=true;
            that.nodeElement().selectAll("circle").classed("hoveredForEditing", true);
			that.frozen(true);
            graph.killDelayedTimer();
            graph.ignoreOtherHoverEvents(true);
            fobj= nodeElement.append("foreignObject")
                 .attr("x",-0.5*that.textWidth())
                 .attr("y",-13)
                 .attr("height", 30)
                 .attr("class","foreignelements")
                 .on("dragstart",function(){return false;}) // remove drag operations of text element)
                 .attr("width", that.textWidth()-2);
            // adding a Style to the fObject
            //
            //
            //
            var editText=fobj.append("xhtml:input")
                 .attr("class","nodeEditSpan")
                 .attr("id", that.id())
                 .attr("align","center")
                 .attr("contentEditable", "true")
                 .on("dragstart",function(){
                     return false;
                 }); // remove drag operations of text element)

            var bgColor='#f00';
            var txtWidth=that.textWidth();
            console.log("Have TXT WIDTH"+txtWidth);
            editText.style({
                 // 'line-height': '30px',
                 'align': 'center',
                 'color': 'black',
				 'width': txtWidth+"px",
                 'background-color': bgColor,
                 'border-bottom': '2px solid black'
             });
             var  txtNode=editText.node();
             txtNode.value=that.labelForCurrentLanguage();
             txtNode.focus();
             txtNode.select();
			 d3.event.stopPropagation();

            // d3.event.stopPropagation();
            // ignoreNodeHoverEvent=true;
            // // add some events that relate to this object
            editText.on("click", function(){
                 d3.event.stopPropagation();
            });
            // // remove hover Events for now;
            editText.on("mouseout",function(){
                console.log("hovered Out of the input Field");
                d3.event.stopPropagation();

            });
            editText.on("mousedown", function(){
                d3.event.stopPropagation();
            })
                .on("keydown", function(){
                    d3.event.stopPropagation();
                    if (d3.event.keyCode ===13){
                        this.blur();
                        that.frozen(false); // << releases the not after selection
						that.locked(false);
                    }
                })
				.on("keyup",function(){
                    if (forceIRISync){
                    	var labelName=editText.node().value;
                    	var resourceName=labelName.replace(" ","_");
                        var syncedIRI=that.baseIri()+resourceName;
                        that.iri(syncedIRI);
                        d3.select("#element_iriEditor").node().value=syncedIRI;
                    }
                    d3.select("#element_labelEditor").node().value=editText.node().value;

                })
                .on("blur", function(){
                    console.log("CALLING BLUR FUNCTION ----------------------"+d3.event);
                    that.nodeElement().selectAll("circle").classed("hoveredForEditing", false);
                    var newLabel=editText.node().value;
                    nodeElement.selectAll(".foreignelements").remove();
                    // that.setLabelForCurrentLanguage(classNameConvention(editText.node().value));
                    that.label(newLabel);
                    that.redrawLabelText();
                    graph.ignoreOtherHoverEvents(false);
                    graph.options().focuserModule().handle(undefined);
                    graph.options().focuserModule().handle(that);
            	});	// add a foreiner element to this thing;

        };


        this.renderType=function(t){
            if (!arguments.length) return rendertype;
            rendertype = t;
            return this;
        };
		// Properties
		this.complement = function (p) {
			if (!arguments.length) return complement;
			complement = p;
			return this;
		};

		this.disjointUnion = function (p) {
			if (!arguments.length) return disjointUnion;
			disjointUnion = p;
			return this;
		};

		this.disjointWith = function (p) {
			if (!arguments.length) return disjointWith;
			disjointWith = p;
			return this;
		};

		this.individuals = function (p) {
			if (!arguments.length) return individuals;
			individuals = p || [];
			return this;
		};

		this.intersection = function (p) {
			if (!arguments.length) return intersection;
			intersection = p;
			return this;
		};

		this.links = function (p) {
			if (!arguments.length) return links;
			links = p;
			return this;
		};

		this.maxIndividualCount = function (p) {
			if (!arguments.length) return maxIndividualCount;
			maxIndividualCount = p;
			return this;
		};

		this.nodeElement = function (p) {
			if (!arguments.length) return nodeElement;
			nodeElement = p;
			return this;
		};

		this.union = function (p) {
			if (!arguments.length) return union;
			union = p;
			return this;
		};


		/**
		 * Returns css classes generated from the data of this object.
		 * @returns {Array}
		 */
		that.collectCssClasses = function () {
			var cssClasses = [];

			if (typeof that.styleClass() === "string") {
				cssClasses.push(that.styleClass());
			}

			cssClasses = cssClasses.concat(that.visualAttributes());

			return cssClasses;
		};


		// Reused functions TODO refactor
		this.addMouseListeners = function () {
			// Empty node
			if (!that.nodeElement()) {
				console.warn(this);
				return;
			}

			that.nodeElement().selectAll("*")
				.on("mouseover", onMouseOver)
				.on("mouseout", onMouseOut);
		};

		this.animationProcess=function(){
            var animRuns=false;
            if (that.getHalos()) {
                var haloGr=that.getHalos();
                var haloEls= haloGr.selectAll(".searchResultA");
                animRuns=haloGr.attr("animationRunning");
                if (typeof animRuns !== "boolean") {
                    // parse this to a boolean value
                    animRuns = (animRuns === 'true');
                }
                if (animRuns===false) {
                    haloEls.classed("searchResultA", false);
                    haloEls.classed("searchResultB", true);
                }
            }
            return animRuns;
        };

		this.foreground = function(){
			var selectedNode = that.nodeElement().node(),
				nodeContainer = selectedNode.parentNode;
				// check if the halo is present and an animation is running
            if (that.animationProcess()===false) {
                // Append hovered element as last child to the container list.
                nodeContainer.appendChild(selectedNode);
            }

		};

		function onMouseOver() {
			if (that.mouseEntered()) {
				return;
			}

			var selectedNode = that.nodeElement().node(),
				nodeContainer = selectedNode.parentNode;

			// Append hovered element as last child to the container list.
            if (that.animationProcess()===false) {
                nodeContainer.appendChild(selectedNode);
            }

			that.setHoverHighlighting(true);
			that.mouseEntered(true);

            if (graph.editorMode()===true &&graph.ignoreOtherHoverEvents()===false) {
                graph.activateHoverElements(true, that);
            }
		}

		function onMouseOut() {
			that.setHoverHighlighting(false);
			that.mouseEntered(false);
            if (graph.editorMode()===true && graph.ignoreOtherHoverEvents()===false) {
                graph.activateHoverElements(false);
            }
		}


		forceLayoutNodeFunctions.addTo(this);
	};

	Base.prototype = Object.create(BaseElement.prototype);
	Base.prototype.constructor = Base;


	return Base;
}());
