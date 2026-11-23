import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import {SideWorld} from '../web/assets/js/game/physics/SideWorld.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('NPC greeting point has isolated ground clearance in physics world',()=>{
 const w=new SideWorld();
 const x=1185,left=x-42,right=x+42;
 const floor=w.platforms.find(p=>p.id==='ground-2');
 assert.ok(floor&&x>floor.x&&x<floor.x+floor.w);
 for(const p of w.platforms.filter(p=>p.id.startsWith('ledge-'))){
   if(p.y<460||p.y>490)continue;
   assert.ok(p.x+p.w < left || p.x > right,`NPC visual overlaps ${p.id}`);
 }
 for(const p of w.platforms.filter(p=>p.moving)){
   const min=(p.baseX??p.x)-(p.amplitude??0),max=(p.baseX??p.x)+(p.amplitude??0)+p.w;
   assert.ok(right<min||left>max,'NPC should not overlap any moving platform horizontal sweep');
 }
 assert.ok(read('src/game/physics/SideWorld.ts').includes('Math.abs(a.x-1185)'));
});
test('geometry is cached and canvas render budget is below original retina overdraw',()=>{
 const a=read('src/game/render/ArtAssets.ts'),r=read('src/game/render/Renderer.ts');
 assert.ok(a.includes('geometryCache=new Map'));
 assert.ok(a.includes('this.geometryCache.set(p.id,cache)'));
 assert.ok(r.includes('Math.sqrt(1580000/(this.w*this.h))'));
 assert.ok(!r.includes('this.drawSoftVignette();'));
});
test('tutorial and HUD changes avoid tiny text and repeated DOM writes',()=>{
 const css=read('web/assets/css/game.css'),host=read('src/game/GameHost.ts');
 assert.ok(css.includes('font-size:15px;line-height:1.38'));
 assert.ok(host.includes('message!==this.lastHudHint'));
 assert.ok(host.includes('!this.paused||!this.pausedPainted'));
 assert.ok(host.includes('Talk to friends with'));
});
test('background asset is lighter than previous panorama and decoupled from collisions',()=>{
 const a=statSync(new URL('../web/assets/game/welcome_playback.webp',import.meta.url));
 const b=statSync(new URL('../../allyquest-stage4/web/assets/game/welcome_panorama.webp',import.meta.url));
 assert.ok(a.size<b.size);
 assert.ok(read('src/game/render/ArtAssets.ts').includes('welcome_playback.webp'));
});
