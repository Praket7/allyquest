"""Isolated new-level playthroughs using UI interactions; no avatar teleport or task completion hooks."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os,json,time,traceback,sys
from concurrent.futures import ProcessPoolExecutor
P=Path(__file__).resolve().parent;Q=P/'qa'/'stage18';Q.mkdir(parents=True,exist_ok=True)
H=Path(os.getenv('AQ_EXPANDED_HTML',str(P.parent/'Ally_Quest_Welcome_Street_25.html')))
PACK=json.loads((P/'welcome-street-25.json').read_text())
def run(spec):
 idx,variant=spec;l=PACK['levels'][idx];id=l['id'];label=f'{idx+1:02}-{id}-{variant}';errors=[];passed=[]
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720});p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(10000)
  p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map;Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:true}));}''')
  try:
   p.set_content(H.read_text(),wait_until='load');p.evaluate('n=>ALLY_DEBUG.startLevel(n)',idx);p.wait_for_timeout(220)
   def st():return p.evaluate('ALLY_DEBUG.getState()')
   def walk(target,tol=26):
    held=None;end=time.monotonic()+18
    try:
     while time.monotonic()<end:
      s=st();d=target-s['x']
      if abs(d)<tol or s['paused']:return
      k='ArrowRight' if d>0 else 'ArrowLeft'
      if k!=held:
       if held:p.keyboard.up(held)
       p.keyboard.down(k);held=k
      p.wait_for_timeout(30)
     raise AssertionError(('walk timeout',target,st()))
    finally:
     if held:p.keyboard.up(held)
   walk(l['tasks'][0]['x']-25);p.keyboard.press('KeyE');p.wait_for_timeout(100)
   for _ in range(10):
    if not st()['dialog']:break
    p.locator('#comic-actions button').first.click();p.wait_for_timeout(70)
   assert p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',l['tasks'][0]['id']),st()
   walk(l['tasks'][1]['x']-20);p.wait_for_timeout(120);p.screenshot(path=str(Q/(label+'-outside.png')));p.keyboard.press('KeyE');p.wait_for_function('()=>!!ALLY_ROOM_QA.graph()');p.wait_for_timeout(250)
   assert p.evaluate('ALLY_ROOM_QA.state().hero')==st()['selected'];arch=p.evaluate('ALLY_ROOM_QA.architecture()');assert arch and arch['fixtureCount']>0,(id,arch);(Q/(label+'-architecture.json')).write_text(json.dumps(arch,indent=2));p.screenshot(path=str(Q/(label+'-room.png')))
   def graph():return p.evaluate('ALLY_ROOM_QA.graph()')
   def click(obj):
    if variant=='pointer':
     q=p.evaluate('i=>ALLY_ROOM_QA.point(i)',obj);assert q,(obj,graph());p.mouse.click(q['x'],q['y'])
    else:
     p.locator('#aq17-objects').click();p.locator(f'[data-aq17-object="{obj}"]').click()
    p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving',timeout=10000);p.wait_for_timeout(90)
    if p.locator('#aq-label-detective').is_visible():
     c=p.evaluate('ALLY_ROOM_QA.labelCase()');assert c and obj=='label';before=graph()['node']
     assert p.locator('[data-answer=candidate]').is_disabled()
     p.screenshot(path=str(Q/(label+'-package.png')))
     p.locator('[data-side=back]').click();p.screenshot(path=str(Q/(label+'-label.png')))
     wrong=next(x for x in ('candidate','conflict','hold') if x!=c['products'][0]['expected'])
     p.locator('[data-answer='+wrong+']').click();assert graph()['node']==before and not p.evaluate('ALLY_ROOM_QA.labelCase().filed')
     assert 'Not quite' in p.locator('#aq-label-detective [role=status]').inner_text()
     for i,x in enumerate(c['products']):
      if i:
       p.locator('[data-receipt='+x['id']+']').click();p.locator('[data-side=back]').click()
      if x['clues']:
       p.locator('[data-answer='+x['expected']+']').click()
       assert x['id'] not in p.evaluate('ALLY_ROOM_QA.labelCase().filed')
       assert 'marked clues' in p.locator('#aq-label-detective [role=status]').inner_text()
      for clue in x['clues']:p.locator('[data-clue='+clue+']').click()
      p.locator('[data-answer='+x['expected']+']').click()
      assert x['id'] in p.evaluate('ALLY_ROOM_QA.labelCase().filed') and graph()['node']==before
     p.locator('#aqd-next').click();p.screenshot(path=str(Q/(label+'-report.png')))
     p.locator('#aqd-submit').click();p.wait_for_timeout(100);assert not p.locator('#aq-label-detective').is_visible()

   for j in range(40):
    g=graph()
    if g['complete']:break
    e=g['edges'][-1 if variant=='access' else 0];old=g['node'];oid=e['id']
    if id=='emergency-rehearsal':
     assert p.locator('#aq17-urgent').is_visible();p.locator('#aq17-urgent').click();p.wait_for_timeout(120)
    elif e['kind']=='move':
     click(oid);assert p.evaluate('ALLY_ROOM_QA.state().carry')==oid,(id,oid,graph());click(e['to'])
    elif e['kind']=='gesture':
     for k in range(e['n']):
      if graph()['node']!=old:break
      click(oid)
    else:click(oid)
    assert graph()['node']==e['next'],(id,e,graph(),p.evaluate('ALLY_ROOM_QA.state()'))
    assert p.evaluate('ALLY_ROOM_QA.spatial().valid'),(id,'invalid navigation')
   assert graph()['complete'],graph();p.screenshot(path=str(Q/(label+'-complete.png')))
   p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(150);assert p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',id)
   walk(l['finishX'],40);p.wait_for_timeout(250)
   if not p.locator('[data-end-next]').is_visible():p.keyboard.press('KeyE');p.wait_for_timeout(120)
   assert p.locator('[data-end-next]').is_visible(),st();assert st()['unlocked']>=min(25,idx+2),st();p.screenshot(path=str(Q/(label+'-end.png')));passed.append(label)
  except Exception as e:errors.append(repr(e));traceback.print_exc();p.screenshot(path=str(Q/(label+'-FAIL.png')))
  b.close()
 print('PASS' if passed and not errors else 'FAIL',label,errors,flush=True)
 return {'level':idx+1,'id':id,'variant':variant,'passed':passed,'errors':errors}
if __name__=='__main__':
 indices=[int(a)-1 for a in sys.argv[1:]] if len(sys.argv)>1 else list(range(5,25)); variants=os.getenv('AQ_ROUTES','pointer,access').split(',');specs=[(i,v) for i in indices for v in variants]
 with ProcessPoolExecutor(max_workers=int(os.getenv('AQ_WORKERS','4'))) as ex:r=list(ex.map(run,specs))
 (Q/('results-'+('-'.join(sys.argv[1:]) or 'all')+'.json')).write_text(json.dumps(r,indent=2));assert not any(x['errors'] for x in r),r
