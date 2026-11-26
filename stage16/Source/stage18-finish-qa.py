"""Stage 18 finishing gate: readable, reachable UI; context shading; scene animation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageChops,ImageStat
import json,os
P=Path(__file__).resolve().parent
H=Path(os.getenv('AQ_EXPANDED_HTML',str(P/'Ally_Quest_Stage18_Finished_Preview.html' if (P/'Ally_Quest_Stage18_Finished_Preview.html').exists() else P.parent/'Ally_Quest_Welcome_Street_25.html')))
PACK=Path(os.getenv('AQ_PACK',str(P/'pack.json' if (P/'pack.json').exists() else P/'welcome-street-25.json')))
Q=P/'qa-finish';Q.mkdir(exist_ok=True)
pack=json.loads(PACK.read_text());passed=[];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 p=b.new_page(viewport={'width':1280,'height':720},reduced_motion='no-preference')
 p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_default_timeout(14000)
 p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map;Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:false}));}''')
 p.set_content(H.read_text(),wait_until='load')
 def enter(rid):
  idx=next(i for i,l in enumerate(pack['levels']) if l['id']==rid)
  p.set_viewport_size({'width':1280,'height':720})
  p.evaluate('(n)=>ALLY_DEBUG.startLevel(n)',idx);p.wait_for_timeout(250)
  p.evaluate('''id=>{const w=ALLY_DEBUG.getWorld();const t=w.tasks.find(t=>t.id===id);for(const q of w.tasks)if(q.x<t.x)w.state.done.add(q.id);ALLY_DEBUG.forcePosition(t.x-40,567);ALLY_DEBUG.frame(0)}''',rid)
  p.wait_for_timeout(280);d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',rid);p.mouse.click(d['x'],d['y'])
  p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(550)
 for rid in ['sports-break','substitute-teacher','welcome-rehearsal','class-science','shared-lunch','bakery-order']:
  enter(rid)
  assert p.evaluate('ALLY_ROOM_QA.premium().materials'),rid
  assert p.locator('#aq-premium-info').is_visible()
  title=p.locator('#aq-room-goal').inner_text();assert 0<len(title)<=120,(rid,title)
  assert not p.locator('.aq-storybar').is_visible()
  assert not p.locator('#aq-room-lesson').is_visible()
  assert not p.locator('#aq-premium-drawer').is_visible()
  p.locator('#aq-premium-info').focus();p.keyboard.press('Enter')
  assert p.locator('#aq-premium-drawer').is_visible()
  assert p.locator('#aq-premium-drawer').inner_text().strip()
  p.keyboard.press('Escape');assert not p.locator('#aq-premium-drawer').is_visible()
  assert p.evaluate('document.activeElement.id')=='aq-premium-info'
  p.screenshot(path=str(Q/f'{rid}-desktop.png'))
  passed.append(f'{rid} distinct scene; succinct goal; keyboard info and focus')
  if rid=='sports-break':
   p.screenshot(path=str(Q/'idle-a.png'));p.wait_for_timeout(700);p.screenshot(path=str(Q/'idle-b.png'))
   im1=Image.open(Q/'idle-a.png').convert('RGB');im2=Image.open(Q/'idle-b.png').convert('RGB')
   diff=ImageStat.Stat(ImageChops.difference(im1,im2)).mean
   assert max(diff)>.02,('idle pose is frozen',diff)
   passed.append('Continuous non-reduced-motion actor animation changes rendered pixels')
  p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(1300)
 enter('sports-break')
 for w,h in [(320,568),(390,844),(844,390),(1280,720)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(220)
  selectors=['#aq-premium-info','#aq-room-exit']+(['#aq-room-action'] if w<900 else [])
  for selector in selectors:
   r=p.locator(selector).bounding_box();assert r and r['x']>=-1 and r['y']>=-1 and r['x']+r['width']<=w+1 and r['y']+r['height']<=h+1,(w,h,selector,r)
  assert not p.locator('#aq-premium-drawer').is_visible()
  assert p.locator('#aq-room-goal').evaluate('(e)=>e.getBoundingClientRect().width')<w
  p.screenshot(path=str(Q/f'gym-{w}x{h}.png'))
  passed.append(f'{w}x{h} compact navigation controls and goal within viewport')
 assert not errors,errors
 b.close()
(Q/'finish-results.json').write_text(json.dumps({'passed':passed,'errors':errors},indent=2))
print(json.dumps({'passed':passed,'errors':errors},indent=2))
