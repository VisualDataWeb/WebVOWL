#!/usr/bin/env node
/*
      Parse rdf files into sorted VOWLv2 json format.

      usage:
        ./parse.js file.rdf
*/
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as rdflib from 'rdflib';

if(process.argv.length < 3)
    exit(1);

const file = process.argv[2];
var rdfData = fs.readFileSync(file).toString();
var store = rdflib.graph();
var contentType = 'application/rdf+xml';
var baseUrl = "http://xmlns.com/foaf/0.1";

class OWLParser {

  Namespace = Object.freeze({
    UNKNOWN  : 0,
    OWL      : 1,
    RDFS     : 2,
    RDF      : 3,
    XSD      : 4,
    XML      : 5,
    SWRL     : 6,
    SWRLB    : 7,
    SKOS     : 8,
    TIME     : 9,
    GRDDL    : 10,
    MA       : 11,
    PROV     : 12,
    RDFA     : 13,
    RIF      : 14,
    R2RML    : 15,
    SD       : 16,
    SKOSXL   : 17,
    POWDER   : 18,
    VOID     : 19,
    POWDERS  : 20,
    XHV      : 21,
    ORG      : 22,
    GLDP     : 23,
    CNT      : 24,
    DCAT     : 25,
    EARL     : 26,
    HT       : 27,
    PTR      : 28,
    CC       : 29,
    CTAG     : 30,
    DCTERMS  : 31,
    DC       : 32,
    FOAF     : 33,
    GR       : 34,
    ICAL     : 35,
    OG       : 36,
    REV      : 37,
    SIOC     : 38,
    VCARD    : 39,
    SCHEMA   : 40,
    GEO      : 41,
    SC       : 42,
    DBPEDIA  : 43,
    DBP      : 44,
    DBO      : 45,
    YAGO     : 46
  });

  NamespaceMap = {
    "http://www.w3.org/2002/07/owl"                             : this.Namespace.OWL,
    "http://www.w3.org/2000/01/rdf-schema"                      : this.Namespace.RDFS,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns"                : this.Namespace.RDF,
    "http://www.w3.org/2001/XMLSchema"                          : this.Namespace.XSD,
    "http://www.w3.org/XML/1998/namespace"                      : this.Namespace.XML,
    "http://www.w3.org/2003/11/swrl"                            : this.Namespace.SWRL,
    "http://www.w3.org/2003/11/swrlb"                           : this.Namespace.SWRLB,
    "http://www.w3.org/2004/02/skos/core"                       : this.Namespace.SKOS,
    "http://www.w3.org/2006/time"                               : this.Namespace.TIME,
    "http://www.w3.org/2003/g/data-view"                        : this.Namespace.GRDDL,
    "http://www.w3.org/ns/ma-ont"                               : this.Namespace.MA,
    "http://www.w3.org/ns/prov"                                 : this.Namespace.PROV,
    "http://www.w3.org/ns/rdfa"                                 : this.Namespace.RDFA,
    "http://www.w3.org/2007/rif"                                : this.Namespace.RIF,
    "http://www.w3.org/ns/r2rml"                                : this.Namespace.R2RML,
    "http://www.w3.org/ns/sparql-service-description"           : this.Namespace.SD,
    "http://www.w3.org/2008/05/skos-xl"                         : this.Namespace.SKOSXL,
    "http://www.w3.org/2007/05/powder"                          : this.Namespace.POWDER,
    "http://rdfs.org/ns/void"                                   : this.Namespace.VOID,
    "http://www.w3.org/2007/05/powder-s"                        : this.Namespace.POWDERS,
    "http://www.w3.org/1999/xhtml/vocab"                        : this.Namespace.XHV,
    "http://www.w3.org/ns/org"                                  : this.Namespace.ORG,
    "http://www.w3.org/ns/people"                               : this.Namespace.GLDP,
    "http://www.w3.org/2008/content"                            : this.Namespace.CNT,
    "http://www.w3.org/ns/dcat"                                 : this.Namespace.DCAT,
    "http://www.w3.org/ns/earl"                                 : this.Namespace.EARL,
    "http://www.w3.org/2006/http"                               : this.Namespace.HT,
    "http://www.w3.org/2009/pointers"                           : this.Namespace.PTR,
    "http://creativecommons.org/ns"                             : this.Namespace.CC,
    "http://commontag.org/ns"                                   : this.Namespace.CTAG,
    "http://purl.org/dc/terms/"                                 : this.Namespace.DCTERMS,
    "http://purl.org/dc/elements/1.1/"                          : this.Namespace.DC,
    "http://xmlns.com/foaf/0.1/"                                : this.Namespace.FOAF,
    "http://purl.org/goodrelations/v1"                          : this.Namespace.GR,
    "http://www.w3.org/2002/12/cal/icaltzd"                     : this.Namespace.ICAL,
    "http://ogp.me/ns"                                          : this.Namespace.OG,
    "http://purl.org/stuff/rev"                                 : this.Namespace.REV,
    "http://rdfs.org/sioc/ns"                                   : this.Namespace.SIOC,
    "http://www.w3.org/2006/vcard/ns"                           : this.Namespace.VCARD,
    "http://schema.org/"                                        : this.Namespace.SCHEMA,
    "http://www.w3.org/2003/01/geo/wgs84_pos"                   : this.Namespace.GEO,
    "http://purl.org/science/owl/sciencecommons/"               : this.Namespace.SC,
    "http://dbpedia.org/resource/"                              : this.Namespace.DBPEDIA,
    "http://dbpedia.org/property/"                              : this.Namespace.DBP,
    "http://dbpedia.org/ontology/"                              : this.Namespace.DBO,
    "http://dbpedia.org/class/yago/"                            : this.Namespace.YAGO
  }

  NamespaceKey = (() => {
    var keys = [];
    for(var key in this.Namespace) {
      keys.push(key.toLowerCase());
    }
    return keys;
  })();

  Pred = Object.freeze({
    UNKNOWN               : 0,
    TYPE                  : 1,
    DESCRIPTION           : 2,
    TITLE                 : 3,
    VALUE                 : 4,
    TERM_STATUS           : 5,
    LABEL                 : 6,
    COMMENT               : 7,
    IS_DEFINED_BY         : 8,
    EQUIVALENT_CLASS      : 9,
    SUB_CLASS_OF          : 10,
    DISJOINT_WITH         : 11,
    DOMAIN                : 12,
    RANGE                 : 13,
    SUB_PROPERTY_OF       : 14,
    INVERSE_OF            : 15,
    EQUIVALENT_PROPERTY   : 16
  });

  PredMap = {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"           : this.Pred.TYPE,
    "http://purl.org/dc/elements/1.1/description"               : this.Pred.DESCRIPTION,
    "http://purl.org/dc/elements/1.1/title"                     : this.Pred.TITLE,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"          : this.Pred.VALUE,
    "http://www.w3.org/2003/06/sw-vocab-status/ns#term_status"  : this.Pred.TERM_STATUS,
    "http://www.w3.org/2000/01/rdf-schema#label"                : this.Pred.LABEL,
    "http://www.w3.org/2000/01/rdf-schema#comment"              : this.Pred.COMMENT,
    "http://www.w3.org/2000/01/rdf-schema#isDefinedBy"          : this.Pred.IS_DEFINED_BY,
    "http://www.w3.org/2002/07/owl#equivalentClass"             : this.Pred.EQUIVALENT_CLASS,
    "http://www.w3.org/2000/01/rdf-schema#subClassOf"           : this.Pred.SUB_CLASS_OF,
    "http://www.w3.org/2002/07/owl#disjointWith"                : this.Pred.DISJOINT_WITH,
    "http://www.w3.org/2000/01/rdf-schema#domain"               : this.Pred.DOMAIN,
    "http://www.w3.org/2000/01/rdf-schema#range"                : this.Pred.RANGE,
    "http://www.w3.org/2000/01/rdf-schema#subPropertyOf"        : this.Pred.SUB_PROPERTY_OF,
    "http://www.w3.org/2002/07/owl#inverseOf"                   : this.Pred.INVERSE_OF,
    "http://www.w3.org/2002/07/owl#equivalentProperty"          : this.Pred.EQUIVALENT_PROPERTY
  };

  PredCount = Object.getOwnPropertyNames(this.Pred).length;

  Obj = Object.freeze({
    UNKNOWN                    : 0,
    ONTOLOGY                   : 1,
    ANNOTATION_PROPERTY        : 2,
    OWL_CLASS                  : 3,
    OWL_THING                  : 4,
    INVERSE_FUNCTION_PROPERTY  : 5,
    OBJECT_PROPERTY            : 6,
    DATATYPE_PROPERTY          : 7,
    FUNCTIONAL_PROPERTY        : 8,
    RDF_CLASS                  : 9,
    RDF_LABEL                  : 10,
    RDF_LITERAL                : 11,
    RDF_PROPERTY               : 12
  });

  ObjMap = {
    "http://www.w3.org/2002/07/owl#Ontology"                        : this.Obj.ONTOLOGY,
    "http://www.w3.org/2002/07/owl#AnnotationProperty"              : this.Obj.ANNOTATION_PROPERTY,
    "http://www.w3.org/2002/07/owl#Class"                           : this.Obj.OWL_CLASS,
    "http://www.w3.org/2002/07/owl#Thing"                           : this.Obj.OWL_THING,
    "http://www.w3.org/2002/07/owl#InverseFunctionalProperty"       : this.Obj.INVERSE_FUNCTION_PROPERTY,
    "http://www.w3.org/2002/07/owl#ObjectProperty"                  : this.Obj.OBJECT_PROPERTY,
    "http://www.w3.org/2002/07/owl#DatatypeProperty"                : this.Obj.DATATYPE_PROPERTY,
    "http://www.w3.org/2002/07/owl#FunctionalProperty"              : this.Obj.FUNCTIONAL_PROPERTY,
    "http://www.w3.org/2000/01/rdf-schema#Class"                    : this.Obj.RDF_CLASS,
    "http://www.w3.org/2000/01/rdf-schema#label"                    : this.Obj.RDF_LABEL,
    "http://www.w3.org/2000/01/rdf-schema#Literal"                  : this.Obj.RDF_LITERAL,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"           : this.Obj.RDF_PROPERTY
  };

  ObjCount = Object.getOwnPropertyNames(this.Obj).length;

  ObjClassType = (() => {
    var keys = [];
    let result = {tmp:{ns:{}, classMap:{}}};
    keys.push("");
    for(var key in this.ObjMap) {
      keys.push(this.extractType(key, result));
    }
    return keys;
  })();

  isClass(obj_val) {
    const obj_kind = this.ObjMap[obj_val];
    return obj_kind == this.Obj.OWL_CLASS ||
           obj_kind == this.Obj.OWL_THING ||
           obj_kind == this.Obj.RDF_LITERAL;
  }

  isLiteral(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.RDF_LITERAL;
  }

  isThing(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.OWL_THING;
  }

  isProperty(obj_kind) {
    return obj_kind == this.Obj.OBJECT_PROPERTY ||
           obj_kind == this.Obj.DATATYPE_PROPERTY;
  }

  splitNS(v) {
    const url = new URL(v);
    const h = url.hash != "";
    const ns = v.substr(0, h ? v.length - url.hash.length : v.lastIndexOf("/") + 1);
    return {ns:ns, v:v.substr(ns.length + h)};
  }

  extractType(v, result) {
    var e = this.splitNS(v, result);
    result.tmp.ns[e.ns] = 1;
    return this.NamespaceKey[this.NamespaceMap[e.ns]] + ":" + e.v;
  }

  getObjType(iri) {
    return this.ObjClassType[this.ObjMap[iri] || this.Obj.OWL_CLASS];
  }

  cleanIri(iri) {
    if(iri.endsWith("/"))
      return iri.slice(0, -1);
    return iri;
  }

  addComment(attr, triple) {
    if(!attr.comment) attr.comment = {};
    attr.comment[triple.object.language || "undefined"] = triple.object.value;
  }

  addLabel(attr, triple) {
    attr.label[triple.object.language || "undefined"] = triple.object.value;
  }

  addSuperClass(attr, triple, result) {
    if(!attr.superClasses) attr.superClasses = [];
    attr.superClasses.push(result.tmp.classMap[triple.object.value]);
  }

  addSubClass(attr, triple, result) {
    const obj_clsId = result.tmp.classMap[triple.object.value] || -1;
    const subj_clsId = result.tmp.classMap[triple.subject.value] || -1;
    if(obj_clsId < 0) {
      if(this.PredMap[triple.predicate.value] != this.Pred.SUB_CLASS_OF || triple.object.value != this.OWLThing)
        console.log("addSubClass error", triple)
      return;
    }
    const tattr = result.classAttribute[obj_clsId];
    if(!tattr.subClasses) tattr.subClasses = [];
    tattr.subClasses.push(subj_clsId);
    this.addSuperClass(attr, triple, result);
  }

  handleClassAttribute(preds, kind, result) {
    if(!preds[kind]) return;
    preds[kind].forEach((t) => {
      const clsId = result.tmp.classMap[t.subject.value] || -1;
      if(clsId < 0) return;
      const attr = result.classAttribute[clsId];
      switch(kind) {
        case this.Pred.COMMENT:
          this.addComment(attr, t);
          break;
        case this.Pred.LABEL:
          this.addLabel(attr, t);
          break;
        case this.Pred.SUB_CLASS_OF:
          this.addSubClass(attr, t, result);
          break;
        default:
          break;
      }
    });
  }

  insertClass(cls, iri, result) {
      const e = this.splitNS(iri, result);
      const isLiteral = this.isLiteral(iri);
      const isThing = this.isThing(iri);
      if(result.tmp.classMap[iri] !== undefined)
        return;
      let attr = {
        iri:iri,
        id : cls.id,
        label: { "IRI-based" : e.v},
        baseIri: this.cleanIri(e.ns)
      };
      if(!isLiteral && !isThing)
        attr.instances = 0;
      result.class.push(cls);
      result.classAttribute.push(attr);
      result.tmp.classMap[iri] = cls.id;
  }

  addClassFromType(preds, result) {
    if(!preds) return;
    preds.forEach((triple) => {
      const iri = triple.object.value;
      if(!this.isClass(iri))
        return;
      let cls = {
        id:result.class.length,
        type:this.getObjType(iri)
      };
      this.insertClass(cls, triple.subject.value, result);
    });
  }

  addClassFromEquivalentClass(preds, result) {
    if(!preds) return;
    preds.forEach((triple) => {
      var cls = {
        id:result.class.length,
        type:"owl:equivalentClass"
      };
      this.insertClass(cls, triple.subject.value, result);
      cls = {
        id:result.class.length,
        type:"owl:equivalentClass"
      };
      this.insertClass(cls, triple.object.value, result);
    });
  }

  addClassFromDomain(preds, result) {
    if(!preds) return;
    preds.forEach((triple) => {
      const iri = triple.object.value;
      let cls = {
        id:result.class.length,
        type:this.getObjType(iri)
      };
      this.insertClass(cls, iri, result);
    });
  }

  addClassFromRange(preds, result) {
    if(!preds) return;
    preds.forEach((triple) => {
      const iri = triple.object.value;
      let cls = {
        id:result.class.length,
        type:this.getObjType(iri)
      };
      this.insertClass(cls, iri, result);
    });
  }

  addClassFromSubClassOf(preds, result) {
    if(!preds) return;
    preds.forEach((triple) => {
      let cls = {
        id:result.class.length,
        type:"owl:Class"
      };
      var iri = triple.subject.value;
      if(!this.isThing(iri))
        this.insertClass(cls, iri, result);
      var iri = triple.object.value;
      if(!this.isThing(iri))
        this.insertClass(cls, iri, result);
    });
  }

  insertProperty(prop, iri, result) {
      const e = this.splitNS(iri, result);
      let propAttr = {
        iri:iri,
        id : prop.id,
        label: { "IRI-based" : e.v},
        baseIri: this.cleanIri(e.ns)
      };
      result.property.push(prop);
      result.propertyAttribute.push(propAttr);
      result.tmp.propMap[iri] = prop.id;
  }

  addPropFromDisjointWith(preds, result) {
    if(!preds) return;
    preds.forEach((t) => {
      let prop = {
        id:result.property.length,
        type:"owl:disjointWith"
      };
      let propAttr = {
        id : prop.id,
        domain: 0
      };
      result.property.push(prop);
      result.propertyAttribute.push(propAttr);
    });
    // TODO remove symmetric ones
  }

  addPropFromSubClassOf(preds, result) {
    if(!preds) return;
    preds.forEach((t) => {
      let prop = {
        id:result.property.length,
        type:"owl:SubClassOf"
      };
      let propAttr = {
        id : prop.id,
        domain: 0
      };
      result.property.push(prop);
      result.propertyAttribute.push(propAttr);
    });
    // TODO remove subclass of Thing
  }

  addPropFromType(preds, result) {
    if(!preds) return;
    preds.forEach((t) => {
      if(this.isProperty(this.ObjMap[t.object.value] || 0)) {
        let v = t.object.value;
        let prop = {
          id:result.property.length,
          type:this.extractType(v, result)
        };
        this.insertProperty(prop, t.subject.value, result);
      }
    });
  }

  handlePropAttribute(preds, kind, result, by_pred) {
    if(!preds[kind]) return;
    preds[kind].forEach((t) => {
      const propId = result.tmp.propMap[t.subject.value] || -1;
      if(propId < 0) return;
      const attr = result.propertyAttribute[propId];
      switch(kind) {
        case this.Pred.COMMENT:
          this.addComment(attr, t);
          break;
        case this.Pred.LABEL:
          this.addLabel(attr, t);
          break;
        case this.Pred.SUB_CLASS_OF:
          this.addSubClass(attr, t, result);
          break;
        default:
          break;
      }
    });
  }

  handlePreds(preds, result) {
    this.addClassFromEquivalentClass(preds[this.Pred.EQUIVALENT_CLASS],result);
    this.addClassFromType(preds[this.Pred.TYPE],result);
    this.addClassFromDomain(preds[this.Pred.DOMAIN],result);
    this.addClassFromRange(preds[this.Pred.RANGE],result);
    this.addClassFromSubClassOf(preds[this.Pred.SUB_CLASS_OF],result);

    this.handleClassAttribute(preds, this.Pred.LABEL, result);
    this.handleClassAttribute(preds, this.Pred.COMMENT, result);
    this.handleClassAttribute(preds, this.Pred.SUB_CLASS_OF, result);

    this.addPropFromDisjointWith(preds[this.Pred.DISJOINT_WITH], result);
    this.addPropFromSubClassOf(preds[this.Pred.SUB_CLASS_OF], result);
    this.addPropFromType(preds[this.Pred.TYPE], result);

    this.handlePropAttribute(preds, this.Pred.LABEL, result);
    this.handlePropAttribute(preds, this.Pred.COMMENT, result);
    // TODO collect all attribute data
  }

  handlePrefixList(result) {
    let list = result.header.prefixList = {};
    for(var ns in result.tmp.ns) {
      list[this.NamespaceKey[this.NamespaceMap[ns]]] = ns + (ns.endsWith("/") ? "" : "#");
    }
  }

  initResult(result) {
    result.header = {
      _comment : "Created with WebVOWL"
    };
    result.namespace = [];
    result.class = [];
    result.classAttribute = [];
    result.property = [];
    result.propertyAttribute = [];
    result.tmp = {ns:{}, classMap:{}, propMap:{}};
  }

  finiResult(result) {
    delete result.tmp;
  }

  transform(stmts) {
    var result = {};
    var preds = [...Array(this.PredCount)].map(_=>[]);
    stmts.forEach((s) => {
        const kind = this.PredMap[s.predicate.value] || 0;
        preds[kind].push(s);
    });
    this.initResult(result);
    this.handlePreds(preds, result);
    this.handlePrefixList(result);
    // TODO apply splitting rules
    this.finiResult(result);
    return result;
  }

};

let parser = new OWLParser();

try{
    rdflib.parse(rdfData,store,baseUrl,contentType);
    var stmts = store.statementsMatching(undefined, undefined , undefined);
    var result = parser.transform(stmts);
} catch(err){
    console.log(err);
}

/*
function find_class(g, f) {
  let cls =[];
  let r = [];
  g.class.forEach((it) => {
    if(it.type == f) {
      cls.push(it.id);
    }
  });
  g.classAttribute.forEach((it) => {
    if(cls.indexOf(it.id) != -1)
      r.push(it);
  });

  console.log("find_class", f);
  r.sort((a, b) => a.iri.localeCompare(b.iri));
  r.forEach((it) => {
    console.log(it.iri);
  });
  console.log(r.length);
}
function find_prop(g, f) {
  let cls =[];
  let r = [];
  g.property.forEach((it) => {
    if(it.type == f) {
      cls.push(it.id);
    }
  });
  g.propertyAttribute.forEach((it) => {
    if(cls.indexOf(it.id) != -1)
      r.push(it);
  });

  console.log("find_prop", f);
  r.sort((a, b) => a.iri.localeCompare(b.iri));
  r.forEach((it) => {
    console.log(it.iri);
  });
  console.log(r.length);
}
find_class(orig, "rdfs:Literal");
find_class(result, "rdfs:Literal");

find_class(orig, "owl:Class");
find_class(result, "owl:Class");

find_class(orig, "owl:equivalentClass");
find_class(result, "owl:equivalentClass");

find_class(orig, "owl:Thing");
find_class(result, "owl:Thing");
*/

function sort_data(data) {
  let attrMap = {};
  let propMap = {};
  let classIdMap = {};
  let propIdMap = {};
  data.classAttribute.forEach((it) => {
    attrMap[it.id] = it;
  });
  data.propertyAttribute.forEach((it) => {
    propMap[it.id] = it;
  });
  data.class.sort((a, b) => {
    return attrMap[a.id].iri.localeCompare(attrMap[b.id].iri);
  });
  data.property.sort((a, b) => {
    if(propMap[a.id].iri && !propMap[b.id].iri)
      return 1;
    if(!propMap[a.id].iri && propMap[b.id].iri)
      return -1;
    if(!propMap[a.id].iri && !propMap[b.id].iri)
      return attrMap[propMap[a.id].domain].iri.localeCompare(attrMap[propMap[b.id].domain].iri);
    return propMap[a.id].iri.localeCompare(propMap[b.id].iri);
  });
  for(var i = 0; i < data.class.length; i += 1) {
    data.classAttribute[i] = attrMap[data.class[i].id];
    classIdMap[data.class[i].id] = i;
  }
  for(var i = 0; i < data.property.length; i += 1) {
    data.propertyAttribute[i] = propMap[data.property[i].id];
    propIdMap[data.property[i].id] = i;
  }
  function fixClassIds(key, value, parent) {
    switch(key) {
      case "id":
        parent.id = classIdMap[value];
        break;
      case "equivalent":
      case "superClasses":
      case "subClasses":
        value.forEach((it, idx) => {
          value[idx] = classIdMap[it];
        });
        break;
      default:
        if(typeof value === "object") for(var k in value) fixClassIds(k, value[k], value);
        break;
    }
  }
  function fixPropClassIds(key, value, parent) {
    switch(key) {
      case "range":
        parent.range = classIdMap[value];
        break;
      case "domain":
        parent.domain = classIdMap[value];
        break;
      default:
        if(typeof value === "object") for(var k in value) fixPropClassIds(k, value[k], value);
        break;
    }
  }
  function fixPropIds(key, value, parent) {
    switch(key) {
      case "id":
        parent.id = propIdMap[value];
        break;
      case "inverse":
        parent.inverse = propIdMap[value];
        break;
      default:
        if(typeof value === "object") for(var k in value) fixPropIds(k, value[k], value);
        break;
    }
  }
  fixClassIds(null, data.class, null);
  fixClassIds(null, data.classAttribute, null);
  fixPropClassIds(null, data.propertyAttribute, null);
  fixPropIds(null, data.property, null);
  fixPropIds(null, data.propertyAttribute, null);

  function sortObj(key, value, parent) {
    if(Array.isArray(value)) {
      value.forEach((it, idx) => sortObj(idx, it, value));
    }
    else
    if(typeof value === "object") {
      for(var k in value) sortObj(k, value[k], value);
      let o = {}
      Object.keys(value).sort((a, b) => a.localeCompare(b)).forEach((key) => {
        o[key] = value[key];
      });
      if(parent)
        parent[key] = o;
      else
        return o;
    }
  }

  return sortObj(null, data, null);
}

result = sort_data(result);
console.log(JSON.stringify(result, null, 2));
