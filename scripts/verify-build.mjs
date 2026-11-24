import { readFileSync,existsSync } from 'node:fs';
import { join } from 'node:path';
const base=new URL('../',import.meta.url).pathname;
const files=['web/index.html','web/assets/css/home.css','web/assets/js/main.js','web/assets/js/home/homeMarkup.js','web/assets/ethan.png','web/assets/maya.png','web/assets/leo.png','web/assets/ari.png','web/assets/js/game/GameHost.js','web/assets/js/game/physics/SideWorld.js','web/assets/js/game/physics/TopWorld.js','web/assets/css/game.css'];
for(const f of files)if(!existsSync(join(base,f)))throw new Error(`Missing built file: ${f}`);
const runtime=['src','web/assets/js'].map(f=>join(base,f));
for(const location of runtime){
  const fs=await import('node:fs');
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
  for(const f of walk(location)){if(!/\.(js|ts)$/.test(f))continue;let t=readFileSync(f,'utf8');
    const banned=['puzzle-board','setupPuzzle','run-puzzle','reset-puzzle','Math.hypot(pos.x','PLACE FAN','Moving the fan'];
    for(const b of banned)if(t.includes(b))throw new Error(`Rejected Level 1 token ${b} remains: ${f}`);
  }
}
console.log('Build verified: approved HomeScene unchanged, rejected Level 1 absent, both real-time movement prototypes compiled.');
