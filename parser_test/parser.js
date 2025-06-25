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
    "text/turtle"              :  this.Mime.TURTLE,
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
    for(var key in this.MimeMap) keys.push(key);
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
    for(const key in this.Namespace) keys.push(key.toLowerCase());
    return keys;
  })();

  NamespaceType = (() => {
    var keys = [];
    keys.push("");
    for(const key in this.NamespaceMap) keys.push(key);
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
    ANNOTATION_DATA       : 1,
    DC_TERMS              : 2,
    DC_ELEM               : 3,
    OWL                   : 4,
    RDFS                  : 5,
    VERSION_INFO          : 6,
    VERSION_IRI           : 7,
    IMPORTS               : 8,
    TYPE                  : 9,
    DESCRIPTION           : 10,
    TITLE                 : 11,
    VALUE                 : 12,
    TERM_STATUS           : 13,
    LABEL                 : 14,
    COMMENT               : 15,
    IS_DEFINED_BY         : 16,
    EQUIVALENT_CLASS      : 17,
    SUB_CLASS_OF          : 18,
    DISJOINT_WITH         : 19,
    DOMAIN                : 20,
    RANGE                 : 21,
    SUB_PROPERTY_OF       : 22,
    INVERSE_OF            : 23,
    UNION_OF              : 24,
    EQUIVALENT_PROPERTY   : 25
  });

  PredMap = Object.freeze({
    "http://purl.org/dc/terms/"                                 : this.Pred.DC_TERMS,
    "http://purl.org/dc/elements/1.1/"                          : this.Pred.DC_ELEM,
    "http://www.w3.org/2002/07/owl#"                            : this.Pred.OWL,
    "http://www.w3.org/2000/01/rdf-schema"                      : this.Pred.RDFS,
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
    "http://www.w3.org/2002/07/owl#unionOf"                     : this.Pred.UNION_OF,
    "http://www.w3.org/2002/07/owl#equivalentProperty"          : this.Pred.EQUIVALENT_PROPERTY
  });



  PredKey = (() => {
    var keys = [];
    keys.push("");
    keys.push("");
    for(const key in this.PredMap) keys.push(key);
    return keys;
  })();

  PredCount = Object.getOwnPropertyNames(this.Pred).length;

  Obj = Object.freeze({
    UNKNOWN                    : 0,
    ONTOLOGY                   : 1,
    OWL_NAMED_INDIVIDUAL       : 2,
    OWL_THING                  : 3,
    OWL_CLASS                  : 4,
    OWL_DEPRECATED_CLASS       : 5,
    RDF_DATATYPE               : 6,
    RDF_CLASS                  : 7,
    RDF_LABEL                  : 8,
    RDF_LITERAL                : 9,
    RDF_PROPERTY               : 10,
    OBJECT_PROPERTY            : 11,
    DATATYPE_PROPERTY          : 12,
    FUNCTIONAL_PROPERTY        : 13,
    INVERSE_FUNCTION_PROPERTY  : 14,
    ANNOTATION_PROPERTY        : 15,
    SYMMETRIC_PROPERTY         : 16,
    TRANSITIVE_PROPERTY        : 17,
    DEPRECATED_PROPERTY        : 18
  });

  ObjMap = Object.freeze({
    "http://www.w3.org/2002/07/owl#Ontology"                        : this.Obj.ONTOLOGY,
    "http://www.w3.org/2002/07/owl#NamedIndividual"                 : this.Obj.OWL_NAMED_INDIVIDUAL,
    "http://www.w3.org/2002/07/owl#Thing"                           : this.Obj.OWL_THING,
    "http://www.w3.org/2002/07/owl#Class"                           : this.Obj.OWL_CLASS,
    "http://www.w3.org/2002/07/owl#DeprecatedClass"                 : this.Obj.OWL_DEPRECATED_CLASS,
    "http://www.w3.org/2000/01/rdf-schema#Datatype"                 : this.Obj.RDF_DATATYPE,
    "http://www.w3.org/2000/01/rdf-schema#Class"                    : this.Obj.RDF_CLASS,
    "http://www.w3.org/2000/01/rdf-schema#label"                    : this.Obj.RDF_LABEL,
    "http://www.w3.org/2000/01/rdf-schema#Literal"                  : this.Obj.RDF_LITERAL,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"           : this.Obj.RDF_PROPERTY,
    "http://www.w3.org/2002/07/owl#ObjectProperty"                  : this.Obj.OBJECT_PROPERTY,
    "http://www.w3.org/2002/07/owl#DatatypeProperty"                : this.Obj.DATATYPE_PROPERTY,
    "http://www.w3.org/2002/07/owl#FunctionalProperty"              : this.Obj.FUNCTIONAL_PROPERTY,
    "http://www.w3.org/2002/07/owl#InverseFunctionalProperty"       : this.Obj.INVERSE_FUNCTION_PROPERTY,
    "http://www.w3.org/2002/07/owl#AnnotationProperty"              : this.Obj.ANNOTATION_PROPERTY,
    "http://www.w3.org/2002/07/owl#SymmetricProperty"               : this.Obj.SYMMETRIC_PROPERTY,
    "http://www.w3.org/2002/07/owl#TransitiveProperty"              : this.Obj.TRANSITIVE_PROPERTY,
    "http://www.w3.org/2002/07/owl#DeprecatedProperty"              : this.Obj.DEPRECATED_PROPERTY


  });

  ObjKey = (() => {
    var keys = [];
    keys.push("")
    for(const key in this.ObjMap) keys.push(key);
    return keys;
  })();

  ObjCount = Object.getOwnPropertyNames(this.Obj).length;

  ObjClassType = (() => {
    var keys = [];
    keys.push("");
    for(const key in this.ObjMap)
      keys.push((this.isSymmetric(key)  ||
                 this.isTransitive(key) ||
                 this.isAnnotation(key)) ? (this.isClass(key) ? keys[this.Obj.OWL_CLASS] :
                                                                keys[this.Obj.OBJECT_PROPERTY]) :
                                           (this.isInvFunc(key) ? keys[this.Obj.DATATYPE_PROPERTY] :
                                                                   this.extractType(key)));
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
    UNION              : 7,
    SYMMETRIC          : 8,
    TRANSITIVE         : 9,
    DEPRECATED         : 10
  });

  AttrNames = (() => {
    var keys = [];
    for(var key in this.Attr) keys.push(key.toLowerCase().replace("_", " "));
    return keys;
  })();

  AttrMap = Object.freeze((() => {
    let r = {};
    r[this.Obj.OBJECT_PROPERTY]           = this.AttrNames[this.Attr.OBJECT];
    r[this.Obj.DATATYPE_PROPERTY]         = this.AttrNames[this.Attr.DATATYPE];
    r[this.Obj.FUNCTIONAL_PROPERTY]       = this.AttrNames[this.Attr.FUNCTIONAL];
    r[this.Obj.INVERSE_FUNCTION_PROPERTY] = this.AttrNames[this.Attr.INVERSE_FUNCTIONAL];
    r[this.Obj.SYMMETRIC_PROPERTY]        = this.AttrNames[this.Attr.SYMMETRIC];
    r[this.Obj.TRANSITIVE_PROPERTY]       = this.AttrNames[this.Attr.TRANSITIVE];
    r[this.Obj.DEPRECATED_PROPERTY]       = this.AttrNames[this.Attr.DEPRECATED];
    return r;
  })());

  isClass(obj_val) {
    const obj_kind = this.ObjMap[obj_val];
    return obj_kind == this.Obj.OWL_CLASS ||
           obj_kind == this.Obj.OWL_DEPRECATED_CLASS ||
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

  isOntology(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.ONTOLOGY;
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
           obj_kind == this.Obj.INVERSE_FUNCTION_PROPERTY ||
           obj_kind == this.Obj.ANNOTATION_PROPERTY ||
           obj_kind == this.Obj.SYMMETRIC_PROPERTY ||
           obj_kind == this.Obj.TRANSITIVE_PROPERTY ||
           obj_kind == this.Obj.DEPRECATED_PROPERTY;
  }

  isIgnoredProperty(obj_kind) {
    return obj_kind == this.Obj.ANNOTATION_PROPERTY;
  }

  isDeprecated(obj_val) {
    const obj_kind = this.ObjMap[obj_val];
    return obj_kind == this.Obj.OWL_DEPRECATED_CLASS ||
           obj_kind == this.Obj.DEPRECATED_PROPERTY;
  }

  isSymmetric(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.SYMMETRIC_PROPERTY;
  }

  isTransitive(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.TRANSITIVE_PROPERTY;
  }

  isAnnotation(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.ANNOTATION_PROPERTY;
  }

  isInvFunc(obj_val) {
    return this.ObjMap[obj_val] == this.Obj.INVERSE_FUNCTION_PROPERTY;
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
    if(this.isProperty(this.ObjMap[v])) {
      e.v = e.v[0].toLowerCase() + e.v.slice(1);
    }
    return this.NamespaceKey[this.NamespaceMap[e.ns]] + ":" + e.v;
  }

  getPropType(iri) {
    return this.ObjClassType[this.ObjMap[iri]] || this.extractType(iri);
  }

  getObjType(iri) {
    var ty = this.ObjMap[iri] || (this.NamespaceIgnore[this.splitNS(iri).ns] ? this.Obj.RDF_DATATYPE : this.Obj.OWL_CLASS);
    return this.ObjClassType[ty];
  }

  getSubPropertyOfType(iri) {
    switch(iri) {
        case "http://www.w3.org/2002/07/owl#topObjectProperty":
            return this.Obj.OBJECT_PROPERTY;
        case "http://www.w3.org/2002/07/owl#topDataProperty":
            return this.Obj.DATATYPE_PROPERTY;
    }
    return this.Obj.OBJECT_PROPERTY;
  }

  getValue(item) {
    if(item.termType == "BlankNode")
      return "";
    return item.value;
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
    comment[this.addLang(triple.object, result)] = this.getValue(triple.object);
  }

  addLabels(attr, triple, result) {
    let labels = attr.labels || (attr.labels = {});
    labels[this.addLang(triple.object, result)] = this.getValue(triple.object);
  }

  addLabel(attr, triple, result) {
    attr.label[this.addLang(triple.object, result)] = this.getValue(triple.object);
  }

  addDescription(attr, triple, result) {
    let description = attr.description || (attr.description = {});
    description[this.addLang(triple.object, result)] = this.getValue(triple.object);
  }

  addTitle(attr, triple, result) {
    let title = attr.title || (attr.title = {});
    title[this.addLang(triple.object, result)] = this.getValue(triple.object);
  }

  addAuthor(attr, triple, result) {
    let au = attr.author || (attr.author = []);
    au.push(this.getValue(triple.object));
  }


  addDomain(attr, triple, result) {
    const domain = result.tmp.classMap[this.getValue(triple.object)];
    if(attr.domain === undefined) {
        attr.domain = domain;
    } else {
        if(!Array.isArray(attr.domain))
            attr.domain = [attr.domain];
        attr.domain.push(domain);
    }
  }

  addRange(attr, triple, result) {
    const range = result.tmp.classMap[this.getValue(triple.object)];
    if(attr.range === undefined) {
        attr.range = range;
    } else {
        if(!Array.isArray(attr.range))
            attr.range = [attr.range];
        attr.range.push(range);
    }
  }

  addPropInverse(attr, triple, result) {
    var propId = result.tmp.propMap[this.getValue(triple.object)];
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
    const obj_propId = result.tmp.propMap[this.getValue(triple.object)] ?? -1;
    const subj_propId = result.tmp.propMap[this.getValue(triple.subject)] ?? -1;
    if(obj_propId == -1 || subj_propId == -1)
      return;
    this.insertSubProperty(result.propertyAttribute[obj_propId], subj_propId, result);
    this.addSuperProperty(attr, triple, result);
  }

  insertSubProperty(attr, propId, result) {
    let sp = attr.subproperty || (attr.subproperty = []);
    if(sp.indexOf(propId) == -1) sp.push(propId);
  }

  addSuperProperty(attr, triple, result) {
    let sp = attr.superproperty || (attr.superproperty = []);
    let propId = result.tmp.propMap[this.getValue(triple.object)];
    if(sp.indexOf(propId) == -1) sp.push(propId);
  }

  addSuperClass(attr, triple, result) {
    let sc = attr.superClasses || (attr.superClasses = []);
    let clsId = result.tmp.classMap[this.getValue(triple.object)];
    if(sc.indexOf(clsId) == -1) sc.push(clsId);
  }

  addSubClass(attr, triple, result) {
    const obj_clsId = result.tmp.classMap[this.getValue(triple.object)] ?? -1;
    const subj_clsId = result.tmp.classMap[this.getValue(triple.subject)] ?? -1;
    if(obj_clsId < 0) {
      if(this.PredMap[this.getValue(triple.predicate)] != this.Pred.SUB_CLASS_OF || this.getValue(triple.object) != this.OWLThing)
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
      const target = this.getValue(t.subject);
      var attr = this.getClassAttr(target, result);
      if(!attr)
        continue;

      if(attr._hdr) {
        attr = attr._hdr;
        switch(kind) {
          case this.Pred.COMMENT:
            this.addComment(attr, t, result);
            break;
          case this.Pred.LABEL:
            this.addLabels(attr, t, result);
            break;
          default:
            break;
        }
      } else {
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

  updateClass(orig, other, attr) {
    if(other.deprecated) {
      delete orig.deprecated;
      this.addAttr(attr, this.Attr.DEPRECATED);
    }
    if(this.ObjClassType.indexOf(orig.type) > this.ObjClassType.indexOf(other.type)) {
      orig.type = other.type;
    }
  }

  insertClass(cls, iri, result) {
      if(!iri) return;
      const e = this.splitNS(iri);
      const isLiteral = this.isLiteral(iri);
      const isThing = this.isThing(iri);
      const internalNS = this.isInternalNS(this.NamespaceMap[e.ns]);
      const clsId = result.tmp.classMap[iri];
      if(clsId !== undefined) {
        this.updateClass(result.class[clsId], cls, result.classAttribute[clsId]);
        return;
      }
      let base = this.cleanIri(e.ns);
      let attr = {
        iri:iri,
        id : cls.id,
        label: {},
      };
      if(e.v) attr.label["IRI-based"] = e.v;
      if(!isLiteral && !isThing) {
        if(!internalNS || e.v == "Class") {
            if(base != result.tmp.cleanBaseIri) {
              result.tmp.baseIris[this.NamespaceType[this.Namespace.RDFS]] = 1;
              this.addAttr(attr, this.Attr.EXTERNAL);
            }
            attr.instances = 0;
        }
      } else {
        delete attr.label["IRI-based"];
        attr.label["undefined"] = e.v;
      }

      if(!isThing && !isLiteral)
        attr.baseIri = base;

      if(attr.baseIri) {
        result.tmp.baseIris[attr.baseIri] = 1;
      }

      this.updateClass(cls, cls, attr);

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
      const iri = this.getValue(triple.object);
      const targetIri = this.getValue(triple.subject);

      if(!this.isClass(iri) || targetIri == result.header.iri)
        continue;

      this.addClassFromIri(iri, targetIri, result, this.isDeprecated(iri));
    }
  }

  addClassFromEquivalentClass(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      var cls = {
        id:result.class.length,
        type:"owl:equivalentClass"
      };
      let attrA = this.insertClass(cls, this.getValue(triple.subject), result);
      if(attrA)
        this.addAttr(attrA, this.Attr.EQUIVALENT);

      cls = {
        id:result.class.length,
        type:"owl:equivalentClass"
      };
      let attrB = this.insertClass(cls, this.getValue(triple.object), result);
      if(attrB)
        this.addAttr(attrB, this.Attr.EQUIVALENT);

      if(attrA)
        this.addPropEquivalent(attrA, this.getValue(triple.object), result);
      if(attrB)
        this.addPropEquivalent(attrB, this.getValue(triple.subject), result);
    }
  }

  addClassFromIri(typeIri, iri, result, deprecated) {
    let cls = {
      id:result.class.length,
      type:typeIri ? this.getObjType(typeIri) : "owl:Thing"
    };
    if(deprecated)
        cls.deprecated = true;
    return this.insertClass(cls, iri, result);
  }

  addClassFromObject(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      const iri = this.getValue(triple.object);
      if(!iri) continue;
      this.addClassFromIri(iri, iri, result);
    }
  }

  addClassFromSubClassOf(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      var cls = {
        id:result.class.length,
        type:"owl:Class"
      };
      var iri = this.getValue(triple.subject);
      if(!this.isThing(iri))
        this.insertClass(cls, iri, result);

      cls = {
        id:result.class.length,
        type:"owl:Class"
      };
      var iri = this.getValue(triple.object);
      if(!this.isThing(iri))
        this.insertClass(cls, iri, result);
    }
  }

  addClassFromUnionOf(preds, result) {
    if(!preds) return;
    for(const triple of preds) {
      const el = triple.object.elements;
      let union = [];
      for(const e of el) {
        const iri = this.getValue(e);
        var clsId = result.tmp.classMap[iri] ?? -1;
        if(clsId == -1) {
          clsId = this.addClassFromIri(iri, iri, result).id;
        }
        if(union.indexOf(clsId) == -1) union.push(clsId);
      }
      let cls = {
        id:result.class.length,
        type:"owl:unionOf"
      };
      let attr = {
        id:cls.id,
        instances:0,
        union:union
      };

      let key = "";
      union.sort();
      for(const id of union)
        key += id + "_";

      if(result.tmp.unionMap[key])
        continue;
      result.tmp.unionMap[key] = 1;

      this.addAttr(attr, this.Attr.ANONYMOUS);
      this.addAttr(attr, this.Attr.UNION);
      result.class.push(cls);
      result.classAttribute.push(attr);
    }
  }

  addAttrStr(attr, vstr) {
    let a = attr.attributes || (attr.attributes = []);
    if(!vstr) return;
    if(a.indexOf(vstr) == -1) a.push(vstr);
  }

  addAttr(attr, v) {
    this.addAttrStr(attr, this.AttrNames[v]);
  }

  updateProp(orig, other, attr) {
    if(other.deprecated) {
        delete orig.deprecated;
        this.addAttr(attr, this.Attr.DEPRECATED);
    }
    if(this.ObjClassType.indexOf(orig.type) > this.ObjClassType.indexOf(other.type)) {
      orig.type = other.type;
    }
  }

  addPropType(attr, realType) {
    let ty = this.AttrMap[realType];
    this.addAttrStr(attr, ty);
  }

  insertProp(prop, realType, iri, result) {
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
        let attr = result.propertyAttribute[propId];
        this.updateProp(result.property[propId], prop, attr);
        this.addPropType(attr, realType);
        return;
      }
      if(base != result.tmp.cleanBaseIri)
          this.addAttr(propAttr, this.Attr.EXTERNAL);
      this.addPropType(propAttr, realType);

      if(prop.deprecated) {
        delete prop.deprecated;
        this.addAttr(propAttr, this.Attr.DEPRECATED);
      }

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

      let objId = result.tmp.classMap[this.getValue(t.object)];
      let subjId = result.tmp.classMap[this.getValue(t.subject)];
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
      if(this.isThing(this.getValue(t.object)))
        continue;
      const objId = result.tmp.classMap[this.getValue(t.object)];
      const subjId = result.tmp.classMap[this.getValue(t.subject)];

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
        const iri = this.getValue(t.object);
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
            let propType = this.getSubPropertyOfType(iri);
            this.insertProp(prop, propType, iri, result);
            result.tmp.propMap[iri] = prop.id;
            prop.type = this.ObjClassType[propType];
        }
    }
  }

  addPropFromType(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      const propType = this.ObjMap[this.getValue(t.object)] ?? 0;
      if(this.isProperty(propType) && !this.isIgnoredProperty(propType)) {
        let v = this.getValue(t.object);
        let prop = {
          id:result.property.length,
          type:this.getPropType(v)
        };

        if(this.isDeprecated(v))
          prop.deprecated = true;

        this.insertProp(prop, propType, this.getValue(t.subject), result);
      }
    }
  }

  handlePropAttribute(preds, kind, result, by_pred) {
    if(!preds[kind]) return;
    for(const t of preds[kind]) {
      const propId = result.tmp.propMap[this.getValue(t.subject)] ?? -1;
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
      const iri = this.cleanIri(this.getValue(t.subject));
      if(iri == result.tmp.cleanBaseIri) {
        this.addDescription(result.header, t, result);
      }
    }
  }

  getAttr(iri, result) {
      var id = result.tmp.classMap[iri] ?? -1;
      if(id != -1) return result.classAttribute[id];
      id = result.tmp.propMap[iri] ?? -1;
      if(id != -1) return result.propertyAttribute[id];
      if(result.header.iri == iri) return { _hdr:result.header };
      return null;
  }

  getClassAttr(iri, result) {
      var id = result.tmp.classMap[iri] ?? -1;
      if(id != -1) return result.classAttribute[id];
      if(result.header.iri == iri) return { _hdr:result.header };
      return null;
  }

  handleDCTerms(preds, result) {
    if(!preds) return;
    const base = result.tmp.cleanBaseIri;
    for(const t of preds) {
      const predicate = this.getValue(t.predicate);
      const type = predicate.substr(predicate.lastIndexOf("/") + 1);
      const iri = this.cleanIri(this.getValue(t.subject));
      if(result.tmp.propMap[predicate] ?? 0)
        continue;
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
      } else {
        const target = this.getValue(t.subject);
        var id = result.tmp.classMap[target] ?? -1;
        var attrs = result.classAttribute;
        if(id == -1) {
          id = result.tmp.propMap[target] ?? -1;
          attrs = result.propertyAttribute;
        }
        if(id == -1)
          continue;
        this.addOther(attrs[id], type, t, result);

      }
    }
  }

  handleOWL(preds, result) {
    if(!preds) return;
    const base = result.tmp.cleanBaseIri;
    for(const t of preds) {
      const type = this.getValue(t.predicate).substr(this.getValue(t.predicate).lastIndexOf("#") + 1);
      const target = this.getValue(t.subject);
      var attr = this.getAttr(target, result);
      if(!attr)
        continue;
      if(attr._hdr) {
        switch(type) {
          case "imports":
            break;
          case "versionInfo":
            result.header.version = this.getValue(t.object);
            break;
          case "versionIRI":
            break;
          default:
            break;
        }
      } else {
        switch(type) {
          case "versionInfo":
            this.addAnnotation(attr, type, t, result);
            break;
          default:
            break;
        }
      }
    }
  }

  handleRDFS(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      const type = this.getValue(t.predicate).substr(this.getValue(t.predicate).lastIndexOf("#") + 1);
      const target = this.getValue(t.subject);
      var attr = this.getAttr(target, result);
      if(!attr)
        continue;
      switch(type) {
        case "seeAlso":
          if(attr._hdr)
            this.addOther(result.header, type, t, result);
          else
            this.addAnnotation(attr, type, t, result);
          break;
        case "label":
          console.log("label")
          break;
        default:
          break;
      }
    }
  }

  handleTitle(preds, result) {
    if(!preds) return;
    const base = result.tmp.cleanBaseIri;
    for(const t of preds) {
      const iri = this.cleanIri(this.getValue(t.subject));
      if(iri == base) {
        this.addTitle(result.header, t, result);
      }
    }
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

  addAnnotation(attr, type, triple, result) {
    let anno = attr.annotations || (attr.annotations = {});
    let at = anno[type] || (anno[type] = []);
    let obj  = triple.object;
    let e = obj.termType == "Literal" ? "label" : "iri";
    let item = {
      identifier:type,
      language:obj.language || "undefined",
      type:e,
      value:obj.value
    };

    this.addLang(obj, result);
    at.push(item);
  }

  handleDefinedBy(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      const target = this.getValue(t.subject);
      var attr = this.getAttr(target, result);
      if(!attr)
        continue;

      this.addAnnotation(attr, "isDefinedBy", t, result);
    }
  }

  handleTermStatus(preds, result) {
    if(!preds) return;
    for(const t of preds) {
      const target = this.getValue(t.subject);
      var attr = this.getAttr(target, result);
      if(!attr)
        continue;

      this.addAnnotation(attr, "term_status", t, result);
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
      if(!this.isIndiv(this.getValue(triple.object)))
        continue;
      let iri = this.getValue(triple.subject);
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
      const indiv = result.tmp.indivMap[this.getValue(triple.subject)];
      const targetId = result.tmp.classMap[this.getValue(triple.object)] || -1;
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

        if(!hasObj && result.property[it.id].type == this.ObjClassType[this.Obj.OBJECT_PROPERTY]) {
            attrs.push(this.AttrNames[this.Attr.OBJECT]);
            hasObj = true;
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

  handleAnnotations(preds, result) {
    if(!preds) return;
    let tmpPreds = [];
    const base = result.tmp.cleanBaseIri;
    for(const t of preds) {
      const iri = this.cleanIri(this.getValue(t.subject));
      var kind = this.PredMap[t.predicate.value] ?? 0;
      let e = this.splitNS(t.predicate.value);
      if(kind == 0) {
        kind = this.PredMap[e.ns] ?? 0;
      }

      switch(kind) {
        case this.Pred.DESCRIPTION:
        case this.Pred.TITLE:
        case this.Pred.DC_TERMS:
        case this.Pred.DC_ELEM:
          tmpPreds[0] = t;
          this.handleDCTerms(tmpPreds, result);
          break;
        default:
          const type = e.v;
          const target = this.getValue(t.subject);
          var attr = this.getAttr(target, result);
          if(!attr)
            continue;
          if(attr._hdr)
            this.addOther(result.header, type, t, result);
          else
            this.addAnnotation(attr, type, t, result);
          break;
      }
    }
  }

  handlePreds(preds, result) {
    this.addClassFromEquivalentClass(preds[this.Pred.EQUIVALENT_CLASS],result);
    this.addClassFromType(preds[this.Pred.TYPE],result);
    this.addClassFromObject(preds[this.Pred.DOMAIN],result);
    this.addClassFromObject(preds[this.Pred.RANGE],result);
    this.addClassFromSubClassOf(preds[this.Pred.SUB_CLASS_OF],result);
    this.addIndivFromType(preds[this.Pred.TYPE], result);
    this.addClassFromUnionOf(preds[this.Pred.UNION_OF], result);

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

    this.handleAnnotations(preds[this.Pred.ANNOTATION_DATA], result);
    this.handleRDFS(preds[this.Pred.RDFS], result);
    this.handleDCTerms(preds[this.Pred.DC_TERMS], result);
    this.handleOWL(preds[this.Pred.IMPORTS], result);
    this.handleOWL(preds[this.Pred.VERSION_INFO], result);
    this.handleOWL(preds[this.Pred.VERSION_IRI], result);
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

  initResult(result, annoMap, baseIri) {
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
      subclassMap:{},
      indivMap:{},
      unionMap:{},
      annoMap:annoMap,
      baseIris:{},
      cleanBaseIri:this.cleanIri(result.header.iri)
    };
  }

  finiResult(result) {
    delete result.tmp;
  }

  async parseData(rdfData, baseIri, contentType, tmp, initial) {
    if(!contentType || !this.MimeMap[contentType]) {
        contentType = this.MimeExtMap["owl"];
    }
    let data = this.parse(rdfData, baseIri, contentType);
    let preds = tmp.preds;

    let imports = [];
    for(const s of data.stmts) {
        var kind = this.PredMap[s.predicate.value] ?? 0;
        if(kind == this.Pred.IMPORTS)
          imports.push(s);
        if(initial && kind == this.Pred.TYPE && this.isOntology(s.object.value)) {
          initial = false;
          tmp.iri = s.subject.value;
        }
        if(kind == this.Pred.TYPE && this.isAnnotation(s.object.value))
          tmp.annoMap[s.subject.value] = 1;
    }

    for(const toImport of imports) {
        let iri = this.getValue(toImport.object);
        let baseIri = this.cleanIri(iri);
        if(!tmp.loaded[baseIri]) {
            tmp.loaded[baseIri] = 1;
            const req = await fetch(tmp.iriMap[baseIri] || baseIri);
            if(!req.ok)
                throw "failed to load";
            const rData = await req.text();
            await this.parseData(rData, baseIri, req.headers.get("Content-Type"), tmp);
        }
    }

    for(const s of data.stmts) {
        var kind = this.PredMap[s.predicate.value] ?? 0;
        if(kind == 0) {
          let pe = this.splitNS(s.predicate.value);
          kind = this.PredMap[pe.ns] ?? 0;
        }
        if(tmp.annoMap[s.predicate.value]) {
          kind = this.Pred.ANNOTATION_DATA;
        }
        preds[kind].push(s);
    }

    for(const ns in data.ns) {
        tmp.ns[ns] = data.ns[ns];
    }
  }

  async transform(rdfData, baseIri, contentType, iriMap) {
    let result = {};
    let preds = [...Array(this.PredCount)].map(_=>[]);
    let tmp = {
      preds:preds,
      ns:{},
      loaded:{},
      iriMap:iriMap,
      annoMap:{}
    }
    await this.parseData(rdfData, baseIri, contentType, tmp, true);

    if(tmp.iri)
      baseIri = tmp.iri;
    this.initResult(result, tmp.annoMap, baseIri);
    this.handlePreds(preds, result);
    this.sanatizeResult(result);
    this.applySplitRules(result);
    this.handleLanguages(result);
    this.handleBaseIris(result);
    this.handlePrefixList(tmp.ns, result);
    this.finiResult(result);
    return result;
  }

  constructor(parse) {
    this.parse = parse;
  }

}
