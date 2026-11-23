import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const renderer=read('src/game/render/Renderer.ts');
const art=read('src/game/render/ArtAssets.ts');
const css=read('web/assets/css/game.css');
test('locked first-world obstacle geometry remains byte for byte identical to Stage 6',()=>{
 const digest=createHash('sha256').update(readFileSync(new URL('../src/game/physics/SideWorld.ts',import.meta.url))).digest('hex');
 assert.equal(digest,'6038032343da39165544fa658b159b709c1fb33ad01fad66e521d33914d5b2ea');
});
test('redundant MOVE and JUMP signs are no longer painted over the play lane',()=>{
 assert.ok(!renderer.includes("this.drawGuideSign(145,544"));
 assert.ok(!renderer.includes("this.drawGuideSign(405,544"));
});
test('fixed ledges have compact supports and moving decks no longer draw full-height gantry posts',()=>{
 assert.ok(art.includes('Short stone wall-brackets'));
 assert.ok(art.includes('Earlier full-height gantry POSTS crossed'));
 assert.ok(!art.includes('supportH=565-y-16'));
 assert.ok(!art.includes('565-beamY'));
});
test('NPC gives player personal space without modifying interaction physics',()=>{
 assert.ok(renderer.includes('const targetOffset=this.npcAvoidSide*105*proximity'));
 assert.ok(renderer.includes('this.art.npc(c,npcVisualX,565,t,nearMaya,this.npcScale)'));
 assert.ok(renderer.includes('for(const x of [1570,2085])'));
});
test('mobile hint is pushed below the top HUD and has controlled width',()=>{
 assert.match(css,/max-width:calc\(100vw - 24px\)/);
 assert.match(css,/top:max\(112px,calc\(env\(safe-area-inset-top\) \+ 104px\)\)/);
});
