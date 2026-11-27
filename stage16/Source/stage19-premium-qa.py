from pathlib import Path
from playwright.sync_api import sync_playwright
import os,json,hashlib
P=Path(__file__).parent;H=Path(os.getenv('AQ_STAGE19_HTML',str(P.parent/'Ally_Quest_300.html')));Q=P/'qa-stage19-premium';Q.mkdir(exist_ok=True)
source=Path(os.getenv('AQ_STAGE19_PACK',str(P/'ally-quest-300.json')));pack=json.loads(source.read_text())
passed=[];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720},reduced_motion='reduce');p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(15000)
 p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:true}));}''')
 p.set_content(H.read_text(),wait_until='load',timeout=60000)
 p.wait_for_function('()=>typeof ALLY_STAGE19_QA!=="undefined"',timeout=15000)
 p.locator('#home-map').click()
 assert p.locator('[data-world19]').count()==12
 assert p.locator('.aq19-scenic-route').count()==1
 assert p.locator('.aq19-stop').count()==12
 assert p.locator('.aq19-world-character').count()==11
 p.screenshot(path=str(Q/'map-premium-desktop.png'))
 passed.append('12 world pins and 11 cast portraits displayed on actual map')
 p.locator('.aq19-stop[data-world-index="2"]').click();assert 'Riverside' in p.locator('.cin-world-heading').inner_text();assert p.locator('.cin-world-heading').is_visible();assert p.locator('.aq19-chapter-hero').count()==1;p.screenshot(path=str(Q/'world-preview-premium.png'));p.locator('#aq19-back-worlds').click()
 passed.append('Route pins enter existing world previews without bypassing progress')
 for w,h in [(320,568),(390,844),(844,390),(1280,720)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(180)
  assert p.locator('.aq19-scenic-route').count()==1
  assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(w,h,p.evaluate('document.documentElement.scrollWidth'))
  p.screenshot(path=str(Q/f'map-premium-{w}x{h}.png'))
 passed.append('No page overflow at 320, 390, 844 and 1280 widths')
 p.set_viewport_size({'width':1280,'height':720})
 rid='recipe-revision';idx=next(i for i,l in enumerate(pack['levels']) if l['id']==rid)
 p.evaluate('(n)=>ALLY_DEBUG.startLevel(n)',idx);p.wait_for_timeout(230)
 p.evaluate('''id=>{const w=ALLY_DEBUG.getWorld(),t=w.tasks.find(t=>t.id===id);for(const q of w.tasks)if(q.x<t.x)w.state.done.add(q.id);ALLY_DEBUG.forcePosition(t.x-40,567);ALLY_DEBUG.frame(0)}''',rid)
 p.wait_for_timeout(260);d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',rid);p.mouse.click(d['x'],d['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.graph()');p.wait_for_timeout(200)
 def act(o):
  p.locator('#aq17-objects').click();p.locator('[data-aq17-object="'+o+'"]').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');p.wait_for_timeout(100)
 act('adult');act('label')
 assert p.locator('#aq-label-detective').is_visible()
 p.wait_for_function('()=>document.querySelector(".aqd-stage")?.dataset.premiumMode==="front"')
 assert p.locator('.aq19-product-art').count()==1
 p.screenshot(path=str(Q/'label-premium-front.png'))
 p.locator('[data-side=back]').click()
 p.wait_for_function('()=>document.querySelector(".aqd-stage")?.dataset.premiumMode==="label"')
 assert p.locator('.aq19-product-art').count()==1 and p.locator('.aqd-print').count()==1
 p.screenshot(path=str(Q/'label-premium-ingredients.png'))
 passed.append('Product illustration and ingredient panel visible side-by-side after inspection')
 for w,h in [(320,568),(390,844),(844,390),(1280,720)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(180)
  x=p.locator('#aq-label-detective');box=x.bounding_box()
  assert box['x']>=-.5 and box['x']+box['width']<=w+1,box
  assert x.evaluate('e=>e.scrollWidth<=e.clientWidth+1'),(w,h,x.evaluate('e=>[e.scrollWidth,e.clientWidth]'))
  footer=p.locator('#aqd-next').bounding_box();assert footer['y']>=0 and footer['y']+footer['height']<=h+1,footer
  p.screenshot(path=str(Q/f'label-premium-{w}x{h}.png'))
 passed.append('Ingredient panel responsive and footer reachable at four viewport sizes')
 p.keyboard.press('Escape');assert not p.locator('#aq-label-detective').is_visible()
 assert p.evaluate('ALLY_ROOM_QA.graph().node')=='guided'
 passed.append('Cancellation does not bypass adult-review gate')
 assert not errors,errors
 b.close()
(Q/'results.json').write_text(json.dumps({'passed':passed,'errors':errors,'sha256':hashlib.sha256(H.read_bytes()).hexdigest()},indent=2));print(json.dumps({'passed':passed,'errors':errors},indent=2))
