/* One scene per screen. Native controls and existing evidence handlers remain authoritative. */
if(compiledPack.worlds?.length===12){
 const game=$('#game'),cards=$('#map-cards'),dlg=$('#aq-label-detective');
 for(const [k,v] of Object.entries(AQ_SCENIC_ART))game.style.setProperty('--scenic-'+k,'url("'+v+'")');
 const css=document.createElement('style');css.id='aq-scene-finish';css.textContent=`
 #home #home-stage .cin-home-art{background:linear-gradient(90deg,transparent 39%,#30223836 63%,#39233157),var(--scenic-title) left center/cover no-repeat!important}
 #home #home-stage .cin-home-menu{inset:7% 6% 6% auto!important;width:40%!important;height:auto!important;display:flex!important;flex-direction:column;justify-content:center;align-items:center;gap:clamp(6px,1.5vh,17px)!important;pointer-events:auto!important}
 #home #home-stage .cin-logo{position:static!important;width:auto!important;height:auto!important;overflow:visible!important;clip-path:none!important;display:block!important;font:italic 700 clamp(38px,5.8vw,105px)/.96 Georgia,serif!important;letter-spacing:-.055em!important;color:#fff6d5!important;text-shadow:0 2px #c18936,0 4px 8px #332337,0 8px 24px #362334!important;margin:0 0 2.2vh!important;transform:none!important;white-space:nowrap}
 #home #home-stage .cin-logo span{display:inline!important;color:#fff6d5!important;text-shadow:inherit!important}#home #home-stage .cin-logo i{font-size:.48em;vertical-align:super;color:#ffd76c;margin-left:.15em}
 #home #home-stage .cin-home-menu .home-hotspot{position:static!important;width:76%!important;height:auto!important;min-height:clamp(38px,7vh,72px)!important;color:#fff7e2!important;background:#39262b77!important;border:1px solid #ffe7b146!important;border-radius:99px!important;padding:8px 15px!important;font:700 clamp(17px,2.1vw,32px)/1 Georgia,serif!important;text-shadow:0 2px 3px #3c2924!important;box-shadow:none!important;transition:transform .17s,background .17s,box-shadow .17s!important}
 #home #home-stage .cin-home-menu #home-play{background:linear-gradient(#fff1b4,#edbd5c)!important;color:#492d14!important;text-shadow:none!important;border:2px solid #fff8d5!important;box-shadow:0 3px 0 #ad7333,0 0 18px #ffe2a399!important}
 #home #home-stage .cin-home-menu .home-hotspot:hover{transform:translateY(-2px)!important;background:#674936c9!important}#home #home-stage .cin-home-menu #home-play:hover{background:linear-gradient(#fff7c8,#f8cb6a)!important}
 #home #home-stage .cin-minor{display:flex!important;gap:9px!important;justify-content:center;width:80%!important;margin-top:5px!important}
 #home #home-stage .cin-home-menu .cin-minor .home-hotspot{width:auto!important;flex:1!important;min-height:36px!important;font:600 clamp(11px,1vw,16px) system-ui!important;background:#39262b80!important;color:#fff2d4!important;padding:8px 9px!important}
 #home #aq17-guide-home{width:44px!important;height:44px!important;right:16px!important;bottom:16px!important;top:auto!important;color:#fff5dc!important;background:#3d2c36a6!important;border:1px solid #fff1c989!important;font-size:0!important}#home #aq17-guide-home:after{content:'i';font:italic 700 24px Georgia}
 #map.aqj .aqj-adventure.cin-welcome{background:var(--scenic-title) left center/cover no-repeat!important}
 #map.aqj .aqj-adventure.cin-market{background:var(--scenic-market) left center/cover no-repeat!important}
 #map.aqj .aqj-adventure .aqj-book{background:linear-gradient(140deg,#fff2dcf2,#efd0a9e8)!important;backdrop-filter:blur(15px)!important;border:1.5px solid #fff1c9!important;box-shadow:0 9px 32px #33241e50,inset 0 1px 3px #fff9e5!important;border-radius:clamp(20px,2.4vw,40px)!important}
 #map.aqj .aqj-adventure .aqj-book .map-play{box-shadow:none!important;border:1px solid #fff9e4!important;background:#fff9e578!important}
 #map.aqj .aqj-adventure .aqj-book .map-play[data-live-state=current]{background:linear-gradient(#fff0b0,#f4c66d)!important;border:1.5px solid #fff8d5!important;box-shadow:0 2px 8px #b77d3d55!important}
 #map.aqj .aqj-adventure #aq19-back-worlds{background:#382b2b9c!important;border:1px solid #ffeac7!important;box-shadow:0 2px 7px #2d201f45!important}#map.aqj .aqj-adventure #aq19-back-worlds:after{content:'←'!important;color:#fff6df!important}
 #overlay.cin-complete .panel .cin-end-art{background:var(--scenic-complete) left center/cover no-repeat!important}
 #overlay.cin-complete .panel .cin-end-copy{background:linear-gradient(148deg,#fff2dbef,#efd0aaea)!important;backdrop-filter:blur(14px)!important;border:1.5px solid #fff4d1!important;box-shadow:0 10px 38px #35221956,inset 0 1px 4px #fff6de!important}
 #overlay.cin-complete .cin-end-copy h2{background:none!important;box-shadow:none!important;border:0!important;text-shadow:0 1px #fff9e7!important}
 #overlay.cin-complete .cin-end-copy .panel-kicker{font-size:clamp(12px,1.2vw,19px)!important;letter-spacing:.04em!important}
 #overlay.cin-complete .cin-end-copy .end-stars{font-size:clamp(40px,6vw,92px)!important;text-shadow:0 3px #a46b25,0 5px 10px #9e692b70!important}
 .aqd.ref-food header button{font-size:0!important;background:#513c2dba!important;border:1px solid #fff3d6!important;min-width:44px!important;width:44px!important;height:44px!important;border-radius:50%!important;display:grid!important;place-items:center!important;padding:0!important;box-shadow:0 2px 7px #432b2860!important}
 .aqd.ref-food header button:after{content:'←'!important;font:700 25px/1 system-ui;color:#fff5dd}
 .aqd.ref-food .aqd-stage .cin-food-art{clip-path:none!important;filter:drop-shadow(0 12px 8px #59320c40)!important;object-fit:contain!important}
 .aqd.ref-food[data-live-plain=true] .cin-food-art{clip-path:none!important}
 .aqd.ref-food .aqd-stage .aqd-label{border:0!important;box-shadow:none!important;background:none!important}
 .aqd.ref-food .aqd-stage .aqd-answer{box-shadow:none!important}
 @media(min-width:1000px) and (min-aspect-ratio:4/5){
 #map.aqj .aqj-adventure .aqj-book{left:53%!important;right:8%!important;top:23%!important;height:auto!important;min-height:0!important;max-height:72%!important;padding:clamp(12px,2vh,24px) clamp(12px,1.6vw,26px)!important;justify-content:flex-start!important;gap:7px!important}
 #map.aqj .aqj-adventure .cin-world-heading{font:italic 700 clamp(24px,3vw,48px)/1.1 Georgia!important;color:#62401f!important}
 #map.aqj .aqj-adventure .aqj-book .map-play{min-height:clamp(39px,7.2vh,72px)!important}
 #overlay.cin-complete .panel .cin-end-copy{left:49%!important;right:7%!important;top:12%!important;bottom:12%!important;justify-content:center!important;gap:clamp(6px,1.1vh,14px)!important}
 dialog.aqd.ref-food{background:linear-gradient(180deg,#8e684b 0%,#c39a73 52%,#a47549 77%,#865b3a 78%,#ad825a 100%)!important}
 dialog.aqd.ref-food:before{width:23%!important;background-size:cover!important;background-position:left center!important;mask-image:linear-gradient(to right,#000 0%,#000 83%,transparent 100%)}
 .aqd.ref-food header{padding:12px 4% 5px 24%!important;justify-content:center!important;background:none!important}
 .aqd.ref-food header h2{font:italic 700 clamp(30px,3.3vw,52px)/1 Georgia!important;letter-spacing:-.02em!important;text-shadow:0 3px 8px #41291f!important}
 .aqd.ref-food header button{position:absolute!important;left:18px!important;top:12px!important}
 .aqd.ref-food .aqd-plan{margin:0 4% 4px 24%!important;padding:7px 12px!important;background:#fff2dbd9!important;border:0!important;border-radius:9px!important;font:500 clamp(12px,1vw,16px)/1.3 system-ui!important;box-shadow:none!important}
 .aqd.ref-food .aqd-work{padding:8px 3% 10px 21%!important;gap:8px!important;align-content:start!important}
 .aqd.ref-food .aqd-receipt{background:none!important;border:0!important;padding:0!important}
 .aqd.ref-food .aqd-receipt [data-receipt]{background:#fff4dfb8!important;border:1px solid #fff6df!important;border-radius:10px!important;min-height:39px!important;font:600 clamp(11px,1vw,15px)/1.2 system-ui!important}
 .aqd.ref-food .aqd-receipt [data-receipt][aria-pressed=true]{background:#ffdda0!important;color:#4d3016!important}
 .aqd.ref-food .aqd-stage,.aqd.ref-food .aqd-stage[data-premium-mode=front],.aqd.ref-food .aqd-stage[data-premium-mode=label]{grid-template-columns:minmax(0,.91fr) minmax(0,1.45fr)!important;grid-template-rows:auto auto auto auto!important;gap:5px 24px!important;padding:14px 22px 14px 8px!important;background:linear-gradient(90deg,transparent 0%,transparent 36%,#fff2dd 36%,#f6e3c7 100%)!important;border:none!important;border-radius:20px!important;box-shadow:none!important;align-content:start!important;align-items:start!important;min-height:0!important}
 .aqd.ref-food .aqd-stage .aq19-product-art,.aqd.ref-food .aqd-stage[data-premium-mode=front] .aq19-product-art{grid-column:1!important;grid-row:1/5!important;position:sticky!important;top:8px!important;width:100%!important;max-width:none!important;align-self:center!important;filter:none!important}
 .aqd.ref-food .aqd-stage .cin-food-art{max-height:47vh!important;border-radius:9px!important;box-shadow:none!important}
 .aqd.ref-food .cin-art-note{color:#fff5e4!important;text-shadow:0 1px 3px #503220!important;font:600 clamp(11px,.95vw,14px)/1.3 system-ui!important}
 .aqd.ref-food .aqd-tabs{grid-column:2!important;grid-row:1!important;position:static!important;background:none!important;border:none!important;box-shadow:none!important;padding:0!important;justify-self:start!important;gap:10px!important}
 .aqd.ref-food .aqd-tabs button{min-height:36px!important;border-radius:0!important;border-bottom:2px solid transparent!important;background:none!important;box-shadow:none!important;font:700 clamp(13px,1.2vw,18px) Georgia!important;padding:3px 8px!important}
 .aqd.ref-food .aqd-tabs button[aria-pressed=true]{border-bottom-color:#b17c32!important;color:#4f3018!important}
 .aqd.ref-food .aqd-stage .aqd-print{grid-column:2!important;grid-row:2!important}
 .aqd.ref-food .aqd-stage .aqd-label{padding:0!important;font:500 clamp(13px,1.07vw,17px)/1.4 system-ui!important;color:#352519!important}
 .aqd.ref-food .aqd-label h3{font:700 clamp(22px,2.3vw,35px)/1.1 Georgia!important;border-bottom:1px solid #c8a477!important;margin:4px 0 10px!important;padding:0 0 8px!important}
 .aqd.ref-food .aqd-label p,.aqd.ref-food .aqd-label small{font-size:clamp(12px,1vw,16px)!important;line-height:1.35!important}
 .aqd.ref-food .aqd-clues{gap:3px 10px!important}
 .aqd.ref-food .aqd-clues [data-clue]{background:none!important;border:0!important;border-bottom:1px solid #c8a477!important;box-shadow:none!important;border-radius:2px!important;min-height:33px!important;padding:4px 3px!important;font:600 clamp(13px,1.1vw,17px)/1.25 system-ui!important}
 .aqd.ref-food .aqd-clues [data-clue][aria-pressed=true]{background:#ffe6a1!important;border-bottom-color:#986b2d!important}
 .aqd.ref-food .aqd-stage .aqd-answer{grid-column:2!important;grid-row:3!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;border-top:1px solid #c8a477!important;padding-top:8px!important;gap:7px!important}
 .aqd.ref-food .aqd-answer h3,.aqd.ref-food .aqd-feedback,.aqd.ref-food .aqd-check{grid-column:1/-1!important}
 .aqd.ref-food .aqd-answer [data-answer]{font:700 clamp(12px,1vw,16px)/1.2 Georgia!important;min-height:44px!important;text-align:center!important;border-radius:9px!important;box-shadow:none!important}
 .aqd.ref-food .aqd-stage .aqd-source{grid-column:2!important;grid-row:4!important;padding-top:5px!important}
 .aqd.ref-food .aqd-footer{background:#5d402e9e!important;padding:7px 3% 10px 24%!important;color:#fff5e2!important}
 .aqd.ref-food .aqd-footer small{color:#fff5e2!important;text-shadow:none!important}
 }
 @media(max-aspect-ratio:4/5){
 #home #home-stage .cin-home-art{background:linear-gradient(transparent 20%,#392c3233 38%,#392c32ed 69%),var(--scenic-title) left top/auto 66% no-repeat,#392c32!important}
 #home #home-stage .cin-home-menu{inset:auto 5% 5% 5%!important;width:90%!important;gap:7px!important}
 #home #home-stage .cin-logo{font-size:clamp(38px,11vw,64px)!important;margin:0 0 6px!important}
 #home #home-stage .cin-home-menu .home-hotspot{width:88%!important;min-height:44px!important;font-size:18px!important}
 #home #home-stage .cin-home-menu .cin-minor .home-hotspot{font-size:12px!important;min-height:38px!important}
 #home #aq17-guide-home{top:10px!important;bottom:auto!important}
 #map.aqj .aqj-adventure.cin-welcome,#map.aqj .aqj-adventure.cin-market{background-position:left top!important;background-size:auto 60%!important;background-color:#765139!important}
 #overlay.cin-complete .panel .cin-end-art{background:linear-gradient(transparent 25%,#6c493a66 53%,#6c493a),var(--scenic-complete) left top/auto 63% no-repeat,#6c493a!important}
 }
 @media(prefers-reduced-motion:reduce){#home #home-stage .home-hotspot{transition:none!important;transform:none!important}}
 #game.cin-no-motion #home #home-stage .home-hotspot{transition:none!important;transform:none!important}
 `;document.head.append(css);
 const homeLabels={'home-play':'▶  Continue','home-map':'Adventures','home-crew':'Collection','home-settings':'Settings','home-workshop':'Workshop','home-daily':'Daily discovery'};
 for(const [id,label] of Object.entries(homeLabels)){const b=$('#'+id);if(b)b.textContent=label}
 if(dlg){const refresh=()=>{if(!dlg.open)return;const st=dlg.querySelector('.aqd-stage');if(!st?.dataset.refReady||st.dataset.scenicReady)return;st.dataset.scenicReady='true';const id=dlg.querySelector('[data-receipt][aria-pressed=true]')?.dataset.receipt;const p=Object.values(AQLabelCases.cases).flatMap(c=>c.products).find(p=>p.id===id);const im=st.querySelector('.cin-food-art');if(im&&p&&!p.recipe&&/Lay.s Classic Potato Chips/i.test(p.name)){im.src=AQ_SCENIC_ART.chip;im.alt='Illustrative plain potato chip package; not a retail label'}const note=st.querySelector('.cin-art-note');if(note&&p)note.textContent=p.recipe?'Recipe illustration · '+p.name:'Illustrative package · '+p.name;const close=dlg.querySelector('header button');if(close){close.setAttribute('aria-label','Return to room');close.title='Return to room'}};new MutationObserver(refresh).observe(dlg,{childList:true,subtree:true,attributes:true,attributeFilter:['open']})}
}
