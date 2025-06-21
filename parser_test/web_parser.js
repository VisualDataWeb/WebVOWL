import { OWLParser } from './parser.js'
import { VOWLSorter } from './sorter.js'

export function init() {
    let rdflib = $rdf;
    let orig = DOMParser.prototype.parseFromString;
    const ns = (new DOMParser).parseFromString('INVALID', 'application/xml').getElementsByTagName("parsererror")[0].namespaceURI;
    DOMParser.prototype.parseFromString = function(a, b) {
        let r = orig.call(this, a, b);
        var err = "";
        for(const e of [...r.getElementsByTagNameNS(ns, 'parsererror')]) {
            err += e.innerText;
        }
        if(err != '')
            throw err;
        return r;
    }

    function parse(data, baseIri, contentType) {
        let store = rdflib.graph();
        rdflib.parse(data, store, baseIri, contentType);
        let stmts = store.statementsMatching(undefined, undefined , undefined);
        return {stmts:stmts, ns:store.namespaces};
    }

    window.parser = new OWLParser(parse);
    window.sorter = new VOWLSorter();
}
