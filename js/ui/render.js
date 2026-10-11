/* Canvas drawing */
function ship(x,y,a,col,al){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalAlpha=al;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-9,-8);ctx.lineTo(-5,0);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();ctx.restore()}
function draw(){
  ctx.fillStyle='#0b0d16';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#232943';ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
  if(!G.p)return;
  for(const c of G.coins){ctx.fillStyle='#ffc83d';ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,7);ctx.fill();ctx.fillStyle='#b8860b';ctx.beginPath();ctx.arc(c.x,c.y,c.r*.5,0,7);ctx.fill()}
  if(G.phase==='dodge')for(const gh of G.ghosts){const f=gh.rec.f[G.fr];if(f)ship(W-f[0],f[1],Math.PI-f[2],'#ff5d73',.35)}
  for(const m of G.beams){ctx.strokeStyle=m.col;ctx.globalAlpha=m.owner==='e'?.6:1;ctx.lineWidth=m.life>5?6:2;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x+Math.cos(m.a)*1100,m.y+Math.sin(m.a)*1100);ctx.stroke();ctx.globalAlpha=1}
  for(const b of G.bul){ctx.fillStyle=b.col||'#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();if(b.owner==='e'){ctx.strokeStyle='#ff5d73';ctx.lineWidth=2;ctx.stroke()}}
  if(playing())ship(G.p.x,G.p.y,G.p.a,'#6ff2ff',G.inv>0&&(G.inv>>2)%2?.35:1);
  if(!playing())return;
  ctx.font='bold 14px system-ui,sans-serif';ctx.fillStyle='#e8eaf3';ctx.textAlign='left';
  const left=G.phase==='collect'?`  ${t('coins')} ${G.toSpawn+G.coins.length}`:'';
  ctx.fillText(`${t('round')} ${G.round}  ${t(G.phase)}${left}  ${t('hp')} ${'♥'.repeat(Math.max(0,G.hp))}`,10,20);
  ctx.fillStyle=G.phase==='collect'?'#ffc83d':'#ff5d73';ctx.fillRect(0,H-5,W*Math.max(0,G.time)/G.tmax,5);
  for(let i=0;i<CFG.maxSlots;i++){const x=10+i*74,y=H-40,id=G.slots[i];ctx.strokeStyle=i===G.cur?'#ffc83d':'#343a55';ctx.lineWidth=2;ctx.strokeRect(x,y,68,28);
    ctx.fillStyle=id?REG.bullet[id].col:'#555';ctx.font='11px system-ui,sans-serif';ctx.fillText(`${i+1} ${id?nm('bullet',id):''}`,x+5,y+18)}
  if(G.fr<90){ctx.globalAlpha=1-G.fr/90;ctx.font='bold 44px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle=G.phase==='collect'?'#ffc83d':'#ff5d73';
    ctx.fillText(G.phase==='collect'?`${t('collect')}  x${G.quota}`:t('dodge'),W/2,H/2);ctx.globalAlpha=1}
}

