"""Real exterior movement and room interactions; QA hook only chooses initial level.
No teleport, forced task completion, graph mutation, or skipped room objective.
CI shards by world; optional --world N or explicit one-based level numbers.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from concurrent.futures import ProcessPoolExecutor
import os,json,time,traceback,sys,argparse,hashlib
P=Path(__file__).resolve().parent
H=Path(os.getenv('AQ_STAGE19_HTML',str(P/'Ally_Quest_Stage19.html' if (P/'Ally_Quest_Stage19.html').exists() else P.parent/'Ally_Quest_300.html')))
PACK=json.loads(Path(os.getenv('AQ_STAGE19_PACK',str(P/'ally-quest-300.json'))).read_text());Q=Path(os.getenv('AQ_STAGE19_QA',str(P/'qa-stage19')));Q.mkdir(exist_ok=True)
INIT='''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:true}));}'''
def run(spec):
 idx,variant=spec;l=PACK['levels'][idx];rid=l['id'];label=f'{idx+1:03}-{rid}-{variant}';errors=[];passed=[]
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720},reduced_motion='reduce');p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(14000)
  p.evaluate(INIT)
  def shot(suffix):
   
   if suffix=='FAIL' or os.getenv('AQ_CAPTURE','1')=='1' or (os.getenv('AQ_CAPTURE')=='sample' and (idx%25==0 or idx%25==24)):p.screenshot(path=str(Q/(label+'-'+suffix+'.png')))
  try:
   p.set_content(H.read_text(),wait_until='load',timeout=60000)
   # Each isolated run receives the completion records that a player would have
   # earned before reaching this adventure. Never complete the adventure under test.
   p.evaluate('i=>ALLY_JOURNEY_QA.seedBoundary(i)',idx)
   p.evaluate('n=>ALLY_DEBUG.startLevel(n)',idx);p.wait_for_timeout(220)
   def st():return p.evaluate('ALLY_DEBUG.getState()')
   def walk(target,tol=27):
    # The stock fixed-step physics is driven by input at a bounded step, not by
    # changing the player position. Normal room input remains browser-driven.
    p.evaluate('ALLY_DEBUG.manual(true)')
    try:
     for _ in range(500):
      s=st();d=target-s['x']
      if abs(d)<tol or s['paused']:return
      p.evaluate('d=>ALLY_DEBUG.tick(0.09,{right:d>0,left:d<0})',d)
     raise AssertionError(('walk timeout',target,st()))
    finally:p.evaluate('ALLY_DEBUG.manual(false)')
   walk(l['tasks'][0]['x']-25);p.wait_for_timeout(130);p.keyboard.press('KeyE');p.wait_for_timeout(100)
   for _ in range(10):
    if not st()['dialog']:break
    p.locator('#comic-actions button').first.click();p.wait_for_timeout(70)
   assert p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',l['tasks'][0]['id']),st()
   walk(l['tasks'][1]['x']-20);p.wait_for_timeout(140);shot('outside');p.keyboard.press('KeyE');p.wait_for_function('()=>!!ALLY_ROOM_QA.graph()');p.wait_for_timeout(280)
   assert p.evaluate('ALLY_ROOM_QA.state().hero')==st()['selected'];arch=p.evaluate('ALLY_ROOM_QA.architecture()');assert arch and arch['fixtureCount']>0,(rid,arch);shot('room')
   def graph():return p.evaluate('ALLY_ROOM_QA.graph()')
   def click(obj):
    if variant=='pointer':
     q=p.evaluate('i=>ALLY_ROOM_QA.point(i)',obj);assert q,(obj,graph());p.mouse.click(q['x'],q['y'])
    else:p.locator('#aq17-objects').click();p.locator(f'[data-aq17-object="{obj}"]').click()
    p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving',timeout=15000);p.wait_for_timeout(90)
    if p.locator('#aq-label-detective').is_visible():
     c=p.evaluate('ALLY_ROOM_QA.labelCase()');assert c and obj=='label';before=graph()['node'];assert p.locator('[data-answer=candidate]').is_disabled();shot('package');p.locator('[data-side=back]').click();shot('label')
     wrong=next(x for x in ('candidate','conflict','hold') if x!=c['products'][0]['expected']);p.locator('[data-answer='+wrong+']').click();assert graph()['node']==before and not p.evaluate('ALLY_ROOM_QA.labelCase().filed');assert 'Not quite' in p.locator('#aq-label-detective [role=status]').inner_text()
     for i,x in enumerate(c['products']):
      if i:p.locator('[data-receipt='+x['id']+']').click();p.locator('[data-side=back]').click()
      if x['clues']:
       p.locator('[data-answer='+x['expected']+']').click();assert x['id'] not in p.evaluate('ALLY_ROOM_QA.labelCase().filed');assert 'marked clues' in p.locator('#aq-label-detective [role=status]').inner_text()
      for clue in x['clues']:p.locator('[data-clue='+clue+']').click()
      p.locator('[data-answer='+x['expected']+']').click();assert x['id'] in p.evaluate('ALLY_ROOM_QA.labelCase().filed') and graph()['node']==before
     p.locator('#aqd-next').click();shot('report');p.locator('#aqd-submit').click();p.wait_for_timeout(120);assert not p.locator('#aq-label-detective').is_visible()
   for j in range(45):
    g=graph()
    if g['complete']:break
    e=g['edges'][-1 if variant=='access' else 0];old=g['node'];oid=e['id']
    if PACK['rooms'][rid]['education']['emergency']:
     assert p.locator('#aq17-urgent').is_visible();p.locator('#aq17-urgent').click();p.wait_for_timeout(120)
    elif e['kind']=='move':click(oid);assert p.evaluate('ALLY_ROOM_QA.state().carry')==oid,(rid,oid,graph());click(e['to'])
    elif e['kind']=='gesture':
     for k in range(e['n']):
      if graph()['node']!=old:break
      click(oid)
    else:click(oid)
    assert graph()['node']==e['next'],(rid,e,graph(),p.evaluate('ALLY_ROOM_QA.state()'))
    assert p.evaluate('ALLY_ROOM_QA.spatial().valid'),(rid,'invalid navigation')
   assert graph()['complete'],graph();shot('complete');p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(180);assert p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',rid)
   walk(l['finishX'],40);p.wait_for_timeout(200)
   if not p.locator('[data-end-next]').is_visible():p.keyboard.press('KeyE');p.wait_for_timeout(120)
   assert p.locator('[data-end-next]').is_visible(),st();assert st()['unlocked']>=min(300,idx+2),st();shot('end')
   if PACK['rooms'][rid]['education']['emergency']:
    assert 'no time score' in p.locator('.end-progress').inner_text().lower();assert 'Swift Ally' not in p.locator('.replay-badges').inner_text()
   if idx%25==24 and idx<299:
    p.locator('[data-end-next]').click();assert p.locator('#map').is_visible();assert p.evaluate('ALLY_STAGE19_QA.selectedWorld()')==(idx+1)//25
    assert p.locator('[data-adventure19]').first.locator('button').is_enabled();shot('next-world')
   passed.append(label)
  except Exception as e:errors.append(repr(e));traceback.print_exc();shot('FAIL')
  finally:b.close()
 print('PASS' if passed and not errors else 'FAIL',label,errors,flush=True)
 return {'level':idx+1,'id':rid,'variant':variant,'passed':passed,'errors':errors}
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('levels',nargs='*',type=int);parser.add_argument('--world',type=int);parser.add_argument('--workers',type=int,default=int(os.getenv('AQ_WORKERS','2')));parser.add_argument('--modes',default=os.getenv('AQ_ROUTES','pointer,access'));a=parser.parse_args()
 if a.world:assert 2<=a.world<=12;indices=list(range((a.world-1)*25,a.world*25));name='world-'+str(a.world)
 elif a.levels:indices=[i-1 for i in a.levels];name='selected-'+'-'.join(map(str,a.levels))
 else:indices=[25,55,75,100,125,150,195,200,225,250,275,299];name='representative'
 specs=[(i,m) for i in indices for m in a.modes.split(',')]
 with ProcessPoolExecutor(max_workers=a.workers) as ex:results=list(ex.map(run,specs))
 report={'sha256':hashlib.sha256(H.read_bytes()).hexdigest(),'results':results,'passed':sum(bool(r['passed']) and not r['errors'] for r in results),'total':len(results),'errors':sum(len(r['errors']) for r in results)};(Q/(name+'-'+a.modes.replace(',','-')+'.json')).write_text(json.dumps(report,indent=2));assert not report['errors'],report
