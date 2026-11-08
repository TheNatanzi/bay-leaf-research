const fs=require('fs'),assert=require('assert/strict'),p=require('path'),E=require('./normalized-engine.js');
const read=n=>JSON.parse(fs.readFileSync(p.join(__dirname,n),'utf8')),d=read('research.json'),a=read('municipal-gap-audit.json'),e=E.create(d),by=new Map(d.venues.map(v=>[v.id,v]));
assert.equal(a.cases.length,50);assert.equal(new Set(a.cases.map(x=>x.county+'|'+x.municipality)).size,50);assert.equal(a.complete,false);
assert.equal(a.summary.new_discovery_records,196);assert.equal(d.venues.length,2334);assert.deepEqual(d.venues.slice(0,a.record_ids_before.length).map(x=>x.id),a.record_ids_before);
assert.deepEqual(read('municipality-coverage.json'),d.municipality_coverage);assert.equal(d.municipality_coverage.filter(x=>x.municipal_rental_status==='Not yet audited').length,0);assert.equal(a.cases.filter(x=>x.state==='partial_primary_review').length,50);
for(const c of a.cases){assert.equal(c.methods_exhausted,false);assert(c.remaining);assert(c.source_routes.some(x=>x.state==='primary_content_reviewed'));assert(/unsearched/i.test(c.field_review_state.other_fields));for(const x of c.lead_dispositions)assert(x.record_ids.every(k=>by.has(k)));}
for(const id of a.added_record_ids){const v=by.get(id);assert(v.government);assert.equal(v.mandatory_total_price,null);assert.equal(v.midnight_indoor,null);assert(v.sources.length);assert(d.normalized.records[id]);}
const val=(id,k)=>e.value(by.get(id),k);
assert.equal(val('mill-valley-community-center-marin','music_indoor'),1440);assert.equal(val('mill-valley-community-center-marin','music_outdoor'),1320);assert.equal(val('mill-valley-community-center-marin','cleanup_end'),null,'weekday-dependent access must not become one cleanup clock');
assert.equal(e.fact(by.get('mill-valley-community-center-marin'),'music_indoor').effective_date,'2026-09-02');
assert.equal(val('falkirk-cultural-center-marin','music_outdoor'),1260);assert.equal(val('falkirk-cultural-center-marin','music_indoor'),1320);assert.equal(val('falkirk-cultural-center-marin','cleanup_end'),1380);
assert.equal(val('east-palo-alto-city-hall-community-room-east-palo-alto-san-mateo','capacity_max'),79);assert.equal(val('east-palo-alto-city-hall-community-room-east-palo-alto-san-mateo','capacity_dinner_dance'),null);
assert.equal(val('twin-pines-senior-and-community-center-belmont-san-mateo','capacity_seated'),null,'generic maximum must not become seated dinner count');
assert.equal(val('new-foster-city-community-center-lagoon-event-hall-ultimate-package-san-mateo','music_indoor'),null,'midnight rental window is not music permission');
assert(by.get('tiburon-community-room-tiburon-marin').booking_status.includes('Unavailable'));
assert(!a.added_record_ids.some(id=>id.includes('san-carlos-library')),'explicitly unsuitable social rooms excluded');
const colma=a.cases.find(c=>c.case===27);assert(colma.source_routes.some(x=>x.outcome==='unusable_truncated_pdf'));assert(colma.source_routes.some(x=>x.label==='full-2025-guide'&&x.page_count===28));
assert.equal(a.firecrawl_calls,0);
const town=by.get('los-altos-hills-town-hall-duxbury-room-los-altos-hills-santa-clara');assert(town.booking_status.includes('resident'));assert.equal(e.value(town,'hourly_fee'),null,'Unselected zero-price portal placeholder is not free rental');
assert(a.cases.find(x=>x.case===32).remaining.includes('may overlap'),'Ambiguous same-property rooms must retain identity uncertainty');
console.log('Municipal review provenance, stable IDs, date retention, room/layout/clock scope and historical-download safeguards passed');
