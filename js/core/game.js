/* Game logic: state reset, phases, spawn, hit checks, main step() */
function calc(){const s={speed:3,cdMul:1,maxHp:CFG.hp};G.own.items.forEach(id=>REG.item[id].apply?.(s));G.st=s}
function newGame(){
  Object.assign(G,{round:1,score:0,hist:[],own:{bullets:['normal'],items:[]},slots:['normal',...Array(CFG.maxSlots-1).fill(null)],cur:0,edit:0,paused:false,inv:0,cd:0,acd:0,
   p:{x:200,y:H/2,r:8,a:0,dx:1,dy:0,dash:0},bul:[],beams:[],coins:[],ghosts:[]});
  calc();G.hp=G.st.maxHp;startCollect();
}
function startCollect(){
  Object.assign(G,{phase:'collect',paused:false,quota:3+G.round*2,max:Math.min(2+G.round,8),bul:[],beams:[],ghosts:[],coins:[],fr:0,rec:{f:[],s:[]}});
  G.toSpawn=G.quota;G.tmax=G.time=(16+G.round*2)*60;spawnCoins();
}
function spawnCoins(){
  const n=Math.min(G.max,G.toSpawn);G.toSpawn-=n;
  for(let i=0;i<n;i++){let x,y;do{x=rnd(40,W-40);y=rnd(50,H-40)}while(hyp(x-G.p.x,y-G.p.y)<80);G.coins.push({x,y,r:11})}
}
function startDodge(){
  G.hist.push(G.rec);
  Object.assign(G,{phase:'dodge',bul:[],beams:[],coins:[],fr:0,rec:{f:[],s:[]},inv:60,
   ghosts:G.hist.slice(-CFG.maxGhost).map(rec=>({rec,i:0}))});
  G.tmax=G.time=(10+G.round*1.5)*60;
}
function endDodge(){
  G.hist.push(G.rec);G.round++;G.phase='reward';G.bul=[];G.beams=[];G.picked=false;
  const pool=[];
  for(const k of ['bullet','item'])for(const d of Object.values(REG[k]))if(!G.own[k==='bullet'?'bullets':'items'].includes(d.id))pool.push([k,d.id]);
  G.rw=pool.sort(()=>Math.random()-.5).slice(0,3);if(!G.rw.length)G.picked=true;
  panel();
}
function pick(k,id){
  const list=G.own[k==='bullet'?'bullets':'items'];list.push(id);
  if(k==='bullet'){const e=G.slots.indexOf(null);if(e>=0)G.slots[e]=id}
  else{calc();REG.item[id].onGet?.(G)}
  G.picked=true;
}
function over(){G.phase='over';panel()}
function hurt(){if(G.inv>0||G.p.dash>0)return;G.hp--;G.inv=90;if(G.hp<=0)over()}
function rayD(m,P){const c=Math.cos(m.a),s=Math.sin(m.a),dx=P.x-m.x,dy=P.y-m.y;return dx*c+dy*s<0?1e9:Math.abs(dx*s-dy*c)}
function nearest(arr,b){let best=null,bd=1e9;for(const c of arr){const d=hyp(c.x-b.x,c.y-b.y);if(d<bd){bd=d;best=c}}return best}

function step(){
  if(!playing()||G.paused)return;
  const p=G.p,s=G.st;
  const dx=(K.has('d')||K.has('arrowright'))-(K.has('a')||K.has('arrowleft')),dy=(K.has('s')||K.has('arrowdown'))-(K.has('w')||K.has('arrowup'));
  if(dx||dy){const l=hyp(dx,dy);p.dx=dx/l;p.dy=dy/l}
  if(dx||dy||p.dash>0){const sp=s.speed*(p.dash>0?3:1);p.x+=p.dx*sp;p.y+=p.dy*sp}
  p.dash--;p.x=Math.max(10,Math.min(W-10,p.x));p.y=Math.max(10,Math.min(H-10,p.y));
  p.a=Math.atan2(M.y-p.y,M.x-p.x);
  G.cd--;G.acd--;G.inv--;
  if((M.down||K.has(' '))&&G.cd<=0){
    const d=REG.bullet[G.slots[G.cur]];
    if(d){d.fire(G,'p',p.x,p.y,p.a);G.rec.s.push({f:G.fr,id:d.id,x:p.x,y:p.y,a:p.a});G.cd=d.cd*s.cdMul}
  }
  if(G.phase==='dodge')for(const gh of G.ghosts){const r=gh.rec;
    while(r.s[gh.i]&&r.s[gh.i].f<=G.fr){const q=r.s[gh.i++];REG.bullet[q.id].fire(G,'e',W-q.x,q.y,Math.PI-q.a)}}
  for(const b of G.bul){
    if(b.homing){const T=b.owner==='p'?nearest(G.coins,b):p;
      if(T){let a=Math.atan2(b.vy,b.vx);const df=((Math.atan2(T.y-b.y,T.x-b.x)-a+Math.PI*3)%(Math.PI*2))-Math.PI,v=hyp(b.vx,b.vy);
        a+=Math.max(-b.homing,Math.min(b.homing,df));b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v}}
    b.x+=b.vx;b.y+=b.vy;b.life--;
    if(b.x<-20||b.x>W+20||b.y<-20||b.y>H+20)b.life=0;
    if(b.owner==='p'){for(const c of G.coins)if(!c.dead&&hyp(c.x-b.x,c.y-b.y)<c.r+b.r){c.dead=1;G.score++;if(!b.pierce){b.life=0;break}}}
    else if(hyp(p.x-b.x,p.y-b.y)<p.r+b.r){hurt();b.life=0}
  }
  for(const m of G.beams){m.life--;
    if(m.owner==='p'){for(const c of G.coins)if(!c.dead&&rayD(m,c)<c.r+3){c.dead=1;G.score++}}
    else if(rayD(m,p)<p.r+3)hurt();}
  G.bul=G.bul.filter(b=>b.life>0);G.beams=G.beams.filter(m=>m.life>0);
  if(G.phase==='over')return;
  G.rec.f.push([p.x,p.y,p.a]);G.fr++;G.time--;
  if(G.phase==='collect'){
    G.coins=G.coins.filter(c=>!c.dead);
    if(!G.coins.length){G.toSpawn>0?spawnCoins():startDodge()}
    else if(G.time<=0)over();
  }else if(G.time<=0)endDodge();
}

