const assert=require('node:assert/strict'),d=require('./research.json'),f=require('./founder-experiences.json'),N=require('./normalized-engine.js').create(d),M=require('./quantify.js');
const by=id=>{const v=d.venues.find(x=>x.id===id);assert(v,id);return v;};
const melody=by('the-melody-of-san-francisco-main-hall');
assert.equal(N.value(melody,'capacity_max'),350);assert.equal(N.value(melody,'capacity_seated'),120);
assert(melody.conditional_pricing_evidence.some(x=>x.starting_per_guest_usd===375&&x.maximum_seated_guests===75&&x.tax_and_service_extra));
assert.equal(N.value(melody,'package_min'),null);assert.equal(melody.mandatory_total_price,null);
const atlas=by('atlas-union-square-san-francisco');assert.match(atlas.address,/251 Geary/);assert.equal(N.value(atlas,'capacity_seated'),null);assert.equal(N.fieldStatus(atlas,'capacity_seated'),'conflicting');assert.notEqual(N.value(atlas,'wedding_permission'),'advertised');
const terra=by('terra-gallery-event-venue-san-francisco');assert.equal(N.value(terra,'fee_min'),null);assert.equal(M.reviews(terra).score,4.6);assert(terra.review_observations.some(x=>x.review_count===11));
const bank=by('merchants-exchange-banking-hall-san-francisco');assert.match(bank.address,/465 California/);assert.equal(N.value(bank,'capacity_seated'),250);assert.notEqual(N.value(bank,'wedding_permission'),'advertised');
for(const [id,lo,hi] of [['sanborn-county-park-sequoia-peterson-grove-santa-clara',433,433],['mount-madonna-county-park-amphitheater-santa-clara',433,433],['vasona-lake-county-park-circle-santa-clara',275,367]]){
 const v=by(id);assert.equal(N.value(v,'fee_min'),lo);assert.equal(N.value(v,'fee_max'),hi);assert.equal(N.value(v,'fixed_mandatory'),120);
 assert.equal(N.value(v,'event_end'),null);assert.equal(N.value(v,'cleanup_end'),null);assert.equal(N.value(v,'capacity_dinner_dance'),null);assert.equal(v.mandatory_total_price,null);
 assert(v.conditional_pricing_evidence.some(x=>x.usd_per_staff_hour===80&&/Only if/.test(x.condition)));
}
const grant=by('joseph-d-grant-county-park-rose-garden-cookhouse-santa-clara');assert.equal(N.value(grant,'fee_min'),null);assert.equal(N.value(grant,'fixed_mandatory'),120);assert(grant.conditional_pricing_evidence.some(x=>x.daily_site_fee_usd===203));
assert.deepEqual(f,d.founder_experiences);assert.equal(f.length,96);assert.equal(new Set(f.map(x=>x.url)).size,f.length);
for(const venue of ['Fountain View Farm','The Venue at Chilleens','Cedar Grove Lodging','Vue Columbus','Block 41']){
 const x=f.find(x=>x.venue===venue&&x.url.startsWith('https://weddingvenueowners.com/')&&x.review_status.startsWith('Full written'));assert(x);assert.match(x.published,/^202[01]-\d\d-\d\d$/);assert(x.lessons&&x.geography&&x.checked_utc);assert.equal(x.profit,null);assert.equal(x.startup_cost,null);assert.match(x.review_status,/Full written/);
}
assert.match(f.find(x=>x.url==='https://www.coldspringbarn.com/blog/history').author,/ownership role|named writer/i);
const galleria=by('san-francisco-design-center-galleria-san-francisco');assert.equal(N.value(galleria,'capacity_max'),1600);assert.equal(N.value(galleria,'capacity_dinner_dance'),300);assert.equal(N.value(galleria,'capacity_seated'),400);assert.equal(N.value(galleria,'fee_min'),null);assert.equal(N.value(galleria,'outside_catering'),'conditional');assert(galleria.conditional_pricing_evidence.some(x=>x.additional_fee_usd===2500));
const flood=by('flood-mansion-san-francisco');assert.equal(N.value(flood,'capacity_seated'),165);assert.equal(N.value(flood,'fee_min'),14750);assert.equal(N.value(flood,'fee_max'),null);assert.equal(N.value(flood,'construction_year'),1915);assert.equal(N.value(flood,'wedding_opening_year'),null);
const sfmoma=by('sfmoma-wedding-rental-san-francisco');assert.equal(N.value(sfmoma,'capacity_max'),null);assert.equal(N.fieldStatus(sfmoma,'capacity_max'),'conflicting');assert.equal(N.value(sfmoma,'outside_catering'),'approved_only');assert.match(sfmoma.other_requirements,/Membership/);
const jazz=by('sfjazz-second-floor-lobby-san-francisco');assert.equal(N.value(jazz,'capacity_seated'),100);assert.equal(N.value(jazz,'capacity_max'),250);assert.notEqual(N.value(jazz,'wedding_permission'),'advertised');
const fillmore=by('the-fillmore-main-ballroom-san-francisco');assert.equal(N.value(fillmore,'capacity_seated'),250);assert.equal(N.value(fillmore,'capacity_max'),800);
const yacht=by('golden-gate-yacht-club-americas-cup-room-san-francisco');assert.equal(N.value(yacht,'capacity_seated'),100);assert.equal(N.value(yacht,'wedding_permission'),'advertised');assert.equal(N.value(yacht,'music_indoor'),null);
assert.equal(N.value(by('svn-west-event-venue-san-francisco'),'music_outdoor'),1320);assert.equal(N.value(by('the-midway-event-venue-san-francisco'),'capacity_max'),null);assert.equal(N.value(by('620-jones-event-venue-san-francisco'),'capacity_max'),null);
for(const id of ['pier-27-event-venue-san-francisco','pier-35-event-venue-san-francisco','pier-48-event-venue-san-francisco'])assert.equal(N.value(by(id),'capacity_seated'),null);
const queue=require('./directory-candidates.json'),resolution=require('./discovery-backlog-resolution-20261111.json');
assert.equal(resolution.original_pending_candidates,500);
const applications=resolution.reviewed_dispositions_applied;
assert.equal(new Set(applications.map(x=>x.candidate_id)).size,applications.length);
assert.equal(resolution.unreviewed_original_inputs,500-applications.length);
assert.equal(queue.summary.current_review_counts.pending,resolution.unreviewed_original_inputs);
for(const receipt of applications){
 const c=queue.candidates.find(x=>x.id===receipt.candidate_id);assert(c);
 assert.equal(c.review_state,receipt.state);assert(c.review_reason&&c.reviewed_utc);
 assert(receipt.source_urls.length&&receipt.candidate_capture_sha256);
 assert(receipt.source_urls.every(u=>c.review_source_urls.includes(u)));
 if(receipt.state==='blocked'){assert(receipt.blocker_kind);assert(!receipt.record_ids.length);}
 else{assert(receipt.operator_capture_sha256);assert(receipt.record_ids.length);for(const id of receipt.record_ids)assert(c.matched_record_ids.includes(by(id).id));}
}
const reconciliation=require('./discovery-reconciliation.json');
assert.equal(resolution.complete,false);assert.equal(resolution.municipal_searches_completed,0);
assert.equal(queue.candidates.filter(x=>x.url.includes('ggcatering.com/venues/')&&x.review_state==='pending').length,3);
console.log('Package limits, capacity conflicts, exact reviews, property identity, component costs, sunset clocks and complete founder export passed.');
