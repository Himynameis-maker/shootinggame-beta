/* Content registry. Bullets/items register via def(). */
const REG={bullet:{},item:{}};            // add new content with def('bullet'|'item',{...})
const def=(kind,o)=>(REG[kind][o.id]=o);
const nm=(k,id)=>t((k==='bullet'?'b.':'i.')+id), ds=(k,id)=>t((k==='bullet'?'b.':'i.')+id+'.d');
