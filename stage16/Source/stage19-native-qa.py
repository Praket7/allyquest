"""Run only where real file:// navigation is available. No QA flags or storage stubs."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,hashlib
P=Path(__file__).resolve().parent;H=Path(os.getenv('AQ_STAGE19_HTML',str(P.parent/'Ally_Quest_300.html')));PACK=json.loads((P/'ally-quest-300.json').read_text());Q=P/'qa-stage19';Q.mkdir(exist_ok=True);passed=[];errors=[];network=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720});p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:network.append(r.url));p.set_default_timeout(15000)
 p.goto(H.as_uri(),wait_until='load',timeout=60000);assert p.locator('#home-play').is_visible();assert p.evaluate('typeof ALLY_DEBUG==="undefined"&&typeof ALLY_ROOM_QA==="undefined"&&typeof ALLY_STAGE19_QA==="undefined"');passed.append('Offline standalone boots without QA hooks')
 old={'unlocked':25,'selected':'ari','totalStars':125,'completed':{l['id']:{'complete':True,'stars':5} for l in PACK['levels'][:25]}};p.evaluate('x=>localStorage.setItem("allyquest.welcome.five.v1",JSON.stringify(x))',old);p.reload(wait_until='load',timeout=60000);assert p.evaluate('JSON.parse(localStorage.getItem("allyquest.welcome.five.v1")).unlocked')==26;passed.append('Native Stage 18 save migration persists')
 p.locator('#home-crew').click();p.locator('[data-select="w19-arts-quarter"]').click();p.locator('[data-done]').click();p.reload(wait_until='load',timeout=60000);assert p.evaluate('JSON.parse(localStorage.getItem("allyquest.welcome.five.v1")).selected')=='w19-arts-quarter';p.locator('#home-play').click();assert 'WORLD 2' in p.locator('#hud-number').inner_text();assert p.locator('#hud-level').inner_text()==PACK['levels'][25]['name'];passed.append('New playable character selection survives reload; Continue resumes Maplewood')
 assert not errors,errors;assert not [u for u in network if u.startswith(('https:','http:'))],network;passed.append('No external network requests or browser errors');b.close()
(Q/'native-results.json').write_text(json.dumps({'sha256':hashlib.sha256(H.read_bytes()).hexdigest(),'passed':passed,'errors':errors},indent=2));print(passed)
