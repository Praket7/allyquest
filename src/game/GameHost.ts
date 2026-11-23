import {Controls} from './Controls.js';
import {FixedClock} from './physics/FixedClock.js';
import {SideWorld} from './physics/SideWorld.js';
import {TopWorld} from './physics/TopWorld.js';
import type {GameMode,Sim,GameEvent} from './physics/types.js';
import {Renderer} from './render/Renderer.js';
import {ComicBubble,MAYA_FIRST_DIALOGUE,MAYA_RETURN_DIALOGUE} from './story/ComicBubble.js';
import {WelcomeQuest,QuestStore} from './story/WelcomeQuest.js';
import {AmbientScore} from './audio/AmbientScore.js';
/** Owns only the movement lab. Approved home artwork never enters this module. */
export class GameHost {
 private view:HTMLElement|null=null;private canvas:HTMLCanvasElement|null=null;
 private renderer:Renderer|null=null;private controls=new Controls();private clock=new FixedClock(60);
 private world:Sim|null=null;private raf=0;private paused=false;private dead=false;private overlay:HTMLElement|null=null;
 private mode:GameMode='side';private resizeHandler=()=>this.renderer?.resize();
 private keyHandler=(e:KeyboardEvent)=>{if(this.comic?.dialogOpen){if(['KeyE','Enter','Space'].includes(e.code)){e.preventDefault();this.comic.advance();this.actionLock=performance.now()+330;this.controls.release();this.resumeAfterComic();return}if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();this.comic.close(false);this.resumeAfterComic();return}return;}if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();this.togglePause();}if(e.code==='KeyR'){e.preventDefault();this.restart();}};
 private music=new AmbientScore();private quest:WelcomeQuest|null=null;private comic:ComicBubble|null=null;private actionLock=0;private questLabel='';
 private introOpen=false;private audio:AudioContext|null=null;private muted=false;private lastMessage='';private msgUntil=0;private pausedPainted=false;private lastHudTime='';private lastHudStars='';private lastHudHint='';
 constructor(private readonly onExit:()=>void, private readonly onComplete?:(stars:number)=>void){}
 get active(){return !!this.view}
 launch(mode:GameMode){this.shutdown(false);this.mode=mode;
  this.world=mode==='side'?new SideWorld():new TopWorld();this.quest=mode==='side'?new WelcomeQuest(new QuestStore()):null;
  if(this.quest&&this.world instanceof SideWorld){const checkpoint=this.quest.snapshot.checkpoint;if(checkpoint){Object.assign(this.world.player,{x:checkpoint,y:565,vx:0,vy:0});Object.assign(this.world.checkpoint,{x:checkpoint,y:565});this.world.grounded=true;}}
  this.dead=false;this.paused=false;this.muted=false;this.music.reset();this.clock.reset();this.controls.release();
  const root=document.createElement('section');root.className='aq-play-root';root.dataset.mode=mode;root.setAttribute('aria-label',mode==='side'?'Welcome Street 2D platform adventure':'Top-down movement lab');
  root.innerHTML=`<canvas id="aq-canvas" aria-label="Interactive 2D movement prototype" tabindex="0"></canvas>
    <div class="aq-hud" aria-live="off"><div class="aq-level-label"><span class="aq-level-tag">WORLD 1 · PREVIEW</span><strong id="aq-world-name"></strong><small id="aq-mode-desc"></small></div>
      <div class="aq-hud-right"><span class="aq-pill" id="aq-ribbons">★ 0 / 5</span><span class="aq-pill aq-time" id="aq-time">0:00</span><button id="aq-tutorial" class="aq-hud-button" type="button" aria-label="How to play">?</button><button id="aq-mute" class="aq-hud-button" type="button" aria-label="Toggle sound">♫</button><button id="aq-pause" class="aq-hud-button" type="button" aria-label="Pause">Ⅱ</button></div></div>
    <div class="aq-hint" id="aq-hint" role="status" aria-live="polite"></div>
    <div class="aq-quest-progress" id="aq-quest-progress" aria-live="polite" hidden><b>YOUR MISSION</b><span id="aq-quest-objective"></span></div>
    <div class="aq-help"><span id="aq-control-hint"></span><span>R Restart · P Pause</span></div>
    <div class="aq-touch" aria-label="Touch game controls">
      <div class="aq-dpad"><button data-control="left" aria-label="Move left" type="button">◀</button><div class="aq-tb-middle"><button data-control="up" aria-label="Move up" type="button">▲</button><button data-control="down" aria-label="Move down" type="button">▼</button></div><button data-control="right" aria-label="Move right" type="button">▶</button></div>
      <div class="aq-actions"><button data-control="action" type="button" aria-label="Interact">E</button><button data-control="dash" type="button" aria-label="Dash" class="aq-dash">↗</button><button data-control="jump" type="button" aria-label="Jump" class="aq-jump">JUMP</button></div>
    </div>
    <div class="aq-screen-overlay" id="aq-screen-overlay" hidden><div class="aq-screen-card" id="aq-screen-card"></div></div>`;
  document.body.appendChild(root);this.view=root;this.comic=mode==='side'?new ComicBubble(root):null;this.comic?.setOpenHandler(()=>this.openMayaDialogue());this.canvas=root.querySelector('#aq-canvas');this.overlay=root.querySelector('#aq-screen-overlay');
  const title=root.querySelector('#aq-world-name')!;title.textContent=mode==='side'?'Welcome Street':'Garden Trail';
  root.querySelector('#aq-mode-desc')!.textContent=mode==='side'?'Find the missing celebration banner':'Top-down · Exploration playground';
  if(mode==='side')root.querySelector<HTMLElement>('#aq-quest-progress')!.hidden=false;
  root.querySelector('#aq-control-hint')!.textContent=mode==='side'?'← → Move  •  Space Jump  •  E Interact':'WASD Move  •  Shift Dash  •  E Interact';
  root.querySelectorAll<HTMLButtonElement>('[data-control]').forEach(b=>{
   const key=b.dataset.control!;
   b.addEventListener('pointerdown',e=>{e.preventDefault();try{if(b.isConnected)b.setPointerCapture(e.pointerId)}catch{/* synthetic pointers and some older browsers */}if(key==='action'&&this.comic?.dialogOpen){this.comic.advance();this.actionLock=performance.now()+330;this.controls.release();this.resumeAfterComic();return;}this.controls.touchControl(key,true);b.classList.add('down')});
   for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{this.controls.touchControl(key,false);b.classList.remove('down')});
  });
  root.querySelector<HTMLButtonElement>('#aq-tutorial')!.addEventListener('click',()=>this.showTutorial());
  root.querySelector<HTMLButtonElement>('#aq-pause')!.addEventListener('click',()=>this.togglePause());
  root.querySelector<HTMLButtonElement>('#aq-mute')!.addEventListener('click',()=>{this.muted=!this.muted;root.querySelector('#aq-mute')!.textContent=this.muted?'♪̸':'♫'});
  window.addEventListener('keydown',this.keyHandler);window.addEventListener('resize',this.resizeHandler);this.controls.attach();
  this.renderer=new Renderer(this.canvas!);this.renderer.camera(this.world,0);this.canvas?.focus({preventScroll:true});
  this.flash(mode==='side'?'Find the missing banner! Run, jump and explore.':'Explore the garden, gather ribbons, and reach the glowing goal!',3.6);
  if(mode==='side')this.showTutorial();
  const update=(ms:number)=>{if(!this.view||!this.world||!this.renderer)return;
   if(!this.paused){this.clock.advance(ms,dt=>{if(!this.world)return;const input=this.controls.frame(this.mode);
    if(input.interact&&performance.now()<this.actionLock)input.interact=false;
    if(input.interact&&this.quest&&Math.abs(this.world.player.x-1185)<100&&Math.abs(this.world.player.y-565)<130){
      input.interact=false;this.openMayaDialogue();
    }
    if(this.comic?.dialogOpen)return;
    this.world.step(dt,input);this.playEvents(this.world.events);
    if(this.quest){
      for(const e of this.world.events)if(e.type==='checkpoint')this.quest.updateCheckpoint(this.world.checkpoint.x);
      this.quest.observe(this.world.player.x,this.world.player.y);
      this.playQuestEvents();
    }
    if(this.world.stats.finished&&!this.dead){this.dead=true;this.quest?.finish();this.playQuestEvents();this.showResult();}
   });}else this.clock.reset();
   // Do not repaint a multi-megapixel frozen world at 60Hz under tutorial/pause overlays.
   if(!this.paused||!this.pausedPainted){
    if(this.quest)this.renderer.setStory(this.quest.snapshot);
    this.renderer.draw(this.world,this.paused?0:1/60,window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.pausedPainted=this.paused;
   }
   this.music.step(this.audio,this.muted,this.paused||this.dead);this.renderHud();this.renderComic();this.raf=requestAnimationFrame(update);
  };
  this.raf=requestAnimationFrame(update);
 }
 private playEvents(events:GameEvent[]){if(!this.renderer)return;this.renderer.addEvents(events);
  for(const e of events){switch(e.type){
   case 'jump':this.tone(430,.085);break;
   case 'bounce':this.tone(680,.13);this.flash('BOING! Jump into the next adventure!',1.8);break;
   case 'ribbon':this.tone(840,.11);this.flash('Star found! Explore for more.',1.3);break;
   case 'checkpoint':this.tone(570,.16);this.flash('Checkpoint reached',2);break;
   case 'gate':this.tone(520,.19);this.flash('The garden gate is open!',2.7);break;
   case 'respawn':this.tone(245,.08);this.flash('Try again! You are at your checkpoint.',2.2);break;
   case 'interact':this.tone(630,.1);break;
   case 'dash':this.tone(385,.07);break;
   case 'finish':this.tone(900,.24);break;
  }}
 }
 private openMayaDialogue(){if(!this.comic||!this.quest||this.comic.dialogOpen||!this.view)return;
  this.controls.release();this.paused=true;this.pausedPainted=false;this.clock.reset();this.actionLock=performance.now()+380;
  const first=!this.quest.snapshot.metMaya;
  this.comic.start(first?MAYA_FIRST_DIALOGUE:MAYA_RETURN_DIALOGUE,()=>{
    if(first)this.quest?.meetMaya();
    this.playQuestEvents();this.resumeAfterComic();
  });this.renderComic();
 }
 private resumeAfterComic(){if(this.comic?.dialogOpen)return;this.paused=false;this.pausedPainted=false;this.clock.reset();this.controls.release();this.actionLock=performance.now()+330;this.canvas?.focus({preventScroll:true});}
 private playQuestEvents(){if(!this.quest||!this.renderer)return;
  for(const e of this.quest.drainEvents()){
    if(e.type==='secret'){this.tone(990,.2);this.renderer.addEvents([{type:'ribbon',x:e.x,y:e.y}]);this.flash('Hidden discovery! '+this.quest.secretsFound+' / 2 secrets.',2.8);}
    if(e.type==='banner'){this.tone(730,.28);this.renderer.addEvents([{type:'ribbon',x:e.x,y:e.y}]);this.flash('You found the banner! Bring it to the celebration.',3.4);}
    if(e.type==='clue'){this.tone(530,.13);this.flash(e.label,2.2);}
    if(e.type==='checkpoint'){this.flash('Progress saved. You can return to this spot later.',2.5);}
    if(e.type==='complete')this.renderer.addEvents([{type:'finish',x:e.x,y:e.y}]);
  }
 }
 private renderComic(){if(!this.comic||!this.renderer||!this.world||this.mode!=='side')return;
  const closeToMaya=Math.abs(this.world.player.x-1185)<130&&Math.abs(this.world.player.y-565)<135;
  if(!this.comic.dialogOpen){if(closeToMaya)this.comic.prompt(this.quest?.snapshot.metMaya?'E · Talk again':'E · Talk to Maya');else this.comic.hidePrompt();}
  if(!this.comic.element.hidden){const p=this.renderer.getMayaScreenPosition();this.comic.position(p.x,p.y-11)}
 }
 private tone(freq:number,len:number){if(this.muted)return;try{
  this.audio ??= new AudioContext();if(this.audio.state==='suspended')void this.audio.resume();const now=this.audio.currentTime;
  const osc=this.audio.createOscillator(),gain=this.audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(freq*.74,now+len);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.045,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+len);
  osc.connect(gain).connect(this.audio.destination);osc.start(now);osc.stop(now+len+.01);
 }catch{/* Audio is optional and must not prevent play. */}}
 private flash(msg:string,seconds:number){this.lastMessage=msg;this.msgUntil=performance.now()+seconds*1000;}
 private renderHud(){if(!this.view||!this.world)return;const stats=this.world.stats;
  const stars=`★ ${stats.ribbons} / ${this.world.ribbons.length}`;
  if(stars!==this.lastHudStars){this.view.querySelector('#aq-ribbons')!.textContent=stars;this.lastHudStars=stars;}
  const min=Math.floor(stats.elapsed/60),sec=Math.floor(stats.elapsed%60),tm=`${min}:${String(sec).padStart(2,'0')}`;
  if(tm!==this.lastHudTime){this.view.querySelector('#aq-time')!.textContent=tm;this.lastHudTime=tm;}
  const mayanear=this.mode==='side'&&Math.abs(this.world.player.x-1185)<150;
  const message=this.comic?.dialogOpen||mayanear?'':performance.now()<this.msgUntil?this.lastMessage:(this.mode==='side'?this.levelPrompt():'');
  if(this.quest){const objective=this.quest.description;if(objective!==this.questLabel){this.view.querySelector<HTMLElement>('#aq-quest-objective')!.textContent=objective;this.questLabel=objective;}}
  if(message!==this.lastHudHint){this.view.querySelector<HTMLElement>('#aq-hint')!.textContent=message;this.lastHudHint=message;}
  // Readonly QA diagnostics: actual simulation coordinates, no gameplay hacks or hidden wins.
  this.view.dataset.playerX=String(Math.round(this.world.player.x));this.view.dataset.playerY=String(Math.round(this.world.player.y));this.view.dataset.ribbons=String(stats.ribbons);
 }

 private levelPrompt(){const x=this.world?.player.x??0;
  if(x<230)return 'Move right  ·  A / D or ← →';
  if(x<440)return 'Jump onto the ledge  ·  Space or ↑';
  if(x<615)return 'Bounce over the pillar  ·  Land on the blue trampoline';
  if(x<900)return 'Explore the path  ·  Find the golden stars';
  if(x<1235)return 'Find Maya by the school garden';
  if(x<1700)return 'Moving platform  ·  Jump when the deck comes close';
  if(x<1880)return 'Second bounce  ·  Use the trampoline to clear the wall';
  if(x<2260)return 'Push the ball  ·  Walk against it';
  if(x<2570)return 'Open the gate  ·  Press E or push the ball to the switch';
  if(x<2970)return 'Almost there  ·  Look for the yellow banner';
  return 'Finish  ·  Reach the banner!';
 }
 private showTutorial(){if(!this.view||!this.overlay)return;
  this.paused=true;this.pausedPainted=false;this.introOpen=true;this.controls.release();this.clock.reset();
  const card=this.overlay.querySelector<HTMLElement>('#aq-screen-card')!;
  card.classList.add('aq-tutorial-card');
  card.innerHTML=`<div class="aq-tutorial-kicker">WELCOME STREET · LEVEL 1</div>
    <h2>Let's go on an adventure!</h2>
    <p class="aq-tutorial-intro">Help the Ally Crew deliver a banner. Run, jump, discover stars, and explore the neighborhood.</p>
    <div class="aq-tutorial-grid">
      <div class="aq-tutorial-step"><span class="aq-tutorial-icon">◀ ▶</span><div><strong>Move</strong><small>Use A / D or the arrow keys.<br>On mobile, hold the left or right buttons.</small></div></div>
      <div class="aq-tutorial-step"><span class="aq-tutorial-icon">↑</span><div><strong>Jump</strong><small>Press Space or ↑. Hold longer to jump higher.</small></div></div>
      <div class="aq-tutorial-step"><span class="aq-tutorial-icon aq-star-icon">★</span><div><strong>Collect</strong><small>Find the five optional stars as you explore.</small></div></div>
      <div class="aq-tutorial-step"><span class="aq-tutorial-icon aq-bounce-icon">↥</span><div><strong>Bounce</strong><small>Jump onto the blue mat from above. Bounce high to clear the garden pillars; regular jumps cannot pass.</small></div></div>

    </div>
    <p class="aq-tutorial-note">Talk to friends with <strong>E</strong> · Restart with <strong>R</strong> · Pause with <strong>P</strong>. Follow the signs!</p>
    <button class="aq-tutorial-start" type="button">▶ Let's Go!</button>`;
  const btn=card.querySelector<HTMLButtonElement>('.aq-tutorial-start')!;
  btn.addEventListener('click',()=>{this.introOpen=false;this.paused=false;this.pausedPainted=false;this.overlay!.hidden=true;this.clock.reset();this.flash('Move right! Find the missing celebration banner.',2.5);this.tone(523,.11);this.canvas?.focus({preventScroll:true});});
  this.overlay.hidden=false;btn.focus();
 }
 private showCard(title:string,subtitle:string,buttons:{label:string;action:()=>void;primary?:boolean}[]){if(!this.overlay)return;
  const card=this.overlay.querySelector<HTMLElement>('#aq-screen-card')!;card.classList.remove('aq-tutorial-card');card.replaceChildren();
  const h=document.createElement('h2');h.textContent=title;card.append(h);const p=document.createElement('p');p.textContent=subtitle;card.append(p);
  const bar=document.createElement('div');bar.className='aq-card-actions';card.append(bar);
  for(const b of buttons){const btn=document.createElement('button');btn.type='button';btn.className=b.primary?'aq-primary':'aq-secondary';btn.textContent=b.label;btn.addEventListener('click',b.action);bar.append(btn)}
  this.overlay.hidden=false;bar.querySelector<HTMLButtonElement>('button')?.focus();
 }
 private showResult(){if(!this.world)return;this.paused=true;this.controls.release();this.comic?.close(false);
  const s=this.world.stats;const earned=s.ribbons>=5?3:s.ribbons>=3?2:1;this.onComplete?.(earned);this.showCard('Banner delivered!',`You recovered the banner, found ${s.ribbons}/5 stars and discovered ${this.quest?.secretsFound??0}/2 hidden surprises. You earned ${earned} star${earned===1?'':'s'} in ${Math.floor(s.elapsed)} seconds!`,[
   {label:'Play again',action:()=>this.restart(),primary:true},
   {label:'Back to home',action:()=>this.shutdown(true)}]);
  const card=this.overlay?.querySelector('#aq-screen-card');if(card){
    card.classList.add('aq-celebration-card');
    const stars=document.createElement('div');stars.className='aq-result-stars';stars.setAttribute('aria-label',`${earned} of 3 stars earned`);stars.textContent='★'.repeat(earned)+'☆'.repeat(3-earned);card.querySelector('h2')?.after(stars);
    const crew=document.createElement('div');crew.className='aq-crew-celebrate';crew.setAttribute('aria-label','The Ally Crew is celebrating the recovered banner');
    for(const name of ['ethan','maya','leo','ari']){const im=document.createElement('img');im.src=`assets/${name}.png`;im.alt=name;im.decoding='async';crew.appendChild(im)}
    const banner=document.createElement('div');banner.className='aq-outro-banner';banner.textContent='THE ALLY CREW DID IT!';
    card.querySelector('p')?.before(banner);card.querySelector('p')?.after(crew);
    this.tone(784,.28);
  }
 }
 togglePause(){if(!this.view||this.dead||this.introOpen||this.comic?.dialogOpen)return;this.paused=!this.paused;this.pausedPainted=false;this.controls.release();
  if(this.paused){this.showCard('Paused','Take a break. Your progress in this run stays here until you restart or return home.',[
   {label:'Resume',action:()=>{this.paused=false;if(this.overlay)this.overlay.hidden=true;this.canvas?.focus()},primary:true},
   {label:'Restart',action:()=>this.restart()},
   {label:'How to Play',action:()=>this.showTutorial()},
   
   {label:'Home',action:()=>this.shutdown(true)}]);
  }else{if(this.overlay)this.overlay.hidden=true;this.clock.reset();this.canvas?.focus()}
 }
 restart(){if(!this.view||!this.world)return;this.quest?.resetRun();this.comic?.close(false);this.world.reset();this.dead=false;this.paused=false;this.pausedPainted=false;this.clock.reset();this.controls.release();if(this.overlay)this.overlay.hidden=true;
  this.flash('Fresh start! Find the banner and discover shortcuts.',2.5);this.canvas?.focus();
 }
 shutdown(callExit:boolean){cancelAnimationFrame(this.raf);this.controls.detach();window.removeEventListener('keydown',this.keyHandler);window.removeEventListener('resize',this.resizeHandler);
  this.comic?.destroy();this.comic=null;this.quest=null;this.questLabel='';this.music.reset();this.view?.remove();this.view=null;this.canvas=null;this.renderer=null;this.world=null;this.overlay=null;this.dead=false;this.paused=false;this.introOpen=false;this.pausedPainted=false;this.lastHudHint='';this.lastHudTime='';this.lastHudStars='';
  if(this.audio){void this.audio.close().catch(()=>{});this.audio=null;}if(callExit)this.onExit();
 }
}
