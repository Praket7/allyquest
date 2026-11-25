"""Production file:// boot and native storage; run on an unrestricted browser runner."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import hashlib, json, os
P=Path(__file__).resolve().parent
H=P.parent/'Ally_Quest_Stage155.html'
Q=P/'qa';Q.mkdir(exist_ok=True)
passed=[];errors=[];requests=[]
def ok(name):
    passed.append(name);print('PASS '+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('AQ_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1280,'height':720})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(r.url))
    page.set_default_timeout(15000)
    try:
        page.goto(H.as_uri(),wait_until='load')
        assert page.locator('#home-play').is_visible()
        assert page.evaluate('typeof ALLY_DEBUG === "undefined" && typeof ALLY_ROOM_QA === "undefined"')
        ok('Exact standalone file opens without QA APIs or storage stubs')
        page.locator('#aq17-guide-home').focus();page.keyboard.press('Enter')
        page.keyboard.press('Tab');page.keyboard.press('Enter')
        assert page.evaluate('document.activeElement.id')=='aq17-title'
        page.keyboard.press('Tab');page.keyboard.press('Tab');page.keyboard.press('Enter')
        before=page.evaluate("localStorage.getItem('allyquest.stage17.study.v1')")
        assert len(json.loads(before)['pre'])==1
        page.reload(wait_until='load')
        assert page.evaluate("localStorage.getItem('allyquest.stage17.study.v1')")==before
        page.locator('#aq17-guide-home').click()
        assert 'Before playing · 1/6' in page.locator('#aq17-notebook').inner_text()
        ok('Native learning storage survives a real file reload and resumes progress')
        page.get_by_role('button',name='Local results & privacy').click()
        page.get_by_role('button',name='Delete local learning results').click()
        page.get_by_role('button',name='Delete',exact=True).click()
        page.reload(wait_until='load')
        assert page.evaluate("localStorage.getItem('allyquest.stage17.study.v1')===null")
        ok('Native deletion persists after a real file reload')
        page.locator('#home-play').click();page.wait_for_timeout(400)
        assert page.locator('#hud').is_visible()
        page.keyboard.down('ArrowRight');page.wait_for_timeout(350);page.keyboard.up('ArrowRight')
        assert not errors,errors
        assert not [u for u in requests if u.startswith(('https:','http:'))],requests
        ok('Production gameplay starts with no page errors or network requests')
    except Exception as e:
        errors.append(repr(e));raise
    finally:
        browser.close()
        (Q/'stage17-native-results.json').write_text(json.dumps({'sha256':hashlib.sha256(H.read_bytes()).hexdigest(),'passed':passed,'errors':errors},indent=2))
