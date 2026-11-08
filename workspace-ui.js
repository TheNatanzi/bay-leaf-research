/* Organize existing controls without removing filters, evidence or saved answers. */
function tidyWorkspace(){
 const root=$('compare'),bar=root.querySelector(':scope>.filters'),more=root.querySelector('.extra-filters');
 const columnLabel=$('compareGroup').closest('label'),guestLabel=$('compareGuests').closest('label');$('tableViewControls').prepend(columnLabel,guestLabel);
 const selectedColumnGroup=$('compareGroup').value,columnOptions=[...$('compareGroup').options];
 for(const [label,test] of [['Quick comparisons',v=>['numeric','essentials'].includes(v)||v.startsWith('normalized:')&&!v.endsWith('All typed fields')],['Detailed evidence',v=>['overview','normalized:All typed fields'].includes(v)],['Planner workbook',v=>v==='all'||!v.startsWith('normalized:')&&!['numeric','essentials','overview'].includes(v)]]){const group=document.createElement('optgroup');group.label=label;for(const option of columnOptions)if(test(option.value))group.append(option);$('compareGroup').append(group);}
 $('compareGroup').value=selectedColumnGroup;
 for(const id of ['compareGroup','compareGuests'])$(id).addEventListener(id==='compareGuests'?'input':'change',()=>{for(const name of ['government','potential'])if(!$(name).hidden)renderCatalog(name);});
 const numeric=root.querySelector('.numeric-filters'),reset=$('compareReset');bar.append(reset);
 const resetFilters=reset.onclick;reset.onclick=()=>{resetFilters();updateFilterSummary();};
 if(more&&numeric){const title=document.createElement('h3');title.textContent='Number range';more.append(title,numeric);}
 for(const box of [...root.querySelectorAll(':scope>.advanced-controls')]){
  if(box===more||box.hidden)continue;
  const label=box.querySelector(':scope>summary')?.textContent||'';
  if(label.startsWith('Property groups')){
   const heading=document.createElement('h3');heading.textContent='Record & evidence filters';more.append(heading);
   for(const child of [...box.children])if(child.tagName!=='SUMMARY')more.append(child);
   box.remove();
  }else if(label.startsWith('Comparable event'))box.querySelector('summary').textContent='Cost assumptions';
 }
 const status=document.createElement('p');status.id='activeFilterSummary';status.className='active-filter-summary';status.setAttribute('aria-live','polite');bar.after(status);
 const compareButton=document.querySelector('nav [data-tab="compare"]');compareButton.parentElement.prepend(compareButton);
 const menu=document.querySelector('.more-research>div');
 const groups=[['Planning',new Set(['checklist','founders','wiki','inquiries'])],['Research progress',new Set(['coverage'])]];
 for(const [name,ids]of groups){const group=document.createElement('div');group.className='research-menu-group';const heading=document.createElement('strong');heading.textContent=name;group.append(heading);for(const item of [...menu.children])if(ids.has(item.dataset?.tab))group.append(item);menu.append(group);}
 const resources=document.createElement('div');resources.className='research-menu-group';const title=document.createElement('strong');title.textContent='Reports & sources';resources.append(title);for(const item of [...menu.children])if(item.tagName==='A')resources.append(item);menu.append(resources);
 document.querySelectorAll('.more-research a').forEach(a=>a.addEventListener('click',()=>{a.closest('.more-research').open=false;}));
 updateFilterSummary();
 if(!location.hash)tab('compare');
}
function updateFilterSummary(){
 const out=$('activeFilterSummary');if(!out)return;
 const labels={compareSearch:'search',compareCounty:'county',compareCity:'city',comparePrice:'pricing',compareCatering:'catering',compareAnswer:'missing data',propertyFilter:'property',researchStatus:'research status',reviewFilter:'reviews',recordScope:'source type',recordType:'record type'};
 const active=Object.entries(labels).filter(([id])=>$(id)?.value).map(([,label])=>label);
 if($('numericMin')?.value||$('numericMax')?.value)active.push('number range');
 if($('identityOnly')?.checked)active.push('identity review');
 if($('entityView')?.value==='properties')active.push('one row per group');
 out.hidden=!active.length;out.textContent=active.length+' active filter'+(active.length===1?'':'s')+': '+active.join(', ');
}
