from pathlib import Path
from playwright.sync_api import sync_playwright
import os,json,hashlib,sys
P=Path(__file__).resolve().parent;H=Path(os.getenv('AQ_STAGE19_HTML',str(P/'Ally_Quest_Stage19.html' if (P/'Ally_Quest_Stage19.html').exists() else P.parent/'Ally_Quest_300.html')));PACK=json.loads(Path(os.getenv('AQ_STAGE19_PACK',str(P/'ally-quest-300.json'))).read_text());Q=P/'qa-stage19';Q.mkdir(exist_ok=True)
passed=[];errors=[];network=[]
def ok(s):passed.append(s);print('PASS',s,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720},reduced_motion='reduce');p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:network.append(r.url));p.set_default_timeout(12000)
 init='''()=>{for(const k of ['localStorage','sessionStorage']){let m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:true}));}'''
 p.evaluate(init);p.set_content(H.read_text(),wait_until='load',timeout=60000);p.wait_for_function('()=>typeof ALLY_STAGE19_QA!=="undefined"');p.wait_for_function('()=>Object.entries(ALLY_ILLUSTRATIONS).filter(([k])=>k.startsWith("w19-")).every(([k,im])=>im.complete&&im.naturalWidth>0)',timeout=20000)
 assert p.evaluate('ALLY_DEBUG.getLevels().length')==300;assert p.evaluate('ALLY_STAGE19_QA.worlds().length')==12;ok('All 300 adventures and generated world/character assets boot')
 p.locator('#home-map').click();assert p.locator('[data-world19]').count()==12;p.screenshot(path=str(Q/'world-map-desktop.png'))
 seen=set()
 for w in PACK['worlds']:
  p.locator('[data-world19="'+w['id']+'"]').click();assert p.locator('[data-chapter19]').count()==5
  for i in range(5):
   p.locator(f'[data-chapter19="{i}"]').click();cards=p.locator('[data-adventure19]');assert cards.count()==5;seen.update(cards.evaluate_all('(els)=>els.map(x=>x.dataset.adventure19)'))
   for j in range(5):assert cards.nth(j).locator('button').is_enabled()==(w['start']+i*5+j==0)
  p.locator('#aq19-back-worlds').click()
 assert len(seen)==300;ok('All 300 adventure cards navigable; locked previews never unlock them')
 for w,h in [(320,568),(390,844),(844,390),(1280,720)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(150);assert p.locator('[data-world19]').count()==12;assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');p.screenshot(path=str(Q/f'world-map-{w}x{h}.png'))
  p.locator('[data-world19="maplewood"]').click();assert p.locator('[data-chapter19]').count()==5;assert p.locator('#aq19-back-worlds').is_visible();assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');p.screenshot(path=str(Q/f'world-preview-{w}x{h}.png'));p.locator('#aq19-back-worlds').click()
 ok('World map and chapter navigation fit four desktop/mobile viewport configurations')
 p.locator('#map-crew').click();assert p.locator('[data-select]').count()==15
 p.locator('[data-select="w19-maplewood"]').click();assert p.locator('[data-select="w19-maplewood"]').get_attribute('aria-pressed')=='true';p.screenshot(path=str(Q/'crew-15.png'));p.locator('[data-done]').click()
 p.evaluate('ALLY_DEBUG.startLevel(25)');assert p.evaluate('ALLY_STAGE19_QA.hero()')=='w19-maplewood';p.wait_for_timeout(250);p.keyboard.down('ArrowRight');p.wait_for_timeout(250);p.keyboard.up('ArrowRight');assert p.evaluate('ALLY_DEBUG.getState().x')>95;ok('New hero selectable, saved and playable with normal movement')
 p.evaluate('ALLY_DEBUG.startLevel(26)');assert p.evaluate('ALLY_STAGE19_QA.hero()')=='w19-maplewood';ok('New hero survives level transitions')
 # A true Stage 18 save can contain all 25 completion records and unlocked=25.
 p2=b.new_page(viewport={'width':1280,'height':720});p2.on('pageerror',lambda e:errors.append(str(e)));p2.evaluate(init);old={'unlocked':25,'selected':'ari','totalStars':125,'completed':{l['id']:{'complete':True,'stars':5} for l in PACK['levels'][:25]}};p2.evaluate('x=>localStorage.setItem("allyquest.welcome.five.v1",JSON.stringify(x))',old);p2.set_content(H.read_text(),wait_until='load',timeout=60000);p2.locator('#home-map').click();p2.locator('[data-world19="maplewood"]').click();assert p2.locator('[data-adventure19]').first.locator('button').is_enabled();assert not p2.locator('[data-adventure19]').nth(1).locator('button').is_enabled();assert p2.evaluate('ALLY_STAGE19_QA.worlds()[0].done')==25;p2.locator('#aq19-back-worlds').click();p2.locator('#aq19-scrapbook').click();assert p2.locator('.aq-note-card').count()==31;ok('Stage 18 save migrates to the first new adventure and retains original progress and scrapbook')
 p2.locator('[data-scrap-close]').click();p2.locator('#map-back').click();p2.locator('#home-play').click();assert p2.evaluate('ALLY_DEBUG.getState().level')==25;ok('Continue opens the next uncompleted adventure')
 assert not errors,errors;assert not [x for x in network if x.startswith(('http:','https:'))],network;ok('No runtime page errors or external network requests')
 b.close()
report={'sha256':hashlib.sha256(H.read_bytes()).hexdigest(),'passed':passed,'errors':errors};(Q/'map-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
