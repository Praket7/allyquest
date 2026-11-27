"""Reproducible Stage 19 build derived from the verified 25-level build.
The original Stage 18 artifact and its CI remain independent.
"""
from pathlib import Path
import json,sys,subprocess,hashlib,gzip,tempfile
P=Path(__file__).resolve().parent
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else P.parent/'Ally_Quest_300.html'
with tempfile.TemporaryDirectory() as d:
 base=Path(d)/'stage18.html'
 subprocess.run([sys.executable,str(P/'build-stage18.py'),str(base)],check=True)
 subprocess.run([sys.executable,str(P/'stage19-campaign.py'),str(P/'welcome-street-25.json'),str(P/'ally-quest-300.json')],check=True)
 subprocess.run(['node',str(P/'stage19-tests.cjs')],check=True)
 s=base.read_text();pack=json.loads((P/'ally-quest-300.json').read_text())
 a=s.index('const compiledPack=');b=s.index(';\nconst checkedPack=',a);s=s[:a]+'const compiledPack='+json.dumps(pack,ensure_ascii=True,separators=(',',':'))+s[b:]
 def patch(old,new):
  global s
  assert s.count(old)==1,(old[:120],s.count(old));s=s.replace(old,new,1)
 # Store the generated art in one compressed source asset or ordered binary parts.
 art=P/'stage19-art.js'
 if art.exists():asset=art.read_bytes()
 else:
  gz=P/'stage19-art.js.gz'
  zipped=gz.read_bytes() if gz.exists() else b''.join(x.read_bytes() for x in sorted((P/'stage19-art.js.gz.parts').iterdir()) if x.is_file())
  asset=gzip.decompress(zipped)
 assert hashlib.sha256(asset).hexdigest()==(P/'stage19-art.sha256').read_text().strip(),'Generated world asset checksum mismatch'
 i=s.index('<script>(()=>{\'use strict\';\nconst $=s=>document.querySelector(s)');s=s[:i]+'<script>'+asset.decode('utf-8')+'</script>\n'+s[i:]
 patch('const roomArt=()=>sceneProfiles[room?.task.id];',"for(const [id,base] of Object.entries(compiledPack.roomTemplates||{})){const a=sceneProfiles[base];if(a)sceneProfiles[id]=[...a.slice(0,6),compiledPack.rooms[id].meta[0].toUpperCase()];}\nconst roomArt=()=>sceneProfiles[room?.task.id];")
 patch('setup();\n})();',(P/'stage19-runtime.js').read_text()+'\nsetup();\n})();')
 patch("world.id!=='emergency-rehearsal'&&timeElapsed<=190","!compiledPack.rooms[world.id]?.education?.emergency&&timeElapsed<=190")
 patch("world.id==='emergency-rehearsal'?' · Practice only — no time score'","compiledPack.rooms[world.id]?.education?.emergency?' · Practice only — no time score'")
 s=s.replace('25 adventures. One big celebration. Every friend belongs.','12 worlds. 300 adventures. Every friend belongs.').replace('25 adventures.','300 adventures.').replace('/31 notes','/306 notes').replace('/31 charms','/306 charms')
 out.write_text(s);print(out,hashlib.sha256(out.read_bytes()).hexdigest())
