/* Pure evidence lookup, scenario arithmetic and preference ranking. No network or paid APIs. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BayLeafNormalized=api;})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  function create(data){
    const layer=data.normalized,defs=new Map(layer.fields.map(f=>[f.id,f])),byId=new Map(data.venues.map(v=>[v.id,v]));
    const get=(obj,path)=>(path||[]).reduce((o,k)=>o==null?null:o[k],obj);
    const record=v=>layer.records[typeof v==='string'?v:v.id];
    const fact=(v,key)=>record(v)?.facts[key]||{value:null,status:layer.default_status,scope_record_id:typeof v==='string'?v:v.id};
    const value=(v,key)=>{const f=fact(v,key);return ['conflicting','not_applicable'].includes(f.status)?null:f.value??null};
    function provenance(v,key){const f=typeof key==='string'?fact(v,key):key,p=f.ref||[],raw=get(v,p);let source=raw,urls=[],checked=v.checked_utc||null,originalStatus=v.research_status||null;
      if(p[0]==='workbook_answers'){source=raw?.answer;urls=raw?.source_urls||[];checked=raw?.checked_utc||null;originalStatus=raw?.status||null;}
      else if(p[0]==='price'){source=v.price?.basis;urls=v.price?.source?[v.price.source]:v.sources||[];checked=v.price?.checked_utc||v.pricing_checked_utc||null;originalStatus=v.price?.status||null;}
      else if(p[0]==='parcel_evidence'){source=raw;urls=raw?.source_url?[raw.source_url]:v.value_sources||[];checked=raw?.checked_utc||null;originalStatus=raw?.scope||null;}
      else if(p[0]==='research_observations'){source=raw?.source_text;urls=raw?.source_urls||[];checked=raw?.checked_utc||null;originalStatus=raw?.basis||null;}
      else if(p[0]==='research_attempts'){source=raw?.source_text;urls=raw?.source_urls||[];checked=raw?.checked_utc||null;originalStatus=raw?.status||null;}
      else if(/year|operator_start/.test(typeof key==='string'?key:'')){urls=v.history_sources||[];originalStatus=v.history_status||null;}
      else urls=v.value_sources&&/asking|value|sale/.test(String(p[0]))?v.value_sources:v.sources||[];
      if(key==='capacity_max'&&!['research_observations','research_attempts'].includes(p[0]))source={seated:v.seated_capacity??null,standing:v.standing_capacity??null,generic:v.generic_capacity??null,published:v.published_capacity??null,description:v.capacity_description??null};
      const str=typeof source==='string'?source:'';
      const quality=/proposed|recommendation.*not.*adopted/i.test(str+' '+originalStatus)?'proposal; applicability unverified':/historical|legacy|2021|2022|2023|2024|2025/i.test(str+' '+originalStatus)?'historical or older material; current confirmation required':/directory/i.test(originalStatus||'')?'directory-reported; confirm with venue':'recorded published evidence; current contract unverified';
      return {source_text:source??null,source_urls:[...new Set(urls)],checked_utc:checked,effective_date:f.effective_date||raw?.effective_date||null,original_status:originalStatus,scope_record_id:v.id,unit:defs.get(typeof key==='string'?key:'')?.unit||null,quality,method:f.method||null,note:f.note||null};
    }
    function fieldStatus(v,key){return key.startsWith('workbook:')?record(v)?.workbook_status[key.slice(9)]||layer.default_status:fact(v,key).status;}
    function coverage(v){const fields=data.criteria.fields;let answered=0,na=0;for(const f of fields){const a=v.workbook_answers?.[f.id],status=fieldStatus(v,'workbook:'+f.id);if(status==='not_applicable'){na++;continue}if(a?.answer!=null&&String(a.answer).trim()&&!/^\s*(unknown|not (yet )?(researched|verified|established)|pending)/i.test(String(a.answer)))answered++;}return {answered,not_applicable:na,applicable:fields.length-na,percent:fields.length>na?answered/(fields.length-na)*100:null};}
    const finite=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
    const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
    function dateAvailability(v,eventDate){const restrictions=validDate(eventDate)?(v.availability_restrictions||[]).filter(r=>r.blocks_booking===true&&r.source_url&&r.checked_utc&&validDate(r.start)&&validDate(r.end)&&eventDate>=r.start&&eventDate<=r.end):[];return {blocked:restrictions.length>0,restrictions,note:restrictions.length?'Published booking restriction covers selected date; obtain current confirmation':'No matching published hold established; date availability remains unverified'};}
    function scenario(v,c={}){
      const guests=Number(c.guests)||300,hours=Number(c.hours)||6,missing=[],assumptions=[],components=[],conditions=[];
      function read(key,override){if(override!==''&&override!=null){const n=Number(override);if(finite(n)){assumptions.push(key+' user assumption');return n}missing.push('Invalid assumption: '+key);return null}const f=fact(v,key),n=value(v,key);if(finite(n)){const p=provenance(v,key);if(p.quality.includes('proposal')){missing.push(key+' proposal not established');return null}conditions.push(p.note||p.source_text||key);return n}return null;}
      const pair=(lo,hi,override)=>{const a=read(lo,override),b=override!==''&&override!=null?a:read(hi,null);return [a,b]};
      const minHours=value(v,'minimum_rental_hours');if(minHours!=null&&hours<minHours)missing.push('rental shorter than published minimum');
      for(const charge of v.unallocated_mandatory_charges||[]){if(charge.source_url&&finite(charge.rate_pct)&&charge.rate_pct>0){missing.push('unallocated mandatory charge: '+charge.name);conditions.push(charge.name+' '+charge.rate_pct+'%; published charge basis/quote allocation requires confirmation');}}
      const lodging=value(v,'lodging_requirement'),lodgingHandling=c.lodgingHandling||'';
      if(['required_extra','required_unallocated','conditional'].includes(lodging)){
        if(lodging==='conditional'&&lodgingHandling==='not_required')assumptions.push('selected conditional offer has no required lodging; user applicability assumption');
        else if(lodgingHandling==='included_in_fixed'&&c.fixed!==''&&c.fixed!=null&&finite(Number(c.fixed))&&Number(c.fixed)>0){
          assumptions.push('all required lodging, lodging fees/taxes and room liability included in positive fixed-charge assumption; no guest reimbursement deducted');
          if((Number(c.servicePct)>0&&c.serviceBase==='all_components')||(Number(c.taxPct)>0&&['all_with_service','all_without_service'].includes(c.taxBase)))missing.push('lodging-inclusive fixed charges overlap service/tax base; specify a nonoverlapping or custom base');
        }else missing.push('mandatory lodging/buyout total, inclusion and payer liability');
      }
      if(c.securityMode==='calculate'&&value(v,'security_min_hours')!=null&&Number(c.securityHours)<value(v,'security_min_hours'))missing.push('security billable hours below published minimum');
      let [feeLo,feeHi]=pair('fee_min','fee_max',c.venueFee);
      const perGuestVenue=value(v,'venue_per_guest_min'),perGuestVenueHigh=value(v,'venue_per_guest_max'),venueMinimum=value(v,'venue_minimum');
      if(feeLo==null&&perGuestVenue!=null){feeLo=perGuestVenue*guests;feeHi=perGuestVenueHigh==null?null:perGuestVenueHigh*guests;}
      if(venueMinimum!=null&&feeLo!=null){if(c.venueFee!==''&&c.venueFee!=null&&feeLo<venueMinimum)missing.push('assumed venue fee below published minimum');else{feeLo=Math.max(feeLo,venueMinimum);if(feeHi!=null)feeHi=Math.max(feeHi,venueMinimum);}}
      const hourly=read('hourly_fee',c.hourlyFee);
      if(feeLo==null&&hourly!=null){feeLo=feeHi=hourly*hours;const min=value(v,'minimum_rental_hours');if(min!=null&&hours<min)missing.push('rental shorter than published minimum');}
      if(feeLo!=null){components.push({name:'Venue fee',low:feeLo,high:feeHi});const incl=value(v,'rental_hours');if(incl!=null&&hours>incl){const ot=read('overtime_hourly',c.overtimeRate);if(ot==null)missing.push('overtime for extra rental hours');else components.push({name:'Extra rental hours',low:(hours-incl)*ot,high:(hours-incl)*ot});}else if(incl==null&&(c.venueFee===''||c.venueFee==null)&&(c.hourlyFee===''||c.hourlyFee==null))missing.push('rental-duration applicability');}
      else missing.push('venue fee');
      if(feeLo!=null&&feeHi==null)missing.push('venue fee upper bound');
      const ceremony=value(v,'ceremony_fee');if(ceremony!=null){if(c.ceremony==='yes')components.push({name:'Additional ceremony fee',low:ceremony,high:ceremony});else if(c.ceremony!=='no')missing.push('ceremony-fee applicability');}
      let foodLo=null,foodHi=null,barLo=null,barHi=null,usedCombined=false;
      if(c.mode!=='venue_only'){
        if(c.food!==''&&c.food!=null&&finite(Number(c.food))){
          if(c.foodBasis==='outside_caterer'){
            if(value(v,'outside_catering')!=='yes')missing.push('outside caterer permission for selected food assumption');
            assumptions.push('outside-caterer food estimate only; staffing, rentals, tax and bar not implied');
          }else if(c.foodBasis==='venue_quote')assumptions.push('venue-specific food quote entered by user; scope and inclusions unverified');
          else missing.push('food assumption basis and venue applicability');
        }
        const basis=value(v,'food_basis');const separate=c.mode==='separate'||c.food!==''&&c.food!=null||c.bar!==''&&c.bar!=null;
        if(!separate&&basis==='food_bar_combined'){
          usedCombined=true;const [a,b]=pair('package_min','package_max',null);foodLo=a==null?null:a*guests;foodHi=b==null?null:b*guests;barLo=barHi=0;components.push({name:'Combined food/bar package (not added twice)',low:foodLo,high:foodHi});if(a==null||b==null)missing.push('combined package bounds');
        }else{
          let [a,b]=pair('food_min','food_max',c.food);if(a==null&&basis==='food_only'&&(c.food===''||c.food==null)){[a,b]=pair('package_min','package_max',null)}
          let [x,y]=pair('bar_min','bar_max',c.bar);foodLo=a==null?null:a*guests;foodHi=b==null?null:b*guests;barLo=x==null?null:x*guests;barHi=y==null?null:y*guests;
          components.push({name:'Food',low:foodLo,high:foodHi},{name:'Bar',low:barLo,high:barHi});if(a==null||b==null)missing.push('food bounds');if(x==null||y==null)missing.push('bar bounds');
        }
      }
      if(value(v,'service_package_min')!=null)missing.push('service-only package inclusions/allocation');
      let fixed=read('fixed_mandatory',c.fixed);const publishedFixed=value(v,'fixed_mandatory');if(fixed!=null&&publishedFixed!=null&&fixed<publishedFixed){missing.push('assumed fixed charges below published mandatory amount');fixed=publishedFixed;conditions.push('Published mandatory fixed amount retained; a lower assumption does not waive a required charge');}if(fixed==null)missing.push('additional mandatory fixed charges');else components.push({name:'Additional mandatory charges',low:fixed,high:fixed});
      const cleaning=value(v,'cleaning_fee');if(cleaning!=null)components.push({name:'Separate cleaning fee',low:cleaning,high:cleaning});
      const securityRate=value(v,'security_hourly');if(securityRate!=null||c.securityMode==='calculate'){if(c.securityMode==='included_in_fixed')assumptions.push('security costs included in fixed-charge assumption');else if(c.securityMode==='calculate'){const rate=read('security_hourly',c.securityRate),count=Number(c.securityCount),guardHours=Number(c.securityHours);if(rate!=null&&c.securityCount!==''&&c.securityCount!=null&&finite(count)&&c.securityHours!==''&&c.securityHours!=null&&finite(guardHours))components.push({name:'Security (rate × guards × hours)',low:rate*count*guardHours,high:rate*count*guardHours});else missing.push('security rate/count/billable hours');}else missing.push('security staffing/cost applicability');}
      const floor=read('minimum_spend',c.minimumSpend)??(value(v,'fb_minimum')==null?null:value(v,'fb_minimum')*guests);if(floor!=null){if(c.spendBase==='food_bar'&&foodLo!=null&&barLo!=null){const lo=Math.max(0,floor-foodLo-barLo),hi=foodHi==null||barHi==null?null:Math.max(0,floor-foodHi-barHi);components.push({name:'Spend-floor shortfall (not full floor added)',low:lo,high:hi});}else missing.push('minimum spend applicability/base');}
      let low=components.reduce((s,x)=>s+(x.low??0),0),high=components.reduce((s,x)=>s+(x.high??x.low??0),0);
      const service=read('service_pct',c.servicePct);let serviceLo=null,serviceHi=null;
      if(service===0)serviceLo=serviceHi=0;
      else if(service!=null&&c.serviceBase==='food_bar'&&foodLo!=null&&barLo!=null){serviceLo=Math.max(foodLo+barLo,c.spendBase==='food_bar'?(floor??0):0)*service/100;serviceHi=foodHi==null||barHi==null?null:Math.max(foodHi+barHi,c.spendBase==='food_bar'?(floor??0):0)*service/100;}
      else if(service!=null&&c.serviceBase==='all_components'){serviceLo=low*service/100;serviceHi=high*service/100;assumptions.push('service charge applies to all included components');}
      else if(service!=null&&c.serviceBase==='food_only'&&!usedCombined&&foodLo!=null){serviceLo=foodLo*service/100;serviceHi=foodHi==null?null:foodHi*service/100;}
      else if(service!=null&&c.serviceBase==='custom'&&c.serviceBaseAmount!==''&&c.serviceBaseAmount!=null&&finite(Number(c.serviceBaseAmount))){serviceLo=serviceHi=Number(c.serviceBaseAmount)*service/100;assumptions.push('custom service-charge base supplied by user');}
      else missing.push('service/admin percentage or charge base');
      const preServiceLow=low,preServiceHigh=high;low+=serviceLo||0;high+=serviceHi??serviceLo??0;
      if(serviceLo!=null)components.push({name:'Service/admin charge',low:serviceLo,high:serviceHi});
      const tax=read('tax_pct',c.taxPct);let taxLo=null,taxHi=null;
      if(tax===0)taxLo=taxHi=0;else if(tax!=null&&c.taxBase==='all_with_service'){taxLo=low*tax/100;taxHi=high*tax/100;assumptions.push('tax applies to all included components plus service');}else if(tax!=null&&c.taxBase==='all_without_service'){taxLo=preServiceLow*tax/100;taxHi=preServiceHigh*tax/100;assumptions.push('tax applies to all included pre-service components');}else if(tax!=null&&c.taxBase==='custom'&&c.taxBaseAmount!==''&&c.taxBaseAmount!=null&&finite(Number(c.taxBaseAmount))){taxLo=taxHi=Number(c.taxBaseAmount)*tax/100;assumptions.push('custom taxable subtotal supplied by user');}else missing.push('tax rate or taxable base');
      if(taxLo!=null){components.push({name:'Tax',low:taxLo,high:taxHi});low+=taxLo;high+=taxHi??taxLo;}
      const hasKnown=components.some(x=>x.low!=null),deposit=value(v,'deposit_refundable');
      const capacity=value(v,'capacity_dinner_dance');let fit=capacity==null?'Dinner/dance layout unverified':guests<=capacity?'Fits published dinner/dance count; event approval unverified':'Exceeds published dinner/dance count';
      const dateAvailabilityResult=dateAvailability(v,c.eventDate);if(dateAvailabilityResult.blocked){missing.push('published booking hold covers selected date');conditions.push(dateAvailabilityResult.note);}
      if(!c.eventDate)missing.push('date/day/season applicability');else if(!validDate(c.eventDate))missing.push('invalid event date');else assumptions.push('user event date '+c.eventDate+'; published offer applicability not independently confirmed');
      if(!c.otherCostsConfirmed)missing.push('complete mandatory-cost inventory not confirmed');
      const complete=hasKnown&&missing.length===0;
      return {low:hasKnown?low:null,high:complete?high:null,known_subtotal_high:hasKnown?high:null,per_guest_low:hasKnown?low/guests:null,per_guest_high:complete?high/guests:null,deposit,cash_with_known_deposit:hasKnown&&deposit!=null?low+deposit:null,booking_credit:value(v,'booking_credit'),components,missing:[...new Set(missing)],assumptions:[...new Set(assumptions)],conditions,complete,label:complete?'Planning estimate — assumptions, not a venue quote':c.mode==='venue_only'?'Known venue-only subtotal — incomplete':'Known subtotal — incomplete',guest_count:guests,rental_hours:hours,capacity_fit:fit,date_availability:dateAvailabilityResult};
    }
    function ranking(v,c={},cost){const w=c.weights||{},items=[],target=Number(c.guests)||300;const add=(id,score,note)=>{const weight=Number(w[id])||0;if(weight>0)items.push({id,weight,score,note})};
      const cap=value(v,'capacity_dinner_dance');add('capacity',cap==null?null:Math.min(1,cap/target),'Published dinner/dance layout only');
      const music=value(v,c.musicScope==='outdoor'?'music_outdoor':'music_indoor');add('music',music==null?null:music>=(Number(c.targetMusic)||1440)?1:0,'Published clock; permission/paid-extension conditions remain');
      const policy=value(v,'outside_catering');add('vendors',policy==='yes'?1:policy==='no'?0:policy==='approved_only'?(c.approvedCaterersAcceptable?1:0):null,'Conditional/unknown policies remain missing');
      const reviews=(c.reviews||null);add('reviews',reviews==null?null:reviews/5,'Platform aggregate, not a wedding quality guarantee');
      const targetCost=Number(c.targetCost);add('cost',cost?.complete&&cost.high!=null&&targetCost>0?Math.max(0,Math.min(1,targetCost/Math.max(cost.high,1))):null,'Complete planning scenario and optional target cost required');
      const total=items.reduce((s,i)=>s+i.weight,0),covered=items.filter(i=>i.score!==null).reduce((s,i)=>s+i.weight,0),coverage=total?covered/total*100:null;
      const held=cost?.date_availability?.blocked||dateAvailability(v,c.eventDate).blocked,blocked=value(v,'availability')==='closed'||value(v,'wedding_permission')==='explicit_no'||held;
      const threshold=c.minimumCoverage==null?100:Number(c.minimumCoverage);const score=!blocked&&covered>0&&coverage+1e-8>=threshold?items.reduce((s,i)=>s+(i.score??0)*i.weight,0)/covered*100:null;
      return {score,coverage,items,blocked,note:held?'Published booking hold covers selected date; not ranked':blocked?'Closed / explicitly disallowed; not ranked':!total?'Choose weights to enable ranking':score==null?'Insufficient evidence for selected weights':coverage<100?'Partial-evidence preference score; compare coverage':'Preference score only; not legal/financial feasibility'};
    }
    function propertyGroups(rows){const groups=new Map();for(const v of rows){const id=record(v).property_id;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(v)}return [...groups].map(([property_id,records])=>({property_id,records,identity:layer.properties[property_id]}));}
    return {defs,record,fact,value,provenance,fieldStatus,coverage,scenario,ranking,propertyGroups,dateAvailability,byId,statuses:layer.statuses};
  }
  function clockLabel(minutes){if(minutes==null)return 'Unknown';const day=Math.floor(minutes/1440),m=minutes%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+(day?' +'+day+'d':'');}
  return {create,clockLabel};
});
