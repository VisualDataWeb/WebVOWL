export class VOWLSorter {
  sort(data) {
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
      if(can_cmp(attrMap[a.id].iri, attrMap[b.id].iri))
        return cmp(attrMap[a.id].iri, attrMap[b.id].iri);
      if(attrMap[a.id].union && attrMap[b.id].union) {
        let unionA = attrMap[a.id].union.sort();
        let unionB = attrMap[b.id].union.sort();
        if(unionA.length != unionB.length)
          return unionA.length - unionB.length;
        for(let idx = 0; idx < unionA.length; idx += 1) {
          if(unionA[idx] != unionB[idx])
            return cmp(attrMap[unionA[idx]].iri, attrMap[unionB[idx]].iri);
        }

        splitMap[a.id] = {type:a.type};
        splitMap[b.id] = {type:b.type};
      }
      return 0;
    });
    for(var i = 0; i < data.class.length; i += 1) {
      let it = data.class[i];
      let clsId = it.id;
      data.classAttribute[i] = attrMap[clsId];
      classIdMap[clsId] = i;

      if(splitMap[it.id]) {
        if(!splitIds[it.type]) splitIds[it.type] = [];
          splitIds[it.type].push(i);
      }

      if(it.type == "owl:Thing" || it.type == "rdfs:Literal" || it.type == "rdfs:Datatype") {
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
        case "union":
          value.forEach((it, idx) => {
            value[idx] = classIdMap[it];
          });
          value.sort();
          break;
        case "individuals":
          value.sort((a, b) => a.iri.localeCompare(b.iri));
          if(typeof value === "object") for(var k in value) fixClassIds(k, value[k], value);
          break;
        case "attributes":
          value.sort();
          break;
        case "isDefinedBy":
          value.sort((a, b) => a.value.localeCompare(b.value));
          if(typeof value === "object") for(var k in value) fixClassIds(k, value[k], value);
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
        case "isDefinedBy":
          value.sort((a, b) => a.value.localeCompare(b.value));
          if(typeof value === "object") for(var k in value) fixClassIds(k, value[k], value);
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
        if(key == "baseIris" || key == "languages" || key == "author")
          value.sort();
      }
      else
      if(typeof value === "object") {
        if(key == "other") {
          for(const item in value) {
            value[item].sort((a, b) => {
              if(can_cmp(a.identifier, b.identifier))
                return cmp(a.identifier, b.identifier);
              return cmp(a.value, b.value);
            });
          }
        }
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

  print_thing(result) {
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
}
