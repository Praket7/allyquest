"""A single browser session, real UI/keyboard inputs; debug API is read-only telemetry.
No startLevel, forcePosition, forceCompleteTasks, world mutations or manual physics ticks."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback,time
P=Path(__file__).parent; Q=P/'qa'; H=P.parent/'Ally_Quest_Stage155.html'; R=[]; errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=__import__('os').environ.get('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']); p=b.new_page(viewport={'width':1280,'height':720}); p.on('pageerror',lambda e: errors.append(str(e)));p.set_default_timeout(18000)
 p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true}));}''');p.set_content(H.read_text(),wait_until='load')
 def log(s):print(s,flush=True)
 def ok(s): R.append(s);log('PASS '+s);(Q/'campaign-results.json').write_text(json.dumps({'passed':R,'errors':errors},indent=2))
 def actor():return p.evaluate('''()=>{let a=ALLY_DEBUG.getActor(),s=ALLY_DEBUG.getState();return {...s,grounded:a.grounded,springFlight:a.springFlight,vx:a.vx,vy:a.vy,attempts:ALLY_DEBUG.getWorld().state.attempts}}''')
 def data():return p.evaluate('''()=>{let w=ALLY_DEBUG.getWorld();return {tasks:w.tasks.map(t=>({id:t.id,x:t.x,kind:t.kind,done:w.state.done.has(t.id)})),finish:w.finishX,springs:w.springs||[],walls:w.walls||[]}}''')
 def wait(ms=35): p.wait_for_timeout(ms)
 def release():
  for k in ['ArrowLeft','ArrowRight','Space']:p.keyboard.up(k)
 def walk_to(target,tol=28,maxsec=13):
  start=time.monotonic(); held=None;last=None;last_moved=time.monotonic()
  try:
   while time.monotonic()-start<maxsec:
    a=actor();x=a['x'];dx=target-x
    if a['paused'] or a['mode']!='playing':return a
    if abs(dx)<=tol:return a
    key='ArrowRight' if dx>0 else 'ArrowLeft'
    if held!=key:
     if held:p.keyboard.up(held)
     p.keyboard.down(key);held=key
    if last is None or abs(x-last)>3:last=x;last_moved=time.monotonic()
    if time.monotonic()-last_moved>1.8: raise AssertionError(('stuck',target,a))
    wait(35)
   raise AssertionError(('walk timeout',target,actor()))
  finally:
   if held:p.keyboard.up(held)
 def launch_spring(pad,target):
  a=actor();x=pad['x'];end=x+pad['w'];center=(x+end)/2;world=data();wall=next((w for w in world['walls'] if end-10<w['x']<end+180),None);desired=min(target,wall['x']+wall['w']+55 if wall else end+85)
  log(f'  spring {x} -> {desired}')
  if a['x']<x-10:walk_to(x-74,18)
  release();p.keyboard.down('Space');p.keyboard.down('ArrowRight');start=time.monotonic();held=True;launched=False;maxy=567
  try:
   while time.monotonic()-start<10:
    s=actor();maxy=min(maxy,s['y']);
    if s['springFlight']:launched=True
    if not launched and s['x']>=center-24 and held:p.keyboard.up('ArrowRight');held=False
    if launched and not held and desired>center+20:p.keyboard.down('ArrowRight');held=True
    if s['x']>=desired-24 and (launched or desired<=center+20):return
    if launched and s['grounded'] and s['x']<desired-24:break
    # If the initial jump landed on a nearby platform, run off its edge onto the pad.
    if not launched and s['grounded'] and s['y']<545 and not held:p.keyboard.down('ArrowRight');held=True
    wait(30)
   raise AssertionError(('spring crossing failed',x,desired,actor(),maxy,launched))
  finally:release()
 def travel(target):
  for attempt in range(8):
   a=actor();x=a['x'];d=data();
   if abs(target-x)<30:return
   if x<target:
    pad=next((v for v in d['springs'] if x<v['x']+v['w']-8 and target>v['x']-20 and x<=v['x']-16),None)
    if pad:
     launch_spring(pad,target);wait(250);continue
   walk_to(target);return
  raise AssertionError(('travel',target,actor()))
 def dialog():
  for _ in range(8):
   if not actor()['dialog']:return
   p.locator('#comic-actions button').first.click();wait(120)
  raise AssertionError('dialog stuck')
 def click(i):
  pt=p.evaluate('i=>ALLY_ROOM_QA.point(i)',i);assert pt,i;p.mouse.click(pt['x'],pt['y']);p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');wait(75)
 def interior(id):
  p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');wait(450);count=0
  while (r:=p.evaluate('ALLY_ROOM_QA.state()'))['step']<r['total']:
   count+=1;assert count<60,(id,r);s=r['goal'];old=r['step']
   if s.get('key')=='live-incident':
    if id=='check':p.keyboard.press('KeyE');wait(100)
    elif id in ['station1','label1','label3','music','game']:
     click('adult')
     if id=='music':click('case-correct');click('peer')
     else:click('case-alternative');click('case-correct')
     click('adult')
    else:click('case-observe');click('case-alternative');click('adult')
   elif s['kind']=='move':click(s['id']);assert p.evaluate('ALLY_ROOM_QA.state().carry')==s['id'],(id,s,p.evaluate('ALLY_ROOM_QA.state()'));click(s['to'])
   elif s['kind']=='gesture':
    click(s['id'])
    for _ in range(s['n']):
     if p.evaluate('ALLY_ROOM_QA.state().step')>old:break
     p.keyboard.press('KeyE');wait(45)
   else:click(s['id'])
   assert p.evaluate('ALLY_ROOM_QA.state().step')==old+1,(id,s,p.evaluate('ALLY_ROOM_QA.state()'))
  assert p.evaluate('ALLY_ROOM_QA.incident().resolved');p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');wait(450);assert p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',id);ok('campaign room '+id)
 try:
  p.locator('#home-play').click();wait(250)
  for level in range(5):
   log('CHAPTER '+str(level+1));assert actor()['level']==level
   for t in data()['tasks']:
    if p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',t['id']):continue
    log('  objective '+t['id'])
    target=t['x'] if t['kind']=='pickup' else t['x']-55
    travel(target);wait(160)
    if t['kind']=='pickup':
     if not p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',t['id']):walk_to(t['x'],8);wait(200)
     assert p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',t['id']),(t,actor());continue
    if t['id']=='station1' and not actor()['cartDelivered']:
     # Actual pushing by walking against the cart, no state mutations.
     walk_to(t['x']+18,25);wait(500);assert actor()['cartDelivered'],actor()
    # A door cannot be used while standing on a high platform. Walk off its edge first.
    if t['kind']=='choice' and actor()['y']<450:
     walk_to(t['x']+76,12);wait(450)
    p.keyboard.press('KeyE');wait(300)
    if t['kind']=='choice':
     if not p.evaluate('!!ALLY_ROOM_QA.state()'):
      # Try the actual door hit box after stepping down, not an injected teleport.
      log('  retry door '+str(actor()));d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',t['id']);p.mouse.click(d['x'],d['y']);wait(400)
     interior(t['id'])
    else:dialog();assert p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',t['id']),(t,actor())
   travel(data()['finish']);wait(500)
   if not p.locator('[data-end-next]').is_visible():p.keyboard.press('KeyE');wait(200)
   assert p.locator('[data-end-next]').is_visible(),actor();p.screenshot(path=str(Q/f'campaign-chapter-{level+1}.png'));ok('chapter '+str(level+1)+' finished via original UI');
   if level<4:p.locator('[data-end-next]').click();wait(500)
  ok('all five chapters completed in one session')
 except Exception as e:errors.append(repr(e));traceback.print_exc();p.screenshot(path=str(Q/'campaign-blocker.png'))
 finally:release();b.close();(Q/'campaign-results.json').write_text(json.dumps({'passed':R,'errors':errors},indent=2));log(json.dumps({'passed':R,'errors':errors},indent=2))
