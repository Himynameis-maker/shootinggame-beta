# Coin Mirror (base)

Open `index.html` in a browser (no build, no server needed).

## Structure
- `js/config.js` - tunable constants (slots, ghost cap, HP)
- `js/core/` - i18n engine, content registry, globals, game logic, input
- `js/lang/` - one file per language (UI + bullet/item names)
- `js/content/bullets.js` - bullet types (incl. lasers)
- `js/content/items.js` - passive / active items
- `js/ui/` - canvas rendering, DOM panel
- `js/main.js` - game loop

Script load order is defined in `index.html` (classic scripts share globals).

## Adding content
- Bullet: `def('bullet',{id:'x', cd:15, col:'#fff', fire(g,owner,x,y,a){...}})` in `content/bullets.js`, then add `'b.x'` and `'b.x.d'` to every `lang/*.js`.
- Item: `def('item',{id:'x', type:'passive'|'active', apply(stats){}, use(g){}, cd:120})` in `content/items.js`, then add `'i.x'` and `'i.x.d'` to the lang files.
- Language: copy `lang/en.js` to `lang/xx.js`, change `'en'` to `'xx'`, add a script tag in `index.html`, and add a switch in `ui/panel.js`.
