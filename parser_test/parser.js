export const OWLParser = (() => {

const Mime = Object.freeze({
  UNKOWN      : 0,
  TRIG        : 1,
  N_QUADS     : 2,
  TURTLE      : 3,
  N_TRIPLES   : 4,
  N3          : 5,
  JSON        : 6,
  JSON_LD     : 7,
  RDF         : 8,
  HTML        : 9,
  XHTML_XML   : 10,
  XML         : 11,
  SVG         : 12,
  SHACLC      : 13,
  SHACLC_EXT  : 14
});

const MimeMap = Object.freeze({
  "application/trig"         :  Mime.TRIG,
  "application/n-quads"      :  Mime.N_QUADS,
  "text/turtle"              :  Mime.TURTLE,
  "application/n-triples"    :  Mime.N_TRIPLES,
  "text/n3"                  :  Mime.N3,
  "application/json"         :  Mime.JSON,
  "application/ld+json"      :  Mime.JSON_LD,
  "application/rdf+xml"      :  Mime.RDF,
  "text/html"                :  Mime.HTML,
  "application/xhtml+xml"    :  Mime.XHTML_XML,
  "application/xml"          :  Mime.XML,
  "image/svg+xml"            :  Mime.SVG,
  "text/shaclc"              :  Mime.SHACLC,
  "text/shaclc-ext"          :  Mime.SHACLC_EXT
});

const MimeType = (() => {
  var keys = [];
  keys.push("");
  for(var key in MimeMap) keys.push(key);
  return Object.freeze(keys);
})();

const MimeExt = Object.freeze([
            ["trig"],
            ["nq", "nquads"],
            ["ttl", "turtle"],
            ["nt", "ntriples"],
            ["n3"],
            ["json"],
            ["jsonld"],
            ["rdf", "rdfxml", "owl"],
            ["html", "htm"],
            ["xhtml", "xht"],
            ["xml"],
            ["svg", "svgz"],
            ["shaclc", "shc"],
            ["shaclce", "shce"]
          ]);

const MimeExtMap = (() => {
  var map = {};
  var idx = 1;
  for(const items of MimeExt) {
    for(const ext of items) {
      map[ext] = MimeType[idx];
    }
    idx += 1;
  }
  return Object.freeze(map);
})();


const Namespace = Object.freeze({
  UNKNOWN  : 0,
  BLANK    : 1,
  OWL      : 2,
  RDFS     : 3,
  RDF      : 4,
  XSD      : 5,
  XML      : 6,
  SWRL     : 7,
  SWRLB    : 8,
  SKOS     : 9,
  TIME     : 10,
  GRDDL    : 11,
  MA       : 12,
  PROV     : 13,
  RDFA     : 14,
  RIF      : 15,
  R2RML    : 16,
  SD       : 17,
  SKOSXL   : 18,
  POWDER   : 19,
  VOID     : 20,
  POWDERS  : 21,
  XHV      : 22,
  ORG      : 23,
  GLDP     : 24,
  CNT      : 25,
  DCAT     : 26,
  EARL     : 27,
  HT       : 28,
  PTR      : 29,
  CC       : 30,
  CTAG     : 31,
  DCTERMS  : 32,
  DC       : 33,
  FOAF     : 34,
  GR       : 35,
  ICAL     : 36,
  OG       : 37,
  REV      : 38,
  SIOC     : 39,
  VCARD    : 40,
  SCHEMA   : 41,
  GEO      : 42,
  SC       : 43,
  DBPEDIA  : 44,
  DBP      : 45,
  DBO      : 46,
  YAGO     : 47
});

const NamespaceMap = Object.freeze({
  "http://internal/blank"                                     : Namespace.BLANK,
  "http://www.w3.org/2002/07/owl"                             : Namespace.OWL,
  "http://www.w3.org/2000/01/rdf-schema"                      : Namespace.RDFS,
  "http://www.w3.org/1999/02/22-rdf-syntax-ns"                : Namespace.RDF,
  "http://www.w3.org/2001/XMLSchema"                          : Namespace.XSD,
  "http://www.w3.org/XML/1998/namespace"                      : Namespace.XML,
  "http://www.w3.org/2003/11/swrl"                            : Namespace.SWRL,
  "http://www.w3.org/2003/11/swrlb"                           : Namespace.SWRLB,
  "http://www.w3.org/2004/02/skos/core"                       : Namespace.SKOS,
  "http://www.w3.org/2006/time"                               : Namespace.TIME,
  "http://www.w3.org/2003/g/data-view"                        : Namespace.GRDDL,
  "http://www.w3.org/ns/ma-ont"                               : Namespace.MA,
  "http://www.w3.org/ns/prov"                                 : Namespace.PROV,
  "http://www.w3.org/ns/rdfa"                                 : Namespace.RDFA,
  "http://www.w3.org/2007/rif"                                : Namespace.RIF,
  "http://www.w3.org/ns/r2rml"                                : Namespace.R2RML,
  "http://www.w3.org/ns/sparql-service-description"           : Namespace.SD,
  "http://www.w3.org/2008/05/skos-xl"                         : Namespace.SKOSXL,
  "http://www.w3.org/2007/05/powder"                          : Namespace.POWDER,
  "http://rdfs.org/ns/void"                                   : Namespace.VOID,
  "http://www.w3.org/2007/05/powder-s"                        : Namespace.POWDERS,
  "http://www.w3.org/1999/xhtml/vocab"                        : Namespace.XHV,
  "http://www.w3.org/ns/org"                                  : Namespace.ORG,
  "http://www.w3.org/ns/people"                               : Namespace.GLDP,
  "http://www.w3.org/2008/content"                            : Namespace.CNT,
  "http://www.w3.org/ns/dcat"                                 : Namespace.DCAT,
  "http://www.w3.org/ns/earl"                                 : Namespace.EARL,
  "http://www.w3.org/2006/http"                               : Namespace.HT,
  "http://www.w3.org/2009/pointers"                           : Namespace.PTR,
  "http://creativecommons.org/ns"                             : Namespace.CC,
  "http://commontag.org/ns"                                   : Namespace.CTAG,
  "http://purl.org/dc/terms/"                                 : Namespace.DCTERMS,
  "http://purl.org/dc/elements/1.1/"                          : Namespace.DC,
  "http://xmlns.com/foaf/0.1/"                                : Namespace.FOAF,
  "http://purl.org/goodrelations/v1"                          : Namespace.GR,
  "http://www.w3.org/2002/12/cal/icaltzd"                     : Namespace.ICAL,
  "http://ogp.me/ns"                                          : Namespace.OG,
  "http://purl.org/stuff/rev"                                 : Namespace.REV,
  "http://rdfs.org/sioc/ns"                                   : Namespace.SIOC,
  "http://www.w3.org/2006/vcard/ns"                           : Namespace.VCARD,
  "http://schema.org/"                                        : Namespace.SCHEMA,
  "http://www.w3.org/2003/01/geo/wgs84_pos"                   : Namespace.GEO,
  "http://purl.org/science/owl/sciencecommons/"               : Namespace.SC,
  "http://dbpedia.org/resource/"                              : Namespace.DBPEDIA,
  "http://dbpedia.org/property/"                              : Namespace.DBP,
  "http://dbpedia.org/ontology/"                              : Namespace.DBO,
  "http://dbpedia.org/class/yago/"                            : Namespace.YAGO
});

const NamespaceKey = (() => {
  var keys = [];
  for(const key in Namespace) keys.push(key.toLowerCase());
  return Object.freeze(keys);
})();

const NamespaceType = (() => {
  var keys = [];
  keys.push("");
  for(const key in NamespaceMap) keys.push(key);
  return Object.freeze(keys);
})();

const NamespaceBlank = NamespaceType[Namespace.BLANK];

const NamespaceIgnore = (() => {
  const values = [Namespace.OWL,
                  Namespace.RDF,
                  Namespace.RDFS,
                  Namespace.SWRL,
                  Namespace.SWRLB,
                  Namespace.XML,
                  Namespace.XSD];
  var map = {};
  var idx = 1;
  for(const it of values) {
      map[NamespaceType[it]] = idx;
      idx += 1;
  }
  return Object.freeze(map);
})();

const Pred = Object.freeze({
    UNKNOWN: 0,
    TYPE:1,
    DEPRECATED:2,
    VERSION_INFO:3,
    COMMENT:4,
    LABEL:5,
    SEE_ALSO:6,
    IS_DEFINED_BY:7,
    MEMBER:8,
    ANNOTATED_PROPERTY:9,
    ANNOTATED_SOURCE:10,
    ANNOTATED_TARGET:11,
    MEMBERS:12,
    SUB_CLASS_OF:13,
    EQUIVALENT_CLASS:14,
    INTERSECTION_OF:15,
    ONE_OF:16,
    UNION_OF:17,
    DATATYPE_COMPLEMENT_OF:18,
    ON_DATATYPE:19,
    WITH_RESTRICTIONS:20,
    DISTINCT_MEMBERS:21,
    COMPLEMENT_OF:22,
    DISJOINT_UNION_OF:23,
    DISJOINT_WITH:24,
    HAS_KEY:25,
    ASSERTION_PROPERTY:26,
    SOURCE_INDIVIDUAL:27,
    TARGET_INDIVIDUAL:28,
    TARGET_VALUE:29,
    INVERSE_OF:30,
    PROPERTY_CHAIN_AXIOM:31,
    BACKWARD_COMPATIBLE_WITH:32,
    IMPORTS:33,
    INCOMPATIBLE_WITH:34,
    PRIOR_VERSION:35,
    VERSION_I_R_I:36,
    ALL_VALUES_FROM:37,
    CARDINALITY:38,
    HAS_SELF:39,
    HAS_VALUE:40,
    MAX_CARDINALITY:41,
    MAX_QUALIFIED_CARDINALITY:42,
    MIN_CARDINALITY:43,
    MIN_QUALIFIED_CARDINALITY:44,
    ON_CLASS:45,
    ON_DATA_RANGE:46,
    ON_PROPERTIES:47,
    ON_PROPERTY:48,
    QUALIFIED_CARDINALITY:49,
    SOME_VALUES_FROM:50,
    BOTTOM_DATA_PROPERTY:51,
    BOTTOM_OBJECT_PROPERTY:52,
    TOP_DATA_PROPERTY:53,
    TOP_OBJECT_PROPERTY:54,
    DIFFERENT_FROM:55,
    SAME_AS:56,
    SUB_PROPERTY_OF:57,
    DOMAIN:58,
    RANGE:59,
    EQUIVALENT_PROPERTY:60,
    PROPERTY_DISJOINT_WITH:61,

});

const PredMap = Object.freeze({
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": Pred.TYPE,
    "http://www.w3.org/2002/07/owl#deprecated": Pred.DEPRECATED,
    "http://www.w3.org/2002/07/owl#versionInfo": Pred.VERSION_INFO,
    "http://www.w3.org/2000/01/rdf-schema#comment": Pred.COMMENT,
    "http://www.w3.org/2000/01/rdf-schema#label": Pred.LABEL,
    "http://www.w3.org/2000/01/rdf-schema#seeAlso": Pred.SEE_ALSO,
    "http://www.w3.org/2000/01/rdf-schema#isDefinedBy": Pred.IS_DEFINED_BY,
    "http://www.w3.org/2000/01/rdf-schema#member": Pred.MEMBER,
    "http://www.w3.org/2002/07/owl#annotatedProperty": Pred.ANNOTATED_PROPERTY,
    "http://www.w3.org/2002/07/owl#annotatedSource": Pred.ANNOTATED_SOURCE,
    "http://www.w3.org/2002/07/owl#annotatedTarget": Pred.ANNOTATED_TARGET,
    "http://www.w3.org/2002/07/owl#members": Pred.MEMBERS,
    "http://www.w3.org/2000/01/rdf-schema#subClassOf": Pred.SUB_CLASS_OF,
    "http://www.w3.org/2002/07/owl#equivalentClass": Pred.EQUIVALENT_CLASS,
    "http://www.w3.org/2002/07/owl#intersectionOf": Pred.INTERSECTION_OF,
    "http://www.w3.org/2002/07/owl#oneOf": Pred.ONE_OF,
    "http://www.w3.org/2002/07/owl#unionOf": Pred.UNION_OF,
    "http://www.w3.org/2002/07/owl#datatypeComplementOf": Pred.DATATYPE_COMPLEMENT_OF,
    "http://www.w3.org/2002/07/owl#onDatatype": Pred.ON_DATATYPE,
    "http://www.w3.org/2002/07/owl#withRestrictions": Pred.WITH_RESTRICTIONS,
    "http://www.w3.org/2002/07/owl#distinctMembers": Pred.DISTINCT_MEMBERS,
    "http://www.w3.org/2002/07/owl#complementOf": Pred.COMPLEMENT_OF,
    "http://www.w3.org/2002/07/owl#disjointUnionOf": Pred.DISJOINT_UNION_OF,
    "http://www.w3.org/2002/07/owl#disjointWith": Pred.DISJOINT_WITH,
    "http://www.w3.org/2002/07/owl#hasKey": Pred.HAS_KEY,
    "http://www.w3.org/2002/07/owl#assertionProperty": Pred.ASSERTION_PROPERTY,
    "http://www.w3.org/2002/07/owl#sourceIndividual": Pred.SOURCE_INDIVIDUAL,
    "http://www.w3.org/2002/07/owl#targetIndividual": Pred.TARGET_INDIVIDUAL,
    "http://www.w3.org/2002/07/owl#targetValue": Pred.TARGET_VALUE,
    "http://www.w3.org/2002/07/owl#inverseOf": Pred.INVERSE_OF,
    "http://www.w3.org/2002/07/owl#propertyChainAxiom": Pred.PROPERTY_CHAIN_AXIOM,
    "http://www.w3.org/2002/07/owl#backwardCompatibleWith": Pred.BACKWARD_COMPATIBLE_WITH,
    "http://www.w3.org/2002/07/owl#imports": Pred.IMPORTS,
    "http://www.w3.org/2002/07/owl#incompatibleWith": Pred.INCOMPATIBLE_WITH,
    "http://www.w3.org/2002/07/owl#priorVersion": Pred.PRIOR_VERSION,
    "http://www.w3.org/2002/07/owl#versionIRI": Pred.VERSION_I_R_I,
    "http://www.w3.org/2002/07/owl#allValuesFrom": Pred.ALL_VALUES_FROM,
    "http://www.w3.org/2002/07/owl#cardinality": Pred.CARDINALITY,
    "http://www.w3.org/2002/07/owl#hasSelf": Pred.HAS_SELF,
    "http://www.w3.org/2002/07/owl#hasValue": Pred.HAS_VALUE,
    "http://www.w3.org/2002/07/owl#maxCardinality": Pred.MAX_CARDINALITY,
    "http://www.w3.org/2002/07/owl#maxQualifiedCardinality": Pred.MAX_QUALIFIED_CARDINALITY,
    "http://www.w3.org/2002/07/owl#minCardinality": Pred.MIN_CARDINALITY,
    "http://www.w3.org/2002/07/owl#minQualifiedCardinality": Pred.MIN_QUALIFIED_CARDINALITY,
    "http://www.w3.org/2002/07/owl#onClass": Pred.ON_CLASS,
    "http://www.w3.org/2002/07/owl#onDataRange": Pred.ON_DATA_RANGE,
    "http://www.w3.org/2002/07/owl#onProperties": Pred.ON_PROPERTIES,
    "http://www.w3.org/2002/07/owl#onProperty": Pred.ON_PROPERTY,
    "http://www.w3.org/2002/07/owl#qualifiedCardinality": Pred.QUALIFIED_CARDINALITY,
    "http://www.w3.org/2002/07/owl#someValuesFrom": Pred.SOME_VALUES_FROM,
    "http://www.w3.org/2002/07/owl#bottomDataProperty": Pred.BOTTOM_DATA_PROPERTY,
    "http://www.w3.org/2002/07/owl#bottomObjectProperty": Pred.BOTTOM_OBJECT_PROPERTY,
    "http://www.w3.org/2002/07/owl#topDataProperty": Pred.TOP_DATA_PROPERTY,
    "http://www.w3.org/2002/07/owl#topObjectProperty": Pred.TOP_OBJECT_PROPERTY,
    "http://www.w3.org/2002/07/owl#differentFrom": Pred.DIFFERENT_FROM,
    "http://www.w3.org/2002/07/owl#sameAs": Pred.SAME_AS,
    "http://www.w3.org/2000/01/rdf-schema#subPropertyOf": Pred.SUB_PROPERTY_OF,
    "http://www.w3.org/2000/01/rdf-schema#domain": Pred.DOMAIN,
    "http://www.w3.org/2000/01/rdf-schema#range": Pred.RANGE,
    "http://www.w3.org/2002/07/owl#equivalentProperty": Pred.EQUIVALENT_PROPERTY,
    "http://www.w3.org/2002/07/owl#propertyDisjointWith": Pred.PROPERTY_DISJOINT_WITH,

});

const PredKey = (() => {
  var keys = [];
  keys.push("");
  for(const key in PredMap) keys.push(key);
  return Object.freeze(keys);
})();

const PredCount = Object.getOwnPropertyNames(Pred).length;


const Obj = Object.freeze({
    UNKNOWN: 0,
    RDFS_Resource:1,
    RDFS_Class:2,
    RDFS_Literal:3,
    RDFS_Container:4,
    RDFS_ContainerMembershipProperty:5,
    RDFS_Datatype:6,
    OWL_AllDifferent:7,
    OWL_AllDisjointClasses:8,
    OWL_AllDisjointProperties:9,
    OWL_Annotation:10,
    OWL_AnnotationProperty:11,
    OWL_AsymmetricProperty:12,
    OWL_Axiom:13,
    OWL_Class:14,
    OWL_DataRange:15,
    OWL_DatatypeProperty:16,
    OWL_DeprecatedClass:17,
    OWL_DeprecatedProperty:18,
    OWL_FunctionalProperty:19,
    OWL_InverseFunctionalProperty:20,
    OWL_IrreflexiveProperty:21,
    OWL_NamedIndividual:22,
    OWL_NegativePropertyAssertion:23,
    OWL_ObjectProperty:24,
    OWL_Ontology:25,
    OWL_OntologyProperty:26,
    OWL_ReflexiveProperty:27,
    OWL_Restriction:28,
    OWL_SymmetricProperty:29,
    OWL_TransitiveProperty:30,
    OWL_Nothing:31,
    OWL_Thing:32,
    OWL_BackwardCompatibleWith:33,
    OWL_BottomDataProperty:34,
    OWL_BottomObjectProperty:35,
    OWL_Deprecated:36,
    OWL_Imports:37,
    OWL_IncompatibleWith:38,
    OWL_PriorVersion:39,
    OWL_TopDataProperty:40,
    OWL_TopObjectProperty:41,
    OWL_VersionInfo:42,
    OWL_VersionIRI:43,
    RDF_Property:44,

});

const ObjMap = Object.freeze({
    "http://www.w3.org/2000/01/rdf-schema#Resource":Obj.RDFS_Resource,
    "http://www.w3.org/2000/01/rdf-schema#Class":Obj.RDFS_Class,
    "http://www.w3.org/2000/01/rdf-schema#Literal":Obj.RDFS_Literal,
    "http://www.w3.org/2000/01/rdf-schema#Container":Obj.RDFS_Container,
    "http://www.w3.org/2000/01/rdf-schema#ContainerMembershipProperty":Obj.RDFS_ContainerMembershipProperty,
    "http://www.w3.org/2000/01/rdf-schema#Datatype":Obj.RDFS_Datatype,
    "http://www.w3.org/2002/07/owl#AllDifferent":Obj.OWL_AllDifferent,
    "http://www.w3.org/2002/07/owl#AllDisjointClasses":Obj.OWL_AllDisjointClasses,
    "http://www.w3.org/2002/07/owl#AllDisjointProperties":Obj.OWL_AllDisjointProperties,
    "http://www.w3.org/2002/07/owl#Annotation":Obj.OWL_Annotation,
    "http://www.w3.org/2002/07/owl#AnnotationProperty":Obj.OWL_AnnotationProperty,
    "http://www.w3.org/2002/07/owl#AsymmetricProperty":Obj.OWL_AsymmetricProperty,
    "http://www.w3.org/2002/07/owl#Axiom":Obj.OWL_Axiom,
    "http://www.w3.org/2002/07/owl#Class":Obj.OWL_Class,
    "http://www.w3.org/2002/07/owl#DataRange":Obj.OWL_DataRange,
    "http://www.w3.org/2002/07/owl#DatatypeProperty":Obj.OWL_DatatypeProperty,
    "http://www.w3.org/2002/07/owl#DeprecatedClass":Obj.OWL_DeprecatedClass,
    "http://www.w3.org/2002/07/owl#DeprecatedProperty":Obj.OWL_DeprecatedProperty,
    "http://www.w3.org/2002/07/owl#FunctionalProperty":Obj.OWL_FunctionalProperty,
    "http://www.w3.org/2002/07/owl#InverseFunctionalProperty":Obj.OWL_InverseFunctionalProperty,
    "http://www.w3.org/2002/07/owl#IrreflexiveProperty":Obj.OWL_IrreflexiveProperty,
    "http://www.w3.org/2002/07/owl#NamedIndividual":Obj.OWL_NamedIndividual,
    "http://www.w3.org/2002/07/owl#NegativePropertyAssertion":Obj.OWL_NegativePropertyAssertion,
    "http://www.w3.org/2002/07/owl#ObjectProperty":Obj.OWL_ObjectProperty,
    "http://www.w3.org/2002/07/owl#Ontology":Obj.OWL_Ontology,
    "http://www.w3.org/2002/07/owl#OntologyProperty":Obj.OWL_OntologyProperty,
    "http://www.w3.org/2002/07/owl#ReflexiveProperty":Obj.OWL_ReflexiveProperty,
    "http://www.w3.org/2002/07/owl#Restriction":Obj.OWL_Restriction,
    "http://www.w3.org/2002/07/owl#SymmetricProperty":Obj.OWL_SymmetricProperty,
    "http://www.w3.org/2002/07/owl#TransitiveProperty":Obj.OWL_TransitiveProperty,
    "http://www.w3.org/2002/07/owl#Nothing":Obj.OWL_Nothing,
    "http://www.w3.org/2002/07/owl#Thing":Obj.OWL_Thing,
    "http://www.w3.org/2002/07/owl#backwardCompatibleWith":Obj.OWL_BackwardCompatibleWith,
    "http://www.w3.org/2002/07/owl#bottomDataProperty":Obj.OWL_BottomDataProperty,
    "http://www.w3.org/2002/07/owl#bottomObjectProperty":Obj.OWL_BottomObjectProperty,
    "http://www.w3.org/2002/07/owl#deprecated":Obj.OWL_Deprecated,
    "http://www.w3.org/2002/07/owl#imports":Obj.OWL_Imports,
    "http://www.w3.org/2002/07/owl#incompatibleWith":Obj.OWL_IncompatibleWith,
    "http://www.w3.org/2002/07/owl#priorVersion":Obj.OWL_PriorVersion,
    "http://www.w3.org/2002/07/owl#topDataProperty":Obj.OWL_TopDataProperty,
    "http://www.w3.org/2002/07/owl#topObjectProperty":Obj.OWL_TopObjectProperty,
    "http://www.w3.org/2002/07/owl#versionInfo":Obj.OWL_VersionInfo,
    "http://www.w3.org/2002/07/owl#versionIRI":Obj.OWL_VersionIRI,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property":Obj.RDF_Property,

});

const ObjKey = (() => {
  var keys = [];
  keys.push("")
  for(const key in ObjMap) keys.push(key);
  return Object.freeze(keys);
})();

const Attr = Object.freeze({
  OBJECT             : 0,
  DATATYPE           : 1,
  ANONYMOUS          : 2,
  EXTERNAL           : 3,
  EQUIVALENT         : 4,
  FUNCTIONAL         : 5,
  INVERSE_FUNCTIONAL : 6,
  UNION              : 7,
  SYMMETRIC          : 8,
  TRANSITIVE         : 9,
  DEPRECATED         : 10,
  KEY                : 11,
  DISJOINT_UNION     : 12,
  REFLEXIVE          : 12
});

const AttrNames = (() => {
  var keys = [];
  for(var key in Attr) keys.push(key.toLowerCase().replace("_", " "));
  return Object.freeze(keys);
})();

const TypeMap = Object.freeze([BigInt(0),
    BigInt(0x6),
    BigInt(0x6),
    BigInt(0xe),
    BigInt(0x16),
    BigInt("0x100000000026"),
    BigInt(0x46),
    BigInt(0x86),
    BigInt(0x106),
    BigInt(0x206),
    BigInt(0x406),
    BigInt("0x100000000806"),
    BigInt("0x100001001006"),
    BigInt(0x2006),
    BigInt(0x4006),
    BigInt(0x8046),
    BigInt("0x100000010006"),
    BigInt(0x20006),
    BigInt("0x100000040006"),
    BigInt("0x100000080006"),
    BigInt("0x100001100006"),
    BigInt("0x100001200006"),
    BigInt("0x100404006"),
    BigInt(0x800006),
    BigInt("0x100001000006"),
    BigInt(0x2000006),
    BigInt("0x100004000006"),
    BigInt("0x100009000006"),
    BigInt(0x10004006),
    BigInt("0x100021000006"),
    BigInt("0x100041000006"),
    BigInt("0x180004006"),
    BigInt("0x100004006"),
    BigInt("0x100204000806"),
    BigInt("0x100400010006"),
    BigInt("0x100801000006"),
    BigInt("0x101000000806"),
    BigInt("0x102004000006"),
    BigInt("0x104004000806"),
    BigInt("0x108004000806"),
    BigInt("0x110000010006"),
    BigInt("0x120001000006"),
    BigInt("0x140000000806"),
    BigInt("0x180004000006"),
    BigInt("0x100000000006"),

]);

const TypePropMap = Object.freeze([BigInt(0),
    BigInt(0x1),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x2),
    BigInt(0x4),
    BigInt(0x4),
    BigInt(0x4),
    BigInt(0x4),
    BigInt(0x4),
    BigInt(0x40),
    BigInt(0x40),
    BigInt(0x40),
    BigInt(0x80),
    BigInt(0x4000),
    BigInt(0x4000),
    BigInt(0x4000),
    BigInt(0x4000),
    BigInt(0x800000),
    BigInt(0x800000),
    BigInt(0x800000),
    BigInt(0x800000),
    BigInt(0x1000000),
    BigInt(0x1000000),
    BigInt(0x2000000),
    BigInt(0x2000000),
    BigInt(0x2000000),
    BigInt(0x2000000),
    BigInt(0x2000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt(0x10000000),
    BigInt("0x100000000"),
    BigInt("0x100000000"),
    BigInt("0x100000000"),
    BigInt("0x100000000"),
    BigInt("0x100000000"),
    BigInt("0x100000000"),
    BigInt("0x100000000000"),
    BigInt("0x100000000000"),
    BigInt("0x100000000000"),
    BigInt("0x100000000000"),
    BigInt("0x100000000000"),

]);

const ObjClassType = (() => {
  var keys = [];
  keys.push("");
  for(const key in ObjMap) {
    var id = ObjMap[key];
    //  TODO
    keys.push(extractType(ObjKey[id]));
  }
  return Object.freeze(keys);
})();

const SKOS = Object.freeze({
  "altLabel":Obj.OWL_AnnotationProperty,
  "changeNote":Obj.OWL_AnnotationProperty,
  "definition":Obj.OWL_AnnotationProperty,
  "editorialNote":Obj.OWL_AnnotationProperty,
  "example":Obj.OWL_AnnotationProperty,
  "hiddenLabel":Obj.OWL_AnnotationProperty,
  "historyNote":Obj.OWL_AnnotationProperty,
  "note":Obj.OWL_AnnotationProperty,
  "prefLabel":Obj.OWL_AnnotationProperty,
  "scopeNote":Obj.OWL_AnnotationProperty,
  "broadMatch":Obj.OWL_ObjectProperty,
  "broader":Obj.OWL_ObjectProperty,
  "broaderTransitive":Obj.OWL_ObjectProperty,
  "closeMatch":Obj.OWL_ObjectProperty,
  "exactMatch":Obj.OWL_ObjectProperty,
  "hasTopConcept":Obj.OWL_ObjectProperty,
  "inScheme":Obj.OWL_ObjectProperty,
  "mappingRelation":Obj.OWL_ObjectProperty,
  "member":Obj.OWL_ObjectProperty,
  "memberList":Obj.OWL_ObjectProperty,
  "narrowMatch":Obj.OWL_ObjectProperty,
  "narrower":Obj.OWL_ObjectProperty,
  "narrowTransitive":Obj.OWL_ObjectProperty,
  "related":Obj.OWL_ObjectProperty,
  "relatedMatch":Obj.OWL_ObjectProperty,
  "semanticRelation":Obj.OWL_ObjectProperty,
  "topConceptOf":Obj.OWL_ObjectProperty,
  "Collection":Obj.OWL_Class,
  "Concept":Obj.OWL_Class,
  "ConceptScheme":Obj.OWL_Class,
  "OrderedCollection":Obj.OWL_Class,
  "TopConcept":Obj.OWL_Class,
});

const XSD = Object.freeze({
  "anyType":Obj.RDFS_Datatype,
  "anySimpleType":Obj.RDFS_Datatype,
  "string":Obj.RDFS_Datatype,
  "integer":Obj.RDFS_Datatype,
  "long":Obj.RDFS_Datatype,
  "int":Obj.RDFS_Datatype,
  "short":Obj.RDFS_Datatype,
  "byte":Obj.RDFS_Datatype,
  "decimal":Obj.RDFS_Datatype,
  "float":Obj.RDFS_Datatype,
  "boolean":Obj.RDFS_Datatype,
  "double":Obj.RDFS_Datatype,
  "nonPositiveInteger":Obj.RDFS_Datatype,
  "negativeInteger":Obj.RDFS_Datatype,
  "nonNegativeInteger":Obj.RDFS_Datatype,
  "unsignedLong":Obj.RDFS_Datatype,
  "unsignedInt":Obj.RDFS_Datatype,
  "positiveInteger":Obj.RDFS_Datatype,
  "base64Binary":Obj.RDFS_Datatype,
  "normalizedString":Obj.RDFS_Datatype,
  "hexBinary":Obj.RDFS_Datatype,
  "anyURI":Obj.RDFS_Datatype,
  "QName":Obj.RDFS_Datatype,
  "NOTATION":Obj.RDFS_Datatype,
  "token":Obj.RDFS_Datatype,
  "language":Obj.RDFS_Datatype,
  "Name":Obj.RDFS_Datatype,
  "NCName":Obj.RDFS_Datatype,
  "NMTOKEN":Obj.RDFS_Datatype,
  "NMTOKENS":Obj.RDFS_Datatype,
  "ID":Obj.RDFS_Datatype,
  "IDREF":Obj.RDFS_Datatype,
  "IDREFS":Obj.RDFS_Datatype,
  "ENTITY":Obj.RDFS_Datatype,
  "ENTITIES":Obj.RDFS_Datatype,
  "duration":Obj.RDFS_Datatype,
  "dateTime":Obj.RDFS_Datatype,
  "dateTimeStamp":Obj.RDFS_Datatype,
  "time":Obj.RDFS_Datatype,
  "date":Obj.RDFS_Datatype,
  "gYearMonth":Obj.RDFS_Datatype,
  "gYear":Obj.RDFS_Datatype,
  "gMonthYear":Obj.RDFS_Datatype,
  "gDay":Obj.RDFS_Datatype,
  "gMonth":Obj.RDFS_Datatype,
  "unsignedShort":Obj.RDFS_Datatype,
  "unsignedByte":Obj.RDFS_Datatype,
});

const InternalNS = Object.freeze({
  "http://www.w3.org/2001/XMLSchema"                          : XSD,
  "http://www.w3.org/2004/02/skos/core"                       : SKOS,
});

const InvalidEntity = Object.freeze({_invalid:true});

function isPropertyType(ty) {
  const type = TypeMap[ty];
  const mask = BigInt(1) << BigInt(Obj.RDF_Property);
  return (type & mask) != BigInt(0);
}


function splitNS(v) {
  const url = new URL(v);
  const h = url.hash != "";
  const ns = v.substr(0, h ? v.length - url.hash.length : v.lastIndexOf("/") + 1);
  let r = {ns:ns, v:v.substr(ns.length + h)};
  if(v.endsWith("/")) {
    let ns = r.ns.slice(0, -1); ;
    r.ns = ns.substr(0, ns.lastIndexOf("/"));
    r.v = "";
  }
  return r;
}

function extractType(v) {
  var e = splitNS(v);
  if(isPropertyType(ObjMap[v] || 0)) {
    e.v = e.v[0].toLowerCase() + e.v.slice(1);
  }
  return NamespaceKey[NamespaceMap[e.ns]] + ":" + e.v;
}

var _parse = null;

var Materializer = null;

 class Impl {

    isProperty(obj_val) {
      return ObjMap[obj_val] == Obj.RDF_Property;
    }

    isOntology(obj_val) {
      return ObjMap[obj_val] == Obj.OWL_Ontology;
    }

    isTopDataProperty(obj_val) {
      return ObjMap[obj_val] == Obj.OWL_TopDataProperty;
    }

    isNeededInternal(obj_val) {
      const id = ObjMap[obj_val];
      return id == Obj.OWL_TopDataProperty ||
             id == Obj.OWL_BottomDataProperty ||
             id == Obj.OWL_TopObjectProperty ||
             id == Obj.OWL_BottomObjectProperty;
    }

    isThing(obj_val) {
      return ObjMap[obj_val] == Obj.OWL_Thing;
    }

    isLiteral(obj_val) {
      return ObjMap[obj_val] == Obj.RDFS_Literal;
    }

    isAnnotation(obj_val) {
      return ObjMap[obj_val] == Obj.OWL_AnnotationProperty;
    }

    isUnionOf(pred_val) {
      return PredMap[obj_val] == Pred.UNION_OF;
    }

    isExternal(ns) {
      return ns != this.tmp.cleanBaseIri;
    }

    isInternalNS(ns) {
      const id = NamespaceMap[ns];
      return id == Namespace.XSD ||
            id == Namespace.XML;

      /*id == Namespace.OWL ||
            id == Namespace.RDFS ||
            id == Namespace.RDF ||
            */
    }

    hasPropertyType(types) {
      if(types === undefined)
        return false;
      const mask = BigInt(1) << BigInt(Obj.RDF_Property);
      return (types & mask) != BigInt(0);
    }

    hasType(types, ty) {
      if(types === undefined)
        return false;
      const mask = BigInt(1) << BigInt(ty);
      return (types & mask) != BigInt(0);
    }

    hasClassType(types) {
      return this.hasType(types, Obj.RDFS_Class);
    }

    cleanIri(iri) {
      if(iri.endsWith("/") || iri.endsWith("#"))
        return iri.slice(0, -1);
      return iri;
    }

    getValue(item) {
      if(item.termType == "BlankNode")
        return NamespaceBlank + "#" + item.value;
      return item.value;
    }

    isBlank(item) {
      return item.termType == "BlankNode";
    }

    isNamed(item) {
      return item.termType == "NamedNode" || item.termType == "BlankNode";
    }

    addEntity(item) {
      const iri = this.getValue(item);
      let orig = this.tmp.entityMap[iri];
      if(orig)
        return orig;
      let entity = {iri:iri,_pending:true};
      if(this.isBlank(item))
        entity._blank = true;
      this.tmp.entityMap[iri] = entity;
      return entity;
    }

    addProp(entity, key, value) {
      let property = entity._property || (entity._property = {});
      let orig = property[key];
      if(orig === undefined) {
        property[key] = value;
        return;
      }
      if(!Array.isArray(orig))
        orig = property[key] = [orig];
      orig.push(value);
    }

    setType(entity, ty) {
      const knownType = ObjMap[ty];
      if(knownType == Obj.OWL_NamedIndividual) {
        entity._individual = true;
        return;
      }
      this.addTypeAttr(entity, knownType);

      if(knownType == Obj.OWL_Ontology) {
        entity._ontology = true;
        entity._individual = true;
      }

      if(knownType !== undefined) {
        if(entity._type === undefined)
          entity._type = BigInt(0);
        entity._type |= TypeMap[knownType];
      }

      if(knownType == Obj.OWL_AnnotationProperty)
        this.makeAnnotation(entity);
    }

    getBaseType(type) {
      const chain = this.Inherit[type];
      if(chain.indexOf(Obj.OWL_Class) != -1)
        return Obj.OWL_Class;
      return chain[chain.length - 1];
    }

    handleData(data) {
      let annot = [];
      for(const item of data) {
        for(const s of item.stmts) {
            var kind = PredMap[s.predicate.value] ?? 0;

            if(kind == Pred.UNKNOWN || !this.isNamed(s.subject)) {
              let pred = this.addEntity(s.predicate);
              this.insertAnnotation(pred, s);
              this.makeAnnotation(pred);
              if(pred._type === undefined) {
                let e = splitNS(pred.iri);
                if(NamespaceMap[e.ns] == Namespace.DCTERMS || NamespaceMap[e.ns] == Namespace.DC)
                  this.setType(pred, ObjKey[Obj.OWL_AnnotationProperty]);
              }
              continue;
            }

            let subj = this.addEntity(s.subject);
            if(kind == Pred.EQUIVALENT_CLASS || kind == Pred.DOMAIN || kind == Pred.RANGE) {
              let obj = this.addEntity(s.object);
              this.setType(obj, ObjKey[Obj.RDFS_Class]);
            }
            if(kind == Pred.SUB_PROPERTY_OF) {
              let obj = this.addEntity(s.object);
              this.setType(obj, ObjKey[Obj.RDF_Property]);
            }

            if(kind == Pred.UNION_OF) {
              const el = s.object.elements;
              for(const e of el) {
                let obj = this.addEntity(e);
                this.setType(obj, ObjKey[Obj.RDFS_Class]);
              }
            }

            if(kind == Pred.TYPE) {
              const iri = this.getValue(s.object);
              if(subj._individual && !ObjMap[iri])
                subj._indiv_target = s.object;
              this.setType(subj, iri);
            } else {
              this.addProp(subj, kind, s.object);
            }
        }

        for(const ns in item.ns) {
            this.tmp.ns[ns] = item.ns[ns];
        }
      }

      for(let a of this.tmp.annot) {
        if(a._type == TypeMap[Obj.OWL_AnnotationProperty]) {
          if(a._annotate) {
            for(let s of a._annotate) {
              let subj = this.addEntity(s.subject);
              let e = splitNS(a.iri);
              this.addAnnotation(subj, e.v, s.object);
            }
          }
        } else {
          delete a._annotate;
          delete a._annotation;
          if(!a._blank && a._type)
              this.materializeEntity(a);
        }
      }
    }

    handlePrefixList() {
      let list = this.header.prefixList = {};

      list[NamespaceKey[Namespace.OWL]] = NamespaceType[Namespace.OWL] + "#";
      list[NamespaceKey[Namespace.RDFS]] = NamespaceType[Namespace.RDFS] + "#";
      list[NamespaceKey[Namespace.RDF]] = NamespaceType[Namespace.RDF] + "#";
      list[NamespaceKey[Namespace.XSD]] = NamespaceType[Namespace.XSD] + "#";
      list[NamespaceKey[Namespace.XML]] = NamespaceType[Namespace.XML];

      for(var ns in this.tmp.ns) {
        list[ns] = this.tmp.ns[ns];
      }
    }

    handleLanguages() {
      let list = this.header.languages = [];
      for(var lang in this.tmp.lang) {
        list.push(lang);
      }
      if(list.length > 1)
        this.tmp.baseIris[NamespaceType[Namespace.RDF]] = 1;
    }

    handleBaseIris() {
      let list = this.header.baseIris = [];

      const string = NamespaceType[Namespace.XSD] + "#string";
      this.tmp.baseIris[this.cleanIri(splitNS(string).ns)] = 1;

      for(var iri in this.tmp.baseIris) {
        list.push(iri);
      }
    }

    getType(entity) {
      var ty = entity._type;
      if(ty === undefined)
        ty = TypeMap[ObjMap[entity.iri] || Obj.OWL_Class];
      if(ty & (BigInt(1) << BigInt(Obj.OWL_DatatypeProperty)))
        return ObjClassType[Obj.OWL_DatatypeProperty];
      if(ty & (BigInt(1) << BigInt(Obj.OWL_ObjectProperty)))
        return ObjClassType[Obj.OWL_ObjectProperty];
      if(ty & (BigInt(1) << BigInt(Obj.RDFS_Literal)))
        return ObjClassType[Obj.RDFS_Literal];
      if(ty & (BigInt(1) << BigInt(Obj.RDFS_Datatype)))
        return ObjClassType[Obj.RDFS_Datatype];
      if(ty & (BigInt(1) << BigInt(Obj.OWL_Thing)))
        return ObjClassType[Obj.OWL_Thing];
      if(ty & (BigInt(1) << BigInt(Obj.OWL_Class)))
        return ObjClassType[Obj.OWL_Class];
      if(ty & (BigInt(1) << BigInt(Obj.RDFS_Class)))
        return ObjClassType[Obj.OWL_Class];       // OK?
      throw new Error("misisng type");
    }

    getEntityType(entity) {
      var ty = BigInt(0);
      if(entity.superClasses) {
        for(const s of entity.superClasses) {
          ty |= this.getEntityType(this.classAttribute[s]);
        }
      }

      if(entity._type !== undefined) {
        ty |= entity._type;
      } else {
        const o = ObjMap[entity.iri];
        if(o !== undefined)
          ty |= TypeMap[o];
      }

      return ty;
    }

    addLang(data) {
      const lang = data.language || "undefined";
      this.tmp.lang[lang] = 1;
      return lang;
    }

    addLangData(entity, key, data) {
      let target = entity[key] || (entity[key] = {});
      target[this.addLang(data)] = this.getValue(data);
    }

    addAttrStr(attr, vstr) {
      let a = attr.attributes || (attr.attributes = []);
      if(!vstr) return;
      if(a.indexOf(vstr) == -1) a.push(vstr);
    }

    addAttr(attr, v) {
      this.addAttrStr(attr, AttrNames[v]);
    }

    insertAnnotation(entity, t) {
      let a = entity._annotate || (entity._annotate = []);
      a.push(t);
    }

    makeAnnotation(entity) {
      if(entity._annotation)
        return;
      entity._annotation = true;
      this.tmp.annot.push(entity);
    }

    addAnnotation(entity, type, data) {
      let anno = entity.annotations || (entity.annotations = {});
      let at = anno[type] || (anno[type] = []);
      let e = data.termType == "Literal" ? "label" : "iri";
      let item = {
        identifier:type,
        language:data.language || "undefined",
        type:e,
        value:data.value
      };

      this.addLang(data);
      at.push(item);
    }

    addSuperClass(entity, targetEntity) {
      let sc = entity.superClasses || (entity.superClasses = []);
      if(sc.indexOf(targetEntity.id) == -1) sc.push(targetEntity.id);
    }

    addSubClass(entity, targetEntity) {
      if(this.isThing(entity.iri))
        return;
      let sc = targetEntity.subClasses || (targetEntity.subClasses = []);
      if(sc.indexOf(entity.id) != -1)
        return;
      sc.push(entity.id);
      this.addSuperClass(entity, targetEntity);

      let prop = {
        id:this.property.length,
        type:"rdfs:SubClassOf"
      }

      let attr = {
        id:prop.id,
        domain:entity.id,
        range:targetEntity.id
      };

      this.addAttr(attr, Attr.ANONYMOUS);
      this.addAttr(attr, Attr.OBJECT);
      this.property.push(prop);
      this.propertyAttribute.push(attr);
    }

    addPropInverse(entity, targetEntity) {
      if(targetEntity.inverse === undefined)
        entity.inverse = targetEntity.id;

      if(entity.range === undefined && targetEntity.domain !== undefined && (!entity._property || !entity._property[Pred.RANGE]))
        entity.range = targetEntity.domain;
      if(entity.domain === undefined && targetEntity.range !== undefined && (!entity._property || !entity._property[Pred.DOMAIN]))
        entity.domain = targetEntity.range;
    }

    addPropEquivalent(entity, target) {
      this.addAttr(entity, Attr.EQUIVALENT);
      if(!target.equivalent ||
        target.equivalent.indexOf(entity.id) == -1) {
        let eq = entity.equivalent || (entity.equivalent = []);
        if(eq.indexOf(target.id) == -1) eq.push(target.id);
      }
    }

    addEquivalentClass(entity, targetEntity) {
      this.addPropEquivalent(entity, targetEntity);
      this.addPropEquivalent(targetEntity, entity);

      entity._equiv = true;
      targetEntity._equiv = true;
    }

    addDomain(entity, target) {
      let orig = entity.domain;
      if(orig === undefined || orig == target.id) {
        entity.domain = target.id;
        return;
      }
      if(!Array.isArray(orig))
          orig = entity.domain = [orig];
      if(orig.indexOf(target.id) == -1) orig.push(target.id);
    }

    addRange(entity, target) {
      let orig = entity.range;
      if(orig === undefined || orig == target.id) {
        entity.range = target.id;
        return;
      }
      if(!Array.isArray(orig))
          orig = entity.range = [orig];
      if(orig.indexOf(target.id) == -1) orig.push(target.id);
    }

    addHasKey(entity, target) {
      this.addAttr(target, Attr.KEY);
      this.addDomain(target, entity);
    }

    addSubProperty(entity, target) {
      let sp = target.subproperty || (target.subproperty = []);
      if(sp.indexOf(entity.id) == -1) sp.push(entity.id);

      this.addSuperProperty(entity, target);
    }

    addSuperProperty(entity, target) {
      let sp = entity.superproperty || (entity.superproperty = []);
      if(sp.indexOf(target.id) == -1) sp.push(target.id);
    }

    addDisjointWith(entity, target) {
      let prop = {
        id:this.property.length,
        type:"owl:disjointWith"
      };
      let propAttr = {
        id : prop.id,
        domain: 0
      };

      let objId = target.id;
      let subjId = entity.id;
      let a = objId;
      let b = subjId;
      if(a < b) {
        const v = b;
        b = a;
        a = v;
      }
      const mapKey = a + '_' + b;

      propAttr.range = objId;
      propAttr.domain = subjId;

      if(!this.tmp.disjointMap[mapKey]) {
        this.tmp.disjointMap[mapKey] = 1;
        this.addAttr(propAttr, Attr.OBJECT);
        this.addAttr(propAttr, Attr.ANONYMOUS);
        this.property.push(prop);
        this.propertyAttribute.push(propAttr);
      }
    }

    findClass(iri) {
      return this.tmp.entityMap[iri];
    }

    materializeUnion(entity) {
      var data = entity._property[Pred.UNION_OF];
      if(data) {
        if(Array.isArray(data))
          throw new Error("multiple union");
        return this.addUnionOf(entity, data);
      }
      data = entity._property[Pred.DISJOINT_UNION_OF];
      if(data) {
        if(Array.isArray(data))
          throw new Error("multiple union");
        return this.addDisjointUnionOf(entity, data);
      }
      return InvalidEntity;
    }

    addUnionOf(entity, data) {
      const el = data.elements;
      let union = [];
      for(const e of el) {
        let cls = this.materializeTarget(e);
        if(cls._invalid)
          throw new Error("fail");
        if(union.indexOf(cls.id) == -1) union.push(cls.id);
      }
      let cls = {
        id:this.class.length,
        type:"owl:unionOf"
      };
      var attr = {
        id:cls.id,
        instances:0,
        union:union
      };

      let key = "";
      union.sort();
      for(const id of union)
        key += id + "_";

      let orig = this.tmp.unionMap[key];
      if(orig)
        return orig;

      if(entity._blank) {
        delete this.tmp.entityMap[entity.iri];
        delete entity._blank;
        delete entity.iri;
        delete entity._property;
        delete entity._pending;
        attr = Object.assign(entity, attr);
      }

      this.tmp.unionMap[key] = attr;

      this.addAttr(attr, Attr.ANONYMOUS);
      this.addAttr(attr, Attr.UNION);
      this.class.push(cls);
      this.classAttribute.push(attr);
      return attr;
    }

    addDisjointUnionOf(entity, data) {
      const el = data.elements;
      let union = [];
      for(const e of el) {
        let cls = this.materializeTarget(e);
        if(cls._invalid)
          throw new Error("fail");
        if(union.indexOf(cls.id) == -1) union.push(cls.id);
      }
      let cls = {
        id:this.class.length,
        type:"owl:disjointUnionOf"
      };
      var attr = {
        id:cls.id,
        instances:0,
        disjointUnion:union
      };

      let key = "";
      union.sort();
      for(const id of union)
        key += id + "_";

      let orig = this.tmp.dunionMap[key];
      if(orig)
        return orig;

      if(entity._blank) {
        delete this.tmp.entityMap[entity.iri];
        delete entity._blank;
        delete entity.iri;
        delete entity._property;
        delete entity._pending;
        attr = Object.assign(entity, attr);
      }

      this.tmp.dunionMap[key] = attr;

      this.addAttr(attr, Attr.ANONYMOUS);
      this.addAttr(attr, Attr.DISJOINT_UNION);
      this.class.push(cls);
      this.classAttribute.push(attr);
      return attr;
    }

    addTypeAttr(entity, type) {
      switch(type) {
        case Obj.OWL_ObjectProperty:
        case Obj.OWL_BottomObjectProperty:
        case Obj.OWL_TopObjectProperty:
          this.addAttr(entity, Attr.OBJECT);
          break;
        case Obj.OWL_InverseFunctionalProperty:
          this.addAttr(entity, Attr.INVERSE_FUNCTIONAL);
          break;
        case Obj.OWL_DatatypeProperty:
        case Obj.OWL_TopDataProperty:
        case Obj.OWL_BottomDataProperty:
          this.addAttr(entity, Attr.DATATYPE);
          break;
        case Obj.OWL_FunctionalProperty:
          this.addAttr(entity, Attr.FUNCTIONAL);
          break;
        case Obj.OWL_TransitiveProperty:
          this.addAttr(entity, Attr.TRANSITIVE);
          break;
        case Obj.OWL_SymmetricProperty:
          this.addAttr(entity, Attr.SYMMETRIC);
          break;
        case Obj.OWL_ReflexiveProperty:
          this.addAttr(entity, Attr.REFLEXIVE);
          break;
        case Obj.OWL_DeprecatedProperty:
        case Obj.OWL_DeprecatedClass:
          this.addAttr(entity, Attr.DEPRECATED);
          break;
        default:
          return false;
      }
      return true;
    }

    addIndiv(attr, indiv) {
      let iv = attr.individuals || (attr.individuals = []);
      if(iv.indexOf(indiv) == -1) iv.push(indiv);
    }

    materializeTarget(target) {
      if(!this.isNamed(target))
        return InvalidEntity;
      let entity = this.addEntity(target);
      if(entity._blank)
        return this.materializeUnion(entity);
      if(entity.iri === undefined)
        return InvalidEntity;
      let materialized = this.materializeEntity(entity);
      return materialized ? materialized : InvalidEntity;
    }

    materializeDeprecated(entity, data) {
      this.addAttr(entity, Attr.DEPRECATED);
      return true;
    }
    materializeVersionInfo(entity, data) {
      this.addAnnotation(entity, "versionInfo", data);
      return true;
    }
    materializeComment(entity, data) {
      this.addLangData(entity, "comment", data);
      return true;
    }
    materializeLabel(entity, data) {
      this.addLangData(entity, "label", data);
      return true;
    }
    materializeSeeAlso(entity, data) {
      this.addAnnotation(entity, "seeAlso", data);
      return true;
    }
    materializeIsDefinedBy(entity, data) {
      this.addAnnotation(entity, "isDefinedBy", data);
      return true;
    }
    materializeMember(entity, data) {
      throw new Error("Member not implemented");
    }
    materializeAnnotatedProperty(entity, data) {
      throw new Error("AnnotatedProperty not implemented");
    }
    materializeAnnotatedSource(entity, data) {
      throw new Error("AnnotatedSource not implemented");
    }
    materializeAnnotatedTarget(entity, data) {
      throw new Error("AnnotatedTarget not implemented");
    }
    materializeMembers(entity, data) {
      throw new Error("Members not implemented");
    }
    materializeSubClassOf(entity, data) {
      let targetEntity = this.materializeTarget(data);
      if(targetEntity._invalid)
        return false;
      if(this.isThing(targetEntity.iri))
        return true;
      this.addSubClass(entity, targetEntity);
      return true;
    }
    materializeEquivalentClass(entity, data) {
      let targetEntity = this.materializeTarget(data);
      if(targetEntity._invalid)
        return false;
      this.addEquivalentClass(entity, targetEntity);
      return true;
    }
    materializeIntersectionOf(entity, data) {
      throw new Error("IntersectionOf not implemented");
    }
    materializeOneOf(entity, data) {
      throw new Error("OneOf not implemented");
    }
    materializeUnionOf(entity, data) {
      return this.addUnionOf(entity, data);
    }
    materializeDatatypeComplementOf(entity, data) {
      throw new Error("DatatypeComplementOf not implemented");
    }
    materializeOnDatatype(entity, data) {
      throw new Error("OnDatatype not implemented");
    }
    materializeWithRestrictions(entity, data) {
      throw new Error("WithRestrictions not implemented");
    }
    materializeDistinctMembers(entity, data) {
      throw new Error("DistinctMembers not implemented");
    }
    materializeComplementOf(entity, data) {
      throw new Error("ComplementOf not implemented");
    }
    materializeDisjointUnionOf(entity, data) {
      return this.addDisjointUnionOf(entity, data);
    }
    materializeDisjointWith(entity, data) {
      let targetEntity = this.materializeTarget(data);
      if(targetEntity._invalid)
        return false;
      this.addDisjointWith(entity, targetEntity);
      return true;
    }
    materializeHasKey(entity, data) {
      if(data.termType == "Collection") {
        for(let el of data.elements) {
          let targetEntity = this.materializeTarget(el);
          if(targetEntity._invalid)
            return false;
          this.addHasKey(entity, targetEntity);
        }
      } else {
        let targetEntity = this.materializeTarget(data);
        if(targetEntity._invalid)
          return false;
        this.addHasKey(entity, targetEntity);
      }
      return true;
    }
    materializeAssertionProperty(entity, data) {
      throw new Error("AssertionProperty not implemented");
    }
    materializeSourceIndividual(entity, data) {
      throw new Error("SourceIndividual not implemented");
    }
    materializeTargetIndividual(entity, data) {
      throw new Error("TargetIndividual not implemented");
    }
    materializeTargetValue(entity, data) {
      throw new Error("TargetValue not implemented");
    }
    materializeInverseOf(entity, data) {
      let targetEntity = this.materializeTarget(data);
      if(targetEntity._invalid)
        return false;
      this.addPropInverse(entity, targetEntity);
      return true;
    }
    materializePropertyChainAxiom(entity, data) {
      throw new Error("PropertyChainAxiom not implemented");
    }
    materializeBackwardCompatibleWith(entity, data) {
      throw new Error("BackwardCompatibleWith not implemented");
    }
    materializeImports(entity, data) {
      return true;
    }
    materializeIncompatibleWith(entity, data) {
      throw new Error("IncompatibleWith not implemented");
    }
    materializePriorVersion(entity, data) {
      throw new Error("PriorVersion not implemented");
    }
    materializeVersionIRI(entity, data) {
      entity.versionIRI = data.value;
      return true;
    }
    materializeAllValuesFrom(entity, data) {
      throw new Error("AllValuesFrom not implemented");
    }
    materializeCardinality(entity, data) {
      throw new Error("Cardinality not implemented");
    }
    materializeHasSelf(entity, data) {
      throw new Error("HasSelf not implemented");
    }
    materializeHasValue(entity, data) {
      throw new Error("HasValue not implemented");
    }
    materializeMaxCardinality(entity, data) {
      throw new Error("MaxCardinality not implemented");
    }
    materializeMaxQualifiedCardinality(entity, data) {
      throw new Error("MaxQualifiedCardinality not implemented");
    }
    materializeMinCardinality(entity, data) {
      throw new Error("MinCardinality not implemented");
    }
    materializeMinQualifiedCardinality(entity, data) {
      throw new Error("MinQualifiedCardinality not implemented");
    }
    materializeOnClass(entity, data) {
      throw new Error("OnClass not implemented");
    }
    materializeOnDataRange(entity, data) {
      throw new Error("OnDataRange not implemented");
    }
    materializeOnProperties(entity, data) {
      throw new Error("OnProperties not implemented");
    }
    materializeOnProperty(entity, data) {
      throw new Error("OnProperty not implemented");
    }
    materializeQualifiedCardinality(entity, data) {
      throw new Error("QualifiedCardinality not implemented");
    }
    materializeSomeValuesFrom(entity, data) {
      throw new Error("SomeValuesFrom not implemented");
    }
    materializeBottomDataProperty(entity, data) {
      throw new Error("BottomDataProperty not implemented");
    }
    materializeBottomObjectProperty(entity, data) {
      throw new Error("BottomObjectProperty not implemented");
    }
    materializeTopDataProperty(entity, data) {
      throw new Error("TopDataProperty not implemented");
    }
    materializeTopObjectProperty(entity, data) {
      throw new Error("TopObjectProperty not implemented");
    }
    materializeDifferentFrom(entity, data) {
      throw new Error("DifferentFrom not implemented");
    }
    materializeSameAs(entity, data) {
      throw new Error("SameAs not implemented");
    }
    materializeSubPropertyOf(entity, data) {
      let targetEntity = this.materializeTarget(data);
      if(targetEntity._invalid)
        return false;
      if(targetEntity._internal)
        return true;
      this.addSubProperty(entity, targetEntity);
      return true;
    }
    materializeDomain(entity, data) {
      let targetEntity = this.materializeTarget(data);
      if(targetEntity._invalid)
        return false;
      this.addDomain(entity, targetEntity);
      return true;
    }
    materializeRange(entity, data) {
      let targetEntity = this.materializeTarget(data);
      if(targetEntity._invalid)
        return false;
      this.addRange(entity, targetEntity);
      return true;
    }
    materializeEquivalentProperty(entity, data) {
      let target = data;
      let iri = this.getValue(target);
      let e = splitNS(iri);
      let base = this.cleanIri(e.ns);
      if(this.isExternal(base))
        return true;
      let targetEntity = this.materializeTarget(target);
      if(targetEntity._invalid)
        return false;
      this.addPropEquivalent(entity, targetEntity);
      return true;
    }
    materializePropertyDisjointWith(entity, data) {
      throw new Error("PropertyDisjointWith not implemented");
    }

    verifyProps(entity) {
      for(const idx in entity._property) {
        if((TypePropMap[idx] & this.getEntityType(entity)) == 0)
          throw new Error("property not allowed on type");
      }
      return true;
    }

    materializeProps(entity) {
      if(!entity._property)
        return true;
      for(const idx in entity._property) {
        let data = entity._property[idx];
        if(Array.isArray(data)) {
          for(const it of data) {
            if(!Materializer[idx].call(this, entity, it))
              return false;
          }
        } else {
          if(!Materializer[idx].call(this, entity, data))
            return false;
        }
      }
      return true;
    }

    fillType(entity, base, name) {
      if(entity._type === undefined)
        entity._type = BigInt(0);
      const knownType = ObjMap[entity.iri];
      const ins = InternalNS[base];
      if(ins && ins[name]) {
        entity._type |= TypeMap[ins[name]];
      }
      const ty = TypeMap[knownType];
      if(ty !== undefined) {
        entity._type |= ty;
        this.addTypeAttr(entity, knownType);
      }
    }

    materializeEntity(entity, collected) {
      if(entity._invalid)
        return null;
      var orig = this.tmp.entityMap[entity.iri];
      if(orig && !orig._pending)
        return orig;
      const e = splitNS(entity.iri);
      let base = this.cleanIri(e.ns);

      if(collected && InternalNS[e.ns] && e.ns != this.header.iri)
        return null;

      delete orig._pending;

      if(!entity._individual) {
        this.fillType(entity, base, e.v);

        if(!this.hasClassType(entity._type))
          throw new Error("type error");

        var isExternal = this.isExternal(base);
        var internalNS = this.isInternalNS(base);
        var isDatatype = false;
        const isLiteral = this.isLiteral(entity.iri);
        const isThing = this.isThing(entity.iri);
        let item = {};
        entity.label = {};
        if(this.hasPropertyType(entity._type)) {

          if(PredMap[entity.iri] && !this.isNeededInternal(entity.iri)) {
            entity._internal = true;
            return entity;
          }

          entity.id = this.property.length;
          this.property.push(item);
          this.propertyAttribute.push(entity);
        } else {
          entity.id = this.class.length;
          this.class.push(item);
          this.classAttribute.push(entity);

          if(!isDatatype)
            entity.instances = 0;
        }

        if(isExternal) {
          this.tmp.baseIris[NamespaceType[Namespace.RDFS]] = 1;
          this.addAttr(entity, Attr.EXTERNAL);
        }

        if(!isThing && !isLiteral)
          entity.baseIri = base;

        if(entity.baseIri) {
          this.tmp.baseIris[entity.baseIri] = 1;
        }

        if(e.v) entity.label["IRI-based"] = e.v;

        if(isLiteral || isThing || internalNS) {
          delete entity.attributes;
          delete entity.instances;
          if(!internalNS) {
            delete entity.label["IRI-based"];
            entity.label["undefined"] = e.v;
          }
        }

        if(!this.materializeProps(entity) || !this.verifyProps(entity)) {
          entity._invalid = true;
          return null;
        }

        item.type = this.getType(entity);
        item.id = entity.id;
        delete entity._property;
        return entity;
      } else {
        const isOntology = entity._ontology;

        if(isOntology) {
          if(entity.iri == this.header.iri)
            this.tmp.ontology = entity;
          if(!this.materializeProps(entity) || !this.verifyProps(entity)) {
            entity._invalid = true;
            return null;
          }
        } else {
          if(entity._indiv_target) {
            let targetEntity = this.materializeTarget(entity._indiv_target);
            if(targetEntity._invalid)
              return null;
            let indiv = {
              iri:entity.iri,
              baseIri:base,
              labels: {}
            };
            if(e.v) indiv.labels["IRI-based"] = e.v;
  -         this.addIndiv(targetEntity, indiv);
          }
        }
      }
      return null;
    }

    collectItems() {
      let map = this.tmp.entityMap;
      for(const key in map) {
        const entity = map[key];

        if((!entity._blank && entity._type && !entity._annotation) || entity._individual) {
          this.materializeEntity(entity, true);
        }
      }
    }

    updateProp(orig, other, attr) {
      //if(ObjClassType.indexOf(orig.type) > ObjClassType.indexOf(other.type)) {
        orig.type = other.type;
      //}
    }

    cloneClass(clsId) {
      let cls = Object.assign({}, this.class[clsId]);
      let attr = Object.assign({}, this.classAttribute[clsId]);
      cls.id = this.class.length;
      attr.id = cls.id;
      this.class.push(cls);
      this.classAttribute.push(attr);
      for(const key in attr) {
        if(Array.isArray(attr[key]))
          attr[key] = attr[key].flat();
      }
      return cls.id;
    }

    insertBuiltinClass(type) {
      let cls = {
        id:this.class.length,
        type:ObjClassType[type]
      };

      let iri = ObjKey[type];
      let e = splitNS(iri);

      let attr = {
        id:cls.id,
        label:{"undefined":e.v},
        iri:iri
      }

      this.class.push(cls);
      this.classAttribute.push(attr);
      this.tmp.entityMap[iri] = attr;
      return attr;
    }

    insertUnionClass(classes) {
      let cls = {
        id:this.class.length,
        type:"owl:Class"
      };
      let attr = {
        id:cls.id,
        instances:0,
        union:classes
      };

      this.addAttr(attr, Attr.ANONYMOUS);
      this.addAttr(attr, Attr.UNION);
      this.class.push(cls);
      this.classAttribute.push(attr);
      return attr;
    }

    sanatizeResult() {
      const thingClsId = () => (this.tmp.entityMap[ObjKey[Obj.OWL_Thing]] ||
                          this.insertBuiltinClass(Obj.OWL_Thing)).id;
      const literalClsId = () => (this.tmp.entityMap[ObjKey[Obj.RDFS_Literal]] ||
                          this.insertBuiltinClass(Obj.RDFS_Literal)).id;

      for(let it of this.classAttribute) {
        delete it._type;
        if(it._equiv) {
          this.class[it.id].type = "owl:equivalentClass";
          delete it._equiv;
        }
      }

      for(let it of this.propertyAttribute) {
        delete it._type;
        var attrs = it.attributes;
        if(!attrs)
          continue;
        var hasObj = attrs.indexOf(AttrNames[Attr.OBJECT]) != -1;
        var hasInvFunct = attrs.indexOf(AttrNames[Attr.INVERSE_FUNCTIONAL]) != -1;
        const hasDataType = attrs.indexOf(AttrNames[Attr.DATATYPE]) != -1;
        if(hasObj) {
          if(Array.isArray(it.range))
              it.range = this.insertUnionClass(it.range).id;
          if(Array.isArray(it.domain))
              it.domain = this.insertUnionClass(it.domain).id;
          if(it.range == undefined)
            it.range = thingClsId();
          if(it.domain == undefined)
            it.domain = thingClsId();
        } else {

          if(hasInvFunct) {
            if(hasDataType) {
              attrs.splice(attrs.indexOf(AttrNames[Attr.INVERSE_FUNCTIONAL]), 1);
              hasInvFunct = false;
            } else {
              attrs.push(AttrNames[Attr.OBJECT]);
              this.updateProp(this.property[it.id], {type:ObjClassType[Obj.OWL_ObjectProperty]});
              hasObj = true;
            }
          }

          if(!hasObj && this.property[it.id].type == ObjClassType[Obj.OWL_ObjectProperty]) {
              attrs.push(AttrNames[Attr.OBJECT]);
              hasObj = true;
          }

          if(!hasObj && it.subproperty) {
            for(const propId of it.subproperty) {
              let target = this.propertyAttribute[propId];
              let idx = target.superproperty.indexOf(it.id);
              target.superproperty.splice(idx, 1);
              if(target.superproperty.length == 0)
                delete target.superproperty;
            }
            delete it.subproperty;
          }

        }
        if(hasDataType) {
          if(Array.isArray(it.domain))
              it.domain = this.insertUnionClass(it.domain).id;
          if(Array.isArray(it.range))
              throw new Error("datatype range is array" + it.iri);
          if(it.domain == undefined)
            it.domain = thingClsId();
          if(it.range == undefined)
            it.range = literalClsId();
        }
      }


      let o = this.tmp.ontology;
      if(o && o.annotations) {
        let a = o.annotations;
        if(a.title) {
          for(const t of a.title)
            this.addLangData(this.header, "title", t);
          delete a.title;
        }
        if(a.description) {
          for(const t of a.description)
            this.addLangData(this.header, "description", t);
          delete a.description;
        }
        if(a.creator) {
          let author = this.header.author || (this.header.author = []);
          for(const t of a.creator)
            author.push(t.value);
          delete a.creator;
        }
        if(a.versionInfo) {
          for(const t of a.versionInfo) {
            this.header.version = t.value;
            break;
          }
          delete a.versionInfo;
        }
        if(Object.keys(a).length != 0) {
          let other = this.header.other || (this.header.other = {});
          Object.assign(other, a);
        }
      }
      if(o && o.label) {
        for(const l in o.label) {
          this.addLangData(this.header, "labels", {language:l, value:o.label[l]});
        }
      }
      if(o && o.versionIRI) {
          o.versionIRI;
      }
    }

    isDataType(clsId) {
      const cls = this.class[clsId];
      return cls.type == ObjClassType[Obj.RDFS_Datatype];
    }

    isUnionType(clsId) {
      const cls = this.class[clsId];
      return cls.type == "owl:unionOf";
    }

    applySplitRules() {
      const literalCls = this.tmp.entityMap[ObjKey[Obj.RDFS_Literal]];
      const thingCls = this.tmp.entityMap[ObjKey[Obj.OWL_Thing]];
      const literalClsId = literalCls ? literalCls.id : -1;
      const thingClsId = thingCls ? thingCls.id : -1;

      let thingMap = {};
      let unionMap = {};

      const splitUnion = ((union) => {
        if(this.isUnionType(union)) {
          let key = "";
          for(const id of this.classAttribute[union].union)
            key += id + "_";
          if(unionMap[key])
            return this.cloneClass(union);
          unionMap[key] = 1;
        }
        return union;
      }).bind(this);

      var notFirst = {};
      var id = {};
      function add(clsId) {
          if(!notFirst[clsId]) {
            notFirst[clsId] = true;
            id[clsId] = clsId;
            return clsId;
          }
          if(id[clsId] == -1)
            id[clsId] = this.cloneClass(clsId);
          return id[clsId];
      }
      const addLiteral = (() => add.call(this, literalClsId)).bind(this);
      const addThing = ((linkClsId) => {
        if(thingMap[linkClsId] === undefined) {
          thingMap[linkClsId] = this.cloneClass(thingClsId);
        }
        return thingMap[linkClsId];
      }).bind(this);
      const addDataType = ((clsId) => { id[clsId] = -1; return add.call(this, clsId)}).bind(this);
      for(const it of this.propertyAttribute) {
        var hasObj = it.attributes.indexOf(AttrNames[Attr.OBJECT]) != -1;
        var hasDataType = it.attributes.indexOf(AttrNames[Attr.DATATYPE]) != -1;
        id[literalClsId] = -1;

        if(it.range === literalClsId)
          it.range = addLiteral();
        if(it.domain === literalClsId)
          it.domain = addLiteral();

        if(hasDataType) {
          if(this.isDataType(it.range))
              it.range = addDataType(it.range);
        }

        it.range = splitUnion(it.range);
        it.domain = splitUnion(it.domain);

        if(!hasObj) continue;

        if(it.range != thingClsId || it.domain != thingClsId) {
          if(it.range === thingClsId && !this.isLiteral(this.classAttribute[it.domain].iri))
            it.range = addThing(it.domain);
          if(it.domain === thingClsId && !this.isLiteral(this.classAttribute[it.range].iri))
            it.domain = addThing(it.range);
        }
      }
    }

    initResult() {
      this._comment = "Created with WebVOWL";
      this.header = {};
      this.namespace = [];
      this.class = [];
      this.classAttribute = [];
      this.property = [];
      this.propertyAttribute = [];
      this.tmp = {
        lang:{},
        entityMap:{},
        disjointMap:{},
        baseIris:{},
        unionMap:{},
        dunionMap:{},
        annot:[],
        ns:{}
      };
    }

    finiResult() {
      delete this.tmp;
    }

    async parseData(rdfData, baseIri, contentType, tmp, initial) {
      if(!contentType || !MimeMap[contentType]) {
          contentType = MimeExtMap["owl"];
      }
      let data = _parse(rdfData, baseIri, contentType);

      let imports = [];
      for(const s of data.stmts) {
          var kind = PredMap[s.predicate.value] ?? 0;
          if(kind == Pred.IMPORTS)
            imports.push(s);
          if(initial && kind == Pred.TYPE && this.isOntology(s.object.value)) {
            initial = false;
            tmp.iri = s.subject.value;
          }
      }

      for(const toImport of imports) {
          let iri = this.getValue(toImport.object);
          let baseIri = this.cleanIri(iri);
          if(!tmp.loaded[baseIri]) {
              tmp.loaded[baseIri] = 1;
              const r = await tmp.load(baseIri);
              await this.parseData(r.data, baseIri, r.contentType, tmp);
          }
      }

      tmp.data.push(data);
    }

    async transform(rdfData, baseIri, contentType, load) {
      let tmp = {
          iri:baseIri,
          loaded:{},
          load:load,
          data:[],
      };

      this.initResult();
      await this.parseData(rdfData, baseIri, contentType, tmp, true);

      this.header.iri = tmp.iri;
      this.tmp.cleanBaseIri = this.cleanIri(tmp.iri);

      this.handleData(tmp.data);
      this.collectItems();
      this.sanatizeResult();
      this.applySplitRules();
      this.handleLanguages();
      this.handleBaseIris();
      this.handlePrefixList();
      this.finiResult();

      let out = Object.assign({}, this);
      for(const key in this) {
        delete this[key];
      }
      return out;
    }

    getMime(ext) {
      return MimeExtMap[ext];
    }

    constructor(parse) {
      _parse = parse;
    }

  };

  Materializer = Object.freeze([null,
                null,
                Impl.prototype.materializeDeprecated,
                Impl.prototype.materializeVersionInfo,
                Impl.prototype.materializeComment,
                Impl.prototype.materializeLabel,
                Impl.prototype.materializeSeeAlso,
                Impl.prototype.materializeIsDefinedBy,
                Impl.prototype.materializeMember,
                Impl.prototype.materializeAnnotatedProperty,
                Impl.prototype.materializeAnnotatedSource,
                Impl.prototype.materializeAnnotatedTarget,
                Impl.prototype.materializeMembers,
                Impl.prototype.materializeSubClassOf,
                Impl.prototype.materializeEquivalentClass,
                Impl.prototype.materializeIntersectionOf,
                Impl.prototype.materializeOneOf,
                Impl.prototype.materializeUnionOf,
                Impl.prototype.materializeDatatypeComplementOf,
                Impl.prototype.materializeOnDatatype,
                Impl.prototype.materializeWithRestrictions,
                Impl.prototype.materializeDistinctMembers,
                Impl.prototype.materializeComplementOf,
                Impl.prototype.materializeDisjointUnionOf,
                Impl.prototype.materializeDisjointWith,
                Impl.prototype.materializeHasKey,
                Impl.prototype.materializeAssertionProperty,
                Impl.prototype.materializeSourceIndividual,
                Impl.prototype.materializeTargetIndividual,
                Impl.prototype.materializeTargetValue,
                Impl.prototype.materializeInverseOf,
                Impl.prototype.materializePropertyChainAxiom,
                Impl.prototype.materializeBackwardCompatibleWith,
                Impl.prototype.materializeImports,
                Impl.prototype.materializeIncompatibleWith,
                Impl.prototype.materializePriorVersion,
                Impl.prototype.materializeVersionIRI,
                Impl.prototype.materializeAllValuesFrom,
                Impl.prototype.materializeCardinality,
                Impl.prototype.materializeHasSelf,
                Impl.prototype.materializeHasValue,
                Impl.prototype.materializeMaxCardinality,
                Impl.prototype.materializeMaxQualifiedCardinality,
                Impl.prototype.materializeMinCardinality,
                Impl.prototype.materializeMinQualifiedCardinality,
                Impl.prototype.materializeOnClass,
                Impl.prototype.materializeOnDataRange,
                Impl.prototype.materializeOnProperties,
                Impl.prototype.materializeOnProperty,
                Impl.prototype.materializeQualifiedCardinality,
                Impl.prototype.materializeSomeValuesFrom,
                Impl.prototype.materializeBottomDataProperty,
                Impl.prototype.materializeBottomObjectProperty,
                Impl.prototype.materializeTopDataProperty,
                Impl.prototype.materializeTopObjectProperty,
                Impl.prototype.materializeDifferentFrom,
                Impl.prototype.materializeSameAs,
                Impl.prototype.materializeSubPropertyOf,
                Impl.prototype.materializeDomain,
                Impl.prototype.materializeRange,
                Impl.prototype.materializeEquivalentProperty,
                Impl.prototype.materializePropertyDisjointWith,

    ]);

  return Impl;
})();


