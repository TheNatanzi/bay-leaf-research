
const D=window.__D;
const $=id=>document.getElementById(id);
const S={g:300,k:0,h:6,alc:'full',day:'sat',cer:1,cake:1,pick:null,pkg:{},add:{},n:{},xb:0,xbHand:0};
const T=()=>S.g+S.k;
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const clock=x=>{x=((x%24)+24)%24;if(x===0)return 'midnight';if(x===12)return 'noon';const hh=Math.floor(x),mm=Math.round((x-hh)*60);return ((hh%12)||12)+(mm?':'+String(mm).padStart(2,'0'):'')+(hh<12?' am':' pm');};
function seg(id,key){$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{$(id).querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');S[key]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;draw();});}
seg('day','day');seg('cake','cake');
const rateOf=p=>p.base?(p.base[S.day]??null):(p.rate&&typeof p.rate==='object'?(p.rate[S.day]??null):p.rate);
const tierOf=o=>(o.tiers||[]).find(t=>(t.lo==null||S.h>=t.lo)&&(t.hi==null||S.h<=t.hi));
const rentOf=o=>{const TT=tierOf(o);if(TT)return TT.rent[S.day]??null;const R=D.seasons&&o.rent[S.season]?o.rent[S.season]:o.rent;const H=S.hiPrice&&o.rent_hi?(D.seasons&&o.rent_hi[S.season]?o.rent_hi[S.season]:o.rent_hi):null;return (H&&H[S.day]!=null?H[S.day]:R[S.day])??null;};
const avail=o=>o.rent_unknown||rentOf(o)!==null;
const money2=n=>n<20&&Math.round(n)!==n?'$'+n.toFixed(2):'$'+Math.round(n).toLocaleString('en-US');
// your price sheet (D.PS, rebuilt from our-price-sheet.json + checked online prices at every build). Pick = low end; Highest = high end.
function ownFood(){const f=D.facts.catering_food;if(f&&f.t==='own')return true;const P=(D.pkgs||{}).catering_food;return !!(P&&pk('catering_food').own_pp);}
function psCalc(spec,pre){const P=(D.PS||{})[spec.k];if(!P||P.lo==null)return {st:'own',why:(pre?pre+' · ':'')+'no price on your sheet',amt:null,miss:1,src:'ours'};
  const rate=S.hiPrice&&P.hi!=null?P.hi:P.lo,n=spec.n==='guests'?T():spec.n==='tables'?Math.ceil(T()/8):spec.n==='per'?Math.ceil(T()/spec.ratio):1,hrs=spec.per_h?S.h:1;
  const lbl=spec.n==='guests'?' guests':spec.n==='tables'?' tables (8 per table)':spec.n==='per'?' '+(spec.unit||'staff')+' (1 per '+spec.ratio+')':'';
  return {st:'own',why:(pre?pre+' · ':'')+(spec.note?spec.note+': ':'')+money2(rate)+(n>1||spec.n?' × '+n+lbl:'')+(spec.per_h?' × '+S.h+' h':'')+(P.hi!=null&&P.hi!==P.lo?' (sheet range '+money2(P.lo)+'–'+money2(P.hi)+')':''),q:P.q,amt:rate*n*hrs,src:'ours'};}
$('g').oninput=e=>{const m=D.bigmax-S.k;S.g=Math.min(+e.target.value,m);e.target.value=S.g;S.pick=null;draw()};$('k').oninput=e=>{S.k=Math.min(+e.target.value,D.bigmax-+$('g').min);e.target.value=S.k;if(S.g+S.k>D.bigmax){S.g=D.bigmax-S.k;$('g').value=S.g;}S.pick=null;draw()};$('h').oninput=e=>{S.h=+e.target.value;S.xbHand=0;draw()};
$('gn').onchange=e=>{S.g=Math.max(1,Math.round(+e.target.value||0));$('g').value=Math.min(S.g,+$('g').max);S.pick=null;draw();};
const CH={inc:['inc','Included'],venue:['venue','Venue price'],own:['own','Your price'],req:['req','Required'],unk:['unk','Unknown'],na:['na','Not needed'],apart:['apart','Paid early'],flag:['flagc','Label']};
const START=D.start||18;
// one line for one space option
function line(l,o){const x0=line0(l,o);if(x0&&!x0.src&&x0.st!=='unk'&&D.facts[l.id]){const f=D.facts[l.id];x0.src=(f&&(f.src||(f.byopt&&((f.byopt[o.id]||{}).src))))||D.src_default;}return x0;}
function line0(l,o){
  const g=D.kids?S.g:T(),end=START+S.h; let f=D.facts[l.id]; if(f&&f.byopt) f=f.byopt[o.id]||f.other||null;
  if(['ceremony_fee','flip_fee'].includes(l.id)&&!S.cer) return {st:'na',why:'Ceremony switch is off'};
  if(['wedding_cake','cake_cutting'].includes(l.id)&&!S.cake) return {st:'na',why:'Cake switch is off'};
  if(['bartenders','bar_alcohol','corkage','liquor_liability'].includes(l.id)&&S.alc==='none') return {st:'na',why:'Alcohol set to none'};
  if(S.alc==='byo'&&D.byo){const B=D.byo,dr=Math.round(g*B.drink_ratio);
    if(l.id==='bar_alcohol')return B.fee?{st:'venue',why:B.fee_name.replace(/^./,c=>c.toUpperCase())+': '+money(B.fee)+' flat',q:B.fee_q||'',amt:B.fee,src:B.cork_src,own_alc:{dr,rate:B.pp_drinker}}:{st:'na',why:'No venue bar charge (BYO)',own_alc:{dr,rate:B.pp_drinker},src:B.cork_src};
    if(l.id==='corkage'){if(B.corkage==null)return {st:'unk',why:'Corkage: not stated'};const bt=Math.ceil(dr*B.bottles_per_drinker);
      return B.corkage?{st:'venue',why:bt+' bottles × $'+B.corkage+' corkage'+(B.cork_note?' · '+B.cork_note:''),q:B.cork_q,amt:bt*B.corkage,src:B.cork_src}:{st:'inc',why:'No corkage fee',q:B.cork_q,amt:0,src:B.cork_src};}}
  if(l.id==='corkage'&&D.byo&&S.alc!=='byo'&&S.alc!=='none')return {st:'na',why:'Using the venue bar: no corkage',q:D.byo.cork_q,src:D.byo.cork_src};
  if(l.id==='venue_rent'){const r=rentOf(o),dn={sat:'Saturday',fs:'Fri / Sun',mt:'Mon–Thu'}[S.day]+(D.seasons?', '+D.seasons.find(z=>z.id===S.season).name:'');
    if(r==null)return o.rent_unknown?{st:'unk',why:'Rent not stated · ask'}:{st:'unk',why:o.name+': no price for this day',q:o.rent_q,src:o.rent_src};
    if(o.rent_unit==='hr'){const hh=Math.max(S.h+(o.rent_pad_h||0),o.rent_min_h||0);return {st:'venue',why:o.name+', '+dn+': '+money(r)+' per hour × '+hh+' h'+(o.rent_pad_h?' ('+S.h+' h event + '+o.rent_pad_h+' h '+(o.rent_pad_note||'wind-down')+')':'')+(o.rent_min_h&&S.h+(o.rent_pad_h||0)<o.rent_min_h?' (minimum '+o.rent_min_h+' h)':''),q:o.rent_q,amt:r*hh,src:o.rent_src};}
    const st=o.rent_step,ex=st&&g>st.over?Math.ceil((g-st.over)/st.per)*st.amt:0;
    return {st:'venue',why:o.name+', '+dn+(o.rent_note?' · '+o.rent_note:'')+(st?' (≤'+st.over+' guests)'+(ex?' + '+money(ex)+' ('+(g-st.over)+' over, '+money(st.amt)+' per '+st.per+')':''):''),q:o.rent_q,amt:r+ex,src:o.rent_src,credit_text:o.rent_credit_text};}
  if(l.id==='overtime'){
    if(!o.block){if(o.end==null)return {st:'unk',why:'Not stated'};
      if(START+S.h<=o.end)return {st:'na',why:'Event ends by '+clock(o.end)+', the venue end time',q:o.ot_q,src:o.ot_src};
      const oh=Math.ceil(START+S.h-o.end-1e-9);if(o.ot_hr||o.ot_half)return {st:'venue',why:oh+' h past '+clock(o.end)+' × '+(o.ot_hr?money(o.ot_hr)+' per hour':money(o.ot_half)+' per half hour'),q:o.ot_q,amt:o.ot_hr?oh*o.ot_hr:oh*2*o.ot_half,src:o.ot_src};
      return {st:'venue',why:(START+S.h-o.end)+' h past '+clock(o.end)+(o.end_max!=null?' (allowed to '+clock(o.end_max)+')':'')+' · price: ask',q:o.ot_q,amt:null,miss:1,src:o.ot_src};}
    if(S.h<=o.block) return {st:'na',why:'Fits the venue\'s '+o.block+'-hour block'+(o.block_note?' ('+o.block_note+')':''),q:o.ot_q,src:o.ot_src};
    if(o.ot_hr){const hh=Math.ceil(S.h-o.block-1e-9);return {st:'venue',why:hh+' h past the '+o.block+'-hour block × '+money(o.ot_hr)+' per hour'+(o.block_note?' ('+o.block_note+')':''),q:o.ot_q,amt:hh*o.ot_hr,src:o.ot_src};}
    if(!o.ot_half)return {st:'venue',why:(S.h-o.block)+' h past the '+o.block+'-hour block'+(o.block_note?' ('+o.block_note+')':'')+' · price: ask',q:o.ot_q,amt:null,miss:1,src:o.ot_src};
    const halves=(S.h-o.block)*2; return {st:'venue',why:(S.h-o.block)+' hour(s) past the '+o.block+'-hour block = '+halves+' × '+money(o.ot_half)+' per half hour'+(o.ot_note?'. '+o.ot_note:''),q:o.ot_q,amt:halves*o.ot_half};
  }
  if(!f) return {st:'unk',why:'Not stated'};
  switch(f.t){
    case 'inc': return {st:'inc',why:f.note||'Included',q:f.q,amt:0};
    case 'pp': {const P=(D.pkgs||{})[l.id];let rate=f.rate,nm='',q=f.q,n=g,kid='',ka=0;
      if(P){const p=pk(l.id);if(p.base){const b=rateOf(p),ex=Math.max(0,g-p.incl)*p.extra[S.day],own=(p.own_pp||0)*g;if(p.own_ps&&D.PS&&D.PS[p.own_ps]){p.own_pp=S.hiPrice&&D.PS[p.own_ps].hi!=null?D.PS[p.own_ps].hi:D.PS[p.own_ps].lo;}
          return {st:'venue',why:p.name+' (venue service, no food): '+money(b)+' base (≤'+p.incl+' guests)'+(ex?' + '+(g-p.incl)+' × '+money(p.extra[S.day]):''),q:p.q,amt:b+ex,src:p.src,svc:1,own_food:{rate:p.own_pp,g}};}
        rate=rateOf(p);nm=p.name+': ';q=p.q;if(rate==null)return {st:'unk',why:p.name+': no price for this day',q};}
      const K=D.kids&&D.kids.line===l.id?D.kids:null;
      if(K&&S.k){ka=S.k*K.rate;kid=' + '+S.k+' children × '+money(K.rate);}
      return {st:f.st||'venue',why:nm+money(rate)+' × '+n+(D.kids?' adults':' guests')+kid+(P?'':'. '+f.note),q,amt:rate*n+ka,svc:f.svc,tax:f.tax};}
    case 'bar': {const BP=(D.barpkgs||{})[S.alc],bp=BP?(BP.find(b=>b.id===S.pkg['bar_'+S.alc])||BP[0]):null;
      if(bp&&bp.cash)return {st:'venue',why:bp.name+'. Set-up fee for 2 bars; drinks are paid by guests',q:bp.q,amt:bp.setup};
      const r=bp?bp.rate:f.rates[S.alc],BH=(bp&&bp.hours)||f.hours;let a=r*g,why=(bp?bp.name:f.names[S.alc])+': '+money(r)+' × '+g+' guests, '+BH+' h'+(bp&&bp.rate_note?' ('+bp.rate_note+')':''),miss=0;
      if(bp&&bp.q)f=Object.assign({},f,{q:bp.q});
      const XB=xbNow();if(XB&&(bp?bp.extra:(f.extra||{})[S.alc]))why+=' · +'+XB+' extra h (next line)';
      if(S.h>BH+XB)why+=' · bar '+(BH+XB)+' of '+S.h+' h'+(XB?' (venue limit)':': add extra hours under Bar package');
      if(f.min&&g<f.min) why+='. Needs at least '+f.min+' guests';
      if(S.k) why+='. Counted for adults only; whether children are charged: ask';
      return {st:'venue',why,q:f.q,amt:a,svc:1,tax:1,miss};}
    case 'pct': return {st:'venue',pct:f.pct,on:f.on,why:f.note,q:f.q};
    case 'min': return {st:'venue',min:f,q:f.q};
    case 'ocf': return ownFood()?{st:'venue',why:'Outside-caterer fee: '+money(f.rate)+' × '+g+' guests',q:f.q,amt:f.rate*g,src:f.src}:{st:'na',why:'Only when you bring your own caterer',q:f.q};
    case 'apart': return {st:'apart',why:f.note,q:f.q,amt:f.amt,apart:1};
    case 'flag': return {st:'flag',why:f.note,q:f.q};
    case 'req': return f.ps?Object.assign(psCalc(f.ps,f.note),{req:1}):{st:'req',why:f.note+' · price unknown',q:f.q,amt:null,miss:1};
    case 'ps': if(f.only_own&&!ownFood())return {st:'unk',why:f.off||'Not stated'};if(l.id==='catering_dessert'&&S.cake)return {st:'na',why:'Off while the cake switch is on (cake is the dessert)'};return psCalc(f.ps||f,f.pre);
    case 'inc_own': return ownFood()?{st:'inc',why:f.note,q:f.q,amt:0}:{st:'unk',why:'Not stated'};
    case 'byo_ps': return S.alc==='byo'?psCalc(f.ps,f.pre||'Your bartenders (BYO)'):{st:'unk',why:f.off||'Not stated'};
    case 'na': return {st:'na',why:f.note,q:f.q};
    case 'own': {const r=f.ps&&D.PS&&D.PS[f.ps]?(S.hiPrice&&D.PS[f.ps].hi!=null?D.PS[f.ps].hi:D.PS[f.ps].lo):f.rate;return {st:'own',why:f.note+': '+money(r)+' × '+g+' guests',q:f.q||(f.ps&&D.PS&&D.PS[f.ps]?D.PS[f.ps].q:''),amt:r*g,src:f.src||'ours'};}
    case 'req_over': return g<=f.over?{st:'na',why:'Only required over '+f.over+' guests',q:f.q}:f.ps?Object.assign(psCalc(f.ps,f.note),{req:1}):{st:'req',why:f.note+' · price unknown',q:f.q,amt:null,miss:1};
    case 'credit': return {st:'inc',why:f.note,q:f.q,amt:0,credit:f.amt,credit_text:f.credit_text};
    case 'fixed': return {st:'venue',why:f.note,q:f.q,amt:f.amt,svc:f.svc};
    case 'hourly': return {st:'venue',why:(f.note?f.note+': ':'')+money(f.rate)+' × '+S.h+' h',q:f.q,amt:f.rate*S.h,svc:f.svc};
    case 'perguest': return {st:'venue',why:(f.note?f.note+': ':'')+money2(f.rate)+' × '+T()+' guests',q:f.q,amt:f.rate*T(),svc:f.svc};
    case 'base': {const ex=Math.max(0,T()-f.incl)*f.per;return {st:'venue',why:money(f.amt)+' (≤'+f.incl+' guests)'+(ex?' + '+(T()-f.incl)+' × '+money(f.per)+' = '+money(f.amt+ex):'')+(f.note?' · '+f.note:''),q:f.q,amt:f.amt+ex,svc:f.svc};}
    case 'tier': {const t=f.tiers.find(z=>T()<=z.max);if(!t)return {st:'req',why:f.note+' · over '+f.tiers[f.tiers.length-1].max+' guests: price unknown',q:f.q,amt:null,miss:1};
      return t.amt==null?{st:'req',why:f.note+' · '+t.label+': price unknown',q:f.q,amt:null,miss:1}:{st:t.inc?'inc':'venue',why:f.note+' · '+t.label,q:f.q,amt:t.amt};}
    case 'req_if': {const on=(f.alc&&S.alc!=='none')||(f.over&&T()>f.over);return on?(f.ps?Object.assign(psCalc(f.ps,f.note),{req:1}):{st:'req',why:f.note+' · price unknown',q:f.q,amt:null,miss:1}):{st:'na',why:'Not needed: '+f.off_note,q:f.q};}
  }
  return {st:'unk',why:'Not stated'};
}
function barX(){if(S.alc==='none'||S.alc==='byo')return null;const BP=(D.barpkgs||{})[S.alc],bp=BP?(BP.find(b=>b.id===S.pkg['bar_'+S.alc])||BP[0]):null;let f=D.facts.bar_alcohol;if(f&&f.byopt)f=null;
  if(!bp&&!(f&&f.t==='bar'))return null;if(bp&&bp.cash)return {off:1};
  const x=bp?bp.extra:(f.extra||{})[S.alc];return x?{x,name:bp?bp.name:(f.names||{})[S.alc]||'',q:bp?(bp.xq||bp.q):(f.xq||{})[S.alc]||f.q,hours:(bp&&bp.hours)||(f?f.hours:null)}:{off:1};}
function barMax(){if(D.bar_xmax!=null)return {n:D.bar_xmax,why:'venue limit'+(D.bar_xmax_q?' ("'+D.bar_xmax_q+'")':'')};
  const b=barX(),e=D.options.map(o=>o.end_max);
  if(b&&b.hours&&e.length&&e.every(v=>v!=null))return {n:Math.max(0,Math.floor(Math.max(...e)-START-b.hours)),why:'stops at the venue latest end time'};
  return {n:3,why:'venue limit unknown'};}
function xbAuto(){const b=barX();if(!b||b.off||!b.hours)return 0;return Math.max(0,Math.min(barMax().n,Math.ceil(S.h-b.hours-1e-9)));}
function xbNow(){const b=barX();if(!b||b.off)return 0;return S.xbHand?Math.min(S.xb,barMax().n):xbAuto();}
function cost(o){
  const rows=D.lines.map(l=>({l,x:line(l,o)}));
  // your own caterer / your own alcohol: separate lines priced from your price sheet (never under the venue's service fee)
  for(let i=rows.length-1;i>=0;i--){const {l,x}=rows[i];
    if(x.own_food){const F=x.own_food;rows.splice(i+1,0,{l:{id:'own-caterer',name:'Outside caterer (your price sheet)',group:l.group,unit:'per guest'},
      x:F.rate==null?{st:'own',why:'No caterer price on your sheet',amt:null,miss:1,src:'ours'}:{st:'own',why:money(F.rate)+' × '+F.g+' guests (your caterer)',q:D.own_food_q||'',amt:F.rate*F.g,src:'ours'}});}
    if(x.own_alc){const A=x.own_alc;rows.splice(i+1,0,{l:{id:'own-alcohol',name:'Your own alcohol (price sheet)',group:l.group,unit:'per drinker'},
      x:A.rate==null?{st:'own',why:'No alcohol price on your sheet',amt:null,miss:1,src:'ours'}:{st:'own',why:(D.byo.what||'Your alcohol')+': $'+A.rate.toFixed(2)+' × '+A.dr+' drinkers ('+Math.round(D.byo.drink_ratio*100)+'% of guests)',q:D.byo.list_q,amt:A.rate*A.dr,src:'ours'}});}}
  (D.addons||[]).filter(a=>S.add[a.id]&&!a.kids).forEach(a=>{if(a.unit==='unknown'){rows.push({l:{id:'add-'+a.id,name:a.name,group:'Add-ons you ticked',unit:'unit not stated'},x:{st:'req',why:money(a.rate)+', but the packet does not say per guest or per display. Not counted: ask',q:a.q,amt:null,miss:1}});return;}const amt=a.unit==='pp'?a.rate*T():a.amt;
    rows.push({l:{id:'add-'+a.id,name:a.name,group:'Add-ons you ticked',unit:a.unit==='pp'?'per guest':'per event'},
      x:{st:'venue',why:(a.unit==='pp'?money(a.rate)+' × '+T()+' guests':'Flat')+(a.note?'. '+a.note:''),q:a.q,amt,svc:a.svc,tax:a.tax}});});
  {const b=barX(),XB=xbNow();if(b&&!b.off&&XB){const amt=XB*b.x*S.g;
    const bi=rows.findIndex(r=>r.l.id==='bar_alcohol');rows.splice(bi<0?rows.length:bi+1,0,{l:{id:'xbar',name:'Extra bar hours',group:bi<0?'Bar':rows[bi].l.group,unit:'per guest per hour'},x:{st:'venue',why:XB+' extra hour'+(XB>1?'s':'')+' × $'+b.x.toFixed(2)+' × '+S.g+' guests = '+money(amt)+' ('+b.name+')'+(S.k?'. Counted for adults only':''),q:b.q,amt,svc:1,tax:1}});}}
  rows.forEach(({l,x})=>{if((D.out_scope||['valet','planner']).includes(l.id)&&!['req','na','inc'].includes(x.st)&&!x.req)x.out=1;});
  if(D.svc_all)rows.forEach(({x})=>{if(x.st==='venue'&&x.amt&&!x.apart&&!x.out&&x.pct===undefined&&!x.min)x.svc=1;});
  let base=0,svcBase=0,taxBase=0,rentBase=0;
  rows.forEach(({l,x})=>{if(x.amt&&Number.isFinite(x.amt)&&!x.apart&&!x.out&&x.pct===undefined){base+=x.amt;if(x.svc)svcBase+=(x.svc_amt??x.amt);if(x.tax)taxBase+=(x.svc_amt??x.amt);if(['venue_rent','overtime'].includes(l.id))rentBase+=x.amt;}});
  rows.forEach(({x})=>{
    if(x.pct!==undefined){const b=x.on==='rent'?rentBase:x.on==='all'?base:x.on==='tax'?taxBase:svcBase;x.amt=b*x.pct/100;x.why=x.pct+'% of '+money(b)+' ('+x.why+')';}
  });
  // service charge is taxed? not stated -> tax on packages only
  const FNB=['catering_food','catering_dessert','bar_alcohol','xbar','cake_cutting'];let fnbBase=0;rows.forEach(({l,x})=>{if(x.amt&&!x.apart&&!x.out&&x.st==='venue'&&(FNB.includes(l.id)||l.id.startsWith('add-')))fnbBase+=x.amt;});
  const noMin=Object.keys(D.pkgs||{}).some(id=>pk(id).no_min);
  rows.forEach(({x})=>{if(x.min){let f=x.min;const fb=fnbBase;
    if(f.byday){const v=f.byday[S.day];f=Object.assign({},f,{lo:v,hi:v,days:v==null?[]:[S.day],days_text:'on other days'});}
    if(noMin){x.st='na';x.why='No minimum with the chosen package';x.amt=0;return;}
    if(ownFood()&&!D.min_own_applies){x.amt=0;x.miss=1;x.why='With your own caterer: the venue has not said if its '+money(f.lo)+(f.hi!==f.lo?'–'+money(f.hi):'')+' minimum still applies · ask';return;}
    if(ownFood())x.q=D.min_own_q||x.q;
    const dayOk=f.days.includes(S.day);
    if(!dayOk){x.st='na';x.why=f.byday?'No minimum stated for this day':'Minimum applies '+f.days_text+' only';x.amt=0;}
    else if(fb>=f.hi){x.amt=0;x.why='F&B '+money(fb)+' ≥ '+money(f.lo)+(f.hi!==f.lo?'–'+money(f.hi):'')+' minimum: $0 extra';}
    else {x.amt=Math.max(0,f.hi-fb);x.why='F&B '+money(fb)+' < '+(f.hi!==f.lo?'top of '+money(f.lo)+'–':'')+money(f.hi)+' minimum: '+(f.hi!==f.lo?'up to ':'')+money(x.amt)+' extra';}}});
  if(D.min_plusplus!==false){const sh=rows.reduce((z,{x})=>z+(x.min&&x.amt?x.amt:0),0);if(sh)rows.forEach(({x})=>{if(x.pct!==undefined&&['svc','tax','all'].includes(x.on)){x.amt+=sh*x.pct/100;x.why+=' + '+x.pct+'% of the '+money(sh)+' minimum top-up';}});}
  rows.forEach(({x})=>{if(x.amt!=null&&!Number.isFinite(x.amt)){x.amt=null;x.miss=1;x.why=(x.why||'')+' · price: ask';}});
  let tot=0,unk=0,rq=[],dep=null;
  let known=0,all=0,cred=0;
  rows.forEach(({l,x})=>{if(x.credit)cred+=x.credit;if(x.out)return;if(!['na','flag'].includes(x.st)){all++;if(x.amt!=null)known++;}if(x.st==='unk')unk++;if(x.miss)rq.push(l.name);if(x.amt&&!x.apart)tot+=x.amt;if(x.apart)dep=x;});
  return {rows,tot,unk,rq,dep,known,all,cred};
}
function priceAt(g,h){const og=S.g,oh=S.h;S.g=g;S.h=h;
  const R=D.options.filter(o=>g+S.k<=o.max&&avail(o)).map(o=>({o,c:cost(o)})).sort((a,b)=>a.c.tot-b.c.tot);
  let r=R.find(x=>x.o.id===S.pick)||R[0];S.g=og;S.h=oh;return r?{pp:r.c.tot/(g+S.k),sp:r.o.name}:null;}
function strip(id,el,key,fmt){const sl=$(el),mn=+sl.min,mx=+sl.max,st=+sl.step,vals=[];for(let v=mn;v<=mx+1e-9;v+=st)vals.push(+v.toFixed(2));if(!vals.length)vals.push(mn);
  const P=vals.map(v=>key==='g'?priceAt(v,S.h):priceAt(S.g,v)),ok=P.filter(Boolean).map(p=>p.pp),hi=Math.max(...ok),lo=Math.min(...ok);
  $(id+'s').innerHTML=vals.map((v,i)=>{const p=P[i];return '<i data-v="'+v+'" class="'+(p?'':'x')+(v===S[key]?' on':'')+'" style="height:'+(p?(hi===lo?50:15+85*(p.pp-lo)/(hi-lo)):100)+'%" title="'+fmt(v)+': '+(p?money(p.pp)+' per guest, '+p.sp:'no space fits')+'"></i>';}).join('');
  $(id+'s').querySelectorAll('i').forEach(b=>b.onclick=()=>{S[key]=+b.dataset.v;if(key==='h')S.xbHand=0;if(key==='g')S.g=Math.min(S.g,D.bigmax-S.k);sl.value=S[key];if(key==='g')S.pick=null;draw();});
  const a=P[0],z=P[P.length-1];$(id+'x').innerHTML='<span>'+fmt(vals[0])+(a?' · '+money(a.pp):'')+'</span><span>'+(lo===hi?'same price at every '+(key==='g'?'size':'length'):'')+'</span><span>'+fmt(vals[vals.length-1])+(z?' · '+money(z.pp):'')+'</span>';}
function barList(){const BA=[{id:'none',alc:'none',name:'No bar',rate:0}].concat(...Object.entries(D.barpkgs||{}).map(([k,v])=>v.map(x=>Object.assign({alc:k},x))));
  if(D.byo&&D.byo.allowed)BA.push({id:'byo',alc:'byo',byo:1,name:D.byo.name,rate:0,show:D.byo.show});
  if(!D.no_alcohol&&!Object.keys(D.barpkgs||{}).length&&!(D.byo&&D.byo.allowed==='all'&&D.byo.default!==false))BA.push({id:'venue',alc:'venue',name:'Venue bar (prices not collected yet)',rate:0,show:'Bar packages not collected yet: ask the venue'});
  return BA.sort((a,b)=>(a.rate||0)-(b.rate||0));}
// Lowest / Highest: cheapest or priciest choice in every dropdown (space, menu, bar), add-ons off
function scen(hi){const keep={pkg:Object.assign({},S.pkg),alc:S.alc,add:S.add,xbHand:S.xbHand,xb:S.xb};
  const pk0={};Object.entries(D.pkgs||{}).forEach(([id,P])=>{const eff=p=>p.base?(rateOf(p)+Math.max(0,T()-p.incl)*p.extra[S.day]+(p.own_pp||0)*T())/T():(rateOf(p)||0);const P2=P.filter(p=>!p.unconfirmed),s=[...(P2.length?P2:P)].sort((a,b)=>eff(a)-eff(b));pk0[id]=(hi?s[s.length-1]:s[0]).id;});
  let bars=barList().filter(b=>b.id!=='none');if(!bars.length)bars=[{id:keep.alc,alc:keep.alc}];
  let opts=D.options.filter(o=>T()<=o.max&&avail(o));if(!opts.length)opts=[D.options.reduce((a,o)=>o.max>a.max?o:a)];
  let best=null;S.add={};S.xbHand=0;S.hiPrice=!!hi;
  opts.forEach(o=>bars.forEach(b=>{S.pkg=Object.assign({},keep.pkg,pk0);S.alc=b.alc;if(!['none','byo','venue'].includes(b.alc))S.pkg['bar_'+b.alc]=b.id;
    const r=cost(o);if(!best||(hi?r.tot>best.c.tot:r.tot<best.c.tot))best={o,b,c:r};}));
  S.hiPrice=false;Object.assign(S,keep);const m={};best.c.rows.forEach(({l,x})=>m[l.id]=x);return {m,c:best.c,o:best.o,b:best.b};}
function pk(id){const P=D.pkgs[id];return P.find(x=>x.id===S.pkg[id])||P[0];}
function pkLabel(x){if(x.own_pp!=null||x.own_ps){const P=x.own_ps&&D.PS&&D.PS[x.own_ps],r=P&&P.lo!=null?P.lo:x.own_pp,fe=(D.facts.outside_cater_fee||{}).rate;
    return r!=null?money(r)+' per guest (your price sheet)'+(fe?' + '+money(fe)+' venue fee':''):'price: ask';}
  if(x.base){const b=rateOf(x);return b==null?'price: ask':money(b)+' base ≤'+x.incl+' + '+money(x.extra[S.day])+'/extra guest';}
  const r=rateOf(x);return r==null?'price: ask':money(r)+' per adult';}
function renderPk(){let h='';
  Object.entries(D.pkgs||{}).forEach(([id,P])=>{const p=pk(id);
    h+='<div class="row"><b>'+(D.lines.find(l=>l.id===id)||{name:id}).name+'</b><div><select data-pk="'+id+'">'+P.map(x=>'<option value="'+x.id+'"'+(x.id===p.id?' selected':'')+'>'+x.name+' — '+pkLabel(x)+'</option>').join('')+'</select>'+
      '<div class="pd">'+(p.show||p.desc||'')+sup(p.src||D.src_default)+'</div>'+(D.pkg_common_show&&D.pkg_common_show[id]?'<div class="pd"><b>All packages include:</b> '+D.pkg_common_show[id]+sup(D.src_default)+'</div>':'')+(p.note?'<div class="pd">'+p.note+'</div>':'')+'</div></div>';});
  const BA=barList();
  if(BA.length>1){const cur=S.alc==='none'?'none':S.alc==='byo'?'byo':S.alc==='venue'?'venue':(S.pkg['bar_'+S.alc]||D.barpkgs[S.alc][0].id),b=BA.find(x=>x.id===cur)||BA[0];
    h+='<div class="row"><b>Bar package</b><div><select data-bar="1">'+BA.map(x=>'<option value="'+x.id+'"'+(x.id===b.id?' selected':'')+'>'+x.name+(x.byo?' — '+D.byo.short:x.cash?' — '+money(x.setup)+' set-up, guests pay':x.rate?' — '+money(x.rate)+' per guest':'')+'</option>').join('')+'</select>'+'<div class="pd">'+(b.show||b.desc||'')+(b.id==='none'?'':sup(b.byo?(D.byo.cork_src||D.src_default):D.src_default))+'</div>'+'%%XB%%</div></div>';}
  let xr='';{const b=barX();if(b){if(b.off)xr='<div class="ad"><span><b>Extra bar hours</b> · <span class="dash">—</span> not offered with this bar package</span></div>';
    else{const m=barMax(),X=xbNow(),need=b.hours?Math.max(0,Math.ceil(S.h-b.hours-1e-9)):0;
      const note=S.xbHand?'set by hand · resets when hours or package change':(b.hours?'auto: '+S.h+' h event − '+b.hours+' h in package'+(need>m.n?', capped at '+m.n:''):'');
      xr='<div class="ad"><span class="step"><button data-xb="-1"'+(X<=0?' disabled':'')+'>−</button><b>'+X+'</b><button data-xb="1"'+(X>=m.n?' disabled':'')+'>+</button></span><span><b>Extra bar hours</b> · $'+b.x.toFixed(2)+'/guest/h'+(X?' · <b>'+X+' × $'+b.x.toFixed(2)+' × '+S.g+' = '+money(X*b.x*S.g)+'</b>':'')+'<span class="pd"> · max '+m.n+' ('+m.why+')</span>'+(note?'<div class="pd">'+note+'</div>':'')+'</span></div>';}}}
  h=h.replace('%%XB%%',xr?'<div class="xbar" style="margin-top:.5rem;padding-top:.5rem;border-top:1px dashed #b8c0cc">'+xr+'</div>':'');
  if((D.addons||[]).length){h+='<div class="row"><b>Add-ons</b><div>'+(D.addons||[]).map(a=>'<label class="ad"><input type="checkbox" data-ad="'+a.id+'"'+(S.add[a.id]?' checked':'')+'><span><b>'+a.name+'</b> · '+(a.unit==='unknown'?money(a.rate)+' (unit not stated)':a.unit==='pp'||a.kids?money(a.rate)+(a.kids?' each':' per guest'):money(a.amt))+
    (a.kids&&S.add[a.id]?' · how many <input type="number" min="0" max="'+S.g+'" value="'+(S.n[a.id]||0)+'" data-n="'+a.id+'">':'')+(a.note?'<span class="pd"> · '+a.note+'</span>':'')+'</span></label>').join('')+'</div></div>';}
  if(h&&D.pkg_src)h+='<div class="q">Source: '+D.pkg_src+'.</div>';
  if(!h)h='<div class="none">No packages or add-ons listed by this venue yet. The first email asks for them.</div>';
  $('pk').innerHTML=h;
  $('pk').querySelectorAll('select[data-pk]').forEach(e=>e.onchange=()=>{S.pkg[e.dataset.pk]=e.value;draw();});
  $('pk').querySelectorAll('select[data-bar]').forEach(e=>e.onchange=()=>{const x=BA.find(y=>y.id===e.value);S.alc=x.alc;if(!['none','byo','venue'].includes(x.alc))S.pkg['bar_'+x.alc]=x.id;S.xbHand=0;draw();});
  $('pk').querySelectorAll('[data-ad]').forEach(e=>e.onchange=()=>{S.add[e.dataset.ad]=e.checked;const a=D.addons.find(x=>x.id===e.dataset.ad);if(a.kids&&e.checked&&!S.n[a.id])S.n[a.id]=a.default_n||20;draw();});
  $('pk').querySelectorAll('[data-xb]').forEach(e=>e.onclick=()=>{S.xb=Math.max(0,Math.min(barMax().n,xbNow()+ +e.dataset.xb));S.xbHand=1;draw();});
  $('pk').querySelectorAll('[data-n]').forEach(e=>e.onchange=()=>{S.n[e.dataset.n]=Math.max(0,Math.min(S.g,+e.value||0));draw();});}
function draw(){renderPk();
  if(document.activeElement!==$('gn'))$('gn').value=S.g;$('kidbox').style.display='';$('kv').textContent=S.k;$('kl').textContent=D.kids?money(D.kids.rate)+' each: '+D.kids.menu:'no child price: counted as adults · ask';$('gl').textContent=D.lockG+(S.k?' (adults + children)':'');$('gl').className='lock'+(T()>=D.bigmax?' on':'');$('hl').textContent=D.lockH;$('hl').className='lock'+(D.lockH.startsWith('🔒')&&S.h>=+$('h').max?' on':'');$('hv').textContent=S.h+' h · ends '+clock(START+S.h);
  strip('g','g','g',v=>v+' guests');strip('h','h','h',v=>v+' h');
  const R=D.options.map(o=>({o,fits:T()<=o.max&&avail(o),c:cost(o)}));
  const fit=R.filter(r=>r.fits).sort((a,b)=>a.c.tot-b.c.tot);
  const auto=fit[0]?fit[0].o.id:null;
  let cur=R.find(r=>r.o.id===(S.pick||auto));
  if(cur&&!cur.fits){S.pick=null;cur=R.find(r=>r.o.id===auto);}
  // option cards
  $('opts').innerHTML=R.map(r=>{const o=r.o,end=START+S.h;let tags='';
    if(!avail(o)) tags+='<span class="tag red">Not offered this day</span>';else if(!r.fits) tags+='<span class="tag red">Too small: max '+o.max+'</span>';
    else tags+='<span class="tag">Fits '+o.max+'</span>';
    if(r.fits&&r.o.id===auto) tags+='<span class="tag">Cheapest that fits</span>';
    tags+= o.end!=null?'<span class="tag '+(o.end_max!=null&&end>o.end_max?'red':'grey')+'">Rent covers to '+clock(o.end)+(o.end_max!=null&&o.end_max>o.end?' (paid to '+clock(o.end_max)+')':o.end_max==null?' · latest end: ask':'')+'</span>':'<span class="tag grey">End time: ask</span>';
    tags+= o.music!=null?'<span class="tag '+(end>o.music?'yel':'grey')+'">Music stops '+clock(o.music)+(end>o.music?': last '+(end-o.music)+' h quiet':'')+'</span>':'<span class="tag grey">Music cutoff: ask</span>';
    {const pc=((D.space_photos||{})[o.photo_key||o.name.replace(/ \(hourly\)$/,'')]||{}).photos;if(pc&&pc.length)tags+='<span class="tag grey">📷 '+pc.length+'</span>';}
    if(o.season) tags+='<span class="tag grey">'+o.season+'</span>';
    return '<div class="opt'+(cur&&cur.o.id===o.id?' on':'')+(r.fits?'':' off')+'" data-id="'+o.id+'"><span class="dot"></span><span class="nm">'+o.name+'</span><span class="pp">'+(r.fits?money(r.c.tot/T())+'<span class="small" style="font-size:14px;font-weight:400"> /guest</span>':'—')+'</span><div class="meta">'+tags+'</div></div>';}).join('');
  $('opts').querySelectorAll('.opt').forEach(el=>el.onclick=()=>{const r=R.find(r=>r.o.id===el.dataset.id);if(r.fits){S.pick=el.dataset.id;draw();}});
  const t=$('t'); t.querySelectorAll('tr:not(:first-child)').forEach(r=>r.remove());
  let f='';
  if(!cur){const big=R.reduce((a,r)=>r.o.max>a.o.max?r:a);cur=big;f+='<div class="flag red">Over capacity: '+T()+' guests; largest space ('+big.o.name+') holds '+big.o.max+'. Figures use it anyway; hidden from the list at this size.</div>';}
  const c=cur.c,o=cur.o,end=START+S.h;showPics(o);
  if(o.end_max!=null&&end>o.end_max) f+='<div class="flag red">'+o.name+' must end by '+clock(o.end_max)+': a '+S.h+'-hour event from '+clock(START)+' is not possible here.</div>';
  (D.flags||[]).forEach(x=>f+='<div class="flag">'+x+'</div>');
  if(!D.kids&&S.k)f+='<div class="flag">Child price not stated: '+S.k+' children counted at the adult price. Ask the venue.</div>';
  (D.conflicts||[]).forEach(x=>f+='<div class="flag dis">Sources disagree: '+x.text+' '+(x.srcs||[]).map(sup).join('')+'</div>');
  $('flags').innerHTML=f;
  // purple = the figure moves when guests or hours move
  const mv=(dg,dh)=>{const og=S.g,oh=S.h;S.g+=dg;S.h+=dh;const r=cost(o);S.g=og;S.h=oh;const m={};r.rows.forEach(({l,x})=>m[l.id]=x.amt);return m;};
  const MG=mv(10,0),MH=mv(0,.5),LO=scen(0),HI=scen(1);
  const fig=(x,mv)=>{if(!x)return '<span class="dash">—</span>';if(x.out)return '<span class="dash">—</span>';if(x.amt==null)return x.st==='na'?'$0':'<span class="dash">—</span>';return '<span class="'+(mv?'var':'')+'">'+money(x.amt)+'</span>';};
  const VAR=(l,x)=>x.amt!=null&&(MG[l.id]!==x.amt||MH[l.id]!==x.amt);
  const U=uni(c,LO,HI);summary(c,LO,HI,VAR,U);srcList(c);
  let grp=null;
  grouped(U).flatMap(([g,L])=>L).forEach(({l,x})=>{
    if(grpOf(l)!==grp){grp=grpOf(l);const r=t.insertRow();r.className='g';const cc=r.insertCell();cc.colSpan=7;cc.textContent=grp;}
    const r=t.insertRow(); if(x.st==='na')r.className='dim';
    const v=VAR(l,x);
    r.insertCell().innerHTML='<b>'+l.name+'</b><div class="q">'+l.unit+'</div><span class="chip '+CH[x.st][0]+'">'+CH[x.st][1]+'</span>';
    const w=r.insertCell();w.className='why';w.innerHTML=(x.why||'')+(x.src?sup(x.src):'')+'';
    [LO.m[l.id],HI.m[l.id]].forEach(y=>{const cc=r.insertCell();cc.className='n';cc.innerHTML=l.id.startsWith('add-')?'<span class="dash">—</span>':fig(y,v);});
    const pc=r.insertCell();pc.className='n pick';pc.innerHTML=fig(x,v)+(x.apart?'<div class="q">paid early, not in total</div>':'');
    const cr=r.insertCell();cr.className='n';cr.innerHTML=x.credit?'<span class="cred">'+money(x.credit)+'</span>':x.credit_text?'<span class="cred">'+x.credit_text+'</span>':'';
    const oc=r.insertCell();oc.className='n out';oc.innerHTML=x.out?(x.amt!=null?'<span class="'+(v?'var':'')+'">'+money(x.amt)+'</span>':CH[x.st][1]):'';
  });
  const pl=(z)=>money(z.tot)+(z.unk||z.rq.length?'+':'');
  const tr=t.insertRow();tr.className='tot';tr.insertCell().innerHTML='<b>Total</b><div class="q">per guest below</div>';const tw=tr.insertCell();tw.className='why';
  tw.innerHTML='Lowest: '+LO.o.name+(LO.b&&LO.b.name?', '+LO.b.name:'')+' · Highest: '+HI.o.name+(HI.b&&HI.b.name?', '+HI.b.name:'');
  [LO.c,HI.c,c].forEach((z,i)=>{const cc=tr.insertCell();cc.className='n'+(i===2?' pick':'');cc.innerHTML=pl(z)+'<div class="q">'+money(z.tot/T())+(z.unk||z.rq.length?'+':'')+' / guest</div>';});
  const tc=tr.insertCell();tc.className='n';tc.innerHTML=c.cred?'<span class="cred">'+money(c.cred)+'</span>':'<span class="dash">—</span>';tr.insertCell();
  $('pp').textContent=money(c.tot/T())+(c.unk||c.rq.length?'+':''); $('tot').textContent=pl(c)+' total for '+T()+' guests in '+o.name+(c.cred?' · credits '+money(c.cred)+' not subtracted':'');
  $('unk').textContent=c.known+'/'+c.all;$('unkl').textContent=c.unk+' unknown → form questions'; $('rq').textContent=c.rq.length; $('rql').textContent=c.rq.join(', ')||'none';
  if(c.dep){$('dep').textContent=money(c.dep.amt);$('depl').textContent=c.dep.why;}else{$('dep').textContent='—';$('depl').textContent='not stated';}
}
{const big=D.options.reduce((a,o)=>o.max>a.max?o:a);D.bigmax=big.max;$('g').max=big.max;if(big.max<=60){$('g').min=5;$('g').step=5;}else if(big.max<100){$('g').min=10;}S.g=Math.min(D.start_g||300,big.max);$('g').value=S.g;
 D.lockG='🔒 Max '+big.max+': size of '+big.name.replace(/ \(.*\)/,'');
 const ends=D.options.map(o=>o.end_max);
 if(ends.every(e=>e!=null)){const e=Math.max(...ends);$('h').max=e-START;D.lockH='🔒 Ends by '+clock(e)+': venue rule';}
 else {$('h').max=24-START;D.lockH='Stops at midnight: latest end not stated, ask';}
 const blk=D.options.map(o=>o.block).filter(b=>b!=null);
 if(blk.length){D.min_h=Math.max(...blk);D.lockH=D.min_h+' h in rent'+(D.lockH.startsWith('🔒')?' · '+D.lockH:' · midnight max, latest end: ask');}
 const priced=D.options.some(o=>o.ot_half||o.ot_hr||o.rent_unit==='hr')||D.lines.some(l=>{const f=D.facts[l.id];return f&&f.extra&&Object.values(f.extra).some(v=>v);});
 if(!priced)D.hours_fixed=D.hours_fixed||('Flat fee'+(blk.length?' for '+Math.max(...blk)+' hours':'')+'. No extra-hour price listed: ask.');
 if(D.min_h&&!D.no_min_h){$('h').min=Math.min(D.min_h,+$('h').max);S.h=Math.min(Math.max(S.h,+$('h').min),+$('h').max);$('h').value=S.h;}}

// photos follow the picked space (links only, never copies)
function showPics(o){const key=o?o.name:'';if(showPics.k===key)return;showPics.k=key;
  const sp=o&&(D.space_photos||{})[o.photo_key||o.name.replace(/ \(hourly\)$/,'')],own=sp&&sp.photos&&sp.photos.length,G=D.gallery||{},gal=(G.photos||[]).length,home=D.photos&&D.photos.length>1?D.photos[0]:(gal?((G.pages||[])[0]||G.photos[0].found_on||G.photos[0].url):null);
  const list=own?sp.photos.map(p=>({u:p.url,t:p.label||o.name,h:sp.page_url||p.found_on||p.url})):(D.photos&&D.photos.length>1?D.photos.slice(1).map(u=>({u,t:'',h:home})):G.photos?G.photos.map(p=>({u:p.url,t:p.label||'',h:p.found_on||home})):[]);
  $('pics').innerHTML=list.map(p=>'<a href="'+p.h+'" target="_blank" title="'+String(p.t).replace(/"/g,'')+'"><img loading="lazy" src="'+p.u+'" alt="" onerror="this.parentNode.remove()"></a>').join('');
  let c='';if(own)c='<b>'+o.name+'</b>';else if(home)c='Venue photos';
  if(sp&&sp.page_url)c+=(c?' · ':'')+'<a href="'+sp.page_url+'" target="_blank">See '+o.name+' photos</a>';
  if(sp&&!own)c+=(c?' · ':'')+'No photos of this space found; see link';
  if(!own&&home)c+=' · <a href="'+home+'" target="_blank">'+home.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'').slice(0,40)+'</a>';
  $('picsrc').innerHTML=c;}

if(D.cake_fixed){$('cakebox').innerHTML='<label>Wedding cake</label><div class="hfix" style="display:block">'+D.cake_fixed+'</div>';S.cake=1;}
if(D.seasons){$('seasonbox').style.display='';$('season').innerHTML=D.seasons.map((z,i)=>'<button data-v="'+z.id+'"'+(i===(D.season_default||0)?' class="on"':'')+'>'+z.name+'</button>').join('');S.season=D.seasons[D.season_default||0].id;seg('season','season');if(D.season_note){$('seasonn').style.display='block';$('seasonn').innerHTML=D.season_note;}}
if(D.day_note){$('dayn').style.display='block';$('dayn').innerHTML=D.day_note;}
if(D.cer_note)$('cern').innerHTML=D.cer_note;S.cer=1;
function fixHours(t){['h','hs','hx','hl'].forEach(i=>$(i).style.display='none');$('hfix').style.display='block';$('hfix').innerHTML=t;}
if(D.hours_fixed)fixHours(D.hours_fixed);
function header(){const h=D.hdr;$('nm').textContent=h.name;document.title=h.name+' · Venue Sheet';let r='';
  const all=(h.reviews||[]).filter(x=>x.rating!=null&&x.count),rv=all.filter(x=>!x.exclude);
  if(rv.length){const n=rv.reduce((a,x)=>a+x.count,0),avg=rv.reduce((a,x)=>a+x.rating*x.count,0)/n;
    r='<span class="stars">★ '+avg.toFixed(1)+'</span> <span>('+n.toLocaleString()+' reviews)</span> <span class="rsrc">'+all.map(x=>x.src+' '+x.rating+' ('+x.count+(x.exclude?', '+x.exclude:'')+')').join(' · ')+(h.review_note?' · '+h.review_note:'')+'</span>';}
  else r='<span class="rsrc">Reviews: not collected yet</span>';
  $('hdr').innerHTML='<span>'+h.city+'</span>'+(h.site?'<a href="'+h.site+'" target="_blank">'+h.site.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')+'</a>':'<span class="rsrc">No website on record</span>')+r;}
function docsBlock(){const X=D.docs;if(!X)return '';let h='<h3 class="dh">Documents</h3><div class="dl">';
  X.docs.filter(x=>!(D.public&&x.private)).forEach(x=>{const L=[];
    if(x.url)L.push('<a href="'+x.url+'" target="_blank">Original</a>');
    if(x.archive)L.push('<a href="'+x.archive+'" target="_blank">Dated copy</a>');
    if(!D.public&&x.drive_copy&&X.drive_url)L.push('<a href="'+X.drive_url+'" target="_blank">PDF in Drive</a>');
    h+='<div class="dr"><div class="dk">'+x.title+'<span class="dn">'+x.kind+'</span></div><div class="dv">'+(L.join(' · ')||'<span class="dash">—</span>')+'</div></div>';});
  if(D.public)h+='<div class="dr"><div class="dk">Emailed brochures and PDF copies</div><div class="dv"><span class="dash">In the private copy (Google Drive)</span></div></div>';
  else if(X.drive_url)h+='<div class="dr"><div class="dk">All files for this venue</div><div class="dv"><a href="'+X.drive_url+'" target="_blank">Open the Drive folder</a></div></div>';
  return h+'</div>';}
function detail(){const F=D.dfinal,V=D.dval||{},S={contact:'Contact',find:'We find it',first:'Ask in the first email',last:'Ask only in the last email'};
  const SRC={venue:'Venue said',google:'Google',ours:'Our data',calc:'Worked out',abc:'State licence record'};
  const rows=F.rows,filled=rows.filter(r=>V[r.id]).length,ask1=rows.filter(r=>r.stage==='first'&&!V[r.id]).length;const PRIV=D.public?'<span class="dash">In the private copy</span>':null;
  let h='<div class="dsum"><b>'+filled+'/'+rows.length+'</b> filled · first email asks <b>'+ask1+'</b> · last email <b>'+rows.filter(r=>r.stage==='last'&&!V[r.id]).length+'</b></div>';
  ['contact','find','first','last'].forEach(st=>{if(st==='find')h+=docsBlock();h+='<h3 class="dh">'+S[st]+'</h3><div class="dl">';
    rows.filter(r=>r.stage===st).forEach(r=>{const v=V[r.id];
      h+='<div class="dr'+(v?'':' miss')+'"><div class="dk">'+r.label+''+'</div>'+
        '<div class="dv">'+(v&&v.priv&&PRIV?PRIV:v?(v.na?'<span class="chip unk">'+v.v+'</span>':v.v+' <span class="chip src">'+(SRC[v.src]||v.src)+'</span>'):'<span class="dash">—</span>')+'</div></div>';});
    h+='</div>';});
  h+='<p class="small">Cut on the form: '+F.cut.join(', ')+'. From your form answers, '+F.source.replace('Medi + Rinad form, ','')+'.</p>';
  $('tab-detail').innerHTML=h;}
const BAR_IDS=['bar_alcohol','own-alcohol','xbar','corkage','bartenders','liquor_liability'];
const GORD=['Venue','Food & drink','Bar / Alcohol','People & music','Sound, light, look','Rentals','Site & guests','Add-ons you ticked'];
function grpOf(l){return BAR_IDS.includes(l.id)?'Bar / Alcohol':l.group;}
function grouped(rows){const G={};rows.forEach(r=>{const g=grpOf(r.l);(G[g]=G[g]||[]).push(r);});
  return Object.keys(G).sort((a,b)=>(GORD.indexOf(a)+1||99)-(GORD.indexOf(b)+1||99)).map(g=>[g,G[g]]);}
function sup(id){const i=(D.sources||[]).findIndex(s=>s.id===id);return i<0?'':'<sup><a href="#src-'+(i+1)+'" title="'+D.sources[i].name.replace(/"/g,'')+'">'+(i+1)+'</a></sup>';}
S.open=S.open||{};
function uni(c,LO,HI){const U=c.rows.slice();[[LO,'Lowest'],[HI,'Highest']].forEach(([Z,nm])=>Z.c.rows.forEach(({l},i)=>{if(U.some(z=>z.l.id===l.id))return;const prev=i?Z.c.rows[i-1].l.id:null,j=prev?U.findIndex(z=>z.l.id===prev):-1;U.splice(j+1,0,{l,x:{st:'na',why:'Only in the '+nm+' column (not in your pick)'}});}));return U;}
function summary(c,LO,HI,VAR,U){U=U||c.rows;const T0=$('sum');const cnt=x=>!x.out&&!x.apart&&!['na','flag'].includes(x.st);
  const fmt=(sum,unk,v,cls)=>sum==null?'<span class="dash">—</span>':'<span class="'+(cls||(v?'var':''))+'">'+money(sum)+(unk?'+':'')+'</span>';
  const col=(L,src)=>{let s=0,k=0,u=0,v=0;L.forEach(({l,x})=>{const y=src?src.m[l.id]:x;if(!y||!cnt(y))return;if(y.amt==null){u++;return;}k++;s+=y.amt;if(VAR(l,x))v=1;});return {s:k?s:null,u,v};};
  let h='<tr><th>Category</th><th class="n">Lowest</th><th class="n">Highest</th><th class="n pk">Your pick</th><th class="n">Credit</th><th class="n">Outside scope</th></tr>';
  const tz=z=>'<span class="var">'+money(z.tot)+(z.unk||z.rq.length?'+':'')+'</span>',pz=z=>money(z.tot/T())+(z.unk||z.rq.length?'+':'');
  h+='<tr class="tot"><td>Total<div class="q">'+c.known+'/'+c.all+' known</div></td><td class="n">'+tz(LO.c)+'</td><td class="n">'+tz(HI.c)+'</td><td class="n pick">'+tz(c)+'</td><td class="n">'+(c.cred?'<span class="cred">'+money(c.cred)+'</span>':'<span class="dash">—</span>')+'</td><td></td></tr>';
  h+='<tr class="tot"><td>Per guest<div class="q">'+T()+' guests</div></td><td class="n"><span class="var">'+pz(LO.c)+'</span></td><td class="n"><span class="var">'+pz(HI.c)+'</span></td><td class="n pick"><span class="var">'+pz(c)+'</span></td><td></td><td></td></tr>';
  const GR=grouped(U);h+='<tr class="acc" id="accrow"><td colspan="6"><span class="tog">'+(S.openCat?'▼':'▶')+'</span>By category ('+GR.length+')</td></tr>';
  if(S.openCat)GR.forEach(([g,L],i)=>{const a=col(L,LO),b=col(L,HI),p=col(L,null),add=g.startsWith('Add-ons');
    const all=L.filter(r=>cnt(r.x)).length,known=L.filter(r=>cnt(r.x)&&r.x.amt!=null).length;
    const cr=L.reduce((z,r)=>z+(r.x.credit||0),0),ct=L.filter(r=>r.x.credit_text).length,ou=L.filter(r=>r.x.out),os=ou.reduce((z,r)=>z+(r.x.amt||0),0);
    const op=!!S.open[g];
    h+='<tr class="cat" data-g="'+g+'"><td><span class="tog">'+(op?'▼':'▶')+'</span>'+g+'<div class="q">'+known+'/'+all+' known</div></td>'+
      '<td class="n">'+(add?'<span class="dash">—</span>':fmt(a.s,a.u,a.v))+'</td><td class="n">'+(add?'<span class="dash">—</span>':fmt(b.s,b.u,b.v))+'</td><td class="n pick">'+fmt(p.s,p.u,p.v)+'</td>'+
      '<td class="n">'+(cr?'<span class="cred">'+money(cr)+'</span>':'')+(ct?'<span class="cred">'+ct+' perk'+(ct>1?'s':'')+'</span>':'')+'</td><td class="n out">'+(ou.length?(os?money(os):ou.length+' line'+(ou.length>1?'s':'')+', —'):'')+'</td></tr>';
    if(op)L.forEach(({l,x})=>{const v=VAR(l,x),f1=y=>!y||y.out||!cnt(y)&&y.st!=='na'&&!y.apart?'<span class="dash">—</span>':y.amt==null?(y.st==='na'?'$0':'<span class="dash">—</span>'):'<span class="'+(v?'var':'')+'">'+money(y.amt)+'</span>';
      h+='<tr class="sub'+(x.st==='na'?' dim':'')+'"><td>'+l.name+' <span class="chip '+CH[x.st][0]+'">'+CH[x.st][1]+'</span></td><td class="n">'+(add?'':f1(LO.m[l.id]))+'</td><td class="n">'+(add?'':f1(HI.m[l.id]))+'</td><td class="n pick">'+f1(x)+'</td>'+
        '<td class="n">'+(x.credit?'<span class="cred">'+money(x.credit)+'</span>':x.credit_text?'<span class="cred">'+x.credit_text+'</span>':'')+'</td><td class="n out">'+(x.out?(x.amt!=null?money(x.amt):CH[x.st][1]):'')+'</td></tr>';});});
  T0.innerHTML=h;$('accrow').onclick=()=>{S.openCat=!S.openCat;draw();};T0.querySelectorAll('tr.cat').forEach(r=>r.onclick=()=>{S.open[r.dataset.g]=!S.open[r.dataset.g];draw();});}
function srcList(c){const Q={};const add=(id,q)=>{if(!q)return;id=id||D.src_default;(Q[id]=Q[id]||new Set()).add(q);};
  c.rows.forEach(({x})=>add(x.src,x.q));
  Object.values(D.pkgs||{}).flat().forEach(p=>{add(p.src,p.q);(p.items||[]).forEach(i=>add(p.src,i));});
  Object.values(D.barpkgs||{}).flat().forEach(p=>{add(p.src,p.q);(p.items||[]).forEach(i=>add(p.src,i));});
  (D.addons||[]).forEach(a=>add(a.src,a.q));if(D.byo)(D.byo.quotes||[]).forEach(q=>add(D.byo.cork_src,q));
  Object.entries(D.pkg_common||{}).forEach(([k,v])=>add(D.src_default,v));
  $('srcs').innerHTML=(D.sources||[]).length?'<div class="srcs"><b>Sources</b><ol>'+D.sources.map((s,i)=>{const L=[...(Q[s.id]||[])];
    return '<li id="src-'+(i+1)+'">'+(s.url?'<a href="'+s.url+'" target="_blank">'+s.name+'</a>':s.name)+(s.note?' <span class="fs">· '+s.note+'</span>':'')+
      (L.length?'<details><summary class="fs">Exact wording used ('+L.length+')</summary><ul class="fs">'+L.map(q=>'<li>“'+q+'”</li>').join('')+'</ul></details>':'')+'</li>';}).join('')+'</ol></div>':'';}
function extras(){if(!D.kids&&!(D.notes||[]).some(n=>n.kid))(D.notes=D.notes||[]).push({t:'Open question: child price (not stated; children are counted as adults for now).',kid:1});
  $('notes').innerHTML=(D.notes||[]).length?'<div class="notes"><b>Notes</b><ul>'+D.notes.map(n=>'<li>'+n.t+(n.src?sup(n.src):'')+'</li>').join('')+'</ul></div>':'';
  /* sources drawn in draw() */
  {const SM=(D.sm||[]).filter(x=>x&&/^https?:\/\//.test(x[0]));const E=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
   const TY={video:'Video',couple_story:'Couple story',news:'News',vendor_page:'Vendor post',venue_page:'Listing'};
   const li=x=>'<li><a href="'+E(x[0])+'" target="_blank" rel="noopener">'+E(x[2]||x[1]||'Link')+'</a> <span class="fs">· '+E(x[1]||'')+(x[3]?' · '+E(x[3]):'')+(x[4]!=='venue_page'&&TY[x[4]]?' · '+TY[x[4]]:'')+'</span></li>';
   const st=SM.filter(x=>x[4]!=='venue_page'),ls=SM.filter(x=>x[4]==='venue_page');
   $('posts').innerHTML=SM.length?'<div class="posts"><b>Posts about this venue</b>'+(st.length?'<h4>Stories &amp; videos</h4><ul>'+st.map(li).join('')+'</ul>':'')+(ls.length?'<h4>Listed on other sites</h4><ul>'+ls.map(li).join('')+'</ul>':'')+'</div>':'';}
  const A=D.allfacts;if(A&&Object.keys(A).length){let h='<button id="fb">Sources: all facts we have, by topic</button><div class="fl">';
    Object.entries(A).forEach(([k,L])=>{h+='<h4>'+k.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase())+'</h4><ul>'+L.map(x=>'<li>'+x[0]+' <span class="fs">· '+(x[2]?'<a href="'+x[2]+'" target="_blank">'+(x[3]||'source')+'</a>':(x[3]||''))+(x[1]&&x[1]!==x[0]&&x[1].length<220?' · “'+x[1]+'”':'')+'</span></li>').join('')+'</ul>';});
    if(D.fn)h+='<button id="fall" style="margin-top:.8rem">Show all '+D.fn.toLocaleString('en-US')+' facts</button><div id="fallb"></div>';
    $('facts').innerHTML=h+'</div>';$('fb').onclick=()=>$('facts').classList.toggle('open');
    if(D.fn)$('fall').onclick=async()=>{const B=$('fall');B.disabled=true;B.textContent='Loading…';
      const E=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      try{const A2=((await fetch(D.f_all_path+D.pid.slice(-2)+'.json').then(r=>r.json()))[D.pid])||{};let g='';
        Object.entries(A2).forEach(([k,L])=>{g+='<h4>'+E(k.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()))+' ('+L.length+')</h4><ul>'+L.map(x=>'<li>'+E(x[0])+' <span class="fs">· '+(x[2]&&/^https?:\/\//.test(x[2])?'<a href="'+E(x[2])+'" target="_blank" rel="noopener">'+E(x[3]||'source')+'</a>':E(x[3]||''))+(x[4]?' · '+E(x[4]):'')+(x[1]&&x[1]!==x[0]&&x[1].length<220?' · “'+E(x[1])+'”':'')+'</span></li>').join('')+'</ul>';});
        $('fallb').innerHTML='<h3 style="margin-top:1rem">All facts, every source</h3>'+(g||'<p>No facts found.</p>');B.remove();}
      catch(e){B.disabled=false;B.textContent='Could not load the facts: try again';}};}
  const a=D.acts||{};let b='';
  if(a.site)b+='<a href="'+a.site+'" target="_blank">Website</a>';if(a.phone)b+='<a href="tel:'+a.phone.replace(/[^0-9]/g,'').slice(0,10)+'">Call</a>';
  if(a.email)b+='<a href="mailto:'+a.email+'">Email</a>';if(a.map)b+='<a href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(a.map)+'" target="_blank">Map</a>';
  if(D.alc_label)b+='<span class="pol">Alcohol: '+D.alc_label+'</span>';$('acts').innerHTML=b;}
function tab(w){['price','detail'].forEach(x=>{$('tab-'+x).hidden=x!==w;document.querySelector('.tabs [data-t='+x+']').classList.toggle('on',x===w);});}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>tab(b.dataset.t));
header();detail();extras();if(D.test_case)$('testcase').textContent=' · test: '+D.test_case;
if(!(D.barpkgs||{})[S.alc])S.alc=D.no_alcohol?'none':(D.barpkgs&&Object.keys(D.barpkgs).length?Object.keys(D.barpkgs).sort((a,b)=>a==='full'?-1:1)[0]:(D.byo&&D.byo.allowed&&D.byo.default!==false?'byo':'venue'));
draw();

// citation links: scroll to the source without touching the page address (the #v= venue id must stay)
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);if(/^(v|id)=/.test(id))return;
  e.preventDefault();const t=document.getElementById(id);if(!t)return;t.scrollIntoView({block:'center'});t.classList.remove('flash');void t.offsetWidth;t.classList.add('flash');});

// contact progress pills (row field 31 from the site: [key,label,date,stages]) + back to the venue list
(function(){const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];const dt=d=>{const m=/^(\d{4})-(\d\d)-(\d\d)/.exec(d||'');return m?' · '+M[+m[2]-1]+' '+(+m[3]):'';};
  const O=D.outreach,el=document.getElementById('cpill');if(el){if(!O||!O.length)el.innerHTML='<span class="cp none cur">Not contacted</span>';
  else{const st=(O[3]&&O[3].length)?O[3]:[[O[0],O[1],O[2]]];el.innerHTML=st.map((x,i)=>'<span class="cp '+x[0]+(i===st.length-1?' cur':'')+'">'+x[1]+dt(x[2])+'</span>').join('<span class="cpa">&rarr;</span>');}}
  const b=document.getElementById('back');if(b)b.onclick=e=>{try{const r=document.referrer?new URL(document.referrer):null,L=new URL('../',location.href);
    if(r&&r.origin===L.origin&&r.pathname===L.pathname&&history.length>1){e.preventDefault();history.back();}}catch(_){}};})();
