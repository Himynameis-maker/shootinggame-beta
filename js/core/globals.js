/* Shared globals: DOM, input state, game state G, small helpers */
const $=s=>document.querySelector(s),W=800,H=500,cv=$('#c'),ctx=cv.getContext('2d');
const K=new Set(),M={x:400,y:250,down:false};let G={phase:'title'};
const rnd=(a,b)=>a+Math.random()*(b-a),hyp=Math.hypot,playing=()=>G.phase==='collect'||G.phase==='dodge';
