"""Browser-level evidence gate, cancellation and small-screen accessibility checks."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os,json,sys
P=Path(__file__).resolve().parent;Q=P/'qa';Q.mkdir(exist_ok=True)
H=Path(os.getenv('AQ_EXPANDED_HTML',str(P.parent/'Ally_Quest_Welcome_Street_25.html')))
pack=json.loads((P/'welcome-street-25.json').read_text());passed=[];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720},reduced_motion='reduce');p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(12000)
 p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map;Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:true}));}''');p.set_content(H.read_text(),wait_until='load')
 rid='recipe-revision';idx=next(i for i,l in enumerate(pack['levels']) if l['id']==rid);p.evaluate('n=>ALLY_DEBUG.startLevel(n)',idx);p.wait_for_timeout(180);p.evaluate('''id=>{const w=ALLY_DEBUG.getWorld(),t=w.tasks.find(t=>t.id===id);for(const q of w.tasks)if(q.x<t.x)w.state.done.add(q.id);ALLY_DEBUG.forcePosition(t.x-40,567);ALLY_DEBUG.frame(0)}''',rid);p.wait_for_timeout(250);d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',rid);p.mouse.click(d['x'],d['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.graph()');p.wait_for_timeout(250)
 def act(obj):
  p.locator('#aq17-objects').click();p.locator(f'[data-aq17-object="{obj}"]').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');p.wait_for_timeout(120)
 act('adult');assert p.evaluate('ALLY_ROOM_QA.graph().node')=='guided';act('label');assert p.locator('#aq-label-detective').is_visible();assert p.evaluate('document.activeElement.id')=='aqd-title';passed.append('Keyboard focus enters the investigation heading')
 for w,h in [(320,568),(390,844),(844,390),(1280,720)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(100);q=p.locator('#aq-label-detective');box=q.bounding_box();assert box['x']>=0 and box['x']+box['width']<=w+1 and box['y']>=0 and box['y']+box['height']<=h+1,box
  assert q.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'),(w,h,q.evaluate('(e)=>[e.scrollWidth,e.clientWidth]'))
  footer=p.locator('#aqd-next').bounding_box();assert footer['y']>=0 and footer['y']+footer['height']<=h+1,footer
  p.locator('[data-receipt=cheese]').click();p.locator('[data-side=back]').click();p.wait_for_timeout(400)
  footer=p.locator('#aqd-next').bounding_box();assert footer['y']>=0 and footer['y']+footer['height']<=h+1,('back',w,h,footer)
  assert p.locator('#aqd-next').evaluate('(e)=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}'),('back control clipped',w,h)
  p.screenshot(path=str(Q/f'label-investigation-back-{w}.png'));p.locator('[data-receipt=plain]').click()
  p.screenshot(path=str(Q/f'label-investigation-{w}.png'));passed.append(f'{w}x{h} front and long back label fit with persistent progress controls')
 p.locator('[data-side=back]').focus();p.keyboard.press('Enter');assert p.locator('.aqd-label').is_visible();assert p.evaluate('document.activeElement.dataset.side')=='back';passed.append('Keyboard turns the package over and retains focus')
 p.keyboard.press('Escape');assert not p.locator('#aq-label-detective').is_visible();assert p.evaluate('ALLY_ROOM_QA.graph().node')=='guided';passed.append('Escape cancels without advancing required evidence action')
 act('label');assert p.locator('#aq-label-detective').is_visible();assert not p.evaluate('ALLY_ROOM_QA.labelCase().filed');assert p.locator('[data-answer=candidate]').is_disabled();p.locator('[data-side=back]').click();p.locator('[data-answer=candidate]').click();assert p.evaluate('ALLY_ROOM_QA.graph().node')=='guided';passed.append('An incomplete evidence report cannot advance the quest')
 p.keyboard.press('Escape');assert not p.locator('#aq-label-detective').is_visible();assert not errors,errors;b.close()
(Q/'label-access-results.json').write_text(json.dumps({'passed':passed,'errors':errors},indent=2));print(json.dumps({'passed':passed,'errors':errors},indent=2))
