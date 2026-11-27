from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
P=Path(__file__).parent;H=Path(os.getenv('AQ_STAGE19_HTML',str(P.parent/'Ally_Quest_300.html')));Q=Path(os.getenv('AQ_QA',str(P/'qa-stage19-studio')));Q.mkdir(exist_ok=True)
s=H.read_text();pack=json.JSONDecoder().raw_decode(s.split('const compiledPack=',1)[1])[0]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1440,'height':810},reduced_motion='reduce');p.set_default_timeout(12000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.evaluate("""()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map;Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:true}));}""");p.set_content(s,wait_until='load',timeout=60000);p.wait_for_timeout(400)
 def shot(n):p.wait_for_timeout(100);p.screenshot(path=str(Q/(n+'.png')));print(n,flush=True)
 def enter(rid):
  i=next(i for i,l in enumerate(pack['levels']) if l['id']==rid);p.evaluate('n=>ALLY_DEBUG.startLevel(n)',i);p.wait_for_timeout(350);p.evaluate('''id=>{const w=ALLY_DEBUG.getWorld(),t=w.tasks.find(t=>t.id===id);for(const q of w.tasks)if(q.x<t.x)w.state.done.add(q.id);ALLY_DEBUG.forcePosition(t.x-40,567);ALLY_DEBUG.frame(0)}''',rid);p.wait_for_timeout(250);d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',rid);p.mouse.click(d['x'],d['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.graph()');p.wait_for_timeout(200)
 def act(o):p.locator('#aq17-objects').click();p.locator(f'[data-aq17-object="{o}"]').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');p.wait_for_timeout(100)
 for rid,n in [('recipe-revision','snack'),('bakery-order','recipe'),('market-stall','market')]:
  enter(rid);act('adult');act('label');p.wait_for_function('()=>document.querySelector(".aqd-stage")?.dataset.refReady');shot(n+'-front');p.locator('[data-side=back]').click();shot(n+'-label');print(p.locator('.aqd-stage').evaluate('(e)=>Array.from(e.children).map(x=>[x.tagName,x.className,x.getAttribute("style")])'))
  for w,h in [(390,844),(320,568),(844,390)]:
   p.set_viewport_size({'width':w,'height':h});shot(n+f'-{w}x{h}');foot=p.locator('#aqd-next').bounding_box();assert foot and foot['y']>=0 and foot['y']+foot['height']<=h+1,(n,w,h,foot)
  p.set_viewport_size({'width':390,'height':844});c=p.evaluate('ALLY_ROOM_QA.labelCase()');before=p.evaluate('ALLY_ROOM_QA.graph().node');p.keyboard.press('Escape');assert p.evaluate('ALLY_ROOM_QA.graph().node')==before;act('label');p.locator('[data-side=back]').click();
  for i,x in enumerate(c['products']):
   if i:p.locator('[data-receipt='+x['id']+']').click();p.locator('[data-side=back]').click()
   p.wait_for_function('()=>document.querySelector(".aqd-stage")?.dataset.studioReady')
   assert p.locator('.aqd-work').evaluate('(e)=>e.scrollWidth<=e.clientWidth+2')
   if x['id'] in ['plain','cheese','garden','salt','chili','nut','rice','berry','batch']:
    im=p.locator('[data-asset-kind=retail-reference]');assert im.count()==1 and im.evaluate('(e)=>e.complete&&e.naturalWidth>0');p.locator('.aq-photo-zoom').click();assert p.locator('.aq19-product-art').get_attribute('data-zoom')=='true';p.locator('.aq-photo-zoom').click()
   else:assert p.locator('[data-asset-kind=retail-reference]').count()==0
   shot(n+'-'+x['id']+'-mobile')
   for clue in x['clues']:p.locator('[data-clue='+clue+']').click()
   p.locator('[data-answer='+x['expected']+']').click();assert x['id'] in p.evaluate('ALLY_ROOM_QA.labelCase().filed');assert p.evaluate('ALLY_ROOM_QA.graph().node')==before
  p.locator('#aqd-next').click();p.locator('#aqd-submit').click();assert p.evaluate('ALLY_ROOM_QA.graph().node')!=before;print('PASS',rid,len(c['products']),flush=True)
  p.set_viewport_size({'width':1440,'height':810});p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(350)
 assert not errors,errors;b.close()
