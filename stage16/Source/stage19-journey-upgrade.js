// Final journey presentation: opt-in overview, precise lock instructions,
// drag panning on desktop, and distinct earned-world reveal animations.
if(compiledPack.worlds?.length===12){
 const map=$('#map'),cards=$('#map-cards');
 const add=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
 const style=add('style');style.textContent=`
 #map.aqj .aqj-landscape{cursor:grab;touch-action:pan-x pan-y}
 #map.aqj .aqj-landscape.aqj-dragging{cursor:grabbing;user-select:none}
 #map.aqj .aqj-overview .aqj-landscape{width:var(--aqj-fit-width);min-width:0;margin:0 auto}
 #map.aqj .aqj-map-tip{bottom:118px;background:#152e3bd9}
 #map.aqj .aqj-lock-note{padding:9px 12px;margin:0 0 10px;background:#e6d9b9;border-left:3px solid #a9884f;color:#584b34;font:650 12px/1.4 system-ui}
 #map.aqj .aqj-book-title{letter-spacing:-.015em}
 #map.aqj .aqj-rail button[data-locked=false] small{color:#f0d28d}
 #map.aqj .aqj-rail button[data-locked=true] img{filter:saturate(.45) drop-shadow(0 3px 3px #10242c)}
 #map.aqj #aqj-view-toggle[aria-pressed=true]{background:#f1ce83;color:#263c46}
 #aqj-unlock .aqj-celebration::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,#fff1b234,transparent 65%);pointer-events:none;animation:aqj-light 1.5s ease-out both}
 #aqj-unlock [data-pattern=fan] .aqj-medal{animation:aqj-fan .85s ease-out both}
 #aqj-unlock [data-pattern=drift] .aqj-medal{animation:aqj-drift 1s ease-out both}
 #aqj-unlock [data-pattern=burst] .aqj-medal{animation:aqj-burst .7s ease-out both}
 #aqj-unlock [data-pattern=bounce] .aqj-medal{animation:aqj-bounce .9s ease-out both}
 #aqj-unlock [data-pattern=orbit] .aqj-medal{animation:aqj-orbit 1s ease-out both}
 #aqj-unlock [data-pattern=wave] .aqj-medal{animation:aqj-wave .95s ease-out both}
 #aqj-unlock [data-pattern=trail] .aqj-medal{animation:aqj-trail .85s ease-out both}
 #aqj-unlock [data-pattern=leaves] .aqj-medal{animation:aqj-leaves 1s ease-out both}
 #aqj-unlock [data-pattern=rising] .aqj-medal{animation:aqj-rising .9s ease-out both}
 #aqj-unlock [data-pattern=fireworks] .aqj-medal{animation:aqj-fireworks .9s ease-out both}
 #aqj-unlock [data-pattern=finale] .aqj-medal{animation:aqj-finale 1.15s ease-out both}
 @keyframes aqj-light{from{opacity:0}45%{opacity:1}to{opacity:.5}}
 @keyframes aqj-fan{from{transform:scaleX(.04) rotate(-10deg);opacity:0}70%{transform:scaleX(1.12)}to{transform:none;opacity:1}}
 @keyframes aqj-drift{from{transform:translate(-55px,-65px) rotate(-38deg);opacity:0}to{transform:none;opacity:1}}
 @keyframes aqj-burst{from{transform:scale(.1);opacity:0}65%{transform:scale(1.2);opacity:1}to{transform:none}}
 @keyframes aqj-bounce{from{transform:translateY(-110px);opacity:0}45%{transform:translateY(0) scale(1.15,.8);opacity:1}70%{transform:translateY(-23px)}to{transform:none}}
 @keyframes aqj-orbit{from{transform:rotate(-130deg) translateX(85px) scale(.5);opacity:0}to{transform:none;opacity:1}}
 @keyframes aqj-wave{from{transform:translateX(-45px) rotate(-22deg);opacity:0}55%{transform:translateX(20px) rotate(12deg)}to{transform:none;opacity:1}}
 @keyframes aqj-trail{from{transform:translateX(-150px) skewX(-18deg);opacity:0}75%{transform:translateX(14px)}to{transform:none;opacity:1}}
 @keyframes aqj-leaves{from{transform:translateY(-90px) rotate(35deg);opacity:0}60%{transform:rotate(-13deg)}to{transform:none;opacity:1}}
 @keyframes aqj-rising{from{transform:translateY(65px) scale(.75);opacity:0}to{transform:none;opacity:1}}
 @keyframes aqj-fireworks{from{transform:scale(.2) rotate(-35deg);opacity:0}50%{transform:scale(1.24) rotate(9deg);opacity:1}to{transform:none}}
 @keyframes aqj-finale{from{transform:scale(.1) rotate(-180deg);opacity:0}70%{transform:scale(1.18) rotate(10deg);opacity:1}to{transform:none}}
 #aqj-unlock .aqj-no-motion::before,#aqj-unlock .aqj-no-motion .aqj-medal{animation:none!important}
 @media(prefers-reduced-motion:reduce){#aqj-unlock .aqj-celebration::before,#aqj-unlock .aqj-medal{animation:none!important}}
 `;document.head.append(style);
 let overview=false;
 const toggle=add('button','','Overview');toggle.id='aqj-view-toggle';toggle.type='button';toggle.setAttribute('aria-pressed','false');toggle.hidden=true;map.querySelector('.map-actions').prepend(toggle);
 function size(){const route=cards.querySelector('.aq19-scenic-route');if(!route)return;const can=route.clientWidth>=760&&route.clientHeight>=300;toggle.hidden=!can;if(!can)overview=false;route.classList.toggle('aqj-overview',overview);route.style.setProperty('--aqj-fit-width',Math.floor(Math.min(route.clientWidth,route.clientHeight*1648/928))+'px');toggle.textContent=overview?'Explore map':'Overview';toggle.setAttribute('aria-pressed',String(overview));if(overview){route.scrollLeft=0;route.scrollTop=0}}
 toggle.onclick=()=>{overview=!overview;size()};window.addEventListener('resize',size);
 const prior=renderMap;renderMap=function(){prior();const route=cards.querySelector('.aq19-scenic-route');toggle.hidden=!route;if(route){size();const land=route.querySelector('.aqj-landscape');if(!land)return;let drag=null;land.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button')||overview)return;drag={x:e.clientX,y:e.clientY,left:route.scrollLeft,top:route.scrollTop,id:e.pointerId};land.setPointerCapture(e.pointerId);land.classList.add('aqj-dragging')});land.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;route.scrollLeft=drag.left+drag.x-e.clientX;route.scrollTop=drag.top+drag.y-e.clientY});const end=()=>{drag=null;land.classList.remove('aqj-dragging')};land.addEventListener('pointerup',end);land.addEventListener('pointercancel',end);land.addEventListener('lostpointercapture',end);const tip=cards.querySelector('.aqj-map-tip');if(tip)tip.textContent='Scroll or drag to explore';}
 else{const id=cards.querySelector('[data-adventure19]')?.dataset.adventure19;const i=Math.floor(LEVELS.findIndex(l=>l.id===id)/25);if(i>0){const prev=compiledPack.worlds[i-1];const done=LEVELS.slice(0,compiledPack.worlds[i].start).every(l=>progress.completed[l.id]?.complete===true);if(!done){const count=LEVELS.slice(prev.start,prev.start+prev.count).filter(l=>progress.completed[l.id]?.complete===true).length;const note=add('p','aqj-lock-note',`Finish the earlier worlds to enter. ${prev.name}: ${count}/25 complete.`);cards.querySelector('.aqj-book-title')?.after(note)}}}
 };
}
