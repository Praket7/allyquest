from playwright.sync_api import sync_playwright
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parents[1]
h=(root/'Ally_Quest_Stage_3_Standalone.html').read_text()
needle="this.world = mode === 'side' ? new SideWorld() : new TopWorld();"
assert needle in h
h=h.replace(needle,needle+'window.__allyHost=this;window.__allyWorld=this.world;',1)
report=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security','--disable-dev-shm-usage'])
 for label,width,height in [('desktop',1728,888),('mobile',390,844),('laptop',1366,768)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.set_default_timeout(9000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(h,wait_until='load',timeout=65000)
  page.locator('#nav-play').click(force=True)
  assert page.locator('.aq-tutorial-start').is_visible()
  page.locator('.aq-tutorial-start').click(force=True)
  page.wait_for_timeout(600)
  page.evaluate('''()=>{const host=window.__allyHost,w=window.__allyWorld;w.player.x=1185;w.player.y=565;w.player.vx=0;w.player.vy=0;w.grounded=true;host.renderer.camera(w,0)}''')
  page.wait_for_timeout(650)
  prompt=page.locator('#aq-comic');assert prompt.is_visible(),f'{label} prompt invisible'
  assert 'Talk to Maya' in prompt.inner_text()
  assert not 'Maya' in page.locator('#aq-hint').inner_text()
  page.screenshot(path=str(Path('/mnt/data')/f'Ally_Quest_Stage8_{label}_Maya_Prompt.png'))
  page.keyboard.press('e')
  page.wait_for_timeout(340)
  assert page.locator('#aq-comic').is_visible(),f'{label} dialogue missing'
  assert 'golden thread' in page.locator('.aq-comic-text').inner_text().lower(),f'{label} wrong dialogue: '+page.locator('.aq-comic-text').inner_text()
  assert not page.locator('#aq-screen-overlay').is_visible()
  assert page.locator('#aq-hint').inner_text()==''
  page.screenshot(path=str(Path('/mnt/data')/f'Ally_Quest_Stage8_{label}_Maya_Dialogue.png'))
  page.locator('.aq-comic-primary').click(force=True)
  assert page.locator('.aq-comic-button').count()==2, 'No branching choice'
  page.locator('.aq-comic-button').nth(1).click(force=True)
  assert 'trusted adult' in page.locator('.aq-comic-text').inner_text(), 'Choice response missing'
  page.locator('.aq-comic-primary').click(force=True)
  page.locator('.aq-comic-primary').click(force=True)
  assert not page.locator('#aq-comic').get_attribute('class').endswith('aq-comic-open'), 'Conversation stuck'
  print('after-chat',label,page.evaluate('({state:window.__allyHost.quest.snapshot,paused:window.__allyHost.paused,comic:window.__allyHost.comic.dialogOpen})'),page.locator('#aq-quest-objective').inner_text(),flush=True)
  assert 'Follow the golden' in page.locator('#aq-quest-objective').inner_text(), 'Quest not advanced'
  # Pick up an optional discovery and trigger story progression from actual simulation updates.
  for x,y in [(1550,420),(1940,565),(2300,565),(2917,565)]:
   page.evaluate('''({x,y})=>{const h=window.__allyHost,w=window.__allyWorld;w.player.x=x;w.player.y=y;w.player.vx=0;w.player.vy=0;w.grounded=true;h.renderer.camera(w,0)}''',{'x':x,'y':y});page.wait_for_timeout(170)
  print('Quest trace',label,page.evaluate('({state:window.__allyHost.quest.snapshot,x:window.__allyWorld.player.x,completed:window.__allyWorld.stats.finished,paused:window.__allyHost.paused})'),page.locator('#aq-quest-objective').inner_text(),flush=True)
  assert 'Bring the banner' in page.locator('#aq-quest-objective').inner_text(), 'Banner objective missing'
  assert page.evaluate('window.__allyHost.quest.snapshot.bannerFound') is True, 'Banner not collected'
  page.screenshot(path=str(Path('/mnt/data')/f'Ally_Quest_Stage8_{label}_Banner_Found.png'))
  page.evaluate('''()=>{const w=window.__allyWorld;w.player.x=3084;w.player.y=565;w.player.vx=250;w.player.vy=0;w.grounded=true}''')
  page.wait_for_timeout(520)
  finished=page.get_by_text('Banner delivered!').is_visible()
  # screen can be paused from test? report
  if not finished: print('finish not visible',label,page.locator('.aq-screen-card').inner_text(),flush=True)
  assert finished,'Finish result not shown'
  page.screenshot(path=str(Path('/mnt/data')/f'Ally_Quest_Stage8_{label}_Celebration.png'))
  item={'device':label,'viewport':[width,height],'conversation':True,'choice':True,'objective':True,'banner':True,'finish':finished,'errors':errors,'stats':page.evaluate('window.__allyHost.quest.snapshot')}
  assert not errors,errors
  print('PASS',item,flush=True);report.append(item)
  page.close()
 browser.close()
(Path('/mnt/data')/'Ally_Quest_Stage8_Browser_QA.json').write_text(json.dumps(report,indent=2))
