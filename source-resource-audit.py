"""Inventory research links and documents; a generic View Now is not a disposable label."""
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,parse_qs
import re,json,sys
from pathlib import Path

PUBLICATION_HOSTS=('mydigitalpublication.com','issuu.com','fliphtml5.com','flipsnack.com','joomag.com','calameo.com','publuu.com','3dissue.com','zmags.com','heyzine.com','flippingbook.com','pubhtml5.com')
def usable_download(status,body,content_length=None,limit=None):
 return status==200 and bool(body.strip()) and (content_length is None or len(body)==content_length) and (limit is None or len(body)<limit)
def classify(url,label='',context='',tag='a',rel=''):
 p=urlsplit(url);text=' '.join([label,context]).lower();query=parse_qs(p.query)
 if p.scheme not in ('http','https'):return None
 if re.search(r'\b(submit|send|request)\b.*\b(rfp|inquiry|quote|availability)\b|\bbook\s+(?:now|a tour)\b',label,re.I):return 'outbound_form'
 if any((p.hostname or '')==host or (p.hostname or '').endswith('.'+host) for host in PUBLICATION_HOSTS):return 'interactive_publication'
 if p.path.lower().endswith('.pdf'):return 'pdf_document'
 if tag in ('iframe','embed','object'):
  return None if 'googletagmanager.com' in (p.hostname or '') else 'embedded_resource'
 if 'next' in rel or any(k in query for k in ('_p','page','paged')) or re.search(r'/page/\d+',p.path):return 'pagination'
 if '/weddings/wedding-venues/' in p.path and p.path.rstrip('/')!='/weddings/wedding-venues':return 'venue_profile'
 if re.search(r'\b(guide|brochure|floor.?plan|capacity|pricing|rates?|fees?|faqs?|downloads?|documents?|price list|packages?|menus?)\b',text):return 'guide_or_fact_document'
 if re.search(r'/(?:Facilities/Facility/Details|Recreation-Centers|facility-rentals|rent-a-facility-or-park)/[^/]+',p.path,re.I):return 'facility_profile'
 if re.search(r'\b(?:facilities|rentals?|indoor spaces|venues)\b',context,re.I) and re.search(r'\b(?:centre|center|hall|room|lodge|park|pavilion|theatre|theater|barn|museum|garden|club|camp|estate)\b',label,re.I):return 'facility_profile'
 if p.path.rstrip('/')=='/weddings':return 'source_home'
 return None

class ResourceParser(HTMLParser):
 def __init__(self,base):super().__init__();self.base=base;self.rows=[];self.heading='';self.h=None;self.htext=[];self.anchor=None;self.button=None;self.skip_depth=0
 def emit(self,url,label='',tag='a',rel=''):
  url=urljoin(self.base,url);kind=classify(url,label,self.heading,tag,rel)
  if kind:self.rows.append({'url':url,'label':label.strip(),'context_heading':self.heading,'kind':kind,'state':'excluded_action' if kind=='outbound_form' else 'pending','reason':'Read-only research does not submit inquiries' if kind=='outbound_form' else None})
 def handle_starttag(self,tag,attrs):
  if tag in ('nav','footer'):self.skip_depth+=1;return
  if self.skip_depth:return
  a=dict(attrs)
  if re.fullmatch('h[1-6]',tag):self.h=tag;self.htext=[]
  if tag=='a':
   match=re.search(r'(?:window\.)?(?:open|location\.assign)\([\'\"]([^\'\"]+)',a.get('onclick','')) or re.search(r'(?:window\.)?location(?:\.href)?\s*=\s*[\'\"]([^\'\"]+)',a.get('onclick',''))
   alternate=a.get('data-url') or a.get('data-href') or (match[1] if match else None)
   self.anchor={'url':alternate if alternate and (not a.get('href') or a.get('href')=='#') else a.get('href'),'label':[a.get('aria-label') or a.get('title','')],'rel':a.get('rel','')}
  if tag=='area' and a.get('href'):self.emit(a['href'],a.get('alt',''))
  if tag=='img' and self.anchor:self.anchor['label'].append(a.get('alt',''))
  if tag in ('iframe','embed','object') and (a.get('src') or a.get('data')):self.emit(a.get('src') or a['data'],a.get('title',''),tag)
  if tag=='button':
   target=a.get('data-url') or a.get('data-href');match=re.search(r'(?:window\.)?(?:open|location\.assign)\([\'\"]([^\'\"]+)',a.get('onclick','')) or re.search(r'(?:window\.)?location(?:\.href)?\s*=\s*[\'\"]([^\'\"]+)',a.get('onclick',''))
   if target or match:self.button={'url':target or match[1],'label':[a.get('aria-label') or a.get('title','')]}
 def handle_data(self,text):
  if self.skip_depth:return
  if self.h:self.htext.append(text)
  if self.anchor:self.anchor['label'].append(text)
  if self.button:self.button['label'].append(text)
 def handle_endtag(self,tag):
  if tag in ('nav','footer'):self.skip_depth=max(0,self.skip_depth-1);return
  if self.skip_depth:return
  if tag==self.h:self.heading=' '.join(' '.join(self.htext).split());self.h=None
  if tag=='a' and self.anchor:
   if self.anchor['url']:self.emit(self.anchor['url'],' '.join(' '.join(self.anchor['label']).split()),rel=self.anchor['rel'])
   self.anchor=None
  if tag=='button' and self.button:self.emit(self.button['url'],' '.join(self.button['label']),'button');self.button=None
def inventory(html,base):
 p=ResourceParser(base);p.feed(html);unique={}
 for row in p.rows:
  key=(row['url'] if row['kind']=='facility_profile' else row['url'].split('#')[0],row['kind'])
  if key not in unique:unique[key]=row
 return list(unique.values())
def resources_reviewed(rows):
 if not rows:return False
 for row in rows:
  if row['state']=='excluded_action' and row.get('reason'):continue
  if row['state']!='reviewed' or not row.get('reviewed_utc'):return False
  if row['kind'] in ('interactive_publication','pdf_document'):
   count=row.get('page_count');pages=set(row.get('reviewed_pages',[]))
   if type(count) is not int or count<1 or pages!=set(range(1,count+1)):return False
 return True
if __name__=='__main__':
 html_path,base,out_path=sys.argv[1:4];rows=inventory(Path(html_path).read_text(encoding='utf-8'),base);Path(out_path).write_text(json.dumps({'source_url':base,'resources':rows,'complete':False,'note':'Discovery inventory only; pages, documents and candidates require separate disposition.'},ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'resources':len(rows),'kinds':{k:sum(r['kind']==k for r in rows) for k in sorted({r['kind'] for r in rows})}}))
