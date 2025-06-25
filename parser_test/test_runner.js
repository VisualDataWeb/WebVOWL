#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as  puppeteer from  'puppeteer';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var testData = {tests:[]};

let testPath = path.join(__dirname, "tests");
fs.readdir(testPath, (err, files) => {
  if(err)
	throw new Error("cannot read tests");
  for(const file of files) {
    if(file.endsWith(".json"))
      testData.tests.push(JSON.parse(fs.readFileSync(path.join(testPath, file))));
  }
});


(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', "--disable-web-security", "--incognito"]
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  page.on('console', msg => console.log(msg.text()));
  page.on('pageerror', msg => console.log(msg));
  await page.exposeFunction('onFinish', async (fail) => {
    await browser.close();
    if(fail)
      process.exit(1);
  });

  await page.goto("file://" + path.join(__dirname, "runner.html"), {'waitUntil':'load'});

  await page.evaluate((data) => { window.testData = data }, testData);

  await page.evaluate(() => {
    async function getData(file) {
      const response = await fetch(file);
      if (!response.ok)
        throw new Error("cannot fetch file: " + file);
      return await response.text();
    }

    var fail = false;
    (async () => {
      let web = await import("./web_parser.js");
      web.init();
      for(var test of testData.tests) {
        try {
            const ext = test.file.substr(test.file.lastIndexOf(".") + 1);
            const data = await getData(test.file);
            const compare = await getData(test.compare);
            var result = await parser.transform(data, test.baseIri, parser.MimeExtMap[ext], getLoader(test.iriMap));
            result._comment = "Created with OWL2VOWL (version 0.3.7), http://vowl.visualdataweb.org";
            const diff = Diff.structuredPatch("parsed", "orig", JSON.stringify(sorter.sort(result), null, 2).trim(), compare.trim());
            if(diff.hunks.length)
              throw new Error(Diff.formatPatch(diff));
            console.log(test.file + ": ok");
        } catch(err){
            console.log("test for " + test.file + " failed with:");
            console.log(err.message);
            fail = true;
        }
      }

      window.onFinish(fail);
    })();
  });


})();
