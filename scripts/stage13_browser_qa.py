from pathlib import Path
from playwright.sync_api import sync_playwright
import json, sys
html=Path(sys.argv[1]).read_text().replace('<script>window.ALLY_ASSETS=','<script>window.__ALLY_ENABLE_QA=true;</script><script>window.ALLY_ASSETS=',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,args=['--no-sandbox'])
 for w,h in [(1440,900),(390,844),(844,390),(320,568)]:
  page=b.new_page(viewport={'width':w,'height':h},has_touch=w<900)
  err=[];page.on('pageerror',lambda e:err.append(str(e)))
  page.set_content(html,wait_until='load',timeout=30000)
  page.locator('#home-crew').click();page.locator('[data-select="ari"]').click();page.locator('[data-done]').click();page.locator('#home-play').click();page.locator('#training-dismiss').click()
  page.locator('#scene').click(position={'x':10,'y':h//2});page.keyboard.down('ArrowRight');page.wait_for_timeout(180);page.keyboard.up('ArrowRight');page.keyboard.down('Space');page.wait_for_timeout(100)
  assert page.evaluate('ALLY_DEBUG.getActor().vy')<0,(w,'keyboard jump')
  page.keyboard.up('Space');page.wait_for_timeout(600)
  page.locator('#settings-button').click();page.keyboard.press('Escape');assert page.locator('#overlay').is_hidden()
  page.locator('#pause-button').click();page.locator('[data-resume]').click()
  physics=[]
  for who in ['ethan','maya','leo','ari']:
   page.evaluate('ALLY_DEBUG.startLevel(0)');page.locator('#pause-button').click();page.locator('[data-map]').click();page.locator('#map-crew').click();page.locator(f'[data-select="{who}"]').click();page.locator('[data-done]').click();page.locator('.map-play').first.click()
   sample=page.evaluate("""()=>{const a=ALLY_DEBUG,p=a.getActor(),poses=[];for(let i=0;i<12;i++){a.tick(1/60,{right:true});poses.push(a.getPose())}const start=p.y;let min=p.y;for(let i=0;i<100;i++){a.tick(1/60,{jump:i<30,jumpTap:i===0});min=Math.min(min,p.y);poses.push(a.getPose())}return {name:a.getState().selected,apex:Math.round(start-min),grounded:p.grounded,poses:[...new Set(poses)]}}""")
   assert sample['name']==who and sample['grounded'] and 5 in sample['poses'] and 6 in sample['poses'],sample
   physics.append(sample)
  assert len({x['apex'] for x in physics})==1,physics
  page.evaluate('ALLY_DEBUG.forcePosition(420)');page.wait_for_timeout(150);page.keyboard.press('e');page.wait_for_timeout(100)
  assert page.locator('#comic').is_visible(),(w,'comic did not open')
  q=page.locator('#comic').bounding_box();assert q['x']>=0 and q['y']>=0 and q['x']+q['width']<=w+1 and q['y']+q['height']<=h+1,(w,q)
  assert not err,err
  print(json.dumps({'viewport':[w,h],'physics':physics,'errors':err}),flush=True)
  page.close()
 b.close()
