from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,traceback
P=Path(__file__).parent;Q=P/'qa';Q.mkdir(exist_ok=True);H=P.parent/'Ally_Quest_Stage155.html';passed=[];errors=[]
def ok(s):passed.append(s);print('PASS',s,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720},accept_downloads=True);p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(15000)
 p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true}));}''');p.set_content(H.read_text(),wait_until='load')
 def shot(name):p.screenshot(path=str(Q/('stage17-'+name+'.png')))
 def obj(id):
  p.locator('#aq17-objects').click();p.locator('[data-aq17-object="'+id+'"]').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()?.moving');p.wait_for_timeout(150)
 def enter(level,id):
  p.evaluate('(n)=>ALLY_DEBUG.startLevel(n)',level);p.wait_for_timeout(200);p.evaluate('''id=>{const w=ALLY_DEBUG.getWorld(),t=w.tasks.find(t=>t.id===id);if(id==='station1'){w.state.cartDelivered=true;w.state.cartX=1040}if(id.startsWith('label'))w.state.done.add('magnifier');if(id==='check'){w.state.done.add('welcome');w.state.done.add('game')}ALLY_DEBUG.forcePosition(t.x-40,567)}''',id);p.wait_for_timeout(350);d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',id);p.mouse.click(d['x'],d['y']);p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(400);assert p.evaluate('ALLY_ROOM_QA.state().task')==id
 try:
  guide=p.locator('#aq17-guide-home');guide.focus();p.keyboard.press('Enter');assert p.locator('#aq17-notebook').is_visible();ok('Field guide opens from keyboard without starting game')
  p.get_by_role('button',name='Start before-playing check-in').click();assert '1 of 6' in p.locator('#aq17-title').inner_text();shot('assessment');
  for i in range(6):p.locator('#aq17-notebook button').nth(1).click()
  assert 'complete' in p.locator('#aq17-title').inner_text().lower();s=p.evaluate("JSON.parse(localStorage.getItem('allyquest.stage17.study.v1'))");assert len(s['pre'])==6 and not s['post'];ok('Six first-attempt answers stored locally')
  p.get_by_role('button',name='Return to field guide').click();p.get_by_role('button',name='Practice a new situation').click();p.locator('#aq17-notebook button').nth(1).click();assert 'Good choice' in p.locator('#aq17-notebook [role=status]').inner_text();ok('Separate practice activity gives feedback')
  p.get_by_role('button',name='Back to guide').click();p.get_by_role('button',name='After playing').click();
  for i in range(6):p.locator('#aq17-notebook button').nth(2).click()
  p.get_by_role('button',name='Review results').click();assert '6/6 answered' in p.locator('#aq17-notebook').inner_text();shot('results');ok('Parallel post-check and scores displayed')
  with p.expect_download() as d:p.get_by_role('button',name='Export anonymous responses').click()
  result=json.loads(Path(d.value.path()).read_text());assert set(result)=={'schema','form','pre','post','review','scores','notice'};ok('Anonymous JSON export excludes identifying fields')
  p.get_by_role('button',name='Delete local learning results').click();p.get_by_role('button',name='Delete',exact=True).click();assert p.evaluate("localStorage.getItem('allyquest.stage17.study.v1')===null");ok('Deletion works without deleting game state')
  p.keyboard.press('Escape');assert not p.locator('#aq17-notebook').is_visible();assert p.evaluate('document.activeElement.id')=='aq17-guide-home';ok('Escape closes guide and restores focus')
  enter(2,'label1');p.locator('#aq17-objects').focus();p.keyboard.press('Enter');assert p.locator('#aq17-access').is_visible();shot('objects');p.keyboard.press('Escape');assert not p.locator('#aq17-access').is_visible();assert p.evaluate('ALLY_ROOM_QA.state().task')=='label1';ok('Room object dialog supports keyboard and Escape does not exit room')
  obj('magnifier');assert p.evaluate('ALLY_ROOM_QA.state().carry')=='magnifier';obj('package');assert p.evaluate('ALLY_ROOM_QA.state().step')==1;ok('No-drag object selection uses physical carry and placement')
  for w,h in [(390,844),(844,390),(320,568),(1280,720)]:
   p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(200);p.locator('#aq17-objects').click();box=p.locator('#aq17-access').bounding_box();assert box['x']>=0 and box['x']+box['width']<=w+1 and box['y']>=0 and box['y']+box['height']<=h+1,box;shot(f'objects-{w}');p.keyboard.press('Escape');assert p.locator('#aq-room-exit').is_visible()
  ok('Object chooser fits desktop and three small viewport configurations')
  p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(400);assert not p.evaluate("ALLY_DEBUG.getWorld().state.done.has('label1')");ok('Accessible object interaction cannot bypass checkpoint')
  # Advance final room only by its actual normal interaction targets. No forced completion.
  enter(4,'check');count=0
  while (r:=p.evaluate('ALLY_ROOM_QA.state()'))['goal'].get('key')!='live-incident':
   count+=1;assert count<25,r;s=r['goal'];obj(s['id']);
   if s['kind']=='move':obj(s['to'])
   elif s['kind']=='gesture':
    for _ in range(s['n']-1):obj(s['id'])
  assert p.locator('#aq17-urgent').is_visible();shot('emergency');step=p.evaluate('ALLY_ROOM_QA.state().step');p.locator('#aq17-urgent').focus();p.keyboard.press('Enter');p.wait_for_timeout(250);assert p.evaluate('ALLY_ROOM_QA.state().step')==step+1;assert not p.locator('#aq17-urgent').is_visible();ok('Immediate emergency button works from keyboard without investigation')
 except Exception as e:errors.append(repr(e));traceback.print_exc();shot('failure')
 finally:b.close()
(Q/'stage17-results.json').write_text(json.dumps({'passed':passed,'errors':errors},indent=2));print(json.dumps({'passed':passed,'errors':errors},indent=2));assert not errors
