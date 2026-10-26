'use strict';
const assert=require('node:assert/strict'),d=require('./research.json'),e=require('./normalized-engine.js').create(d),by=new Map(d.venues.map(v=>[v.id,v])),v=by.get('villa-chanticleer-wedding-package-sonoma');
assert.equal(e.value(v,'rental_hours'),null);assert.equal(v.published_event_duration_hours,6);
for(const date of ['2027-01-01','2027-02-14','2027-04-09']){
 assert.equal(e.dateAvailability(v,date).blocked,true);
 const cost=e.scenario(v,{eventDate:date,venueFee:1000});assert.equal(cost.complete,false);assert.ok(cost.missing.includes('published booking hold covers selected date'));
 const rank=e.ranking(v,{weights:{reviews:1},reviews:5,minimumCoverage:100},cost);assert.equal(rank.blocked,true);assert.equal(rank.score,null);
}
for(const date of ['2026-12-31','2027-04-10','','2027-02-30']){assert.equal(e.dateAvailability(v,date).blocked,false);assert.match(e.dateAvailability(v,date).note,/unverified/);}
assert.ok(e.scenario(v,{eventDate:'2027-02-30'}).missing.includes('invalid event date'));
const unknown=by.get('kohl-mansion-san-mateo');
assert.equal(e.value(unknown,'capacity_seated'),300);assert.equal(e.provenance(unknown,'capacity_seated').method,'manually_reviewed_directory_profile');assert.match(e.provenance(unknown,'capacity_seated').quality,/directory/);
const q=require('./quantify.js'),kohlReviews=q.reviews(unknown);assert.equal(kohlReviews.platforms.length,3);assert.ok(!kohlReviews.platforms.some(r=>r.name==='Google'));assert.ok(Math.abs(kohlReviews.score-(4.3*15+4.4*17+5)/33)<1e-9);
assert.ok(e.scenario(unknown,{food:50,foodBasis:'outside_caterer'}).missing.includes('outside caterer permission for selected food assumption'));
assert.ok(e.scenario(unknown,{food:50}).missing.includes('food assumption basis and venue applicability'));
assert.ok(!e.scenario(unknown,{food:50,foodBasis:'venue_quote'}).missing.includes('food assumption basis and venue applicability'));
const permitted=d.venues.find(v=>e.value(v,'outside_catering')==='yes');assert.ok(permitted);
assert.ok(!e.scenario(permitted,{food:50,foodBasis:'outside_caterer'}).missing.includes('outside caterer permission for selected food assumption'));
assert.ok(!e.scenario(unknown,{mode:'venue_only',food:50}).missing.includes('food assumption basis and venue applicability'));
for(const lead of d.venues.filter(v=>v.id.startsWith('seb-chamber-')))assert.equal(e.value(lead,'capacity_max'),null,'Directory-only lead must not receive verified numeric occupancy');
assert.equal(e.value(by.get('ralston-white-retreat-marin'),'construction_year'),null);assert.equal(e.fieldStatus(by.get('ralston-white-retreat-marin'),'construction_year'),'conflicting');
assert.equal(e.value(by.get('larpd-ravenswood-historic-site-alameda'),'construction_year'),1893);
assert.ok(d.founder_experiences.length>=81);assert.equal(new Set(d.founder_experiences.map(r=>r.url.replace(/\/$/,''))).size,d.founder_experiences.length);
console.log('Published date holds, invalid dates, event/rental duration, outside-food applicability, unverified directory leads, history separation and founder identity passed.');
