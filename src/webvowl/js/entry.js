require("../css/vowl.css");

var nodeMap = require("./elements/nodes/nodeMap")();
var propertyMap = require("./elements/properties/propertyMap")();


var webvowl = {};
webvowl.graph = require("./graph");
webvowl.options = require("./options");
webvowl.version = "@@WEBVOWL_VERSION";

webvowl.util = {};
webvowl.util.constants = require("./util/constants");
webvowl.util.languageTools = require("./util/languageTools");
webvowl.util.elementTools = require("./util/elementTools");
webvowl.util.prefixTools = require("./util/prefixRepresentationModule");
webvowl.modules = {};
webvowl.modules.colorExternalsSwitch = require("./modules/colorExternalsSwitch");
webvowl.modules.compactNotationSwitch = require("./modules/compactNotationSwitch");
webvowl.modules.datatypeFilter = require("./modules/datatypeFilter");
webvowl.modules.disjointFilter = require("./modules/disjointFilter");
webvowl.modules.focuser = require("./modules/focuser");
webvowl.modules.emptyLiteralFilter = require("./modules/emptyLiteralFilter");
webvowl.modules.nodeDegreeFilter = require("./modules/nodeDegreeFilter");
webvowl.modules.nodeScalingSwitch = require("./modules/nodeScalingSwitch");
webvowl.modules.objectPropertyFilter = require("./modules/objectPropertyFilter");
webvowl.modules.pickAndPin = require("./modules/pickAndPin");
webvowl.modules.selectionDetailsDisplayer = require("./modules/selectionDetailsDisplayer");
webvowl.modules.setOperatorFilter = require("./modules/setOperatorFilter");
webvowl.modules.statistics = require("./modules/statistics");
webvowl.modules.subclassFilter = require("./modules/subclassFilter");


webvowl.nodes = {};
nodeMap.entries().forEach(function ( entry ){
  mapEntryToIdentifier(webvowl.nodes, entry);
});

webvowl.properties = {};
propertyMap.entries().forEach(function ( entry ){
  mapEntryToIdentifier(webvowl.properties, entry);
});

function mapEntryToIdentifier( map, entry ){
  var identifier = entry.key.replace(":", "").toLowerCase();
  map[identifier] = entry.value;
}


module.exports = webvowl;
