var nodeMap = require("./graph/elements/nodes/nodeMap.js")();
var labelMap = require("./graph/elements/labels/labelMap.js")();


var webvowl = {};
webvowl.graph = require("./graph/graph.js");
webvowl.options = require("./graph/options.js");
webvowl.version = "@@WEBVOWL_VERSION";

webvowl.util = {};
webvowl.util.constants = require("./graph/util/constants.js");
webvowl.util.languageTools = require("./graph/util/languageTools.js");
webvowl.util.elementTools = require("./graph/util/elementTools.js");

webvowl.modules = {};
webvowl.modules.compactNotationSwitch = require("./graph/modules/compactNotationSwitch.js");
webvowl.modules.datatypeFilter = require("./graph/modules/datatypeFilter.js");
webvowl.modules.disjointFilter = require("./graph/modules/disjointFilter.js");
webvowl.modules.focuser = require("./graph/modules/focuser.js");
webvowl.modules.nodeDegreeFilter = require("./graph/modules/nodeDegreeFilter.js");
webvowl.modules.nodeScalingSwitch = require("./graph/modules/nodeScalingSwitch.js");
webvowl.modules.pickAndPin = require("./graph/modules/pickAndPin.js");
webvowl.modules.selectionDetailsDisplayer = require("./graph/modules/selectionDetailsDisplayer.js");
webvowl.modules.setOperatorFilter = require("./graph/modules/setOperatorFilter.js");
webvowl.modules.statistics = require("./graph/modules/statistics.js");
webvowl.modules.subclassFilter = require("./graph/modules/subclassFilter.js");


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
