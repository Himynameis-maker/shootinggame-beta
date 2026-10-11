/* Language engine. Strings live in js/lang/*.js */
const I18N={lang:'ja',d:{ja:{},en:{}},add(l,o){Object.assign(this.d[l]=this.d[l]||{},o)},t(k){return this.d[this.lang][k]??this.d.en[k]??k}};
const t=k=>I18N.t(k);
