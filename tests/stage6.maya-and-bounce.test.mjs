import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {SideWorld} from '../web/assets/js/game/physics/SideWorld.js';
const dt=1/60;
const input=(x=1,jump=false,held=true)=>({x,y:0,jump,jumpHeld:held,interact:false,dash:false});
test('trampoline rims are solid against running underneath',()=>{
 const w=new SideWorld();
 for(let k=0;k<150;k++)w.step(dt,input());
 assert.ok(w.player.x<=w.springs[0].x-16+.5,`crossed the trampoline frame ${w.player.x}`);
 assert.equal(w.stats.finished,false);
});
test('ordinary jumps cannot skip the bounce-only garden pillars',()=>{
 const w=new SideWorld();w.springs.length=0;
 w.player.x=450;w.player.y=565;w.grounded=true;
 for(let k=0;k<360;k++)w.step(dt,input(1,k%48===0,true));
 assert.ok(w.player.x<w.bounceWalls[0].x,`crossed solid high pillar ${w.player.x}`);
});
test('bounce from above is physically required and gives greater height',()=>{
 const w=new SideWorld();w.player.x=491;w.player.y=517;w.player.vy=160;w.grounded=false;
 let bounces=0,best=565;
 for(let k=0;k<85;k++){w.step(dt,input(0,false,true));best=Math.min(best,w.player.y);if(w.events.some(e=>e.type==='bounce'))bounces++;}
 assert.ok(bounces>0,'mat must fire a bounce event');
 assert.ok(best<w.bounceWalls[0].y-15,`bounce cannot clear pillar: peak feet ${best}`);
});
test('Maya has eight identical-size transparent sprite cells and no fake lower limbs',()=>{
 const a=readFileSync(new URL('../src/game/render/ArtAssets.ts',import.meta.url),'utf8');
 for(let k=0;k<8;k++){
  const st=statSync(new URL(`../web/assets/game/maya_${String(k).padStart(2,'0')}.webp`,import.meta.url));
  assert.ok(st.size>4000&&st.size<40000,`Maya frame ${k} not optimized`);
 }
 assert.ok(a.includes('const size=143'));
 assert.ok(!a.includes("c.strokeStyle='#394a76'"),'no improvised lower-body art');
});
test('checkpoint markers remain low and well separated from Maya',()=>{
 const render=readFileSync(new URL('../src/game/render/Renderer.ts',import.meta.url),'utf8');
 const world=readFileSync(new URL('../src/game/physics/SideWorld.ts',import.meta.url),'utf8');
 assert.ok(render.includes('for(const x of [1570,2085])'));
 assert.ok(!render.includes('[1080,2025]'));
 assert.ok(world.includes('a.x>1580')&&world.includes('a.x>2085'));
 assert.ok(1570-1185>250);
});
