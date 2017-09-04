var BaseNode = require("./BaseNode");
var CenteringTextElement = require("../../util/CenteringTextElement");
var drawTools = require("../drawTools")();
var rectangularElementTools = require("../rectangularElementTools")();

module.exports = (function () {

	var o = function (graph) {
		BaseNode.apply(this, arguments);

		var that = this,
			height = 20,
			width = 60,
			pinGroupElement,
			haloGroupElement,
            labelWidth = 80,
            myWidth=80,
			smallestRadius = height / 2;

		// Properties
		this.height = function (p) {
			if (!arguments.length) return height;
			height = p;
			return this;
		};

		this.width = function (p) {
			if (!arguments.length) return width;
			width = p;
			return this;
		};

		this.getHalos = function () {
			return haloGroupElement;
		};

		// Functions
		// for compatibility reasons // TODO resolve
		this.actualRadius = function () {
			return smallestRadius;
		};

		this.distanceToBorder = function (dx, dy) {
			return rectangularElementTools.distanceToBorder(that, dx, dy);
		};

		this.setHoverHighlighting = function (enable) {
			that.nodeElement().selectAll("rect").classed("hovered", enable);

			var haloGroup=that.getHalos();
			if (haloGroup){
				var test=haloGroup.selectAll(".searchResultA");
				test.classed("searchResultA", false);
				test.classed("searchResultB", true);
			}

		};

        this.textWidth = function () {
            //
            if(graph.options().dynamicLabelWidth()===true) {
                return that.getMyWidth();
            }
            return labelWidth;
        };
        this.width= function(){
            if(graph.options().dynamicLabelWidth()===true){
                return that.getMyWidth();
            }
            return labelWidth;
        };

        this.getMyWidth=function(){
            // use a simple heuristic
            var text = that.labelForCurrentLanguage();
            myWidth =measureTextWidth(text,"text")+20;

            // check for sub names;
            var indicatorText=that.indicationString();
            var indicatorWidth=measureTextWidth(indicatorText,"subtext")+20;
            if (indicatorWidth>myWidth)
                myWidth=indicatorWidth;

            return myWidth;
        };

		this.textWidth = function () {
            return that.width();
		};
        function measureTextWidth(text, textStyle) {
            // Set a default value
            if (!textStyle) {
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

		this.toggleFocus = function () {
			that.focused(!that.focused());
			that.nodeElement().select("rect").classed("focused", that.focused());
			graph.resetSearchHighlight();
			graph.options().searchMenu().clearText();
		};

		/**
		 * Draws the rectangular node.
		 * @param parentElement the element to which this node will be appended
		 * @param [additionalCssClasses] additional css classes
		 */
		this.draw = function (parentElement, additionalCssClasses) {
			var textBlock,
				cssClasses = that.collectCssClasses();

			that.nodeElement(parentElement);

			if (additionalCssClasses instanceof Array) {
				cssClasses = cssClasses.concat(additionalCssClasses);
			}
            drawTools.appendRectangularClass(parentElement, that.width(), that.height(), cssClasses, that.labelForCurrentLanguage(), that.backgroundColor());

			textBlock = new CenteringTextElement(parentElement, that.backgroundColor());
			textBlock.addText(that.labelForCurrentLanguage());

			that.addMouseListeners();

			if (that.pinned()) {
				that.drawPin();
			}
			if (that.halo()) {
				that.drawHalo();
			}
		};

		this.drawPin = function () {
			that.pinned(true);

			var dx = 0.25 * width,
				dy = -1.1 * height;

			pinGroupElement = drawTools.drawPin(that.nodeElement(), dx, dy, this.removePin);
		};

		this.removePin = function () {
			that.pinned(false);
			if (pinGroupElement) {
				pinGroupElement.remove();
			}
			graph.updateStyle();
		};

		this.removeHalo = function () {
			that.halo(false);
			if (haloGroupElement) {
				haloGroupElement.remove();
				haloGroupElement=null;
			}
		};

		this.drawHalo = function () {
			that.halo(true);

			var offset = 0;
			haloGroupElement = drawTools.drawRectHalo(that, this.width(), this.height(), offset);


            if (that.pinned()){
                var selectedNode = pinGroupElement.node();
                var nodeContainer = selectedNode.parentNode;
                nodeContainer .appendChild(selectedNode);
            }

		};
	};
	o.prototype = Object.create(BaseNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
