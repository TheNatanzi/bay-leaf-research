'use strict';
const assert=require('node:assert/strict'),d=require('./research.json'),e=require('./normalized-engine.js').create(d),by=new Map(d.venues.map(v=>[v.id,v]));
const c={guests:100,hours:6,eventDate:'2027-05-15',mode:'venue_only',venueFee:1000,fixed:0,servicePct:0,taxPct:0,otherCostsConfirmed:true};
const fixed=s=>s.components.find(x=>x.name==='Additional mandatory charges')?.low;
for(const v of d.venues.filter(v=>v.conditional_requirements?.custodial_fee===100)){
 const s=e.scenario(v,c);assert.equal(fixed(s),100);assert.ok(s.missing.includes('assumed fixed charges below published mandatory amount'));assert.equal(s.complete,false);
 assert.equal(fixed(e.scenario(v,{...c,guests:50,fixed:100})),100);
 const below=e.scenario(v,{...c,guests:49});assert.ok(below.missing.some(x=>x.includes('total attendance including vendors')));
 assert.equal(fixed(e.scenario(v,{...c,guests:49,attendees:49})),0);
 assert.equal(fixed(e.scenario(v,{...c,guests:49,attendees:51,fixed:100})),100);
 assert.equal(fixed(e.scenario(v,{...c,fixed:300})),300); // fixed assumption already contains conditional fee; no duplicate addition
}
const v=by.get('bayanihan-dr-borja-barangay-hall-san-francisco');assert.equal(fixed(e.scenario(v,{...c,guests:80})),250);assert.equal(fixed(e.scenario(v,{...c,guests:80,fixed:250})),250);
assert.equal(fixed(e.scenario(v,{...c,guests:79,attendees:79})),0);const unknown=e.scenario(v,{...c,fixed:''});assert.equal(fixed(unknown),250);assert.ok(unknown.missing.includes('other mandatory fixed charges beyond conditional minimum'));
assert.ok(!unknown.components.some(x=>x.low===100&&/clean/i.test(x.name))); // contingent failure penalty is not unavoidable base cost
console.log('Conditional charge thresholds, total-attendance uncertainty, fixed-cost floor and no-double-counting checks passed.');
