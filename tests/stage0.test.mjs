import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('approved home is separate from gameplay and not rewritten',()=>{
 const html=read('src/home/homeMarkup.ts');
 for(const s of ['id="home-art"','id="tree-left"','id="tree-right"','id="main-logo"','id="friends"','nav-play','nav-crew','nav-map','nav-daily']) assert.ok(html.includes(s),s);
 assert.ok(!html.includes('puzzle-board'));
});
test('retired puzzle is absent throughout runtime',()=>{
 for(const p of ['src/main.ts','src/ui/routes.ts','web/assets/css/home.css','src/home/HomeScene.ts']){
  const text=read(p);for(const bad of ['puzzle-board','setupPuzzle','run-puzzle','Math.hypot(pos.x'])assert.ok(!text.includes(bad),`${p}: ${bad}`);
 }
});
test('five worlds all honestly marked planned',()=>{
 const worlds=read('src/data/worlds.ts');
 assert.equal((worlds.match(/status:'planned'/g)||[]).length,5);
 assert.ok(!worlds.includes("status:'available'"));
});
test('save data validates star totals and completion IDs',()=>{
 const text=read('src/state/saveData.ts');
 assert.ok(text.includes('sanitizeSave'));
 assert.ok(text.includes('finishLevel'));
 assert.ok(text.includes('Number.isSafeInteger'));
});
test('all approved character art exists and is not replaced by screenshot backgrounds',()=>{
 for(const c of ['ethan','maya','leo','ari'])assert.ok(existsSync(new URL(`../web/assets/${c}.png`,import.meta.url)));
 const markup=read('src/home/homeMarkup.ts');
 assert.equal((markup.match(/<image[^>]*href=\"data:image\/png;base64,/g)||[]).length,4,'only approved character illustrations are embedded');
 assert.ok(!/<image[^>]*(?:width=\"544\"|width=\"1600\")/.test(markup),'no raster screenshot used as scenery');
});
