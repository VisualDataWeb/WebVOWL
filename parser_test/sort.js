#!/usr/bin/env node
/*
      Sort VOWLv2 json files to diff against files from another parser.

      usage:
        ./sort.js file.json
 */
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { VOWLSorter } from  './sorter.js';

if(process.argv.length < 3)
    process.exit(1);

var data = JSON.parse(fs.readFileSync(process.argv[2]));

data = (new VOWLSorter()).sort(data);
console.log(JSON.stringify(data, null, 2));
