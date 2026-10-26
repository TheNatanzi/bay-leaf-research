'use strict';
const assert=require('node:assert/strict'),d=require('./research.json'),e=require('./normalized-engine.js').create(d),by=new Map(d.venues.map(v=>[v.id,v]));
const config={guests:100,hours:6,eventDate:'2027-05-15',mode:'separate',venueFee:1000,food:50,foodBasis:'outside_caterer',bar:0,fixed:0,servicePct:0,taxPct:0,otherCostsConfirmed:true};
const olde=by.get('olde-vet-s-hall-bud-s-pub-grill-solano'),s=e.scenario(olde,config);assert.equal(e.value(olde,'fixed_mandatory'),250);assert.ok(s.missing.includes('assumed fixed charges below published mandatory amount'));assert.equal(s.components.find(c=>c.name==='Additional mandatory charges').low,250);assert.equal(s.complete,false);
const hall=by.get('sebastopol-community-cultural-center-main-hall-sonoma'),h=e.scenario(hall,{...config,fixed:''});assert.equal(h.components.find(c=>c.name==='Additional mandatory charges').low,100);assert.equal(h.components.filter(c=>c.name==='Separate cleaning fee').length,0);
const villa=by.get('villa-chanticleer-wedding-package-sonoma');assert.equal(e.value(villa,'bar_min'),15);assert.equal(e.value(villa,'bar_max'),null);assert.equal(e.value(villa,'parking_spaces'),100);assert.equal(e.value(villa,'rental_hours'),null);
assert.ok(e.scenario(villa,{...config,bar:'',fixed:100}).missing.includes('bar bounds'));
const unknow=by.get('kohl-mansion-san-mateo');assert.equal(e.scenario(unknow,config).complete,false);assert.ok(e.scenario(unknow,config).missing.includes('outside caterer permission for selected food assumption'));
console.log('Critical review1: known mandatory charges survive lower overrides; maintenance not duplicated, bar starting price not complete, food permission remains unresolved.');
