const assert=require('assert'),d=require('./research.json'),e=require('./normalized-engine.js').create(d),by=new Map(d.venues.map(v=>[v.id,v]));
const v=s=>by.get('rohnert-'+s+'-sonoma');
assert.equal(d.venues.filter(v=>v.id.startsWith('rohnert-')).length,12);
for(const s of ['multiuse','burton','senior']){assert.equal(e.value(v(s),'outside_catering'),'yes');assert.equal(e.value(v(s),'bar_end'),1320);assert.equal(v(s).midnight_indoor,null);assert(e.value(v(s),'fixed_mandatory')>0);}
for(const s of ['meeting3','garden','conference'])assert.equal(e.value(v(s),'outside_catering'),'no');
for(const s of ['goldridge','outdoor-wedding','crafts'])assert.equal(e.value(v(s),'outside_catering'),null);
assert.equal(e.value(v('garden'),'capacity_max'),null);assert.equal(e.value(v('senior'),'capacity_dinner_dance'),120);assert.equal(e.value(v('senior'),'capacity_seated'),150);assert.equal(e.value(v('burton'),'cleanup_end'),null);assert.equal(e.value(v('senior'),'cleanup_end'),null);assert.equal(e.value(v('multiuse'),'music_indoor'),null);assert.equal(e.value(v('goldridge'),'bar_end'),null);
const s=e.scenario(v('multiuse'),{guests:150,hours:6,mode:'venue_only',venueFee:1000,fixed:0,servicePct:0,taxPct:0,otherCostsConfirmed:true});assert.equal(s.components.find(c=>c.name==='Additional mandatory charges').low,315);assert.equal(s.complete,false);
console.log('Rohnert Park food eligibility, clause-scoped prohibition parsing, layout, clock conflicts and maintenance floor passed');
