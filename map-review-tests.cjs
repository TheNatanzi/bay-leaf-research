const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const root=__dirname,d=JSON.parse(fs.readFileSync(path.join(root,'research.json'),'utf8')),a=JSON.parse(fs.readFileSync(path.join(root,'map-review-audit.json'),'utf8')),m=require('./quantify.js');
const points=d.venues.filter(v=>Number.isFinite(v.lat)&&Number.isFinite(v.lng));assert.equal(points.length,a.mapped_records);assert.equal(a.mapped_records,1005);assert.equal(a.unmapped_records,933);assert.equal(a.held.length,7);
const added=points.filter(v=>v.location_precision==='Approximate street-address interpolation; not a verified entrance or parcel');assert.equal(added.length,118);
for(const v of added){assert(v.location_address_sources.length);assert(v.location_source.startsWith('https://geocoding.geo.census.gov/'));assert(v.location_matched_address);assert(v.lat>36&&v.lat<40&&v.lng>-124&&v.lng<-120);}
const st=d.venues.filter(v=>v.parent_property==='The St. Regis San Francisco');assert.equal(st.length,21);
for(const v of st){const r=m.reviews(v);assert.equal(r.score,5);assert.equal(r.platforms.length,2);assert.equal(r.count,2);assert(r.platforms.every(p=>p.count===1&&p.scope.includes('not room-specific')));assert(v.review_observations.find(r=>r.provider==='WeddingWire').visible_review_date==='2008-05-21');}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('without verified coordinates'));assert(html.includes('Map precision:'));
const embedded=JSON.parse(html.match(/<script id="research-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);assert.deepStrictEqual(embedded,d);
for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(!/application\/json|src=/.test(match[1]))new vm.Script(match[2]);}
console.log('Map precision, held matches, property review scope, embedded JSON and inline syntax passed');
