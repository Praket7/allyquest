import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('approved side-scroller opens directly and top-down mode is not in the menu',()=>{
 const text=read('src/ui/routes.ts');
 assert.ok(text.includes("host.launch('side')"));
 assert.ok(!text.includes('data-test-mode="top"'));
 assert.ok(!text.includes('Explore from above'));
});
test('2.5D rendering is independent of collidable simulation',()=>{
 const painter=read('src/game/render/WelcomePainter.ts');
 const physics=read('src/game/physics/SideWorld.ts');
 assert.ok(painter.includes('worldBehind')&&painter.includes('building(')&&painter.includes('tree('));
 assert.ok(painter.includes('CanvasGradient'));
 assert.ok(!painter.includes('data:image')&&!painter.includes('drawImage('));
 assert.ok(!physics.includes('CanvasRenderingContext2D'));
 assert.ok(physics.includes('resolveHorizontal')&&physics.includes('updateBall'));
});
test('four touch controls have actual side-scroller meanings',()=>{
 const css=read('web/assets/css/game.css');
 const host=read('src/game/GameHost.ts');
 assert.ok(css.includes('data-mode="side"'));
 assert.ok(css.includes('.aq-tb-middle')&&css.includes('.aq-dash'));
 assert.ok(host.includes('aq-jump')&&host.includes('data-control="left"'));
});
test('reference art is separate from game assets and shipped as non-runtime resources',()=>{
 for(const file of ['01_welcome_street_main.png','02_architecture_and_depth.png','03_character_animation_direction.png','05_level_complete_ui.png'])
 assert.ok(existsSync(new URL('../docs/art/references/'+file,import.meta.url)),file);
 assert.ok(!read('src/game/render/WelcomePainter.ts').includes('/references/'));
});
