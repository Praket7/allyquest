from pathlib import Path
from playwright.sync_api import sync_playwright
import os,json,hashlib
P=Path(__file__).resolve().parent;H=Path(os.getenv('AQ_STAGE19_HTML',str(P.parent/'Ally_Quest_300.html')));Q=P/'qa-stage19-journey';Q.mkdir(exist_ok=True);passed=[];errors=[]
init='''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true}));}'''
def ok(s):passed.append(s);print('PASS',s,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720});p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(15000);p.evaluate(init);p.set_content(H.read_text(),wait_until='load',timeout=60000)
 p.locator('#home-map').click();assert p.evaluate('ALLY_JOURNEY_QA.art()');assert p.locator('.aqj-landscape').count()==1;assert p.locator('[data-world19]').count()==12;assert p.locator('.aq19-stop[data-locked=true]').count()==11;p.screenshot(path=str(Q/'journey-desktop.png'));ok('Generated panorama and twelve live world markers; only first world open')
 assert p.evaluate('ALLY_JOURNEY_QA.earned()')==1
 p.locator('[data-world-index="1"]').click();assert p.locator('.map-play:disabled').count()==5;p.screenshot(path=str(Q/'locked-school.png'));p.evaluate('ALLY_JOURNEY_QA.normalStart(25)');assert p.evaluate('ALLY_DEBUG.getState().mode')=='map';p.locator('#aq19-back-worlds').click();ok('Locked world preview and direct normal start both enforce completion')
 p.locator('[data-world-index="0"]').click();assert p.locator('.map-play:enabled').count()==1;p.screenshot(path=str(Q/'welcome-adventures.png'));p.locator('#aq19-back-worlds').click()
 for w,h in [(320,568),(390,844),(844,390),(1280,720)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(120);assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');route=p.locator('.aq19-scenic-route');assert route.evaluate('e=>e.clientHeight>0&&e.clientWidth>0');route.evaluate('e=>{e.scrollLeft=e.scrollWidth;e.scrollTop=e.scrollHeight}');p.screenshot(path=str(Q/f'journey-{w}x{h}.png'));p.locator('#cin-destinations').click();p.locator('[data-rail-world="11"]').click();assert p.locator('.map-play:disabled').count()==5;assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');p.screenshot(path=str(Q/f'locked-adventure-{w}x{h}.png'));p.locator('#aq19-back-worlds').click()
 ok('Scrollable panorama, rail and adventure list work at four viewport sizes')
 p.set_viewport_size({'width':1280,'height':720});p.evaluate('ALLY_JOURNEY_QA.seedBoundary(24)');p.evaluate('ALLY_DEBUG.startLevel(24)');assert not p.evaluate('ALLY_JOURNEY_QA.open(1)');p.evaluate('ALLY_DEBUG.forceCompleteTasks()');p.evaluate('ALLY_JOURNEY_QA.finish()');assert p.evaluate('ALLY_JOURNEY_QA.open(1)');assert not p.evaluate('ALLY_JOURNEY_QA.open(2)');p.locator('[data-end-next]').click();p.wait_for_function('()=>document.querySelector("#aqj-unlock")?.open');p.wait_for_timeout(850);p.screenshot(path=str(Q/'maplewood-unlock.png'));assert p.locator('#aqj-unlock .aqj-spark').count()==32;p.locator('#aqj-unlock button').click();assert not p.locator('#aqj-unlock').count();assert p.evaluate('ALLY_JOURNEY_QA.seen()')==1;assert p.locator('.map-play:enabled').count()==1;p.screenshot(path=str(Q/'maplewood-open.png'));ok('Final Welcome Street adventure earns only Maplewood and plays one-time celebration')
 p.locator('#aq19-back-worlds').click();p.locator('[data-world-index="1"]').click();assert not p.locator('#aqj-unlock').count();ok('Revisiting an earned world does not replay animation')
 p.emulate_media(reduced_motion='reduce');p.evaluate('ALLY_JOURNEY_QA.seedBoundary(49)');p.evaluate('ALLY_DEBUG.startLevel(49)');p.evaluate('ALLY_DEBUG.forceCompleteTasks()');p.evaluate('ALLY_JOURNEY_QA.finish()');p.locator('[data-end-next]').click();assert p.locator('#aqj-unlock').is_visible();assert p.locator('#aqj-unlock .aqj-spark').count()==0;p.screenshot(path=str(Q/'riverside-unlock-reduced.png'));p.keyboard.press('Escape');assert not p.locator('#aqj-unlock').count();assert p.evaluate('ALLY_JOURNEY_QA.seen()')==2;ok('Distinct next-world celebration supports reduced motion and Escape')
 # Strict progression: completing an isolated finale cannot skip an unfinished adventure.
 p.emulate_media(reduced_motion='no-preference');p.evaluate('ALLY_JOURNEY_QA.seedBoundary(23)');p.evaluate('ALLY_DEBUG.startLevel(24)');p.evaluate('ALLY_DEBUG.forceCompleteTasks()');p.evaluate('ALLY_JOURNEY_QA.finish()');assert not p.evaluate('ALLY_JOURNEY_QA.open(1)');p.locator('[data-end-next]').click();assert p.locator('.map-play:disabled').count()==5;assert not p.locator('#aqj-unlock').count();assert p.locator('.aqj-lock-note').is_visible();ok('Out-of-order finale does not grant the next world')
 p.locator('#aq19-back-worlds').click();p.locator('#aqj-view-toggle').click();assert p.locator('.aqj-overview').count()==1;assert p.locator('.aqj-landscape').evaluate('e=>e.offsetHeight<=e.parentElement.clientHeight+2');p.screenshot(path=str(Q/'journey-overview.png'));p.locator('#aqj-view-toggle').click();assert not p.locator('.aqj-overview').count();ok('Overview fits the entire map and returns to scrollable exploration')
 # Exercise all eleven one-time unlocks. Only the prior completion prefix is
 # seeded; the explicit QA finish hook isolates the animation/progression gate.
 patterns=['fan','drift','burst','bounce','orbit','wave','trail','leaves','rising','fireworks','finale']
 for i,pattern in enumerate(patterns,1):
  p.evaluate('n=>ALLY_JOURNEY_QA.seedBoundary(n)',i*25-1);p.evaluate('n=>ALLY_DEBUG.startLevel(n)',i*25-1)
  assert not p.evaluate('n=>ALLY_JOURNEY_QA.open(n)',i)
  p.evaluate('ALLY_DEBUG.forceCompleteTasks()');p.evaluate('ALLY_JOURNEY_QA.finish()')
  assert p.evaluate('n=>ALLY_JOURNEY_QA.open(n)',i)
  if i<11:assert not p.evaluate('n=>ALLY_JOURNEY_QA.open(n)',i+1)
  p.locator('[data-end-next]').click();d=p.locator('#aqj-unlock');assert d.is_visible()
  assert d.locator('.aqj-celebration').get_attribute('data-pattern')==pattern
  assert d.locator('.aqj-medal').evaluate('e=>getComputedStyle(e).animationName')=='aqj-'+pattern
  assert d.locator('.aqj-spark').count()==32
  p.wait_for_timeout(800);p.screenshot(path=str(Q/f'unlock-{i+1:02}-{pattern}.png'))
  d.locator('button').click();assert not d.count();assert p.evaluate('ALLY_JOURNEY_QA.seen()')==i
  assert p.locator('.map-play:enabled').count()==1
 ok('All eleven unlock sequences use distinct motion, and never grant the following world')
 assert not errors,errors;b.close()
(Q/'results.json').write_text(json.dumps({'sha256':hashlib.sha256(H.read_bytes()).hexdigest(),'passed':passed,'errors':errors},indent=2));print(passed)
