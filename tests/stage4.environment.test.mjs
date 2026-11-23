import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SideWorld} from '../web/assets/js/game/physics/SideWorld.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('level backgrounds are a single authored panorama, never infinite repeated tiles',()=>{
 const src=read('src/game/render/ArtAssets.ts');
 assert.ok(src.includes('welcome_playback.webp'));
 assert.ok(src.includes('drawImage(img,sx,0,srcW,srcH,0,0,w,targetH)'));
 assert.ok(!src.includes('%drawW'));
 assert.ok(!src.includes('globalAlpha=mix'));
 assert.ok(statSync(new URL('../web/assets/game/welcome_playback.webp',import.meta.url)).size>50000);
});
test('each decorative creek gap has a collidable rope bridge over the actual physical void',()=>{
 const w=new SideWorld();const ground=w.platforms.filter(p=>p.id.startsWith('ground')).sort((a,b)=>a.x-b.x);
 const gaps=ground.slice(0,-1).map((p,i)=>({start:p.x+p.w,end:ground[i+1].x})).filter(g=>g.end>g.start);
 assert.equal(gaps.length,2);
 for(const gap of gaps){
  const bridge=w.platforms.find(p=>p.id.startsWith('bridge-')&&p.x<=gap.start&&p.x+p.w>=gap.end);
  assert.ok(bridge,`gap ${gap.start}..${gap.end} has no continuous collidable bridge`);
  assert.equal(bridge.y,565);
 }
});
test('approved home is byte-for-byte unchanged from last illustrated release',()=>{
 const original=readFileSync(new URL('../../allyquest-stage3/src/home/homeMarkup.ts',import.meta.url));
 const changed=readFileSync(new URL('../src/home/homeMarkup.ts',import.meta.url));
 assert.equal(createHash('sha256').update(changed).digest('hex'),createHash('sha256').update(original).digest('hex'));
});
test('character poses and trampoline remain identical to approved visual assets',()=>{
 for(const name of ['ethan_00.webp','ethan_01.webp','ethan_02.webp','ethan_03.webp','ethan_04.webp','ethan_05.webp','ethan_06.webp','ethan_07.webp','trampoline.webp']){
  const before=readFileSync(new URL('../../allyquest-stage3/web/assets/game/'+name,import.meta.url));
  const after=readFileSync(new URL('../web/assets/game/'+name,import.meta.url));
  assert.equal(createHash('sha256').update(before).digest('hex'),createHash('sha256').update(after).digest('hex'),name);
 }
});
test('checkpoint flags and illustrated friend are grounded in the same world',()=>{
 const s=read('src/game/render/Renderer.ts'),a=read('src/game/render/ArtAssets.ts');
 assert.ok(s.includes('[1570,2085]'));
 assert.ok(s.includes('this.art.npc(c,npcVisualX,565,t,nearMaya,this.npcScale)')&&s.includes('const npcX=1185'));
 assert.ok(s.includes('this.npcOffset+=(targetOffset-this.npcOffset)'),'Maya stays ground-aligned while visually stepping aside');
 assert.ok(a.includes('maya_00.webp'));
});
