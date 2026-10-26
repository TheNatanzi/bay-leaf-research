/* Pure, evidence-preserving metrics shared by the UI and audit. No network calls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BayLeafMetrics=api;})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const number=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
  const positive=x=>number(x)!==null&&x>0?x:null;
  const nonnegative=x=>number(x)!==null&&x>=0?x:null;
  function capacity(v){
    const candidates=[['Seated',v.seated_capacity],['Standing',v.standing_capacity],['Unspecified layout',v.generic_capacity],['Indoor; layout not specified',v.published_capacity?.indoor],['Outdoor; layout not specified',v.published_capacity?.outdoor]].filter(([,n])=>positive(n)!==null);
    const max=candidates.length?Math.max(...candidates.map(([,n])=>n)):null;
    return {max,seated:positive(v.seated_capacity),standing:positive(v.standing_capacity),basis:candidates.filter(([,n])=>n===max).map(([s])=>s).join(' / ')||null,candidates};
  }
  function reviews(v){
    const platforms=Object.entries(v.reviews||{}).concat((v.review_observations||[]).map((r,i)=>['observation-'+i,r])).filter(([,r])=>r&&r.included_in_aggregate!==false&&number(r.rating)!==null&&r.rating>=0&&r.rating<=5&&r.review_url).map(([key,r])=>({name:r.provider||r.platform||({google:'Google',yelp:'Yelp',other:'Other'}[key]||key),rating:r.rating,count:positive(r.review_count),url:r.review_url,checked:r.checked_utc||null,scope:r.scope||null,status:r.status||r.review_status||null}));
    // A profile exposed through two slots is one platform observation.
    const unique=[...new Map(platforms.map(r=>[r.url.replace(/\/$/,''),r])).values()];
    const weighted=unique.length>0&&unique.every(r=>r.count!==null);
    const total=weighted?unique.reduce((s,r)=>s+r.count,0):null;
    const score=unique.length?(weighted?unique.reduce((s,r)=>s+r.rating*r.count,0)/total:unique.reduce((s,r)=>s+r.rating,0)/unique.length):null;
    return {score,platforms:unique,count:total,method:unique.length===0?'No verified numeric ratings':unique.length===1?'Single platform; not a multi-platform aggregate':weighted?'Review-count-weighted platform average':'Equal-platform average; at least one review count unknown'};
  }
  function knownAnswer(a){return a?.answer!=null&&!/^\s*(unknown|not (yet )?(researched|verified|established)|pending)\b/i.test(String(a.answer));}
  function metrics(v,guestCount=300,criteriaCount=194){
    const c=capacity(v),r=reviews(v),p=v.price||{},answers=Object.values(v.workbook_answers||{}),answered=answers.filter(knownAnswer).length;
    const feeLow=nonnegative(p.event_low),feeHigh=nonnegative(p.event_high);
    // Only a supported dining ceiling permits a venue-fee/guest scenario. Standing/generic capacity is insufficient.
    const validScenario=positive(guestCount)!==null&&c.seated!==null&&guestCount<=c.seated;
    return {max_capacity:c.max,seated_capacity:c.seated,standing_capacity:c.standing,fee_low:feeLow,fee_high:feeHigh,package_low:nonnegative(p.per_head_low),package_high:nonnegative(p.per_head_high),venue_per_guest_low:validScenario&&feeLow!==null?feeLow/guestCount:null,venue_per_guest_high:validScenario&&feeHigh!==null?feeHigh/guestCount:null,review_score:r.score,review_count:r.count,platform_count:r.platforms.length||null,coverage_pct:criteriaCount>0?Math.min(100,answered/criteriaCount*100):null,answered_fields:answered,construction_year:number(v.construction_year),wedding_opening_year:number(v.wedding_opening_year),current_operator_since:number(v.current_operator_since),capacity_basis:c.basis,review_method:r.method};
  }
  const columns=[['max_capacity','Max capacity'],['seated_capacity','Seated capacity'],['fee_low','Event fee min ($)'],['fee_high','Event fee max ($)'],['package_low','Package min ($/guest)'],['package_high','Package max ($/guest)'],['review_score','Reviews / 5'],['review_count','Rating count'],['coverage_pct','Workbook answered (%)']];
  return {number,capacity,reviews,knownAnswer,metrics,columns};
});
