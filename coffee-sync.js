/* Shared worksheet synchronization. Public answers; per-field conflict protection. */
(function(){
'use strict';
const ui=window.BayLeafCoffeeUI,model=window.BayLeafCoffee;
const endpoint=document.querySelector('meta[name="coffee-sync-api"]')?.content;
if(!ui||!endpoint)return;
ui.enableCloud();
const key='bayleaf-coffee-sync-v1',legacyKey='bayleaf-coffee-device-answers-v1';
const status=document.getElementById('saveStatus'),panel=document.getElementById('cloudPanel');
panel.hidden=false;
const conflictsNode=document.getElementById('syncConflicts'),importButton=document.getElementById('importLocal');
const clone=x=>JSON.parse(JSON.stringify(x)),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const defaults=Object.fromEntries([...model.defs].map(([id,f])=>[id,f.default??(f.type==='checkbox'?false:'')]));
let dirty={},revisions={},shared={},conflicts={},busy=false,loaded=false,timer=null,storageOk=true;
function storageRead(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
function meaningful(a){return Object.fromEntries(Object.entries(a).filter(([id,v])=>model.defs.has(id)&&v!==''&&v!==false&&!equal(v,defaults[id])))}
const previous=storageRead(key);
if(previous){for(const [id,p] of Object.entries(previous.dirty||{})){try{const cleaned=model.cleanAnswers({[id]:p.value});if(id in cleaned&&Number.isInteger(p.baseRevision)&&p.baseRevision>=0&&typeof p.mutationId==='string')dirty[id]={...p,value:cleaned[id]}}catch{}}revisions=previous.revisions||{}}
let legacy=storageRead(legacyKey)||{};
if(!previous?.initialized||location.hash.startsWith('#answers=')){const found=meaningful(ui.getAnswers());if(Object.keys(found).length){legacy={...legacy,...found};try{localStorage.setItem(legacyKey,JSON.stringify(legacy))}catch{storageOk=false}}}
function saveQueue(){try{localStorage.setItem(key,JSON.stringify({version:1,initialized:true,revisions,dirty}));}catch{storageOk=false}}
function count(){return Object.keys(dirty).length}
function message(text){status.textContent=text+(storageOk?'':' · device backup unavailable; download answers if offline.');}
function mark(){importButton.hidden=Object.keys(legacy).length===0;if(Object.keys(conflicts).length)message('Another device changed the same answer. Choose which version to keep below.');else if(count())message('Saving shared answers… '+count()+' pending');else if(loaded)message('Saved for both of you · '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));else message('Connecting to your shared worksheet…');}
function showConflicts(){conflictsNode.replaceChildren();for(const [id,remote] of Object.entries(conflicts)){const local=dirty[id];if(!local)continue;const box=document.createElement('div');box.className='sync-conflict';const title=document.createElement('strong');title.textContent=model.defs.get(id)?.label||id;box.append(title);for(const [label,value] of [['This device',local.value],['Shared answer',remote.value]]){const p=document.createElement('p');p.textContent=label+': '+String(value);box.append(p)}for(const [label,keep] of [['Keep this device’s answer',true],['Use shared answer',false]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{if(keep){dirty[id]={value:local.value,baseRevision:remote.revision,mutationId:crypto.randomUUID()}}else{delete dirty[id];}delete conflicts[id];saveQueue();paint();showConflicts();mark();flush()};box.append(b)}conflictsNode.append(box)}}
function paint(){const next={...defaults,...Object.fromEntries(Object.entries(shared).map(([id,r])=>[id,r.value])),...Object.fromEntries(Object.entries(dirty).map(([id,r])=>[id,r.value]))};ui.applyAnswers(next)}
function ingest(rows,sent={}){const nextShared={};for(const row of rows||[]){try{const value=JSON.parse(row.value),clean=model.cleanAnswers({[row.field]:value});if(!(row.field in clean)||!Number.isInteger(row.revision)||row.revision<1)continue;nextShared[row.field]={value:clean[row.field],revision:row.revision,mutationId:row.mutation_id};}catch{}}
 shared=nextShared;
 for(const [id,r] of Object.entries(shared)){const p=dirty[id];revisions[id]=r.revision;if(!p)continue;if(equal(p.value,r.value)){delete dirty[id];delete conflicts[id];}else if(sent[id]?.mutationId===r.mutationId){p.baseRevision=r.revision;delete conflicts[id];}else if(p.baseRevision!==r.revision){conflicts[id]=r;}}
 loaded=true;saveQueue();paint();showConflicts();mark();
}
async function request(method='GET',body){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(endpoint,{method,mode:'cors',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:controller.signal});if(!r.ok)throw Error('Shared save unavailable ('+r.status+')');return await r.json()}finally{clearTimeout(timeout)}}
async function flush(){if(busy)return;busy=true;try{if(!loaded)ingest((await request()).fields);const changes=Object.entries(dirty).filter(([id])=>!conflicts[id]).map(([field,p])=>({field,...clone(p)}));if(changes.length){const sent=Object.fromEntries(changes.map(c=>[c.field,c]));ingest((await request('POST',{changes})).fields,sent)}else ingest((await request()).fields);mark();}catch(e){message(count()?'Not synced yet · answers are backed up on this device. Retrying when connected.':'Could not load shared answers · reconnect to check the latest version.');}finally{busy=false;if(count()&&!Object.keys(conflicts).length&&loaded){clearTimeout(timer);timer=setTimeout(flush,3000)}}}
function change(id,value){if(!model.defs.has(id))return;try{model.cleanAnswers({[id]:value})}catch{message('Check this number before it can sync.');return}dirty[id]={value,baseRevision:dirty[id]?.baseRevision??revisions[id]??0,mutationId:crypto.randomUUID()};if(conflicts[id])conflicts[id]=shared[id];saveQueue();mark();clearTimeout(timer);timer=setTimeout(flush,500)}
document.addEventListener('coffee:answer',e=>change(e.detail.id,e.detail.value));
async function importAnswers(raw){let incoming;try{incoming=model.cleanAnswers(raw)}catch(e){message('Could not import: '+e.message);return}const entries=Object.entries(incoming);const overwrites=entries.filter(([id,v])=>shared[id]&&!equal(shared[id].value,v)).length;if(!window.confirm('Import '+entries.length+' answers into the shared worksheet? '+overwrites+' existing shared answers would be replaced.'))return;for(const [id,value] of entries)change(id,value);paint();await flush()}
window.BayLeafCoffeeCloud={importAnswers,async share(){await flush();const url=new URL(location.href);url.hash='';try{await navigator.clipboard.writeText(url.href);message(count()?'Shared link copied · some edits are still waiting to sync.':'Shared worksheet link copied · opens the same answers on every device.')}catch{window.prompt('Copy the shared worksheet link:',url.href)}}};
importButton.onclick=()=>importAnswers(legacy);document.getElementById('syncNow').onclick=flush;
window.addEventListener('online',flush);document.addEventListener('visibilitychange',()=>{if(!document.hidden)flush()});
setInterval(()=>{if(!document.hidden)flush()},4000);
mark();flush();
})();
