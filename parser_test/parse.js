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
import { VOWLSorter } from  './sorter.js';
import { OWLParser } from  './parser.js';

if(process.argv.length < 3)
    process.exit(1);

function parse(data, baseIri, contentType) {
    let store = rdflib.graph();
    rdflib.parse(data, store, baseIri, contentType);
    let stmts = store.statementsMatching(undefined, undefined , undefined);
    return {stmts:stmts, ns:store.namespaces};
}

let parser = new OWLParser(parse);

try {
    const file = process.argv[2];
    var rdfData = fs.readFileSync(file).toString();
    const baseIri = "http://xmlns.com/foaf/0.1/";
    let iriMap = { "http://www.ics.forth.gr/isl/MarineTLO/v3/marinetlo.owl": "marinetlo.owl"};
    parser.transform(rdfData, baseIri, parser.MimeExtMap["owl"], iriMap).then((result) => {
        result = (new VOWLSorter()).sort(result);
        console.log(JSON.stringify(result, null, 2));
    });
} catch(err){
    console.log(err);
}

