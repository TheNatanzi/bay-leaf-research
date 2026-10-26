'use strict';
const assert=require('node:assert/strict'),d=require('./research.json'),E=require('./normalized-engine.js'),e=E.create(d),v=id=>d.venues.find(x=>x.id===id);
const orchard=v('dawn-ranch-orchard-wedding-weekend-package-sonoma');
assert.equal(e.value(orchard,'required_lodging_units'),40);assert.equal(e.value(orchard,'lodging_min_nights'),2);assert.equal(e.value(orchard,'required_lodging_unit_nights'),80);assert.equal(e.value(orchard,'late_night_required_units'),66);assert.equal(e.value(orchard,'lodging_in_venue_fee'),'no');assert.equal(e.value(orchard,'lodging_total_min'),null);
const config={guests:100,hours:6,eventDate:'2027-05-15',mode:'separate',foodBasis:'venue_quote',venueFee:1000,food:50,bar:10,fixed:5000,servicePct:0,taxPct:0,otherCostsConfirmed:true};
for(const id of ['dawn-ranch-weekday-wedding-package-sonoma','dawn-ranch-micro-wedding-package-sonoma']){const record=v(id);assert.equal(e.value(record,'required_lodging_units'),null);assert.equal(e.fieldStatus(record,'required_lodging_units'),'conflicting');assert.equal(e.value(record,'required_lodging_unit_nights'),null);assert.equal(e.value(record,'lodging_min_nights'),2);}
assert(e.scenario(orchard,config).missing.includes('mandatory lodging/buyout total, inclusion and payer liability'));
const accounted=e.scenario(orchard,{...config,lodgingHandling:'included_in_fixed',spendBase:'food_bar'});assert(accounted.assumptions.some(x=>x.includes('no guest reimbursement')));
assert(e.scenario(orchard,{...config,lodgingHandling:'not_required'}).missing.some(x=>x.includes('mandatory lodging')));
assert(e.scenario(orchard,{...config,lodgingHandling:'included_in_fixed',fixed:0}).missing.some(x=>x.includes('mandatory lodging')));
assert(e.scenario(orchard,{...config,lodgingHandling:'included_in_fixed',taxPct:10,taxBase:'all_with_service'}).missing.some(x=>x.includes('overlap')));
const wild=v('wildhaven-sonoma-two-night-weekend-buyout-sonoma');assert.equal(e.value(wild,'required_lodging_unit_nights'),94);assert.equal(e.value(wild,'lodging_requirement'),'required_unallocated');assert.equal(e.value(wild,'sleep_capacity'),null);
const straus=v('straus-home-ranch-marin');assert.equal(e.value(straus,'sleep_capacity'),8);assert.equal(e.value(straus,'bedrooms'),4);assert.equal(e.value(straus,'lodging_nightly_min'),null); // Vacation reference is not a wedding rate.
const west=v('westerbeke-two-night-wedding-package-sonoma');assert.equal(e.value(west,'included_overnight_guests'),50);assert.equal(e.value(west,'included_lodging_nights'),2);assert.equal(e.value(west,'lodging_service_pct'),20);assert.equal(e.value(v('westerbeke-ranch-sonoma'),'sleep_capacity'),null);
const san=v('san-pablo-community-hall-contra-costa');assert(e.scenario(san,{...config,hours:4,securityMode:'calculate',securityHours:4,securityCount:1}).missing.includes('security billable hours below published minimum'));assert(e.scenario(san,{...config,hours:4}).missing.includes('rental shorter than published minimum'));
console.log('Lodging: offer scope, unit-nights, unknown totals, no speculative offsets, charge-base overlap and billable minima passed.');
