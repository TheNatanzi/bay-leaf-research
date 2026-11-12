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
for(const slug of ['storek','legion-of-honor','san-francisco-city-hall']){
 const c=queue.candidates.find(x=>x.url==='https://www.ggcatering.com/venues/'+slug);assert(c);
 assert(['pending','blocked','reviewed_added','reviewed_existing'].includes(c.review_state));
 if(c.review_state.startsWith('reviewed_'))assert(c.matched_record_ids.length&&c.review_source_urls.length);
}
const cityHall=by('sf-city-hall-rotunda-san-francisco');
assert.equal(N.value(cityHall,'capacity_seated'),320);assert.equal(N.value(cityHall,'capacity_dinner_dance'),null);
assert.equal(N.value(cityHall,'event_end'),1440);assert.equal(N.value(cityHall,'cleanup_end'),1560);assert.equal(N.value(cityHall,'music_indoor'),null,'load-out at 2 AM is not music permission');
assert.equal(cityHall.mandatory_total_price,null);assert.equal(N.value(by('sf-city-hall-fourth-floor-north-gallery-san-francisco'),'event_end'),null,'daytime-only gallery must not inherit evening event clock');
const heritage=by('concord-heritage-center-betty-martin-barnes-hall-contra-costa');
assert.equal(N.value(heritage,'cleanup_end'),1380);assert.equal(N.value(heritage,'music_indoor'),null,'no loud music after 10 PM is not necessarily an all-music cutoff');
assert.equal(N.fact(heritage,'cleanup_end').effective_date,'2023-10-14');assert.equal(heritage.mandatory_total_price,null);
const single=by('singlethread-restaurant-inn-healdsburg-sonoma');assert(single.conditional_pricing_evidence.some(x=>x.midweek_buyout_starts_usd===65000&&x.peak_season_buyout_usd===85000&&x.all_in_total_unknown));assert.equal(single.mandatory_total_price,null);
const belle=by('belle-vie-estate-sherman-island-sacramento');assert.equal(belle.county,'Sacramento');assert.match(belle.geography_scope,/outside original nine/);
assert.equal(N.value(belle,'music_outdoor'),1380);assert.equal(N.value(belle,'bar_end'),1560);assert.equal(N.value(belle,'byob'),'no');assert.equal(N.value(belle,'capacity_dinner_dance'),null);assert.equal(belle.mandatory_total_price,null);
for(const id of ['del-dotto-venetian-estate-st-helena-napa','piazza-del-dotto-napa'])assert.equal(N.value(by(id),'wedding_permission'),'explicit_no');
const creekside=by('walnut-creek-elks-lodge-creekside-hall-contra-costa');
assert.equal(N.value(creekside,'outside_catering'),'yes');
assert.equal(N.value(creekside,'tables_included'),null,'listed tables are not confirmed free inclusions');
assert.equal(N.value(creekside,'capacity_dinner_dance'),null,'one room layout is not a summed parent-property capacity');
assert.equal(creekside.source_room_inventory.find(r=>r.id==='walnut-creek-elks-lodge-great-room-contra-costa').published_capacity.dinner_and_dancing,200);
const faith=by('faith-christian-fellowship-walnut-creek-contra-costa');
assert.equal(N.value(faith,'wedding_permission'),'advertised');assert.equal(N.value(faith,'capacity_dinner_dance'),null,'350 pew seats are not dinner-and-dancing seats');
assert.equal(N.value(faith,'deposit_refundable'),300,'refundable cash exposure must remain separate from event expense');
assert.equal(N.value(faith,'chairs_included'),'conditional','Fellowship Hall inclusion must not cover every room');
assert.equal(N.value(faith,'music_indoor'),null,'no loud music during quiet hours is not an all-music or event-end clock');
const faithRates=faith.conditional_pricing_evidence[0];assert.equal(faithRates.full_day_max_hours,6,'actual linked PDF differs from indexed differently named rate sheet');
assert.equal(faithRates.room_rates_usd.worship_center.full_day,850);assert.equal(faithRates.room_rates_usd.both_spaces.half_day,700);
assert(faithRates.cleaning_in_base_unresolved&&faithRates.av_technician_applicability_conflict&&faithRates.all_in_total_unknown);
assert.equal(N.value(by('first-presbyterian-church-concord-contra-costa'),'byob'),'no');
for(const id of ['faith-christian-fellowship-walnut-creek-contra-costa','walnut-creek-elks-lodge-creekside-hall-contra-costa','first-presbyterian-church-concord-contra-costa','north-marin-community-services-wilson-avenue-center-marin']){
 assert.equal(by(id).mandatory_total_price,null);assert.equal(N.value(by(id),'fixed_mandatory'),null,'unpublished costs must stay unknown');
}
const cityView=by('city-view-hall-treasure-island-san-francisco');assert.equal(cityView.address,'900 Avenue D, San Francisco, CA 94130');
assert.equal(N.value(cityView,'capacity_seated'),225);assert.equal(N.value(cityView,'tables_included'),'no');assert.equal(N.value(cityView,'music_indoor'),null,'commissary production access is not hall music permission');
const jccsf=by('jewish-community-center-of-san-francisco-san-francisco');assert.equal(N.value(jccsf,'tables_included'),'yes');assert.equal(N.value(jccsf,'deposit_refundable'),500);
assert.equal(jccsf.source_room_inventory.find(r=>r.id==='jccsf-kanbar-hall-san-francisco').published_capacity.banquet,350);assert.equal(N.value(jccsf,'capacity_dinner_dance'),null);
assert.equal(N.value(jccsf,'event_end'),null,'building and garage hours are not event cutoff');assert.equal(jccsf.mandatory_total_price,null);
const temescal=by('temescal-works-event-space-oakland-alameda');assert.equal(N.value(temescal,'hourly_fee'),null,'two live primary pages conflict on rate');assert.equal(N.value(temescal,'minimum_rental_hours'),4);assert.equal(N.value(temescal,'fee_min'),null,'conflicting hourly base cannot yield a resolved current minimum');assert.equal(temescal.mandatory_total_price,null);assert(temescal.conditional_pricing_evidence[0].rate_conflict_unresolved);
const moriarty=by('st-anne-of-the-sunset-moriarty-hall-san-francisco');assert.equal(N.value(moriarty,'music_indoor'),1320);assert.equal(N.value(moriarty,'event_end'),1380);assert.equal(N.value(moriarty,'cleanup_end'),null);assert.equal(N.value(moriarty,'fixed_mandatory'),null,'dated insurance quote is not current mandatory total');
const antiochChamber=by('antioch-chamber-of-commerce-event-space-contra-costa');assert.equal(N.value(antiochChamber,'capacity_max'),75);assert.equal(N.value(antiochChamber,'capacity_dinner_dance'),null);assert.equal(N.value(antiochChamber,'hourly_fee'),100);assert.equal(N.value(antiochChamber,'cleaning_fee'),100);assert.equal(antiochChamber.wedding_permission,null,'private gatherings are not issued wedding permission');
assert(by('piedmont-community-hall-alameda').reviewed_rate_scope.includes('NO WEDDINGS'));assert.equal(N.value(by('piedmont-community-hall-alameda'),'bar_end'),null,'permit-relative bar stop cannot become a fixed10:30PM deadline');
const idesHmb=by('half-moon-bay-ides-society-san-mateo');assert.equal(N.value(idesHmb,'fixed_mandatory'),1500);assert.equal(idesHmb.source_room_inventory.length,2);assert.equal(N.value(idesHmb,'capacity_dinner_dance'),null);assert.equal(idesHmb.mandatory_total_price,null,'room plus security subtotal excludes unknown insurance/tax');
const fern=by('fern-bar-sebastopol-sonoma');assert.equal(N.value(fern,'service_pct'),20);assert.equal(N.value(fern,'food_min'),null,'non-private group menu cannot silently price a full private buyout');assert.equal(fern.mandatory_total_price,null);
const oakClayton=by('oakhurst-country-club-clayton-contra-costa');assert.equal(N.value(oakClayton,'capacity_dinner_dance'),110);assert.equal(N.value(oakClayton,'package_min'),null,'general event price image is not a confirmed wedding package');assert.equal(N.value(oakClayton,'service_pct'),null,'included22percent must not become a second extra service charge');
const cccc=by('contra-costa-country-club-pleasant-hill-contra-costa');assert.equal(N.value(cccc,'capacity_dinner_dance'),160);assert.equal(N.value(cccc,'music_indoor'),1375);assert.equal(N.value(cccc,'bar_end'),null,'relative30minute cutoff is not fixedclock');assert.equal(N.value(cccc,'fixed_mandatory'),null,'900security only specific days/headcount');assert.equal(cccc.mandatory_total_price,null);
assert.equal(N.value(by('legends-at-diablo-creek-concord-contra-costa'),'music_indoor'),null,'golf range and restaurant hours are not wedding clocks');
console.log('Package limits, capacity conflicts, exact reviews, property identity, component costs, sunset clocks and complete founder export passed.');
