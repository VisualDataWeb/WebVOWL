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

  NamespaceMap = Object.freeze({
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
  });

  NamespaceKey = (() => {
    var keys = [];
    for(var key in this.Namespace) {
      keys.push(key.toLowerCase());
    }
    return keys;
  })();

  NamespaceType = (() => {
    var keys = [];
    keys.push("");
    for(var key in this.NamespaceMap) {
      keys.push(key);
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

  PredMap = Object.freeze({
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
  });

  PredCount = Object.getOwnPropertyNames(this.Pred).length;

  Obj = Object.freeze({
    UNKNOWN                    : 0,
    ONTOLOGY                   : 1,
    OWL_THING                  : 2,
    OWL_CLASS                  : 3,
    RDF_CLASS                  : 4,
    RDF_LABEL                  : 5,
    RDF_LITERAL                : 6,
    RDF_PROPERTY               : 7,
    OBJECT_PROPERTY            : 8,
    DATATYPE_PROPERTY          : 9,
    FUNCTIONAL_PROPERTY        : 10,
    INVERSE_FUNCTION_PROPERTY  : 11,
    ANNOTATION_PROPERTY        : 12
  });

  ObjMap = Object.freeze({
    "http://www.w3.org/2002/07/owl#Ontology"                        : this.Obj.ONTOLOGY,
    "http://www.w3.org/2002/07/owl#Thing"                           : this.Obj.OWL_THING,
    "http://www.w3.org/2002/07/owl#Class"                           : this.Obj.OWL_CLASS,
    "http://www.w3.org/2000/01/rdf-schema#Class"                    : this.Obj.RDF_CLASS,
    "http://www.w3.org/2000/01/rdf-schema#label"                    : this.Obj.RDF_LABEL,
    "http://www.w3.org/2000/01/rdf-schema#Literal"                  : this.Obj.RDF_LITERAL,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"           : this.Obj.RDF_PROPERTY,
    "http://www.w3.org/2002/07/owl#ObjectProperty"                  : this.Obj.OBJECT_PROPERTY,
    "http://www.w3.org/2002/07/owl#DatatypeProperty"                : this.Obj.DATATYPE_PROPERTY,
    "http://www.w3.org/2002/07/owl#FunctionalProperty"              : this.Obj.FUNCTIONAL_PROPERTY,
    "http://www.w3.org/2002/07/owl#InverseFunctionalProperty"       : this.Obj.INVERSE_FUNCTION_PROPERTY,
    "http://www.w3.org/2002/07/owl#AnnotationProperty"              : this.Obj.ANNOTATION_PROPERTY
  });

  ObjKey = (() => {
    var keys = [];
    keys.push("")
    for(var key in this.ObjMap) {
      keys.push(key);
    }
    return keys;
  })();

  ObjCount = Object.getOwnPropertyNames(this.Obj).length;

  ObjClassType = (() => {
    var keys = [];
    keys.push("");
    for(var key in this.ObjMap) {
      keys.push(this.extractType(key));
    }
    return keys;
  })();


  Attr = Object.freeze({
    OBJECT             : 0,
    DATATYPE           : 1,
    ANONYMOUS          : 2,
    EXTERNAL           : 3,
    EQUIVALENT         : 4,
    FUNCTIONAL         : 5,
    INVERSE_FUNCTIONAL : 6,
  });

  AttrNames = (() => {
    var keys = [];
    for(var key in this.Attr) {
      keys.push(key.toLowerCase().replace("_", " "));
    }
    return keys;
  })();

  AttrMap = Object.freeze((() => {
    let r = {};
    r[this.Obj.OBJECT_PROPERTY]           = this.AttrNames[this.Attr.OBJECT];
    r[this.Obj.DATATYPE_PROPERTY]         = this.AttrNames[this.Attr.DATATYPE];
    r[this.Obj.FUNCTIONAL_PROPERTY]       = this.AttrNames[this.Attr.FUNCTIONAL];
    r[this.Obj.INVERSE_FUNCTION_PROPERTY] = this.AttrNames[this.Attr.INVERSE_FUNCTIONAL];
    return r;
  })());

  isClass(obj_val) {
    const obj_kind = this.ObjMap[obj_val];
    return obj_kind == this.Obj.OWL_CLASS ||
           obj_kind == this.Obj.OWL_THING ||
           obj_kind == this.Obj.RDF_LITERAL;
  }

  isLiteral(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.RDF_LITERAL;
  }

  isLiteralTerm(obj) {
    return obj.termType == "Literal";
  }

  isThing(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.OWL_THING;
  }

  isProperty(obj_kind) {
    return obj_kind == this.Obj.OBJECT_PROPERTY ||
           obj_kind == this.Obj.DATATYPE_PROPERTY ||
           obj_kind == this.Obj.FUNCTIONAL_PROPERTY ||
           obj_kind == this.Obj.INVERSE_FUNCTION_PROPERTY;
  }

  splitNS(v) {
    const url = new URL(v);
    const h = url.hash != "";
    const ns = v.substr(0, h ? v.length - url.hash.length : v.lastIndexOf("/") + 1);
    return {ns:ns, v:v.substr(ns.length + h)};
  }

  extractType(v) {
    var e = this.splitNS(v);
    if(this.isProperty(this.ObjMap[v]))
      e.v = e.v[0].toLowerCase() + e.v.slice(1)
    return this.NamespaceKey[this.NamespaceMap[e.ns]] + ":" + e.v;
  }

  getObjType(iri) {
    return this.ObjClassType[this.ObjMap[iri] ?? this.Obj.OWL_CLASS];
  }

  cleanIri(iri) {
    if(iri.endsWith("/"))
      return iri.slice(0, -1);
    return iri;
  }

  addLang(obj, result) {
    const lang = obj.language || "undefined";
    result.tmp.lang[lang] = 1;
    return lang;
  }

  addComment(attr, triple, result) {
    if(!attr.comment) attr.comment = {};
    attr.comment[this.addLang(triple.object, result)] = triple.object.value;
  }

  addLabel(attr, triple, result) {
    attr.label[this.addLang(triple.object, result)] = triple.object.value;
  }

  addDescription(attr, triple, result) {
    if(!attr.description) attr.description = {};
    attr.description[this.addLang(triple.object, result)] = triple.object.value;
  }

  addTitle(attr, triple, result) {
    if(!attr.title) attr.title = {};
    attr.title[this.addLang(triple.object, result)] = triple.object.value;
  }

  addDomain(attr, triple, result) {
    attr.domain = result.tmp.classMap[triple.object.value];
  }

  addRange(attr, triple, result) {
    attr.range = result.tmp.classMap[triple.object.value];
  }

  addPropInverse(attr, triple, result) {
    const propId = result.tmp.propMap[triple.object.value];
    if(result.propertyAttribute[propId].inverse === undefined)
      attr.inverse = propId;
  }

  addPropEquivalent(attr, targetIri, result) {
    const clsId = result.tmp.classMap[targetIri] ?? -1;
    if(clsId < 0) {
      console.log("not found", targetIri);
      return;
    }
    if(!result.classAttribute[clsId].equivalent ||
       result.classAttribute[clsId].equivalent.indexOf(attr.id) == -1) {
      if(!attr.equivalent)
        attr.equivalent = [];
      attr.equivalent.push(clsId);
    }
  }

  addSubProperty(attr, triple, result) {
    const obj_propId = result.tmp.propMap[triple.object.value] ?? -1;
    const subj_propId = result.tmp.propMap[triple.subject.value] ?? -1;
    if(obj_propId == -1 || subj_propId == -1)
      return;
    const tattr = result.propertyAttribute[obj_propId];
    if(!tattr.subproperty) tattr.subproperty = [];
    tattr.subproperty.push(subj_propId);
    this.addSuperProperty(attr, triple, result);
  }

  addSuperProperty(attr, triple, result) {
    if(!attr.superproperty) attr.superproperty = [];
    attr.superproperty.push(result.tmp.propMap[triple.object.value]);
  }

  addSuperClass(attr, triple, result) {
    if(!attr.superClasses) attr.superClasses = [];
    attr.superClasses.push(result.tmp.classMap[triple.object.value]);
  }

  addSubClass(attr, triple, result) {
    const obj_clsId = result.tmp.classMap[triple.object.value] ?? -1;
    const subj_clsId = result.tmp.classMap[triple.subject.value] ?? -1;
    if(obj_clsId < 0) {
      if(this.PredMap[triple.predicate.value] != this.Pred.SUB_CLASS_OF || triple.object.value != this.OWLThing)
        console.log("addSubClass error", triple)
      return;
    }
    const tattr = result.classAttribute[obj_clsId];
    if(!this.isThing(tattr.iri)) {
      if(!tattr.subClasses) tattr.subClasses = [];
      tattr.subClasses.push(subj_clsId);
      this.addSuperClass(attr, triple, result);
    }
  }

  handleClassAttribute(preds, kind, result) {
    if(!preds[kind]) return;
    preds[kind].forEach((t) => {
      const clsId = result.tmp.classMap[t.subject.value] ?? -1;
      if(clsId < 0) return;
      const attr = result.classAttribute[clsId];
      switch(kind) {
        case this.Pred.COMMENT:
          this.addComment(attr, t, result);
          break;
        case this.Pred.LABEL:
          this.addLabel(attr, t, result);
          break;
        case this.Pred.SUB_CLASS_OF:
          this.addSubClass(attr, t, result);
          break;
        default:
          break;
      }
    });
  }

  cloneClass(clsId, result) {
    let cls = Object.assign({}, result.class[clsId]);
    let attr = Object.assign({}, result.classAttribute[clsId]);
    cls.id = result.class.length;
    attr.id = cls.id;
    result.class.push(cls);
    result.classAttribute.push(attr);
    return cls.id;
  }

  insertClass(cls, iri, result) {
      const e = this.splitNS(iri);
      const isLiteral = this.isLiteral(iri);
      const isThing = this.isThing(iri);
      if(result.tmp.classMap[iri] !== undefined)
          return;
      let base = this.cleanIri(e.ns);
      let attr = {
        iri:iri,
        id : cls.id,
        label: { "IRI-based" : e.v},
      };
      if(!isLiteral && !isThing) {
        if(base != result.tmp.cleanBaseIri)
          this.addAttr(attr, this.Attr.EXTERNAL);
        attr.instances = 0;
      } else {
        delete attr.label["IRI-based"];
        attr.label["undefined"] = e.v;
      }

      if(!isThing && !isLiteral)
        attr.baseIri = base;

      if(attr.baseIri)
        result.tmp.baseIris[attr.baseIri] = 1;

      result.class.push(cls);
      result.classAttribute.push(attr);
      result.tmp.classMap[iri] = cls.id;
      return attr;
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
      let attrA = this.insertClass(cls, triple.subject.value, result);
      if(attrA)
        this.addAttr(attrA, this.Attr.EQUIVALENT);

      cls = {
        id:result.class.length,
        type:"owl:equivalentClass"
      };
      let attrB = this.insertClass(cls, triple.object.value, result);
      if(attrB)
        this.addAttr(attrB, this.Attr.EQUIVALENT);

      if(attrA)
        this.addPropEquivalent(attrA, triple.object.value, result);
      if(attrB)
        this.addPropEquivalent(attrB, triple.subject.value, result);
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

  addAttr(attr, v) {
    if(!attr.attributes) attr.attributes = [];
    attr.attributes.push(this.AttrNames[v]);
  }

  updateProp(orig, other) {
    if(this.ObjClassType.indexOf(orig.type) > this.ObjClassType.indexOf(other.type)) {
      orig.type = other.type;
    }
  }

  addPropType(attr, type) {
    if(!attr.attributes) attr.attributes = [];
    attr.attributes.push(this.AttrMap[type] ?? "undefined");
  }

  insertProp(prop, type, iri, result) {
      const e = this.splitNS(iri);
      let propAttr = {
        iri:iri,
        id : prop.id,
        label: { "IRI-based" : e.v},
        baseIri: this.cleanIri(e.ns)
      };
      let propId = result.tmp.propMap[iri];
      if(propId !== undefined) {
        this.updateProp(result.property[propId], prop);
        this.addPropType(result.propertyAttribute[propId], type);
        return;
      }
      this.addPropType(propAttr, type);
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

      let objId = result.tmp.classMap[t.object.value];
      let subjId = result.tmp.classMap[t.subject.value];
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

      if(!result.tmp.disjointMap[mapKey]) {
        result.tmp.disjointMap[mapKey] = 1;
        this.addAttr(propAttr, this.Attr.OBJECT);
        this.addAttr(propAttr, this.Attr.ANONYMOUS);
        result.property.push(prop);
        result.propertyAttribute.push(propAttr);
      }
    });
  }

  addPropFromSubClassOf(preds, result) {
    if(!preds) return;
    preds.forEach((t) => {
      let prop = {
        id:result.property.length,
        type:"rdfs:SubClassOf"
      };
      let propAttr = {
        id : prop.id,
        domain: 0
      };
      if(this.isThing(t.object.value))
        return;
      let objId = result.tmp.classMap[t.object.value];
      let subjId = result.tmp.classMap[t.subject.value];

      propAttr.range = objId;
      propAttr.domain = subjId;

      this.addAttr(propAttr, this.Attr.OBJECT);
      this.addAttr(propAttr, this.Attr.ANONYMOUS);
      result.property.push(prop);
      result.propertyAttribute.push(propAttr);
    });
  }

  addPropFromType(preds, result) {
    if(!preds) return;
    preds.forEach((t) => {
      const propType = this.ObjMap[t.object.value] ?? 0;
      if(this.isProperty(propType)) {
        let v = t.object.value;
        let prop = {
          id:result.property.length,
          type:this.extractType(v)
        };
        this.insertProp(prop, propType, t.subject.value, result);
      }
    });
  }

  handlePropAttribute(preds, kind, result, by_pred) {
    if(!preds[kind]) return;
    preds[kind].forEach((t) => {
      const propId = result.tmp.propMap[t.subject.value] ?? -1;
      if(propId < 0) return;
      const attr = result.propertyAttribute[propId];
      switch(kind) {
        case this.Pred.COMMENT:
          this.addComment(attr, t, result);
          break;
        case this.Pred.LABEL:
          this.addLabel(attr, t, result);
          break;
        case this.Pred.SUB_CLASS_OF:
          this.addSubClass(attr, t, result);
          break;
        case this.Pred.DOMAIN:
          this.addDomain(attr, t, result);
          break;
        case this.Pred.RANGE:
          this.addRange(attr, t, result);
          break;
        case this.Pred.INVERSE_OF:
          this.addPropInverse(attr, t, result);
          break;
        case this.Pred.SUB_PROPERTY_OF:
          this.addSubProperty(attr, t, result);
          break;
        default:
          break;
      }
    });
  }

  handleDescription(preds, result) {
    if(!preds) return;
    preds.forEach((t) => {
      const iri = this.cleanIri(t.subject.value);
      if(iri == result.tmp.cleanBaseIri) {
        this.addDescription(result.header, t, result);
      }
    });
  }

  handleTitle(preds, result) {
    if(!preds) return;
    const base = this.cleanIri(baseIri);
    preds.forEach((t) => {
      const iri = this.cleanIri(t.subject.value);
      if(iri == base) {
        this.addTitle(result.header, t, result);
      }
    });
  }

  addDefinedBy(target, triple, result) {
    if(!target.annotations) target.annotations = {};
    if(!target.annotations.isDefinedBy) target.annotations.isDefinedBy = [];
    let definedBy = {
        identifier: "isDefinedBy",
        language: "undefined",
        type: "iri",
        value: triple.object.value
    }
    this.addLang(definedBy, result);
    target.annotations.isDefinedBy.push(definedBy);
  }

  addTermStatus(target, triple, result) {
    if(!target.annotations) target.annotations = {};
    if(!target.annotations.term_status) target.annotations.term_status = [];
    const isLiteral = this.isLiteralTerm(triple.object) || this.isLiteral(triple.object.value);
    let term_status = {
        identifier: "term_status",
        value: triple.object.value
    }
    if(isLiteral) {
      term_status.type = "label"
      term_status.language = this.addLang(triple.object, result);
    }
    target.annotations.term_status.push(term_status);
  }

  handleDefinedBy(preds, result) {
    if(!preds) return;
    preds.forEach((t) => {
      var id = result.tmp.classMap[t.subject.value] ?? -1;
      if(id >= 0) {
        this.addDefinedBy(result.classAttribute[id], t, result);
        return;
      }
      id = result.tmp.propMap[t.subject.value] ?? -1;
      if(id >= 0) {
        this.addDefinedBy(result.propertyAttribute[id], t, result);
        return;
      }
    });
  }

  handleTermStatus(preds, result) {
    if(!preds) return;
    preds.forEach((t) => {
      var id = result.tmp.classMap[t.subject.value] ?? -1;
      if(id >= 0) {
        this.addTermStatus(result.classAttribute[id], t, result);
        return;
      }
      id = result.tmp.propMap[t.subject.value] ?? -1;
      if(id >= 0) {
        this.addTermStatus(result.propertyAttribute[id], t, result);
        return;
      }
    });
  }

  sanatizeResult(result) {
    const literalIri = this.ObjKey[this.Obj.RDF_LITERAL];
    const thingIri = this.ObjKey[this.Obj.OWL_THING];
    result.propertyAttribute.forEach((it) => {
      if(!it.attributes)
        return;
      if(it.attributes.indexOf(this.AttrNames[this.Attr.OBJECT]) != -1) {
        if(it.range == undefined)
          it.range = result.tmp.classMap[thingIri];
        if(it.domain == undefined)
          it.domain = result.tmp.classMap[thingIri];
      } else {
        const idx = it.attributes.indexOf(this.AttrNames[this.Attr.INVERSE_FUNCTIONAL]);
        var hasObj = false;
        if(idx != -1) {
          const propId = result.tmp.propMap[it.iri];
          if(it.attributes.indexOf(this.AttrNames[this.Attr.DATATYPE]) != -1) {
            it.attributes.splice(idx, 1);
          } else {
            it.attributes.push(this.AttrNames[this.Attr.OBJECT]);
            this.updateProp(result.property[propId], {type:this.ObjClassType[this.Obj.OBJECT_PROPERTY]});
            hasObj = true;
          }
        }

        if(!hasObj && it.subproperty) {
          it.subproperty.forEach((propId) => {
            let target = result.propertyAttribute[propId];
            let idx = target.superproperty.indexOf(it.id);
            target.superproperty.splice(idx, 1);
            if(target.superproperty.length == 0)
              delete target.superproperty;
          });
          delete it.subproperty;
        }
      }
      if(it.attributes.indexOf(this.AttrNames[this.Attr.DATATYPE]) != -1) {
        if(it.domain == undefined)
          it.domain = result.tmp.classMap[thingIri];
        if(it.range == undefined)
          it.range = result.tmp.classMap[literalIri];
      }
    });
  }

  applySplitRules(result) {
    const literalIri = this.ObjKey[this.Obj.RDF_LITERAL];
    const thingIri = this.ObjKey[this.Obj.OWL_THING];
    const literalClsId = result.tmp.classMap[literalIri];
    const thingClsId = result.tmp.classMap[thingIri];

    let thingMap = {};

    var notFirst = {};
    var id = {};
    function add(clsId) {
      return (() => {
        if(!notFirst[clsId]) {
          notFirst[clsId] = true;
          id[clsId] = clsId;
          return clsId;
        }
        if(id[clsId] == -1)
          id[clsId] = this.cloneClass(clsId, result);
        return id[clsId];
      }).bind(this);
    }
    const addLiteral = add.call(this, literalClsId);
    const addThing = ((linkClsId) => {
      if(thingMap[linkClsId] === undefined) {
        thingMap[linkClsId] = this.cloneClass(thingClsId, result);
      }
      return thingMap[linkClsId];
    }).bind(this);
    result.propertyAttribute.forEach(((it) => {
      id[literalClsId] = -1;

      if(it.range === literalClsId)
        it.range = addLiteral();
      if(it.domain === literalClsId)
        it.domain = addLiteral();

      if(it.range != thingClsId || it.domain != thingClsId) {
        if(it.range === thingClsId && !this.isLiteral(result.classAttribute[it.domain].iri))
          it.range = addThing(it.domain);
        if(it.domain === thingClsId && !this.isLiteral(result.classAttribute[it.range].iri))
          it.domain = addThing(it.range);
      }
    }).bind(this));
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
    this.handlePropAttribute(preds, this.Pred.DOMAIN, result);
    this.handlePropAttribute(preds, this.Pred.RANGE, result);
    this.handlePropAttribute(preds, this.Pred.INVERSE_OF, result);
    this.handlePropAttribute(preds, this.Pred.SUB_PROPERTY_OF, result);

    this.handleDescription(preds[this.Pred.DESCRIPTION], result);
    this.handleTitle(preds[this.Pred.TITLE], result);
    this.handleDefinedBy(preds[this.Pred.IS_DEFINED_BY], result);
    this.handleTermStatus(preds[this.Pred.TERM_STATUS], result);

    // TODO check and collect all data
  }

  handlePrefixList(namespaces, result) {
    let list = result.header.prefixList = {};

    list[this.NamespaceKey[this.Namespace.OWL]] = this.NamespaceType[this.Namespace.OWL] + "#";
    list[this.NamespaceKey[this.Namespace.RDFS]] = this.NamespaceType[this.Namespace.RDFS] + "#";
    list[this.NamespaceKey[this.Namespace.RDF]] = this.NamespaceType[this.Namespace.RDF] + "#";
    list[this.NamespaceKey[this.Namespace.XSD]] = this.NamespaceType[this.Namespace.XSD] + "#";
    list[this.NamespaceKey[this.Namespace.XML]] = this.NamespaceType[this.Namespace.XML];

    for(var ns in namespaces) {
      list[ns] = namespaces[ns];
    }
  }

  handleLanguages(result) {
    let list = result.header.languages = [];
    for(var lang in result.tmp.lang) {
      list.push(lang);
    }
  }

  handleBaseIris(result) {
    let list = result.header.baseIris = [];

    const string = this.NamespaceType[this.Namespace.XSD] + "#string";
    result.tmp.baseIris[this.cleanIri(this.splitNS(string).ns)] = 1;

    for(var iri in result.tmp.baseIris) {
      list.push(iri);
    }
  }

  initResult(result, baseIri) {
    result._comment = "Created with WebVOWL";
    result.header = {
      iri:baseIri
    };
    result.namespace = [];
    result.class = [];
    result.classAttribute = [];
    result.property = [];
    result.propertyAttribute = [];
    result.tmp = {
      lang:{},
      classMap:{},
      propMap:{},
      disjointMap:{},
      baseIris:{},
      cleanBaseIri:this.cleanIri(baseIri)
    };
  }

  finiResult(result) {
    delete result.tmp;
  }

  transform(stmts, baseIri, namespaces) {
    var result = {};
    var preds = [...Array(this.PredCount)].map(_=>[]);
    stmts.forEach((s) => {
        const kind = this.PredMap[s.predicate.value] ?? 0;
        preds[kind].push(s);
    });
    this.initResult(result, baseIri);
    this.handlePreds(preds, result);
    this.sanatizeResult(result);
    this.applySplitRules(result);
    this.handleBaseIris(result);
    this.handlePrefixList(namespaces, result);
    this.handleLanguages(result);
    this.finiResult(result);
    return result;
  }

};

let parser = new OWLParser();

try {
    const file = process.argv[2];
    var rdfData = fs.readFileSync(file).toString();
    var store = rdflib.graph();
    var contentType = 'application/rdf+xml';
    var baseIri = "http://xmlns.com/foaf/0.1/";
    rdflib.parse(rdfData, store, baseIri, contentType);
    var stmts = store.statementsMatching(undefined, undefined , undefined);
    var result = parser.transform(stmts, baseIri, store.namespaces);
} catch(err){
    console.log(err);
}


function sort_data(data) {
  let attrMap = {};
  let propMap = {};
  let classIdMap = {};
  let propIdMap = {};
  let splitMap = {}
  let splitIds = {};
  function can_cmp(a, b) { return a != b; }
  function cmp(a, b) { return (a || "").localeCompare(b || ""); }
  data.class.forEach((it, idx) => {
    classIdMap[it.id] = idx;
  });
  data.property.forEach((it, idx) => {
    propIdMap[it.id] = idx;
  });
  data.classAttribute.forEach((it) => {
    attrMap[it.id] = it;
  });
  data.propertyAttribute.forEach((it) => {
    propMap[it.id] = it;
    if(it.attributes && it.attributes.indexOf("anonymous") != -1) {
      if(data.property[propIdMap[it.id]].type == "owl:disjointWith") {
          if(data.classAttribute[classIdMap[it.domain]].iri.localeCompare(data.classAttribute[classIdMap[it.range]].iri) > 0) {
            let tmp = it.domain;
            it.domain = it.range;
            it.range = tmp;
          }
      }
    }
  });
  data.property.sort((a, b) => {
    if(can_cmp(a.type, b.type))
      return cmp(a.type, b.type);
    if(can_cmp(propMap[a.id].iri, propMap[b.id].iri))
      return cmp(propMap[a.id].iri, propMap[b.id].iri);
    if(can_cmp(data.classAttribute[classIdMap[propMap[a.id].domain]].iri,
               data.classAttribute[classIdMap[propMap[b.id].domain]].iri))
      return cmp(data.classAttribute[classIdMap[propMap[a.id].domain]].iri,
                data.classAttribute[classIdMap[propMap[b.id].domain]].iri);
    return cmp(data.classAttribute[classIdMap[propMap[a.id].range]].iri,
              data.classAttribute[classIdMap[propMap[b.id].range]].iri);
  });
  data.class.sort((a, b) => {
    return attrMap[a.id].iri.localeCompare(attrMap[b.id].iri);
  });
  for(var i = 0; i < data.class.length; i += 1) {
    let it = data.class[i];
    let clsId = it.id;
    data.classAttribute[i] = attrMap[clsId];
    classIdMap[clsId] = i;

    if(it.type == "owl:Thing" || it.type == "rdfs:Literal") {
      splitMap[it.id] = {type:it.type};
      if(!splitIds[it.type]) splitIds[it.type] = [];
      splitIds[it.type].push(i);
    }
  }
  for(var i = 0; i < data.property.length; i += 1) {
    let it = data.property[i];
    let propId = it.id;
    data.propertyAttribute[i] = propMap[propId];
    propIdMap[propId] = i;
  }
  function fixClassIds(key, value, parent) {
    switch(key) {
      case "id":
        parent.id = classIdMap[value];
        break;
      case "superClasses":
      case "subClasses":
        value.forEach((it, idx) => {
          value[idx] = classIdMap[it];
        });
        value.sort();
        break;
      case "attributes":
        parent.attributes = value.sort();
        break;
      default:
        if(typeof value === "object") for(var k in value) fixClassIds(k, value[k], value);
        break;
    }
  }
  function fixClassAttrs(key, value, parent) {
    switch(key) {
      case "equivalent":
        var a = [];
        value.forEach((it, idx) => {
          value[idx] = classIdMap[it];

          let target = data.classAttribute[value[idx]];
          if(parent.iri.localeCompare(target.iri) > 0) {
            if(!target.equivalent) target.equivalent = [];
            target.equivalent.push(parent.id);
          } else {
            a.push(value[idx]);
          }
        });
        parent[key] = a;
        if(a.length == 0)
          delete parent[key];
        a.sort();
        break;
      default:
        if(typeof value === "object") for(var k in value) fixClassAttrs(k, value[k], value);
        break;
    }
  }
  function getClassId(id) {
    let splitClass = splitMap[id];
    if(splitClass) {
      if(splitClass.target === undefined)
        splitClass.target = splitIds[splitClass.type].pop();
      return splitClass.target;
    }
    return classIdMap[id];
  }
  function fixPropClassIds(key, value, parent) {
    switch(key) {
      case "id":
        parent.id = propIdMap[value];
        break;
      case "range":
        parent.range = getClassId(value);
        break;
      case "domain":
        parent.domain = getClassId(value);
        break;
      default:
        if(typeof value === "object") {
          if(Array.isArray(value)) {
            value.forEach((_, k) => fixPropClassIds(k, value[k], value));
          } else {
            let keys = Object.keys(value);
            keys.sort();
            keys.forEach((k) => fixPropClassIds(k, value[k], value));
          }
        }
        break;
    }
  }
  function fixPropAttr(key, value, parent) {
    switch(key) {
      case "inverse":
        parent.inverse = propIdMap[value];
        let target = data.propertyAttribute[parent.inverse];
        if(parent.iri.localeCompare(target.iri) > 0) {
          target.inverse = parent.id;
          delete parent.inverse;
        }
        break;
      case "attributes":
        parent.attributes = value.sort();
        break;
      case "subproperty":
      case "superproperty":
        value.forEach((it, idx) => {
          value[idx] = propIdMap[it];
        });
        value.sort();
        break;
      default:
        if(typeof value === "object") for(var k in value) fixPropAttr(k, value[k], value);
        break;
    }
  }
  function fixPropIds(key, value, parent) {
    switch(key) {
      case "id":
        parent.id = propIdMap[value];
        break;
      default:
        if(typeof value === "object") for(var k in value) fixPropIds(k, value[k], value);
        break;
    }
  }
  fixClassIds(null, data.class, null);
  fixClassIds(null, data.classAttribute, null);
  fixClassAttrs(null, data.classAttribute, null);
  fixPropClassIds(null, data.propertyAttribute, null);
  fixPropIds(null, data.property, null);
  fixPropAttr(null, data.propertyAttribute, null);

  function sortObj(key, value, parent) {
    if(Array.isArray(value)) {
      value.forEach((it, idx) => sortObj(idx, it, value));
      if(key == "baseIris")
        value.sort();
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

function print_thing(result) {
  let thingMap = {};
  let classMap = {};
  result.class.forEach((it) => {
    if(it.type == "owl:Thing") {
      thingMap[it.id] = {props:[]};
    }
  });

  result.classAttribute.forEach((it) => {
    classMap[it.id] = it;
  });

  result.propertyAttribute.forEach((it) => {
    if(thingMap[it.range])
      thingMap[it.range].props.push(it);
    if(thingMap[it.domain])
      thingMap[it.domain].props.push(it);
  });

  for(let k in thingMap) {
    console.log("Thing", k);
    thingMap[k].props.forEach((prop) => {
      console.log(prop.iri, ", domain:", classMap[prop.domain].iri, ", range:", classMap[prop.range].iri);
    });
  }
}

result = sort_data(result);
console.log(JSON.stringify(result, null, 2));
