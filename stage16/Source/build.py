from pathlib import Path
import re,hashlib,json,sys,subprocess
p=Path(__file__).parent
base=p/'base'/'template.html'
# Large image-bearing JavaScript may be checked in as ordered binary chunks.
# Verify the reconstructed bytes before decoding; local unsplit assets are equivalent.
ASSET_SHA={'base/assets.js':'39d91c1cf707a671f7990fe177d63e44d1f5b78febc4c1d4c84b5848126a1fef','room-assets.js':'5a7fc6ddc667b9a155faec3c6bc0683acb34d3dd5a8fb495d9899c09317ba8c2'}
def read_source(path):
 rel=path.relative_to(p).as_posix()
 if rel not in ASSET_SHA:return path.read_text()
 if path.exists():b=path.read_bytes()
 else:b=b''.join(x.read_bytes() for x in sorted(path.with_name(path.name+'.parts').iterdir()) if x.is_file())
 assert hashlib.sha256(b).hexdigest()==ASSET_SHA[rel],f'Asset checksum mismatch: {rel}'
 return b.decode('utf-8')
s=re.sub(r'<!--AQ_INLINE:([\w.-]+)-->',lambda m:read_source(p/'base'/m.group(1)),base.read_text());scripts=list(re.finditer(r'<script[^>]*>(.*?)</script>',s,re.S));assert len(scripts)==5
js=scripts[-1].group(1)
pack=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else p/'content.json'
subprocess.run(['node',str(p/'validate-content.cjs'),str(pack)],check=True)
content=json.loads(pack.read_text())
core=(p/'graph-engine.js').read_text()+'\n'+(p/'content-engine.js').read_text()+'\n'+(p/'runtime-content.js').read_text().replace('__AQ_PACK__',json.dumps(content,ensure_ascii=True,separators=(',',':')))

def patch(a,b):
 global js
 assert js.count(a)==1,(a[:120],js.count(a));js=js.replace(a,b,1)
patch('openActivity(task);return;','if(isDoor(task)){openTaskRoom(task);return}openActivity(task);return;')
patch('const remaining=world.tasks.filter(x=>!world.state.done.has(x.id)&&x.kind!==\'pickup\');','gateLimit();const remaining=world.tasks.filter(x=>!world.state.done.has(x.id)&&x.kind!==\'pickup\');')
patch("else kit.taskObject(ctx,task,world,cam,timeElapsed);","else if(!isDoor(task))kit.taskObject(ctx,task,world,cam,timeElapsed);")
patch('drawBackground();drawDecor();drawGround();','drawBackground();drawDecor();drawTaskBuildings();drawGround();')
patch('drawStarsAndTasks();drawFinish();','drawStarsAndTasks();drawGates();drawFinish();')
patch("if(gameMode==='playing'&&!qaManual){advanceFrame(dt);","if(gameMode==='room'){roomFrame(now,dt);return}if(gameMode==='playing'&&!qaManual){advanceFrame(dt);")
patch("function setup(){resize();","function setup(){resize();c.addEventListener('click',e=>{if(gameMode!=='playing'||paused||dialog||roomBusy||loadedLevel===0)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/scale+cam,y=(e.clientY-r.top)/scale-verticalPad;const t=world.tasks.find(t=>isDoor(t)&&Math.abs(t.x-x)<48&&y>417&&y<574&&!world.state.done.has(t.id));if(t){if(Math.abs(player.x-t.x)<140&&Math.abs(player.y-567)<120)interactTask(t);else setPrompt('Walk closer to the door to enter.',2)}});for(const l of LEVELS)if(l!==LEVELS[0])for(const t of l.tasks)if(t.kind==='choice'&&ROOM_META[t.id])t.prompt='E · Enter '+ROOM_META[t.id][0];")
patch('Math.min(5,loadedLevel+2)','Math.min(LEVELS.length,loadedLevel+2)')
if content.get('archetypes') and len(content['levels'])>6:
 js=js.replace("ASSET_URLS[l.scene]||","ASSET_URLS[l.backdrop||l.scene]||").replace("art[world.scene+'_play']||art[world.scene]","art[world.backdrop]||art[world.scene+'_play']||art[world.scene]").replace("if(world.scene==='garden'||world.scene==='celebration'){\n    ctx.drawImage","if(!world.backdrop&&(world.scene==='garden'||world.scene==='celebration')){\n    ctx.drawImage").replace("+' / 5 adventures completed'","+' / '+LEVELS.length+' adventures completed'").replace('Object.keys(progress.completed).length/5*100','Object.keys(progress.completed).length/LEVELS.length*100')
 js=js.replace("if(timeElapsed<=190)badges.push('Swift Ally')","if(world.id!=='emergency-rehearsal'&&timeElapsed<=190)badges.push('Swift Ally')").replace(" · Best ${Math.round(progress.completed[world.id].bestTime)}s","${world.id==='emergency-rehearsal'?' · Practice only — no time score':' · Best '+Math.round(progress.completed[world.id].bestTime)+'s'}")
js=js.replace('loadedLevel<4','loadedLevel<LEVELS.length-1').replace('LEVEL ${index+1} / 5','LEVEL ${index+1} / ${LEVELS.length}').replace('level=n%5','level=n%LEVELS.length')
patch('setup();\n})();', (p/'rooms.js').read_text()+'\n'+(p/'spatial.js').read_text()+'\n'+(p/'materials.js').read_text()+'\n'+(p/'realism.js').read_text()+'\n'+(p/'learning.js').read_text()+'\n'+(p/'immersion.js').read_text()+'\n'+(p/'polish.js').read_text()+'\n'+(p/'allergy.js').read_text()+'\n'+(p/'simulation.js').read_text()+'\n'+(p/'autonomy.js').read_text()+'\n'+core+'\n'+(p/'graph-runtime.js').read_text()+'\n'+(p/'render-performance.js').read_text()+'\n'+(p/'stage17-learning.js').read_text()+'\n'+(p/'stage17-ui.js').read_text()+(('\n'+(p/'stage18-runtime.js').read_text()+'\n'+(p/'stage18-interiors.js').read_text().replace('/*__ROOM_SPECIFIC_FURNITURE__*/',(p/'stage18-furniture.js').read_text())) if len(content['levels'])>6 else '')+'\nsetup();\n})();')
s=s[:scripts[-1].start(1)]+js+s[scripts[-1].end(1):]
# asset append immediately after original asset script, before the game initializes
m=re.search(r'</script>',s);s=s[:m.end()]+'\n<script>'+ read_source(p/'room-assets.js')+'\n'+(p/'motion-assets.js').read_text()+'</script>'+s[m.end():]
if len(content['levels'])>6:
 m=re.search(r'</script>',s);s=s[:m.end()]+'\n<script>'+(p/'stage18-art.js').read_text()+'</script>'+s[m.end():]
 s=s.replace('Five different adventures.','25 adventures.').replace('Five level progression','Welcome Street progression').replace('/11 notes','/'+str(len(content['rooms']))+' notes').replace('/11 charms','/'+str(len(content['rooms']))+' charms')
 s=s.replace('</head>','<style>'+(p/'stage18.css').read_text()+'</style></head>',1)
s=s.replace('</head>','<style>'+ (p/'rooms.css').read_text()+'\n'+(p/'immersion.css').read_text()+'\n'+(p/'polish.css').read_text()+'\n'+(p/'stage17.css').read_text()+'</style></head>',1)
s=s.replace('Ally Quest — Welcome Street · Stage 14','Ally Quest — Welcome Street · The Festival of Friends',1)
out=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else p.parent/'Ally_Quest_Stage155.html';
if content.get('demo'):
 s=s.replace('allyquest.welcome.five.v1','allyquest.stage16.demo.v1').replace('allyquest.festival.v155','allyquest.stage16.demo.festival.v1').replace('Five different adventures.','Content Studio demonstration adventures.')
 s=s.replace('setup();\n})();','progress.unlocked=LEVELS.length;\nsetup();\n})();',1).replace("+' / 5 adventures completed'","+' / '+LEVELS.length+' adventures completed'").replace('Object.keys(progress.completed).length/5*100','Object.keys(progress.completed).length/LEVELS.length*100')
out.write_text(s);print(out,hashlib.sha256(s.encode()).hexdigest())
