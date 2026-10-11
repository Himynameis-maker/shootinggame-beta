/* Canvas drawing */
/* 弾の絵は色×大きさごとに1回だけ作り、以降は drawImage で貼るだけ */
const SPR={};
function spr(col,r,en){const k=col+'|'+r+'|'+(en?1:0);let c=SPR[k];if(!c){const s=Math.ceil(r*2+6);c=SPR[k]=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');
  x.fillStyle=col||'#fff';x.beginPath();x.arc(s/2,s/2,r,0,7);x.fill();if(en){x.strokeStyle='#ff5d73';x.lineWidth=2;x.stroke()}}return c}
function ship(x,y,a,col,al){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalAlpha=al;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-9,-8);ctx.lineTo(-5,0);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();ctx.restore()}
function draw(){
  ctx.fillStyle='#0b0d16';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#232943';ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
  if(!G.p)return;
  for(const c of G.coins){ctx.fillStyle='#ffc83d';ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,7);ctx.fill();ctx.fillStyle='#b8860b';ctx.beginPath();ctx.arc(c.x,c.y,c.r*.5,0,7);ctx.fill()}
  if(G.phase==='dodge'){const T=G.tl;for(let j=G.tlo;T[j]&&T[j].f0<=G.fr+CFG.tele;j++){const q=T[j],k=1-(q.f0-G.fr)/CFG.tele; // 発射1秒前の予告
    ctx.save();ctx.globalAlpha=.12+.5*k;ctx.strokeStyle=q.col;ctx.lineWidth=1.5;ctx.setLineDash([8,8]);ctx.beginPath();
    if(q.P){const P=q.P;ctx.moveTo(P[0],P[1]);for(let i=2;i<P.length;i+=2)ctx.lineTo(P[i],P[i+1])}
    else{ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+Math.cos(q.a)*q.len,q.y+Math.sin(q.a)*q.len)}
    ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(q.x,q.y,6+8*(1-k),0,7);ctx.stroke();ctx.restore()}}
  if(G.phase==='dodge')for(const gh of G.ghosts){const f=gh.rec.f[G.fr];if(f)ship(W-f[0],f[1],Math.PI-f[2],'#ff5d73',.35)}
  for(const m of G.beams){ctx.strokeStyle=m.col;ctx.lineWidth=m.life>5?6:2;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x+Math.cos(m.a)*1100,m.y+Math.sin(m.a)*1100);ctx.stroke()}
  for(const b of G.bul){const c=spr(b.col,b.r);ctx.drawImage(c,b.x-c.width/2,b.y-c.height/2)}
  if(G.phase==='dodge')for(const e of G.act){
    if(e.B){ctx.strokeStyle=e.col;ctx.globalAlpha=.6;ctx.lineWidth=e.f1-G.fr>5?6:2;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.a)*1100,e.y+Math.sin(e.a)*1100);ctx.stroke();ctx.globalAlpha=1}
    else{const c=spr(e.col,e.r,1);ctx.drawImage(c,e.x-c.width/2,e.y-c.height/2)}}
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

