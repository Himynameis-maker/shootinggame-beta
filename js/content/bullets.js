/* Bullet definitions. fire() is used for the player AND mirrored ghosts. Lasers also go here.
   trace:true = 動きが曲がる/状況で変わる弾。自機が撃ったときの軌跡を丸ごと記録し、敵(ゴースト)はそれをそのまま再生する(再計算しない)。
   tele:N = 敵が撃つ1秒前に軌道を予告表示(trace弾は記録した曲線、それ以外はN pxの直線)。 */
const shot=(g,o,x,y,a,p={})=>g.bul.push({x,y,vx:Math.cos(a)*(p.sp||9),vy:Math.sin(a)*(p.sp||9),r:p.r||4,life:p.life||90,owner:o,pierce:p.pierce,homing:p.homing,col:p.col});
def('bullet',{id:'normal',cd:10,col:'#ffffff',fire(g,o,x,y,a){shot(g,o,x,y,a,this)}});
def('bullet',{id:'spread',cd:24,col:'#ffd166',fire(g,o,x,y,a){for(let i=-2;i<=2;i++)shot(g,o,x,y,a+i*.17,{col:this.col,life:55})}});
def('bullet',{id:'pierce',cd:20,col:'#6ff2ff',fire(g,o,x,y,a){shot(g,o,x,y,a,{col:this.col,sp:13,r:5,pierce:1})}});
def('bullet',{id:'homing',cd:22,col:'#ff8fa3',fire(g,o,x,y,a){shot(g,o,x,y,a,{col:this.col,sp:6,life:150,homing:.1})},trace:true,tele:900});
def('bullet',{id:'laser',cd:50,col:'#b892ff',fire(g,o,x,y,a){g.beams.push({x,y,a,life:10,owner:o,col:this.col})},tele:1100});
