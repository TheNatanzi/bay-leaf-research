"""Rebuild the typed evidence layer without changing any original venue fact.
No network/AI/API calls. Conservative, reviewed patterns; ambiguous numbers stay in a review queue.
"""
from pathlib import Path
from datetime import datetime,timezone
import json,re,hashlib,collections,unicodedata
ROOT=Path(__file__).resolve().parent
NOW=datetime.now(timezone.utc).isoformat()
D=json.loads((ROOT/'research.json').read_text(encoding='utf-8'))
def rows(group,unit,items):return [{'id':k,'label':v,'group':group,'unit':unit,'type':'number'} for k,v in items]
FIELDS=(rows('Capacity','people',[('capacity_max','Max published capacity'),('capacity_seated','Seated capacity'),('capacity_standing','Standing capacity'),('capacity_dinner_dance','Dinner + dance capacity'),('capacity_rain_backup','Rain-backup dinner + dance'),('capacity_ceremony','Ceremony seating'),('capacity_indoor','Indoor published capacity'),('capacity_outdoor','Outdoor published capacity')])+
 rows('Costs','USD/event',[('fee_min','Event fee min'),('fee_max','Event fee max'),('fixed_mandatory','Additional mandatory fixed charges'),('minimum_spend','Mandatory spend floor'),('ceremony_fee','Additional ceremony fee'),('deposit_refundable','Refundable damage/security deposit'),('booking_credit','Booking payment credited to fee'),('cleaning_fee','Separate cleaning charge')])+
 rows('Costs','USD/guest',[('food_min','Food min / guest'),('food_max','Food max / guest'),('bar_min','Bar min / guest'),('bar_max','Bar max / guest'),('package_min','Combined package min / guest'),('package_max','Combined package max / guest'),('fb_minimum','Food/bar minimum / guest')])+
 rows('Costs','percent',[('service_pct','Service/admin charge'),('tax_pct','Tax rate')])+
 rows('Costs','hours',[('rental_hours','Included rental hours'),('minimum_rental_hours','Minimum rental hours'),('bar_hours','Included bar hours')])+
 rows('Costs','USD/hour',[('hourly_fee','Venue hourly fee'),('overtime_hourly','Overtime hourly charge'),('security_hourly','Security hourly charge'),('staff_hourly','Required staff hourly charge')])+
 rows('Time cutoffs','event_day_minutes',[('music_indoor','Indoor music cutoff'),('music_outdoor','Outdoor music cutoff'),('bar_end','Bar cutoff'),('event_end','Event end'),('guest_departure','Guest departure'),('cleanup_end','Cleanup / load-out deadline'),('load_in','Vendor load-in start')])+
 rows('Amenities','count',[('parking_spaces','Parking spaces'),('lodging_rooms','Lodging rooms'),('beds','Beds'),('toilets','Toilets'),('chairs','Included chairs'),('tables','Included tables'),('security_count','Required security staff'),('staff_count','Required staff')])+
 rows('Amenities','hours',[('staff_hours','Staff hours / event')])+
 rows('Amenities','square_feet',[('area_sqft','Event area')])+rows('Amenities','acres',[('land_acres','Property acreage')])+rows('Amenities','USD/vehicle',[('parking_cost','Parking charge')])+
 rows('Travel','minutes',[('hotel_minutes','Hotel travel time'),('airport_minutes','Airport travel time')])+rows('Travel','miles',[('hotel_miles','Hotel distance'),('airport_miles','Airport distance')])+
 rows('History','year',[('construction_year','Construction year'),('wedding_opening_year','First wedding-operation year'),('operator_start_year','Current operator start year')])+
 rows('Valuation','USD',[('assessment_total','Assessed value'),('property_asking','Property asking price'),('business_asking','Business asking price'),('closed_sale','Reported closed-sale price'),('property_appraisal_min','Property market value min'),('property_appraisal_max','Property market value max'),('business_value_min','Operating-business value min'),('business_value_max','Operating-business value max')]))
for k,label,choices in [('outside_catering','Outside catering',['yes','no','approved_only','conditional']),('byob','BYOB',['yes','no','beer_wine_only','conditional']),('tables_included','Tables included',['yes','no','conditional']),('chairs_included','Chairs included',['yes','no','conditional']),('dance_floor','Dance floor included',['yes','no','conditional']),('wedding_permission','Wedding permission',['advertised','explicit_no','confirmed']),('availability','Operating status',['closed','restricted','advertised_active']),('accessibility','Accessible guest route',['yes','no','conditional']),('food_basis','Food/package basis',['food_only','food_bar_combined','service_only','venue_only','mixed_or_conditional'])]:
 FIELDS.append({'id':k,'label':label,'group':'Policies','type':'category','unit':None,'choices':choices})
FIELDS+=rows('Amenities','count',[('restrooms','Restroom rooms'),('bedrooms','Lodging bedrooms'),('lodging_units','Lodging units (rooms/cabins/tents)')])+rows('Valuation','USD',[('recorded_transfer','Parcel recorded-transfer price'),('broker_property_estimate','Broker property allocation estimate'),('broker_business_estimate','Broker business allocation estimate'),('combined_asking','Combined property/business asking price')])+rows('Valuation','year',[('assessment_year','Assessment roll year')])+rows('Costs','USD/guest',[('service_package_min','Service-only package min / guest'),('service_package_max','Service-only package max / guest'),('venue_per_guest_min','Venue-only min / guest'),('venue_per_guest_max','Venue-only max / guest')])+rows('Costs','USD/event',[('venue_minimum','Minimum venue rental charge')])
FIELDS+=rows('Overnight stays','people',[('sleep_capacity','Overnight guest capacity'),('included_overnight_guests','Included overnight guests')])+rows('Overnight stays','units',[('included_lodging_units','Included lodging units'),('required_lodging_units','Required lodging units'),('late_night_required_units','Lodging units required for late night')])+rows('Overnight stays','nights',[('lodging_min_nights','Minimum required lodging nights'),('included_lodging_nights','Included lodging nights')])+rows('Overnight stays','unit_nights',[('required_lodging_unit_nights','Minimum required unit-nights')])+rows('Overnight stays','USD/unit/night',[('lodging_nightly_min','Nightly lodging reference min'),('lodging_nightly_max','Nightly lodging reference max')])+rows('Overnight stays','USD/event',[('lodging_total_min','Mandatory lodging total min'),('lodging_total_max','Mandatory lodging total max')])+rows('Overnight stays','percent',[('lodging_service_pct','Lodging service charge'),('lodging_tax_pct','Lodging tax reference')])
FIELDS+=rows('Costs','hours',[('security_min_hours','Minimum billable hours per guard')])
for k,label,choices in [('lodging_requirement','Lodging obligation',['included_required','required_extra','required_unallocated','optional','conditional','no_overnight']),('lodging_in_venue_fee','Lodging included in venue fee',['yes','no','conditional']),('lodging_payer','Contracted lodging payer',['host','guests_direct','shared','conditional'])]:
 FIELDS.append({'id':k,'label':label,'group':'Overnight stays','type':'category','unit':None,'choices':choices})
for f in FIELDS:
 if f['id']=='lodging_requirement':f['value_labels']={'included_required':'Included in this package','required_extra':'Required, charged separately','required_unallocated':'Required; price allocation unknown','optional':'Optional','conditional':'Depends on chosen offer','no_overnight':'Overnight use not allowed'}
 if f['id']=='lodging_in_venue_fee':f['value_labels']={'yes':'Included','no':'Not included','conditional':'Depends on chosen offer'}
 if f['id']=='lodging_payer':f['value_labels']={'host':'Host pays','guests_direct':'Guests book and pay directly','shared':'Shared contractual obligation','conditional':'Depends on agreement'}
 if f.get('unit')=='unit_nights':f['unit']='unit-nights'
DEFS={f['id']:f for f in FIELDS}
STATUSES={'not_yet_extracted':'Not yet extracted / researched','searched_no_public_answer':'Searched — no reliable public answer','needs_confirmation':'Requires venue confirmation','conflicting':'Conflicting evidence','published_evidence':'Published evidence','current_written':'Current written confirmation','not_applicable':'Not applicable'}
def clean(s):return re.sub(r'\s+',' ',str(s or '')).strip()
def nval(x):return x if isinstance(x,(int,float)) and not isinstance(x,bool) and x>=0 else None
def norm(s):return re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip()
def digest(s):return hashlib.sha256(s.encode()).hexdigest()[:16]
def status(a):
 if not a or a.get('answer') is None or not clean(a.get('answer')):return 'not_yet_extracted'
 text=clean(a['answer']);meta=clean(a.get('status'))
 if re.search(r'^(not applicable|n/?a)\b',text,re.I):return 'not_applicable'
 if re.search(r'\b(conflict|inconsistent|disagree|contradict)',text+' '+meta,re.I):return 'conflicting'
 if re.search(r'PROPOSED|adoption.*Unknown',text):return 'needs_confirmation'
 if re.search(r'(searched|reviewed).{0,90}(no reliable|no published|not disclosed|not found)',text,re.I):return 'searched_no_public_answer'
 if re.search(r'^(unknown|not (?:yet )?(?:verified|established)|pending)',text,re.I):return 'needs_confirmation' if a.get('source_urls') else 'not_yet_extracted'
 return 'published_evidence' if a.get('source_urls') else 'needs_confirmation'
OLD=D.get('normalized',{});PROPS=OLD.get('properties',{});KEYS={p['registry_key']:pid for pid,p in PROPS.items()};RECORDS={};QUEUE=[]
def fact(v,out,key,value,path,method='structured',note=None,precision='exact'):
 if value is None:return
 prev=out['facts'].get(key)
 f={'value':value,'status':'published_evidence','ref':path,'method':method,'precision':precision,'effective_date':None,'scope_record_id':v['id']}
 if note:f['note']=note
 if isinstance(path,list) and len(path)>1 and path[0]=='workbook_answers':
  a=v['workbook_answers'].get(path[1]);st=status(a)
  if st=='conflicting':f['status']='conflicting'
 if prev and prev.get('value') is not None and prev['value']!=value:
  out['facts'][key]={'value':None,'status':'conflicting','alternatives':[prev,f],'scope_record_id':v['id']};return
 out['facts'][key]=f
def hold(v,out,key,path,reason):
 if key not in out['facts']:out['facts'][key]={'value':None,'status':'needs_confirmation','ref':path,'note':reason,'scope_record_id':v['id']}
 QUEUE.append({'record_id':v['id'],'field':key,'ref':path,'reason':reason})
def clock(text):
 t=clean(text)
 if re.search(r'\b(unknown|conflict|not separately|not explicit|not.*stated|sundown|sunset|weekend|fri|satur|sun.?thu|sunday|season|otherwise|subject|this record)',t,re.I):return None
 lead=t.split(';')[0]
 if not re.match(r'^(?:(?:all amplified sound|activity/music|contract music|music|guests?|cleanup|load.out|bar service)[^\d]{0,24})?(?:midnight|\d)',lead,re.I):return None
 if re.match(r'^midnight\b',lead,re.I):return None if re.search(r'requires|not|unknown',lead,re.I) else 1440
 times=re.findall(r'(?<![\d:])(1[0-2]|[1-9])(?:[:.]([0-5]\d))?\s*([ap])\.?\s*m\.?\b',lead,re.I)
 vals={(int(h)%12+(12 if ap.lower()=='p' else 0))*60+int(m or 0) for h,m,ap in times}
 if len(vals)!=1:return None
 val=vals.pop()
 if val<360 and re.search(r'extend|late|next.day|after.party|overnight',t,re.I):val+=1440
 return val
def simple_money(text):
 # An anchored range on a fee-specific answer; no tier/day/hour/occupancy reinterpretation.
 m=re.match(r'^\s*\$([\d,]+(?:\.\d+)?)\s*(?:[–−-]\s*\$?([\d,]+(?:\.\d+)?))?',text)
 return (float(m[1].replace(',','')),float((m[2] or m[1]).replace(',',''))) if m else None
WB={
 'capacity_dinner_dance':'capacity-and-layout-dinner-plus-dance-capacity','capacity_rain_backup':'weather-and-continuity-backup-dinner-dance-capacity','capacity_ceremony':'capacity-and-layout-ceremony-seated-count',
 'food_min':'price-and-per-head-comparison-food-per-head-low-high','bar_min':'price-and-per-head-comparison-bar-per-head-low-high','fee_min':'price-and-per-head-comparison-venue-fee-low-high',
 'music_indoor':'time-cut-off-indoor-music-deadline','music_outdoor':'time-cut-off-outdoor-music-deadline','bar_end':'time-cut-off-bar-service-deadline','guest_departure':'time-cut-off-guest-departure-deadline','cleanup_end':'time-cut-off-cleanup-load-out-deadline','event_end':'time-cut-off-guest-event-start-end',
 'parking_spaces':'arrival-and-travel-parking-count-and-costs','lodging_rooms':'arrival-and-travel-lodging-room-counts','chairs':'included-equipment-chair-styles-and-quantities','tables':'included-equipment-table-sizes-and-quantities','toilets':'access-and-guest-comfort-restroom-count-and-condition',
 'area_sqft':'capacity-and-layout-floor-plan-and-dimensions','hotel_minutes':'arrival-and-travel-hotel-travel-time-and-date-basis','airport_minutes':'arrival-and-travel-airport-travel-time-and-basis',
 'deposit_refundable':'price-and-per-head-comparison-refundable-security-deposit-separate','service_pct':'price-and-per-head-comparison-service-admin-charge-base','tax_pct':'price-and-per-head-comparison-tax-and-charge-treatment',
 'minimum_spend':'price-and-per-head-comparison-mandatory-spend-floor','outside_catering':'vendor-freedom-outside-caterer-permission','byob':'alcohol-and-bar-byob-terms','accessibility':'access-and-guest-comfort-continuous-accessible-guest-route'}
for v in D['venues']:
 label=v.get('parent_property') or v['name'];registry_key=v['county']+'|'+norm(label)
 pid=(OLD.get('records',{}).get(v['id']) or {}).get('property_id') or KEYS.get(registry_key)
 if not pid:pid='property-'+digest(registry_key);KEYS[registry_key]=pid;PROPS[pid]={'id':pid,'registry_key':registry_key,'name':label,'county':v['county'],'identity_status':'provisional_label_group','record_ids':[],'identity_notes':'Stable identifier for the current source grouping; not verified ownership, unique property or nonoverlapping rentable inventory.'}
 if v['id'] not in PROPS[pid]['record_ids']:PROPS[pid]['record_ids'].append(v['id'])
 kind=v.get('record_kind','');out={'property_id':pid,'space_id':'space-'+digest(v['id']),'entity_type':'configuration' if re.search('configur|package',kind,re.I) else 'group' if re.search('group|aggregate',kind,re.I) else 'property' if kind=='Property' else 'space','facts':{},'workbook_status':{k:status(a) for k,a in v['workbook_answers'].items() if a is not None},'review_checks':{}}
 for key,path in [('capacity_seated',['seated_capacity']),('capacity_standing',['standing_capacity']),('construction_year',['construction_year']),('wedding_opening_year',['wedding_opening_year']),('operator_start_year',['current_operator_since'])]:
  val=v.get(path[0]);val=int(val) if isinstance(val,str) and re.fullmatch(r'\d{4}',val) else val
  if nval(val) is not None:fact(v,out,key,val,path)
 caps=[v.get(k) for k in ['seated_capacity','standing_capacity','generic_capacity']]+list((v.get('published_capacity') or {}).values())
 caps=[x for x in caps if nval(x) is not None and x>0]
 if caps:fact(v,out,'capacity_max',max(caps),['capacity_description'],'structured_max','Maximum of record-level structured capacity alternatives; never a sum. Layout and approval remain qualified.')
 for key,sub in [('capacity_indoor','indoor'),('capacity_outdoor','outdoor')]:
  if nval((v.get('published_capacity') or {}).get(sub)) is not None:fact(v,out,key,v['published_capacity'][sub],['published_capacity',sub],note='Layout/conditions from original record; not necessarily dinner + dance.')
 price=v.get('price') or {}
 for key,src in [('fee_min','event_low'),('fee_max','event_high'),('package_min','per_head_low'),('package_max','per_head_high'),('ceremony_fee','ceremony_fee')]:
  if nval(price.get(src)) is not None:fact(v,out,key,price[src],['price',src],note=price.get('basis'))
 for key,wid in WB.items():
  a=v['workbook_answers'].get(wid)
  if not a or not a.get('answer'):continue
  t=clean(a['answer']);path=['workbook_answers',wid];st=status(a)
  if st in ['conflicting','searched_no_public_answer','not_applicable']:
   if key not in out['facts']:out['facts'][key]={'value':None,'status':st,'ref':path,'scope_record_id':v['id']}
   continue
  if re.search(r'^(Unknown|not yet|pending)',t,re.I):
   if key not in out['facts']:out['facts'][key]={'value':None,'status':st,'ref':path,'scope_record_id':v['id']}
   continue
  if key=='capacity_dinner_dance':
   m=re.search(r'\b(\d{1,4})\s*(?:dine-and-dance|dinner\s*\+\s*dance|with dance floor)',t,re.I)
   if m and not re.search(r'unknown|not automatic|not approved|noapproved|does not|do not|without',t,re.I):fact(v,out,key,int(m[1]),path,'reviewed_capacity_pattern','Published dinner/dance layout; current event-specific approval still required.')
   elif re.search(r'\d',t):hold(v,out,key,path,'Published seating/generic count is not an unambiguous dinner + dance layout.')
  elif key=='capacity_rain_backup':
   # Explicit dinner/dance backup is required, not a smaller tent or generic rain option.
   m=re.search(r'^(\d+) (?:guests? )?(?:dinner.and.dance|dine.and.dance)',t,re.I)
   if m:fact(v,out,key,int(m[1]),path,'explicit_backup_layout')
   elif re.search(r'\d',t):hold(v,out,key,path,'Backup number has layout, season, fee or scope qualifications; no full-guest rain capacity inferred.')
  elif key in ['music_indoor','music_outdoor','bar_end','guest_departure','cleanup_end']:
   val=clock(t)
   if val is not None and not re.search(r'not.*(?:music|deadline)|after \d|hard stop.*requires|exact.*unknown|indoor.outdoor wording',t,re.I):fact(v,out,key,val,path,'reviewed_clock','Minutes after event-day midnight; preserve contractual/seasonal conditions. Midnight deadline = 1440, late-night 2 AM = 1560 when explicitly an extension.')
   elif re.search(r'\d|midnight|sunset|sundown',t,re.I):hold(v,out,key,path,'Multiple/conditional clocks or non-clock deadline; not substituted from access hours or other rooms.')
  elif key in ['food_min','bar_min']:
   money=simple_money(t)
   if money and re.search(r'food only|food-only',t,re.I) and not re.search(r'not food.only|food and bar|food/bar|F&B',t,re.I):
    for suffix,val in zip(['min','max'],money):fact(v,out,'food_'+suffix,val,path,'explicit_food_only_range',note=t)
   elif key=='food_min' and t.startswith('$72/person published dinner catering'):
    fact(v,out,'food_min',72,path,'explicit_food_only');fact(v,out,'food_max',72,path,'explicit_food_only')
   elif re.search(r'\d',t):hold(v,out,key,path,'Combined package, multiple menu tiers, regulatory fee or service-only charge must not be treated as a food/bar-only price.')
  elif key=='fee_min' and 'fee_min' not in out['facts']:
   money=simple_money(t)
   if money and re.search(r'\b(space fee|base venue rental|venue.only)',t,re.I) and not re.search(r'per hour|/hour|hourly|tier|proposed|mapping|conflict',t,re.I):
    fact(v,out,'fee_min',money[0],path,'explicit_event_fee_range');fact(v,out,'fee_max',money[1],path,'explicit_event_fee_range')
   elif re.search(r'\d',t):hold(v,out,key,path,'Hourly/tier/season/day/eligibility range or uncertain room mapping; no universal event fee inferred.')
  elif key=='service_pct':
   vals=set(float(x) for x in re.findall(r'(\d+(?:\.\d+)?)\s*%',t))
   if len(vals)==1 and not re.search(r'conflict|varies|versus|different',t,re.I):fact(v,out,key,vals.pop(),path,'explicit_single_percentage',note='Charge base/applicability retained in source; scenario does not apply automatically without a selected charge base.')
   elif vals:hold(v,out,key,path,'More than one percentage or uncertain service-charge basis.')
  elif key in ['chairs','tables','lodging_rooms','toilets','parking_spaces','area_sqft']:
   patterns={'chairs':r'^(\d+)\s+(?:included\s+)?chairs\b','tables':r'^(\d+)\s+(?:included\s+)?tables\b','lodging_rooms':r'^(\d+)\s+(?:guest\s+)?rooms\b','toilets':r'^(\d+)\s+(?:individual\s+)?toilets\b','parking_spaces':r'^(\d+)\s+(?:parking(?:-lot)?\s+)?spaces\b','area_sqft':r'^([\d,]+)\s*(?:square feet|sq\.?\s*ft\.?)\b'}
   m=re.match(patterns[key],t,re.I)
   if m and not re.search(r'unknown|not included|shared|plus|unverified|approx|about|more than',t,re.I):fact(v,out,key,int(m[1].replace(',','')),path,'explicit_unit_count')
   elif re.search(r'\d',t):hold(v,out,key,path,'Inventory, shared scope, ranges or unit distinctions require review; no unsupported total.')
  elif key in ['outside_catering','byob','accessibility']:
   val=None
   if re.search(r'unknown|not established|not verified|unverified',t,re.I):val=None
   elif re.search(r'unless|exception|subject to|conditional',t,re.I):val='conditional'
   elif re.match(r'^(yes|allowed|permitted)\b',t,re.I) and not re.search(r'only|unless|subject|except|approval|conditional',t,re.I):val='yes'
   elif re.match(r'^No[.!]?$',t,re.I) or key=='outside_catering' and re.match(r'^(?:no outside cater|outside cater[^.;!?]*(?:prohibited|not allowed))',t,re.I) or key=='byob' and re.match(r'^No (?:outside alcohol|alcohol|BYOB)',t,re.I):val='no'
   elif key=='outside_catering' and re.search(r'approved (?:outside )?caterers? (?:only|required)|approved caterer list required|required caterer list|in.house menus or approved outside vendors',t,re.I):val='approved_only'
   elif re.search(r'conditional|subject to|approval|exception',t,re.I):val='conditional'
   if val:fact(v,out,key,val,path,'explicit_policy_category')
   else:hold(v,out,key,path,'Policy statement does not support an unconditional Yes or No.')
  elif key=='deposit_refundable':
   money=simple_money(t)
   amounts={float(x.replace(',','')) for x in re.findall(r'\$\s*([\d,]+(?:\.\d+)?)',t)}
   if money and money[0]==money[1] and len(amounts)==1 and re.search(r'refundable',t,re.I) and not re.search(r'non.?refund',t,re.I):fact(v,out,key,money[0],path,'explicit_refundable_deposit','Cash requirement only; excluded from event expense.')
   elif money:hold(v,out,key,path,'Multiple deposit/payment amounts or tier conditions; booking credits are not refundable security deposits.')
  elif key=='minimum_spend':
   money=simple_money(t)
   if money and money[0]==money[1] and not re.search(r'per|guest|day|season|varies',t,re.I):fact(v,out,key,money[0],path,'explicit_spend_floor','A floor is not an extra fee; applicable component base must be selected.')
 # Limited explicit equipment flags. Silence is not No; paid/conditional equipment stays qualified.
 inc=clean(v.get('included_items'))
 for key,word in [('tables_included','tables'),('chairs_included','chairs'),('dance_floor','dance floor')]:
  if re.search(r'\b'+word+r'\b',inc,re.I):
   if re.search(r'not included|not supplied|additional|extra|rental|unknown|confirm|conditional',inc,re.I):fact(v,out,key,'conditional',['included_items'],'qualified_equipment_statement')
   elif re.search(r'included|provided|supplied',inc,re.I):fact(v,out,key,'yes',['included_items'],'explicit_equipment_statement')
 permission=clean(v.get('wedding_permission'))
 if re.match(r'Advertised|Operator advertises',permission,re.I):fact(v,out,'wedding_permission','advertised',['wedding_permission'],'advertising_not_event_approval')
 elif re.match(r'No weddings|Weddings (?:not allowed|prohibited)|Not available for weddings',permission,re.I):fact(v,out,'wedding_permission','explicit_no',['wedding_permission'],'explicit_wedding_prohibition')
 if re.search(r'closed',v.get('booking_status',''),re.I):fact(v,out,'availability','closed',['booking_status'])
 elif re.search(r'restrict',v.get('booking_status',''),re.I):fact(v,out,'availability','restricted',['booking_status'])
 # Brochure hours are duration, not clock times. Only an explicit single included-hours statement is lifted.
 basis=clean(price.get('basis'))
 m=re.search(r'\b(\d+(?:\.\d+)?)\s*[- ]?hour\s+(?:base|rental|block|venue)',basis,re.I)
 if m:fact(v,out,'rental_hours',float(m[1]),['price','basis'],'explicit_rental_duration')
 if re.search(r'venue[- ](?:rate[- ])?only',basis,re.I):fact(v,out,'food_basis','venue_only',['price','basis'])
 elif price.get('per_head_low') is not None and re.search(r'service.only|excludes actual food|food excluded',basis,re.I):fact(v,out,'food_basis','service_only',['price','basis'])
 elif price.get('per_head_low') is None and re.search(r'venue.only|excludes food|food.*excluded',basis,re.I):fact(v,out,'food_basis','venue_only',['price','basis'])
 elif re.search(r'food.only|food only',basis,re.I) and not re.search(r'not food.only',basis,re.I):fact(v,out,'food_basis','food_only',['price','basis'])
 elif price.get('per_head_low') is not None and re.search(r'food.?bar|food.?beverage|F&B',basis,re.I):fact(v,out,'food_basis','food_bar_combined',['price','basis'])
 if re.search(r'service.only|excludes actual food|food excluded',basis,re.I):
  for tail in ['min','max']:
   if 'package_'+tail in out['facts']:out['facts']['service_package_'+tail]=out['facts'].pop('package_'+tail)
 if re.search(r'venue[- ](?:rate[- ])?only',basis,re.I):
  for tail in ['min','max']:
   if 'package_'+tail in out['facts']:out['facts']['venue_per_guest_'+tail]=out['facts'].pop('package_'+tail)
 if re.search(r'(?:F&B|food.?beverage|food.?bar).{0,30}minimum|minimum.{0,30}(?:F&B|food.?beverage|food.?bar)',basis,re.I):
  if 'package_min' in out['facts']:out['facts']['fb_minimum']=out['facts'].pop('package_min')
  out['facts'].pop('package_max',None)
 # Property/land and operating business values stay separate; never add transaction/assessment repeats.
 parcels=v.get('parcel_evidence') or []
 if len(parcels)==1:
  av=parcels[0].get('assessor_fields',{}).get('Value601TotalLI')
  if nval(av) is not None:fact(v,out,'assessment_total',av,['parcel_evidence',0],'single_parcel_assessment','Single matching parcel, not full property/business market value. Tax year and component caveats retained.')
 for platform,r in v.get('reviews',{}).items():
  out['review_checks'][platform]={'status':'published_evidence' if r.get('rating') is not None and r.get('review_url') else 'not_yet_extracted','note':'Recorded source aggregate; check date/scope retained.' if r.get('rating') is not None else 'No independently checked numeric profile recorded. Missing does not mean unavailable.'}
 RECORDS[v['id']]=out

# Explicitly reviewed narrative overrides. These do not change original text or resolve current permission.
OVERRIDES=[]
for v in D['venues']:
 out=RECORDS[v['id']];name=v['name'];parent=v.get('parent_property') or ''
 if v['id'].startswith('argonaut-hotel-maritime-room'):
  path=['workbook_answers',WB['capacity_dinner_dance']];fact(v,out,'capacity_dinner_dance',90,path,'manually_reviewed_2025_package','2025 package; general banquet125 is a different layout; current approval Unknown.')
 if parent=='V. Sattui Winery' and name in ['Barrel Cellar / Barrel Room','Matrimonio evening package']:
  fact(v,out,'capacity_dinner_dance',170,['workbook_answers',WB['capacity_dinner_dance']],'manually_reviewed_packet','2026 packet170withdance versus200without; issued occupancy not reviewed.')
 # Reviewed direct counts; item types and shared/seasonal scope remain in the referenced text.
 table=v['workbook_answers'].get(WB['tables'])
 if table and re.match(r'^\d+ picnic tables\b',table.get('answer','')):
  fact(v,out,'tables',int(re.match(r'^(\d+)',table['answer'])[1]),['workbook_answers',WB['tables']],'reviewed_picnic_inventory','Picnic tables, not banquet rounds; no extra occupancy inferred.')
 if name=='Brazilian Room':
  fact(v,out,'chairs',150,['workbook_answers',WB['chairs']],'manually_reviewed_inventory','150foldingchairs; four high chairs and two boosters not counted as adult folding chairs.')
  fact(v,out,'tables',49,['workbook_answers',WB['tables']],'manually_reviewed_inventory','49tables across mixed dimensions; not49banquetrounds. Original inventory types retained.')
  fact(v,out,'parking_spaces',34,['workbook_answers',WB['parking_spaces']],'manually_reviewed_parking','Parking-lot spaces only;36+street spaces are separate, shared and not guaranteed.')
 if name=='Muir Woods Park Community Association Clubhouse':
  for key,val in [('chairs',75),('tables',10),('parking_spaces',40),('restrooms',2)]:
   ref=WB.get(key,'access-and-guest-comfort-restroom-count-and-condition')
   fact(v,out,key,val,['workbook_answers',ref],'manually_reviewed_inventory','Published inventory; parking approximate40lowerlot, two ADA spaces upstairs not added; two restroom rooms not toilet-fixture count.',precision='approximate' if key=='parking_spaces' else 'exact')
 if name=='Wildhaven Sonoma':
  fact(v,out,'lodging_units',47,['workbook_answers',WB['lodging_rooms']],'manually_reviewed_lodging','40tents+7cabins; not47hotelrooms. Occupancy, buyout and availability remain qualified.')
  fact(v,out,'beds',80,['workbook_answers',WB['lodging_rooms']],'manually_reviewed_lodging','66queen+14twin beds; not80guests or wedding capacity.')
 if name=='Straus Home Ranch':
  fact(v,out,'bedrooms',4,['workbook_answers',WB['lodging_rooms']],'manually_reviewed_lodging','Four farmhouse bedrooms; not a bed count or reception capacity.')
  fact(v,out,'parking_spaces',40,['workbook_answers',WB['parking_spaces']],'manually_reviewed_parking','Approximately40vehicles; shuttle mandate at75+guests remains.',precision='approximate')
 asecurity=v['workbook_answers'].get('labor-and-responsibilities-security-requirements')
 if asecurity and '$40/hour/officer' in asecurity.get('answer',''):
  fact(v,out,'security_hourly',40,['workbook_answers','labor-and-responsibilities-security-requirements'],'reviewed_security_unit_rate','Per officer-hour; guard count, before/after hours, alcohol and district discretion remain separate. Not a total cost.')
 afee=v['workbook_answers'].get(WB['fee_min']);ft=(afee or {}).get('answer','')
 m=re.match(r'^FY2024/25 PROPOSED schedule: \$([\d,]+(?:\.\d+)?)/hour\.',ft)
 if m:
  fact(v,out,'hourly_fee',float(m[1].replace(',','')),['workbook_answers',WB['fee_min']],'reviewed_proposal_unit_rate','Historical proposed rate only; adoption/current applicability Unknown. Scenario excludes this rate unless a user supplies their own assumption.')
  out['facts']['hourly_fee']['status']='needs_confirmation'
 if name=='Olde Vet’s Hall — Bud’s Pub & Grill':
  fact(v,out,'fixed_mandatory',250,['workbook_answers',WB['fee_min']],'manually_reviewed_setup_cleaning','One combined setup/cleaning charge. Other mandatory charges may remain; do not add this250again as separate cleaning.')
 if (v.get('price') or {}).get('basis','').startswith('VENUE RATE ONLY whole museum, $2,000 minimum; $650 cleaning'):
  fact(v,out,'venue_minimum',2000,['price','basis'],'manually_reviewed_venue_floor','Minimum venue charge, not a food/bar floor or added fee.')
  fact(v,out,'cleaning_fee',650,['price','basis'],'manually_reviewed_cleaning','Separate published cleaning charge; not food or bar.')
  fact(v,out,'rental_hours',4,['price','basis'],'manually_reviewed_duration','Four event hours, not setup/cleanup duration or clock cutoff.')
 adeposit=v['workbook_answers'].get(WB['deposit_refundable'])
 if adeposit and adeposit.get('answer','').startswith('$100 date-hold applied to rental or refunded if not rented; cleaningdeposit$200 refundable'):
  fact(v,out,'booking_credit',100,['workbook_answers',WB['deposit_refundable']],'manually_reviewed_payment_credit','Applied to rental; not an extra rental expense. Refund rule is separate from cleaning deposit.')
  fact(v,out,'deposit_refundable',200,['workbook_answers',WB['deposit_refundable']],'manually_reviewed_cleaning_deposit','Cleaning deposit200separate from100crediteddatehold; current terms confirm.')
 # Separate scalar property broker ask from appraisal/business allocation and recorded transfers.
 if nval(v.get('asking_price')) is not None:
  if v.get('broker_value_claims'):
   b=v['broker_value_claims'];fact(v,out,'broker_property_estimate',b.get('property_estimate_usd'),['broker_value_claims'],'broker_property_allocation','Broker property allocation, not market appraisal or a separate property asking price.')
   fact(v,out,'broker_business_estimate',b.get('business_estimate_usd'),['broker_value_claims'],'broker_business_allocation','Broker business allocation, not earnings-based value; allocations disagree with combined ask.')
   fact(v,out,'combined_asking',b.get('combined_asking_price_usd'),['broker_value_claims'],'combined_broker_ask','Combined property/business asking price; differs from broker allocation sum. No separate standalone asking prices established.')
  else:fact(v,out,'property_asking',v['asking_price'],['asking_price'],'broker_ask','Asking price and asset scope only; not current appraisal or completed sale.')
 parcels=v.get('parcel_evidence') or []
 if len(parcels)==1:
  a=parcels[0]
  fact(v,out,'assessment_year',a.get('assessor_fields',{}).get('Value601RollYear'),['parcel_evidence',0],'single_parcel_roll')
  fact(v,out,'recorded_transfer',a.get('county_recorded_sale_price_usd'),['parcel_evidence',0],'single_parcel_recorded_transfer','Recording is not exact closing; multi-parcel transaction flags/scope retained. Repeated values cannot be summed.')
 # Explicit two-AM late music is limited to the Glasshouse record, not other resort rooms.
 amusic=v['workbook_answers'].get(WB['music_indoor'])
 if amusic and amusic.get('answer','').startswith('Operator states Glasshouse Barn event may extend to 2 AM'):
  fact(v,out,'music_indoor',1560,['workbook_answers',WB['music_indoor']],'manually_reviewed_late_extension','2AM next event day, only with paid contracted extension; current event-specific/legal approval not established.')
 for i,obs in enumerate(v.get('research_observations',[])):
  if obs.get('field') in DEFS and obs.get('status')=='published_evidence' and (nval(obs.get('value')) is not None or (DEFS[obs['field']]['type']=='category' and obs.get('value') in DEFS[obs['field']].get('choices',[]))):
   fact(v,out,obs['field'],obs['value'],['research_observations',i],'manually_reviewed_directory_profile' if obs.get('source_kind')=='directory_profile' else 'manually_reviewed_primary_operator',obs.get('basis'))
 # A dated, sourced negative search result is distinct from a field never researched.
 # Never let a negative attempt erase an existing numeric observation.
 for i,attempt in enumerate(v.get('research_attempts',[])):
  key=attempt.get('field');st=attempt.get('status');prev=out['facts'].get(key,{})
  if key in DEFS and st in ('searched_no_public_answer','conflicting') and attempt.get('source_urls') and attempt.get('checked_utc') and prev.get('value') is None:
   if prev.get('status')=='conflicting' and st!='conflicting':continue
   out['facts'][key]={**prev,'value':None,'status':st,'ref':['research_attempts',i],'method':'documented_source_review','note':attempt.get('source_text'),'scope_record_id':v['id']}
 # Food-only menu tiers deliberately bounded as menu alternatives, not a single quote.
 a=v['workbook_answers'].get(WB['food_min'])
 if a and a.get('answer','').startswith('$64 plated dinner / $72 family style / $80 house buffet / $95 premium buffet; FOOD ONLY'):
  for key,val in [('food_min',64),('food_max',95)]:fact(v,out,key,val,['workbook_answers',WB['food_min']],'manually_reviewed_food_tiers','2025-labelled menu alternatives; tax/service/bar/venue excluded.')
 if a and a.get('answer','').startswith('2026 full menu starts $175/person, FOOD ONLY'):
  fact(v,out,'food_min',175,['workbook_answers',WB['food_min']],'manually_reviewed_starting_food_price','Starting menu only; upper bound Unknown.')
 # No current market appraisal was established in the source dataset.
 for key in ['property_appraisal_min','property_appraisal_max','business_value_min','business_value_max']:
  out['facts'].setdefault(key,{'value':None,'status':'needs_confirmation','ref':['value_status'],'scope_record_id':v['id'],'note':'No verified current market appraisal/earnings valuation established; broker asks and tax assessments are separate.'})

# Stable source grouping and a separate unresolved-alias review list. No automatic fuzzy merge.
aliases=[]
byurl=collections.defaultdict(list)
for v in D['venues']:
 u=v.get('operator_url') or v.get('venue_url') or ''
 if u:byurl[u.rstrip('/')].append(RECORDS[v['id']]['property_id'])
for u,ids in byurl.items():
 ids=sorted(set(ids))
 if len(ids)>1:aliases.append({'source_url':u,'property_ids':ids,'status':'needs_identity_review','note':'Shared URL can be a directory/campus rather than one property; do not auto-merge.'})
for attempt in D.get('review_research_log',[]):
 if attempt['record_id'] in RECORDS:RECORDS[attempt['record_id']]['review_checks'][attempt['platform']]=attempt
QUEUE=[q for q in QUEUE if RECORDS[q['record_id']]['facts'].get(q['field'],{}).get('value') is None or RECORDS[q['record_id']]['facts'].get(q['field'],{}).get('status')=='conflicting']
NORMAL={'version':1,'normalized_utc':NOW,'default_status':'not_yet_extracted','statuses':STATUSES,'fields':FIELDS,'properties':PROPS,'records':RECORDS,'identity_candidates':aliases,'review_queue':QUEUE,'method':'Original venue fields remain unchanged. Facts reference original record paths for verbatim text, source URLs/status and dates. No inferred numeric values from unqualified narrative; no title/ownership verification claimed.'}
D['normalized']=NORMAL
(ROOT/'research.json').write_text(json.dumps(D,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
summary={'normalized_utc':NOW,'record_count':len(RECORDS),'property_group_count':len(PROPS),'identity_review_candidates':len(aliases),'numeric_review_queue':len(QUEUE),'field_count':len(FIELDS),'known_by_field':{f['id']:sum(r['facts'].get(f['id'],{}).get('value') is not None for r in RECORDS.values()) for f in FIELDS},'status_counts':dict(collections.Counter(x['status'] for r in RECORDS.values() for x in r['facts'].values())),'original_fields':'preserved; no new source verification by normalization'}
(ROOT/'normalization-audit.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
print(json.dumps(summary))
