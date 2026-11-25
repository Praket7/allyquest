"""Compare every existing exterior/interior at three viewport sizes; fixed seed + reduced motion.
Screenshots are captured from real Chromium; direct QA positioning is solely for scene coverage."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageChops,ImageStat
import json,os,sys,hashlib,traceback
from concurrent.futures import ProcessPoolExecutor
P=Path(__file__).resolve().parent;Q=P/'qa'/'visual';Q.mkdir(parents=True,exist_ok=True)
BASE=Path(sys.argv[1]).resolve();CAND=P.parent/'Ally_Quest_Stage155.html'
ROOMS={1:['station1','station2','station3'],2:['label1','label2','label3'],3:['crafts','music'],4:['welcome','game','check']}
PROFILES=[('desktop',1280,720,False),('portrait',390,844,False),('landscape',844,390,False),('touch-portrait',390,844,True),('touch-landscape',844,390,True)]
INIT='''()=>{for(const k of ['localStorage','sessionStorage']){const m=new Map();Object.defineProperty(window,k,{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}let seed=19274;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);window.__ALLY_ENABLE_QA=true;localStorage.setItem('allyquest.five.preferences.v1',JSON.stringify({mute:true,reducedMotion:true}));}'''
def run(profile):
 name,width,height,touch=profile;errors=[];scenes=[];root=Q/name;root.mkdir(exist_ok=True)
 for old in root.glob("*.png"):old.unlink()
 with sync_playwright() as w:
  b=w.chromium.launch(executable_path=os.environ.get('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);
  for tag,f in [('base',BASE),('candidate',CAND)]:
   p=b.new_page(viewport={'width':width,'height':height},device_scale_factor=2 if touch else 1,is_mobile=touch,has_touch=touch,reduced_motion='reduce');p.on('pageerror',lambda e:errors.append(tag+': '+str(e)));p.set_default_timeout(12000);p.evaluate(INIT);p.set_content(f.read_text(),wait_until='load');p.wait_for_timeout(250)
   def shot(id):
    path=root/(tag+'-'+id+'.png');p.screenshot(path=str(path),animations='disabled',scale='css');a=Image.open(path).convert('RGB');assert max(ImageStat.Stat(a).stddev)>10,(tag,id,'blank image')
   try:
    shot('home');p.locator('#home-map').click();p.wait_for_timeout(150);shot('map');
    for lvl in range(5):
     p.evaluate('n=>ALLY_DEBUG.startLevel(n)',lvl);p.wait_for_timeout(180);p.evaluate('()=>{ALLY_DEBUG.forcePosition(150,567);ALLY_DEBUG.frame(0)}');p.wait_for_timeout(100);shot('exterior-'+str(lvl+1))
     for rid in ROOMS.get(lvl,[]):
      p.evaluate('''id=>{const w=ALLY_DEBUG.getWorld();const t=w.tasks.find(t=>t.id===id);for(const q of w.tasks)if(q.x<t.x)w.state.done.add(q.id);if(id==='station1'){w.state.cartDelivered=true;w.state.cartX=1040}if(id.startsWith('label'))w.state.done.add('magnifier');ALLY_DEBUG.forcePosition(t.x-40,567);ALLY_DEBUG.frame(0)}''',rid);p.wait_for_timeout(120);p.keyboard.press('KeyE');
      try:p.wait_for_function('()=>!!ALLY_ROOM_QA.state()',timeout=1800)
      except Exception:
       d=p.evaluate('id=>ALLY_ROOM_QA.door(id)',rid);p.mouse.click(d['x'],d['y']);
      p.wait_for_function('()=>!!ALLY_ROOM_QA.state()');p.wait_for_timeout(250);assert p.evaluate('ALLY_ROOM_QA.state().task')==rid;assert p.locator('#aq-room-exit').is_visible();assert p.locator('#aq-room-goal').is_visible();shot(rid);p.locator('#aq-room-exit').click();p.wait_for_function('()=>!ALLY_ROOM_QA.state()');p.wait_for_timeout(100)
   except Exception as e:errors.append(f'{tag}: {e!r}');traceback.print_exc()
   p.close()
  b.close()
 for a in sorted(root.glob('base-*.png')):
  sid=a.stem[5:];bp=root/('candidate-'+sid+'.png');
  if not bp.exists():errors.append('missing candidate '+sid);continue
  x=Image.open(a).convert('RGB');y=Image.open(bp).convert('RGB');d=ImageChops.difference(x,y);m=ImageChops.lighter(ImageChops.lighter(d.getchannel('R'),d.getchannel('G')),d.getchannel('B'));h=m.histogram();frac=sum(h[26:])/(width*height);mean=ImageStat.Stat(d).mean;status=frac<=.08 and sum(mean)/3<=4.0
  if not status:d.point(lambda v:min(255,v*4)).save(root/('diff-'+sid+'.png'));errors.append(f'{sid}: perceptible changed pixels {frac:.2%}, mean {sum(mean)/3:.2f}')
  scenes.append({'scene':sid,'pixels_delta_gt25_fraction':round(frac,6),'mean_abs_rgb_delta':round(sum(mean)/3,4),'pass':status})
 if len(scenes)!=18:errors.append(f'expected 18 pairs, got {len(scenes)}')
 print(name,len(scenes),'pairs',len(errors),'errors',flush=True);return {'profile':name,'viewport':[width,height],'touch_emulated':touch,'scenes':scenes,'errors':errors}
if __name__=='__main__':
 with ProcessPoolExecutor(max_workers=2) as pool:rows=list(pool.map(run,PROFILES))
 result={'baseline_sha256':hashlib.sha256(BASE.read_bytes()).hexdigest(),'candidate_sha256':hashlib.sha256(CAND.read_bytes()).hexdigest(),'threshold':{'pixel_delta_gt25_fraction_max':.08,'mean_abs_rgb_max':4},'profiles':rows};(Q/'report.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2));assert not any(r['errors'] for r in rows)
