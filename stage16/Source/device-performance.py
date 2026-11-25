"""Browser-emulated performance, not real mobile hardware. Test room and exterior per profile."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,statistics,hashlib
P=Path(__file__).parent;Q=P/'qa';Q.mkdir(exist_ok=True);F=P.parent/'Ally_Quest_Stage155.html';rows=[];errors=[]
profiles=[('desktop',1280,720,1,False,1),('mobile-portrait-emulated',390,844,2,True,4),('mobile-landscape-emulated',844,390,2,True,4)]
with sync_playwright() as w:
 b=w.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,width,height,dpr,touch,throttle in profiles:
  p=b.new_page(viewport={'width':width,'height':height},device_scale_factor=dpr,is_mobile=touch,has_touch=touch);p.on('pageerror',lambda e:errors.append(str(e)));p.evaluate('''()=>{for(const k of ['localStorage','sessionStorage']){const m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true}));}''');p.set_content(F.read_text(),wait_until='load');p.evaluate('ALLY_DEBUG.startLevel(1)');p.wait_for_timeout(350);cdp=p.context.new_cdp_session(p);cdp.send('Emulation.setCPUThrottlingRate',{'rate':throttle})
  def sample(scene):
   ds=p.evaluate('''()=>new Promise(resolve=>{const a=[];let prev;function tick(t){if(prev!==undefined)a.push(t-prev);prev=t;if(a.length>=90)resolve(a);else requestAnimationFrame(tick)}requestAnimationFrame(tick)})''');s=sorted(ds);row={'profile':name,'scene':scene,'dpr':dpr,'cpu_throttle':throttle,'frames':len(ds),'median_ms':round(statistics.median(ds),2),'p95_ms':round(s[85],2),'max_ms':round(max(ds),2),'over_50ms':sum(t>50 for t in ds)};rows.append(row);print(row,flush=True)
  sample('exterior');p.evaluate('''()=>{let w=ALLY_DEBUG.getWorld();w.state.cartDelivered=true;w.state.cartX=1040;const t=w.tasks.find(t=>t.id==='station1');ALLY_DEBUG.forcePosition(t.x-40,567)}''');p.wait_for_timeout(300);p.keyboard.press('KeyE');p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(700);sample('interior');p.close()
 b.close()
budgets={'desktop':{'median_ms':25,'p95_ms':50},'mobile':{'median_ms':83.4,'p95_ms':133.4}}
for row in rows:
 limits=budgets['desktop' if row['profile']=='desktop' else 'mobile'];row['guardrail_pass']=all(row[k]<=v for k,v in limits.items());
 if not row['guardrail_pass']:errors.append('Frame pacing regression guardrail exceeded: '+str(row))
(Q/'device-emulation.json').write_text(json.dumps({'sha256':hashlib.sha256(F.read_bytes()).hexdigest(),'physical_device':False,'provisional_ci_guardrails':budgets,'samples':rows,'errors':errors},indent=2));assert not errors
