require("../css/vowl.css");

var nodeMap = require("./elements/nodes/nodeMap.js")();
var labelMap = require("./elements/labels/labelMap.js")();


var webvowl = {};
webvowl.graph = require("./graph.js");
webvowl.options = require("./options.js");
webvowl.version = "@@WEBVOWL_VERSION";

webvowl.util = {};
webvowl.util.constants = require("./util/constants.js");
webvowl.util.languageTools = require("./util/languageTools.js");
webvowl.util.elementTools = require("./util/elementTools.js");

webvowl.modules = {};
webvowl.modules.compactNotationSwitch = require("./modules/compactNotationSwitch.js");
webvowl.modules.datatypeFilter = require("./modules/datatypeFilter.js");
webvowl.modules.disjointFilter = require("./modules/disjointFilter.js");
webvowl.modules.focuser = require("./modules/focuser.js");
webvowl.modules.nodeDegreeFilter = require("./modules/nodeDegreeFilter.js");
webvowl.modules.nodeScalingSwitch = require("./modules/nodeScalingSwitch.js");
webvowl.modules.pickAndPin = require("./modules/pickAndPin.js");
webvowl.modules.selectionDetailsDisplayer = require("./modules/selectionDetailsDisplayer.js");
webvowl.modules.setOperatorFilter = require("./modules/setOperatorFilter.js");
webvowl.modules.statistics = require("./modules/statistics.js");
webvowl.modules.subclassFilter = require("./modules/subclassFilter.js");


webvowl.nodes = {};
nodeMap.entries().forEach(function (entry) {
	mapEntryToIdentifier(webvowl.nodes, entry);
});

webvowl.labels = {};
labelMap.entries().forEach(function (entry) {
	mapEntryToIdentifier(webvowl.labels, entry);
});

function mapEntryToIdentifier(map, entry) {
	var identifier = entry.key.replace(":", "").toLowerCase();
	map[identifier] = entry.value;
}


module.exports = webvowl;
