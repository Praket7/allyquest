/* Expansion-only presentation and compatibility. Do not alter the original 5-room engine paths. */
if(compiledPack.levels.length>6){
  const isExpanded=r=>!!r&&!!compiledPack.rooms[r.task.id]?.graph;
  const prevPeerLine=peerLine;peerLine=function(id){return compiledPack.rooms[id]?.graph?compiledPack.rooms[id].story[1]:prevPeerLine(id)};
  const originalMeter18=drawMeter;drawMeter=function(){
    const nav=$('#level-meter');nav.replaceChildren();nav.setAttribute('aria-label','Adventure progress');
    const group=Math.floor(loadedLevel/5),first=group*5,last=Math.min(LEVELS.length,first+5);
    const label=el('span','aq18-meter-label',`CH ${group+1} · ${loadedLevel+1}/${LEVELS.length}`);nav.append(label);
    for(let i=first;i<last;i++){const l=LEVELS[i],b=el('button','level-dot'+(i===loadedLevel?' active':progress.completed[l.id]?' done':i<progress.unlocked?' available':' locked'),String(i+1));b.title=l.name;b.disabled=i>=progress.unlocked;b.onclick=()=>{if(!world.state.winning)selectMap()};nav.append(b)}
  };
  const mapBase=renderMap;renderMap=function(){mapBase();const cards=$('#map-cards');const original=[...cards.children];cards.replaceChildren();const names=['The first festival','A place at the table','Learning together','Speaking up','The neighborhood promise'];for(let j=0;j<5;j++){const h=el('h2','aq18-map-group',`CHAPTER ${j+1}  ·  ${names[j]}`);cards.append(h,...original.slice(j*5,j*5+5));}document.querySelector('.map-explainer').textContent='25 adventures. One neighborhood. Every friend belongs.';const banner=document.querySelector('.aq-campaign');if(banner){banner.querySelector('.aq-campaign-count b').textContent=festivalCount()+'/'+Object.keys(ROOM_META).length;const badge=banner.querySelector('.aq-scrapbook-link span');if(badge)badge.textContent=charmCount()+'/'+Object.keys(ROOM_META).length+' charms';banner.querySelector('p').textContent='Help the crew prepare a festival, then take the lessons into the neighborhood.';}};
  const oldScrap18=openScrapbook;openScrapbook=function(){oldScrap18();for(const n of document.querySelectorAll('.aq-scrap-summary strong,.aq-crew-favors'))n.textContent=n.textContent.replace('/11','/'+Object.keys(ROOM_META).length);};
  // A graph emergency must offer the immediate accessible action without depending on the old room ID.
  const oldHUD18=roomHUD;roomHUD=function(){oldHUD18();if(isExpanded(room)&&compiledPack.rooms[room.task.id].education.emergency){const live=!graphFor(room).nodes[room.trace.graph.node].complete;urgent.hidden=!live;if(live&&access.open)closeAccess(false);}};
  const oldUrgent18=urgent.onclick;urgent.onclick=()=>{if(isExpanded(room)&&compiledPack.rooms[room.task.id].education.emergency){closeAccess(false);roomGo(roomObject('adult'));}else oldUrgent18?.();};
  // The same animated peer is allowed to walk, converse and hold a pose in each room.
  // Stage 16 profiles choose their destinations and movement speeds; no NPC makes food decisions.
  const prevDrawDetail18=drawDetailedItem;drawDetailedItem=function(o){prevDrawDetail18(o);if(!isExpanded(room))return;if(['package','jar','crate','bin'].includes(o.type)){const label=o.label;const max=o.type==='label'?140:62;const fs=o.type==='label'?10:8;const Y=o.type==='label'?-22:o.type==='bin'?-41:o.type==='package'?-40:o.type==='jar'?-37:o.type==='crate'?-34:-23;rrect(-max/2-2,Y-10,max+4,14,'#f8f0d9',3);spText(label,0,Y,fs,'#365359',max);}};
  for(const [id,r] of Object.entries(compiledPack.rooms))if(r.graph)AQStudy.roomTopics[id]=r.education.topics||['ask','include'];
  // Graph tasks can be resumed in the current level; the learning guide remains available.
  const oldWin18=winLevel;winLevel=function(){oldWin18();if(loadedLevel===LEVELS.length-1&&world.state.winning){const h=$('#overlay .panel h2');if(h)h.textContent='Welcome Street complete!';}};
}
/* Architectural polish: textured geometry and authored wall fixtures, not a raster interior. */
if(compiledPack.levels.length>6){
 const oldShell18=realisticRoomShell,shell18=new Map();
 realisticRoomShell=function(t,kind){const a=compiledPack.archetypes?.[kind];if(!a)return oldShell18(t,kind);const key=kind+'-'+materialRevision;let im=shell18.get(key);if(!im){im=document.createElement('canvas');im.width=1280;im.height=720;const prev=rx;rx=im.getContext('2d');try{
  const setting=world.backdrop?.slice(3)||'community',wood=['library','community','festival'].includes(setting),lab=['market','school'].includes(setting);
  rrect(0,0,1280,306,rgrad(0,0,306,t.wall,t.tile),0);texRect(lab?'ceramic':'plaster',0,23,1280,274,.37);rrect(0,0,1280,15,t.trim,0);rrect(0,15,1280,7,'#f6ead6',0);rrect(0,225,1280,74,t.side+'34',0);
  for(let x=12;x<1280;x+=90){rrect(x,235,73,53,t.top+'45',3);rline(x+8,244,x+65,244,'#fdf4df88',1)}rrect(0,220,1280,6,t.side+'8c',1);rrect(0,298,1280,8,t.side,0);
  const g=rx.createLinearGradient(0,23,0,96);g.addColorStop(0,'#23222340');g.addColorStop(1,'#23222300');rrect(0,23,1280,73,g,0);
  for(const f of a.wall){const {x,y,w,h}=f;if(f.kind==='window'){wallWindow(x,y,w,h,t);const glow=rx.createLinearGradient(x,y,x+w,y+h);glow.addColorStop(0,'#fff8d92a');glow.addColorStop(1,'#ffffff00');rrect(x+5,y+5,w-10,h-10,glow,2)}else if(f.kind==='panel'){paperNotice(x,y,w,h,f.title,f.lines,t.trim);rline(x+12,y+h-10,x+w-12,y+h-10,t.trim+'30',1);}
   else if(f.kind==='shelf'){softShadow(x+w/2,y+h+9,w*.56,15,.23);rrect(x-5,y-5,w+10,h+10,t.side,4);texRect('oak',x,y,w,h,.62);rrect(x+6,y+5,w-12,h-11,'#3f3b3039',2);shelfLine(x-5,y+h,w+10);
    if(setting==='library'){for(let j=0;j<Math.floor((w-12)/19);j++){const bh=26+(j*23)%Math.max(26,h-32),X=x+10+j*19;const c=['#678a9c','#ae8c69','#7f9d80','#9885a3','#b7a063'][j%5];rrect(X,y+h-bh,15,bh-2,rgrad(0,y+h-bh,bh,c,t.side),2);rline(X+2,y+h-bh+9,X+13,y+h-bh+9,'#eae4cfb0',2);}}
    else if(setting==='market'||setting==='school'){for(let j=0;j<Math.floor(w/48);j++)jarAt(x+25+j*48,y+h-2,Math.min(h-15,32+(j*7)%22),['#9ab4ac','#bca986','#a4afc1'][j%3],['A','B','C'][j%3]);}
    else {for(let j=0;j<Math.floor(w/52);j++){const X=x+9+j*52,H=29+j%3*9,c=['#c7a773','#799c9b','#b08a9c','#97a87a'][j%4];rrect(X,y+h-H,43,H,rgrad(0,y+h-H,H,c,t.side),3);rrect(X-1,y+h-H-3,45,6,'#f1e3c7',2);rrect(X+10,y+h-H+12,23,9,'#f7eed6',2)}}}
   else if(f.kind==='plant')plant(x+w/2,y+h,.79);}
  // Lamps and subtle fixtures stay on the wall. Real floor remains a navigable projected plane.
  for(const x of [190,1210]){rrect(x-14,66,28,8,t.side,4);rrect(x-4,74,8,23,'#b6a17b',2);rrect(x-21,93,42,19,'#e8d4a8',5);rell(x,113,22,5,'#fff3cd')}
  const step=wood?150:106,dep=wood?30:62;for(let z=0;z<SZ;z+=dep)for(let x=-280-(wood&&Math.floor(z/dep)%2?75:0);x<1550;x+=step){const p=plane(x,z,x+step,Math.min(z+dep,SZ));const i=Math.abs(Math.floor(x/step)*7+Math.floor(z/dep)*3)%4;poly(p,t.floor[i]);texFace(wood?'oak':setting==='park'?'stone':'ceramic',p,.75);poly(p,i===0?'#292c2c14':i===1?'#ffffff12':'#ffffff00','#5c514a65',wood?.7:1.1);rline(...p[0],...p[1],'#fff7df42',1)}
  const sg=rx.createLinearGradient(0,FLOOR,0,sy(180));sg.addColorStop(0,'#31424a31');sg.addColorStop(1,'#31424a00');rrect(0,FLOOR,1280,sy(180)-FLOOR,sg,0);
  for(const f of a.wall.filter(x=>x.kind==='window')){const X=f.x+f.w*.25;poly([[X,306],[X+f.w*.5,306],[X+f.w*.5+145,sy(235)],[X+145,sy(235)]],'#fff6d21c')}
  for(let x=0;x<1280;x+=128){const p=[[x,sy(SZ)],[x+128,sy(SZ)],[x+132,720],[x-4,720]];poly(p,t.floor[1]);texFace(wood?'oak':'ceramic',p,.8);poly(p,'#36291f15','#6b645771',1)}
  }finally{rx=prev}if(shell18.size>=6)shell18.clear();shell18.set(key,im)}rx.drawImage(im,0,0)};
 // A calmer, wide panoramic backdrop avoids the oversized building immediately behind the entrance.
 const priorBackground18=drawBackground;drawBackground=function(){const im=art[world?.backdrop];if(!im?.complete||!im.naturalWidth)return priorBackground18();ctx.save();const y0=-verticalPad,top=Math.max(0,y0),bottom=567;let g=ctx.createLinearGradient(0,y0,0,bottom);g.addColorStop(0,'#94d0ec');g.addColorStop(1,'#d6e5c9');ctx.fillStyle=g;ctx.fillRect(0,y0,cw,bottom-y0+4);let hh=Math.max(360,Math.min(475,cw*im.naturalHeight/im.naturalWidth)),ww=hh*im.naturalWidth/im.naturalHeight;if(ww<cw){ww=cw;hh=ww*im.naturalHeight/im.naturalWidth}let dx=-(ww-cw)*(cam/Math.max(1,world.width-cw));ctx.globalAlpha=.98;ctx.drawImage(im,dx,bottom-hh,ww,hh);ctx.globalAlpha=1;let haze=ctx.createLinearGradient(0,bottom-130,0,bottom);haze.addColorStop(0,'#e9f4de00');haze.addColorStop(1,'#d8e9d54a');ctx.fillStyle=haze;ctx.fillRect(0,bottom-130,cw,130);ctx.restore()};
}
