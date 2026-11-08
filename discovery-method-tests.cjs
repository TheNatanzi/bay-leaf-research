/* Evidence checks for the twenty actual source-review passes and applied research. */
const assert=require('node:assert/strict'),d=require('./research.json'),a=require('./discovery-method-audit-20261108.json'),q=require('./directory-candidates.json'),N=require('./normalized-engine.js').create(d),M=require('./quantify.js');
assert.deepEqual(a.passes.map(p=>p.pass),Array.from({length:20},(_,i)=>i+1));
for(const p of a.passes){assert(p.question&&p.critique&&p.method_change&&p.next_test);assert(p.sources.length&&p.searches.length&&p.outcomes.length);assert.equal(p.exhaustive,false);}
const by=id=>{const v=d.venues.find(v=>v.id===id);assert(v,id);return v;};
assert.equal(a.summary.new_records,20);for(const id of a.summary.new_record_ids){const v=by(id);assert.equal(v.mandatory_total_price,null);assert.equal(v.midnight_indoor,null);assert.equal(v.midnight_outdoor,null);assert(v.sources.length);}
const avalon=by('the-avalon-san-francisco');assert.equal(N.value(avalon,'capacity_seated'),null);assert.equal(N.fieldStatus(avalon,'capacity_seated'),'conflicting');
const douglas=by('the-douglas-beach-house-san-mateo');assert.equal(N.value(douglas,'event_end'),null);assert.equal(N.fieldStatus(douglas,'event_end'),'conflicting');assert.equal(N.value(douglas,'capacity_seated'),100);assert.equal(N.value(douglas,'bedrooms'),5);assert.equal(N.value(douglas,'sleep_capacity'),null);
const fume=by('luxe-cruises-events-fume-blanc-alameda');assert.equal(N.value(fume,'capacity_max'),330);assert.equal(N.value(fume,'capacity_seated'),160);assert.equal(N.value(fume,'capacity_dinner_dance'),null);
const kissel=by('kissel-uptown-oakland-gold-bug-ballroom-alameda');assert.equal(N.value(kissel,'capacity_standing'),300);assert.equal(N.value(kissel,'capacity_seated'),200);
const b=by('brownstone-gardens-contra-costa');assert.equal(N.value(b,'capacity_max'),200);assert.match(N.provenance(b,'capacity_max').source_text,/approximately/);
const church=by('swedenborgian-church-of-san-francisco-san-francisco'),reviews=M.reviews(church);assert.equal(reviews.score,4.8);assert(church.review_observations.some(r=>r.review_count===57&&r.provider==='WeddingWire'));
assert.match(by('angel-island-immigration-museum-immigration-museum-event-rooms-marin').wedding_permission,/most weddings/i);
assert(q.candidates.some(r=>r.name==='West Point Inn'&&r.review_state==='excluded'&&/prohibit/i.test(r.review_reason)));
assert.equal(q.candidates.length,q.summary.candidate_urls);assert.equal(new Set(q.candidates.map(r=>r.url)).size,q.candidates.length);assert(!q.candidates.some(r=>r.name==='Skip to main content'));assert(!q.candidates.some(r=>r.source_channels.includes('discovery-method-audit-20261108')&&r.url.endsWith('#inquire')));
assert.equal(a.summary.capture_counts[0].actual_named_profile_links_captured,39);assert.equal(a.summary.capture_counts[1].actual_named_profile_links_captured,158);
for(const id of ['ggnra-building-989-crissy-field-san-francisco','ggnra-building-1050-fort-cronkhite-marin']){assert.equal(N.value(by(id),'capacity_dinner_dance'),null);assert.notEqual(N.value(by(id),'wedding_permission'),'advertised');}
console.log('Twenty search passes, exact scopes, conflicts, no false all-in/midnight, reviews, eligibility and candidate deduplication passed.');
