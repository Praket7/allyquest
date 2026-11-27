/* Ally Quest: dimensional finishing, in-world animation and quieter room HUD.
 * Decorative only: uses existing floor plans, collision footprints and quest rules.
 * Full lesson detail is retained behind the keyboard-operable Info control.
 */
if (compiledPack.levels.length > 6) {
  const aqF = { 
    walnut:'#9c7452', brass:'#b78e5c', graphite:'#425762', pearl:'#dce4df',
    steel:'#879fa3', teal:'#648f91', shadow:'#203b43', sand:'#ead7b4'
  };
  function aqLine(x,y,x2,y2,color,width=1){rx.save();rx.strokeStyle=color;rx.lineWidth=width;rx.lineCap='round';rx.beginPath();rx.moveTo(x,y);rx.lineTo(x2,y2);rx.stroke();rx.restore()}
  function aqEllipse(x,y,ww,hh,top,edge){rx.save();const g=rx.createLinearGradient(x,y-hh,x,y+hh);g.addColorStop(0,top);g.addColorStop(1,edge);rx.fillStyle=g;rx.beginPath();rx.ellipse(x,y,ww,hh,0,0,Math.PI*2);rx.fill();rx.strokeStyle='#20343d3b';rx.lineWidth=1;rx.stroke();rx.restore()}
  function aqRounded(x,y,w,h,top,bottom,r=5){rx.save();let g=rx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);rx.fillStyle=g;rx.beginPath();rx.roundRect(x,y,w,h,r);rx.fill();rx.restore()}
  function aqSpecular(x,y,ww,hh){rx.save();rx.strokeStyle='#ffffff9a';rx.lineWidth=1.5;rx.beginPath();rx.ellipse(x,y,ww,hh,-.2,Math.PI*1.15,Math.PI*1.75);rx.stroke();rx.restore()}
  function aqScrew(x,y){aqEllipse(x,y,2.5,2,'#f4f0da','#657b81');aqLine(x-1,y+1,x+1,y-1,'#4e6063',.8)}
  function aqLeaf(x,y,scale=1){rx.save();rx.translate(x,y);rx.scale(scale,scale);rx.strokeStyle='#55785e';rx.lineWidth=2;rx.beginPath();rx.moveTo(0,0);rx.quadraticCurveTo(8,-17,14,-25);rx.stroke();rx.fillStyle='#79ad79';for(let i=0;i<3;i++){rx.beginPath();rx.ellipse(5+i*7,-13-i*6,9,4,-.55,0,Math.PI*2);rx.fill()}rx.restore()}
  // World-anchored details inside existing fixture bounds. Decorative pieces cannot
  // affect navigation, interaction hit boxes, or accessible object alternatives.
  const priorFurniture18=furnitureModel;
  furnitureModel=function(f,p){
    priorFurniture18(f,p);
    const s=f.style, h=fixtureHeight(f), X=sx(f.x,f.z), Y=sy(f.z+f.d/2),
      left=sx(f.x-f.w/2,f.z+f.d/2),right=sx(f.x+f.w/2,f.z+f.d/2),
      W=Math.abs(right-left);
    if(!Number.isFinite(W)||W<8)return;
    rx.save();
    if(['student-desk','teacher-desk','staff-desk','art-table','reading-circle','circle-table','picnic-table','lunch-table','banquet'].includes(s)){
      // Rolled solid-wood edge with gentle finish reflection and visible joinery.
      aqLine(left+5,Y-h+3,right-5,Y-h+3,'#f6dfb3ad',2);
      aqLine(left+7,Y-h+8,right-7,Y-h+8,'#71553e66',1.2);
      if(s==='student-desk'){
        aqRounded(X-W*.23,Y-h+15,W*.46,3,'#cfaa77','#916e4c',1);
        aqScrew(left+9,Y-h+13);aqScrew(right-9,Y-h+13);
        // Padded chair back partly visible behind the writing surface.
        aqRounded(X-W*.21,Y-h-14,W*.42,7,'#a9cad0','#607c82',5);
      } else {aqScrew(left+10,Y-h+10);aqScrew(right-10,Y-h+10)}
    }
    if(['lab-bench','lab-island','clinic-cabinet','service-counter','receiving-counter','filing-counter','conveyor','locker'].includes(s)){
      aqLine(left+8,Y-h+3,right-8,Y-h+3,'#f3faf1bf',2);
      aqLine(left+8,Y-h+12,right-8,Y-h+12,'#3b596a66',1);
      if(s==='conveyor'){
        // Rounded rollers with narrow highlights; respects conveyor bounds.
        for(let j=0;j<Math.min(17,Math.floor(W/15));j++){
          const x=left+13+j*(W-26)/Math.max(1,Math.min(17,Math.floor(W/15))-1);
          aqEllipse(x,Y-h+7,4,2,'#d5e6e4','#526b72');
        }
      }else for(let j=0;j<Math.min(6,Math.max(2,Math.floor(W/70)));j++){
        let xx=left+(j+.5)*W/Math.max(2,Math.min(6,Math.floor(W/70)));
        aqRounded(xx-9,Y-h+23,18,3,'#f7f5e8','#9caca9',2);
      }
    }
    if(['sofa','seat-bank','music-chair'].includes(s)){
      const c=s==='sofa'?'#d4c0c5':'#aecbd1';
      for(let j=1;j<4;j++){
        const x=left+j*W/4;aqLine(x,Y-h+6,x,Y-h+20,'#415b6866',1.4);
      }
      aqLine(left+7,Y-h+5,right-7,Y-h+5,c,2);
      aqEllipse(left+12,Y-9,5,2,'#f1ece4','#657b86');aqEllipse(right-12,Y-9,5,2,'#f1ece4','#657b86');
    }
    if(s==='bleachers'){
      // Steel edge tubes / rounded row caps emphasize seating rather than tables.
      for(let row=0;row<3;row++){
        const y=Y-h+14+row*19;
        aqRounded(left+11,y,W-22,4,'#d6e3e7','#567a8d',2);
        for(const x of [left+15,right-15])aqScrew(x,y+6);
      }
    }
    if(s==='music-stand'||s==='instrument-stand'){
      aqLine(X,Y-h+9,X,Y-10,'#dbe5e3aa',2);
      aqRounded(X-W*.28,Y-h+8,W*.56,4,'#c0ccd0','#4c6170',2);
      if(s==='music-stand'){
        for(let line=0;line<3;line++)aqLine(X-W*.2,Y-h+19+line*5,X+W*.2,Y-h+19+line*5,'#e6dfc4af',1);
      }
    }
    if(['equipment-cart','packing-cart','book-cart','gift-cart','instrument-stand'].includes(s)){
      for(const x of [left+12,right-12]){
        aqEllipse(x,Y+3,6,5,'#60717a','#25343a');aqEllipse(x,Y+3,2.1,2.1,'#dee3dc','#7b9499');
      }
      aqLine(left+9,Y-h+9,right-9,Y-h+9,'#edf3e89e',1.6);
    }
    if(s==='exam-bed'){
      // Pillow and fabric seam over the actual exam-bed surface.
      aqRounded(X-W*.38,Y-h-9,W*.26,9,'#f9fcf7','#b7d6d4',5);
      aqLine(left+11,Y-h+2,right-11,Y-h+2,'#f4fff5a9',2);
    }
    if(s==='easel'){
      const ww=Math.min(48,W*.48),cy=Y-h-9;
      aqRounded(X-ww/2,cy-13,ww,22,'#f6ecd6','#c9b991',2);
      aqLine(X-ww*.33,cy-5,X+ww*.31,cy-5,'#c0926c',1);
      aqEllipse(X,cy+3,7,5,'#e9be87','#b87963');
    }
    rx.restore();
  };
  const oldWall18=wallArt;
  wallArt=function(p,t){
    oldWall18(p,t);const k=p[0],accent=p[3];
    rx.save();
    // Architectural bounce light and surface-mounted fittings; never fake food labels.
    for(const x of [436,1050]){
      let g=rx.createRadialGradient(x,31,2,x,122,178);
      g.addColorStop(0,'#fff8de4f');g.addColorStop(.45,'#fff8de16');g.addColorStop(1,'#fff8de00');
      rx.fillStyle=g;rx.fillRect(x-180,18,360,235);
      aqRounded(x-44,18,88,7,'#fae9c7','#ab9278',4);
      aqEllipse(x,28,27,4,'#fff7e1','#b39b79');
    }
    if(k==='science'){
      // Recognizable (empty) glassware in a locking preparation bay.
      for(let j=0;j<5;j++){
        const x=822+j*54;
        aqRounded(x-11,139-(j%2)*6,22,32,'#d4eef0','#779ea9',5);
        aqRounded(x-7,149-(j%2)*6,14,13,j%2?'#c7cde3':'#b7d3c3','#648c9a',3);
        aqLine(x-7,140-(j%2)*6,x+7,140-(j%2)*6,'#f9ffffd0',1.5);
      }
    } else if(k==='band'){
      for(const x of [282,1084]){
        rx.save();rx.translate(x,185);rx.strokeStyle='#e6c58b';rx.lineWidth=5;rx.lineCap='round';
        rx.beginPath();rx.moveTo(-12,-31);rx.bezierCurveTo(-33,-40,-25,-61,-3,-64);
        rx.bezierCurveTo(18,-68,27,-43,13,-27);rx.stroke();
        aqEllipse(13,-27,8,12,'#f5d899','#ae7f48');rx.restore();
      }
    } else if(k==='gym'){
      for(const x of [306,345,384]){
        aqEllipse(x,245,15,15,['#f7ce8d','#b7d1cf','#dba68d'][(x/39|0)%3],'#667e8b');
        aqLine(x-9,245,x+9,245,'#435a69',1.2);
      }
    } else if(k==='classroom'){
      for(let i=0;i<4;i++){
        const x=275+i*40;
        aqRounded(x,207,29,10,['#b9c6cc','#e3bd8c','#a5bda6','#c7b5d0'][i],'#74878e',3);
        aqLine(x+5,210,x+23,210,'#fffef5c7',1);
      }
    } else if(k==='factory'){
      for(let j=0;j<6;j++){
        const x=546+j*54;
        aqRounded(x,78,42,19,'#8bb7b3','#305962',4);
        aqLine(x+6,85,x+36,85,'#f6faf0a8',1.5);
        aqScrew(x+4,93);aqScrew(x+38,93);
      }
    } else if(k==='cafeteria'){
      for(let j=0;j<3;j++){
        let x=295+j*305;
        aqRounded(x,175,189,5,'#cddeda','#62878b',2);
        for(let i=0;i<3;i++)aqEllipse(x+39+i*61,175,12,3,'#edf0e7','#8ca7a8');
      }
    }
    // Very subtle recess-edge occlusion instead of a dark vignette over characters.
    aqRounded(0,296,1280,3,'#496b6e66','#132d3418',0);
    rx.restore();
  };
  const oldFloor18=detailedFloor;
  detailedFloor=function(p,t){
    oldFloor18(p,t);
    rx.save();
    rx.beginPath();rx.rect(0,307,1280,Math.max(0,sy(SZ)-307));rx.clip();
    const k=p[0],lights=k==='factory'?[440,990]:[340,990];
    for(const x of lights){
      const g=rx.createRadialGradient(x,340,6,x,340,150);
      g.addColorStop(0,'#fffce51b');g.addColorStop(.7,'#fffce507');g.addColorStop(1,'#fffce500');
      rx.fillStyle=g;rx.fillRect(x-150,308,300,205);
    }
    rx.restore();
  };
  // A gentle idle cycle, with existing rigged character sprites and unchanged feet.
  const oldRoomSprite18=roomSprite;
  roomSprite=function(who,x,y,h,pose,face){
    if(preferences.reducedMotion||pose!==0)return oldRoomSprite18(who,x,y,h,pose,face);
    const seed=who.length*1.7,t=performance.now()/1000,
      breathe=1+.0045*Math.sin(t*2.3+seed),lean=.007*Math.sin(t*.9+seed);
    rx.save();rx.translate(x,y);rx.rotate(lean);oldRoomSprite18(who,0,0,h*breathe,pose,face);rx.restore();
  };
  // A brief reaching motion uses the actual target position and follows the action
  // window. It does not pretend the character has handed over real food.
  const oldSceneCharacter18=sceneCharacter;
  sceneCharacter=function(r,now,dt,walking){
    oldSceneCharacter18(r,now,dt,walking);
    if(preferences.reducedMotion||walking||r.actionTime<=0||!r.actionObject)return;
    const o=roomObject(r.actionObject);if(!o)return;
    let X=sx(r.x,r.z),Y=sy(r.z),h=156*zscale(r.z),tx=sx(o.wx,o.wz),
      ty=sy(o.wz)-(o.surface?fixtureHeight(o.surface):0)-20;
    const distance=Math.hypot(tx-X,ty-(Y-h*.52));
    if(distance>155)return; // no cartoon arms stretched across an entire room
    const u=Math.min(1,Math.max(0,(.52-r.actionTime)/.34)),
      ease=Math.sin(Math.PI*Math.min(1,u)),pulse=(1+Math.sin(now/100))/2,
      dir=r.face||1,startX=X+dir*h*.22,startY=Y-h*.52,
      endX=startX+(tx-startX)*Math.min(.78,.4+ease*.35),
      endY=startY+(ty-startY)*Math.min(.78,.4+ease*.35)+pulse*3;
    rx.save();rx.lineCap='round';
    const sleeve=r.hero==='maya'?'#8768ba':r.hero==='ari'?'#8b77bd':r.hero==='leo'?'#bd744b':'#b78c46';
    rx.beginPath();rx.moveTo(startX,startY);rx.quadraticCurveTo(startX+dir*11,startY-6,endX-dir*9,endY+6);
    rx.strokeStyle='#283e4a8a';rx.lineWidth=12;rx.stroke();rx.strokeStyle=sleeve;rx.lineWidth=9;rx.stroke();
    aqEllipse(endX,endY,6,5,'#f0c79e','#be866b');aqSpecular(endX-1,endY-2,3,2);
    const name=String(o.type||o.id||'');
    if(/sink|counter|rack|sponge/.test(name)){
      aqRounded(endX-7,endY-3,15,7,'#f3d67e','#bc9c4d',3);
      for(let i=0;i<3;i++)aqEllipse(endX+12+(i*5),endY-9-i*3,2,3,'#ecfbf6','#9ccbd0');
    } else if(/label|package|receipt|docket|card|paper|reference/.test(name)){
      rx.save();rx.translate(endX,endY-6);rx.rotate(Math.sin(now/135)*.10);
      aqRounded(-10,-12,20,24,'#fdf7e7','#d2c2a2',2);
      for(let j=0;j<3;j++)aqLine(-6,-6+j*5,6,-6+j*5,'#698b8d',1);rx.restore();
    } else if(/book|board|note/.test(name)){
      aqRounded(endX-9,endY-8,18,17,'#d6e2d7','#688c8f',2);
    }
    rx.restore();
  };
  // Autonomous pupils yield room around the adult and the player. The agent's
  // authored goal and path are preserved; this only adds local collision-aware
  // steering so a conversation cannot visually merge two character sprites.
  const priorImmersionLayers18=immersionLayers;
  immersionLayers=function(r,layers,now,dt,walking){
    priorImmersionLayers18(r,layers,now,dt,walking);
    if(!r?.peer||preferences.reducedMotion)return;
    const p=r.peer;
    const actors=[{x:r.x,z:r.z,clearance:60}];
    for(const o of r.plan.objects)if(o.type==='npc')actors.push({x:o.wx,z:o.wz,clearance:112});
    for(const a of actors){
      let dx=p.x-a.x,dz=p.z-a.z,d=Math.hypot(dx,dz);
      if(d>=a.clearance||d<.001)continue;
      const step=Math.min(110*dt,a.clearance-d),ux=dx/d,uz=dz/d;
      let nx=p.x+ux*step,nz=p.z+uz*step;
      if(spatialFree(nx,nz)){p.x=nx;p.z=nz}
      else if(spatialFree(nx,p.z))p.x=nx;
      else if(spatialFree(p.x,nz))p.z=nz;
    }
  };
  // User interface: one task at the bottom, quiet room title, details on demand.
  const sheet=document.createElement('style');sheet.id='aq-premium-hud';sheet.textContent=`
    .aqd .aqd-kicker,.aqd .aqd-story{display:none!important}
    .aqd header{padding:13px 20px!important}
    .aqd h2{font-size:clamp(20px,2.4vw,27px)!important;letter-spacing:-.02em}
    .aqd .aqd-plan{box-shadow:none}
    #aq-room .aq-storybar{display:none!important}
    #aq-room .aq-room-head{top:10px;left:14px;right:14px;gap:8px;z-index:10}
    #aq-room .aq-room-head>div:first-child{max-width:min(54%,380px);min-width:0;padding:8px 14px;background:#193b46e8;border:1px solid #e8e7d638;border-radius:12px;box-shadow:0 3px 14px #132d3440}
    #aq-room #aq-room-chapter{display:none!important}
    #aq-room #aq-room-title{font-size:clamp(17px,1.95vw,24px);line-height:1.1;font-weight:760;letter-spacing:-.015em}
    #aq-room .aq-room-meter{font-size:13px;min-width:56px;text-align:center;padding:8px 10px;background:#244e56cf;box-shadow:none;border-color:#e2e7dc38}
    #aq-room .aq-progress{display:none!important}
    #aq-room button{box-shadow:0 2px 9px #1e384435;border-radius:11px;font-weight:700}
    #aq-room .aq-room-goal{bottom:14px;width:min(710px,calc(100% - 24px));padding:12px 18px;border-radius:17px;border:1px solid #d7e5d0;background:#fffcf1f4;color:#24464c;text-align:center;box-shadow:0 7px 28px #20394140;z-index:7}
    #aq-room-goal{font-size:clamp(15px,1.75vw,20px)!important;line-height:1.23;font-weight:750!important;color:#24464c;letter-spacing:-.01em}
    #aq-room #aq-room-lesson,#aq-room #aq-room-feedback{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;margin:0!important;padding:0!important;border:0!important}
    #aq-room .aq-room-controls{right:12px!important;bottom:10px!important;gap:6px!important;z-index:9}
    #aq-room .aq-room-controls button{min-height:44px;min-width:44px;padding:8px 10px;background:#244950e0}
    #aq-room .aq-room-controls #aq-room-action{font-size:13px!important;min-width:88px}
    #aq-room #aq-premium-info{min-width:44px;padding:8px 10px;background:#284b54e9;color:#fff9ec;border:1px solid #f1e6cc75}
    #aq-room #aq-premium-info[aria-expanded=true]{background:#f4e5bf;color:#274653}
    #aq-room #aq-premium-drawer{position:absolute;top:70px;right:18px;z-index:45;width:min(345px,calc(100% - 36px));padding:15px 17px;border:1px solid #e1d7bd;background:#fff9ed;color:#263e43;border-radius:14px;box-shadow:0 12px 36px #1f36475c;font:500 14px/1.46 system-ui}
    #aq-room #aq-premium-drawer[hidden]{display:none!important}
    #aq-room #aq-premium-drawer strong{display:block;font-size:16px;margin-bottom:5px}
    #aq-room #aq-premium-drawer .aq-mode-in-info{display:block;min-height:44px;margin-top:10px;color:#fff8eb;background:#28555c}

    #aq-room #aq-premium-drawer p{margin:5px 0 0}
    @media(max-width:880px){#aq-room .aq-room-goal{bottom:68px;width:min(550px,calc(100% - 16px));padding:9px 12px}#aq-room .aq-room-controls{bottom:7px!important}#aq-room .aq-room-head>div:first-child{max-width:44%}#aq-room #aq-room-title{font-size:16px}}
    @media(max-width:480px){#aq-room .aq-room-head{flex-wrap:wrap;justify-content:flex-end;row-gap:5px}#aq-room .aq-room-head>div:first-child{margin-right:auto}#aq-room .aq-room-head button{padding:6px 8px;min-height:42px;min-width:43px;font-size:12px}#aq-room .aq-room-meter{display:none}#aq-room .aq-room-head>div:first-child{max-width:51%}#aq-room .aq-room-goal{bottom:61px}#aq-room-goal{font-size:14px!important}}
  `;
  document.head.append(sheet);
  const head=roomEl.querySelector('.aq-room-head'),exit=head.querySelector('#aq-room-exit');
  const info=document.createElement('button');info.type='button';info.id='aq-premium-info';info.textContent='Info';info.setAttribute('aria-expanded','false');info.setAttribute('aria-controls','aq-premium-drawer');info.setAttribute('aria-label','Show or hide the full lesson and instructions');head.insertBefore(info,exit);
  const drawer=document.createElement('div');drawer.id='aq-premium-drawer';drawer.hidden=true;drawer.setAttribute('role','region');drawer.setAttribute('aria-label','Lesson details');drawer.innerHTML='<strong id="aq-premium-topic"></strong><p id="aq-premium-explain"></p>';
  roomEl.append(drawer);
  // Keep the optional challenge mode, but away from the primary action controls.
  const mode=document.getElementById('aq-story-mode');
  if(mode){mode.id='aq-story-mode';mode.classList.add('aq-mode-in-info');drawer.append(mode)}
  info.addEventListener('click',()=>{drawer.hidden=!drawer.hidden;info.setAttribute('aria-expanded',String(!drawer.hidden))});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden){drawer.hidden=true;info.setAttribute('aria-expanded','false');info.focus();e.preventDefault();e.stopImmediatePropagation()}},true);
  const shortGoal=t=>{
    t=String(t||'').trim();
    t=t.replace(/^(find|look for) (.+?), or ask (.+?) for guidance\.?$/i,(_,a,b,c)=>'Find '+b+' — or ask '+c+'.');
    t=t.replace(/(\. |; )Walk .+$/i,'.').replace(/(\. |; )Click .+$/i,'.');
    t=t.replace(/\bthe responsible adult\b/gi,'an adult').replace(/\bthe current (fictional )?ingredient label\b/gi,'the ingredient label');
    if(t.length>110){const cut=t.indexOf('. ');if(cut>20&&cut<105)t=t.slice(0,cut+1)}
    if(t.length>110){const cut=t.lastIndexOf(' ',104);t=t.slice(0,cut>75?cut:105).trim().replace(/[,;:]$/,'')+'…'}
    return t;
  };
  const prevHUD=roomHUD;
  roomHUD=function(){prevHUD();if(!room)return;
    const title=document.getElementById('aq-lesson-title')?.textContent || document.getElementById('aq-story-title')?.textContent || 'Stay safe';
    const body=document.getElementById('aq-lesson-body')?.textContent || document.getElementById('aq-story-copy')?.textContent || '';
    document.getElementById('aq-premium-topic').textContent=title;
    document.getElementById('aq-premium-explain').textContent=body;
    const roomNames={
      'birthday-invitation':'Party room','bakery-order':'Bakery','library-club':'Library',
      'shared-lunch':'Cafeteria','sports-break':'Gym','recipe-revision':'Recipe room',
      'class-science':'Science lab','art-supplies':'Art studio','bus-trip':'Field trip',
      'market-stall':'Market','handwash-club':'Game club','picnic-weather':'Picnic shelter',
      'club-bullying':'Support room','cafe-order':'Café','substitute-teacher':'Classroom',
      'emergency-rehearsal':'First aid room','accessible-fair':'Fair workshop',
      'festival-supply':'Distribution','welcome-rehearsal':'Band room','welcome-promise':'Assembly hall'
    };
    document.getElementById('aq-room-title').textContent=roomNames[room.task.id]||document.getElementById('aq-room-title').textContent;
    const g=document.getElementById('aq-room-goal');g.textContent=shortGoal(g.textContent);
    const m=document.getElementById('aq-room-meter'),txt=m.textContent,match=txt.match(/^(\d+)\s*\/\s*(\d+)/);
    if(match)m.textContent=match[1]+'/'+match[2];else{
      const graph=typeof graphFor==='function'?graphFor(room):null;
      if(graph){const node=graph.nodes?.[room.trace?.graph?.node];m.textContent=node?.complete?'Done':String(room.trace.graph.history.length)+' steps';}
    }
  };
  // Physical animation and HUD expose no new hidden game progression.
  if(window.__ALLY_ENABLE_QA===true&&window.ALLY_ROOM_QA){
    Object.assign(window.ALLY_ROOM_QA,{premium:()=>({room:room?.task.id||null,uiShort:document.getElementById('aq-room-goal')?.textContent||'',infoVisible:!drawer.hidden,materials:true,animation:!preferences.reducedMotion})});
  }
}
