import test from 'node:test';
import assert from 'node:assert/strict';
import {SideWorld} from '../web/assets/js/game/physics/SideWorld.js';
import {TopWorld} from '../web/assets/js/game/physics/TopWorld.js';
import {FixedClock} from '../web/assets/js/game/physics/FixedClock.js';
const dt=1/60;
const i=(x=0,y=0,jump=false,held=false,dash=false,interact=false)=>({x,y,jump,jumpHeld:held,dash,interact});
function run(world,n,input){for(let a=0;a<n;a++)world.step(dt,typeof input==='function'?input(a):input)}
test('side: real acceleration and braking change position continuously',()=>{
 const w=new SideWorld();const start=w.player.x;
 run(w,55,i(1));assert.ok(w.player.x>start+170,`${w.player.x} moved`);
 const before=w.player.x;run(w,15,i());assert.ok(w.player.x>before);assert.ok(Math.abs(w.player.vx)<10);
});
test('side: simulation is deterministic for equal inputs and fixed timestep',()=>{
 const a=new SideWorld(),b=new SideWorld();
 const input=t=>i(t<120?1:(t<200?-1:1),0,t===12||t===148,t>=12&&t<33||t>=148&&t<155);
 run(a,280,input);run(b,280,input);
 assert.equal(a.player.x,b.player.x);assert.equal(a.player.y,b.player.y);
 assert.equal(a.ball.x,b.ball.x);
});
test('side: short tap and held jump produce different trajectories',()=>{
 const a=new SideWorld(),b=new SideWorld();
 run(a,16,t=>i(0,0,t===0,t===0));run(b,16,t=>i(0,0,t===0,true));
 assert.ok(b.player.y<a.player.y-15,`${b.player.y} should be above ${a.player.y}`);
});
test('side: coyote jump works just after leaving a ledge',()=>{
 const a=new SideWorld();a.player.x=866;a.player.y=565;a.player.vx=230;a.grounded=true;
 run(a,5,i(1)); // across the river deck at 875
 a.step(dt,i(1,0,true,true));
 assert.ok(a.player.vy<0,`jump velocity ${a.player.vy}`);
});
test('side: buffered jump triggers when landing within the grace period',()=>{
 const a=new SideWorld();a.player.x=110;a.player.y=511;a.player.vy=365;a.grounded=false;
 a.step(dt,i(0,0,true,true));run(a,11,i(0,0,false,true));
 assert.ok(a.player.vy<0,`jump velocity ${a.player.vy}`);
});
test('side: springpad changes velocity after physical collision',()=>{
 const a=new SideWorld();a.player.x=490;a.player.y=517;a.player.vy=180;a.grounded=false;
 run(a,10,i());assert.ok(a.player.vy<0,`spring should bounce: ${a.player.vy}`);
});
test('side: moving platform has changing geometry',()=>{
 const a=new SideWorld();const before=a.platforms.find(p=>p.id==='moving-1').x;
 run(a,60,i());const after=a.platforms.find(p=>p.id==='moving-1').x;
 assert.notEqual(after,before);
});
test('side: gate responds to ball physical position; not exact-position puzzle',()=>{
 const a=new SideWorld();a.ball.x=2306;a.ball.y=544;
 a.step(dt,i());assert.equal(a.gateOpen,true);
});
test('side: falling off a bridge safely respawns and records attempt',()=>{
 const a=new SideWorld();a.player.x=810;a.player.y=900;a.grounded=false;
 a.step(dt,i());assert.equal(a.stats.attempts,1);assert.equal(a.player.x,82);assert.equal(a.player.y,565);
});
test('top: accelerating and dashing are real movement',()=>{
 const a=new TopWorld();run(a,15,i(1,0));const v=a.player.vx;
 a.step(dt,i(1,0,false,false,true));assert.ok(a.player.vx>v+180);
});
test('top: cannot cross solid garden obstacles',()=>{
 const a=new TopWorld();a.player.x=198;a.player.y=170;
 run(a,50,i(1,0));assert.ok(a.player.x<=215,`collision limit ${a.player.x}`);
});
test('fixed clock: 60Hz produces stable step count across unequal render frames',()=>{
 const a=new FixedClock();let n=0;a.advance(0,()=>n++);
 for(let k=1;k<=60;k++)a.advance(k*1000/60,()=>n++);
 assert.equal(n,60);
});
test('side: a continuous input agent can complete the course using required bounce pads',()=>{
 const w=new SideWorld();let bounces=0;
 for(let t=0;t<60*70&&!w.stats.finished;t++){
  const x=w.player.x;
  const closePad=[448,1680].some(p=>Math.abs(x-p)<35);
  const edge=[[640,734],[1260,1420],[1810,1940],[2580,2735]].some(([a,b])=>x>a&&x<b);
  const jump=w.grounded&&(closePad||edge)&&t%12===0;
  w.step(dt,i(1,0,jump,true,false,x>2400&&x<2510));
  bounces+=w.events.filter(e=>e.type==='bounce').length;
 }
 assert.equal(w.stats.finished,true,`ended at ${w.player.x}`);
 assert.ok(bounces>=2,`expected both required trampoline bounces, got ${bounces}`);
 assert.ok(w.stats.attempts<10,'checkpoints should make retries manageable');
});
test('top: a continuous input agent can traverse the world and finish',()=>{
 const w=new TopWorld();let k=0;const pts=[[420,300],[735,285],[785,655],[1015,610],[1280,520],[1590,340],[1850,310],[2075,490]];
 for(let t=0;t<60*60&&!w.stats.finished;t++){
  const [tx,ty]=pts[k],dx=tx-w.player.x,dy=ty-w.player.y,dist=Math.hypot(dx,dy);
  if(dist<32&&k<pts.length-1)k++;
  w.step(dt,i(dx/(dist||1),dy/(dist||1),false,false,false,true));
 }
 assert.equal(w.stats.finished,true,`ended at ${w.player.x},${w.player.y}`);
});
