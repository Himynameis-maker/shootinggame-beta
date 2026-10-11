/* DOM panel: title / pause / reward / game over, shortcut editing */
function loadout(){
  let h=`<h4>${t('slots')}</h4><p class=s>${t('slotHint')}</p><div class=row>`;
  G.slots.forEach((id,i)=>h+=`<button class="slot ${G.edit===i?'sel':''}" data-a=slot data-i=${i}>${i+1}<br><small>${id?nm('bullet',id):t('empty')}</small></button>`);
  h+=`</div><h4>${t('owned')}</h4><div class=row><button data-a=assign data-id="">${t('empty')}</button>`+G.own.bullets.map(id=>`<button data-a=assign data-id="${id}" title="${ds('bullet',id)}">${nm('bullet',id)}</button>`).join('')+'</div>';
  return h+`<h4>${t('items')}</h4><p>`+(G.own.items.length?G.own.items.map(id=>`${nm('item',id)} (${t(REG.item[id].type)})`).join(' / '):'-')+'</p>';
}
function panel(){
  const el=$('#panel'),ph=G.phase;
  if(!(ph==='title'||ph==='over'||ph==='reward'||G.paused)){el.style.display='none';return}
  el.style.display='block';
  let h=`<div class=card><div class=top><b>${t('title')}</b><button data-a=lang>${I18N.lang==='ja'?'English':'日本語'}</button></div>`;
  if(ph==='title')h+=`<p>${t('howto')}</p><button class=pri data-a=start>${t('start')}</button>`;
  else if(ph==='over')h+=`<h3>${t('over')}</h3><p>${t('round')} ${G.round} / ${t('score')}: ${G.score}</p><button class=pri data-a=start>${t('retry')}</button>`;
  else{
    if(ph==='reward')h+=`<h3>${t('pick')}</h3><div class=row>`+G.rw.map(([k,id])=>`<button class=opt data-a=pick data-k=${k} data-id="${id}" ${G.picked?'disabled':''}><b>${nm(k,id)}</b>${k==='item'?` <small>(${t(REG.item[id].type)})</small>`:''}<br><small>${ds(k,id)}</small></button>`).join('')+'</div>'+(G.picked?`<br><button class=pri data-a=next>${t('next')}</button>`:'');
    else h+=`<h3>${t('paused')}</h3><button class=pri data-a=resume>${t('resume')}</button>`;
    h+=loadout();
  }
  el.innerHTML=h+'</div>';
}
$('#panel').onclick=e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,d=b.dataset;
  if(a==='start')newGame();else if(a==='resume')G.paused=false;
  else if(a==='lang'){I18N.lang=I18N.lang==='ja'?'en':'ja';document.documentElement.lang=I18N.lang}
  else if(a==='slot')G.edit=+d.i;
  else if(a==='assign'){const id=d.id||null,j=id?G.slots.indexOf(id):-1;if(j>=0)G.slots[j]=G.slots[G.edit];G.slots[G.edit]=id}
  else if(a==='pick')pick(d.k,d.id);else if(a==='next')startCollect();
  panel();
};

