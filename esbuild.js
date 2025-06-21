#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');
const pkg = require('./package.json');

const outdir = path.join(__dirname, 'deploy/');
const static_files = {'./src/index.html' : '',
                      './src/favicon.ico' : '',
                      './src/app/data/benchmark.json' : 'data',
                      './src/app/data/foaf.json' : 'data',
                      './src/app/data/goodrelations.json' : 'data',
                      './src/app/data/muto.json' : 'data',
                      './src/app/data/new_ontology.json' : 'data',
                      './src/app/data/ontovibe.json' : 'data',
                      './src/app/data/personasonto.json' : 'data',
                      './src/app/data/sioc.json' : 'data',
                      './src/app/data/template.json' : 'data'
};

const options = {
  bundle: true,
  outdir: outdir,
  external: ['d3'],
  minify: false,
  sourcemap: true,
  // target: 'es2015',
  format:'iife',
  platform: 'browser',
  entryNames: '[ext]/[name]',
  plugins: [{
    name: 'watch',
    setup({ onEnd }) {
      onEnd((ret) => {
      })
    }
  }]
};

function copy_static_file(file) {
    const p = path.join(__dirname, file);
    var data = fs.readFileSync(p)
    if(file.endsWith('index.html'))
      data = data.toString('utf8').replaceAll('<%= version %>', pkg.version);
    const foutDir = path.join(outdir, static_files[file]);
    try { fs.mkdirSync(foutDir, 0775); } catch(e) {}
    fs.writeFileSync(path.join(foutDir, path.basename(p)), data);
}

function copy_static() {
  for(var file in static_files) copy_static_file(file);
}

function watch_static() {
  try { fs.mkdirSync(outdir, 0775); } catch(e) {}
  for(var file in static_files) {
    (function (f) {
      fs.watchFile(path.join(__dirname, f), {
        bigint: false,
        persistent: true,
        interval: 1000,
      }, () => {
        copy_static_file(f);
      });
    })(file);
  }
  console.log('watching...');
}

function build(opt) {
  esbuild.context(Object.assign(opt, options))
  .then((r) => {
    r.watch();
    console.log('watching...');
  }).catch(() => process.exit(1));
}

copy_static();
watch_static();

build({
  entryPoints: {
		'js/webvowl': './src/webvowl/js/entry.js'
  },
  globalName: 'webvowl'
});

build({
  entryPoints: {
		'js/webvowl.app': './src/app/js/entry.js'
  },
  globalName: 'webvowl.app'
});

build({
  entryPoints: {
        'js/d3.min' : './node_modules/d3/d3.min.js'
  },
  globalName: 'd3'
});
