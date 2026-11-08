const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm'),E=require('./normalized-engine.js');
const d=require('./research.json'),a=require('./system-audit.json'),e=E.create(d),v=id=>d.venues.find(x=>x.id===id),val=(id,key)=>e.value(v(id),key);
assert.equal(d.venues.length,2344);assert.equal(Object.keys(d.normalized.properties).length,1002);
assert.equal(a.unique_properties,6);assert.equal(a.added_record_ids.length,10);assert.equal(a.changes.length,97);
assert.deepEqual(d.venues.slice(2334).map(x=>x.id),a.added_record_ids);
for(const x of a.changes){assert.equal(val(x.record_id,x.field),x.value);assert(x.source_url.startsWith('https://'));}
const sc='san-carlos-adult-community-center-san-carlos-san-mateo',combo='san-carlos-adult-community-center-parkview-patio-room-combo-san-carlos-san-mateo';
assert.equal(val(sc,'capacity_dinner_dance'),120);assert.equal(val(combo,'fee_min'),1102);assert.equal(val(combo,'fee_max'),1322);assert.equal(val(combo,'cleaning_fee'),325);assert.equal(val(combo,'security_hourly'),72);
for(const id of [sc,...a.added_record_ids.filter(x=>x.startsWith('san-carlos-'))]){assert.equal(val(id,'outside_catering'),null);assert.equal(val(id,'event_end'),null);assert.equal(val(id,'music_indoor'),null);assert.equal(e.fact(v(id),'capacity_max').effective_date,'2026-07-01');}
assert.equal(val('lakeside-park-garden-center-oakland-alameda','capacity_max'),300);assert.equal(val('lakeside-park-garden-center-oakland-alameda','parking_cost'),null);
assert.equal(val('dunsmuir-hellman-historic-estate-oakland-alameda','construction_year'),1899);assert.notEqual(val('dunsmuir-hellman-historic-estate-oakland-alameda','lodging_rooms'),37);
const ui=fs.readFileSync(path.join(__dirname,'normalized-ui.js'),'utf8'),html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),workspace=fs.readFileSync(path.join(__dirname,'workspace-ui.js'),'utf8');
const ctx=vm.createContext({});vm.runInContext(ui.match(/^function comparablePlanningTotal.*$/m)[0],ctx);
assert.equal(ctx.comparablePlanningTotal({complete:true,high:30000,capacity_fit:'Exceeds published dinner/dance count'}),null);
assert.equal(ctx.comparablePlanningTotal({complete:false,high:30000}),null);assert.equal(ctx.comparablePlanningTotal({complete:true,high:30000,capacity_fit:'Dinner/dance layout unverified'}),30000,'Unknown layout remains a separate factual warning, not invented infeasibility');
assert(html.includes('id="compareGuests" value="330"'));assert(html.includes('function catalogColumns(){return activeColumns()'));assert(html.includes('compareCell(v,k,n)'));
assert(workspace.includes("if(!location.hash)tab('compare')"));assert(workspace.includes("$('compareGroup').value=selectedColumnGroup"));assert(workspace.includes('Planner workbook'));assert.equal(a.resource_replay.review_complete,false);const css=fs.readFileSync(path.join(__dirname,'spreadsheet.css'),'utf8');assert(css.includes('.venue-detail-row>td'));assert(css.includes('position:fixed;left:12px;right:12px'));const numeric=fs.readFileSync(path.join(__dirname,'numeric-ui.js'),'utf8');assert(numeric.includes("cell.colSpan=row.cells.length"));assert(numeric.includes("existing.remove()"));
console.log('System audit: exact room facts, source dates, conditional charges, unresolved conflicts, capacity cost guard and shared table controls passed');
