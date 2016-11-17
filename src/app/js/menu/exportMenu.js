/**
 * Contains the logic for the export button.
 * @returns {{}}
 */
module.exports = function (graph) {

	var exportMenu = {},
		exportSvgButton,
		exportFilename,
		exportJsonButton,
		exportJsonButton2,
		exportableJsonText;


	/**
	 * Adds the export button to the website.
	 */
	exportMenu.setup = function () {
		exportSvgButton = d3.select("#exportSvg")
			.on("click", exportSvg);
		exportJsonButton = d3.select("#exportJson")
			.on("click", exportJson);
		exportJsonButton2 = d3.select("#exportJson2")
		.on("click", exportJson2);
	};

	exportMenu.setFilename = function (filename) {
		exportFilename = filename || "export";
	};

	exportMenu.setJsonText = function (jsonText) {
		exportableJsonText = jsonText;
	};
	exportMenu.setJsonText2 = function (jsonText2) {
		exportableJsonText2 = jsonText2;
	};

	function exportSvg() {
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
	}

	function escapeUnicodeCharacters(text) {
		var textSnippets = [],
			i, textLength = text.length,
			character,
			charCode;

		for (i = 0; i < textLength; i++) {
			character = text.charAt(i);
			charCode = character.charCodeAt(0);

			if (charCode < 128) {
				textSnippets.push(character);
			} else {
				textSnippets.push("&#" + charCode + ";");
			}
		}

		return textSnippets.join("");
	}

	function inlineVowlStyles() {
		setStyleSensitively(".text", [{name: "font-family", value: "Helvetica, Arial, sans-serif"}, {name: "font-size", value: "12px"}]);
		setStyleSensitively(".subtext", [{name: "font-size", value: "9px"}]);
		setStyleSensitively(".text.instance-count", [{name: "fill", value: "#666"}]);
		setStyleSensitively(".external + text .instance-count", [{name: "fill", value: "#aaa"}]);
		setStyleSensitively(".cardinality", [{name: "font-size", value: "10px"}]);
		setStyleSensitively(".text, .embedded", [{name: "pointer-events", value: "none"}]);
		setStyleSensitively(".class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty, .allvaluesfromproperty, .somevaluesfromproperty", [{name: "fill", value: "#acf"}]);
		setStyleSensitively(".label .datatype, .datatypeproperty", [{name: "fill", value: "#9c6"}]);
		setStyleSensitively(".rdf, .rdfproperty", [{name: "fill", value: "#c9c"}]);
		setStyleSensitively(".literal, .node .datatype", [{name: "fill", value: "#fc3"}]);
		setStyleSensitively(".deprecated, .deprecatedproperty", [{name: "fill", value: "#ccc"}]);
		setStyleSensitively(".external, .externalproperty", [{name: "fill", value: "#36c"}]);
		setStyleSensitively("path, .nofill", [{name: "fill", value: "none"}]);
		setStyleSensitively("marker path", [{name: "fill", value: "#000"}]);
		setStyleSensitively(".class, path, line, .fineline", [{name: "stroke", value: "#000"}]);
		setStyleSensitively(".white, .subclass, .subclassproperty, .external + text", [{name: "fill", value: "#fff"}]);
		setStyleSensitively(".class.hovered, .property.hovered, .cardinality.hovered, .cardinality.focused, circle.pin, .filled.hovered, .filled.focused", [{name: "fill", value: "#f00"}, {name: "cursor", value: "pointer"}]);
		setStyleSensitively(".focused, path.hovered", [{name: "stroke", value: "#f00"}]);
		setStyleSensitively(".indirect-highlighting, .feature:hover", [{name: "fill", value: "#f90"}]);
		setStyleSensitively(".values-from", [{name: "stroke", value: "#69c"}]);
		setStyleSensitively(".symbol, .values-from.filled", [{name: "fill", value: "#69c"}]);
		setStyleSensitively(".class, path, line", [{name: "stroke-width", value: "2"}]);
		setStyleSensitively(".fineline", [{name: "stroke-width", value: "1"}]);
		setStyleSensitively(".dashed, .anonymous", [{name: "stroke-dasharray", value: "8"}]);
		setStyleSensitively(".dotted", [{name: "stroke-dasharray", value: "3"}]);
		setStyleSensitively("rect.focused, circle.focused", [{name: "stroke-width", value: "4px"}]);
		setStyleSensitively(".nostroke", [{name: "stroke", value: "none"}]);
		setStyleSensitively("marker path", [{name: "stroke-dasharray", value: "100"}]);
	}

	function setStyleSensitively(selector, styles) {
		var elements = d3.selectAll(selector);
		if (elements.empty()) {
			return;
		}

		styles.forEach(function (style) {
			elements.each(function () {
				var element = d3.select(this);
				if (!shouldntChangeInlineCss(element, style.name)) {
					element.style(style.name, style.value);
				}
			});
		});
	}

	function shouldntChangeInlineCss(element, style) {
		return style === "fill" && hasBackgroundColorSet(element);
	}

	function hasBackgroundColorSet(element) {
		var data = element.datum();
		return data.backgroundColor && !!data.backgroundColor();
	}

	/**
	 * For example the pin of the pick&pin module should be invisible in the exported graphic.
	 */
	function hideNonExportableElements() {
		d3.selectAll(".hidden-in-export").style("display", "none");
	}

	function removeVowlInlineStyles() {
		d3.selectAll(".text, .subtext, .text.instance-count, .external + text .instance-count, .cardinality, .text, .embedded, .class, .object, .disjoint, .objectproperty, .disjointwith, .equivalentproperty, .transitiveproperty, .functionalproperty, .inversefunctionalproperty, .symmetricproperty, .allvaluesfromproperty, .somevaluesfromproperty, .label .datatype, .datatypeproperty, .rdf, .rdfproperty, .literal, .node .datatype, .deprecated, .deprecatedproperty, .external, .externalproperty, path, .nofill, .symbol, .values-from.filled, marker path, .class, path, line, .fineline, .white, .subclass, .subclassproperty, .external + text, .class.hovered, .property.hovered, .cardinality.hovered, .cardinality.focused, circle.pin, .filled.hovered, .filled.focused, .focused, path.hovered, .indirect-highlighting, .feature:hover, .values-from, .class, path, line, .fineline, .dashed, .anonymous, .dotted, rect.focused, circle.focused, .nostroke, marker path")
			.each(function () {
				var element = d3.select(this);

				var inlineStyles = element.node().style;
				for (var styleName in inlineStyles) {
					if (inlineStyles.hasOwnProperty(styleName)) {
						if (shouldntChangeInlineCss(element, styleName)) {
							continue;
						}
						element.style(styleName, null);
					}
				}
			});
	}

	function showNonExportableElements() {
		d3.selectAll(".hidden-in-export").style("display", null);
	}

	function exportJson() {
		if (!exportableJsonText) {
			alert("No graph data available.");
			// Stop the redirection to the path of the href attribute
			d3.event.preventDefault();
			return;
		}

		var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(exportableJsonText);
		exportJsonButton.attr("href", dataURI)
			.attr("download", exportFilename + ".json");
	}
	function exportJson2() {
		if (!exportableJsonText) {
			alert("No graph data available.");
			// Stop the redirection to the path of the href attribute
			d3.event.preventDefault();
			return;
		}

		// todo : refactor getter functions ?!
		var nodeElements = graph.graphNodeElements();
		var propElements = graph.graphLabelElements();



		var jsonObj=JSON.parse(exportableJsonText);
		var comment=jsonObj._comment;
        jsonObj._comment=comment+" [ Additional Information added by WebVOWL Exporter Version:"+"@@WEBVOWL_VERSION"+ "]";

		var classAttribute=jsonObj.classAttribute;
        // todo: [] check if there is a faster way
		nodeElements.each(function (node) {
            var nodeId = node.id();
			for (var i=0;i<classAttribute.length;i++){
                var jObj = classAttribute[i];
				if (jObj.id === nodeId){
					// store relative positions	
					jObj.pos = [ node.x, node.y ];
					break;
				}
			}				
		});

		var propAttribute = jsonObj.propertyAttribute;
        // todo: [] check if there is a faster way
		for (var j=0;j<propElements.length;j++){
			var correspondingProp=propElements[j].property();
			for (var i=0;i<propAttribute.length;i++){
				var jObj = propAttribute[i];
				if (jObj.id === correspondingProp.id()){
					jObj.pos = [ propElements[j].x, propElements[j].y ];
					break;
				}
			}
		}

		/**  Adding pinned flag to nodes and properties  **/
		var pinnedElements=graph.options().pickAndPinModule().getPinnedElements();
		console.log("Number of Pinned Elements",pinnedElements.length);

		for (var i=0;i<pinnedElements.length;i++){
			var pE=pinnedElements[i];
			if (pE.domain){ /** property branch **/
				// pinned element is a property, find its id
				console.log("Pinned Element is Property")
				var elementId=pE.id();
				 console.log("elementId " +elementId);

				// find this now in the propertyAttributes;
				for (var j=0;j<propAttribute.length;j++){
					var jObj = propAttribute[j];
					if (jObj.id === elementId){
						 console.log("found corresponding entry in property Attributes");
						 console.log(jObj.id+" <-> "+elementId);
						jObj.pinned = true;
						break;
					}
				}
				console.log("Done property Element");
			}else{/** class branch **/
			    // pinned element is a class, find its id
                console.log("Pinned Element is Class")
				var elementId=pE.id();
				 console.log("elementId " +elementId);
				// find this now in the propertyAttributes;
				for (var j=0;j<classAttribute.length;j++){
					var jObj = classAttribute[j];
					if (jObj.id === elementId){
						// console.log("found corresponding entry in class Attributes");
						// console.log(jObj.id+" <-> "+elementId);
						jObj.pinned = true;
						break;
					}
				}
				 console.log("Done Class Element");
			}
			// console.log("Iteration :" +i+"/"+pinnedElements.length);
		}




		// todo: [] find the ordering in the jsnon file.
        // todo: [x] store options settings


		//create the variable for settings
        jsonObj.settings={};

        // Global Settings
        var zoom=graph.scaleFactor();
        var paused=graph.paused();
		var translation=graph.translation();
        jsonObj.settings.global={};
        jsonObj.settings.global.zoom=zoom;
		jsonObj.settings.global.translation=translation;
		jsonObj.settings.global.paused=paused;



        // Gravity Settings
        var classDistance=graph.options().classDistance();
        var datatypeDistance=graph.options().datatypeDistance();
        jsonObj.settings.gravity={};
        jsonObj.settings.gravity.classDistance=classDistance;
        jsonObj.settings.gravity.datatypeDistance=datatypeDistance;


        // Filter Settings
        var fMenu = graph.options().filterMenu();
        var container=fMenu.getCheckBoxContainer();
        var cbCont=[];
        for (var q=0;q<container.length;q++){
            var cb_text   = container[q].checkbox.attr("id");
            var isEnabled = container[q].checkbox.property("checked");
            var aBox={};
            aBox.id=cb_text;
            aBox.checked=isEnabled;
            cbCont.push(aBox);
        }
        var degreeSliderVal=fMenu.getDegreeSliderValue();
        jsonObj.settings.filter={};
        jsonObj.settings.filter.checkBox=cbCont;
        jsonObj.settings.filter.degreeSliderValue=degreeSliderVal;


        // Modes Settings
        var mMenu=graph.options().modeMenu();
        var cb_container=mMenu.getCheckBoxContainer();

        var cb_modes=[];
        for (var q=0;q<cb_container.length;q++){
            var cb_text   = cb_container[q].attr("id");
            var isEnabled = cb_container[q].property("checked");
            var aBox={};
            aBox.id=cb_text;
            aBox.checked=isEnabled;
            cb_modes.push(aBox);
        }
        var colorSwitchState=mMenu.colorModeState();
        jsonObj.settings.modes={};
        jsonObj.settings.modes.checkBox=cb_modes;
        jsonObj.settings.modes.colorSwitchState=colorSwitchState;

		var exportObj={};

        // todo: [ ] find better way for ordering the objects
        // //get list of property names;
        //  for (var name in jsonObj ){
        //      console.log("Contains Name:"+ name);
        //  }

        // hack for ordering of objects, so settings is after metrics
        exportObj._comment          = jsonObj._comment;
        exportObj.header            = jsonObj.header;
        exportObj.namespace         = jsonObj.namespace;
        exportObj.metrics           = jsonObj.metrics;
        exportObj.settings          = jsonObj.settings;
        exportObj.class             = jsonObj.class;
        exportObj.classAttribute    = jsonObj.classAttribute;
        exportObj.property          = jsonObj.property;
        exportObj.propertyAttribute = jsonObj.propertyAttribute;



        // // make a string again;
		var exportText=JSON.stringify(exportObj,null,'  ');
		// write the data
		var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(exportText);
		exportJsonButton2.attr("href", dataURI)
			.attr("download", exportFilename + ".json");
	}

	return exportMenu;
};
