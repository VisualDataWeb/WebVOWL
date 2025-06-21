export class OWLParser {
  Mime = Object.freeze({
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

  MimeMap = Object.freeze({
    "application/trig"         :  this.Mime.TRIG,
    "application/n-quads"      :  this.Mime.N_QUADS,
    "application/text/turtle"  :  this.Mime.TURTLE,
    "application/n-triples"    :  this.Mime.N_TRIPLES,
    "text/n3"                  :  this.Mime.N3,
    "application/json"         :  this.Mime.JSON,
    "application/ld+json"      :  this.Mime.JSON_LD,
    "application/rdf+xml"      :  this.Mime.RDF,
    "text/html"                :  this.Mime.HTML,
    "application/xhtml+xml"    :  this.Mime.XHTML_XML,
    "application/xml"          :  this.Mime.XML,
    "image/svg+xml"            :  this.Mime.SVG,
    "text/shaclc"              :  this.Mime.SHACLC,
    "text/shaclc-ext"          :  this.Mime.SHACLC_EXT
  });

  MimeType = (() => {
    var keys = [];
    keys.push("");
    for(var key in this.MimeMap) {
      keys.push(key);
    }
    return keys;
  })();

  MimeExt = [
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
            ];

  MimeExtMap = (() => {
    var map = {};
    var idx = 1;
    for(const items of this.MimeExt) {
      for(const ext of items) {
        map[ext] = this.MimeType[idx];
      }
      idx += 1;
    }
    return Object.freeze(map);
  })();


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
    for(const key in this.Namespace) {
      keys.push(key.toLowerCase());
    }
    return keys;
  })();

  NamespaceType = (() => {
    var keys = [];
    keys.push("");
    for(const key in this.NamespaceMap) {
      keys.push(key);
    }
    return keys;
  })();

  NamespaceIgnore = (() => {
    const values = [this.Namespace.OWL,
                    this.Namespace.RDF,
                    this.Namespace.RDFS,
                    this.Namespace.SWRL,
                    this.Namespace.SWRLB,
                    this.Namespace.XML,
                    this.Namespace.XSD];
    var map = {};
    var idx = 1;
    for(const it of values) {
        map[this.NamespaceType[it]] = idx;
        idx += 1;
    }
    return Object.freeze(map);
  })();

  Pred = Object.freeze({
    UNKNOWN               : 0,
    DC_TERMS              : 1,
    VERSION_INFO          : 2,
    VERSION_IRI           : 3,
    IMPORTS               : 4,
    TYPE                  : 5,
    DESCRIPTION           : 6,
    TITLE                 : 7,
    VALUE                 : 8,
    TERM_STATUS           : 9,
    LABEL                 : 10,
    COMMENT               : 11,
    IS_DEFINED_BY         : 12,
    EQUIVALENT_CLASS      : 13,
    SUB_CLASS_OF          : 14,
    DISJOINT_WITH         : 15,
    DOMAIN                : 16,
    RANGE                 : 17,
    SUB_PROPERTY_OF       : 18,
    INVERSE_OF            : 19,
    EQUIVALENT_PROPERTY   : 20
  });

  PredMap = Object.freeze({
    "http://purl.org/dc/terms/"                                 : this.Pred.DC_TERMS,
    "http://www.w3.org/2002/07/owl#versionInfo"                 : this.Pred.VERSION_INFO,
    "http://www.w3.org/2002/07/owl#versionIRI"                  : this.Pred.VERSION_IRI,
    "http://www.w3.org/2002/07/owl#imports"                     : this.Pred.IMPORTS,
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



  PredKey = (() => {
    var keys = [];
    keys.push("")
    for(const key in this.PredMap) {
      keys.push(key);
    }
    return keys;
  })();

  PredCount = Object.getOwnPropertyNames(this.Pred).length;

  Obj = Object.freeze({
    UNKNOWN                    : 0,
    ONTOLOGY                   : 1,
    OWL_NAMED_INDIVIDUAL       : 2,
    OWL_THING                  : 3,
    OWL_CLASS                  : 4,
    RDF_DATATYPE               : 5,
    RDF_CLASS                  : 6,
    RDF_LABEL                  : 7,
    RDF_LITERAL                : 8,
    RDF_PROPERTY               : 9,
    OBJECT_PROPERTY            : 10,
    DATATYPE_PROPERTY          : 11,
    FUNCTIONAL_PROPERTY        : 12,
    INVERSE_FUNCTION_PROPERTY  : 13,
    ANNOTATION_PROPERTY        : 14
  });

  ObjMap = Object.freeze({
    "http://www.w3.org/2002/07/owl#Ontology"                        : this.Obj.ONTOLOGY,
    "http://www.w3.org/2002/07/owl#NamedIndividual"                 : this.Obj.OWL_NAMED_INDIVIDUAL,
    "http://www.w3.org/2002/07/owl#Thing"                           : this.Obj.OWL_THING,
    "http://www.w3.org/2002/07/owl#Class"                           : this.Obj.OWL_CLASS,
    "http://www.w3.org/2000/01/rdf-schema#Datatype"                 : this.Obj.RDF_DATATYPE,
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
    for(const key in this.ObjMap) {
      keys.push(key);
    }
    return keys;
  })();

  ObjCount = Object.getOwnPropertyNames(this.Obj).length;

  ObjClassType = (() => {
    var keys = [];
    keys.push("");
    for(const key in this.ObjMap) {
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
    UNION              : 7
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

  isIndiv(obj_val) {
    const obj_kind = this.ObjMap[obj_val];
    return obj_kind == this.Obj.OWL_NAMED_INDIVIDUAL;
  }

  isLiteral(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.RDF_LITERAL;
  }

  isLabel(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.RDF_LABEL;
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
    let r = {ns:ns, v:v.substr(ns.length + h)};
    if(v.endsWith("/")) {
      let ns = r.ns.slice(0, -1); ;
      r.ns = ns.substr(0, ns.lastIndexOf("/"));
      r.v = "";
    }
    return r;
  }

  extractType(v) {
    var e = this.splitNS(v);
    if(this.isProperty(this.ObjMap[v]))
      e.v = e.v[0].toLowerCase() + e.v.slice(1)
    return this.NamespaceKey[this.NamespaceMap[e.ns]] + ":" + e.v;
  }

  getObjType(iri) {
    var ty = this.ObjMap[iri] || (this.NamespaceIgnore[this.splitNS(iri).ns] ? this.Obj.RDF_DATATYPE : this.Obj.OWL_CLASS);
    return this.ObjClassType[ty];
  }

  getPropType(iri, result) {
    switch(iri) {
        case "http://www.w3.org/2002/07/owl#topObjectProperty":
            return this.Obj.OBJECT_PROPERTY;
        case "http://www.w3.org/2002/07/owl#topDataProperty":
            return this.Obj.DATATYPE_PROPERTY;
    }
    return this.Obj.OBJECT_PROPERTY;
  }

  cleanIri(iri) {
    if(iri.endsWith("/") || iri.endsWith("#"))
      return iri.slice(0, -1);
    return iri;
  }

  cleanBaseIri(iri) {
    if(iri.endsWith("#"))
      return iri.slice(0, -1);
    return iri;
  }

  addLang(obj, result) {
    const lang = obj.language || "undefined";
    result.tmp.lang[lang] = 1;
    return lang;
  }

  addComment(attr, triple, result) {
    let comment = attr.comment || (attr.comment = {});
    comment[this.addLang(triple.object, result)] = triple.object.value;
  }

  addLabel(attr, triple, result) {
    attr.label[this.addLang(triple.object, result)] = triple.object.value;
  }

  addDescription(attr, triple, result) {
    let description = attr.description || (attr.description = {});
    description[this.addLang(triple.object, result)] = triple.object.value;
  }

  addTitle(attr, triple, result) {
    let title = attr.title || (attr.title = {});
    title[this.addLang(triple.object, result)] = triple.object.value;
  }

  addOther(attr, type, triple, result) {
    let other = attr.other || (attr.other = {});
    let ot = other[type] || (other[type] = []);
    let obj  = triple.object;
    let e = obj.termType == "Literal" ? "label" : "iri";
    let item = {
      identifier:type,
      language:obj.language || "undefined",
      type:e,
      value:obj.value
    };

    this.addLang(obj, result);
    ot.push(item);
  }

  addAuthor(attr, triple, result) {
    let au = attr.author || (attr.author = []);
    au.push(triple.object.value);
  }


  addDomain(attr, triple, result) {
    const domain = result.tmp.classMap[triple.object.value];
    if(attr.domain === undefined) {
        attr.domain = domain;
    } else {
        if(!Array.isArray(attr.domain))
            attr.domain = [attr.domain];
        attr.domain.push(domain);
    }
  }

  addRange(attr, triple, result) {
    const range = result.tmp.classMap[triple.object.value];
    if(attr.range === undefined) {
        attr.range = range;
    } else {
        if(!Array.isArray(attr.range))
            attr.range = [attr.range];
        attr.range.push(range);
    }
  }

  addPropInverse(attr, triple, result) {
    var propId = result.tmp.propMap[triple.object.value];
    var objAttr = result.propertyAttribute[propId];
    if(objAttr.inverse === undefined)
      attr.inverse = propId;

    if(objAttr.range !== undefined && attr.domain === undefined)
      attr.domain = objAttr.range;
    if(objAttr.domain !== undefined && attr.range === undefined)
      attr.range = objAttr.domain;
  }

  addPropEquivalent(attr, targetIri, result) {
    const clsId = result.tmp.classMap[targetIri] ?? -1;
    if(clsId < 0) {
      console.log("not found", targetIri);
      return;
    }
    if(!result.classAttribute[clsId].equivalent ||
       result.classAttribute[clsId].equivalent.indexOf(attr.id) == -1) {
      let eq = attr.equivalent || (attr.equivalent = []);
      if(eq.indexOf(clsId) == -1) eq.push(clsId);
    }
  }

  addSubProperty(attr, triple, result) {
    const obj_propId = result.tmp.propMap[triple.object.value] ?? -1;
    const subj_propId = result.tmp.propMap[triple.subject.value] ?? -1;
    if(obj_propId == -1 || subj_propId == -1)
      return;
    const tattr = result.propertyAttribute[obj_propId];
    let sp = tattr.subproperty || (tattr.subproperty = []);
    if(sp.indexOf(subj_propId) == -1) sp.push(subj_propId);
    this.addSuperProperty(attr, triple, result);
  }

  addSuperProperty(attr, triple, result) {
    let sp = attr.superproperty || (attr.superproperty = []);
    let propId = result.tmp.propMap[triple.object.value];
    if(sp.indexOf(propId) == -1) sp.push(propId);
  }

  addSuperClass(attr, triple, result) {
    let sc = attr.superClasses || (attr.superClasses = []);
    let clsId = result.tmp.classMap[triple.object.value];
    if(sc.indexOf(clsId) == -1) sc.push(clsId);
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
      let sc = tattr.subClasses || (tattr.subClasses = []);
      if(sc.indexOf(subj_clsId) == -1) sc.push(subj_clsId);
      this.addSuperClass(attr, triple, result);
    }
  }

  handleClassAttribute(preds, kind, result) {
    if(!preds[kind]) return;
    for(const t of preds[kind]) {
      const clsId = result.tmp.classMap[t.subject.value] ?? -1;
      if(clsId < 0) continue;
      var attr = result.classAttribute[clsId];
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
    }
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

  isInternalNS(ns) {
    return ns == this.Namespace.OWL ||
           ns == this.Namespace.RDFS ||
           ns == this.Namespace.RDF ||
           ns == this.Namespace.XSD ||
           ns == this.Namespace.XML;
  }

  insertClass(cls, iri, result) {
      const e = this.splitNS(iri);
      const isLiteral = this.isLiteral(iri);
      const isThing = this.isThing(iri);
      const internalNS = this.isInternalNS(this.NamespaceMap[e.ns]);
      if(result.tmp.classMap[iri] !== undefined)
          return;
      let base = this.cleanIri(e.ns);
      let attr = {
        iri:iri,
        id : cls.id,
        label: {},
      };
      if(e.v) attr.label["IRI-based"] = e.v;
      if(!isLiteral && !isThing) {
        if(!internalNS || e.v == "Class") {
            if(base != result.tmp.cleanBaseIri)
              this.addAttr(attr, this.Attr.EXTERNAL);
            attr.instances = 0;
        }
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

  insertUnionClass(classes, result) {
    let cls = {
      id:result.class.length,
      type:"owl:Class"
    };
    let attr = {
      id:cls.id,
      instances:0,
      union:classes
    };

    this.addAttr(attr, this.Attr.ANONYMOUS);
    this.addAttr(attr, this.Attr.UNION);
    result.class.push(cls);
    result.classAttribute.push(attr);
    return attr;
  }

  addClassFromType(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      const iri = triple.object.value;
      if(!this.isClass(iri))
        continue;
      let cls = {
        id:result.class.length,
        type:this.getObjType(iri)
      };
      this.insertClass(cls, triple.subject.value, result);
    }
  }

  addClassFromEquivalentClass(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
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
    }
  }

  addClassFromDomain(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      const iri = triple.object.value;
      let cls = {
        id:result.class.length,
        type:this.getObjType(iri)
      };
      this.insertClass(cls, iri, result);
    }
  }

  addClassFromRange(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      const iri = triple.object.value;
      let cls = {
        id:result.class.length,
        type:this.getObjType(iri)
      };
      this.insertClass(cls, iri, result);
    }
  }

  addClassFromSubClassOf(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      var cls = {
        id:result.class.length,
        type:"owl:Class"
      };
      var iri = triple.subject.value;
      if(!this.isThing(iri))
        this.insertClass(cls, iri, result);

      cls = {
        id:result.class.length,
        type:"owl:Class"
      };
      var iri = triple.object.value;
      if(!this.isThing(iri))
        this.insertClass(cls, iri, result);
    }
  }

  addAttrStr(attr, vstr) {
    let a = attr.attributes || (attr.attributes = []);
    if(a.indexOf(vstr) == -1) a.push(vstr);
  }

  addAttr(attr, v) {
    this.addAttrStr(attr, this.AttrNames[v]);
  }

  updateProp(orig, other) {
    if(this.ObjClassType.indexOf(orig.type) > this.ObjClassType.indexOf(other.type)) {
      orig.type = other.type;
    }
  }

  addPropType(attr, type) {
    this.addAttrStr(attr, this.AttrMap[type] ?? "undefined");
  }

  insertProp(prop, type, iri, result) {
      const e = this.splitNS(iri);
      const base = this.cleanIri(e.ns);
      let propAttr = {
        iri:iri,
        id : prop.id,
        baseIri: base,
        label: {}
      };
      if(e.v) propAttr.label["IRI-based"] = e.v;
      let propId = result.tmp.propMap[iri];
      if(propId !== undefined) {
        this.updateProp(result.property[propId], prop);
        this.addPropType(result.propertyAttribute[propId], type);
        return;
      }
      if(base != result.tmp.cleanBaseIri)
          this.addAttr(propAttr, this.Attr.EXTERNAL);
      this.addPropType(propAttr, type);
      result.property.push(prop);
      result.propertyAttribute.push(propAttr);
      result.tmp.propMap[iri] = prop.id;
      result.tmp.baseIris[base] = 1;
  }

  addPropFromDisjointWith(preds, result) {
    if(!preds) return;
    for(const t of preds) {
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
    }
  }

  addPropFromSubClassOf(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      let prop = {
        id:result.property.length,
        type:"rdfs:SubClassOf"
      };
      let propAttr = {
        id : prop.id,
        domain: 0
      };
      if(this.isThing(t.object.value))
        continue;
      const objId = result.tmp.classMap[t.object.value];
      const subjId = result.tmp.classMap[t.subject.value];

      const a = propAttr.range = objId;
      const b = propAttr.domain = subjId;

      const mapKey = a + '_' + b;

      if(!result.tmp.subclassMap[mapKey]) {
        result.tmp.subclassMap[mapKey] = 1;
        this.addAttr(propAttr, this.Attr.OBJECT);
        this.addAttr(propAttr, this.Attr.ANONYMOUS);
        result.property.push(prop);
        result.propertyAttribute.push(propAttr);
      }
    }
  }

  addPropFromSubPropertyOf(preds, result) {
    if(!preds) return;
    for(const t of preds) {
        const iri = t.object.value;
        let prop = {
            id:result.property.length,
        };
        let propAttr = {
            id : prop.id,
        };
        if(this.isThing(iri) || this.isLabel(iri))
            continue;

        const propId = result.tmp.propMap[iri] ?? -1;
        if(propId == -1) {
            let propType = this.getPropType(iri, result);
            this.insertProp(prop, propType, iri, result);
            result.tmp.propMap[iri] = prop.id;
            prop.type = this.ObjClassType[propType];
        }
    }
  }

  addPropFromType(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      const propType = this.ObjMap[t.object.value] ?? 0;
      if(this.isProperty(propType)) {
        let v = t.object.value;
        let prop = {
          id:result.property.length,
          type:this.extractType(v)
        };
        this.insertProp(prop, propType, t.subject.value, result);
      }
    }
  }

  handlePropAttribute(preds, kind, result, by_pred) {
    if(!preds[kind]) return;
    for(const t of preds[kind]) {
      const propId = result.tmp.propMap[t.subject.value] ?? -1;
      if(propId < 0) continue;
      var attr = result.propertyAttribute[propId];
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
    }
  }

  handleDescription(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      const iri = this.cleanIri(t.subject.value);
      if(iri == result.tmp.cleanBaseIri) {
        this.addDescription(result.header, t, result);
      }
    }
  }

  handleDCTerms(preds, result) {
    if(!preds) return;
    const base = result.tmp.cleanBaseIri;
    for(const t of preds) {
      const type = t.predicate.value.substr(t.predicate.value.lastIndexOf("/") + 1);
      const iri = this.cleanIri(t.subject.value);
      if(iri == base) {
        switch(type) {
          case "creator":
            this.addAuthor(result.header, t, result);
            break;
          case "title":
            this.addTitle(result.header, t, result);
            break;
          case "description":
            this.addDescription(result.header, t, result);
            break;
          default:
            this.addOther(result.header, type, t, result);
            break;
        }
      }
    }
  }

  handleOWL(preds, result) {
    if(!preds) return;
    const base = result.tmp.cleanBaseIri;
    for(const t of preds) {
      const type = t.predicate.value.substr(t.predicate.value.lastIndexOf("#") + 1);
      const iri = this.cleanIri(t.subject.value);
      if(iri == base) {
        switch(type) {
          case "imports":
            break;
          case "versionInfo":
            result.header.version = t.object.value;
            break;
          case "versionIRI":
            break;
          default:
            break;
        }
      }
    }
  }

  handleTitle(preds, result) {
    if(!preds) return;
    const base = result.tmp.cleanBaseIri;
    for(const t of preds) {
      const iri = this.cleanIri(t.subject.value);
      if(iri == base) {
        this.addTitle(result.header, t, result);
      }
    }
  }

  addDefinedBy(target, triple, result) {
    let at = target.annotations || (target.annotations = {});
    let db = at.isDefinedBy || (at.isDefinedBy = []);
    let definedBy = {
        identifier: "isDefinedBy",
        language: "undefined",
        type: "iri",
        value: triple.object.value
    }
    this.addLang(definedBy, result);
    db.push(definedBy);
  }

  addTermStatus(target, triple, result) {
    let at = target.annotations || (target.annotations = {});
    let ts = at.term_status || (at.term_status = []);
    const isLiteral = this.isLiteralTerm(triple.object) || this.isLiteral(triple.object.value);
    let term_status = {
        identifier: "term_status",
        value: triple.object.value
    }
    if(isLiteral) {
      term_status.type = "label"
      term_status.language = this.addLang(triple.object, result);
    }
    ts.push(term_status);
  }

  handleDefinedBy(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      var id = result.tmp.classMap[t.subject.value] ?? -1;
      if(id >= 0) {
        this.addDefinedBy(result.classAttribute[id], t, result);
        continue;
      }
      id = result.tmp.propMap[t.subject.value] ?? -1;
      if(id >= 0) {
        this.addDefinedBy(result.propertyAttribute[id], t, result);
        continue;
      }
    }
  }

  handleTermStatus(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      var id = result.tmp.classMap[t.subject.value] ?? -1;
      if(id >= 0) {
        this.addTermStatus(result.classAttribute[id], t, result);
        continue;
      }
      id = result.tmp.propMap[t.subject.value] ?? -1;
      if(id >= 0) {
        this.addTermStatus(result.propertyAttribute[id], t, result);
        continue;
      }
    }
  }

  insertBuiltinClass(type, result) {
    var cls = {
      id:result.class.length,
      type:this.ObjClassType[type]
    };
    return this.insertClass(cls, this.ObjKey[type], result);
  }

  insertIndiv(attr, indiv) {
    let iv = attr.individuals || (attr.individuals = []);
    if(iv.indexOf(indiv) == -1) iv.push(indiv);
  }

  addIndivFromType(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      if(!this.isIndiv(triple.object.value))
        continue;
      let iri = triple.subject.value;
      let e = this.splitNS(iri);
      const base = this.cleanIri(e.ns);
      let indiv = {
        iri:iri,
        baseIri:base,
        labels: {}
      };
      if(e.v) indiv.labels["IRI-based"] = e.v;
      result.tmp.indivMap[iri] = indiv;
    }
  }

  addIndivToClass(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      const indiv = result.tmp.indivMap[triple.subject.value];
      const targetId = result.tmp.classMap[triple.object.value] || -1;
      if(targetId == -1 || !indiv)
        continue;
      this.insertIndiv(result.classAttribute[targetId], indiv);
    }
  }

  sanatizeResult(result) {
    var addedThing = 0;
    var addedLiteral = 0;
    const thingClsId = result.tmp.classMap[this.ObjKey[this.Obj.OWL_THING]] ||
                        (addedThing = this.insertBuiltinClass(this.Obj.OWL_THING, result).id);
    const literalClsId = result.tmp.classMap[this.ObjKey[this.Obj.RDF_LITERAL]] ||
                        (addedLiteral = this.insertBuiltinClass(this.Obj.RDF_LITERAL, result).id);

    for(let it of result.propertyAttribute) {
      var attrs = it.attributes;
      if(!attrs)
        continue;
      var hasObj = attrs.indexOf(this.AttrNames[this.Attr.OBJECT]) != -1;
      var hasInvFunct = attrs.indexOf(this.AttrNames[this.Attr.INVERSE_FUNCTIONAL]) != -1;
      const hasDataType = attrs.indexOf(this.AttrNames[this.Attr.DATATYPE]) != -1;
      if(hasObj) {
        if(Array.isArray(it.range))
            it.range = this.insertUnionClass(it.range, result).id;
        if(Array.isArray(it.domain))
            it.domain = this.insertUnionClass(it.domain, result).id;
        if(it.range == undefined)
          it.range = thingClsId, addedThing = 0;
        if(it.domain == undefined)
          it.domain = thingClsId, addedThing = 0;
      } else {
        if(hasInvFunct) {
          const propId = result.tmp.propMap[it.iri];
          if(hasDataType) {
            attrs.splice(attrs.indexOf(this.AttrNames[this.Attr.INVERSE_FUNCTIONAL]), 1);
            hasInvFunct = false;
          } else {
            attrs.push(this.AttrNames[this.Attr.OBJECT]);
            this.updateProp(result.property[propId], {type:this.ObjClassType[this.Obj.OBJECT_PROPERTY]});
            hasObj = true;
          }
        }

        if(!hasObj && it.subproperty) {
          for(const propId of it.subproperty) {
            let target = result.propertyAttribute[propId];
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
            it.domain = this.insertUnionClass(it.domain, result).id;
        if(Array.isArray(it.range)) {
            console.log("datatype range is array", it.iri)
        }
        if(it.domain == undefined)
          it.domain = thingClsId, addedThing = 0;
        if(it.range == undefined)
          it.range = literalClsId, addedLiteral = 0;
      }
    }
    if(addedThing) { /* TODO remove */ }
    if(addedLiteral) { /* TODO remove */ }
  }

  isDataType(clsId, result) {
    const cls = result.class[clsId];
    return cls.type == this.ObjClassType[this.Obj.RDF_DATATYPE];
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
        if(!notFirst[clsId]) {
          notFirst[clsId] = true;
          id[clsId] = clsId;
          return clsId;
        }
        if(id[clsId] == -1)
          id[clsId] = this.cloneClass(clsId, result);
        return id[clsId];
    }
    const addLiteral = (() => add.call(this, literalClsId)).bind(this);
    const addThing = ((linkClsId) => {
      if(thingMap[linkClsId] === undefined) {
        thingMap[linkClsId] = this.cloneClass(thingClsId, result);
      }
      return thingMap[linkClsId];
    }).bind(this);
    const addDataType = ((clsId) => { id[clsId] = -1; return add.call(this, clsId)}).bind(this);
    for(const it of result.propertyAttribute) {
      var hasObj = it.attributes.indexOf(this.AttrNames[this.Attr.OBJECT]) != -1;
      var hasDataType = it.attributes.indexOf(this.AttrNames[this.Attr.DATATYPE]) != -1;
      id[literalClsId] = -1;

      if(it.range === literalClsId)
        it.range = addLiteral();
      if(it.domain === literalClsId)
        it.domain = addLiteral();

      if(hasDataType) {
        if(this.isDataType(it.range, result))
            it.range = addDataType(it.range);
      }

      if(!hasObj) continue;

      if(it.range != thingClsId || it.domain != thingClsId) {
        if(it.range === thingClsId && !this.isLiteral(result.classAttribute[it.domain].iri))
          it.range = addThing(it.domain);
        if(it.domain === thingClsId && !this.isLiteral(result.classAttribute[it.range].iri))
          it.domain = addThing(it.range);
      }
    }
  }

  handlePreds(preds, result) {
    this.addClassFromEquivalentClass(preds[this.Pred.EQUIVALENT_CLASS],result);
    this.addClassFromType(preds[this.Pred.TYPE],result);
    this.addClassFromDomain(preds[this.Pred.DOMAIN],result);
    this.addClassFromRange(preds[this.Pred.RANGE],result);
    this.addClassFromSubClassOf(preds[this.Pred.SUB_CLASS_OF],result);
    this.addIndivFromType(preds[this.Pred.TYPE], result);

    this.addIndivToClass(preds[this.Pred.TYPE], result);

    this.handleClassAttribute(preds, this.Pred.LABEL, result);
    this.handleClassAttribute(preds, this.Pred.COMMENT, result);
    this.handleClassAttribute(preds, this.Pred.SUB_CLASS_OF, result);

    this.addPropFromDisjointWith(preds[this.Pred.DISJOINT_WITH], result);
    this.addPropFromSubClassOf(preds[this.Pred.SUB_CLASS_OF], result);
    this.addPropFromType(preds[this.Pred.TYPE], result);
    this.addPropFromSubPropertyOf(preds[this.Pred.SUB_PROPERTY_OF], result);

    this.handlePropAttribute(preds, this.Pred.LABEL, result);
    this.handlePropAttribute(preds, this.Pred.COMMENT, result);
    this.handlePropAttribute(preds, this.Pred.DOMAIN, result);
    this.handlePropAttribute(preds, this.Pred.RANGE, result);
    this.handlePropAttribute(preds, this.Pred.INVERSE_OF, result);
    this.handlePropAttribute(preds, this.Pred.SUB_PROPERTY_OF, result);

    this.handleOWL(preds[this.Pred.IMPORTS], result);
    this.handleOWL(preds[this.Pred.VERSION_INFO], result);
    this.handleOWL(preds[this.Pred.VERSION_IRI], result);
    this.handleDCTerms(preds[this.Pred.DC_TERMS], result);
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
    if(list.length > 1)
      result.tmp.baseIris[this.NamespaceType[this.Namespace.RDF]] = 1;
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
      iri:this.cleanBaseIri(baseIri)
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
      subclassMap:{},
      indivMap:{},
      baseIris:{},
      cleanBaseIri:this.cleanIri(result.header.iri)
    };
  }

  finiResult(result) {
    delete result.tmp;
  }

  async parseData(rdfData, baseIri, contentType, preds, iriMap) {
    if(!contentType || !this.MimeMap[contentType]) {
        contentType = this.MimeExtMap["owl"];
    }
    let data = this.parse(rdfData, baseIri, contentType);

    let imports = [];
    for(const s of data.stmts) {
        var kind = this.PredMap[s.predicate.value] ?? 0;
        if(kind == this.Pred.IMPORTS)
          imports.push(s);
    }

    for(const toImport of imports) {
        let iri = toImport.object.value;
        let baseIri = this.cleanIri(iri);
        if(!preds.loaded[baseIri]) {
            preds.loaded[baseIri] = 1;
            const req = await fetch(iriMap[baseIri] || baseIri);
            if(!req.ok)
                throw "failed to load";
            const rData = await req.text();
            await this.parseData(rData, baseIri, req.headers.get("Content-Type"), preds, iriMap);
        }
    }

    for(const s of data.stmts) {
        var kind = this.PredMap[s.predicate.value] ?? 0;
        if(kind == 0) {
          let pe = this.splitNS(s.predicate.value);
          if(pe.ns == this.PredKey[this.Pred.DC_TERMS]) {
            kind = this.Pred.DC_TERMS;
          }
        }
        preds[kind].push(s);
    }

    for(const ns in data.ns) {
        preds.ns[ns] = data.ns[ns];
    }
  }

  async transform(rdfData, baseIri, contentType, iriMap) {
    let result = {};
    let preds = [...Array(this.PredCount)].map(_=>[]);
    preds.ns = {};
    preds.loaded = {};
    await this.parseData(rdfData, baseIri, contentType, preds, iriMap);

    this.initResult(result, baseIri);
    this.handlePreds(preds, result);
    this.sanatizeResult(result);
    this.applySplitRules(result);
    this.handleLanguages(result);
    this.handleBaseIris(result);
    this.handlePrefixList(preds.ns, result);
    this.finiResult(result);
    return result;
  }

  constructor(parse) {
    this.parse = parse;
  }

}
