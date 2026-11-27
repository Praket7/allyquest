/* Stage 19 visual refinement: presentation only. Progression, hitboxes, evidence
   classification and adult-review gates are unchanged. Fully offline. */
if (compiledPack.worlds?.length === 12) {
  const css = document.createElement('style');
  css.textContent = `
  /* A place to explore rather than a list of locked menu rows. */
  #map .aq19-scenic-route {position:relative;isolation:isolate;grid-column:1/-1;min-height:212px;
    border-radius:20px;overflow:hidden;border:1px solid #d8e7d2a8;
    box-shadow:0 13px 31px #102d3480, inset 0 1px #fff6d7c0;
    background:linear-gradient(180deg,#1d4c5d50,#153d50a8),var(--scenic-image) center 44%/cover no-repeat;}
  #map .aq19-scenic-route::before{content:'';position:absolute;inset:0;
    background:linear-gradient(90deg,#123c4da0,transparent 54%,#133b4990),linear-gradient(#24536444,#112c4050);pointer-events:none}
  #map .aq19-scenic-legend{position:absolute;z-index:2;top:13px;left:17px;display:grid;gap:3px;
    padding:8px 12px;border-radius:10px;background:#163b4cd9;box-shadow:0 3px 9px #091f2940}
  #map .aq19-scenic-legend strong{color:#fff5dd;font:800 17px/1.15 system-ui}
  #map .aq19-scenic-legend small{color:#d5e6dd;font:600 12px system-ui}
  #map .aq19-route-svg{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:.92;filter:drop-shadow(0 2px 5px #164b51)}
  #map .aq19-stop{position:absolute;z-index:2;left:var(--px);top:var(--py);transform:translate(-50%,-50%);
    min-width:38px;min-height:38px;padding:0;border-radius:50%;border:3px solid #e9dbb0;
    color:#183f4a;background:linear-gradient(#fff4d3,#b6dadd);font:850 13px system-ui;
    box-shadow:0 4px 0 #123e4f,0 4px 13px #081f2b70;cursor:pointer;transition:transform .16s ease,filter .16s ease}
  #map .aq19-stop:hover{transform:translate(-50%,-56%) scale(1.13);filter:brightness(1.1)}
  #map .aq19-stop:focus-visible{outline:3px solid #fff9d0;outline-offset:4px}
  #map .aq19-stop[data-locked=true]{border-color:#a6b7b4;background:linear-gradient(#8fa7a9,#6f9093);color:#e8eeea}
  #map .aq19-stop[data-world-index='0']{border-color:#fbd367;box-shadow:0 4px 0 #966e2c,0 0 0 5px #ffebad44,0 4px 14px #061d2670}
  #map .aq19-chapter-hero{position:relative;grid-column:1/-1;min-height:145px;border-radius:17px;
  background:linear-gradient(90deg,#1b4254c9,#1534434d 70%,#1534438a),var(--chapter-image) center 45%/cover no-repeat;
  box-shadow:0 8px 19px #0c2d4080;overflow:hidden;border:1px solid #e8dec58e;display:flex;align-items:center;padding:20px 25px}
  #map .aq19-chapter-hero strong{color:#fff5d6;font:800 23px system-ui;text-shadow:0 2px 5px #142e38}
  #map .aq19-chapter-hero p{color:#f1e9ce;font:600 14px system-ui;max-width:380px}
  #map .aq19-chapter-hero img{position:absolute;right:12%;bottom:-12px;max-height:155px;max-width:118px;filter:drop-shadow(1px 7px 5px #112b39a0)}
  #map .aq19-world-card{border-radius:18px;background:#1d3d4b;border:1.5px solid #b1cbbac9;
    box-shadow:0 9px 16px #0b283e72, inset 0 1px #ffffff28;overflow:hidden;
    transition:transform .18s ease,box-shadow .18s ease}
  #map .aq19-world-card:hover{transform:translateY(-3px);box-shadow:0 15px 26px #051d2d9e}
  #map .aq19-world-image{height:147px;background-position:center 48%}
  #map .aq19-world-image::after{background:linear-gradient(to top,#0f283cc7,transparent 72%)}
  #map .aq19-world-character{position:absolute;right:5px;bottom:-8px;z-index:1;display:block;
    width:95px;height:140px;object-fit:contain;object-position:bottom;pointer-events:none;
    filter:drop-shadow(0 5px 3px #0d263c9c);transform-origin:bottom center}
  #map .aq19-world-card:hover .aq19-world-character{animation:aq19-greeting .6s ease-in-out 1}
  #map .aq19-world-copy{padding:13px 15px 14px;gap:5px}
  #map .aq19-world-copy strong{font-size:17px}
  #map .aq19-world-copy small{font-size:12px}
  #map .aq19-world-grid{grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:15px}
  #map .aq19-world-num{top:10px;left:10px;background:#173d4de8;border:1px solid #fff3ce77;
    box-shadow:0 2px 8px #15343d66;font-size:11px}
  #map .aq19-world-lock .aq19-world-image{filter:saturate(.82)}
  /* A vivid illustration on the left and a legible physical label on the right. */
  dialog.aqd {background:#f6f0e2;border:1px solid #fff6df;box-shadow:0 24px 90px #0c263d9c}
  .aqd header{background:linear-gradient(130deg,#173d52,#2b6470);color:#fff8e7;border-bottom:3px solid #edc56d}
  .aqd .aqd-work{grid-template-columns:minmax(170px,.64fr) minmax(310px,1.5fr) minmax(205px,.82fr);
    gap:13px;background:#ede9df}
  .aqd .aqd-receipt{background:#fffaf0;filter:drop-shadow(0 4px 6px #15384830);border-color:#cbbf9e}
  .aqd .aqd-stage{display:grid;grid-template-columns:1fr;align-content:start;justify-items:center;
    background:radial-gradient(ellipse at 45% 20%,#f9f5e8,#dbe7df 60%,#acc9c3);padding:12px 16px 16px;
    box-shadow:inset 0 1px 6px #4e776323,0 5px 15px #244c4d15;min-height:375px}
  .aqd .aqd-stage[data-premium-mode='label']{grid-template-columns:minmax(135px,.85fr) minmax(200px,1.15fr);gap:12px;align-items:start}
  .aqd .aqd-tabs{grid-column:1/-1;grid-row:1;justify-content:center;align-self:start;margin-bottom:3px;gap:0;
    border-radius:24px;background:#324a52;padding:4px;overflow:hidden;width:max-content;max-width:100%}
  .aqd .aqd-tabs button{margin:0;border:0;background:transparent;color:#e5ede8;border-radius:20px;
    padding:8px 16px;min-height:38px;font:750 13px system-ui}
  .aqd .aqd-tabs button[aria-pressed=true]{background:linear-gradient(#ffe6a2,#eab54f);color:#1f3942;
    box-shadow:0 2px 5px #17344066}
  .aqd .aqd-stage .aq19-product-art{grid-column:1;grid-row:2;align-self:center;
    width:min(100%,260px);max-height:320px;object-fit:contain;display:block;
    filter:drop-shadow(5px 14px 8px #17394848);transform:rotate(-2deg);
    transition:transform .2s ease}
  .aqd .aqd-stage .aq19-product-art:hover{transform:rotate(0) scale(1.025)}
  .aqd .aqd-stage[data-premium-mode='front'] .aq19-product-art{grid-column:1;max-height:280px;width:min(63%,225px)}
  .aqd .aqd-stage .aq19-product-art svg{width:100%;height:100%;display:block}
  .aqd .aqd-stage .aqd-pack{display:none}
  .aqd .aqd-stage .aqd-print{grid-column:2;grid-row:2;align-self:stretch;width:100%;padding:7px;border-radius:13px;max-height:430px;overflow:auto}
  .aqd .aqd-stage .aqd-label{padding:13px;background:#fffdfa;box-shadow:0 3px 12px #132c3447;
    min-height:245px;max-height:none;font:500 13px/1.48 system-ui}
  .aqd .aqd-label h3{font-size:15px;line-height:1.3}.aqd .aqd-label small{display:block;margin:5px 0 9px;line-height:1.4}
  .aqd .aqd-clues button{font-size:12px;min-height:39px;line-height:1.25}
  .aqd .aqd-stage .aqd-source{grid-column:1/-1;grid-row:3;max-width:100%;font-size:11px;position:relative}
  .aqd .aqd-stage[data-premium-mode='front'] .aqd-source{grid-row:3}
  .aqd .aqd-answer{background:#fffdf6;border-color:#d6d2bd;box-shadow:0 2px 6px #16363718}
  .aqd .aqd-answer [data-answer]{border-radius:11px;font-weight:730;min-height:49px}
  .aqd .aqd-footer{position:sticky;bottom:0;background:#f8f3e7;z-index:3;box-shadow:0 -5px 14px #d6d0bd75}
  .aqd .aqd-plan{background:#fff9eb}
  @keyframes aq19-greeting{0%,100%{transform:rotate(0deg)}40%{transform:rotate(4deg)}70%{transform:rotate(-2deg)}}
  @media(max-width:1150px){.aqd .aqd-work{grid-template-columns:170px minmax(0,1fr)}
    .aqd .aqd-answer{grid-column:1/-1;grid-template-columns:repeat(3,minmax(0,1fr))}
    .aqd .aqd-answer h3,.aqd .aqd-answer p{grid-column:1/-1}}
  @media(max-width:740px){#map .aq19-chapter-hero{min-height:125px;padding:12px}#map .aq19-chapter-hero img{height:125px;right:3%}#map .aq19-chapter-hero strong{font-size:18px}#map .aq19-chapter-hero p{font-size:11px;max-width:60%}
    #map .aq19-scenic-route{min-height:190px}
    #map .aq19-world-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    #map .aq19-world-image{height:119px}
    #map .aq19-world-character{height:102px;width:70px}
    #map .aq19-scenic-legend strong{font-size:14px}
    #map .aq19-scenic-legend small{font-size:10px}
    .aqd .aqd-work{grid-template-columns:1fr;padding:10px}
    .aqd .aqd-stage[data-premium-mode='label']{grid-template-columns:minmax(110px,.75fr) minmax(175px,1.25fr)}
    .aqd .aqd-answer{grid-template-columns:1fr}
    .aqd .aqd-stage .aq19-product-art{max-height:260px}}
  @media(max-width:490px){#map .aq19-world-image{height:100px}#map .aq19-world-character{height:88px;width:61px}
    #map .aq19-world-copy strong{font-size:14px}#map .aq19-world-copy{padding:9px 10px}
    #map .aq19-scenic-route{min-height:170px}
    #map .aq19-scenic-legend{top:7px;left:7px;padding:5px 7px}
    #map .aq19-scenic-legend strong{font-size:12px}
    #map .aq19-scenic-legend small{font-size:9px}
    .aqd .aqd-stage{order:0}.aqd .aqd-receipt{order:1}.aqd .aqd-answer{order:2}
    .aqd .aqd-stage[data-premium-mode='label']{grid-template-columns:1fr}
    .aqd .aqd-stage[data-premium-mode='label'] .aq19-product-art{width:125px;max-height:150px;grid-column:1}
    .aqd .aqd-stage .aqd-print{grid-column:1;grid-row:3;max-height:none}
    .aqd .aqd-stage .aqd-source{grid-row:4}
    .aqd .aqd-stage{min-height:260px}
    .aqd .aqd-tabs button{font-size:11px;padding:7px 12px}}
  @media(prefers-reduced-motion:reduce){#map .aq19-world-character,.aqd .aq19-product-art{animation:none!important;transition:none!important;transform:none!important}}
  `;
  document.head.append(css);

  // The same hit targets are retained. This scenic route is purely a second
  // way to open the existing world previews; locked adventures remain locked.
  const beforeMap = renderMap;
  renderMap = function () {
    beforeMap();
    const cards = document.querySelector('#map-cards');
    if (!cards) return;
    const worldButtons = [...cards.querySelectorAll('button[data-world19]')];
    if (!worldButtons.length) {
      // A world preview retains its five verified adventure buttons, preceded
      // by an illustrated introduction to that world's NPC companion.
      const first=cards.querySelector('[data-adventure19]');
      const index=compiledPack.levels.findIndex(l=>l.id===first?.dataset.adventure19);
      if(index<0)return;
      const w=compiledPack.worlds[Math.floor(index/25)];
      const banner=document.createElement('section');banner.className='aq19-chapter-hero';
      banner.style.setProperty('--chapter-image',`url("${ASSET_URLS[w.backdrop]}")`);
      const text=document.createElement('div');const name=document.createElement('strong');name.textContent=w.name;
      const caption=document.createElement('p');caption.textContent='Explore the neighborhood with '+w.friend+'.';
      text.append(name,caption);banner.append(text);
      if(w.character){const person=document.createElement('img');person.src=ASSET_URLS[w.character+'_00'];person.alt='';person.loading='lazy';banner.append(person);}
      cards.querySelector('.aq19-world-nav')?.after(banner);
      return;
    }
    const route = document.createElement('div');
    route.className = 'aq19-scenic-route';
    route.setAttribute('role','group');
    route.setAttribute('aria-label','Illustrated route through the twelve Ally Quest worlds');
    const worldBack = ASSET_URLS[compiledPack.worlds[0].backdrop];
    route.style.setProperty('--scenic-image',`url("${worldBack}")`);
    const legend=document.createElement('div');legend.className='aq19-scenic-legend';
    const title=document.createElement('strong');title.textContent='Our journey';
    const sub=document.createElement('small');sub.textContent='Explore twelve connected places';
    legend.append(title,sub);route.append(legend);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 1000 250');svg.setAttribute('preserveAspectRatio','none');svg.classList.add('aq19-route-svg');
    svg.innerHTML='<path d="M90 82 C230 42 340 145 500 88 S790 75 915 91 C972 164 854 225 740 184 S480 202 345 191 S172 160 90 183" fill="none" stroke="#204854b5" stroke-width="15" stroke-linecap="round"/><path d="M90 82 C230 42 340 145 500 88 S790 75 915 91 C972 164 854 225 740 184 S480 202 345 191 S172 160 90 183" fill="none" stroke="#ffe3a3" stroke-width="6" stroke-dasharray="1 13" stroke-linecap="round"/>';
    route.append(svg);
    worldButtons.forEach((button,i)=>{
      const img=button.querySelector('.aq19-world-image');
      const w=compiledPack.worlds[i];
      if(img && w.character){const portrait=document.createElement('img');portrait.className='aq19-world-character';portrait.alt='';portrait.loading='lazy';portrait.src=ASSET_URLS[w.character+'_00'];img.append(portrait);}
      const pin=document.createElement('button');pin.type='button';pin.className='aq19-stop';
      pin.dataset.worldIndex=String(i);pin.textContent=String(i+1);pin.title=w.name;
      pin.setAttribute('aria-label','Preview '+w.name+(button.classList.contains('aq19-world-lock')?', adventures locked':''));pin.dataset.locked=String(button.classList.contains('aq19-world-lock'));
      const left=(9+(i%6)*16.4),top=(i<6?33:75)+(i%2===0?0:-5);
      pin.style.setProperty('--px',left+'%');pin.style.setProperty('--py',top+'%');
      pin.onclick=()=>button.click();route.append(pin);
    });
    cards.prepend(route);
  };

  // The ingredient panel's original buttons and scoring remain untouched.
  // Recompose the presentation around an illustrated package + legible back label.
  const evidenceDialog=document.querySelector('#aq-label-detective');
  function escape19(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function package19(p){
    const colors=p.colors||['#b08f53','#efd09c'];const a=escape19(colors[0]),b=escape19(colors[1]);
    const name=escape19(p.name||'Ingredient study');
    const words=String(p.name||'Snack').split(/\s+/);
    const brand=escape19(words.slice(0,Math.min(2,words.length)).join(' '));
    const variety=escape19(words.slice(Math.min(2,words.length)).join(' ').slice(0,38)||'Ingredient investigation');
    const isBox=p.kind==='box';const shell=isBox?'M36 13L218 13L239 32L239 286L213 302L36 300Z':'M41 21 Q132 4 222 21 L231 60 Q214 113 225 170 L236 283 Q136 312 25 285 L38 169 Q51 107 31 57Z';
    const foodShapes=Array.from({length:5},(_,i)=>{const x=86+(i%3)*31,y=204+Math.floor(i/3)*31;
      return `<g transform="translate(${x} ${y}) rotate(${i*22-42})"><ellipse rx="35" ry="21" fill="url(#chip19)" stroke="#ab763c" stroke-width="2"/><path d="M-25 -7 Q0 -20 24 -8 M-25 6 Q0 -6 25 7" stroke="#a8703e" stroke-opacity=".32" stroke-width="2" fill="none"/></g>`}).join('');
    const svg=`<svg viewBox="0 0 270 330" role="img" aria-label="Illustrated ${name} reference packaging. Not a photograph of the actual product." xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="body19"><stop stop-color="#18343b"/><stop offset=".14" stop-color="${a}"/><stop offset=".34" stop-color="${b}"/><stop offset=".54" stop-color="${a}"/><stop offset=".8" stop-color="${b}"/><stop offset="1" stop-color="#263d43"/></linearGradient>
      <radialGradient id="chip19" cx=".34" cy=".2"><stop stop-color="#fff8ce"/><stop offset=".4" stop-color="#f4d891"/><stop offset="1" stop-color="#c18a4e"/></radialGradient>
      <linearGradient id="light19" x1="0" x2="1"><stop stop-color="#ffffff" stop-opacity=".28"/><stop offset=".16" stop-color="#ffffff" stop-opacity="0"/><stop offset=".47" stop-color="#ffffff" stop-opacity=".16"/><stop offset=".74" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#04161b" stop-opacity=".25"/></linearGradient>
      <clipPath id="mask19"><path d="${shell}"/></clipPath>
      <filter id="shadow19"><feGaussianBlur stdDeviation="2"/></filter></defs>
      <ellipse cx="142" cy="308" rx="93" ry="11" fill="#26373b" opacity=".32" filter="url(#shadow19)"/>
      <path d="${shell}" fill="url(#body19)" stroke="#52696b" stroke-width="2"/><g clip-path="url(#mask19)">
      <path d="M20 172 Q120 136 255 178L260 321L17 321Z" fill="${b}" opacity=".97"/>
      <path d="M40 35 Q135 17 223 36 M36 285Q130 302 236 285" fill="none" stroke="#fff4d2" stroke-width="6" opacity=".4"/>
      <path d="M44 55 Q69 92 47 146 L41 274 M223 47Q197 99 224 144 L220 269" fill="none" stroke="#4e554a" stroke-width="5" opacity=".25"/>
      <g transform="translate(0 -13)">${foodShapes}</g>
      <path d="M52 89 Q131 75 211 90 L203 159 Q137 177 61 157Z" fill="#fff5df" opacity=".95"/>
      <text x="134" y="116" font-family="system-ui,sans-serif" font-weight="900" font-size="${brand.length>16?16:21}" text-anchor="middle" fill="#8b3f34">${brand}</text>
      <text x="135" y="141" font-family="system-ui,sans-serif" font-size="${variety.length>22?10:13}" font-weight="700" text-anchor="middle" fill="#526457">${variety}</text>
      <path d="${shell}" fill="url(#light19)"/>
      ${Array.from({length:13},(_,i)=>`<path d="M${50+i*13} 18l-1 12" stroke="#fef6df" stroke-width="1" opacity=".3"/>`).join('')}
      </g><path d="M46 296L220 296" stroke="#fff7d9" stroke-width="3" opacity=".43"/>
      <text x="133" y="322" text-anchor="middle" fill="#50696b" font-size="10" font-weight="700" font-family="system-ui">ILLUSTRATED STUDY PACK · VERIFY CURRENT LABEL</text></svg>`;
    const holder=document.createElement('div');holder.className='aq19-product-art';holder.innerHTML=svg;return holder;
  }
  function enhanceEvidence(){
    if(!evidenceDialog?.open)return;
    const stage=evidenceDialog.querySelector('.aqd-stage');if(!stage||stage.dataset.premiumMode)return;
    const receiptButtons=[...evidenceDialog.querySelectorAll('[data-receipt]')];
    const chosen=receiptButtons.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.receipt;
    const current=Object.values(AQLabelCases.cases).flatMap(c=>c.products).find(p=>p.id===chosen);
    if(!current)return;
    stage.dataset.premiumMode=stage.querySelector('.aqd-print')?'label':'front';
    const pack=package19(current);const tabs=stage.querySelector('.aqd-tabs');
    if(tabs)tabs.after(pack);else stage.prepend(pack);
    const front=stage.querySelector('[data-side=front]'),back=stage.querySelector('[data-side=back]');
    if(front)front.textContent=current.recipe?'Recipe':'Package';
    if(back)back.textContent='Ingredients';
    const feedback=evidenceDialog.querySelector('.aqd-answer > h3');if(feedback)feedback.textContent='Choose where it belongs';
  }
  if(evidenceDialog){const observer=new MutationObserver(enhanceEvidence);observer.observe(evidenceDialog,{childList:true,subtree:true});}
}
