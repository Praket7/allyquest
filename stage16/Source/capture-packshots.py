"""Explicit asset acquisition only; never called by the offline game.
Manufacturer/retailer reference packshots, not proof of actual batch or current labels.
Review usage rights before public distribution. No credentials required."""
import urllib.request, io, json, hashlib, base64
from pathlib import Path
from PIL import Image, ImageChops
P=Path(__file__).resolve().parent
S=json.loads((P/'stage19-packshot-sources.json').read_text())
out=P/'packshot-capture';out.mkdir(exist_ok=True)
records={};errors={}
for key,(url,page) in S.items():
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'AllyQuest educational prototype asset review/1.0'})
  with urllib.request.urlopen(req,timeout=25) as r: raw=r.read(8000000)
  im=Image.open(io.BytesIO(raw)).convert('RGBA')
  assert im.width>=200 and im.height>=200
  # Preserve original product pixels and any existing alpha, no invented label.
  im.thumbnail((600,720),Image.Resampling.LANCZOS)
  if im.getextrema()[3][0]<255:
   im=im.crop(im.getchannel('A').getbbox())
  b=io.BytesIO();im.save(b,'WEBP',quality=88,method=6);data=b.getvalue()
  (out/(key+'.webp')).write_bytes(data)
  records[key]={'src':'data:image/webp;base64,'+base64.b64encode(data).decode(),'source':page,'image':url,'originalSha256':hashlib.sha256(raw).hexdigest(),'sha256':hashlib.sha256(data).hexdigest(),'referenceOnly':True}
 except Exception as e:errors[key]=str(e)
(out/'stage19-retail-packshots.js').write_text('const AQ_RETAIL_PACKSHOTS='+json.dumps(records,separators=(',',':'))+';\n')
(out/'report.json').write_text(json.dumps({'captured':list(records),'errors':errors},indent=2))
print('Captured',len(records),'of',len(S),'packshots; errors:',errors)
if errors:raise SystemExit(1)
