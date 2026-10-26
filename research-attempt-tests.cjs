/* Research outcomes must remain distinguishable and traceable without erasing known facts. */
'use strict';
const assert=require('node:assert/strict'),d=require('./research.json'),N=require('./normalized-engine.js').create(d),Q=require('./quantify.js');
const ambrose=d.venues.find(v=>v.id==='ambrose-community-center-bay-point-contra-costa');
assert.equal(N.fieldStatus(ambrose,'fee_min'),'searched_no_public_answer');
assert.equal(N.value(ambrose,'fee_min'),null);
assert.match(N.provenance(ambrose,'fee_min').source_text,/Reviewed district/);
assert.equal(N.provenance(ambrose,'fee_min').source_urls[0],'https://www.ambroserec.org/facility-rental');
const plant=d.venues.find(v=>v.id==='plant-connection-sf-san-francisco');
assert.equal(N.fieldStatus(plant,'capacity_seated'),'conflicting');
assert.equal(N.value(plant,'capacity_seated'),null);
assert.equal(N.value(plant,'capacity_standing'),96);
const lefty=d.venues.find(v=>v.id==='lefty-gomez-recreation-center-rodeo-contra-costa');
assert.equal(N.value(lefty,'guest_departure'),1200);
assert.equal(N.fieldStatus(lefty,'music_indoor'),'searched_no_public_answer');
assert.equal(N.value(lefty,'minimum_rental_hours'),4);
for(const v of d.venues){for(const [key,f] of Object.entries(N.record(v).facts)){if(f.method==='documented_source_review'){assert.equal(f.value,null);const p=N.provenance(v,key);assert.ok(p.source_urls.length&&p.checked_utc);}}}
console.log('Research outcomes: searched unknowns, numeric preservation, conflicts, cutoff scope and provenance passed.');
