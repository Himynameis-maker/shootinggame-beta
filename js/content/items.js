/* Item definitions. passive: apply(stats) / active: cd + use(g). Optional onGet(g). */
def('item',{id:'boots',type:'passive',apply(s){s.speed*=1.25}});
def('item',{id:'rapid',type:'passive',apply(s){s.cdMul*=.7}});
def('item',{id:'heart',type:'passive',apply(s){s.maxHp+=1},onGet(g){g.hp++}});
def('item',{id:'dash',type:'active',cd:150,use(g){g.p.dash=10}});

