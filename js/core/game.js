/* Game logic: state reset, phases, spawn, hit checks, main step() */
function calc(){const s={speed:3,cdMul:1,maxHp:CFG.hp};G.own.items.forEach(id=>REG.item[id].apply?.(s));G.st=s}
function newGame(){
  Object.assign(G,{round:1,score:0,hist:[],own:{bullets:['normal'],items:[]},slots:['normal',...Array(CFG.maxSlots-1).fill(null)],cur:0,edit:0,paused:false,inv:0,cd:0,acd:0,
   p:{x:200,y:H/2,r:8,a:0,dx:1,dy:0,dash:0},bul:[],beams:[],coins:[]});
  calc();G.hp=G.st.maxHp;startCollect();
}
function startCollect(){
  Object.assign(G,{phase:'collect',paused:false,quota:3+G.round*2,max:Math.min(2+G.round,8),bul:[],beams:[],coins:[],fr:0,rec:{s:[]}});
  G.toSpawn=G.quota;G.tmax=G.time=(16+G.round*2)*60;spawnCoins();
}
function spawnCoins(){
  const n=Math.min(G.max,G.toSpawn);G.toSpawn-=n;
  for(let i=0;i<n;i++){let x,y;do{x=rnd(40,W-40);y=rnd(50,H-40)}while(hyp(x-G.p.x,y-G.p.y)<80);G.coins.push({x,y,r:11})}
}
/* 回避フェーズ開始: 敵は1体だけ。移動経路 G.en(フレーム番号 → x,y,向き の表)を先に作り、
   過去の記録の弾はすべて「発射フレームの敵の位置」を原点にして et/tl に展開する。以降は表を引くだけ。 */
function startDodge(){
  G.hist.push(G.rec);
  const n=Math.round((10+G.round*1.5)*60),en=makePath(n),et=[],tl=[];
  for(const rec of G.hist.slice(-CFG.maxGhost))for(const b of bakeRec(rec)){
    if(b.f>n)continue; // 回避の制限時間を過ぎてからの発射は使われない
    const ox=en[3*b.f],oy=en[3*b.f+1]; // 発射時の敵の位置
    if(b.k===2){ // 曲がる弾: 相対軌跡 P を原点 ox,oy に置く
      et.push({f0:b.f,f1:b.f+b.n-1,P:b.P,ox,oy,r:b.r,col:b.col,x:ox,y:oy});
      if(b.tc)tl.push({f0:b.f,P:b.P,ox,oy,col:b.tc,x:ox,y:oy})}
    else if(b.k===1)et.push({f0:b.f,f1:b.f+b.life,B:1,x:ox,y:oy,a:b.a,col:b.col,r:0});
    else if(b.k===3)tl.push({f0:b.f,x:ox,y:oy,a:b.a,len:b.len,col:b.col});
    else{let k=0;while(k<b.life){const x=ox+b.vx*(k+1),y=oy+b.vy*(k+1);if(x<-20||x>W+20||y<-20||y>H+20)break;k++}
      if(k)et.push({f0:b.f,f1:b.f+k,x0:ox,y0:oy,vx:b.vx,vy:b.vy,r:b.r,col:b.col,x:ox,y:oy})}
  }
  const by=(a,b)=>a.f0-b.f0;et.sort(by);tl.sort(by);
  Object.assign(G,{phase:'dodge',bul:[],beams:[],coins:[],fr:0,rec:{s:[]},inv:60,en,et,tl,ei:0,tlo:0,act:[]});
  G.tmax=G.time=n;
}
/* 敵1体の移動経路: ランダムな座標へ向かって移動 → 少し止まる を繰り返す。自機の位置は見ない(乱数だけで決める)。
   戻り値は Float32Array [x,y,向き]×(n+1フレーム)。位置 = 表[フレーム番号] */
function makePath(n){
  const C=CFG.enemy,P=new Float32Array((n+1)*3);
  let x=W-200,y=H/2,a=Math.PI,i=0;
  const put=()=>{if(i<=n){P[3*i]=x;P[3*i+1]=y;P[3*i+2]=a}i++};
  put();
  while(i<=n){
    let tx,ty,c=0;do{tx=rnd(C.x0*W,C.x1*W);ty=rnd(C.y0*H,C.y1*H)}while(hyp(tx-x,ty-y)<C.minD&&++c<20);
    const sx=x,sy=y,m=Math.max(1,Math.ceil(hyp(tx-sx,ty-sy)/C.speed));
    a=Math.atan2(ty-sy,tx-sx);
    for(let k=1;k<=m&&i<=n;k++){const u=k/m,e=u*u*(3-2*u);x=sx+(tx-sx)*e;y=sy+(ty-sy)*e;put()} // 出だしと着地がゆっくり
    for(let k=0;k<C.wait&&i<=n;k++)put();
  }
  return P;
}
/* 記録 → 敵の弾の「原点に依存しない表」。1つの記録につき1回だけ作ってキャッシュ(rec.bk)。
   発射位置は含めない(startDodge で敵の位置を足す)。角度・軌跡は左右反転済み。
   k:0 直進弾(vx,vy) / 1 ビーム / 2 曲がる弾(trace: 発射点からの相対軌跡 P) / 3 予告の直線 */
function bakeRec(rec){
  if(rec.bk)return rec.bk;
  const bk=[];
  for(const q of rec.s){
    const d=REG.bullet[q.id],a=Math.PI-q.a;
    if(q.tr){
      for(const t of q.tr){const n=t.p.length/2;if(n<2)continue;
        const P=new Float32Array(t.p.length),x0=t.p[0],y0=t.p[1];
        for(let i=0;i<P.length;i+=2){P[i]=x0-t.p[i];P[i+1]=t.p[i+1]-y0} // 発射点を原点にして左右反転
        bk.push({k:2,f:q.f,P,n,r:t.r,col:t.col,tc:d.tele?d.col:null})}
      q.tr=null; // 表にしたので元の記録は不要
    }else{
      const g={bul:[],beams:[]};d.fire(g,'e',0,0,a); // 弾の定義をそのまま使って原点で1回だけ展開
      for(const b of g.bul)bk.push({k:0,f:q.f,vx:b.vx,vy:b.vy,r:b.r,col:b.col,life:b.life});
      for(const m of g.beams)bk.push({k:1,f:q.f,a:m.a,life:m.life,col:m.col});
      if(d.tele)bk.push({k:3,f:q.f,a,len:d.tele,col:d.col});
    }
  }
  return rec.bk=bk;
}
function endDodge(){
  G.hist.push(G.rec);bakeRec(G.rec);G.round++;G.phase='reward';G.bul=[];G.beams=[];G.picked=false;
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
    if(d){const n=G.bul.length,e={f:G.fr,id:d.id,x:p.x,y:p.y,a:p.a};d.fire(G,'p',p.x,p.y,p.a);
      if(d.trace){e.tr=[];for(let i=n;i<G.bul.length;i++){const b=G.bul[i],t={p:[b.x,b.y],r:b.r,col:b.col};b.tr=t;e.tr.push(t)}} // 曲がる弾は軌跡を丸ごと記録
      G.rec.s.push(e);G.cd=d.cd*s.cdMul}
  }
  if(G.phase==='dodge'){ // 敵の弾: 表を引くだけ(動かす計算なし)
    const E=G.et,T=G.tl,A=G.act;
    while(E[G.ei]&&E[G.ei].f0<=G.fr)A.push(E[G.ei++]);
    while(T[G.tlo]&&T[G.tlo].f0<=G.fr)G.tlo++;
    for(let i=A.length-1;i>=0;i--){const e=A[i];
      if(G.fr>=e.f1){A[i]=A[A.length-1];A.pop();continue}
      let hit;
      if(e.B)hit=rayD(e,p)<p.r+3;
      else{const n=G.fr-e.f0+1;if(e.P){e.x=e.ox+e.P[2*n];e.y=e.oy+e.P[2*n+1]}else{e.x=e.x0+e.vx*n;e.y=e.y0+e.vy*n}hit=hyp(p.x-e.x,p.y-e.y)<p.r+e.r}
      if(hit){hurt();if(!e.B){A[i]=A[A.length-1];A.pop()}}
    }
  }
  for(const b of G.bul){
    if(b.homing&&b.owner==='p'){const T=nearest(G.coins,b);
      if(T){let a=Math.atan2(b.vy,b.vx);const df=((Math.atan2(T.y-b.y,T.x-b.x)-a+Math.PI*3)%(Math.PI*2))-Math.PI,v=hyp(b.vx,b.vy);
        a+=Math.max(-b.homing,Math.min(b.homing,df));b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v}}
    b.x+=b.vx;b.y+=b.vy;b.life--;
    if(b.tr)b.tr.p.push(b.x,b.y);
    if(b.x<-20||b.x>W+20||b.y<-20||b.y>H+20)b.life=0;
    if(b.owner==='p'){for(const c of G.coins)if(!c.dead&&hyp(c.x-b.x,c.y-b.y)<c.r+b.r){c.dead=1;G.score++;if(!b.pierce){b.life=0;break}}}
  }
  for(const m of G.beams){m.life--;
    if(m.owner==='p'){for(const c of G.coins)if(!c.dead&&rayD(m,c)<c.r+3){c.dead=1;G.score++}}}
  G.bul=G.bul.filter(b=>b.life>0);G.beams=G.beams.filter(m=>m.life>0);
  if(G.phase==='over')return;
  G.fr++;G.time--;
  if(G.phase==='collect'){
    G.coins=G.coins.filter(c=>!c.dead);
    if(!G.coins.length){G.toSpawn>0?spawnCoins():startDodge()}
    else if(G.time<=0)over();
  }else if(G.time<=0)endDodge();
}
