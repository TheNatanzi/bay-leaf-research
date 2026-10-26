const assert=require('assert'),d=require('./research.json'),e=require('./normalized-engine.js').create(d),by=new Map(d.venues.map(v=>[v.id,v]));
const v=s=>by.get('cotati-'+s+'-sonoma');
assert.equal(d.venues.filter(v=>v.id.startsWith('cotati-raymiller-')).length,5);assert.equal(d.venues.filter(v=>v.id.startsWith('cotati-park-')).length,11);
const room=v('raymiller-event');assert.equal(e.value(room,'capacity_seated'),80);assert.equal(e.value(room,'capacity_standing'),205);assert.equal(e.value(room,'capacity_dinner_dance'),null);assert.equal(e.value(room,'outside_catering'),null);assert.equal(e.value(room,'fixed_mandatory'),167);assert.equal(e.value(room,'deposit_refundable'),500);assert(room.included_items.includes('Adjacent building restrooms'));
for(const s of ['willow','stony','copeland']){assert.equal(e.value(v('raymiller-'+s),'capacity_standing'),49);assert.equal(e.value(v('raymiller-'+s),'capacity_seated'),null);}
for(const v of d.venues.filter(v=>v.id.startsWith('cotati-park-'))){assert(v.other_requirements.includes('DOES NOT reserve'));assert.equal(e.value(v,'capacity_max'),null);assert.equal(e.value(v,'music_outdoor'),null);}
for(const id of ['cotati-veterans-memorial-building-auditorium-sonoma','cotati-veterans-memorial-building-veterans-memorial-room-meetings-only-sonoma']){assert.equal(e.value(by.get(id),'capacity_max'),null);assert.equal(e.fact(by.get(id),'capacity_max').status,'conflicting');assert(by.get(id).other_requirements.includes('2027cleaninglabel'));}
assert.equal(e.value(by.get('cotati-veterans-memorial-building-auditorium-sonoma'),'capacity_dinner_dance'),125);
console.log('Cotati: nonexclusive parks, separate occupancy layouts, shared restroom access, mandatory cleaning versus deposit, original dates and conflicting maxima passed');
