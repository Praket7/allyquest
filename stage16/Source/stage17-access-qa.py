from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback,sys
from concurrent.futures import ProcessPoolExecutor
P=Path(__file__).parent;Q=P/'qa'/'access';Q.mkdir(parents=True,exist_ok=True);HTML=P.parent/'Ally_Quest_Stage155.html'
LEVELS={1:['station1','station2','station3'],2:['label1','label2','label3'],3:['crafts','music'],4:['welcome','game','check']}
def run(level):
 errors=[];passed=[]
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path=__import__('os').environ.get('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':900});p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(24000)
  p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map;Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true}));}''');p.set_content(HTML.read_text(),wait_until='load');p.evaluate('(n)=>ALLY_DEBUG.startLevel(n)',level);p.wait_for_timeout(200)
  try:
   for id in LEVELS[level]:
    p.evaluate('''id=>{const w=ALLY_DEBUG.getWorld();const t=w.tasks.find(t=>t.id===id);if(id==='station1'){w.state.cartDelivered=true;w.state.cartX=1040}if(id.startsWith('label'))w.state.done.add('magnifier');ALLY_DEBUG.forcePosition(t.x-40,567)}''',id);p.wait_for_timeout(600)
    p.screenshot(path=str(Q/(id+'-door.png')));d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',id);p.mouse.click(d['x'],d['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(450)
    assert p.evaluate('ALLY_ROOM_QA.state().hero')==p.evaluate('ALLY_DEBUG.getState().selected');p.screenshot(path=str(Q/(id+'-room.png')))
    if id in ['station1','label1']:
     p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(400);assert not p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',id);d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',id);p.mouse.click(d['x'],d['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(400)
    def click(i):
     p.locator('#aq17-objects').click();p.locator('[data-aq17-object="'+i+'"]').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');p.wait_for_timeout(100)
    count=0
    while (r:=p.evaluate('ALLY_ROOM_QA.state()'))['step']<r['total']:
     count+=1;assert count<40,(id,r);s=r['goal'];old=r['step'];
     if s.get('key')=='live-incident':
      p.wait_for_timeout(150);p.screenshot(path=str(Q/(id+'-incident.png')))
      if id=='check':
       click('case-observe');assert p.evaluate('ALLY_ROOM_QA.state().step')==old
       p.locator('#aq17-urgent').click();p.wait_for_timeout(150)
      else:
       click('case-correct');assert p.evaluate('ALLY_ROOM_QA.state().step')==old,(id,'unapproved action advanced');assert p.evaluate('ALLY_ROOM_QA.incident().attempts')==1
       if id in ['station1','label1','label3','music','game']:
        click('case-observe');click('case-alternative');assert p.evaluate('ALLY_ROOM_QA.incident().compared');click('adult');assert p.evaluate('ALLY_ROOM_QA.incident().route')=='evidence report'
       else:
        click('adult');assert p.evaluate('ALLY_ROOM_QA.incident().asked');
        if id in ['welcome','music']:
         click('case-correct');assert p.evaluate('ALLY_ROOM_QA.incident().arranged');click('peer')
        else:
         click('case-correct');assert not p.evaluate('ALLY_ROOM_QA.incident().prepared');click('case-alternative');assert p.evaluate('ALLY_ROOM_QA.state().carry')=='case-alternative';click('case-correct')
        assert p.evaluate('ALLY_ROOM_QA.incident().prepared');click('adult');assert p.evaluate('ALLY_ROOM_QA.incident().route')=='adult-directed action'
      assert p.evaluate('ALLY_ROOM_QA.incident().resolved');assert p.evaluate('ALLY_ROOM_QA.state().step')==old+1;print('INCIDENT',id,p.evaluate('ALLY_ROOM_QA.incident().route'),flush=True);continue
     if s['kind']=='move':click(s['id']);assert p.evaluate('ALLY_ROOM_QA.state().carry')==s['id'],(id,s,p.evaluate('ALLY_ROOM_QA.state()'));click(s['to'])
     elif s['kind']=='gesture':
      for _ in range(s['n']):
       if p.evaluate('ALLY_ROOM_QA.state().step')>old:break
       click(s['id'])
     else:click(s['id'])
     assert p.evaluate('ALLY_ROOM_QA.state().step')==old+1,(id,s,p.evaluate('ALLY_ROOM_QA.state()'))
     if count==1 and id=='station1':
      p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(400);d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',id);p.mouse.click(d['x'],d['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(400);assert p.evaluate('ALLY_ROOM_QA.state().step')==1
    assert p.evaluate('ALLY_ROOM_QA.incident().resolved');p.screenshot(path=str(Q/(id+'-completed.png')));x=p.evaluate('ALLY_DEBUG.getState().x');p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(380);assert p.evaluate('id=>ALLY_DEBUG.getWorld().state.done.has(id)',id);assert abs(p.evaluate('ALLY_DEBUG.getState().x')-x)<(65 if level==1 else 3);passed.append(id);print('PASS',level,id,flush=True)
  except Exception as e:errors.append(repr(e));traceback.print_exc();p.screenshot(path=str(Q/('failure-'+str(level)+'.png')))
  b.close()
 return {'level':level,'passed':passed,'errors':errors}
if __name__=='__main__':
 with ProcessPoolExecutor(max_workers=2) as pool:r=list(pool.map(run, [int(sys.argv[1])] if len(sys.argv)>1 else LEVELS))
 print(json.dumps(r,indent=2));(Q/('allergy-results-'+sys.argv[1]+'.json' if len(sys.argv)>1 else 'stage17-access-results.json')).write_text(json.dumps(r,indent=2))

 assert not any(v['errors'] for v in r) and sum(len(v['passed']) for v in r)==(len(LEVELS[int(sys.argv[1])]) if len(sys.argv)>1 else 11)
