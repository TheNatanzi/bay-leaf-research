'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),files=[...html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g)].map(m=>m[1]);
assert.deepEqual(files,['quantify.js','numeric-ui.js','normalized-engine.js','normalized-ui.js']);
const context=vm.createContext({});
// The application inline script has not run yet: UI extensions must not access its helpers at load time.
for(const file of files)vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
context.data=require('./research.json');
const metrics=vm.runInContext("metricFor(data.venues.find(v=>v.id==='kohl-mansion-san-mateo'))",context);
assert.equal(metrics.max_capacity,300);assert.equal(metrics.seated_capacity,300);assert.match(metrics.capacity_basis,/Directory/);
assert.equal(vm.runInContext("numericColumns.some(c=>c.key==='metric:n:capacity_dinner_dance')",context),true);
console.log('Actual external-script order initializes before app helpers; typed comparison remains active.');
