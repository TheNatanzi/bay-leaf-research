const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),d=require('./research.json');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),ctx=vm.createContext({});
for(const name of ['tablePageWindow','matchesCity'])vm.runInContext(html.match(new RegExp('function '+name+'\\([^\\n]+\\}'))[0],ctx);
const rows=Array.from({length:2133},(_,i)=>i);
assert.equal(ctx.tablePageWindow(rows,30).rows.length,2133);assert.equal(ctx.tablePageWindow(rows,30).page,0);assert.equal(ctx.tablePageWindow(rows,30).all,true);
for(const size of [50,100,250,500]){const pages=Array.from({length:Math.ceil(rows.length/size)},(_,page)=>[...ctx.tablePageWindow(rows,page,String(size)).rows]);assert.deepEqual(pages.flat(),rows);assert.equal(ctx.tablePageWindow(rows,999,String(size)).end,2133);assert.equal(ctx.tablePageWindow(rows,-1,String(size)).start,0);}
const zero=ctx.tablePageWindow([],4,'all');assert.equal(zero.rows.length,0);assert.equal(zero.start,0);assert.equal(zero.end,0);assert.equal(zero.page,0);
assert.equal(ctx.tablePageWindow(rows,1,'garbage').all,true);assert.equal(ctx.tablePageWindow(rows,Infinity,50).page,0);
assert(ctx.matchesCity({city:'San Francisco'},' san fran '));assert(!ctx.matchesCity({city:'San Rafael'},'San Francisco'));assert(ctx.matchesCity({},''));assert(!ctx.matchesCity({},'Oakland'));
const cityRows=d.venues.filter(v=>ctx.matchesCity(v,'San Francisco'));assert(cityRows.length>50);assert(ctx.tablePageWindow(cityRows,0).rows.length===cityRows.length);
vm.runInContext(fs.readFileSync(path.join(__dirname,'numeric-ui.js'),'utf8').match(/function venueTableLabel\([^\n]+\}/)[0],ctx);assert.equal(ctx.venueTableLabel({name:'Ballroom',parent_property:'Example Hotel'}),'Example Hotel · Ballroom');assert.equal(ctx.venueTableLabel({name:'Example Hotel — Ballroom',parent_property:'Example Hotel'}),'Example Hotel — Ballroom');vm.runInContext(html.match(/function compareValue\([^\n]+\}/)[0],ctx);assert.equal(ctx.compareValue({name:'Ballroom',parent_property:'Example Hotel'},'name'),'Example Hotel · Ballroom');
assert(html.includes("comparePageSize='all'"));assert(html.includes("catalogPageSize='all'"));assert(html.includes('<option value="all" selected>All results</option>'));for(const id of ['compareCity','governmentCity','potentialCity'])assert(html.includes('id="'+id+'"'));assert(html.includes('data-density="compact"'));
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
assert.deepEqual(JSON.parse(html.match(/<script id="research-data" type="application\/json">(.*?)<\/script>/s)[1]),d);
console.log('Spreadsheet: all 2,133 rows by default, complete optional pages, boundary resets, city search, inline JS syntax and unchanged embedded data passed');
