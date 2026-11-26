from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
P=Path(__file__).parent;Q=P/'qa';Q.mkdir(exist_ok=True);errors=[]
with sync_playwright() as w:
 b=w.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox']);p=b.new_page(viewport={'width':1280,'height':900},accept_downloads=True);p.on('pageerror',lambda e:errors.append(str(e)));p.set_content((P/'device-profiler.html').read_text().replace(' src="Ally_Quest_Stage16_Complete.html"',''));p.locator('#game').evaluate('(el,html)=>el.srcdoc=html',(P.parent/'Ally_Quest_Stage155.html').read_text());f=p.frame_locator('#game');f.locator('#home-play').click();p.locator('#device').fill('Local Chromium harness only');p.locator('#start').click();p.wait_for_timeout(300);p.keyboard.down('ArrowRight');p.wait_for_timeout(500);p.keyboard.up('ArrowRight');p.wait_for_function('()=>!document.querySelector("#download").disabled',timeout=40000)
 with p.expect_download() as d:p.locator('#download').click()
 q=Q/'profiler-export-test.json';d.value.save_as(q);r=json.loads(q.read_text());assert r['frames']['count']>100 and r['input_to_next_raf']['count']>0 and not r['visibility_interrupted'] and not errors,(r['frames'],r['input_to_next_raf'],errors);print('PASS recorder export',r['frames'],r['input_to_next_raf'],flush=True);b.close()
