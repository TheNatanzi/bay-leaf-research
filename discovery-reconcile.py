"""Reconcile every captured candidate; name/URL matches never close a review automatically."""
from pathlib import Path
from collections import Counter
import json,sys
ROOT=Path(__file__).parent
def reconcile(data,queue):
 ids={v['id'] for v in data['venues']};seen=set();counts=Counter();entries=[]
 for r in queue['candidates']:
  assert r['id'] not in seen,'Duplicate candidate ID';seen.add(r['id'])
  state=r.get('review_state','pending');assert state in {'pending','reviewed_added','reviewed_existing','reviewed_supplier_not_venue_offer','reviewed_outside_scope','excluded','blocked'},'Missing/invalid disposition'
  if state in {'reviewed_added','reviewed_existing'}:
   assert r.get('reviewed_utc') and r.get('review_source_urls'),'Completed review needs dated source evidence'
   assert r.get('matched_record_ids') and all(id in ids for id in r['matched_record_ids']),'Completed review must link live records'
  if state in {'excluded','blocked'}:assert r.get('review_reason') and r.get('reviewed_utc'),'Exclusion/block needs date and reason'
  if state in {'reviewed_supplier_not_venue_offer','reviewed_outside_scope'}:
   assert r.get('review_reason') and r.get('reviewed_utc') and r.get('review_source_urls'),'Non-venue review needs dated sources and reason'
   assert not r.get('matched_record_ids'),'Non-venue review must not manufacture a matched venue'
  counts[state]+=1;entries.append({'candidate_id':r['id'],'name':r['name'],'url':r['url'],'state':state,'record_ids':r.get('matched_record_ids',[])})
 total=len(entries);resolved=sum(counts[s] for s in ['reviewed_added','reviewed_existing','reviewed_supplier_not_venue_offer','reviewed_outside_scope','excluded']);pending=total-resolved
 return {'candidate_urls':total,'resolved_candidate_urls':resolved,'unresolved_candidate_urls':pending,'review_counts':dict(counts),'complete':pending==0,'scope_note':'Candidate-queue resolution only; even zero unresolved leads does not establish all venues discovered. Room counts and source downloads are not property coverage.','entries':entries}
if __name__=='__main__':
 result=reconcile(json.loads((ROOT/'research.json').read_text(encoding='utf-8')),json.loads((ROOT/'directory-candidates.json').read_text(encoding='utf-8')))
 target=ROOT/'discovery-reconciliation.json'
 if '--check' in sys.argv:assert json.loads(target.read_text(encoding='utf-8'))==result,'Reconciliation stale; rerun before publishing'
 else:target.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({k:v for k,v in result.items() if k!='entries'}))
