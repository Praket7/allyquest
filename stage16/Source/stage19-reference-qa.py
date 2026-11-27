from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,hashlib
P=Path(__file__).resolve().parent;H=Path(os.getenv('AQ_STAGE19_HTML',str(P.parent/'Ally_Quest_300.html')));Q=P/'qa-stage19-reference';Q.mkdir(exist_ok=True)
s=H.read_text();pack=json.JSONDecoder().raw_decode(s.split('const compiledPack=',1)[1])[0];errors=[];passed=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1440,'height':810},reduced_motion='reduce');p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(12000)
 p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map;Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:true}));}''');p.set_content(s,wait_until='load',timeout=60000);p.wait_for_timeout(500)
 def shot(name):
  p.wait_for_timeout(150);p.screenshot(path=str(Q/(name+'.png')),timeout=15000);print('CAPTURE',name,flush=True)
 assert p.locator('#home-stage').bounding_box()['width']==1440;assert p.locator('#home-stage').bounding_box()['height']==810;shot('01-title');passed.append('Full-bleed title and original menu controls')
 p.locator('#home-map').click();p.wait_for_timeout(250);assert p.locator('.aq19-stop').count()==12;shot('02-world-map')
 p.locator('.aq19-stop').first.click();assert p.locator('.aqj-book .map-play:enabled').count()==1;shot('03-adventures');p.locator('#aq19-back-worlds').click();p.locator('.aq19-stop').nth(2).click();assert p.locator('.map-play:disabled').count()==5;shot('04-locked-market');passed.append('12 world pins and strict locked adventure states preserved')
 p.locator('#aq19-back-worlds').click()
 for w,h in [(320,568),(390,844),(844,390),(1440,810)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(140);assert p.locator('#map-cards').bounding_box()['width']<=w+1;assert p.locator('#map-back').is_visible();shot(f'05-map-{w}x{h}')
 passed.append('Four map viewport profiles')
 def enter(rid):
  idx=next(i for i,l in enumerate(pack['levels']) if l['id']==rid)
  p.evaluate('n=>ALLY_DEBUG.startLevel(n)',idx);p.wait_for_timeout(350)
  p.evaluate('''id=>{const w=ALLY_DEBUG.getWorld(),t=w.tasks.find(t=>t.id===id);for(const q of w.tasks)if(q.x<t.x)w.state.done.add(q.id);ALLY_DEBUG.forcePosition(t.x-40,567);ALLY_DEBUG.frame(0)}''',rid);p.wait_for_timeout(260);d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',rid);p.mouse.click(d['x'],d['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.graph()');p.wait_for_timeout(250)
 def act(o):
  p.locator('#aq17-objects').click();p.locator(f'[data-aq17-object="{o}"]').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');p.wait_for_timeout(130)
 def inspect(rid,prefix):
  enter(rid);act('adult');act('label');assert p.locator('#aq-label-detective').is_visible();p.wait_for_function('()=>document.querySelector(".aqd-stage")?.dataset.cinReady==="true"');shot(prefix+'-front');p.locator('[data-side=back]').click();p.wait_for_function('()=>document.querySelector(".aqd-stage")?.dataset.cinReady==="true"');shot(prefix+'-ingredients');assert p.locator('.cin-food-art').count()==1;assert p.locator('[data-clue]').count()>0
  p.locator('[data-cin-receipt]').click();assert p.locator('.aqd-receipt').is_visible();shot(prefix+'-receipt');p.locator('[data-cin-receipt]').click()
  for w,h in [(320,568),(390,844),(844,390),(1440,810)]:
   p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(150);box=p.locator('#aq-label-detective').bounding_box();foot=p.locator('#aqd-next').bounding_box();assert box['width']<=w+1 and box['height']<=h+1,(w,h,box);assert foot['y']>=0 and foot['y']+foot['height']<=h+1,(w,h,foot);p.locator('[data-side=front]').click();p.locator('[data-side=back]').click();shot(prefix+f'-{w}x{h}')
  before=p.evaluate('ALLY_ROOM_QA.graph().node');p.keyboard.press('Escape');assert not p.locator('#aq-label-detective').is_visible();assert p.evaluate('ALLY_ROOM_QA.graph().node')==before;passed.append(rid+' source-backed inspection and cancellation; four sizes');act('label');p.locator('[data-side=back]').click();c=p.evaluate('ALLY_ROOM_QA.labelCase()');before=p.evaluate('ALLY_ROOM_QA.graph().node')
  for i,x in enumerate(c['products']):
   if i:p.locator('[data-receipt='+x['id']+']').click();p.locator('[data-side=back]').click()
   for clue in x['clues']:p.locator('[data-clue='+clue+']').click()
   p.locator('[data-answer='+x['expected']+']').click();assert x['id'] in p.evaluate('ALLY_ROOM_QA.labelCase().filed');assert p.evaluate('ALLY_ROOM_QA.graph().node')==before
  p.locator('#aqd-next').click();p.locator('#aqd-submit').click();assert not p.locator('#aq-label-detective').is_visible();assert p.evaluate('ALLY_ROOM_QA.graph().node')!=before;passed.append(rid+' full ingredient evidence route')
  p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(350)
 inspect('recipe-revision','06-snack');inspect('bakery-order','07-recipe')
 p.evaluate('ALLY_JOURNEY_QA.seedBoundary(0)');p.evaluate('ALLY_DEBUG.startLevel(0)');p.wait_for_timeout(250);p.evaluate('ALLY_DEBUG.forceCompleteTasks()');p.evaluate('ALLY_JOURNEY_QA.finish()');assert p.locator('.cin-end-copy').is_visible();assert p.locator('.end-stars span').count()==3;shot('08-completion');passed.append('Completion uses actual earned stars and live progression buttons');print('CLICK MAP',flush=True);p.locator('[data-end-map]').click(timeout=10000);print('MAP CLICKED',flush=True);assert p.locator('#map').is_visible();passed.append('Completion Map button restores navigation')
 assert not errors,errors;print('ALL ASSERTIONS PASSED',flush=True);(Q/'results.json').write_text(json.dumps({'passed':passed,'errors':errors,'sha256':hashlib.sha256(H.read_bytes()).hexdigest()},indent=2));b.close()
(Q/'results.json').write_text(json.dumps({'passed':passed,'errors':errors,'sha256':hashlib.sha256(H.read_bytes()).hexdigest()},indent=2));print(json.dumps(passed,indent=2))
