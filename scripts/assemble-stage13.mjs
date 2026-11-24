import fs from 'node:fs';
import crypto from 'node:crypto';
const names=Array.from({length:24},(_,i)=>'release/stage13-parts/part-'+String(i).padStart(3,'0')+'.txt');
const bytes=Buffer.concat(names.map(n=>fs.readFileSync(n)));
const hash=crypto.createHash('sha256').update(bytes).digest('hex');
if(hash!=='8742e5515945bb0d00d44e85d4537f0a624de563823c8b4c99102995668c46eb')throw Error('Release hash mismatch: '+hash);
fs.mkdirSync('play',{recursive:true});fs.writeFileSync('play/index.html',bytes);console.log('Stage 13 verified',hash,bytes.length);
