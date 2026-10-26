'use strict';
const assert=require('node:assert/strict'),d=require('./research.json'),g=require('./geography-audit.json'),e=require('./normalized-engine.js').create(d),by=Object.fromEntries(d.venues.map(v=>[v.id,v]));
assert.equal(g.city_rows,101);assert.equal(g.workstreams,110);assert.equal(g.reconciliation.reduce((n,r)=>n+r.official_cities,0),101);
for(const r of g.reconciliation){assert.equal(r.official_cities,r.coverage_city_rows);assert.deepEqual(r.missing_city_rows,[]);assert.deepEqual(r.extra_city_rows,[]);}
const hall=by['portola-valley-towncenter-hall-san-mateo'],grove=by['portola-valley-towncenter-redwood-grove-san-mateo'],vmb=by['redwoodcity-veterans-redwoodab-san-mateo'],cab=by['redwoodcity-cab-rooms234-san-mateo'],pool=by['ladera-recreation-district-pool-deck-san-mateo'];
assert.equal(e.value(hall,'capacity_max'),300);assert.equal(e.value(hall,'capacity_seated'),150);assert.equal(e.value(hall,'capacity_dinner_dance'),null);assert.equal(e.value(hall,'music_indoor'),1320);assert.equal(e.value(hall,'guest_departure'),1380);assert.equal(e.value(hall,'fee_min'),null);assert.match(hall.booking_status,/resident/i);
assert.equal(e.value(grove,'music_indoor'),null);assert.equal(e.value(grove,'capacity_max'),null);assert.equal(e.value(grove,'outside_catering'),null);
assert.equal(e.value(vmb,'capacity_seated'),126);assert.equal(e.value(vmb,'capacity_max'),140);assert.equal(e.value(vmb,'event_end'),1260);assert.equal(e.value(vmb,'cleanup_end'),1320);
assert.equal(e.value(cab,'capacity_seated'),200);assert.equal(e.value(cab,'event_end'),1380);assert.equal(e.value(cab,'music_indoor'),null);assert.equal(e.value(cab,'hourly_fee'),null);assert.equal(cab.conditional_requirements.custodial_fee,100);assert.equal(cab.conditional_requirements.security_ratio_guests_per_guard,50);
assert.equal(e.value(pool,'capacity_max'),400);assert.equal(e.value(pool,'capacity_seated'),null);assert.equal(e.value(pool,'music_outdoor'),1230);assert.match(pool.city,/unincorporated/);
for(const m of d.municipality_coverage)if(m.municipal_rental_status!=='Not yet audited'&&!m.source_urls.length)assert.ok(m.evidence_gap);
assert.equal(new Set(d.venues.map(v=>v.id)).size,d.venues.length);
console.log('Geography: official101city baseline,110workstream scope, legal eligibility, room layouts, event/music/cleanup separation and conditional pricing passed.');
