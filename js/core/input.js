/* Keyboard / mouse input */
function togglePause(){if(!playing())return;G.paused=!G.paused;M.down=false;panel()}
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();K.add(k);if(k===' '||k.startsWith('arrow'))e.preventDefault();
  if(/^[1-8]$/.test(k))G.cur=+k-1;
  if(k==='p'||k==='escape')togglePause();
  if(k==='q'&&playing()&&!G.paused&&G.acd<=0){const a=G.own.items.map(i=>REG.item[i]).find(d=>d.type==='active');if(a){a.use(G);G.acd=a.cd}}
});
addEventListener('keyup',e=>K.delete(e.key.toLowerCase()));
cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();M.x=(e.clientX-r.left)*W/r.width;M.y=(e.clientY-r.top)*H/r.height});
cv.addEventListener('mousedown',e=>{if(e.button===0)M.down=true});
addEventListener('mouseup',()=>M.down=false);
cv.addEventListener('contextmenu',e=>{e.preventDefault();togglePause()});
cv.addEventListener('wheel',e=>{if(playing()&&!G.paused){e.preventDefault();G.cur=(G.cur+(e.deltaY>0?1:CFG.maxSlots-1))%CFG.maxSlots}},{passive:false});
