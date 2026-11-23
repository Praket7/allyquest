#!/usr/bin/env python3
"""Create a single HTML review artifact from modular, compiled source.
The project remains modular; standalone transport embeds approved character PNGs.
"""
from pathlib import Path
import base64,re,json
root=Path(__file__).resolve().parents[1]
web=root/'web';asset_dir=web/'assets'
css=(asset_dir/'css/home.css').read_text()+'\n'+(asset_dir/'css/game.css').read_text()
files=['game/physics/types','game/physics/SideWorld','game/physics/TopWorld',
       'game/physics/FixedClock','game/Controls','game/audio/AmbientScore','game/story/WelcomeQuest','game/story/ComicBubble','game/render/WelcomePainter','game/render/ArtAssets','game/render/Renderer','game/GameHost',
       'home/homeMarkup','home/HomeScene','home/responsive','state/saveData',
       'data/worlds','ui/Overlay','ui/routes','main']
compiled=[]
for name in files:
 p=asset_dir/'js'/f'{name}.js'
 s=p.read_text()
 s=re.sub(r'(?m)^import[^\n]*\n','',s)
 s=re.sub(r'(?m)^export\s+','',s)
 compiled.append(f'/* module: {name} */\n'+s)
js='\n'.join(compiled)
art={n:'data:image/png;base64,'+base64.b64encode((asset_dir/f'{n}.png').read_bytes()).decode() for n in ['ethan','maya','leo','ari']}
for n,uri in art.items():
 js=js.replace(f'href="assets/{n}.png"',f'href="{uri}"')
 js=js.replace(f'assets/${{name}}.png',f'assets/${{name}}.png')
 js=js.replace(f'`assets/{n}.png`',f'`{uri}`')
js=js.replace('const portraits =','const CHARACTER_ART = '+json.dumps(art)+';\nconst portraits =')
js=js.replace('src="./assets/${name}.png"','src="${CHARACTER_ART[name]}"')
js=js.replace('`assets/${name}.png`','CHARACTER_ART[name]')
# Fold optimized high-quality gameplay assets into the standalone build with no network dependencies.
for path in sorted((asset_dir/'game').glob('*')):
 if path.suffix not in ('.webp','.png'):continue
 uri=f'data:image/{path.suffix[1:]};base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
 js=js.replace('assets/game/'+path.name,uri)
assert 'href="assets/' not in js
assert 'src="./assets/${name}' not in js
assert 'setupPuzzle' not in js and 'puzzle-board' not in js
standalone='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Ally Quest — Welcome Street: Illustrated Adventure</title><style>'+css+'</style></head><body><div id="app"></div><script>'+js+'</script></body></html>'
out=root/'Ally_Quest_Stage_3_Standalone.html';out.write_text(standalone)
print(out,len(standalone))
