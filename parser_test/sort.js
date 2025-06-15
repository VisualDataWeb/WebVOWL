#!/usr/bin/env node
/*
      Sort VOWLv2 json files to diff against files from another parser.

      usage:
        ./sort.js file.json
 */
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

if(process.argv.length < 3)
    exit(1);

var data = JSON.parse(fs.readFileSync(process.argv[2]));

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

data = sort_data(data);
console.log(JSON.stringify(data, null, 2));
