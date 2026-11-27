/* Illustrated world journey. UI is live DOM over original generated map art.
   A world opens only after every adventure in all preceding worlds is complete. */
if(compiledPack.worlds?.length===12){
 const journeyWorlds=compiledPack.worlds, journeyCount=journeyWorlds.length;
 const completeBefore=i=>LEVELS.slice(0,i).every(l=>progress.completed[l.id]?.complete===true);
 const worldOpen=i=>i===0||completeBefore(journeyWorlds[i].start);
 const earnedWorlds=()=>journeyWorlds.filter((w,i)=>worldOpen(i)).length;
 // Repair stale or inconsistent unlock counters; legitimate Stage 18 progress migrates.
 let nextIndex=0;while(nextIndex<LEVELS.length&&progress.completed[LEVELS[nextIndex].id]?.complete===true)nextIndex++;
 const legitimate=Math.min(LEVELS.length,nextIndex+1);
 if(progress.unlocked!==legitimate){progress.unlocked=legitimate;persist()}
 const startJourney=startLevel;startLevel=function(i,skip,qa=false){if(!Number.isInteger(i)||i<0||i>=LEVELS.length)return;if(!(qa&&window.__ALLY_ENABLE_QA===true)&&!worldOpen(Math.floor(i/25)))return;return startJourney(i,skip)};
 // Track announcements separately from save progress. Existing completed saves do not replay old celebrations.
 const noticeKey='allyquest.journey.unlocks.v1';let seen=loadJSON(noticeKey,{highest:earnedWorlds()-1});
 if(!Number.isInteger(seen.highest)||seen.highest<0)seen.highest=0;
 const saveSeen=()=>{try{localStorage.setItem(noticeKey,JSON.stringify(seen))}catch{}};
 let pending=-1,focusWorld=Math.max(0,earnedWorlds()-1),scrollPos=null;
 const map=$('#map'),cards=$('#map-cards');
 const spots=[[16,20],[50,27],[15,48],[40,46],[88,34],[76,19],[70,48],[47,65],[16,79],[84,66],[72,86],[90,89]];
 const motifs=['✦','✎','✿','✦','●','✧','♫','➜','❋','✚','✺','★'];
 const colors=['#f4d48a','#ffe9a5','#92dfb7','#ffbd7e','#a5dfef','#b9e5ff','#edb5f4','#99bce9','#bce58b','#a0e8cb','#ffd3a2','#ffe38f'];
 const svgNS='http://www.w3.org/2000/svg';
 const node=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
 const lockIcon=()=>{const s=document.createElementNS(svgNS,'svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.innerHTML='<path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="5" y="10" width="14" height="11" rx="3" fill="currentColor"/><circle cx="12" cy="15" r="1.5" fill="#324049"/>';return s};
 const style=node('style');style.textContent=`
 #map.aqj{padding:0!important;gap:0!important;display:flex;flex-direction:column;overflow:hidden;background:#132a37;color:#fff5df}
 #map.aqj.hidden{display:none!important}
 #map.aqj .map-top{flex:0 0 auto;padding:12px clamp(12px,2.6vw,38px);background:#142d3d;gap:12px;z-index:5;box-shadow:0 3px 10px #051a3380}
 #map.aqj .map-title{font:700 clamp(22px,3vw,35px)/1.1 Georgia,serif;letter-spacing:-.02em;color:#fff4d8;-webkit-text-stroke:0;text-shadow:none}
 #map.aqj .map-kicker{font:700 10px/1.1 system-ui;color:#d6c38f;letter-spacing:.16em;margin-bottom:5px}
 #map.aqj .map-explainer{display:none}
 #map.aqj .map-actions{gap:7px;flex-wrap:wrap;justify-content:flex-end}
 #map.aqj .map-actions button{min-height:36px;width:auto;height:auto;padding:7px 12px;border:1px solid #bfa77180;background:#294454;color:#fff2d3;border-radius:5px;box-shadow:none;font:650 12px/1.2 system-ui;transform:none}
 #map.aqj .map-actions .icon-btn{min-width:38px;font-size:20px;padding:3px 7px}
 #map.aqj .map-actions .score{font:700 14px system-ui;color:#f8da8d;white-space:nowrap;text-shadow:none;background:none;border:0;box-shadow:none;padding:0}
 #map.aqj .map-footer{flex:0 0 auto;min-height:37px;padding:7px 24px;background:#142d3d;color:#e7dbc0;font:600 12px system-ui;box-shadow:0 -3px 10px #14273340;z-index:5}
 #map.aqj .map-progress{background:#38505a;height:5px}#map.aqj .map-progress>div{background:#f5ce70}
 #map.aqj #map-cards{min-height:0;min-width:0;flex:1 1 auto;display:flex;flex-direction:column;gap:0;padding:0;margin:0;overflow:auto;width:100%;max-width:none;align-items:stretch}
 #map.aqj .aq19-scenic-route{display:block;position:relative;flex:1 1 auto;min-height:0;isolation:auto;border:0;border-radius:0;background:#183b49;box-shadow:none;overflow:auto;overscroll-behavior:contain;scrollbar-color:#bca36a #233b46;scrollbar-width:thin}
 #map.aqj .aq19-scenic-route:before{display:none}
 #map.aqj .aqj-landscape{position:relative;width:max(100%,1060px);aspect-ratio:1648/928;background-image:var(--journey-art);background-size:100% 100%;background-position:center;isolation:isolate;overflow:hidden}
 #map.aqj .aq19-route-svg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 2px 2px #392f29a0);opacity:1;pointer-events:none}
 #map.aqj .aq19-stop{position:absolute;display:flex;flex-direction:column;align-items:center;gap:5px;justify-content:center;width:44px;height:44px;min-width:44px;min-height:44px;border:3px solid #fff6d7;border-radius:50%;background:linear-gradient(#fcebc4,#e9bf62);color:#453924;box-shadow:0 4px 0 #70532c,0 6px 12px #0d202d90;overflow:visible;z-index:2;padding:0;transform:translate(-50%,-50%);font:800 16px system-ui;text-align:center;filter:none}
 #map.aqj .aq19-stop svg{height:19px;width:19px;pointer-events:none}
 #map.aqj .aq19-stop .aqj-name{position:absolute;top:calc(100% + 7px);left:50%;transform:translateX(-50%);background:#fff0d2;color:#302d23;border:1px solid #a98c50;border-radius:5px;box-shadow:0 2px 5px #1a30397d;padding:4px 8px;font:700 12px/1.2 Georgia,serif;white-space:nowrap;pointer-events:none}
 #map.aqj .aq19-stop[data-locked=true]{background:linear-gradient(#a8b4b7,#65777c);border-color:#d9dfd9;color:#f3f1e6;box-shadow:0 4px 0 #394f57,0 5px 12px #142d3d80}
 #map.aqj .aq19-stop[data-locked=true] .aqj-name{background:#e1dfd4;color:#435057;border-color:#849398}
 #map.aqj .aq19-stop[data-current=true]{box-shadow:0 0 0 7px #ffed8f66,0 4px 0 #8f662b,0 5px 16px #1b2525c4}
 #map.aqj .aq19-stop:hover,#map.aqj .aq19-stop:focus-visible{transform:translate(-50%,-53%) scale(1.1);z-index:4;outline:3px solid #fff4c0;outline-offset:4px}
 #map.aqj .aqj-map-tip{position:absolute;right:16px;bottom:118px;background:#152e3bc9;color:#fff1d2;padding:6px 10px;font:600 11px system-ui;border-radius:4px;pointer-events:none;z-index:4}
 #map.aqj .aqj-rail{flex:0 0 auto;background:#193642;display:flex;gap:0;overflow-x:auto;padding:4px 12px 6px;scrollbar-width:thin;scrollbar-color:#bca36a #233b46}
 #map.aqj .aqj-rail button{position:relative;flex:0 0 170px;min-height:66px;background:transparent;border:0;border-right:1px solid #7d918f45;color:#f9ead0;display:grid;grid-template-columns:40px 1fr;gap:7px;align-items:center;text-align:left;padding:5px 10px;font:700 12px/1.2 system-ui;cursor:pointer}
 #map.aqj .aqj-rail button[data-locked=true]{color:#c6ccca}#map.aqj .aqj-rail button:hover,#map.aqj .aqj-rail button:focus-visible{background:#34525a;outline:2px solid #efd08a;outline-offset:-2px}
 #map.aqj .aqj-rail .aq19-world-character{position:static;width:40px!important;height:56px!important;object-fit:contain;filter:drop-shadow(0 3px 3px #10242c);transform:none!important}
 #map.aqj .aqj-rail small{display:block;font:500 11px system-ui;color:#c4cdc5;margin-top:4px}
 #map.aqj .aqj-rail .aqj-number{color:#e9c882;font:700 23px Georgia;text-align:center}
 #map.aqj .aqj-adventure{position:relative;flex:1 0 auto;min-height:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,43%);align-items:center;gap:24px;padding:clamp(16px,4vw,54px);background:linear-gradient(90deg,#0d27363b,#1029382b 45%,#152a3d70),var(--scene) center/cover no-repeat;isolation:isolate}
 #map.aqj .aq19-chapter-hero{display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;grid-column:auto;min-height:350px;height:100%;position:relative;background:none;border:0;box-shadow:none;padding:0;overflow:visible;border-radius:0}
 #map.aqj .aq19-chapter-hero>div{z-index:2;position:relative;text-shadow:0 2px 8px #142a37}
 #map.aqj .aq19-chapter-hero strong{font:700 clamp(30px,4vw,52px)/1.06 Georgia,serif;color:#fff4dc}
 #map.aqj .aq19-chapter-hero p{display:none}
 #map.aqj .aq19-chapter-hero img{position:absolute;right:11%;bottom:8%;width:70%;height:85%;max-height:470px;max-width:360px;object-fit:contain;object-position:bottom;filter:drop-shadow(0 12px 7px #142c3970)}
 #map.aqj .aqj-book{padding:20px 20px 15px;background:linear-gradient(135deg,#fff3d9,#f0e1bd);color:#2a352e;border:2px solid #ad8950;border-radius:9px;box-shadow:0 12px 27px #142a3b90,inset 0 0 0 3px #fffbeb;position:relative;min-width:0}
 #map.aqj .aq19-world-nav{margin:0 0 8px;gap:9px;color:#5f5846;display:flex}
 #map.aqj .aq19-world-nav button{border:0;background:none;box-shadow:none;color:#384e56;font:700 13px system-ui;padding:6px 0;min-height:40px}
 #map.aqj .aq19-nav-label{font:600 11px system-ui;color:#695e45}
 #map.aqj .aqj-book-title{font:700 24px Georgia,serif;margin:0 0 9px;color:#394139;border-bottom:1px solid #bca879;padding-bottom:12px}
 #map.aqj .aq19-chapters{display:flex;gap:0;overflow:auto;margin:0 0 9px;scrollbar-width:thin;border-bottom:1px solid #bca879}
 #map.aqj .aq19-chapters button{background:none;color:#60563d;border:0;border-radius:0;min-height:41px;flex:1 0 40px;padding:6px;font:700 13px system-ui;white-space:nowrap}
 #map.aqj .aq19-chapters button[aria-pressed=true]{background:#edc471;color:#493b26;border-bottom:2px solid #9d763a}
 #map.aqj .aqj-chapter-name{font:600 13px Georgia,serif;margin:4px 0 8px;color:#716145}
 #map.aqj .map-card{display:flex;flex-direction:row;min-height:0;margin:0;border:0;border-radius:0;box-shadow:none;background:transparent;color:#2f3b35;filter:none;transform:none!important;border-bottom:1px solid #bca87966;padding:0;align-items:center;overflow:visible}
 #map.aqj .map-card:last-child{border-bottom:0}
 #map.aqj .map-card-image{display:none}
 #map.aqj .map-card-copy{padding:0;display:flex;flex:1;min-width:0;align-items:center;gap:10px;justify-content:space-between}
 #map.aqj .map-card-copy h3{margin:0;min-width:0;font:700 16px/1.2 Georgia,serif;color:#2d3d35;text-shadow:none}
 #map.aqj .map-card-copy p,#map.aqj .map-status{display:none}
 #map.aqj .map-play{width:100%;min-width:0;min-height:52px;display:flex;gap:10px;align-items:center;text-align:left;justify-content:space-between;background:none;border:0;border-radius:0;box-shadow:none;margin:0;padding:10px 8px;color:#354039;font:700 15px/1.2 Georgia,serif;transform:none;opacity:1}
 #map.aqj .map-play svg{flex:0 0 19px;width:19px;height:19px;color:#72694e}
 #map.aqj .map-play:not(:disabled){background:#f2ca73;border-radius:5px;color:#392e1b;box-shadow:inset 0 1px #fff2ca}
 #map.aqj .map-play:not(:disabled):hover{background:#ffe09a}
 #map.aqj .map-play:disabled{color:#777160;cursor:default}
 #map.aqj .aqj-level-num{flex:0 0 22px;font:700 12px system-ui;color:#846c3f}
 #map.aqj .aqj-level-name{flex:1;min-width:0}
 #map.aqj .aqj-world-lock{filter:none}
 #map.aqj button:focus-visible{outline:3px solid #bb791c;outline-offset:2px}
 #aqj-unlock{position:fixed;inset:0;max-width:none;max-height:none;width:100%;height:100%;border:0;background:#152a3d;padding:0;color:#fff5df;overflow:hidden;z-index:10000;box-sizing:border-box}
 #aqj-unlock::backdrop{background:#0e243acc}
 #aqj-unlock .aqj-celebration{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:linear-gradient(#12263730,#112b3db0),var(--unlock-scene) center/cover;padding:25px;overflow:hidden}
 #aqj-unlock .aqj-unlock-title{position:relative;margin:14px 0 6px;font:700 clamp(35px,6vw,72px)/1.04 Georgia,serif;text-shadow:0 3px 15px #0c233d;color:#fff2c7}
 #aqj-unlock .aqj-unlock-kicker{position:relative;color:#ffe09b;font:700 14px system-ui;letter-spacing:.16em;text-shadow:0 2px 6px #0b2737}
 #aqj-unlock .aqj-medal{position:relative;display:grid;place-items:center;width:100px;height:100px;border:4px solid #fff0ba;border-radius:50%;background:linear-gradient(#fff0b8,#dba94e);color:#7d531d;font:700 54px Georgia;box-shadow:0 0 60px #ffe5a0a8,0 6px 0 #aa7336;animation:aqj-medal .85s cubic-bezier(.2,.8,.2,1) both}
 #aqj-unlock .aqj-portrait{position:relative;height:min(28vh,220px);width:180px;object-fit:contain;filter:drop-shadow(0 9px 5px #142b3d90);animation:aqj-portrait .8s .15s both}
 #aqj-unlock button{position:relative;background:linear-gradient(#ffe3a1,#e9b34d);border:2px solid #fff3ce;border-radius:7px;padding:13px 28px;min-height:48px;color:#43351d;font:800 16px system-ui;box-shadow:0 4px #8f6236;cursor:pointer;margin-top:12px}
 #aqj-unlock .aqj-spark{position:absolute;left:50%;top:45%;color:var(--spark);font-size:var(--size);pointer-events:none;animation:aqj-spark var(--time) ease-out var(--delay) both}
 @keyframes aqj-medal{0%{transform:scale(.3) rotate(-26deg);opacity:0}65%{transform:scale(1.14) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0)}}
 @keyframes aqj-portrait{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
 @keyframes aqj-spark{0%{transform:translate(0,0) scale(.2);opacity:0}25%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--spin));opacity:0}}
 @media(max-width:760px){#map.aqj .map-top{padding:8px 10px;align-items:flex-start}#map.aqj .map-actions{max-width:58%;gap:4px}#map.aqj .map-actions button{font-size:10px;padding:5px 7px;min-height:33px}#map.aqj .map-actions .icon-btn{min-width:34px;font-size:16px}#map.aqj .aqj-map-tip{bottom:105px;right:8px}#map.aqj .map-footer{padding:7px 12px;font-size:10px}#map.aqj .aqj-adventure{grid-template-columns:1fr;gap:12px;padding:12px;align-items:start;min-height:100%;background-attachment:local}#map.aqj .aq19-chapter-hero{min-height:160px;height:170px}#map.aqj .aq19-chapter-hero img{height:100%;right:6%;width:35%}#map.aqj .aq19-chapter-hero strong{font-size:30px;max-width:70%;display:block}#map.aqj .aqj-book{padding:12px}#map.aqj .map-play{min-height:48px}#map.aqj .aqj-rail button{flex-basis:145px;min-height:56px}#map.aqj .aqj-rail .aq19-world-character{height:48px!important}}
 #aqj-unlock .aqj-no-motion *{animation:none!important;transition:none!important}
 @media(prefers-reduced-motion:reduce){#map.aqj *,#aqj-unlock *{animation:none!important;transition:none!important;scroll-behavior:auto!important}#aqj-unlock .aqj-spark{display:none}}
 `;document.head.append(style);map.classList.add('aqj');
 function showUnlock(i){if(i<=0||i>=journeyCount||!worldOpen(i)||i<=seen.highest)return;const w=journeyWorlds[i];const d=node('dialog');d.id='aqj-unlock';d.setAttribute('aria-labelledby','aqj-unlock-name');const body=node('div','aqj-celebration');body.style.setProperty('--unlock-scene',`url("${ASSET_URLS[w.backdrop]}")`);body.style.setProperty('--spark',colors[i]);
  const reduced=preferences.reducedMotion||matchMedia('(prefers-reduced-motion:reduce)').matches;body.dataset.pattern=['ribbon','fan','drift','burst','bounce','orbit','wave','trail','leaves','rising','fireworks','finale'][i];if(reduced)body.classList.add('aqj-no-motion');
  if(!reduced){for(let j=0;j<32;j++){const p=node('span','aqj-spark',j%4===0?motifs[i]:'✦');const a=j*Math.PI*2/32,r=120+(j%6)*53;let dx=Math.cos(a)*r,dy=Math.sin(a)*r*.72;if(i===1){dx=(j-15.5)*21;dy=-90-Math.sin(j*Math.PI/31)*190}else if(i===2||i===8){dx=(j%8-3.5)*91;dy=160+(j%6)*40}else if(i===4){dx=(j%2?1:-1)*(100+j*7);dy=-40-Math.abs(Math.sin(j*.9))*250}else if(i===5){dx=Math.cos(a)*r*1.25;dy=Math.sin(a)*r*.50}else if(i===6){dx=(j-15.5)*24;dy=Math.sin(j*.8)*130}else if(i===7){dx=(j%2?1:-1)*(130+j*12);dy=(j%4-1.5)*38}else if(i===9){dx=(j%8-3.5)*72;dy=-120-(j%5)*44}else if(i>=10){dx=Math.cos(a)*r*1.25;dy=Math.sin(a)*r*.90}p.style.cssText=`--dx:${dx}px;--dy:${dy}px;--spin:${j*31}deg;--size:${13+j%4*7}px;--delay:${j%6*.065}s;--time:${1.4+j%5*.12}s;--spark:${j%3===0?'#fff1c7':colors[i]}`;body.append(p)}}
  body.append(node('div','aqj-medal',motifs[i]),node('div','aqj-unlock-kicker','NEW WORLD UNLOCKED'));const title=node('h2','aqj-unlock-title',w.name);title.id='aqj-unlock-name';body.append(title);if(w.character){const portrait=node('img','aqj-portrait');portrait.src=ASSET_URLS[w.character+'_00'];portrait.alt=w.friend;body.append(portrait)}const b=node('button','','Explore '+w.name);b.type='button';body.append(b);d.append(body);document.querySelector('#game').append(d);
  const close=()=>{seen.highest=Math.max(seen.highest,i);saveSeen();pending=-1;d.close();d.remove();const target=cards.querySelector(`[data-world19="${w.id}"]`);if(target){target.click();}else cards.querySelector('#aq19-back-worlds')?.focus({preventScroll:true})};
  b.onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close()});d.showModal();b.focus({preventScroll:true});}
 const originalWin=winLevel;winLevel=function(){const old=earnedWorlds();originalWin();const now=earnedWorlds();if(now>old&&now-1>seen.highest){pending=now-1;focusWorld=pending;const next=$('[data-end-next]');if(next){next.textContent='Unlock '+journeyWorlds[pending].name+' ›';const cb=next.onclick;next.onclick=()=>{cb?.();if(!$('#aqj-unlock'))showUnlock(pending)}}}};
 const prevRender=renderMap;renderMap=function(){const existing=cards.querySelector('.aq19-scenic-route');if(existing)scrollPos={left:existing.scrollLeft,top:existing.scrollTop};prevRender();
  const buttons=[...cards.querySelectorAll('[data-world19]')];
  if(buttons.length){const route=cards.querySelector('.aq19-scenic-route');if(!route)return;route.replaceChildren();route.setAttribute('aria-label','Scrollable illustrated world map');route.tabIndex=0;const land=node('div','aqj-landscape');land.style.setProperty('--journey-art',`url("${AQ_JOURNEY_ART}")`);route.append(land);
   const svg=document.createElementNS(svgNS,'svg');svg.classList.add('aq19-route-svg');svg.setAttribute('viewBox','0 0 1648 928');svg.setAttribute('aria-hidden','true');const coords=spots.map(([x,y])=>[x*16.48,y*9.28]);const pathFor=(arr)=>arr.map(([x,y],i)=>{if(!i)return 'M'+x+' '+y;const [px,py]=arr[i-1],dx=x-px,dy=y-py;return `C${px+dx*.28} ${py+dy*.06} ${px+dx*.72} ${py+dy*.94} ${x} ${y}`}).join(' ');
   for(const [arr,stroke,width,dash] of [[coords,'#514e3970',7,''],[coords,'#f8e9c7',4,'7 9'],[coords.slice(0,earnedWorlds()),'#f6c652',7,'']]){const path=document.createElementNS(svgNS,'path');path.setAttribute('d',pathFor(arr));path.setAttribute('stroke',stroke);path.setAttribute('stroke-width',width);path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');path.setAttribute('fill','none');if(dash)path.setAttribute('stroke-dasharray',dash);svg.append(path)}land.append(svg);
   const rail=node('div','aqj-rail');rail.setAttribute('aria-label','Worlds');
   buttons.forEach((b,i)=>{const w=journeyWorlds[i],open=worldOpen(i),done=LEVELS.slice(w.start,w.start+w.count).filter(l=>progress.completed[l.id]?.complete).length;const original=b.onclick;b.replaceChildren();b.className='aq19-stop';b.dataset.worldIndex=String(i);b.dataset.locked=String(!open);b.dataset.current=String(open&&done<25&&i===earnedWorlds()-1);b.style.setProperty('--px',spots[i][0]+'%');b.style.setProperty('--py',spots[i][1]+'%');b.setAttribute('aria-label',`${w.name}, ${done} of 25 complete${open?'':', locked'}`);b.append(open?node('span','',done===25?'✓':String(i+1)):lockIcon(),node('span','aqj-name',w.name));b.onclick=()=>{focusWorld=i;original?.()};land.append(b);
    const item=node('button');item.type='button';item.dataset.locked=String(!open);item.dataset.railWorld=String(i);if(w.character){const im=node('img','aq19-world-character');im.src=ASSET_URLS[w.character+'_00'];im.alt='';item.append(im)}else item.append(node('span','aqj-number','01'));const t=node('span','',w.name);t.append(node('small','',open?`${done}/25`:'Locked'));item.append(t);item.onclick=()=>b.click();rail.append(item)});
   cards.append(rail);const tip=node('div','aqj-map-tip','Scroll to explore');cards.append(tip);if(scrollPos){route.scrollLeft=scrollPos.left;route.scrollTop=scrollPos.top}else if(focusWorld>0){const [x,y]=spots[focusWorld];route.scrollLeft=Math.max(0,x/100*land.offsetWidth-route.clientWidth/2);route.scrollTop=Math.max(0,y/100*land.offsetHeight-route.clientHeight/2)}
  }else{const first=cards.querySelector('[data-adventure19]');const idx=LEVELS.findIndex(l=>l.id===first?.dataset.adventure19);if(idx<0)return;const wi=Math.floor(idx/25),w=journeyWorlds[wi];const banner=cards.querySelector('.aq19-chapter-hero'),nav=cards.querySelector('.aq19-world-nav'),tabs=cards.querySelector('.aq19-chapters'),levels=[...cards.querySelectorAll('[data-adventure19]')];if(!banner||!nav||!tabs)return;if(!banner.querySelector('img')){const hero=node('img');hero.src=ASSET_URLS[(progress.selected||'ethan')+'_00'];hero.alt='';banner.append(hero)}const layout=node('section','aqj-adventure');layout.style.setProperty('--scene',`url("${ASSET_URLS[w.backdrop]}")`);const book=node('div','aqj-book');book.append(nav,node('h2','aqj-book-title','Adventures'),tabs);const selected=tabs.querySelector('[aria-pressed=true]');book.append(node('p','aqj-chapter-name',selected?.textContent?.replace(/^\d+\s*·\s*/, '')||''));for(const tab of tabs.querySelectorAll('button')){tab.title=tab.textContent;tab.textContent=String(Number(tab.dataset.chapter19)+1);tab.setAttribute('aria-label',tab.title)}
   levels.forEach(card=>{const i=LEVELS.findIndex(l=>l.id===card.dataset.adventure19),b=card.querySelector('.map-play'),copy=card.querySelector('.map-card-copy'),h=copy?.querySelector('h3');if(!b||!copy)return;const enabled=worldOpen(wi)&&i<progress.unlocked,done=progress.completed[LEVELS[i].id]?.complete===true;b.disabled=!enabled;card.classList.toggle('locked',!enabled);h?.remove();b.replaceChildren(node('span','aqj-level-num',String(i-w.start+1).padStart(2,'0')),node('span','aqj-level-name',LEVELS[i].name),enabled?node('span','',done?'✓':'▶'):lockIcon());b.setAttribute('aria-label',`${LEVELS[i].name}${enabled?done?', completed':', play':', locked'}`);book.append(card)});layout.append(banner,book);cards.replaceChildren(layout);cards.scrollTop=0;}
  if(pending>seen.highest&&!$('#aqj-unlock')&&gameMode==='map')showUnlock(pending);
 };
 if(window.__ALLY_ENABLE_QA===true)window.ALLY_JOURNEY_QA={open:i=>worldOpen(i),earned:earnedWorlds,art:()=>AQ_JOURNEY_ART.startsWith('data:image/webp;base64,'),seedBoundary:i=>{progress.completed={};for(let j=0;j<i;j++)progress.completed[LEVELS[j].id]={complete:true,stars:3};progress.unlocked=Math.min(LEVELS.length,i+1);seen.highest=earnedWorlds()-1;pending=-1;persist();},finish:()=>winLevel(),normalStart:i=>startLevel(i,false),seen:()=>seen.highest};
}
