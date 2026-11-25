(()=>{'use strict';
const $=s=>document.querySelector(s),el=(tag,cl='',text='')=>{let e=document.createElement(tag);if(cl)e.className=cl;if(text)e.textContent=text;return e};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));const lerp=(a,b,t)=>a+(b-a)*t;const TAU=Math.PI*2;
const storeKey='allyquest.welcome.five.v1',prefsKey='allyquest.five.preferences.v1';
function loadJSON(k,f){try{return {...f,...JSON.parse(localStorage.getItem(k)||'null')}}catch{return {...f}}}
let progress=loadJSON(storeKey,{unlocked:1,completed:{},selected:null,totalStars:0});let preferences=loadJSON(prefsKey,{mute:false,reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches,largeControls:false});
const persist=()=>{try{localStorage.setItem(storeKey,JSON.stringify(progress))}catch{}};const persistPrefs=()=>{try{localStorage.setItem(prefsKey,JSON.stringify(preferences))}catch{}};
const ASSET_URLS=window.ALLY_ASSETS||{};
const art={};for(const [name,path] of Object.entries(ASSET_URLS)){const im=new Image();im.src=path;art[name]=im}
window.ALLY_ILLUSTRATIONS=art;
const c=$('#scene'),ctx=c.getContext('2d',{alpha:false,desynchronized:true});let cw=1280,ch=720,scale=1,dpr=1,verticalPad=0,cam=0,world=null,player=null,frameTime=0,raf=0,last=0,loadedLevel=-1,gameMode='home',dialog=null,paused=false,pendingTutorial=0,tutorialStep=0,tutorialDone=false,nearTask=null,particles=[],shake=0,ready=false,selectedCharacter='ethan',timeElapsed=0,lastSavedCheckpoint=0,lastInputTime=0,promptTimeout=0,promptMessage='',ambientLast=0,confetti=[];
const keyboard={left:false,right:false,jump:false,jumpTap:false,talk:false};const touch={left:false,right:false,jump:false,talk:false};let sounds=null,musicAt=0,training=null,backgroundOpacity=.73,completedRunTimes={},lastStepAt=0,carryPlatform=null,activity=null;let lastPose={frame:0,changedAt:0,previous:0},ariNPCGesture=0;
const heldKeys=new Set(),activePointers=new Map();let accumulator=0,overlayReturn=null,portraitView=false,qaManual=false;const FIXED_DT=1/120;
const syncKeys=()=>{keyboard.left=heldKeys.has('ArrowLeft')||heldKeys.has('KeyA');keyboard.right=heldKeys.has('ArrowRight')||heldKeys.has('KeyD');keyboard.jump=['Space','ArrowUp','KeyW'].some(k=>heldKeys.has(k))};
function syncTouch(){for(const k of ['left','right','jump','talk']){touch[k]=[...activePointers.values()].includes(k);document.querySelector(`[data-control="${k}"]`)?.classList.toggle('pressed',touch[k])}}
function setModalInert(on){for(const id of ['home','map','hud','touch-controls','level-meter','training','comic'])$('#'+id).inert=on}
function focusGame(){if(gameMode==='playing'&&!dialog&&!paused)c.focus({preventScroll:true})}

const kit=window.ALLY_FOREGROUND;
function initAudio(){if(sounds)return;try{sounds=new (window.AudioContext||window.webkitAudioContext)()}catch{}}
function sound(kind='pick'){if(preferences.mute)return;initAudio();if(!sounds)return;try{if(sounds.state==='suspended')sounds.resume();const osc=sounds.createOscillator(),gain=sounds.createGain(),now=sounds.currentTime;let f={jump:420,land:160,pick:760,talk:530,bounce:360,win:660,wrong:240,click:540}[kind]||500;osc.type=kind==='bounce'?'triangle':'sine';osc.frequency.setValueAtTime(f,now);osc.frequency.exponentialRampToValueAtTime(f*(kind==='wrong'?.65:1.45),now+.16);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(kind==='bounce'?.065:.026,now+.02);gain.gain.exponentialRampToValueAtTime(.001,now+.2);osc.connect(gain).connect(sounds.destination);osc.start(now);osc.stop(now+.23)}catch{}}
function playMusic(t){if(preferences.mute||!sounds||sounds.state!=='running'||t<musicAt||paused||dialog||gameMode!=='playing')return;
 const motifs={school:[392,440,523,587,523,440,392,330],cafeteria:[330,392,440,523,440,392,330,294],label_lab:[262,349,392,466,392,349,294,262],garden:[392,494,587,659,587,494,440,392],celebration:[523,587,659,784,659,587,523,440]};
 const scaleNotes=motifs[world?.scene]||motifs.school;
 const n=Math.floor(timeElapsed*2)%scaleNotes.length;musicAt=t+.45;
 try{const o=sounds.createOscillator(),g=sounds.createGain(),now=sounds.currentTime;
 o.type=world.scene==='cafeteria'?'triangle':world.scene==='label_lab'?'sine':'sine';o.frequency.value=scaleNotes[n];
 g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.009,now+.035);g.gain.exponentialRampToValueAtTime(.0001,now+.38);
 o.connect(g).connect(sounds.destination);o.start(now);o.stop(now+.4)}catch{}
}
function resize(){const r=c.getBoundingClientRect();if(!r.width||!r.height)return;
 const portrait=r.width<=600&&r.height>r.width;portraitView=portrait;
 scale=portrait?Math.min(r.width/575,r.height/820):r.height/720;
 cw=r.width/scale;ch=r.height/scale;verticalPad=portrait?Math.max(0,ch*.745-567):0;
 dpr=Math.max(.8,Math.min(devicePixelRatio||1,1.6,Math.sqrt(1750000/(r.width*r.height))));
 c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);
 ctx.setTransform(scale*dpr,0,0,scale*dpr,0,verticalPad*scale*dpr);window.ALLY_VIEW={top:-verticalPad,bottom:ch-verticalPad};
}
function show(id){setModalInert(false);overlayReturn=null;for(const name of ['home','map','hud','level-meter','touch-controls','comic','overlay']){const e=$('#'+name);if(e&&name!=='overlay')e.classList.add('hidden')};if(id)$('#'+id).classList.remove('hidden')}
function starsTotal(){return LEVELS.reduce((n,l)=>n+Number(progress.completed[l.id]?.stars||0),0)}
function clearInputs(){heldKeys.clear();activePointers.clear();for(let k in keyboard)keyboard[k]=false;for(let k in touch)touch[k]=false;syncTouch();if(player)player.jumpBuffer=0;accumulator=0} 
function goHome(){$('#training').classList.add('hidden');training=null;gameMode='home';paused=false;dialog=null;$('#comic').classList.add('hidden');$('#overlay').classList.add('hidden');show('home');$('#home').classList.remove('hidden');updateHomeCounter();clearInputs()}
function updateHomeCounter(){$('#home').setAttribute('data-stars',String(starsTotal()))}
function selectMap(){$('#training').classList.add('hidden');training=null;gameMode='map';paused=false;show('map');$('#map').classList.remove('hidden');$('#overlay').classList.add('hidden');renderMap();clearInputs()}
function renderMap(){const cards=$('#map-cards');cards.replaceChildren();LEVELS.forEach((l,i)=>{const unlocked=i<progress.unlocked;let m=el('section','map-card'+(unlocked?'':' locked'));m.style.setProperty('--theme',l.color);const bg=el('div','map-card-image');bg.style.backgroundImage=`url(${ASSET_URLS[l.scene]||'assets/'+l.scene+'.webp'})`;const num=el('div','map-number',String(i+1));bg.append(num);m.append(bg);const cp=el('div','map-card-copy');cp.append(el('h3','',l.icon+' '+l.name),el('p','',l.subtitle),el('div','map-status',progress.completed[l.id]?'★'.repeat(progress.completed[l.id].stars||0)+'  Best '+Math.round(progress.completed[l.id].bestTime||0)+'s':unlocked?'✦  Ready to play':'🔒  Complete the previous level'));let button=el('button','map-play',unlocked?'▶  PLAY':'LOCKED');button.disabled=!unlocked;button.onclick=()=>startLevel(i);cp.append(button);m.append(cp);cards.append(m)});$('#map-count').textContent=Object.keys(progress.completed).length+' / 5 adventures completed';$('#map-bar-fill').style.width=`${Object.keys(progress.completed).length/5*100}%`;$('#map-stars').textContent=starsTotal()}
function startLevel(index,skipIntro=false){if(!Number.isInteger(index)||index<0||index>=LEVELS.length||index>=progress.unlocked)return;clearInputs();activity=null;lastPose={frame:0,changedAt:0,previous:0};ariNPCGesture=0;loadedLevel=index;world=LEVELS[index];gameMode='playing';dialog=null;paused=false;timeElapsed=0;cam=0;shake=0;frameTime=0;particles=[];confetti=[];lastSavedCheckpoint=0;nearTask=null;selectedCharacter=['ethan','maya','leo','ari'].includes(progress.selected)?progress.selected:world.hero;
 player={x:95,y:567,vx:0,vy:0,grounded:true,coyote:0,jumpBuffer:0,face:1,bounceTimer:0,landTimer:0,checkpointX:95,support:null,springFlight:false,stride:0};world.state={done:new Set(),stars:new Set(),lever:false,attempts:0,winning:false,cartX:index===1?875:undefined,cartDelivered:index!==1,activityStages:{}};training=null;$('#training').classList.add('hidden');
 show(null);$('#hud').classList.remove('hidden');$('#level-meter').classList.remove('hidden');$('#touch-controls').classList.remove('hidden');$('#hud-number').textContent=`WORLD 1  ·  LEVEL ${index+1} / 5`;$('#hud-level').textContent=world.name;$('#hud-subtitle').textContent=world.subtitle;$('#hud-score').textContent='0 / 5';$('#goal-text').textContent=world.mission;$('#goal-progress').textContent=`0 / ${world.tasks.length} objectives`;$('#comic').classList.add('hidden');$('#overlay').classList.add('hidden');$('#sound-button').textContent=preferences.mute?'♪̸':'♫';$('#sound-button').classList.toggle('muted',preferences.mute);
 $('#touch-controls').classList.toggle('large',preferences.largeControls);resize();drawMeter();if(!skipIntro&&!tutorialSeen()&&index===0){openTutorial()}else{setPrompt(index===0?'Find Maya to begin the banner adventure.':world.subtitle,2.2);ready=true}focusGame();
}
function drawMeter(){const nav=$('#level-meter');nav.replaceChildren();LEVELS.forEach((l,i)=>{const b=el('button','level-dot'+(i===loadedLevel?' active':progress.completed[l.id]?' done':i<progress.unlocked?' available':' locked'),String(i+1));b.title=l.name;b.disabled=i>=progress.unlocked;b.onclick=()=>{if(!world.state.winning)selectMap()};nav.append(b)})}
function setPrompt(text,seconds=2){promptMessage=text;promptTimeout=performance.now()+seconds*1000;$('#hud-prompt').textContent=text}
function updatePrompt(){if(dialog||paused)return;let note='';if(nearTask&&!world.state.done.has(nearTask.id)&&nearTask.kind!=='npc'){
 note=nearTask.prompt?.replace(/^E\s+/,'E · ')||'E · Interact';
 }else if(player&&player.x>world.finishX-230){note=world.state.done.size===world.tasks.length?'The goal is ahead!':'Finish your mission tasks first';}
 if(!nearTask&&performance.now()<promptTimeout)note=promptMessage;
 if(note.length>83)note=note.slice(0,80)+'…';
 if($('#hud-prompt').textContent!==note)$('#hud-prompt').textContent=note;
}
function markDone(task){if(world.state.done.has(task.id))return; if(task.kind==='npc'&&training){training.flags.talk=true;updateTraining({})}world.state.done.add(task.id);updateMission();sound('pick');spawn(task.x,task.y-60,22);setPrompt('★  Great teamwork! '+task.title+' complete',2.1)}
function updateMission(){$('#goal-progress').textContent=`${world.state.done.size} / ${world.tasks.length} objectives`;$('#goal-text').textContent=world.state.done.size===world.tasks.length?'All tasks ready — reach the finish!':world.mission}
function openComic(info){if(!world||dialog)return;clearInputs();paused=true;dialog={...info,line:0,state:'lines',correct:false};$('#comic').classList.remove('hidden');$('#comic').setAttribute('role','dialog');$('#comic').setAttribute('aria-modal','true');renderComic();$('#comic-actions button')?.focus({preventScroll:true})}
function renderComic(){if(!dialog)return;queueMicrotask(()=>{if(dialog)$('#comic-actions button')?.focus({preventScroll:true})});const e=$('#comic'),speaker=$('#comic-speaker'),body=$('#comic-text'),buttons=$('#comic-actions');e.classList.toggle('quick',dialog.type==='prompt');speaker.textContent=dialog.speaker||'ALLY CREW';buttons.replaceChildren();
 if(dialog.type==='prompt'){body.textContent=dialog.text;const btn=el('button','primary','E  TALK');btn.onclick=()=>{const task=dialog.task;dialog=null;$('#comic').classList.add('hidden');interactTask(task)};buttons.append(btn);positionComic();return}
 if(dialog.state==='reply'){body.textContent=dialog.reply;const btn=el('button','primary',dialog.correct?'Continue ▶':'Try again ↻');btn.onclick=()=>{if(dialog.correct){const task=dialog.task;dialog=null;$('#comic').classList.add('hidden');paused=false;if(task&&!world.state.done.has(task.id))markDone(task);clearInputs();focusGame()}else{dialog.state='choices';renderComic()}};buttons.append(btn);positionComic();return}
 const lines=dialog.lines||[];
 if(dialog.state==='lines'&&dialog.line<lines.length){body.textContent=lines[dialog.line].replace(/\bEthan!/g,selectedCharacter.charAt(0).toUpperCase()+selectedCharacter.slice(1)+'!');const btn=el('button','primary',dialog.line===lines.length-1?'Continue ▶':'Next ▶');btn.onclick=()=>{dialog.line++;if(dialog.line>=lines.length){dialog.state=dialog.choices?'choices':'end'}renderComic()};buttons.append(btn);positionComic();return}
 if(dialog.state==='choices'){body.textContent=dialog.question||'What should we do next?';for(const [i,choice] of dialog.choices.entries()){const btn=el('button',i===0?'primary':'',choice.label);btn.onclick=()=>{dialog.correct=choice.correct;dialog.reply=choice.reply;dialog.state='reply';sound(choice.correct?'pick':'wrong');renderComic()};buttons.append(btn)}positionComic();return}
 body.textContent=dialog.final||'Thanks for helping!';const btn=el('button','primary','Let’s go! ▶');btn.onclick=()=>{const task=dialog.task;dialog=null;e.classList.add('hidden');paused=false;if(task&&!world.state.done.has(task.id))markDone(task);clearInputs();focusGame()};buttons.append(btn);positionComic()
}
function positionComic(){if(!world||(!dialog&&!nearTask))return;const task=dialog?.task||nearTask,wx=task?.x??dialog?.x??player.x,wy=task?.y??567;const px=(wx-cam)*scale,py=(wy-148+verticalPad)*scale;const rect=c.getBoundingClientRect(),quick=!dialog||dialog.type==='prompt',width=Math.min(quick?224:364,rect.width-24),e=$('#comic');e.style.width=`${width}px`;const h=e.offsetHeight,cx=clamp(px,width/2+12,rect.width-width/2-12),top=clamp(py-h,12,Math.max(12,rect.height-h-24));e.style.left=`${cx}px`;e.style.top=`${top}px`;e.style.transform='translateX(-50%)';e.style.setProperty('--tip',`${clamp(px-cx,-width*.35,width*.35)}px`)}
function npcName(task){const id=['ethan','maya','leo','ari'].includes(task.id)?task.id:world.npc;return id===selectedCharacter?(id==='ethan'?'maya':'ethan'):id}
function npcSpeaker(task){const id=npcName(task);return id?id.charAt(0).toUpperCase()+id.slice(1):(task.speaker||task.title)}
function showNpcHint(task){if(dialog||!task||paused)return;
 const e=$('#comic');e.removeAttribute('role');e.removeAttribute('aria-modal');e.classList.add('quick');e.classList.remove('hidden');
 const speaker=$('#comic-speaker'),body=$('#comic-text'),actions=$('#comic-actions');
 const name=npcSpeaker(task);if(speaker.textContent!==name)speaker.textContent=name;if(body.textContent!=='E · Talk to '+name)body.textContent='E · Talk to '+name;
 if(!actions.querySelector('[data-quick]')||actions.dataset.task!==task.id){actions.replaceChildren();
   const button=el('button','primary','💬 TALK');button.dataset.quick='yes';button.onclick=()=>interactTask(task);
   actions.dataset.task=task.id;actions.append(button);
 }
}
function closeComic(){dialog=null;paused=false;$('#comic').classList.add('hidden');clearInputs();focusGame()}
function interactTask(task){if(!task||world.state.done.has(task.id))return;$('#comic').classList.remove('quick');
 if(task.requires&&!world.state.done.has(task.requires)){openComic({speaker:'Detective Note',lines:['Find the magnifier first. You will use it to read the label, not just collect it.'],x:task.x});return}
 if(task.kind==='pickup'||task.kind==='lever'){
  if(task.kind==='lever'){world.state.lever=true;setPrompt('The garden bridge lowered into place!',2)}
  markDone(task);paused=false;dialog=null;$('#comic').classList.add('hidden');return;
 }
 if(task.kind==='choice'&&task.id!=='maya'&&task.id!=='leo'&&task.id!=='ari'){
  if(world.id==='cafeteria'&&task.id==='station1'&&!world.state.cartDelivered){setPrompt('Push the lunch cart along the conveyor first!',2.4);return}
  openActivity(task);return;
 }
 openComic({type:'task',speaker:task.kind==='npc'?npcSpeaker(task):task.speaker||task.title,lines:task.lines||[],choices:task.choices,question:task.kind==='npc'?'How should we help?':'What would be the helpful choice?',task});
}
function attemptInteract(){if(gameMode!=='playing'){if(dialog)advanceComic();return}if(dialog){advanceComic();return}if(nearTask){interactTask(nearTask);return}if(Math.abs(player.x-world.finishX)<145)tryFinish();else setPrompt('Get closer to a glowing station to interact',1.5)}
function advanceComic(){if(!dialog)return;
 if(dialog.state==='choices'){const b=$('#comic-actions button');b?.focus();return}
 const btn=$('#comic-actions button.primary')||$('#comic-actions button');if(btn)btn.click();
}
function tryFinish(){if(world.state.winning)return;const remaining=world.tasks.filter(t=>!world.state.done.has(t.id));if(remaining.length){openComic({speaker:'Celebration Guide',lines:[`Just ${remaining.length} task${remaining.length>1?'s':''} left! Go back and help your friends first.`],x:world.finishX-100});return}winLevel()}
function winLevel(){if(world.state.winning)return;world.state.winning=true;paused=true;sound('win');spawn(player.x,player.y-110,64);for(let i=0;i<60;i++){confetti.push({x:Math.random()*cw,y:-Math.random()*360,vx:(Math.random()-.5)*90,vy:60+Math.random()*100,h:i%5})}
 const stars=world.state.stars.size,old=progress.completed[world.id];
 const prevBest=Number.isFinite(old?.bestTime)?old.bestTime:null;
 const badges=[];if(stars===5)badges.push('Star Collector');if(world.state.attempts===0)badges.push('Smooth Runner');if(timeElapsed<=190)badges.push('Swift Ally');
 progress.completed[world.id]={stars:Math.max(old?.stars||0,stars),complete:true,plays:(old?.plays||0)+1,bestTime:prevBest===null?timeElapsed:Math.min(prevBest,timeElapsed),badges:[...new Set([...(old?.badges||[]),...badges])],attempts:world.state.attempts};
 if(progress.daily&&progress.daily.level===loadedLevel&&progress.daily.date===new Date().toLocaleDateString('en-CA')){progress.daily.complete=true;}progress.unlocked=Math.max(progress.unlocked,Math.min(5,loadedLevel+2));progress.totalStars=starsTotal();persist();drawMeter();
 const html=`<div class="panel-kicker">WORLD 1 · WELCOME STREET</div><h2>Adventure Complete! ✨</h2><div class="end-stars">${'★'.repeat(Math.max(1,Math.ceil(stars/2)))}${'☆'.repeat(3-Math.max(1,Math.ceil(stars/2)))}</div><p class="end-progress">${world.name} — ${stars} / 5 stars collected · Best ${Math.round(progress.completed[world.id].bestTime)}s</p><p class="replay-badges">${badges.map(x=>`★ ${x}`).join(" · ")||"Explore more to earn medals!"}</p><div class="end-crew">${['ethan','maya','leo','ari'].map(n=>`<img src="${ASSET_URLS[n+'_00']}" alt="${n}"/>`).join('')}</div><p>You helped the Ally Crew! <strong>${world.lesson}</strong></p><div class="panel-buttons"><button class="pill-button" data-end-next>${loadedLevel<4?'Next Adventure ▶':'World Map ★'}</button><button class="pill-button secondary" data-end-replay>Replay</button><button class="pill-button secondary" data-end-map>Map</button></div>`;
 openOverlay(html);$('[data-end-next]').onclick=()=>{closeOverlay();loadedLevel<4?startLevel(loadedLevel+1,true):selectMap()};$('[data-end-replay]').onclick=()=>{closeOverlay();startLevel(loadedLevel,true)};$('[data-end-map]').onclick=()=>{closeOverlay();selectMap()}}
function openOverlay(markup){const o=$('#overlay');const focused=document.activeElement;const oldKey=focused?.dataset?.stationPiece||focused?.dataset?.stationZone;const oldKind=focused?.dataset?.stationPiece?'piece':'zone';if(o.classList.contains('hidden'))overlayReturn=focused;o.classList.remove('hidden');o.innerHTML=`<div class="panel" tabindex="-1">${markup}</div>`;setModalInert(true);clearInputs();const panel=o.querySelector('.panel');const restored=oldKey&&panel.querySelector(`[data-station-${oldKind}="${CSS.escape(oldKey)}"]:not(:disabled)`);(restored||panel).focus({preventScroll:true})}
function closeOverlay(){$('#overlay').classList.add('hidden');$('#overlay').replaceChildren();setModalInert(false);clearInputs();if(gameMode==='playing')c.focus({preventScroll:true});else if(overlayReturn?.isConnected)overlayReturn.focus({preventScroll:true});overlayReturn=null} 
const TUTORIAL=[{title:'MOVE LIKE AN ALLY!',copy:'Use A/D or the arrow keys. Every adventure has new paths, hidden stars and people who need your help.',keys:['←','→'],verb:'Press LEFT or RIGHT!',pose:1},
 {title:'JUMP INTO ADVENTURE!',copy:'Press SPACE or ↑ to jump. Hold a direction in the air and land on green-topped platforms.',keys:['SPACE','↑'],verb:'Press SPACE / UP!',pose:5},
 {title:'BOUNCE HIGHER!',copy:'The blue trampolines give you a powerful bounce. You can steer while soaring to clear tall obstacles.',keys:['↟','★'],verb:'Try a BOUNCE!',pose:5},
 {title:'TALK AND HELP!',copy:'Press E near friends and glowing objects. Choose helpful answers in comic bubbles to advance missions.',keys:['E','💬'],verb:'Press E to practice!',pose:0},
 {title:'BECOME A GREAT ALLY!',copy:'Collect stars, help friends, use reliable information and ask a trusted adult about food-related safety. Then finish the adventure!',keys:['★','❤'],verb:'Ready for Adventure!',pose:7}];
function tutorialSeen(){try{return !!sessionStorage.getItem('allyquest-tutorial-done')}catch{return false}}
function openTutorial(){if(!world||gameMode!=='playing')return;
 const prior=training?.flags||{};
 training={index:0,flags:{move:!!prior.move,jump:!!prior.jump,talk:!!prior.talk,bounce:!!prior.bounce,pick:!!prior.pick}};
 $('#training').classList.remove('hidden');$('#level-meter').classList.add('hidden');closeOverlay();paused=false;focusGame();
 const target=world.id==='banner'?'Maya':'your friend';setPrompt('',.1);
 updateTraining({});clearInputs();
}
function showTutorial(){trainingCopy()}
function practiceKey(k){if(!training||gameMode!=='playing')return;
 if(['Space','ArrowUp','KeyW'].includes(k)){training.flags.jump=true;updateTraining({})}
 if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(k)&&player?.x>185){training.flags.move=true;updateTraining({})}
}
function finishTutorial(){try{sessionStorage.setItem('allyquest-tutorial-done','yes')}catch{}
 training=null;$('#training').classList.add('hidden');if(gameMode==='playing')$('#level-meter').classList.remove('hidden');paused=false;ready=true;clearInputs();focusGame();
}
function showSettings(){if(gameMode!=='playing'&&gameMode!=='map'&&gameMode!=='home')return;let previous=gameMode;paused=true;const markup=`<div class="panel-kicker">PERSONALIZE YOUR ADVENTURE</div><h2>GAME SETTINGS ⚙</h2><p>All settings stay on this device. No account, tracking, or public chat required.</p><div class="settings-grid"><label class="setting"><span>Original music <small>Soft adventure soundtrack</small></span><input type="checkbox" data-pref="mute" ${!preferences.mute?'checked':''}></label><label class="setting"><span>Reduce motion <small>Fewer animated effects and camera movement</small></span><input type="checkbox" data-pref="reducedMotion" ${preferences.reducedMotion?'checked':''}></label><label class="setting"><span>Large touch buttons <small>Easier mobile controls</small></span><input type="checkbox" data-pref="largeControls" ${preferences.largeControls?'checked':''}></label></div><div class="panel-buttons"><button class="pill-button" data-close>BACK TO ADVENTURE ▶</button><button class="pill-button secondary" data-map>Level Map</button></div>`;openOverlay(markup);document.querySelectorAll('[data-pref]').forEach(input=>{input.addEventListener('change',()=>{const key=input.dataset.pref;preferences[key]=key==='mute'?!input.checked:input.checked;persistPrefs();$('#sound-button').textContent=preferences.mute?'♪̸':'♫';$('#touch-controls').classList.toggle('large',preferences.largeControls)})});$('[data-close]').onclick=()=>{closeOverlay();paused=false};$('[data-map]').onclick=()=>{closeOverlay();selectMap()}}
function showPause(){paused=true;openOverlay(`<div class="panel-kicker">WELCOME STREET · LEVEL ${loadedLevel+1}</div><h2>PAUSED ⏸</h2><p>${world.name} — Your adventure will be right here when you come back.</p><div class="panel-buttons"><button class="pill-button" data-resume>RESUME ▶</button><button class="pill-button secondary" data-guide>Interactive Guide</button><button class="pill-button secondary" data-settings>Settings</button><button class="pill-button secondary" data-map>Level Map</button><button class="pill-button danger" data-restart>Restart</button></div>`);$('[data-resume]').onclick=()=>{closeOverlay();paused=false};$('[data-guide]').onclick=openTutorial;$('[data-settings]').onclick=showSettings;$('[data-map]').onclick=()=>{closeOverlay();selectMap()};$('[data-restart]').onclick=()=>{closeOverlay();startLevel(loadedLevel,true)}}
function showCrew(){openOverlay(`<div class="panel-kicker">MEET THE ALLY CREW</div><h2>CHOOSE YOUR HERO! 💛</h2><p>Every character can complete every adventure. Their abilities are equally accessible.</p><div class="crew-grid">${['ethan','maya','leo','ari'].map(n=>`<button class="crew-choice" data-select="${n}" aria-pressed="${n===(progress.selected||'ethan')}"><img class="crew-portrait" src="${ASSET_URLS[n+'_00']}" alt="${n}"/>${n.toUpperCase()}</button>`).join('')}</div><div class="panel-buttons"><button class="pill-button" data-done>DONE ★</button></div>`);document.querySelectorAll('[data-select]').forEach(btn=>btn.onclick=()=>{progress.selected=btn.dataset.select;persist();document.querySelectorAll('[data-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.select===progress.selected)))});$('[data-done]').onclick=closeOverlay}
function update(dt){if(!world||!player||gameMode!=='playing'||paused||world.state.winning)return;
 const prevTime=timeElapsed;timeElapsed+=dt;const p=player;
 const direction=(keyboard.right||touch.right?1:0)-(keyboard.left||touch.left?1:0);
 const jumpHeld=keyboard.jump||touch.jump;
 const speed=340;let vxGoal=direction*speed;
 const extra=world.conveyors?.find(z=>p.x>=z.x&&p.x<=z.x+z.w&&p.grounded);
 if(extra)vxGoal+=extra.dir*82;
 // Ride horizontal moving platforms instead of sliding off while standing still.
 if(p.support){const base=world.platforms.find(pl=>pl===p.support);if(base?.moving&&p.grounded){
  const before=base.x+Math.sin(prevTime*TAU/(base.period||3))*(base.amplitude||60);
  const now=base.x+Math.sin(timeElapsed*TAU/(base.period||3))*(base.amplitude||60);
  p.x+=now-before;
 }else p.support=null;}
 p.vx=lerp(p.vx,vxGoal,Math.min(1,dt*(p.grounded?15:8)));
 if(direction)p.face=direction;
 const oldX=p.x;p.x=clamp(p.x+p.vx*dt,20,world.width-20);
 const wantsJump=keyboard.jumpTap||touch.jumpTap;
 if(wantsJump){p.jumpBuffer=.15;keyboard.jumpTap=false;touch.jumpTap=false}
 p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.coyote=p.grounded?.115:Math.max(0,p.coyote-dt);
 if(p.jumpBuffer>0&&(p.grounded||p.coyote>0)){
  p.vy=-845;p.grounded=false;p.springFlight=false;p.support=null;p.coyote=0;p.jumpBuffer=0;emit('jump',p.x,p.y-95);
 }
 // Stride advances only on actual locomotion, not conveyor/platform displacement or a blocked wall.
 const wasGrounded=p.grounded;
 const oldY=p.y;
 // Variable height and a slower apex help players steer toward an intended surface.
 const gravity=p.springFlight&&p.vy<0?1750:p.vy<0?(jumpHeld?1750:2900):Math.abs(p.vy)<120&&jumpHeld?1700:2300;
 p.vy=Math.min(1350,p.vy+gravity*dt);p.y+=p.vy*dt;p.grounded=false;p.support=null;
 for(const wall of world.walls||[]){const xHit=p.x+20>wall.x&&p.x-20<wall.x+wall.w;
  const yHit=p.y>wall.y&&p.y-112<wall.y+wall.h;
  if(xHit&&yHit){
   // 8px lip-assist: avoid unfair clipping while preserving tall bounce-only walls.
   if(p.vy>=0&&oldY<=wall.y+3&&p.y>=wall.y){p.y=wall.y;p.vy=0;p.grounded=true;p.springFlight=false;p.coyote=.115;p.landTimer=.17;emit('land',p.x,p.y);continue}
   if(oldX<=wall.x-19){p.x=wall.x-21;p.vx=0}
   else if(oldX>=wall.x+wall.w+19){p.x=wall.x+wall.w+21;p.vx=0}
  }
 }
 for(const pad of world.springs||[]){
  // Solid frame when walking: a trampoline is approached from above, never through its metal legs.
  if(p.y>pad.y+6&&p.y-110<pad.y+38){
   if(oldX<pad.x-20&&p.x+20>pad.x){p.x=pad.x-21;p.vx=0}
   else if(oldX>pad.x+pad.w+20&&p.x-20<pad.x+pad.w){p.x=pad.x+pad.w+21;p.vx=0}
  }
  if(p.vy>=0&&p.x>pad.x-14&&p.x<pad.x+pad.w+14&&oldY<=pad.y+11&&p.y>=pad.y){
   p.y=pad.y;p.vy=-1215;p.grounded=false;p.support=null;p.bounceTimer=.27;p.springFlight=true;emit('bounce',p.x,p.y)
  }
 }
 for(const platform of world.platforms){const x=platform.x+(platform.moving?Math.sin(timeElapsed*TAU/(platform.period||3))*(platform.amplitude||60):0);
  if(p.vy>=0&&p.x+18>x&&p.x-18<x+platform.w&&oldY<=platform.y+12&&p.y>=platform.y){p.y=platform.y;p.vy=0;p.grounded=true;p.springFlight=false;p.support=platform;p.coyote=.115;if(oldY<platform.y-5){p.landTimer=.17;emit('land',p.x,p.y)}}
 }
 const gap=(world.gaps||[]).some(g=>p.x>g.x&&p.x<g.x+g.w&&(!(world.state.lever&&g.bridgeBy==='lever')));
 if(!gap&&p.vy>=0&&oldY<=582&&p.y>=567){p.y=567;p.vy=0;p.grounded=true;p.springFlight=false;p.coyote=.115;if(oldY<557){emit('land',p.x,p.y);p.landTimer=.17}}
 if(p.y>810){p.x=p.checkpointX||95;p.y=567;p.vy=0;p.vx=0;p.grounded=true;p.springFlight=false;p.support=null;world.state.attempts++;setPrompt('Try again! You are back at your checkpoint.',1.7);emit('land',p.x,p.y)}
 if(p.grounded&&wasGrounded&&Math.abs(p.vx)>20&&direction)p.stride=(p.stride||0)+Math.abs(p.x-oldX);
 p.bounceTimer=Math.max(0,p.bounceTimer-dt);p.landTimer=Math.max(0,p.landTimer-dt);
 for(let i=0;i<world.stars.length;i++){const star=world.stars[i];if(!world.state.stars.has(i)&&Math.abs(star.x-p.x)<40&&Math.abs(star.y-(p.y-60))<67){world.state.stars.add(i);$('#hud-score').textContent=`${world.state.stars.size} / 5`;emit('pick',star.x,star.y)}}
 for(const task of world.tasks){if(task.kind==='pickup'&&!world.state.done.has(task.id)&&Math.abs(task.x-p.x)<48&&Math.abs(p.y-567)<120)markDone(task)}
 // Movement-driven cafeteria cart is an actual physical task, not a correct-answer box.
 if(world.id==='cafeteria'&&world.state.cartX!==undefined&&!world.state.cartDelivered){const cx=world.state.cartX;
  if(direction>0&&p.grounded&&p.x>=cx-73&&p.x<=cx+37){world.state.cartX=Math.min(1040,cx+speed*dt*.8);if(p.x>world.state.cartX-45)p.x=world.state.cartX-45}
  const cv=world.conveyors.find(v=>cx>=v.x&&cx<v.x+v.w);if(cv)world.state.cartX=Math.min(1040,world.state.cartX+(cv.dir>0?44:0)*dt);
  if(world.state.cartX>=1030){world.state.cartDelivered=true;emit('pick',world.state.cartX,516);setPrompt('Tray delivered! Ask the helper to review it.',2.1)}
 }
 const remaining=world.tasks.filter(x=>!world.state.done.has(x.id)&&x.kind!=='pickup');
 nearTask=remaining.reduce((best,t)=>{const d=Math.abs(t.x-p.x);if(Math.abs(p.y-(t.y??567))>120)return best;if(d<120&&(best===null||d<Math.abs(best.x-p.x)))return t;return best},null);
 const atGoal=Math.abs(p.x-world.finishX)<62&&p.y>480;if(atGoal&&!world.state.goalEntered)tryFinish();world.state.goalEntered=atGoal;
 if(p.grounded&&p.y===567&&!gap&&p.x-lastSavedCheckpoint>640){p.checkpointX=p.x;lastSavedCheckpoint=p.x}
 updateTraining({direction});updatePrompt();
}
function emit(type,x,y){if(training&&(type==='jump'||type==='bounce'||type==='pick')){training.flags[type]=true;updateTraining({})}if(type==='jump')sound('jump');if(type==='land'&&!preferences.reducedMotion)sound('land');if(type==='bounce'){sound('bounce');shake=3.2}if(type==='pick')sound('pick');spawn(x,y,type==='bounce'?28:type==='pick'?20:7)}
function spawn(x,y,n=16){if(preferences.reducedMotion)n=Math.min(n,3);for(let i=0;i<n;i++){const a=TAU*i/n,v=65+Math.random()*140;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-100,age:0,life:.35+Math.random()*.35,color:['#ffdf4b','#a6ffcc','#85d2ff','#ff98d0'][i%4]})}if(particles.length>180)particles.splice(0,particles.length-180)}
function oval(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill()}
function rect(x,y,w,h,color,r=0){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.max(0,r));ctx.fill()}
function starShape(x,y,r,color='#ffcf30',outline='#fff4a1'){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,R=i%2===0?r:r*.47;const xx=x+Math.cos(a)*R,yy=y+Math.sin(a)*R;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.closePath();ctx.fillStyle=color;ctx.shadowColor='#ffd736';ctx.shadowBlur=15;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=outline;ctx.lineWidth=3;ctx.stroke()}
function image(name,x,y,w,h){const im=art[name];if(im?.complete&&im.naturalWidth>0){ctx.drawImage(im,x,y,w,h);return true}return false}
function drawGround(){kit.ground(ctx,world,cam,cw,timeElapsed)}
function drawPlatforms(){for(const p of world.platforms){const px=p.x+(p.moving?Math.sin(timeElapsed*TAU/(p.period||3))*(p.amplitude||60):0)-cam;
 if(px>cw+160||px+p.w<-150)continue;kit.platform(ctx,world,p,cam,timeElapsed);
}}
function drawSpecial(){for(const wall of world.walls||[]){const x=wall.x-cam;if(x>cw+160||x+wall.w<-150)continue;kit.wall(ctx,world,wall,cam,timeElapsed)}
 for(const pad of world.springs||[]){const px=pad.x-cam;if(px>cw+140||px+pad.w<-160)continue;
 ctx.save();if(player.bounceTimer>0&&Math.abs(player.x-pad.x-pad.w/2)<90){const f=Math.sin((1-player.bounceTimer/.27)*Math.PI)*.17;ctx.translate(px+pad.w/2,pad.y+6);ctx.scale(1+f*.36,1-f);ctx.translate(-px-pad.w/2,-pad.y-6)}
 if(!image('trampoline',px-13,pad.y-12,pad.w+26,52)){oval(px+pad.w/2,pad.y+8,pad.w/2,13,'#163b96');starShape(px+pad.w/2,pad.y-3,17)}ctx.restore();
 }
 for(const cv of world.conveyors||[]){if(cv.x-cam>cw+150||cv.x+cv.w-cam<-100)continue;kit.conveyor(ctx,cv,cam,timeElapsed)}
 if(world.id==='cafeteria'&&world.state.cartX!==undefined){kit.cart(ctx,world.state.cartX-cam,564,world,timeElapsed,world.state.cartDelivered)}
}
function drawStarsAndTasks(){for(let i=0;i<world.stars.length;i++){if(world.state.stars.has(i))continue;const st=world.stars[i],x=st.x-cam;if(x<-60||x>cw+60)continue;starShape(x,st.y+Math.sin(timeElapsed*2.7+i)*3.5,17,'#ffe16e')}
 for(const task of world.tasks){if(world.state.done.has(task.id)&&task.kind==='pickup')continue;
 const x=task.x-cam;if(x<-180||x>cw+180)continue;
 if(task.kind==='npc'){ctx.save();ctx.globalAlpha=world.state.done.has(task.id)?.85:1;drawSprite(npcName(task),x,567,0,player.x<x?-1:1,true);ctx.restore()}
 else kit.taskObject(ctx,task,world,cam,timeElapsed);
 }
 // Activity boards now display progress through real foreground objects.
}
/** Frame-coherent animation; the illustrated pose keeps the same 256x256 foot anchor. */
function drawSprite(who,x,foot,pose=0,face=1,npc=false){
 const height=npc?141:145, im=art[who+'_'+String(pose).padStart(2,'0')]||art[who+'_00'];
 ctx.save();ctx.translate(x,foot);if(face<0)ctx.scale(-1,1);
 // The atlas has a common bottom edge at row 247, not 256. Anchor that edge to the physical foot.
 if(npc||player.grounded)oval(0,1,25,5,'#132b324e');else if(!npc){const ground=world.platforms.reduce((y,q)=>{const px=q.x+(q.moving?Math.sin(timeElapsed*TAU/(q.period||3))*(q.amplitude||60):0);return player.x>=px&&player.x<=px+q.w&&q.y>=foot?Math.min(y,q.y):y},567);if(!(world.gaps||[]).some(g=>player.x>g.x&&player.x<g.x+g.w&&!(world.state.lever&&g.bridgeBy==='lever'))){const h=Math.max(0,ground-foot);oval(0,h+1,Math.max(10,25-h*.038),4,'rgba(19,43,50,'+Math.max(.04,.27-h*.00055)+')')}}
 if(!npc&&!preferences.reducedMotion&&player.grounded&&player.landTimer>0){const k=player.landTimer/.17;ctx.scale(1+k*.055,1-k*.06)}
 if(im?.complete&&im.naturalWidth){const h=height;const strideLift=!npc&&!preferences.reducedMotion&&player.grounded&&pose>=1&&pose<=3?Math.abs(Math.sin((player.stride||0)/116*TAU))*2.8:0;ctx.drawImage(im,-h/2,-h*247/256-strideLift,h,h)}
 if(!npc&&progress.scarf&&progress.scarf!=='none'){const clr={gold:'#ffdd72',mint:'#8fe0c1',lavender:'#d8b3fa'}[progress.scarf];if(clr){rect(-10,-height*.40-7,21,5,clr,2);rect(8,-height*.40-6,6,13,clr,2)}}
 ctx.restore();
}
function characterPose(who,p){if(!p.grounded)return p.vy<-65?5:6;if(p.landTimer>.09)return 4;if(Math.abs(p.vx)<25)return 0;const run={ethan:[1,2,3,2],maya:[2,1,2,3],leo:[2,1,2,3],ari:[2,1,2,3]};return (run[who]||run.ethan)[Math.floor((p.stride||0)/29)%4]}

function drawFinish(){kit.finish(ctx,world,cam,timeElapsed)}
function drawBackground(){ctx.save();const yMin=-verticalPad,yMax=720+(ch-720-verticalPad);
 ctx.fillStyle=world.scene==='cafeteria'?'#b6d0c8':world.scene==='label_lab'?'#baddec':'#84bfe0';ctx.fillRect(0,yMin,cw,yMax-yMin+30);
 const imageSrc=art[world.scene+'_play']||art[world.scene]||art.school;
 if(imageSrc?.complete&&imageSrc.naturalWidth){const sw=imageSrc.naturalWidth,sh=imageSrc.naturalHeight;
  const targetH=Math.max(570+verticalPad,650), ratio=Math.min(sw,cw*sh/targetH),sx=clamp(cam/Math.max(1,world.width-cw)*(sw-ratio),0,Math.max(0,sw-ratio));
  // Wide panoramic art supplies scenery only, while independently drawn interactive foreground stays crisp.
  ctx.globalAlpha=backgroundOpacity;
  if(world.scene==='garden'||world.scene==='celebration'){
    ctx.drawImage(imageSrc,sx,0,ratio,sh*.53,0,-verticalPad,cw,430+verticalPad);
    ctx.globalAlpha=1;kit.backfill(ctx,world.scene,cw,cam,timeElapsed);
  }else ctx.drawImage(imageSrc,sx,0,ratio,Math.min(sh,ratio*targetH/cw),0,-verticalPad,cw,targetH);
  ctx.globalAlpha=1;
 }
 const haze=ctx.createLinearGradient(0,150,0,580);haze.addColorStop(0,'rgba(231,242,238,0)');haze.addColorStop(.7,'rgba(231,242,238,.07)');haze.addColorStop(1,'rgba(218,233,216,.30)');ctx.fillStyle=haze;ctx.fillRect(0,140,cw,450);
 // The painted skyline already establishes atmospheric depth. Avoid geometric
 // repeated semicircles that looked like flat, out-of-place bushes.
 ctx.restore();
}
function drawDecor(){const xStart=Math.floor(cam/360)*360-360;for(let x=xStart;x<cam+cw+350;x+=360){const sx=x-cam;if(sx<-80||sx>cw+80)continue;if(x>360&&x<world.width-330){if(world.scene==='cafeteria'||world.scene==='label_lab'){ctx.font='25px system-ui';ctx.fillText(x%720?'📚':'🧪',sx+26,525)}else{oval(sx+22,556,15,10,'#5a984b');oval(sx+41,552,13,15,'#7dae60');oval(sx+15,550,12,9,'#c7dc76')}}}
 if(world.scene==='celebration'||world.scene==='garden'){for(let x=160;x<world.width;x+=340){const sx=x-cam;if(sx<-100||sx>cw+100)continue;ctx.strokeStyle='#efdf9a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx,200);ctx.quadraticCurveTo(sx+170,222,sx+340,200);ctx.stroke();for(let j=0;j<8;j++){ctx.fillStyle=['#ffd462','#ed98b4','#8fddc3','#bd9df4'][j%4];ctx.beginPath();ctx.moveTo(sx+j*44,204);ctx.lineTo(sx+j*44+17,204);ctx.lineTo(sx+j*44+7,228);ctx.fill()}}}
}
function drawParticles(dt){const count=particles.length;for(let i=count-1;i>=0;i--){const p=particles[i];p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;if(p.age>=p.life){particles.splice(i,1);continue}ctx.globalAlpha=1-p.age/p.life;oval(p.x-cam,p.y,3.2,3.2,p.color)}ctx.globalAlpha=1}
function draw(t,dt){if(gameMode!=='playing'||!world)return;resizeIfNeeded();ctx.save();ctx.setTransform(scale*dpr,0,0,scale*dpr,0,verticalPad*scale*dpr);const look=clamp(player.vx*.23,-58,75);cam=clamp(lerp(cam,player.x-cw*(cw<780?.24:.34)+look,preferences.reducedMotion?1:1-Math.exp(-dt*6.5)),0,Math.max(0,world.width-cw));if(shake&&!preferences.reducedMotion){ctx.translate(Math.sin(t*120)*shake,Math.cos(t*147)*shake*.25);shake*=Math.exp(-dt*11);if(shake<.3)shake=0}drawBackground();drawDecor();drawGround();drawPlatforms();drawSpecial();drawStarsAndTasks();drawFinish();drawSprite(selectedCharacter,player.x-cam,player.y,characterPose(selectedCharacter,player),player.face);drawParticles(dt);
 for(let i=confetti.length-1;i>=0;i--){let p=confetti[i];p.y+=p.vy*dt;p.x+=p.vx*dt;rect(p.x,p.y,8,14,['#ffe15c','#9eecff','#f6a7c8','#c4a1ef','#a3f2a4'][p.h]);if(p.y>730)confetti.splice(i,1)}ctx.restore();
 if(training)$('#training').classList.toggle('hidden',!!dialog||!$('#overlay').classList.contains('hidden'));
 if(dialog)positionComic();
 else if(nearTask&&nearTask.kind==='npc'&&!paused){showNpcHint(nearTask);positionComic()}
 else if($('#comic').classList.contains('quick'))$('#comic').classList.add('hidden');
}
function resizeIfNeeded(){let r=c.getBoundingClientRect();if(!c.width||Math.abs(c.width-r.width*dpr)>5||Math.abs(c.height-r.height*dpr)>5)resize()}
function advanceFrame(dt){if(gameMode!=='playing'||paused||document.hidden){accumulator=0;return}accumulator+=Math.min(.1,Math.max(0,dt));let steps=0;while(accumulator+1e-9>=FIXED_DT&&steps++<12&&!paused){accumulator=Math.max(0,accumulator-FIXED_DT);update(FIXED_DT)}if(paused)accumulator=0}
function loop(now){raf=requestAnimationFrame(loop);const dt=last?Math.min(.1,Math.max(0,(now-last)/1000)):0;last=now;if(gameMode==='playing'&&!qaManual){advanceFrame(dt);if(!paused&&!preferences.reducedMotion)frameTime+=dt;draw(now/1000,paused&& !world.state.winning?0:dt);playMusic(now/1000)}}
// In-world Ally Academy tutorial: a child must actually use controls, not click a fake Next button.
function trainingCopy(){if(!training)return;const stages=[['WALK TO MAYA','Move using A/D, arrows, or touch controls.'],['TRY A REAL JUMP','Jump on the schoolyard path. Space / ↑ / JUMP.'],['SPEAK TO MAYA','Press E or tap TALK, then choose how to help.'],['SPRING INTO THE AIR','Land on the blue trampoline. It is a real obstacle!'],['COLLECT A STAR','Explore an elevated route to pick up a golden star.']];
 const i=training.index,step=stages[i];if(!step){finishTutorial();return}
 $('#training-stage').textContent=`ALLY ACADEMY ${i+1}/5`;
 $('#training-title').textContent=step[0];$('#training-copy').textContent=step[1];
 $('#training-meter').style.width=`${i/5*100}%`;
}
function updateTraining(data={}){if(!training||gameMode!=='playing')return;
 if((data.direction||0)!==0&&player.x>185)training.flags.move=true;
 const seq=['move','jump','talk','bounce','pick'];
 while(training.index<seq.length&&training.flags[seq[training.index]])training.index++;
 if(training.index>=seq.length){finishTutorial();sound('win');setPrompt('Ally Academy complete! Keep exploring.',2.5);return}
 trainingCopy();
}
// Real task: inspect a label or complete an interactive community activity.
const PACKAGE_LABELS={label1:{name:'PACKAGE A · EXAMPLE',ingredients:'Ingredients: wheat flour, sugar, milk powder, sunflower oil.',signal:'Milk and wheat are listed in the ingredients.',advice:'An adult checks this against the actual student’s allergy plan.'},
 label2:{name:'PACKAGE B · EXAMPLE',ingredients:'Ingredients: oats, oil, flavoring. Additional product details are unclear.',signal:'A missing precautionary warning does not prove a food is suitable.',advice:'Ask a trusted adult to obtain reliable manufacturer and ingredient information.'},
 label3:{name:'PACKAGE C · EXAMPLE',ingredients:'NEW RECIPE · Ingredients: cocoa, soy lecithin, sugar.',signal:'Recipes change. This label names soy.',advice:'An adult checks the current package, not an old photograph.'}};
const ACTIVITY_STEPS={
 station1:['ROLL THE CART','CHECK THE ACTUAL TRAY','ASK THE CAFETERIA HELPER'],station2:['NOTICE SHARED UTENSILS','SELECT CLEAN EQUIPMENT','ASK AN ADULT TO CHECK'],station3:['CHOOSE AN ART ACTIVITY','SET OUT PAPER & MARKERS','INVITE EVERYONE'],
 crafts:['SET OUT NON-FOOD MATERIALS','DECORATE A POSTER','PUT IT ON THE DISPLAY'],music:['TEST THE MUSIC PLAYER','START A GROUP DANCE','INVITE FRIENDS TO JOIN'],
 welcome:['PUT UP THE WELCOME SIGN','ASK WHAT FRIENDS NEED','MAKE SPACE TO JOIN'],game:['CHOOSE A TEAM SCAVENGER HUNT','SET OUT CLUES','INVITE EVERY FRIEND'],check:['WELCOME YOUR FRIEND','FIND THE ADULT HELPER','CHECK EACH FRIEND’S OWN PLAN']
};
/** Small physical activity boards. Every station requires actual moves or taps. */
function stationProgress(a){const conf=window.ALLY_STATION_GAMES[a.task.id];if(!conf)return 0;
 if(conf.mode==='rhythm')return a.moves.length;
 return a.moves.length;
}
function stationTargetCount(conf){return conf.mode==='rhythm'?conf.pattern.length:conf.mode==='hunt'?conf.targets.length:conf.mode==='sort'?conf.items.length:conf.steps.length}
function stationComplete(a){const g=window.ALLY_STATION_GAMES[a.task.id];return stationProgress(a)>=stationTargetCount(g)}
function stationFeedback(message,success=false){const box=$('#activity-feedback');if(box){box.textContent=message;box.classList.toggle('success',success)}}
function stationTone(id){if(preferences.mute)return;initAudio();if(!sounds)return;const hz={clap:420,drum:260,bell:660}[id]||500;
 try{const o=sounds.createOscillator(),g=sounds.createGain(),t=sounds.currentTime;o.type=id==='drum'?'triangle':'sine';o.frequency.value=hz;g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.045,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g).connect(sounds.destination);o.start(t);o.stop(t+.19)}catch{}
}
function stationChoosePiece(id){if(!activity)return;
 const a=activity,g=window.ALLY_STATION_GAMES[a.task.id];if(!g)return;
 if(g.mode==='rhythm'){
  const expected=g.pattern[a.moves.length];stationTone(id);
  if(id===expected){a.moves.push([id,String(a.moves.length)]);world.state.activityStages[a.task.id]=a.moves.slice();sound('pick');renderStationActivity();stationFeedback(stationComplete(a)?'Great! You played the whole original rhythm.':'Nice beat! Keep the pattern going.',true)}
  else {a.moves=[];world.state.activityStages[a.task.id]=[];renderStationActivity();stationFeedback('Try the rhythm again from the first note. Follow the highlighted beat.');}
  return;
 }
 if(g.mode==='hunt'){
  if(g.targets.includes(id)&&!a.moves.some(([item])=>item===id)){a.moves.push([id,'found']);world.state.activityStages[a.task.id]=a.moves.slice();sound('pick');renderStationActivity();stationFeedback(stationComplete(a)?'You found all three non-food team objects!':'Found a team clue! Find the next one.',true)}
  else {stationFeedback('Look for the map, balloon and friendship scarf. The food props are just scenery.');sound('wrong')}
  return;
 }
 if(a.moves.some(([item])=>item===id)){stationFeedback('That item is already in place. Try another one.');return}
 a.selected=id;renderStationActivity();stationFeedback('Selected '+g.items.find(v=>v[0]===id)?.[2]+'. Now choose where it belongs.');
}
function stationPlace(zone){if(!activity)return;const a=activity,g=window.ALLY_STATION_GAMES[a.task.id];if(!g||!['sequence','sort','art'].includes(g.mode))return;
 if(!a.selected){stationFeedback('Choose an item first, then click or drop it into a work area.');return}
 const id=a.selected;let correct=false;
 if(g.mode==='sort'){correct=g.targets[id]===zone}
 else {const next=g.steps[a.moves.length];correct=!!next&&next[0]===zone&&(g.mode==='art'||next[0]===id)}
 if(correct){a.moves.push([id,zone]);a.selected=null;world.state.activityStages[a.task.id]=a.moves.slice();sound('pick');renderStationActivity();
  stationFeedback(stationComplete(a)?'Station ready! All three actions changed the activity board.':'That piece is in the right place. Continue helping!',true)}
 else {stationFeedback(g.mode==='sort'?'Check the written equipment status before placing it. Ask a trusted adult if you are unsure.':g.mode==='sequence'?'Follow the helpful sequence, starting with the highlighted action.':'Place a different decoration on an empty poster spot.');sound('wrong')}
}
function renderStationActivity(){if(!activity)return;const a=activity,g=window.ALLY_STATION_GAMES[a.task.id];if(!g)return;
 const done=stationComplete(a),total=stationTargetCount(g),count=stationProgress(a),placed=new Set(a.moves.map(v=>v[0]));
 const pieceMarkup=g.items.map(([id,icon,name])=>`<button type="button" class="station-piece ${a.selected===id?'selected':''} ${placed.has(id)&&g.mode!=='rhythm'?'used':''}" draggable="${g.mode==='rhythm'||!placed.has(id)}" data-station-piece="${id}" ${placed.has(id)&&g.mode!=='rhythm'?'disabled':''} aria-pressed="${a.selected===id}"><span class="station-piece-icon">${icon}</span><span>${name}</span>${placed.has(id)?'<small>✓ PLACED</small>':''}</button>`).join('');
 let slots='';
 if(g.mode==='sort')slots=g.zones.map(([id,name])=>{const contents=a.moves.filter(v=>v[1]===id).map(([pid])=>g.items.find(x=>x[0]===pid)?.[1]||'✓').join(' ');
  return `<button type="button" class="station-zone ${contents?'filled':''}" data-station-zone="${id}"><strong>${name}</strong><span>${contents||'⬇  PLACE HERE'}</span></button>`}).join('');
 else if(g.mode==='sequence'||g.mode==='art')slots=g.steps.map(([id,label],i)=>{const move=a.moves[i],filled=!!move,icon=filled?(g.items.find(v=>v[0]===move[0])?.[1]||'✓'):'⊕';
  return `<button type="button" class="station-zone station-step ${filled?'filled':''} ${i===count?'current':''}" data-station-zone="${id}" ${filled||i>count?'disabled':''}><small>STEP ${i+1}</small><strong>${label}</strong><span>${icon}</span></button>`}).join('');
 else if(g.mode==='rhythm')slots=`<div class="station-rhythm" role="status" aria-label="Four beat pattern">${g.pattern.map((id,i)=>`<span class="${i<count?'lit':i===count?'current':''}">${g.items.find(v=>v[0]===id)?.[1]||'♪'}</span>`).join('')}</div><p class="station-secondary">Tap the matching instrument buttons in order. Sound is optional; the symbols show the pattern.</p>`;
 else if(g.mode==='hunt')slots=`<div class="station-hunt-scene">${g.targets.map(id=>`<span class="station-hunt-find">${placed.has(id)?g.items.find(x=>x[0]===id)?.[1]:'?'}</span>`).join('')}</div><p class="station-secondary">Click the three hidden team objects on the left. The food items are not a test of food safety.</p>`;
 const workspace=`<div class="activity-scene station-activity station-${g.mode}">
   <div class="station-header"><strong>${g.title}</strong><p>${g.brief}</p></div>
   <div class="station-workbench"><div class="station-inventory"><span class="station-caption">${g.mode==='rhythm'?'PLAY THE NOTES':g.mode==='hunt'?'SEARCH THE SCENE':'PICK AN ITEM'}</span><div class="station-pieces">${pieceMarkup}</div></div><div class="station-board"><span class="station-caption">${g.mode==='sort'?'SORT INTO THE CORRECT AREA':g.mode==='rhythm'?'FOLLOW THE PATTERN':g.mode==='hunt'?'THREE CLUES TO FIND':'PLACE ON THE WORKBENCH'}</span><div class="station-zones">${slots}</div></div></div>
   <div class="station-counter">${Array.from({length:total},(_,i)=>`<span class="${i<count?'filled':''}">${i<count?'✓':i+1}</span>`).join('')}<strong>${count} / ${total} actions completed</strong></div>
 </div>`;
 openOverlay(`<div class="panel-kicker">PLAYABLE ALLY MISSION · ${world.name}</div><h2>${g.title.toUpperCase()}</h2><p>Move objects with click-and-place or drag-and-drop. Keyboard users can select a piece and then a destination.</p>${workspace}
 <div id="activity-feedback" role="status" aria-live="polite"></div><div class="panel-buttons"><button type="button" class="pill-button secondary" data-activity-close>Back to Game</button><button type="button" class="pill-button" data-activity-next ${done?'':'disabled'}>${done?'Finish station ✓':'Finish station'}</button></div>`);
 $('[data-activity-close]').onclick=()=>{activity=null;closeOverlay();paused=false};
 const next=$('[data-activity-next]');next.onclick=()=>{if(!activity||!stationComplete(activity))return;const task=activity.task;world.state.activityStages[task.id]=activity.moves.slice();activity=null;closeOverlay();paused=false;markDone(task)};
 document.querySelectorAll('[data-station-piece]').forEach(btn=>{btn.addEventListener('click',()=>stationChoosePiece(btn.dataset.stationPiece));btn.addEventListener('dragstart',e=>{if(btn.disabled){e.preventDefault();return}e.dataTransfer?.setData('text/plain',btn.dataset.stationPiece);e.dataTransfer.effectAllowed='move'})});
 document.querySelectorAll('[data-station-zone]').forEach(zone=>{zone.addEventListener('click',()=>stationPlace(zone.dataset.stationZone));zone.addEventListener('dragover',e=>{e.preventDefault()});zone.addEventListener('drop',e=>{e.preventDefault();const id=e.dataTransfer?.getData('text/plain');if(id){activity.selected=id;stationPlace(zone.dataset.stationZone)}})});
}

function openActivity(task){paused=true;clearInputs();activity={task,step:0,moves:[...(world.state.activityStages[task.id]||[])],selected:null};renderActivity()}
function renderActivity(){if(!activity)return;if(window.ALLY_STATION_GAMES?.[activity.task.id]){renderStationActivity();return;}
 const {task,step}=activity,label=PACKAGE_LABELS[task.id],done=step>=3;
 const labels={label1:['Wheat','Milk','Sugar','Sunflower oil'],label2:['Oats','Oil','Flavoring details unclear','No precautionary warning shown'],label3:['Cocoa','Soy','Sugar','Familiar package design']};
 const keyItem={label1:'Milk',label2:'Flavoring details unclear',label3:'Soy'}[task.id];
 const actSteps=ACTIVITY_STEPS[task.id]||['LOOK AT THE STATION','HELP WITH THE ACTIVITY','INVITE EVERYONE'];
 let content='';let nextLabel='';
 if(label){
  const note=step===0?'Open the current package label using the magnifier.':step===1?'Find important evidence on the ingredient list. Tap a word to examine it.':step===2?'The ingredient details need an adult’s review. Bring the package to the helper.':'Your careful inspection is recorded!';
  content=`<div class="package-inspector"><div class="package-top"><span>FICTIONAL TEACHING LABEL • NOT A SAFETY CERTIFICATION</span><strong>${label.name}</strong></div><div class="inspection-instruction">${note}</div>
  <div class="package-lines ${step===0?'obscured':''}"><b>INGREDIENT INFORMATION</b><p>${label.ingredients}</p></div>
  <div class="ingredient-choices">${step===1?labels[task.id].map(x=>`<button type="button" data-evidence="${x}" class="ingredient-chip">🔍 ${x}</button>`).join(''):''}</div>
  <div class="inspection-note ${step>=2?'visible':''}">${step>=2?label.signal+'<br><strong>'+label.advice+'</strong>':'Food suitability cannot be decided from appearance or a missing warning.'}</div>
  </div>`;
  nextLabel=step===0?'USE MAGNIFIER 🔍':step===1?'FIND EVIDENCE FIRST':step===2?'BRING TO ADULT HELPER':'RETURN TO THE LEVEL ✓';
 }else{
  const symbols={station1:['🛒','📋','🧑‍🍳'],station2:['🧽','🍽️','🧑‍🍳'],station3:['🎨','🖍️','🤝'],crafts:['📜','🖌️','🖼️'],music:['🎵','🎶','🕺'],welcome:['📋','💬','🤝'],game:['🧩','🔎','🎉'],check:['💛','🧑‍🏫','🎊']};
  content=`<div class="activity-scene"><span class="activity-symbol">${(symbols[task.id]||['💛','★','🎉'])[Math.min(step,2)]}</span>
  <div class="activity-work"><div class="activity-progress">${actSteps.map((v,i)=>`<span class="${i<step?'done':i===step?'current':''}">${i<step?'✓':i+1}</span>`).join('')}</div><div class="activity-action">${done?'ACTIVITY COMPLETE!':actSteps[step]}</div></div></div>`;
  nextLabel=done?'RETURN TO ADVENTURE ✓':step===0?'START THE ACTIVITY →':step===1?'KEEP HELPING →':'FINISH TOGETHER ★';
 }
 openOverlay(`<div class="panel-kicker">INTERACTIVE ADVENTURE · ${world.name}</div><h2>${label?'🔎 READ A REAL LABEL':'★ '+task.title.toUpperCase()}</h2><p>${label?'Collect evidence before asking a trusted adult.':`Step ${Math.min(step+1,3)} of 3 · ${done?'Task ready':actSteps[step]}`}</p>${content}
 <div id="activity-feedback" role="status" aria-live="polite"></div><div class="panel-buttons"><button type="button" class="pill-button secondary" data-activity-close>Back to Game</button><button type="button" class="pill-button" data-activity-next ${label&&step===1?'disabled':''}>${nextLabel}</button></div>`);
 $('[data-activity-close]').onclick=()=>{activity=null;closeOverlay();paused=false};
 if(label&&step===1){document.querySelectorAll('[data-evidence]').forEach(button=>button.onclick=()=>{
   if(button.dataset.evidence===keyItem){activity.step=2;sound('pick');renderActivity()}
   else {$('#activity-feedback').textContent='Look more carefully. What information needs an adult to verify?';sound('wrong');button.classList.add('not-evidence')}
  })}
 $('[data-activity-next]').onclick=()=>{if(!activity)return;
  if(activity.step>=3){const finished=activity.task;activity=null;closeOverlay();paused=false;markDone(finished);return}
  if(label&&activity.step===1)return;
  activity.step++;sound(activity.step===3?'win':'pick');renderActivity()
 };
}

function showWorkshop(){const stars=starsTotal(),items=[{id:'none',name:'Explorer Classic',cost:0,color:'#b4dae6'},{id:'gold',name:'Golden Ally Scarf',cost:4,color:'#ffdc70'},{id:'mint',name:'Garden Explorer Scarf',cost:9,color:'#93e6c3'},{id:'lavender',name:'Teamwork Scarf',cost:15,color:'#d7b5ff'}];
 const html=`<div class="panel-kicker">REWARDS FOR EXPLORATION · ${stars} TOTAL STARS</div><h2>ALLY WORKSHOP ★</h2><p>Customize a simple scarf color. All rewards come from playing, not payments or daily streaks.</p><div class="workshop-grid">${items.map(it=>`<button class="workshop-item ${stars<it.cost?'locked':''}" data-scarf="${it.id}" ${stars<it.cost?'disabled':''}><span style="background:${it.color}" class="scarf-preview"></span><strong>${it.name}</strong><small>${stars<it.cost?it.cost+' stars to unlock':progress.scarf===it.id?'EQUIPPED':'EQUIP'}</small></button>`).join('')}</div><div class="panel-buttons"><button class="pill-button" data-workshop-close>BACK TO GAME ▶</button></div>`;
 openOverlay(html);$('[data-workshop-close]').onclick=()=>{closeOverlay();if(gameMode==='playing')paused=false};
 document.querySelectorAll('[data-scarf]:not(:disabled)').forEach(btn=>btn.onclick=()=>{progress.scarf=btn.dataset.scarf;persist();showWorkshop()});
}
function showDaily(){const today=new Date(),date=today.toLocaleDateString('en-CA'),n=Math.floor(Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())/86400000),level=n%5;
 const goal=LEVELS[level],available=level<progress.unlocked,clear=progress.daily?.date===date&&progress.daily?.complete;
 openOverlay(`<div class="panel-kicker">A CHALLENGE THAT NEVER PUNISHES YOU</div><h2>DAILY DISCOVERY ★</h2><p>${clear?'Completed today!':'Today’s optional adventure:'} <strong>${goal.name}</strong>. Replay to find hidden stars and improve your time. No streak penalties.</p><div class="panel-buttons"><button class="pill-button" data-daily-start ${available?'':'disabled'}>${available?'PLAY TODAY’S LEVEL':'UNLOCK THIS LEVEL FIRST'}</button><button class="pill-button secondary" data-daily-map>WORLD MAP</button></div>`);
 $('[data-daily-start]').onclick=()=>{if(!available)return;progress.daily={date,level,complete:false};persist();closeOverlay();startLevel(level,true)};
 $('[data-daily-map]').onclick=()=>{closeOverlay();selectMap()};
}
function setup(){resize();for(const [id,fn] of [['home-play',()=>startLevel(0)],['home-map',selectMap],['home-crew',showCrew],['home-workshop',()=>showWorkshop()],['home-daily',()=>showDaily()],['home-settings',showSettings],['map-back',goHome],['map-crew',showCrew],['map-settings',showSettings],['help-button',openTutorial],['sound-button',()=>{preferences.mute=!preferences.mute;persistPrefs();$('#sound-button').textContent=preferences.mute?'♪̸':'♫';$('#sound-button').classList.toggle('muted',preferences.mute);sound('click')}],['settings-button',showSettings],['pause-button',showPause]]){let e=$('#'+id);if(e)e.addEventListener('click',()=>{initAudio();fn()})}
 $('#training-dismiss').addEventListener('click',finishTutorial);
 document.addEventListener('keydown',e=>{const key=e.code,modal=!$('#overlay').classList.contains('hidden');
  if(modal){if(key==='Tab'){const items=[...$('#overlay').querySelectorAll('button:not(:disabled),input:not(:disabled),select,textarea,[tabindex="0"]')].filter(x=>x.getClientRects().length);if(items.length){const first=items[0],last=items.at(-1);if(e.shiftKey&&(document.activeElement===first||!items.includes(document.activeElement))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!items.includes(document.activeElement))){e.preventDefault();first.focus()}}return}if(key==='Escape'){e.preventDefault();if(world?.state.winning&&gameMode==='playing'){closeOverlay();selectMap()}else{closeOverlay();activity=null;paused=false;clearInputs()}}return}
  if(dialog){if(key==='Tab'){const items=[...$('#comic-actions').querySelectorAll('button')];if(items.length){e.preventDefault();let i=items.indexOf(document.activeElement);items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus()}return}if(key==='Escape'){e.preventDefault();closeComic()}else if(key==='KeyE'&&!e.repeat){e.preventDefault();advanceComic()}return}
  if(e.target.closest?.('button,input,select,textarea')&&['Space','Enter'].includes(key))return;
  if(gameMode!=='playing'){if(gameMode==='home'&&key==='Enter'){e.preventDefault();startLevel(0)}return}
  if(['ArrowLeft','ArrowRight','ArrowUp','Space','KeyA','KeyD','KeyW','KeyE','Escape','KeyP','KeyR'].includes(key))e.preventDefault();
  if(['ArrowLeft','ArrowRight','KeyA','KeyD','Space','ArrowUp','KeyW'].includes(key)){const was=keyboard.jump;heldKeys.add(key);syncKeys();if(!was&&keyboard.jump&&!e.repeat)keyboard.jumpTap=true}
  if(key==='KeyE'&&!e.repeat)attemptInteract();if(['Escape','KeyP'].includes(key)&&!e.repeat)showPause();if(key==='KeyR'&&!e.repeat&&!world.state.winning)startLevel(loadedLevel,true)
 });
 document.addEventListener('keyup',e=>{heldKeys.delete(e.code);syncKeys()});addEventListener('blur',clearInputs);document.addEventListener('visibilitychange',()=>{clearInputs();last=0});addEventListener('resize',()=>{clearInputs();resize()});
 document.querySelectorAll('.touch-button').forEach(btn=>{const k=btn.dataset.control;btn.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();if(paused||dialog||!$('#overlay').classList.contains('hidden'))return;initAudio();try{btn.setPointerCapture(e.pointerId)}catch{}const was=touch.jump;activePointers.set(e.pointerId,k);syncTouch();if(k==='jump'&&!was)touch.jumpTap=true;if(k==='talk'){practiceKey('KeyE');attemptInteract()}});for(const ev of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(ev,e=>{if(!activePointers.has(e.pointerId))return;activePointers.delete(e.pointerId);syncTouch();if(ev!=='pointerup'&&k==='jump'&&!touch.jump){touch.jumpTap=false;if(player)player.jumpBuffer=0}})});
 goHome();raf=requestAnimationFrame(loop)}
if(window.__ALLY_ENABLE_QA===true){window.ALLY_DEBUG={getState:()=>({mode:gameMode,level:loadedLevel,selected:selectedCharacter,selectedSaved:progress.selected,x:player?.x,y:player?.y,done:world?.state.done.size,taskCount:world?.tasks.length,stars:world?.state.stars.size,unlocked:progress.unlocked,paused,dialog:!!dialog,cartX:world?.state.cartX,cartDelivered:world?.state.cartDelivered,training:training?.index}),forceCompleteTasks:()=>{for(const t of world.tasks)world.state.done.add(t.id);updateMission()},forcePosition:(x,y=567)=>{player.x=x;player.y=y;player.vx=0;player.vy=0},resetProgress:()=>{progress={unlocked:1,completed:{},selected:null,totalStars:0};persist();selectMap()},startLevel:(i)=>{progress.unlocked=Math.max(progress.unlocked,i+1);startLevel(i,true)},getLevels:()=>LEVELS.map(l=>({name:l.name,tasks:l.tasks.length,mechanic:l.mechanic,scene:l.scene})),getActor:()=>player,getWorld:()=>world,getPose:()=>characterPose(selectedCharacter,player),getInputs:()=>({keyboard:{...keyboard},touch:{...touch},pointers:activePointers.size}),getView:()=>({cw,ch,scale,cam,verticalPad,portraitView}),manual:(on)=>{qaManual=on;accumulator=0;clearInputs()},frame:(dt)=>{advanceFrame(dt);draw(performance.now()/1000,dt)},tick:(dt,input={})=>{keyboard.right=!!input.right;keyboard.left=!!input.left;keyboard.jump=!!input.jump;keyboard.jumpTap=!!input.jumpTap;update(dt)}};}

setup();
})();
