import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {WelcomeQuest,QuestStore,QUEST_STORAGE_KEY,sanitizeQuest} from '../web/assets/js/game/story/WelcomeQuest.js';
import {MAYA_FIRST_DIALOGUE} from '../web/assets/js/game/story/ComicBubble.js';
const read=rel=>readFileSync(new URL(`../${rel}`,import.meta.url),'utf8');
const store=()=>{const storage=new Map();return {storage:{getItem:(k)=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},map:storage}};

test('fresh quest is a child-private, bounded and valid save',()=>{
 assert.deepEqual(sanitizeQuest({version:3,checkpoint:9999,secrets:['bad']}),sanitizeQuest(null));
 assert.deepEqual(sanitizeQuest({version:1,checkpoint:1000,secrets:['bridge-ribbon','bad'],bannerFound:true}),{version:1,metMaya:false,crossedCreek:false,bannerFound:true,checkpoint:0,secrets:['bridge-ribbon'],completed:false});
});
test('quest persists stage, checkpoints, discoveries and banner across sessions',()=>{
 const {storage,map}=store(),quest=new WelcomeQuest(new QuestStore(storage));
 assert.equal(quest.objective,'talk-to-maya');quest.meetMaya();assert.equal(quest.objective,'follow-clues');
 quest.updateCheckpoint(1590);quest.observe(1550,430);assert.equal(quest.secretsFound,1);
 quest.observe(2000,565);assert.equal(quest.objective,'find-banner');
 quest.updateCheckpoint(2095);quest.observe(2370,488);assert.equal(quest.secretsFound,2);
 quest.observe(2922,565);assert.equal(quest.objective,'deliver-banner');
 const restored=new WelcomeQuest(new QuestStore(storage));assert.equal(restored.objective,'deliver-banner');
 assert.equal(restored.snapshot.checkpoint,2095);assert.deepEqual(restored.snapshot.secrets,['garden-kite','bridge-ribbon']);
 assert.ok(map.has(QUEST_STORAGE_KEY));
 restored.finish();assert.equal(restored.objective,'celebrate');
 assert.equal(new WelcomeQuest(new QuestStore(storage)).objective,'talk-to-maya','completed run resets for replay');
});
test('secret and banner pickups are idempotent',()=>{
 const q=new WelcomeQuest(new QuestStore(store().storage));q.observe(1515,430);q.observe(1515,430);q.observe(2918,550);q.observe(2918,550);
 assert.equal(q.drainEvents().filter(x=>x.type==='secret').length,1);
 assert.equal(q.snapshot.secrets.length,1);assert.equal(q.snapshot.bannerFound,true);
});
test('comic dialogues have meaningful player choice and no manual health claims',()=>{
 assert.ok(MAYA_FIRST_DIALOGUE.length>=3);
 const choice=MAYA_FIRST_DIALOGUE.find(v=>v.choices);assert.equal(choice.choices.length,2);
 assert.ok(MAYA_FIRST_DIALOGUE.some(x=>/trusted adult/i.test(x.text)) || choice.choices.some(x=>/trusted adult/i.test(x.response)));
});
test('Maya E TALK text is not painted in Canvas or sent to the top instruction strip',()=>{
 const painter=read('src/game/render/Renderer.ts');const host=read('src/game/GameHost.ts');
 assert.ok(!painter.includes('if(nearMaya)this.drawNpcMarker'));
 assert.ok(host.includes('new ComicBubble(root)'));
 assert.ok(host.includes('this.comic.start'));
 assert.ok(!host.includes("this.flash('Maya:"));
});
test('obstacle geometry is byte-for-byte locked, including trampoline walls and platforms',()=>{
 const digest=createHash('sha256').update(readFileSync(new URL('../src/game/physics/SideWorld.ts',import.meta.url))).digest('hex');
 assert.equal(digest,'6038032343da39165544fa658b159b709c1fb33ad01fad66e521d33914d5b2ea');
});
test('approved home markup, CSS and illustrations are not modified',()=>{
 const approved={
  'src/home/homeMarkup.ts':'e249e35e78ad9e7563215283115a67c20a06e0b66a99f6cbfb0a6448da8c19c0',
  'src/home/HomeScene.ts':'7e442febaaf6ac70ae0599c2e3e58f3e05a0595913ffb574953415b7070fa39a',
  'web/assets/css/home.css':'454b7d98a0a59a9cd2d795db9052d318c8a1fccd792860f897f37f80a8408bf0'
 };
 for(const [path,expected] of Object.entries(approved)){
  const bytes=readFileSync(new URL(`../${path}`,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),expected,`approved ${path} changed`);
 }
});
