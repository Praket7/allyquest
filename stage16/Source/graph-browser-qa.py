from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,time,sys
P=Path(__file__).resolve().parent;ROOT=P.parent;Q=P/'qa';Q.mkdir(exist_ok=True);passed=[];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 def ok(s):passed.append(s);print('PASS',s,flush=True)
 def boot():
  p=b.new_page(viewport={'width':844,'height':390} if '--touch' in sys.argv else {'width':1280,'height':720},has_touch='--touch' in sys.argv,is_mobile='--touch' in sys.argv,device_scale_factor=2 if '--touch' in sys.argv else 1);p.on('pageerror',lambda e: (errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)));p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){const m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;}''');p.set_content((ROOT/('Ally_Quest_Stage16_Authored_Demo.html' if '--authored' in sys.argv else 'Ally_Quest_Stage16_Branch_Demo.html')).read_text(),wait_until='load');p.locator('#home-map').click();p.locator('.map-card').filter(has_text='The Reunion Workshop').locator('button').first.click();p.wait_for_timeout(400);return p
 def walk(p,target,tol=22):
  end=time.monotonic()+14;held=None
  try:
   while time.monotonic()<end:
    if p.locator('[data-end-next]').is_visible():return
    x=p.evaluate('ALLY_DEBUG.getState().x');d=target-x
    if abs(d)<=tol:return
    k='ArrowRight' if d>0 else 'ArrowLeft'
    if k!=held:
     if held:p.keyboard.up(held)
     p.keyboard.down(k);held=k
    p.wait_for_timeout(30)
   raise AssertionError(('walk timeout',target,p.evaluate('ALLY_DEBUG.getState()')))
  finally:
   if held:p.keyboard.up(held)
 def enter(p):
  walk(p,265);p.keyboard.press('KeyE');p.wait_for_timeout(250)
  for _ in range(9):
   if not p.evaluate('ALLY_DEBUG.getState().dialog'):break
   p.locator('#comic-actions button').first.click();p.wait_for_timeout(120)
  assert p.evaluate('ALLY_DEBUG.getWorld().state.done.has("leo")');walk(p,845);p.keyboard.press('KeyE');p.wait_for_function('()=>!!ALLY_ROOM_QA.graph()');p.wait_for_timeout(500)
 def node(p):return p.evaluate('ALLY_ROOM_QA.graph()?.node')
 def click(p,i):
  p.wait_for_timeout(60);pt=p.evaluate('i=>ALLY_ROOM_QA.point(i)',i);assert pt,i;(p.touchscreen.tap if '--touch' in sys.argv else p.mouse.click)(pt['x'],pt['y']);p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving',timeout=12000);p.wait_for_timeout(140)
 def act(p,i,expected):
  click(p,i);assert node(p)==expected,(i,expected,p.evaluate('ALLY_ROOM_QA.graph()'),p.evaluate('ALLY_ROOM_QA.state()'))
 def finish(p):
  assert p.evaluate('ALLY_ROOM_QA.graph().complete');p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(450);assert p.evaluate('ALLY_DEBUG.getWorld().state.done.has("reunion-lab")');walk(p,1765);p.wait_for_timeout(350);assert p.locator('[data-end-next]').is_visible()
 p=boot();enter(p);assert node(p)=='arrived';ok('New room archetype enters from new data-defined level using normal controls');p.screenshot(path=str(Q/'branch-room.png'))
 act(p,'plan','arrived');ok('Unavailable action cannot bypass graph')
 act(p,'record','evidence');
 if '--authored' in sys.argv:
  act(p,'board','evidence');act(p,'board','evidence');act(p,'board','arrived');ok('Editor-authored three-gesture recovery returns to starting node');act(p,'record','evidence')
 act(p,'delivery','confirmed');act(p,'adult','guided');ok('Investigation branch reaches adult-guided separation')
 click(p,'delivery');assert p.evaluate('ALLY_ROOM_QA.state().carry')=='delivery';click(p,'desk');assert node(p)=='guided' and p.evaluate('ALLY_ROOM_QA.state().carry')=='delivery';ok('Wrong carry destination cannot advance graph');act(p,'hold','separated');p.screenshot(path=str(Q/'branch-separated.png'))
 click(p,'plan');assert p.evaluate('ALLY_ROOM_QA.state().carry')=='plan';act(p,'desk','arranged');act(p,'board','reflection');act(p,'adult','done');ok('Reflection branch requires adult final review');p.screenshot(path=str(Q/'branch-completed.png'));finish(p);ok('Investigation route completes exterior checkpoint and finale');p.close()
 p=boot();enter(p);act(p,'adult','guided');click(p,'delivery');act(p,'hold','separated');p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(450);assert not p.evaluate('ALLY_DEBUG.getWorld().state.done.has("reunion-lab")');p.keyboard.press('KeyE');p.wait_for_function('()=>!!ALLY_ROOM_QA.graph()');p.wait_for_timeout(450);assert node(p)=='separated';ok('Incomplete graph persists and does not mark checkpoint complete')
 click(p,'plan');act(p,'desk','arranged');act(p,'adult','done');ok('Help-first route reaches same valid adult-reviewed terminal');finish(p);ok('Help-first route completes exterior checkpoint and finale');p.close();b.close()
assert not errors,errors
(Q/('graph-touch-results.json' if '--touch' in sys.argv else 'graph-authored-results.json' if '--authored' in sys.argv else 'graph-browser-results.json')).write_text(json.dumps({'passed':passed,'errors':errors},indent=2))
