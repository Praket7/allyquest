from pathlib import Path
from playwright.sync_api import sync_playwright
import json,statistics,hashlib
P=Path(__file__).resolve().parent;ROOT=P.parent;Q=P/'qa';Q.mkdir(exist_ok=True);R=[];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=__import__('os').environ.get('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':800},accept_downloads=True);p.on('pageerror',lambda e:errors.append(str(e)))
 def ok(s):R.append(s);print('PASS',s,flush=True)
 def boot(page,name):
  page.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){const m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;}''');page.set_content((ROOT/name).read_text(),wait_until='load')
 p.set_content((ROOT/'Ally_Quest_Content_Studio.html').read_text());assert 'STRUCTURE VALID' in p.locator('#status').inner_text();ok('Content Studio opens in browser and validates original pack')
 p.locator('#itemPick').select_option(label='Review desk');x=float(p.locator('#x').input_value());p.locator('#x').fill(str(x+5));p.locator('#applyPosition').click();r=json.loads(p.locator('#json').input_value());assert r['shelves'][0]['x']==x+5;assert 'STRUCTURE VALID' in p.locator('#status').inner_text();ok('Furniture edit updates data and remains structurally valid');p.locator('#undo').click();assert json.loads(p.locator('#json').input_value())['shelves'][0]['x']==x;ok('Undo restores original layout')
 p.locator('#levelMode').click();p.locator('#pick').select_option('party');p.locator('#clone').click();assert '6 maps' in p.locator('#count').inner_text();assert 'STRUCTURE VALID' in p.locator('#status').inner_text();ok('Exterior duplication creates validated sixth adventure');p.locator('#newKind').select_option('platforms');p.locator('#add').click();assert len(json.loads(p.locator('#json').input_value())['platforms'])==5;ok('Visual editor adds a platform')
 p.locator('#reset').click();p.locator('#roomMode').click();p.locator('#pick').select_option('station1');p.locator('#steps li').first.click();p.locator('#instruction').fill('Ask Chef Marco about the practice plan.');p.locator('#applyStep').click();assert 'Ask Chef Marco about the practice plan.' in p.locator('#steps li').first.inner_text();ok('Quest instruction edited in UI')
 with p.expect_download() as event:p.locator('#export').click()
 event.value.save_as(Q/'editor-export.json');assert json.loads((Q/'editor-export.json').read_text())['rooms']['station1']['steps'][0]['txt']=='Ask Chef Marco about the practice plan.';ok('Editor exports edited JSON through browser download');p.locator('#reset').click();p.screenshot(path=str(Q/'content-studio.png'))
 # Run normal production via actual local file navigation. QA used only for read-only comparisons on main.
 pg=b.new_page(viewport={'width':1280,'height':720});pg.on('pageerror',lambda e:errors.append(str(e)));boot(pg,'Ally_Quest_Stage155.html');assert pg.evaluate('ALLY_CONTENT_QA.summary()')=={'version':1,'levels':5,'rooms':11,'steps':113};diffs=pg.evaluate('ALLY_CONTENT_QA.compare()');assert all(x['equal'] or (x['id']=='station1' and len(x['diffs'])==1 and x['diffs'][0]['path']=='station1.steps.2.to') for x in diffs),diffs;ok('Legacy and data-driven plans match, except JSON null representation of unused use destination')
 pg.locator('#home-play').click();pg.wait_for_timeout(500);pg.keyboard.down('ArrowRight');pg.wait_for_timeout(550);pg.keyboard.up('ArrowRight');assert pg.evaluate('ALLY_DEBUG.getState().x')>100;ok('Main game exact HTML boot and input')
 demo=b.new_page(viewport={'width':1280,'height':720});demo.on('pageerror',lambda e:errors.append(str(e)));boot(demo,'Ally_Quest_Stage16_Demo.html');assert demo.evaluate('ALLY_CONTENT_QA.summary().levels')==6;demo.locator('#home-map').click();demo.wait_for_timeout(300);card=demo.locator('.map-card').filter(has_text='The Reunion Workshop');print('DEMO CARD',card.inner_text(),flush=True);card.locator('button').first.click();demo.wait_for_timeout(400);assert demo.evaluate('ALLY_DEBUG.getState().level')==5;ok('New data-only adventure selected using normal map UI')
 # Input only; no forced positions or objectives for the new adventure.
 def walk(target,tol=18):
  import time
  t=time.monotonic();held=None
  try:
   while time.monotonic()-t<14:
    x=demo.evaluate('ALLY_DEBUG.getState().x');d=target-x
    if abs(d)<=tol:return
    k='ArrowRight' if d>0 else 'ArrowLeft'
    if held!=k:
     if held:demo.keyboard.up(held)
     demo.keyboard.down(k);held=k
    demo.wait_for_timeout(30)
   raise AssertionError(('walk timeout',target,demo.evaluate('ALLY_DEBUG.getState()')))
  finally:
   if held:demo.keyboard.up(held)
 walk(265);demo.keyboard.press('KeyE');demo.wait_for_timeout(250)
 # Dialogue uses existing comic controls (same driver as campaign).
 for _ in range(9):
  if not demo.evaluate('ALLY_DEBUG.getState().dialog'):break
  demo.locator('#comic-actions button').first.click()
  demo.wait_for_timeout(120)
 assert demo.evaluate('ALLY_DEBUG.getWorld().state.done.has("leo")'),demo.evaluate('ALLY_DEBUG.getState()');walk(845);demo.keyboard.press('KeyE');demo.wait_for_timeout(750)
 if not demo.evaluate('!!ALLY_ROOM_QA.state()'):
  pt=demo.evaluate('ALLY_ROOM_QA.door("station3")');demo.mouse.click(pt['x'],pt['y']);demo.wait_for_timeout(750)
 assert demo.evaluate('ALLY_ROOM_QA.state()?.task')=='station3';ok('New adventure door enters original activity template')
 demo.screenshot(path=str(Q/'demo-room.png'))
 def click(i):
  pt=demo.evaluate('i=>ALLY_ROOM_QA.point(i)',i);assert pt,i;demo.mouse.click(pt['x'],pt['y']);demo.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');demo.wait_for_timeout(90)
 while (r:=demo.evaluate('ALLY_ROOM_QA.state()'))['step']<r['total']:
  s=r['goal'];old=r['step'];
  if s['kind']=='move':click(s['id']);assert demo.evaluate('ALLY_ROOM_QA.state().carry')==s['id'];click(s['to'])
  elif s['kind']=='incident':click('case-observe');click('case-alternative');click('adult')
  else:click(s['id'])
  assert demo.evaluate('ALLY_ROOM_QA.state().step')==old+1,(s,demo.evaluate('ALLY_ROOM_QA.state()'))
 assert demo.evaluate('ALLY_ROOM_QA.incident().resolved');demo.locator('#aq-room-exit').click();demo.wait_for_function('()=>!ALLY_ROOM_QA.state()');demo.wait_for_timeout(500);assert demo.evaluate('ALLY_DEBUG.getWorld().state.done.has("station3")');walk(1765);demo.wait_for_timeout(500)
 if not demo.locator('[data-end-next]').is_visible():demo.keyboard.press('KeyE');demo.wait_for_timeout(250)
 assert demo.locator('[data-end-next]').is_visible();demo.screenshot(path=str(Q/'demo-finish.png'));ok('Data-only adventure completed using normal inputs, including adult-reviewed incident and checkpoint')
 assert not errors,errors;b.close()
(Q/'stage16-results.json').write_text(json.dumps({'passed':R,'errors':errors},indent=2));print(json.dumps({'passed':R,'errors':errors}))
