/* Entry point: game loop */
let last=performance.now(),acc=0;
(function loop(n){acc+=Math.min(n-last,100);last=n;while(acc>=1000/60){step();acc-=1000/60}draw();requestAnimationFrame(loop)})(last);
panel();
