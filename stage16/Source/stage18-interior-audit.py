"""Check all 20 rendered interiors have distinct architecture and nonblank screenshots."""
from pathlib import Path
from PIL import Image,ImageStat
import json
p=Path(__file__).parent/'qa'/'stage18'
rows=[]
for f in sorted(p.glob('*-pointer-architecture.json')):
 a=json.loads(f.read_text());im=Image.open(str(f).replace('-architecture.json','-room.png')).convert('RGB')
 assert max(ImageStat.Stat(im).stddev)>15,f
 assert a['fixtureCount']==len(a['layout']) and a['fixtureCount']>0,f
 # sample rear architecture excluding overlay controls, use a coarse quantized digest
 crop=im.crop((230,60,1180,300)).resize((64,16))
 signature=tuple(round(v/12) for pixel in crop.getdata() for v in pixel)
 rows.append((f.name,a,signature))
assert len(rows)==20,len(rows)
assert len({a['title'] for _,a,_ in rows})==20
assert len({a['kind'] for _,a,_ in rows})>=16
assert len({a['floor'] for _,a,_ in rows})>=5
assert len({s for _,_,s in rows})==20
assert len({tuple(tuple(q) for q in a['layout']) for _,a,_ in rows})>=10
(p/'interior-art-audit.json').write_text(json.dumps({'rooms':len(rows),'architectures':len({a['kind'] for _,a,_ in rows}),'floorTypes':sorted({a['floor'] for _,a,_ in rows}),'uniqueWallCaptures':len({s for _,_,s in rows}),'layouts':len({tuple(tuple(q) for q in a['layout']) for _,a,_ in rows}),'scope':'rendered screenshot uniqueness and architecture coverage, not a human aesthetic rating'},indent=2))
print((p/'interior-art-audit.json').read_text())
