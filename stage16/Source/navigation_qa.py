from pathlib import Path
from playwright.sync_api import sync_playwright
import json,math,traceback,time
P=Path(__file__).parent;Q=P/'qa';H=P.parent/'Ally_Quest_Stage155.html';Q.mkdir(exist_ok=True)
results=[];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=__import__('os').environ.get('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':900});p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(24000)
 p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map;Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true}));}''');p.set_content(H.read_text(),wait_until='load')
 def state():return p.evaluate('ALLY_ROOM_QA.spatial()')
 def ok(name,**data):results.append({'test':name,**data});print('PASS',name,data,flush=True)
 def keyto(key,axis,target):
  p.keyboard.down(key)
  try:
   for i in range(250):
    s=state();assert s['valid'],s
    if (key in ['ArrowRight','ArrowDown'] and s[axis]>=target) or (key in ['ArrowLeft','ArrowUp'] and s[axis]<=target):return s
    p.wait_for_timeout(25)
   raise AssertionError((key,axis,target,state()))
  finally:p.keyboard.up(key)
 def hold(key,ms):
  p.keyboard.down(key)
  try:
   for i in range(math.ceil(ms/50)):
    p.wait_for_timeout(50);assert state()['valid']
  finally:p.keyboard.up(key)
 def click(id):
  q=p.evaluate('id=>ALLY_ROOM_QA.point(id)',id);assert q,id;p.mouse.click(q['x'],q['y']);p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');p.wait_for_timeout(100)
 try:
  p.evaluate('ALLY_DEBUG.startLevel(1)');p.evaluate('''()=>{let w=ALLY_DEBUG.getWorld();w.state.cartDelivered=true;w.state.cartX=1040;const t=w.tasks.find(t=>t.id==='station1');ALLY_DEBUG.forcePosition(t.x-40,567)}''');p.wait_for_timeout(450);p.keyboard.press('KeyE');p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(400)
  assert state()['rasterBackground'] is False;ok('No raster interior drawn')
  s=state();assert s['z']<90;keyto('ArrowRight','x',320);s=state();assert s['z']<90 and s['x']>300;ok('Actual keyboard walk behind review desk',x=round(s['x'],1),z=round(s['z'],1));p.screenshot(path=str(Q/'behind-review-desk.png'))
  hold('ArrowDown',800);s=state();assert 85<s['z']<=95,(s,'desk collision');ok('Desk blocks movement into its footprint',x=round(s['x'],1),z=round(s['z'],1))
  keyto('ArrowRight','x',520);keyto('ArrowDown','z',218);s=state();
  # A loaded browser may advance several input frames before the driver releases a key.
  # Correct the actual keyboard route, not the game coordinates, into the narrow aisle.
  for _ in range(6):
   if 208<=state()['z']<=234:break
   if state()['z']>234:keyto('ArrowUp','z',225)
   else:keyto('ArrowDown','z',216)
  s=state();assert 208<=s['z']<=234,s;ok('Walk around desk and enter center aisle',x=round(s['x'],1),z=round(s['z'],1));p.screenshot(path=str(Q/'center-aisle.png'))
  keyto('ArrowRight','x',800);s=state();assert 207<s['z']<235;ok('Walk behind preparation island',x=round(s['x'],1),z=round(s['z'],1));p.screenshot(path=str(Q/'behind-prep-island.png'))
  hold('ArrowDown',650);s=state();assert s['z']<=238,s;ok('Preparation island has solid collision',z=round(s['z'],1))
  # Actual click on adult routes around the preparation island; sample all intermediate positions.
  q=p.evaluate("ALLY_ROOM_QA.point('adult')");p.mouse.click(q['x'],q['y']);n=0
  while p.evaluate('ALLY_ROOM_QA.state()?.moving'):
   assert state()['valid'],state();n+=1;p.wait_for_timeout(25);assert n<350
  assert p.evaluate('ALLY_ROOM_QA.state().step')==1;ok('Automatic route arrives at adult without collision',samples=n)
  click('tray');assert p.evaluate('ALLY_ROOM_QA.state().carry')=='tray';p.screenshot(path=str(Q/'carry-tray.png'));click('desk');assert p.evaluate('ALLY_ROOM_QA.state().step')==2;ok('Pickup and deposit at physical table')
  # Explicit door click, rather than header exit.
  q=p.evaluate("ALLY_ROOM_QA.point('exit')");p.mouse.click(q['x'],q['y']);p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(400);assert not p.evaluate("ALLY_DEBUG.getWorld().state.done.has('station1')");ok('Walk to real exit, restore original level without early reward')
 except Exception as e:errors.append(repr(e));traceback.print_exc();p.screenshot(path=str(Q/'navigation-failure.png'))
 finally:b.close();(Q/'navigation-results.json').write_text(json.dumps({'passed':results,'errors':errors},indent=2));print(json.dumps({'passed':results,'errors':errors},indent=2))
