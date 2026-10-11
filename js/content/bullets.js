/* Bullet definitions. fire() is used for the player AND mirrored ghosts. Lasers also go here. */
const shot=(g,o,x,y,a,p={})=>g.bul.push({x,y,vx:Math.cos(a)*(p.sp||9),vy:Math.sin(a)*(p.sp||9),r:p.r||4,life:p.life||90,owner:o,pierce:p.pierce,homing:p.homing,col:p.col});
def('bullet',{id:'normal',cd:10,col:'#ffffff',fire(g,o,x,y,a){shot(g,o,x,y,a,this)}});
def('bullet',{id:'spread',cd:24,col:'#ffd166',fire(g,o,x,y,a){for(let i=-2;i<=2;i++)shot(g,o,x,y,a+i*.17,{col:this.col,life:55})}});
def('bullet',{id:'pierce',cd:20,col:'#6ff2ff',fire(g,o,x,y,a){shot(g,o,x,y,a,{col:this.col,sp:13,r:5,pierce:1})}});
def('bullet',{id:'homing',cd:22,col:'#ff8fa3',fire(g,o,x,y,a){shot(g,o,x,y,a,{col:this.col,sp:6,life:150,homing:.1})}});
def('bullet',{id:'laser',cd:50,col:'#b892ff',fire(g,o,x,y,a){g.beams.push({x,y,a,life:10,owner:o,col:this.col})}});
