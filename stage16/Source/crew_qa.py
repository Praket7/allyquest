from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback,math,time
P=Path(__file__).parent;Q=P/'qa';H=P.parent/'Ally_Quest_Stage155.html';passed=[];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=__import__('os').environ.get('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1440,'height':900});p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(20000)
 p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true}));}''');p.set_content(H.read_text(),wait_until='load')
 def ok(s):passed.append(s);print('PASS',s,flush=True)
 def crew():return p.evaluate('ALLY_ROOM_QA.crew()')
 def st():return p.evaluate('ALLY_ROOM_QA.state()')
 def click(i):
  pt=p.evaluate('i=>ALLY_ROOM_QA.point(i)',i);assert pt,i;p.mouse.click(pt['x'],pt['y']);p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');p.wait_for_timeout(110)
 def enter(id='station1'):
  pt=p.evaluate('i=>ALLY_ROOM_QA.door(i)',id);p.mouse.click(pt['x'],pt['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(500)
 try:
  p.evaluate('ALLY_DEBUG.startLevel(1)');p.evaluate('''()=>{let w=ALLY_DEBUG.getWorld();w.state.cartDelivered=true;w.state.cartX=1040;ALLY_DEBUG.forcePosition(1000,567)}''');p.wait_for_timeout(400);enter()
  q=crew();assert len(q['actors'])==2 and len({a['who'] for a in q['actors']})==2 and all(a['valid'] for a in q['actors']);ok('Two distinct collision-safe peer actors present')
  p.wait_for_timeout(4000);q2=crew();assert any(math.hypot(a['x']-b['x'],a['z']-b['z'])>15 for a,b in zip(q['actors'],q2['actors']));assert all(a['valid'] for a in q2['actors']);ok('Independent movement and valid positions over time')
  p.screenshot(path=str(Q/'crew-active.png'))
  for i in range(3):
   click('crew-helper');
   if crew()['side']=='requested':break
  assert crew()['side']=='requested',crew();assert st()['step']==0;ok('Optional favor starts without advancing required objective');p.screenshot(path=str(Q/'crew-favor.png'))
  click('crew-note');assert crew()['side']=='found',crew();assert st()['step']==0;ok('Locate and carry optional note without changing main inventory')
  click('crew-helper');assert crew()['side']=='complete',crew();assert 'station1' in crew()['assists'];assert st()['step']==0;ok('Return favor to peer and save exactly one friendship note');p.screenshot(path=str(Q/'crew-favor-complete.png'))
  click('crew-helper');assert crew()['assists'].count('station1')==1;ok('Duplicate reward prevented')
  p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(400);assert not p.evaluate("ALLY_DEBUG.getWorld().state.done.has('station1')");enter();assert crew()['side']=='complete' and crew()['variant']==q['variant'];ok('Favor and variant retained on reentry; gate remains closed')
  while st()['goal']['key']!='live-incident':
   r=st();s=r['goal'];old=r['step'];click(s['id']);
   if s['kind']=='move':click(s['to'])
   elif s['kind']=='gesture':
    for _ in range(s['n']):
     if st()['step']>old:break
     p.keyboard.press('KeyE');p.wait_for_timeout(40)
   assert st()['step']==old+1,(s,st())
  p.wait_for_timeout(1200);q=crew();assert q['phase'] in ['notice','investigate'];assert p.evaluate('ALLY_ROOM_QA.incident().active');ok('Scripted safety incident stays active while crew chooses goals')
  click('peer');assert p.evaluate('ALLY_ROOM_QA.incident().heard');p.wait_for_timeout(300);assert crew()['phase']=='paused';ok('Intervention changes actor intent to paused');click('adult');assert p.evaluate('ALLY_ROOM_QA.incident().asked');assert crew()['phase']=='guided';click('case-correct');assert not p.evaluate('ALLY_ROOM_QA.incident().prepared');ok('Adult guidance retained; empty destination rejected')
  click('case-alternative');click('case-correct');click('adult');assert p.evaluate('ALLY_ROOM_QA.incident().resolved');assert p.evaluate('ALLY_ROOM_QA.incident().route')=='adult-directed action';ok('Crew autonomy does not bypass required adult review');p.screenshot(path=str(Q/'crew-incident-resolved.png'))
  assert all(a['valid'] for a in crew()['actors']);ok('Final actor positions clear furniture')
 except Exception as e:errors.append(repr(e));traceback.print_exc();p.screenshot(path=str(Q/'crew-failure.png'))
 finally:b.close();(Q/'crew-results.json').write_text(json.dumps({'passed':passed,'errors':errors},indent=2));print(json.dumps({'passed':passed,'errors':errors},indent=2),flush=True)
