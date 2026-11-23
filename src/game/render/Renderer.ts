import {WelcomePainter} from './WelcomePainter.js';
import {ArtAssets} from './ArtAssets.js';
import {clamp,type GameEvent,type Sim,type Vec2} from '../physics/types.js';
import {SideWorld} from '../physics/SideWorld.js';
import {TopWorld} from '../physics/TopWorld.js';
import type {QuestSave} from '../story/WelcomeQuest.js';
interface Particle{x:number;y:number;vx:number;vy:number;life:number;max:number;color:string;size:number}
const TAU=Math.PI*2;
function seed(n:number){const x=Math.sin(n*127.1+31.4)*43758.5453;return x-Math.floor(x)}
export class Renderer {
 private art=new ArtAssets();private painter:WelcomePainter;private ctx:CanvasRenderingContext2D;private w=1;private h=1;private scale=1;private cx=0;private cy=0;private particles:Particle[]=[];private elapsed=0;private dpr=1;private npcOffset=0;private npcScale=1;private npcAvoidSide=1;private npcNear=false;private story:QuestSave|null=null;
 constructor(private readonly canvas:HTMLCanvasElement){const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas 2D not available');this.ctx=ctx;this.painter=new WelcomePainter(ctx);this.resize()}
 resize(){const r=this.canvas.getBoundingClientRect();this.w=Math.max(1,r.width);this.h=Math.max(1,r.height);const dpr=Math.max(.8,Math.min(window.devicePixelRatio||1,1.6,Math.sqrt(1580000/(this.w*this.h))));this.dpr=dpr;this.canvas.width=Math.floor(this.w*dpr);this.canvas.height=Math.floor(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.canvas.dataset.qualityScale=dpr.toFixed(2)}
 setStory(story:QuestSave){this.story=story}
 worldToScreen(x:number,y:number){return {x:(x-this.cx)*this.scale,y:(y-this.cy)*this.scale}}
 getMayaScreenPosition(){return this.worldToScreen(1185+this.npcOffset,416)}
 camera(world:Sim,dt:number){const aspect=world.mode==='side'?1060:1110;this.scale=clamp(this.w/aspect,this.w<560?(world.mode==='side'?.82:.78):.54,world.mode==='side'?1.34:1.45);
  const viewW=this.w/this.scale,viewH=this.h/this.scale;
  const player=world.player;
  const wantedX=world.mode==='side'?player.x-viewW*.37-player.vx*.18:player.x-viewW*.49;
  const wantedY=world.mode==='side'?(this.w<560?315:425)-viewH*.50:player.y-viewH*.51;
  const limX=Math.max(0,world.width-viewW),limY=Math.max(0,world.height-viewH);
  let tx=clamp(wantedX,0,limX),ty=world.mode==='side'?wantedY:clamp(wantedY,0,limY);
  if(viewH>world.height&&world.mode==='top')ty=-(viewH-world.height)/2;
  if(dt===0){this.cx=tx;this.cy=ty;}else{const a=1-Math.exp(-5.8*dt);this.cx+=(tx-this.cx)*a;this.cy+=(ty-this.cy)*a;}
 }
 private rect(x:number,y:number,w:number,h:number,color:string|CanvasGradient,r=0){const c=this.ctx;c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
 private ellipse(x:number,y:number,rx:number,ry:number,color:string|CanvasGradient){const c=this.ctx;c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
 private line(x:number,y:number,x2:number,y2:number,color:string,width=2){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()}
 private pill(x:number,y:number,w:number,h:number,color:string,r=11){this.rect(x,y,w,h,color,r)}
 addEvents(events:GameEvent[]){for(const e of events){let amount=e.type==='finish'?90:e.type==='bounce'?23:e.type==='ribbon'?24:e.type==='land'?7:e.type==='dash'?8:5;if(e.type==='interact')amount=10;
  for(let i=0;i<amount;i++){const a=(i/amount)*TAU+seed(i*19.1+e.x)*.5,sp=20+seed(i*41.1+e.y)*175;
   this.particles.push({x:e.x,y:e.y-12,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(e.type==='finish'?160:70),life:.25+seed(i*7.1+e.x)*.7,max:1,color:['#fff3b4','#fecf58','#73dbe1','#f5a4b5','#9a7fe8'][i%5],size:2.4+seed(i+7)*4.5});
  }
 }}
 draw(world:Sim,dt:number,quiet=false){this.elapsed+=dt;this.camera(world,dt);
  const c=this.ctx,dpr=this.canvas.width/this.w;c.setTransform(dpr,0,0,dpr,0,0);
  const sky=c.createLinearGradient(0,0,0,this.h);sky.addColorStop(0,'#75b8ed');sky.addColorStop(.55,'#d6f0fc');sky.addColorStop(1,'#d5f3d2');c.fillStyle=sky;c.fillRect(0,0,this.w,this.h);
  if(world.mode==='side'){
    if(!this.art.background(c,this.w,this.h,this.cx,(565-this.cy)*this.scale,quiet,this.elapsed))this.painter.background(this.w,this.h,this.cx,this.elapsed,quiet);
    // Depth cue: quiet the busy building details only around the playable lane.
    // The closer physics geometry will be painted above this veil at full contrast.
    const screenGround=(565-this.cy)*this.scale;
    const fog=c.createLinearGradient(0,screenGround-220,0,screenGround+20);
    fog.addColorStop(0,'rgba(240,250,250,0)');fog.addColorStop(.72,'rgba(236,247,242,.11)');fog.addColorStop(1,'rgba(233,244,230,.25)');
    c.fillStyle=fog;c.fillRect(0,Math.max(0,screenGround-220),this.w,240);
  }else this.drawTopBackground();
  c.save();c.scale(this.scale,this.scale);c.translate(-this.cx,-this.cy);
  if(world.mode==='side')this.drawSide(world as SideWorld);else this.drawTop(world as TopWorld);
  this.drawParticles(dt,quiet);
  c.restore();
  if(world.mode==='side')this.painter.foreground(this.w,this.h,this.elapsed,quiet);
  // Omit an expensive full-screen radial vignette on every interactive frame.
 }
 private drawSideBackground(){const c=this.ctx;
  const hills=[['#b5dcb7',.33,.55],['#9bd4af',.51,.69],['#7bc99b',.70,.83]] as const;
  for(let i=0;i<9;i++){const x=((i*265-this.cx*(.05+i%2*.035))*this.scale)%(this.w+430);let xx=x<-180?x+this.w+430:x;
   this.ellipse(xx+80,100+seed(i+9)*75,70,27,'rgba(255,255,255,.55)');this.ellipse(xx+33,110+seed(i+9)*75,47,22,'rgba(255,255,255,.45)');}
  for(const [color,factor,heightFactor] of hills){const y=this.h*heightFactor;c.fillStyle=color;c.beginPath();c.moveTo(0,this.h);c.lineTo(0,y+15);
   for(let x=0;x<=this.w+40;x+=40){c.lineTo(x,y+Math.sin(x/145+this.cx*factor/700)*27+Math.sin(x/75+.8)*9)}c.lineTo(this.w,this.h);c.fill();}
  for(let i=0;i<52;i++){const x=(i*123-this.cx*.19*this.scale)%(this.w+140);let xx=x<0?x+this.w+140:x;const s=14+seed(i*8)*21;
   this.rect(xx,this.h*.56+seed(i*11)*70,s*.16,s*2.2,'#71a69a',2);
   this.ellipse(xx+s*.08,this.h*.56+seed(i*11)*70,s*.8,s*.75,'rgba(61,149,120,.35)');}
 }
 private drawTopBackground(){const c=this.ctx;c.fillStyle='#cae9c5';c.fillRect(0,0,this.w,this.h);
  c.save();c.globalAlpha=.4;for(let i=0;i<20;i++)this.ellipse((i*239-this.cx*.08)%(this.w+200),i*73%this.h,110,54,'#9fd8bc');c.restore();}
 private drawSide(world:SideWorld){const c=this.ctx,t=world.clock;
  // Non-colliding architecture is drawn behind the collidable world.
  // Background plate contains its own finely rendered architecture; keep only live physics geometry on top.
  if(!this.art.image('panorama'))this.painter.worldBehind(t,window.matchMedia('(prefers-reduced-motion: reduce)').matches,this.cx-90,this.cx+this.w/this.scale+90);
  this.drawGaps(world,t);
  for(const p of world.platforms)if(p.x+p.w>this.cx-90&&p.x<this.cx+this.w/this.scale+90){
    // Moving decks are ONE-WAY surfaces. When the hero walks under a deck,
    // gently fade its non-colliding artwork instead of visually intersecting
    // the character. The collision rectangles never move or change.
    const crossing=p.moving&&world.player.y>p.y+32&&world.player.y-143<p.y+23;
    const near=crossing?Math.max(0,1-Math.max(p.x-world.player.x,world.player.x-(p.x+p.w),0)/60):0;
    c.save();if(crossing)c.globalAlpha=1-near*.57;
    if(!this.art.platform(c,p,t))this.painter.platform(p);
    c.restore();
  }
  // Bounce-only decorative pillars are solid from crest to ground: no underside route.
  for(const wall of world.bounceWalls)this.drawBouncePillar(wall);
  for(const s of world.springs)if(!this.art.spring(c,s.x,s.y+18,s.w,t))this.painter.spring(s.x,s.y+18,s.w,t);
  // All interactions still use the SideWorld physics state.
  this.rect(2290,556,75,9,world.gateOpen?'#93d978':'#f8c16a',5);
  this.rect(2306,559,43,5,'#5d718e',3);
  if(!world.gateOpen){
   this.rect(world.gate.x,world.gate.y,world.gate.w,world.gate.h,'#245982',6);
   this.rect(world.gate.x+5,world.gate.y+7,8,world.gate.h-14,'#7acddd',3);
   this.rect(world.gate.x-15,world.gate.y-35,62,27,'#f9dca3',5);
   c.font='900 12px system-ui';c.fillStyle='#2b5272';c.fillText('GATE',world.gate.x-2,world.gate.y-16);
  }else this.ellipse(world.gate.x+12,548,33,6,'rgba(121,234,163,.42)');
  this.ellipse(world.ball.x+3,world.ball.y+20,25,6,'rgba(36,73,54,.24)');
  this.ellipse(world.ball.x,world.ball.y,21,21,'#f4b95f');
  this.ellipse(world.ball.x-7,world.ball.y-9,10,7,'#ffe6a5');
  this.line(world.ball.x-7,world.ball.y+7,world.ball.x+10,world.ball.y+13,'#c58144',3);
  for(const r of world.ribbons)if(!r.got)this.drawRibbon(r.x,r.y,t+r.id*.6);
  // Inline tutorial replaces bulky ground signs that obstruct gameplay and ledges.
  // Gameplay geometry and its coordinates remain unchanged.

  // Friendly NPC: give the hero a little personal space visually as they
  // approach; this does not add a collider or alter the interaction distance.
  const npcX=1185,delta=world.player.x-npcX;
  if(Math.abs(delta)<96&&!this.npcNear){this.npcNear=true;this.npcAvoidSide=delta<=0?1:-1;}
  if(Math.abs(delta)>145)this.npcNear=false;
  const proximity=Math.max(0,1-Math.abs(delta)/110);
  const targetOffset=this.npcAvoidSide*105*proximity;
  this.npcOffset+=(targetOffset-this.npcOffset)*.19;
  this.npcScale+=((1-.14*proximity)-this.npcScale)*.19;
  const npcVisualX=npcX+this.npcOffset;
  this.ellipse(npcVisualX,564,38,6,'rgba(27,46,32,.30)');
  this.ellipse(npcVisualX,561,28,3,'rgba(255,238,158,.60)');
  const nearMaya=Math.abs(delta)<150;
  if(!this.art.npc(c,npcVisualX,565,t,nearMaya,this.npcScale)){
    c.save();c.translate(npcVisualX,565);c.scale(this.npcScale,this.npcScale);
    this.painter.npc(0,0,t,'maya');c.restore();
  }
  // Comic dialogue is a real HTML speech balloon anchored to Maya by GameHost.
  // The old canvas E TALK placard is intentionally not drawn.
  // Low-profile checkpoint medallions are painted flush with ground, never
  // intrude beneath raised ledges or into the player/gantry silhouette.
  for(const x of [1570,2085]){
    const active=world.checkpoint.x>=x;
    const ring=active?'#78ddbb':'#ffdf86';
    this.ellipse(x,564,28,7,'rgba(24,53,41,.35)');
    this.ellipse(x,557,19,6,active?'#246f6b':'#8a6741');
    this.ellipse(x,555,14,4,ring);
    this.ellipse(x,553,5.5,2.2,'#fff9dc');
    if(active){
      this.ellipse(x,538,8,8,'rgba(153,255,207,.85)');
      c.fillStyle='#155f64';c.font='900 10px system-ui';c.textAlign='center';c.fillText('✓',x,542);c.textAlign='start';
    }
  }
  this.drawQuestDetails(world,t);
  this.drawFinish(3088,565,t,world.stats.finished);
  if(!this.art.hero(c,world.player,world.grounded,t,world.stats.finished))this.painter.hero(world.player,world.grounded,t);
  if(!world.gateOpen&&Math.abs(world.player.x-2470)<120)this.drawHint(2460,395,'E  Open gate');
  // Single contextual speech marker above Maya; avoid doubled, colliding hint bubbles.
 }
 private drawQuestDetails(world:SideWorld,t:number){
  const c=this.ctx, story=this.story;if(!story)return;
  // A tangible banner in the last garden, not a score in the HUD.
  const x=2922,y=478;
  if(!story.bannerFound){
    c.save();c.translate(x,y);c.rotate(Math.sin(t*2.4)*.037);
    c.shadowColor='rgba(45,69,62,.28)';c.shadowBlur=10;
    c.strokeStyle='#775f42';c.lineWidth=6;c.beginPath();c.moveTo(-40,-11);c.lineTo(-40,20);c.stroke();
    c.fillStyle='#ffdc69';c.beginPath();c.moveTo(-38,-8);c.quadraticCurveTo(0,-25,52,-8);c.lineTo(48,35);c.quadraticCurveTo(5,18,-37,35);c.closePath();c.fill();
    c.shadowBlur=0;c.strokeStyle='#e2875d';c.lineWidth=4;c.stroke();c.font='900 17px system-ui';c.fillStyle='#8f4b5a';c.textAlign='center';c.fillText('ALLY!',6,10);c.textAlign='start';c.restore();
    this.ellipse(x,y-42+Math.sin(t*3)*4,5,5,'#ffe87c');
  }else if(!story.completed){
    c.save();c.translate(world.player.x+22,world.player.y-104);c.rotate(Math.sin(t*3)*.08);
    this.rect(0,-12,22,19,'#ffcc62',3);this.line(1,-13,1,21,'#735743',2.2);
    this.ellipse(13,-4,3,3,'#e28c5e');c.restore();
  }
  if(!story.secrets.includes('garden-kite'))this.drawSecret(1575,374,t,'#c7a1e8');
  if(!story.secrets.includes('bridge-ribbon'))this.drawSecret(2370,426,t,'#91d2e2');
  if(story.completed){
    c.save();for(let i=0;i<6;i++){
      const bx=3005+i*46,by=360+Math.sin(i*1.4)*18;
      this.line(bx,by-12,bx+45,by+Math.sin(i*2)*7,'#efe6bd',2);
      this.rect(bx+7,by-7,18,23,i%2?'#f3a2bd':'#ffe37f',2);
    }c.restore();
  }
 }
 private drawSecret(x:number,y:number,t:number,color:string){
  const c=this.ctx;c.save();c.translate(x,y+Math.sin(t*2)*4);c.rotate(Math.sin(t*1.5)*.14);
  c.shadowColor=color;c.shadowBlur=14;c.fillStyle=color;c.beginPath();
  c.moveTo(0,-15);c.lineTo(13,0);c.lineTo(0,13);c.lineTo(-13,0);c.closePath();c.fill();
  c.strokeStyle='#fffdf3';c.lineWidth=2.5;c.stroke();c.restore();
 }
 private drawBouncePillar(w:{x:number;y:number;w:number;h:number}){
  const c=this.ctx,{x,y,h,w:width}=w;
  c.save();
  // Chunky ivy-covered limestone pier: both silhouette and collision have the
  // same full-height bounds. Its stone and foliage harmonize with the level art.
  c.shadowColor='rgba(22,43,38,.38)';c.shadowBlur=12;c.shadowOffsetX=-5;
  const stone=c.createLinearGradient(x,0,x+width,0);
  stone.addColorStop(0,'#766f62');stone.addColorStop(.13,'#a99e81');stone.addColorStop(.42,'#e2d6b0');stone.addColorStop(.75,'#c5b595');stone.addColorStop(1,'#6b746d');
  this.rect(x,y,width,h,stone,3);c.shadowBlur=0;c.shadowOffsetX=0;
  c.save();c.beginPath();c.rect(x+2,y+2,width-4,h-5);c.clip();
  for(let row=0,yy=y+18;yy<y+h;yy+=24,row++){
    this.line(x+1,yy,x+width-1,yy,'rgba(74,79,72,.52)',1.7);
    const seam=x+((row%2)?width*.35:width*.72);
    this.line(seam,yy,seam,Math.min(yy+24,y+h),'rgba(74,79,72,.42)',1.4);
    this.line(x+4,yy+4,x+width-6,yy+4,'rgba(254,247,207,.16)',1);
  }
  c.restore();
  // Cream coping and a recognizable bounce arrow show what to do.
  this.rect(x-7,y-12,width+14,12,'#595d53',3);
  this.rect(x-6,y-17,width+12,8,'#eee0b3',3);
  this.rect(x+2,y+11,width-4,42,'rgba(52,77,68,.82)',6);
  c.fillStyle='#ffe2a0';c.font='900 29px system-ui';c.textAlign='center';
  c.fillText('↑',x+width/2,y+44);c.textAlign='start';
  // Creeping vines are organically grouped, not repeated pipe-like dots.
  for(const side of [-1,1]){
    c.strokeStyle='#437744';c.lineWidth=3.2;c.lineCap='round';c.beginPath();
    const edge=side<0?x+3:x+width-3;
    c.moveTo(edge,y+63);
    for(let k=0;k<7;k++){
      const yy=y+63+k*(h-78)/7;
      c.quadraticCurveTo(edge+side*(7+k%2*4),yy+10,edge,yy+20);
    }
    c.stroke();
    for(let k=0;k<11;k++){
      const yy=y+68+k*(h-82)/11;
      const xx=edge+side*(k%3===0?10:4);
      this.ellipse(xx,yy,8,4,k%3===0?'#87ab55':k%2?'#3f8844':'#6ba04a');
      if(k%3===0)this.ellipse(xx-side*8,yy+5,5,3,'#a1c56d');
    }
  }
  this.rect(x-6,y+h-14,width+12,13,'#777267',3);
  this.rect(x-4,y+h-14,width+8,4,'#efe0b8',2);
  c.restore();
 }
 private drawNpcMarker(x:number,y:number,t:number){
  const c=this.ctx,b=Math.sin(t*2.8)*3;c.save();c.translate(x,y+b);
  c.shadowColor='#344d70';c.shadowBlur=11;
  this.rect(-33,-30,66,35,'#fff9e9',14);c.shadowBlur=0;
  c.strokeStyle='#286b8d';c.lineWidth=3;c.strokeRect(-28,-24,56,24);
  c.fillStyle='#17466b';c.font='900 18px system-ui';c.textAlign='center';c.fillText('E  TALK',0,-7);
  c.fillStyle='#fff9e9';c.beginPath();c.moveTo(-6,4);c.lineTo(0,13);c.lineTo(6,4);c.fill();
  c.restore();
 }
 private drawTop(world:TopWorld){const c=this.ctx,t=world.clock;
  this.rect(-60,-60,world.width+120,world.height+120,'#a5d59b',28);
  // Long winding paths and garden beds provide directional wayfinding.
  c.strokeStyle='#e8d9b0';c.lineWidth=125;c.lineCap='round';c.beginPath();c.moveTo(80,465);c.bezierCurveTo(700,300,810,870,1370,500);c.bezierCurveTo(1750,260,1780,745,2110,490);c.stroke();
  c.strokeStyle='#fff1cb';c.lineWidth=7;c.setLineDash([8,25]);c.stroke();c.setLineDash([]);
  for(let i=0;i<85;i++){const x=35+(i*167)%world.width,y=25+(i*271)%world.height;if(x<150&&y>400&&y<540)continue;
   this.ellipse(x,y,2.5+seed(i)*4,2.5+seed(i+4)*4,i%3?'#75b57b':'#fff5d4');}
  for(const r of world.obstacles){this.ellipse(r.x+r.w/2,r.y+r.h/2+9,r.w*.55,r.h*.47,'rgba(38,103,76,.22)');
   this.rect(r.x,r.y,r.w,r.h,'#679c65',34);
   for(let i=0;i<5;i++){const xx=r.x+12+seed(i+r.x)*Math.max(1,r.w-24),yy=r.y+12+seed(i+r.y)*Math.max(1,r.h-24);this.ellipse(xx,yy,23,22,i%2?'#7bc86f':'#9ada80');}
  }
  for(const bar of world.movingObstacles){this.rect(bar.x,bar.y,bar.w,bar.h,'#377fa1',16);this.rect(bar.x+5,bar.y+5,bar.w-10,9,'#77daed',9);}
  this.rect(world.gate.x,world.gate.y,world.gate.w,world.gate.h,world.gateOpen?'rgba(125,231,175,.23)':'#3b81b5',13);
  this.rect(1751,591,45,46,'#ffd37b',12);this.ellipse(1765,603,12,12,'#bd7ab0');
  for(const r of world.ribbons)if(!r.got)this.drawRibbon(r.x,r.y,t+r.id);
  this.ellipse(world.ball.x+4,world.ball.y+9,23,9,'rgba(36,79,56,.22)');this.ellipse(world.ball.x,world.ball.y,21,21,'#ffbe73');this.ellipse(world.ball.x-6,world.ball.y-7,10,6,'#ffedbe');
  this.drawTopGoal(2110,490,t);this.drawTopHero(world.player.x,world.player.y,world.facingVector,t);
  if(!world.gateOpen&&Math.abs(world.player.x-1788)<110&&Math.abs(world.player.y-550)<100)this.drawHint(1770,495,'E  Open gate');
 }
 private drawGaps(world:SideWorld,t:number){
  const c=this.ctx;
  const grounds=world.platforms.filter(p=>p.id.startsWith('ground')).sort((a,b)=>a.x-b.x);
  for(let i=0;i<grounds.length-1;i++){
   const left=grounds[i],right=grounds[i+1],a=left.x+left.w,b=right.x;
   if(b<this.cx-80||a>this.cx+this.w/this.scale+80)continue;
   if(b<=a||b<this.cx-140||a>this.cx+this.w/this.scale+140)continue;
   const mid=(a+b)*.5,top=565,deep=top+265;
   // A shallow ravine with rock banks and visible stream below, never a blue rectangle.
   const soil=c.createLinearGradient(0,top,0,deep);soil.addColorStop(0,'#586e57');soil.addColorStop(.24,'#405e59');soil.addColorStop(1,'#294f57');
   c.fillStyle=soil;c.fillRect(a,top,b-a,550);
   c.save();c.beginPath();c.rect(a,top,b-a,520);c.clip();
   const shimmer=c.createLinearGradient(0,top+50,0,top+220);shimmer.addColorStop(0,'#164859');shimmer.addColorStop(.22,'#2b7c87');shimmer.addColorStop(.66,'#4db0b6');shimmer.addColorStop(1,'#225b73');
   c.fillStyle=shimmer;c.fillRect(a,top+43,b-a,240);
   // Pebbled rocky shores hide angular cutout and establish real edge depth.
   for(let j=0;j<9;j++){
    const xx=a+(j%2===0?0:b-a)+(j%2===0?1:-1)*(3+j*3), yy=top+20+j*28;
    const rx=10+(j*19)%13,ry=13+(j*11)%10;
    this.ellipse(xx,yy,rx,ry,j%3?'#706f5d':'#8e8a6e');this.ellipse(xx-3,yy-5,rx*.62,ry*.35,'#b4a98b');
   }
   for(let k=0;k<13;k++){
    const yy=top+58+k*13;
    const alpha=.12+(k%3)*.07; c.strokeStyle=`rgba(222,253,247,${alpha})`;c.lineWidth=1.5+(k%3);
    c.beginPath();c.moveTo(a+3,yy+Math.sin(t*1.1+k)*2);
    c.quadraticCurveTo(mid,yy-3+Math.sin(t*1.6+k)*3,b-3,yy);c.stroke();
   }
   // Waterfall bubbles at the bottom, intentionally below the collision line.
   for(let k=0;k<7;k++){
    const xx=a+7+(k*17)%(Math.max(18,b-a-14));
    this.ellipse(xx,top+48+Math.sin(t*2.2+k)*3,5,2,'rgba(243,254,241,.60)');
   }
   c.restore();
   // Distinct grassy lips and large stone corner boulders make the gap legible.
   for(const x of [a,b]){
    const dir=x===a?-1:1;
    c.fillStyle='#516a43';c.beginPath();c.moveTo(x,top-6);c.lineTo(x+dir*14,top-16);c.lineTo(x+dir*5,top+13);c.closePath();c.fill();
    this.ellipse(x+dir*7,top+18,13,14,'#7b7b63');
    this.ellipse(x+dir*9,top+12,8,4,'#b1a887');
   }
  }
 }
 private drawGuideSign(x:number,y:number,title:string,detail:string){
  const c=this.ctx;c.save();c.translate(x,y);
  const width=106,height=65;
  c.strokeStyle='#5d4938';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(0,-2);c.lineTo(0,22);c.stroke();
  this.ellipse(0,23,24,5,'rgba(36,49,38,.20)');
  c.shadowColor='rgba(37,45,32,.28)';c.shadowBlur=10;c.shadowOffsetY=4;
  const fill=c.createLinearGradient(0,-64,0,-1);fill.addColorStop(0,'#db9c60');fill.addColorStop(.48,'#a9744a');fill.addColorStop(1,'#76523c');
  this.rect(-width/2,-height,width,height,fill as unknown as string,12);
  c.shadowBlur=0;c.shadowOffsetY=0;
  c.strokeStyle='#f7d7a2';c.lineWidth=3;c.strokeRect(-width/2+5,-height+6,width-10,height-12);
  c.textAlign='center';c.fillStyle='#fff6d6';c.font='900 16px system-ui';c.fillText(title,0,-38);
  c.fillStyle='#f7f2e2';c.font='900 12px system-ui';c.fillText(detail,0,-18);
  c.fillStyle='#ebc98a';for(const xx of [-44,44])for(const yy of [-55,-9])this.ellipse(xx,yy,2.3,2.3,'#f6d9a6');
  c.restore();
 }
 private drawRibbon(x:number,y:number,t:number){
  const c=this.ctx,bob=Math.sin(t*3)*4;c.save();c.translate(x,y+bob);c.rotate(Math.sin(t*1.7)*.08);
  const halo=c.createRadialGradient(0,0,3,0,0,34);halo.addColorStop(0,'rgba(255,241,152,.52)');halo.addColorStop(1,'rgba(255,221,83,0)');c.fillStyle=halo;c.beginPath();c.ellipse(0,0,34,34,0,0,Math.PI*2);c.fill();
  c.shadowColor='#ffc841';c.shadowBlur=13;c.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?10:22;const xx=Math.cos(a)*r,yy=Math.sin(a)*r;i?c.lineTo(xx,yy):c.moveTo(xx,yy)}
  c.closePath();c.fillStyle='#f5a917';c.fill();c.lineWidth=2.8;c.strokeStyle='#fff8e2';c.stroke();c.shadowBlur=0;
  c.save();c.translate(-1,-1);c.scale(.66,.66);c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?10:22;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fillStyle='#ffe46c';c.fill();c.restore();
  c.fillStyle='rgba(255,255,255,.92)';c.beginPath();c.arc(-6,-9,3.2,0,Math.PI*2);c.fill();c.restore();
 }
 private drawSideHero(x:number,y:number,vx:number,t:number){const c=this.ctx;const moving=Math.abs(vx)>55,step=moving?Math.sin(t*17)*7:Math.sin(t*2.6)*1.4;
  c.save();c.translate(x,y+(!moving?Math.sin(t*2)*.5:0));
  this.ellipse(0,1,24,6,'rgba(26,57,62,.23)');
  // Distinct blue backpack, independent arm and foot animation.
  this.rect(-21,-42,21,31,'#224f84',7);this.rect(-21,-36,6,19,'#3ca2c4',3);
  this.line(-8,-7,-9+step,-1,'#274c77',8);this.line(6,-7,7-step,-1,'#274c77',8);
  this.rect(-15,-42,29,34,'#278aaf',10);this.rect(-9,-36,16,13,'#5bc3d1',5);
  this.line(-12,-33,-20-step*.3,-19,'#e9a979',8);this.line(10,-33,18+step*.3,-19,'#e9a979',8);
  this.ellipse(0,-57,19,20,'#f3ba86');this.ellipse(-17,-54,4,6,'#e9aa7b');
  c.fillStyle='#6f462d';c.beginPath();c.moveTo(-20,-63);c.quadraticCurveTo(-19,-92,1,-83);c.quadraticCurveTo(24,-88,19,-59);c.lineTo(8,-71);c.quadraticCurveTo(-7,-63,-20,-63);c.fill();
  this.ellipse(-6,-57,3.4,4.4,'#fffdf3');this.ellipse(8,-57,3.4,4.4,'#fffdf3');
  this.ellipse(-5,-57,1.8,3,'#4c322e');this.ellipse(9,-57,1.8,3,'#4c322e');
  this.line(0,-48,8,-48,'#a65d54',1.9);
  this.ellipse(-9,-47,4,2,'rgba(234,116,117,.28)');
  c.restore();}
 private drawTopHero(x:number,y:number,facing:Vec2,t:number){const c=this.ctx;c.save();c.translate(x,y);c.rotate(Math.atan2(facing.y,facing.x)+Math.PI/2);
  this.ellipse(0,12,18,8,'rgba(44,75,48,.18)');this.ellipse(0,5,18,19,'#277fa4');this.rect(-13,-4,26,25,'#32a1c0',9);
  this.ellipse(0,-13,17,17,'#f1bb8b');this.ellipse(0,-21,16,9,'#795139');
  this.ellipse(-7,-13,2.2,3,'#44302b');this.ellipse(6,-13,2.2,3,'#44302b');this.line(-4,-5,5,-5,'#b1655a',2);
  c.restore();}
 private drawSideNpc(x:number,y:number,t:number){const c=this.ctx;c.save();c.translate(x,y);
  this.ellipse(0,0,22,5,'rgba(31,71,54,.18)');this.rect(-16,-39,31,33,'#a684d1',12);
  this.ellipse(0,-58+Math.sin(t*2.5)*1.5,20,21,'#b97e59');
  this.ellipse(0,-77,22,10,'#51372d');for(let i=0;i<5;i++)this.ellipse(-14+i*7,-77+(i%2)*3,8,8,'#4e3226');
  this.ellipse(-6,-57,3.5,4,'#fff');this.ellipse(7,-57,3.5,4,'#fff');this.ellipse(-6,-57,1.7,2.5,'#302729');this.ellipse(7,-57,1.7,2.5,'#302729');
  this.line(-4,-47,5,-47,'#713a31',2);c.restore();}
 private drawFinish(x:number,y:number,t:number,completed:boolean){const c=this.ctx;
  this.line(x,y,x,y-155,'#8f6d47',7);this.ellipse(x,y-150,8,8,'#ffca62');
  const wave=Math.sin(t*3)*8;this.rect(x,y-146,88,58,completed?'#f5c84b':'#f4a15c',9);
  c.fillStyle='#fff4c5';c.font='bold 14px system-ui';c.fillText(completed?'HOORAY!':'BANNER',x+12,y-115+wave*.08);
  this.ellipse(x-3,y-155,20,4,'rgba(255,255,255,.5)');}
 private drawTopGoal(x:number,y:number,t:number){const wave=Math.sin(t*2.5)*5;
  this.ellipse(x,y,56,56,'rgba(253,225,116,.25)');this.ellipse(x,y,42+wave,42+wave,'rgba(252,206,90,.35)');
  this.ellipse(x,y,30,30,'#f8c65a');this.ellipse(x,y,21,21,'#fff1b9');
  this.line(x,y-37,x,y-100,'#675d4b',4);this.rect(x,y-105,75,33,'#a78ed9',5);
 }
 private drawHint(x:number,y:number,label:string){const c=this.ctx;c.font='bold 17px system-ui';const w=c.measureText(label).width+25;
  this.pill(x-w/2,y-26,w,34,'rgba(255,255,255,.96)',17);c.fillStyle='#184661';c.fillText(label,x-w/2+12,y-3);}
 private drawParticles(dt:number,quiet:boolean){const c=this.ctx;const step=quiet?0:dt;
  for(const p of this.particles){p.life-=step;if(p.life<=0)continue;p.x+=p.vx*step;p.y+=p.vy*step;p.vy+=110*step;
   c.globalAlpha=Math.min(1,p.life/(p.max*.55));this.ellipse(p.x,p.y,p.size,p.size*.65,p.color);
  }c.globalAlpha=1;this.particles=this.particles.filter(p=>p.life>0);
 }
 private drawSoftVignette(){const c=this.ctx;const g=c.createRadialGradient(this.w/2,this.h/2,this.w*.2,this.w/2,this.h/2,this.w*.82);
  g.addColorStop(0,'rgba(12,36,42,0)');g.addColorStop(1,'rgba(12,48,60,.10)');c.fillStyle=g;c.fillRect(0,0,this.w,this.h);}
}
