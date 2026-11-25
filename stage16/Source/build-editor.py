from pathlib import Path
import json,sys
p=Path(__file__).resolve().parent
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else p.parent/'Ally_Quest_Content_Studio.html'
s=(p/'editor.html').read_text().replace('__CORE__',(p/'content-engine.js').read_text()).replace('__PACK__',json.dumps(json.loads((p/'content.json').read_text()),ensure_ascii=True,separators=(',',':')))
out.write_text(s);print(out)
