/* Live reference layouts. Reuse existing artwork and stateful native controls.
   Never substitute the concept's invented ingredient text or sample lock states. */
if(compiledPack.worlds?.length===12){
 const g=$('#game'), map=$('#map'), cards=$('#map-cards'), dlg=$('#aq-label-detective'), ov=$('#overlay');
 const style=document.createElement('style');style.id='aq-live-reference';style.textContent=`
 @media(min-aspect-ratio:4/5){
 #map.aqj .aqj-adventure .aqj-book{top:20.3%!important;left:51.3%!important;right:8.6%!important;bottom:auto!important;height:63.5%!important;min-height:0!important;max-height:none!important;align-self:stretch!important;gap:clamp(3px,1vh,10px)!important;padding:clamp(10px,2.1vh,24px) clamp(12px,1.6vw,26px)!important;justify-content:center!important;background:linear-gradient(160deg,#f9e8d1,#f1d5b3 55%,#fbe6c4)!important;border:2px solid #fff6d7!important;box-shadow:inset 0 0 14px #fff4db,0 0 18px #ffe1a7,0 7px 25px #5c32184d!important}
 #map.aqj .cin-world-heading{font-size:clamp(20px,3vw,48px)!important;line-height:1.08!important;letter-spacing:-.025em!important;color:#57351c!important;margin:0 0 1px!important}
 #map.aqj .aq19-chapters{min-height:26px!important;margin:0!important}
 #map.aqj .aqj-book .map-card{flex:0 0 auto!important;display:flex!important;align-items:center!important;min-height:0!important}
 #map.aqj .aqj-book .map-play{min-height:clamp(36px,6.5vh,78px)!important;grid-template-columns:clamp(28px,3vw,50px) minmax(0,1fr) auto!important;gap:clamp(6px,1vw,18px)!important;padding:5px clamp(8px,1.2vw,20px)!important;font-size:clamp(13px,1.76vw,29px)!important;background:#fff4dfb3!important;border:1px solid #fff5e7!important;box-shadow:inset 0 1px 2px #fff9ed!important}
 #map.aqj .aqj-book .map-play[data-live-state=current]{background:linear-gradient(#ffeaac,#f6c66d)!important;border:2px solid #fff9ce!important;box-shadow:0 0 12px #fff0b0,inset 0 1px 5px #fff6d4!important}
 #map.aqj .aqj-book .map-play[data-live-state=done]{background:#fff4dfb3!important;border:1px solid #fff5e7!important;box-shadow:none!important}
 #map.aqj .aqj-book .map-play[data-live-state=current] .live-play{background:linear-gradient(#fff0b2,#efb74c);border:1px solid #fff9d0;border-radius:40px;padding:6px 14px;font:700 clamp(12px,1.5vw,23px) Georgia;box-shadow:0 1px 5px #b07a37aa;color:#45280e;white-space:nowrap}
 #map.aqj .aqj-book .map-play .live-done{border-radius:50%;background:#587b27;color:white;width:1.45em;height:1.45em;display:grid;place-items:center;font:700 1em system-ui}
 #map.aqj .aqj-book:after{font-size:clamp(13px,2vh,23px)!important}
 #map.aqj .aqj-book .aqj-lock-note{font-size:clamp(10px,1vw,15px)!important;line-height:1.2!important}
 #overlay.cin-complete .cin-end-copy{top:1.2%!important;bottom:10.6%!important;left:47.2%!important;right:11.2%!important;justify-content:space-evenly!important;padding:clamp(12px,2.8vh,30px) clamp(14px,2vw,32px)!important;background:linear-gradient(160deg,#fae7c9,#e7c6a6 48%,#fce8c8)!important;border:2px solid #fff3c9!important;box-shadow:inset 0 0 14px #fff7df,0 0 22px #ffd995,0 12px 24px #5c391d55!important;overflow:auto!important}
 #overlay.cin-complete .cin-end-art{background-size:100% 100%!important}
 #overlay.cin-complete .end-stars{font-size:clamp(40px,6.3vw,95px)!important;letter-spacing:.02em!important;color:#ffc64d!important;line-height:1!important;filter:drop-shadow(0 2px 0 #b47b27);order:-2}
 #overlay.cin-complete .panel-kicker{font-size:clamp(10px,1vw,15px)!important;order:-1}
 #overlay.cin-complete .cin-end-copy h2{width:100%;padding:9px 5px!important;background:linear-gradient(#ffedac,#efbd50);border:1px solid #fff5c9;border-radius:8px;box-shadow:0 3px 0 #b27d2e,0 0 16px #ffeaab99;color:#57320e!important;font:italic 700 clamp(25px,3vw,49px)/1.02 Georgia!important;margin:3px 0!important}
 #overlay.cin-complete .end-progress{font-size:clamp(14px,1.6vw,24px)!important;line-height:1.2!important}
 #overlay.cin-complete .cin-end-copy p,#overlay.cin-complete .cin-end-copy .aq-story-end{font:500 clamp(11px,1.06vw,17px)/1.35 Georgia!important;color:#573b25!important}
 #overlay.cin-complete .replay-badges{font-size:clamp(10px,.9vw,14px)!important}
 #overlay.cin-complete .panel-buttons{max-width:94%!important;gap:12px!important;margin:4px 0!important}
 #overlay.cin-complete .panel-buttons button{font-size:clamp(14px,1.6vw,24px)!important;min-height:clamp(38px,6vh,65px)!important;padding:8px 20px!important}
 #overlay.cin-complete .panel-buttons [data-end-next]{min-height:clamp(45px,7vh,80px)!important;box-shadow:0 3px #af792a,0 0 13px #ffe29a!important}
 }
 /* Inspection composition: large physical object plus a single legible evidence page.
    Keep all choices, source terms, receipt entries and adult-review logic. */
 @media(min-width:1000px) and (min-aspect-ratio:4/5){
 dialog.aqd.ref-food{background:linear-gradient(135deg,#a67b54,#e6c7a4 56%,#b68c64)!important}
 dialog.aqd.ref-food:before{width:30%!important;background-size:100% 100%!important;mask-image:linear-gradient(to right,#000 0%,#000 83%,transparent 100%)}
 .aqd.ref-food header{background:linear-gradient(90deg,transparent 26%,#5b382b60 45%,#67422f50 100%)!important;padding:clamp(8px,1.5vh,16px) 4% 5px 30%!important;justify-content:center!important}
 .aqd.ref-food h2{font-size:clamp(32px,4vw,64px)!important;text-align:center;letter-spacing:-.02em;text-shadow:0 2px #68401e,0 4px 12px #3b201d!important}
 .aqd.ref-food header button{position:absolute!important;left:1.85%;top:2.1%;width:5.1vw;height:7.9vh;font-size:0!important;padding:0!important;background:transparent!important;border:0!important;border-radius:50%!important}
 .aqd.ref-food header button:after{content:none!important}.aqd.ref-food header button:hover,.aqd.ref-food header button:focus-visible{outline:2px solid #fff5c8!important}
 .aqd.ref-food .aqd-plan{margin:0 4% 0 31%!important;padding:6px 12px!important;background:none!important;box-shadow:none!important;border:none!important;color:#352416!important;font-size:clamp(12px,1.1vw,17px)!important;gap:20px!important}
 .aqd.ref-food .aqd-plan strong{font-size:clamp(10px,.85vw,13px)!important;color:#59391c!important}
 .aqd.ref-food .aqd-work{padding:6px 3.5% 12px 24.5%!important;gap:7px!important;justify-content:flex-start!important}
 .aqd.ref-food .aqd-receipt{background:none!important;border:0!important;padding:0!important;box-shadow:none!important}
 .aqd.ref-food .aqd-receipt [data-receipt]{background:#fff3dca3!important;border:1px solid #fff0d0!important;border-radius:25px!important;min-height:40px!important;font-size:clamp(11px,.94vw,15px)!important;padding:5px 10px!important}
 .aqd.ref-food .aqd-receipt [data-receipt][aria-pressed=true]{background:linear-gradient(#ffedb0,#edbd63)!important;color:#4b2d13!important;box-shadow:0 2px 5px #855e383b!important}
 .aqd.ref-food .aqd-stage,.aqd.ref-food .aqd-stage[data-premium-mode=label],.aqd.ref-food .aqd-stage[data-premium-mode=front]{grid-template-columns:minmax(0, .9fr) minmax(0,1.3fr)!important;grid-template-rows:auto auto auto auto!important;align-items:start!important;align-content:start!important;min-height:0!important;padding:clamp(11px,1.15vw,22px)!important;gap:5px 20px!important;background:linear-gradient(145deg,#fff1db,#f4d7b3)!important;border:2px solid #fff7d7!important;border-radius:clamp(18px,2.6vw,44px)!important;box-shadow:0 4px 0 #b17d39,0 0 12px #fff0bc,inset 0 0 18px #fff9e5!important}
 .aqd.ref-food .aqd-stage .aq19-product-art,.aqd.ref-food .aqd-stage[data-premium-mode=front] .aq19-product-art{max-width:none!important;width:100%!important;align-self:start!important;position:relative!important;top:0!important;grid-row:2/5!important;filter:drop-shadow(0 9px 6px #7b512c28)!important;min-height:0!important}
 .aqd.ref-food .cin-food-art{max-height:42vh!important;width:100%!important;object-fit:contain!important;box-shadow:none!important;border-radius:9px!important}
 .aqd.ref-food[data-live-plain=true] .cin-food-art{clip-path:polygon(13% 2%,94% 2%,95% 15%,96% 58%,100% 95%,11% 100%,8% 91%,16% 45%,12% 16%);filter:drop-shadow(0 7px 3px #94673c55)}
 .aqd.ref-food .cin-art-note{font-size:clamp(11px,.95vw,15px)!important;line-height:1.3!important}
 .aqd.ref-food .aqd-tabs{grid-column:2!important;justify-self:start!important;background:none!important;border:none!important;box-shadow:none!important;gap:8px!important;padding:0!important;align-self:center!important}
 .aqd.ref-food .aqd-tabs button{font-size:clamp(14px,1.2vw,19px)!important;min-height:36px!important;border-bottom:2px solid transparent!important;border-radius:3px!important;padding:4px 10px!important}
 .aqd.ref-food .aqd-tabs button[aria-pressed=true]{background:none!important;border-bottom-color:#b88437!important;box-shadow:none!important;color:#5b391a!important}
 .aqd.ref-food .aqd-stage .aqd-label{padding:0 0 6px!important;background:none!important;border:none!important;border-radius:0!important;box-shadow:none!important;font:500 clamp(13px,1.1vw,17px)/1.4 system-ui!important}
 .aqd.ref-food .aqd-label h3{font:700 clamp(21px,2.3vw,34px)/1.13 Georgia!important;border-bottom:1px solid #c9a477!important;padding-bottom:9px!important;margin:0 0 7px!important}
 .aqd.ref-food .aqd-label p,.aqd.ref-food .aqd-label small{font-size:clamp(12px,.99vw,16px)!important;line-height:1.3!important;margin:3px 0!important}
 .aqd.ref-food .aqd-label strong{font-size:clamp(11px,.95vw,15px)!important;letter-spacing:.02em!important;color:#70471d!important}
 .aqd.ref-food .aqd-clues{display:flex!important;gap:4px 8px!important;flex-wrap:wrap!important;margin:6px 0 10px!important}
 .aqd.ref-food [data-clue]{font:600 clamp(13px,1.2vw,18px)/1.3 system-ui!important;background:none!important;border:none!important;border-radius:3px!important;border-bottom:1px solid #cda66b80!important;min-height:32px!important;padding:3px 2px!important;box-shadow:none!important}
 .aqd.ref-food [data-clue]:before{content:'□';display:inline-block;margin-right:6px;color:#885c2c}
 .aqd.ref-food [data-clue][aria-pressed=true]{background:#ffe7a3!important;border-bottom:1px solid #b08030!important;color:#543518!important;box-shadow:none!important}
 .aqd.ref-food [data-clue][aria-pressed=true]:before{content:'✓';color:#5e6d31}
 .aqd.ref-food .aqd-stage .aqd-answer{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;border-top:1px solid #c9a477!important;padding-top:8px!important}
 .aqd.ref-food .aqd-answer h3{font:700 clamp(19px,1.8vw,28px) Georgia!important;margin:0!important;grid-column:1/-1!important}
 .aqd.ref-food .aqd-answer [data-answer]{min-height:40px!important;font:700 clamp(12px,1.05vw,16px)/1.2 Georgia!important;text-align:center!important;background:linear-gradient(#fff6e2,#f2d9b4)!important;border:1px solid #dab484!important;border-radius:25px!important;padding:5px 7px!important;box-shadow:none!important}
 .aqd.ref-food .aqd-feedback{grid-column:1/-1!important;font-size:clamp(12px,1vw,15px)!important}
 .aqd.ref-food .aqd-stage .aqd-source a,.aqd.ref-food .aqd-stage .aqd-source small{font-size:clamp(10px,.85vw,13px)!important}
 .aqd.ref-food .aqd-footer{background:none!important;padding:8px 4% 12px 31%!important;color:#352516!important;box-shadow:none!important}
 .aqd.ref-food .aqd-footer small{color:#4d321c!important;font-size:clamp(11px,.95vw,15px)!important;text-shadow:0 1px #fff1d0}
 .aqd.ref-food #aqd-next,.aqd.ref-food #aqd-submit{min-height:48px!important;font-size:clamp(16px,1.65vw,24px)!important;padding:8px 24px!important;border:2px solid #fff6ce!important;box-shadow:0 3px #a77331,0 0 10px #ffe6a9!important}
 }
 @media(max-height:600px) and (min-aspect-ratio:4/5){#map.aqj .aqj-adventure .aqj-book{top:19%!important;bottom:auto!important;height:68%!important;padding:6px 10px!important;gap:3px!important}#map.aqj .aqj-book .map-play{min-height:31px!important}#map.aqj .aqj-book .aqj-level-num{height:24px!important;width:24px!important}#map.aqj .aqj-book .map-play[data-live-state=current] .live-play{padding:3px 7px}#overlay.cin-complete .cin-end-copy{top:1.2%!important;bottom:9%!important;padding:10px!important;gap:3px!important}#overlay.cin-complete .cin-end-copy h2{padding:4px!important}}
 @media(prefers-reduced-motion:no-preference){#map.aqj .map-play[data-live-state=current]:hover .live-play{filter:brightness(1.15);transition:filter .15s}.aqd.ref-food .aqd-stage[data-live-turned=true] .aq19-product-art{animation:live-inspect .32s ease-out both}@keyframes live-inspect{from{transform:perspective(850px) rotateY(-9deg);opacity:.7}to{transform:none;opacity:1}}}
 `;document.head.append(style);
 const priorMap=renderMap;renderMap=function(){priorMap();for(const card of cards.querySelectorAll('.aqj-book [data-adventure19]')){const b=card.querySelector('.map-play');if(!b)continue;const done=progress.completed[card.dataset.adventure19]?.complete===true;const state=b.disabled?'locked':done?'done':'current';b.dataset.liveState=state;const end=b.lastElementChild;if(state==='current'&&end){end.textContent='▶ Play';end.classList.add('live-play')}else if(state==='done'&&end){end.textContent='✓';end.classList.add('live-done')}}};
 // Restore the real product label rather than substituting generated example text.
 if(dlg){const update=()=>{const st=dlg.querySelector('.aqd-stage');if(!dlg.open||!st||!st.dataset.refReady||st.dataset.liveReady)return;st.dataset.liveReady='true';dlg.dataset.livePlain=String(/Lay.s Classic Potato Chips/i.test(dlg.querySelector('[data-receipt][aria-pressed=true]')?.textContent||''));const back=st.querySelector('[data-side=back]');if(back?.getAttribute('aria-pressed')==='true')st.dataset.liveTurned='true';const close=dlg.querySelector('header button');if(close){close.setAttribute('aria-label','Return to room');close.title='Return to room'}const note=st.querySelector('.cin-art-note');if(note)note.textContent=note.textContent.replace(' · illustration',' · reference illustration');};new MutationObserver(update).observe(dlg,{subtree:true,childList:true,attributes:true,attributeFilter:['open']})}
}
