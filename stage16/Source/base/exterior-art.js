/* Ally Quest art-direction renderer. Every drawn landing lip sits exactly on its collision y. */
(()=>{'use strict';
const TAU=Math.PI*2;const palettes={
 school:{light:'#ffeab7',mid:'#be9774',dark:'#66594f',edge:'#466e53',grass:'#87c75d',detail:'#e3c4a1',metal:'#5f7787',glow:'#ffd45b'},
 cafeteria:{light:'#f6eee0',mid:'#bbd1cd',dark:'#52747b',edge:'#26565a',grass:'#7cd5bf',detail:'#d8e9db',metal:'#577e91',glow:'#ffcf68'},
 label_lab:{light:'#e6faff',mid:'#b1c8d8',dark:'#597187',edge:'#285b72',grass:'#8bdddc',detail:'#dee8f0',metal:'#598aa9',glow:'#a6f5e0'},
 garden:{light:'#fff1c7',mid:'#bc9e75',dark:'#6e6553',edge:'#477b58',grass:'#8ad874',detail:'#edd4aa',metal:'#6c8b70',glow:'#ffd56b'},
 celebration:{light:'#ffe6cf',mid:'#bf8fa2',dark:'#76536d',edge:'#865b97',grass:'#df9ae1',detail:'#f5c6d6',metal:'#8c658f',glow:'#ffe47f'}
};
const tiles=new Map();const hash=(a,b,c=0)=>{let x=Math.sin(a*34.121+b*11.99+c*17.447)*43758.5453;return x-Math.floor(x)};
function round(c,x,y,w,h,r,fill){if(w<=0||h<=0)return;c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,Math.min(Math.max(r,0),w/2,h/2));c.fill()}
function line(c,x,y,x2,y2,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
function grad(c,x,y,w,stops){const g=c.createLinearGradient(x,y,x+w,y);for(const [t,col] of stops)g.addColorStop(t,col);return g}
function vgrad(c,y,h,stops){const g=c.createLinearGradient(0,y,0,y+h);for(const [t,col]of stops)g.addColorStop(t,col);return g}
function centerText(c,text,x,y,size,color='#fff8e2',stroke='#243b4c'){c.save();c.font=`1000 ${size}px ui-rounded, system-ui`;c.textAlign='center';c.lineJoin='round';c.strokeStyle=stroke;c.lineWidth=Math.max(2,size*.16);c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);c.restore()}
// Broad nonrepeating illustrated ground panels. Seeded from their world chunk, rather
// than repeating the same short wall image from top to bottom of every viewport.
// Panels are cached per scene and chunk, so the expensive brushwork runs once.
function groundPanel(scene,chunk){
 const key=`${scene}:${chunk}`;if(tiles.has(key))return tiles.get(key);
 const p=palettes[scene]||palettes.school,W=640,H=500;
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 const c=canvas.getContext('2d',{alpha:false});const industrial=scene==='cafeteria'||scene==='label_lab';
 const festival=scene==='celebration',garden=scene==='garden';
 const rng=(row,col,pass=0)=>hash(chunk*131+col,row*19+pass,pass*11+chunk*17);
 const base=vgrad(c,0,H,industrial?[[0,p.mid],[.16,p.dark],[.83,'#344957'],[1,'#2b3a43']]:festival?[[0,'#ad816a'],[.23,'#6e5866'],[1,'#352e42']]:[[0,'#ad947a'],[.20,'#655d53'],[1,'#363c39']]);
 round(c,0,0,W,H,0,base);
 if(industrial){
  // Industrial bases have large deliberately staggered manufactured panels,
  // not the exact same stone-grid appearance as the schoolyard.
  for(let row=0;row<11;row++){
   const y=row*49+5,step=124,offset=((row%3)*41+chunk*17)%step;
   for(let col=-2;col<8;col++){
    const x=col*step-offset,variation=rng(row,col),light=scene==='cafeteria';
    const top=light?(variation>.5?'#b6d3cf':'#90b9bd'):(variation>.5?'#bdd7e4':'#87b4c9');
    round(c,x+3,y,step-7,44,3,top);
    round(c,x+8,y+4,step-17,5,2,light?'rgba(241,255,245,.28)':'rgba(229,250,255,.33)');
    line(c,x+6,y+40,x+step-7,y+40,light?'#587c81':'#4c7694',2);
    for(const bx of [x+15,x+step-17])ellipse(c,bx,y+33,2.5,2.5,light?'#597d80':'#517690');
    if((row+col+chunk)%4===0){
     round(c,x+27,y+18,step-52,14,2,'rgba(39,83,94,.45)');
     for(let slit=0;slit<4;slit++)line(c,x+37+slit*17,y+22,x+43+slit*17,y+22,'rgba(187,229,225,.75)',2);
    }
   }
  }
 }else if(festival){
  // Celebration stage: wide timber paneling with thick separated beams.
  for(let row=0;row<13;row++){
   const y=row*39+4;const l=rng(row,2),tint=l>.66?'#c69678':l>.32?'#b47f70':'#976970';
   round(c,0,y,W,35,3,tint);round(c,0,y+2,W,3,2,'rgba(255,226,173,.23)');
   for(let col=0;col<7;col++){const x=col*109+((row%2)*54)-30;
    line(c,x,y+4,x,y+31,'rgba(76,48,54,.50)',2);
    ellipse(c,x+11,y+23,2,2,'#594d52');}
  }
  for(let k=0;k<3;k++){
   const x=k*246+73+(rng(k,7)-.5)*30;
   line(c,x,22,x+10,260,'rgba(108,69,77,.3)',5);
  }
 }else{
  // Irregularly dimensioned chiseled masonry and soft foliage. Each stone gets
  // unique tint, edge light, cracks and grain, without a visible 224px repeat.
  for(let row=0;row<11;row++){
   const y=row*46+5,step=123,offset=((row%3)*41+19)%step;
   for(let col=-2;col<8;col++){
    const x=col*step-offset+(rng(row,col)-.5)*4;
    const w=step-7+rng(row,col,2)*5;
    const v=rng(row,col,3);
    const fill=v>.8?'#c6af90':v>.6?'#b7a18d':v>.35?'#a89480':'#918579';
    const yy=y+(rng(row,col,4)-.5)*2;
    round(c,x+3,yy,w,39,7,fill);
    round(c,x+8,yy+4,w-10,5,3,'rgba(255,241,209,.25)');
    line(c,x+7,yy+35,x+w-1,yy+35,'rgba(54,54,54,.19)',2);
    if(v>.73){const xx=x+16+rng(row,col,5)*(w-30);
      line(c,xx,yy+9,xx+4,yy+18,'rgba(86,83,74,.25)',1.6);
      line(c,xx+4,yy+18,xx-2,yy+23,'rgba(86,83,74,.25)',1.3);}
    for(let j=0;j<3;j++){const fx=x+11+rng(row*3+j,col)*Math.max(1,w-20),fy=yy+11+rng(row,col*5+j)*18;
      ellipse(c,fx,fy,1.3,1,'rgba(70,75,68,.18)');}
   }
  }
  // Natural vine growth occurs in intermittent rooted clusters, not every tile.
  for(let k=0;k<(garden?3:2);k++){
   const x=68+k*(garden?238:340)+(rng(k,8)-.5)*55,len=72+rng(k,9)*137;
   const green=garden?'#629663':'#53845d';
   line(c,x,3,x-6,len,'rgba(43,96,51,.43)',3);
   for(let j=0;j<7;j++){
    const yy=18+j*len/7,xx=x-6+Math.sin(j*2.3+k)*8;
    ellipse(c,xx-5,yy,8,4,green);
    ellipse(c,xx+4,yy+7,6,3,green);
   }
  }
 }
 // Depth naturally darkens below the walkable lip, improving platform readability.
 const shade=vgrad(c,0,H,[[0,'#00000000'],[.5,'#1b2a3230'],[1,'#0c1b3060']]);round(c,0,0,W,H,0,shade);
 if(tiles.size>36){const first=tiles.keys().next().value;tiles.delete(first)}
 tiles.set(key,canvas);return canvas;
}
function ground(c,world,cam,cw,t){const p=palettes[world.scene]||palettes.school,groundY=567;
 const span=640,start=Math.max(0,Math.floor(cam/span)-1),end=Math.ceil((cam+cw+span)/span);
 for(let chunk=start;chunk<=end;chunk++){
  const x=chunk*span-cam;if(x<-span||x>cw+span||x>world.width+80)continue;
  c.drawImage(groundPanel(world.scene,chunk),x,groundY,span,500);
 }
 // Exact physical walkable lip. The warm upper edge is never covered by the artwork.
 round(c,0,567,cw,11,0,'#243c41');round(c,0,560,cw,8,0,p.edge);
 round(c,0,555,cw,6,0,p.grass);round(c,0,553,cw,3,0,p.light);
 if(world.scene!=='cafeteria'&&world.scene!=='label_lab'){
  for(let x=Math.floor(cam/94)*94;x<cam+cw+95;x+=94){const sx=x-cam;
    if(hash(x,8)>.27){ellipse(c,sx,555,7,3,p.grass);ellipse(c,sx-5,551,3,4,'#a6d17c');}
    if(hash(x,12)>.80){ellipse(c,sx+9,551,2.6,2.6,'#fff1a4');ellipse(c,sx+13,550,2,2,'#f0b9c4')}
  }
 }
 for(const g of world.gaps||[]){const x=g.x-cam;if(x>cw+60||x+g.w<-60)continue;
  round(c,x,549,g.w,550,0,'#285f71');round(c,x+3,552,g.w-6,6,0,'#a3dad4');
  for(let u=0;u<g.w;u+=34){line(c,x+u+4,579+Math.sin(t*2+u)*6,x+u+22,578+Math.sin(t*2+u)*6,'#8ecfd3',2)}
  if(world.state.lever&&g.bridgeBy==='lever')bridge(c,x,553,g.w,t);
  line(c,x,553,x,967,p.light,6);line(c,x+g.w,553,x+g.w,967,p.light,6);
 }
}
function bridge(c,x,y,w,t){round(c,x-6,y+6,w+12,22,3,'#604933');for(let i=0;i<w;i+=24){round(c,x+i,y,22,20,2,(i/24)%2?'#b17e58':'#d4a26d');line(c,x+i+5,y+4,x+i+19,y+4,'#f2d6a3',1.5)}
 for(let sx of [x+5,x+w-5]){line(c,sx,y+5,sx,y-49,'#725637',4);ellipse(c,sx,y-49,5,5,'#f6cc8b')}
 line(c,x+5,y-44,x+w-5,y-44,'#8c6649',3);
}
function platform(c,world,p,cam,t){const theme=world.scene,clr=palettes[theme]||palettes.school;const x=p.x+(p.moving?Math.sin(t*TAU/(p.period||3))*(p.amplitude||60):0)-cam,y=p.y,w=p.w;
 if(x>c.canvas.width+1000||x+w<-250)return;
 const illustration=window.ALLY_ILLUSTRATIONS?.['platform_'+theme];
 if(illustration?.complete&&illustration.naturalWidth){
  c.save();
  if(p.moving){const mid=p.x+p.w/2-cam;line(c,mid-70,268,mid+70,268,'#866d55',7);
   for(const side of [-1,1]){const sx=mid+side*48,tx=x+w/2+side*w*.34;line(c,sx,271,tx,y,'#ad956e',3);ellipse(c,sx,268,7,7,'#f4e0ae')}}
  c.shadowColor='rgba(23,43,41,.31)';c.shadowBlur=10;c.shadowOffsetY=7;
  c.drawImage(illustration,x-11,y-13,w+22,66);c.shadowBlur=0;c.shadowOffsetY=0;
  // Outline the exact y collision plane with thin warm light, no fake higher ledge.
  round(c,x+1,y,w-2,2,1,'rgba(255,247,218,.65)');
  c.restore();return;
 }
 c.save();c.shadowColor='rgba(6,24,37,.34)';c.shadowBlur=11;c.shadowOffsetY=7;
 if(theme==='cafeteria'||theme==='label_lab'){
  // Steel workstation shelf, metallic side geometry, visibly walkable top.
  round(c,x-6,y,w+12,26,5,vgrad(c,y,26,[[0,'#f8f8e7'],[.24,clr.mid],[1,clr.dark]]));c.shadowBlur=0;
  round(c,x+4,y+17,w-8,6,2,'#334d62');for(let i=0;i<Math.floor(w/42);i++){line(c,x+14+i*42,y+5,x+22+i*42,y+5,'#f6ffed',2)}
  if(!p.moving){for(const side of [17,w-18]){round(c,x+side-6,y+22,12,19,3,'#617985');ellipse(c,x+side,y+45,6,6,'#314755')}}
 }else if(theme==='garden'){
  // Thick timber garden bridge/planter with leaf trim.
  round(c,x-6,y,w+12,26,5,vgrad(c,y,26,[[0,'#e6b77b'],[1,'#644f3b']]));c.shadowBlur=0;
  for(let k=11;k<w;k+=36){line(c,x+k,y+7,x+k,y+24,'#694b36',2)}
  round(c,x-4,y-8,w+8,12,6,'#55734b');round(c,x-2,y-10,w+4,5,3,'#b5ec93');
 }else if(theme==='celebration'){
  round(c,x-6,y,w+12,29,5,vgrad(c,y,29,[[0,'#fbdab4'],[.2,'#b77d73'],[1,'#76576d']]));c.shadowBlur=0;
  for(let k=9;k<w;k+=34)line(c,x+k,y+3,x+k,y+24,'#72535d',2);
  round(c,x-6,y-9,w+12,8,4,'#efb2dd');round(c,x-4,y-12,w+8,4,3,'#fff1b6');
 }else{
  round(c,x-6,y,w+12,32,6,vgrad(c,y,32,[[0,'#dbbd96'],[.45,'#97806a'],[1,'#594b3e']]));c.shadowBlur=0;
  for(let k=0;k<w;k+=44){line(c,x+k+7,y+15,x+k+34,y+15,'#c2aa8b',2);line(c,x+k+40,y+12,x+k+40,y+29,'#735e53',2)}
  round(c,x-6,y-7,w+12,9,3,'#326f49');round(c,x-5,y-11,w+10,6,4,'#99d36f');
 }
 c.shadowBlur=0;c.shadowOffsetY=0;
 // Reliable thin rim: precise landing target aligned to world physics y.
 round(c,x-5,y-13,w+10,6,3,clr.light);round(c,x+7,y-15,w-14,3,1,'rgba(255,255,255,.8)');
 if(p.moving){ // overhead suspension; no decorative legs through the playable area
  const mid=p.x+p.w/2-cam;
  line(c,mid-76,268,mid+76,268,'#725d53',7);
  for(const side of [-1,1]){const a=mid+side*53,b=x+w/2+side*w*.36;line(c,a,271,b,y,'#9c8974',3);ellipse(c,a,268,7,7,'#eed4a4')}
 }
 c.restore();
}
function wall(c,world,w,cam,t){const theme=world.scene,p=palettes[theme]||palettes.school,x=w.x-cam,y=w.y,width=w.w,h=w.h;
 if(x>2800||x+width<-100)return;
 c.save();c.shadowColor='rgba(24,39,43,.34)';c.shadowOffsetX=-6;c.shadowBlur=14;
 let gradient=grad(c,x,y,width,[[0,p.dark],[.24,p.mid],[.59,p.light],[1,p.dark]]);
 round(c,x,y,width,h,4,gradient);c.shadowBlur=0;
 if(theme==='label_lab'){
  // Magnifier-wall is a real built-in library cabinet.
  for(let yy=y+14;yy<y+h-15;yy+=49){round(c,x+3,yy,width-6,40,2,'#426582');line(c,x+4,yy+41,x+width-4,yy+41,'#d8eafb',3);
   for(let k=0;k<3;k++)round(c,x+7+k*(width-14)/3,yy+7,(width-17)/3,27,1,['#ffe1a9','#b7cde9','#f1b8ca'][(k+Math.round(yy/49))%3]);}
 }else if(theme==='cafeteria'){
  // Installed cafeteria equipment, riveted stainless panels.
  for(let yy=y+10;yy<y+h-14;yy+=47){round(c,x+4,yy,width-8,39,3,'#76969a');round(c,x+7,yy+4,width-14,8,2,'#cbe0d4');ellipse(c,x+width-10,yy+26,2.6,2.6,'#405c68')}
 }else if(theme==='garden'||theme==='celebration'){
  for(let yy=y+20;yy<y+h-10;yy+=27){line(c,x+5,yy,x+width-5,yy,'#735d4d',2);
   ellipse(c,x-2+Math.sin(yy)*3,yy,7,4,'#67a85c');ellipse(c,x+width+2,yy+8,8,5,'#76b464')}
 }else{
  for(let yy=y+18;yy<y+h;yy+=32){line(c,x+2,yy,x+width-2,yy,'#786e60',2);
   const mx=x+(Math.round(yy/32)%2?.35:.68)*width;line(c,mx,yy,mx,Math.min(y+h,yy+32),'#807460',2)}
  for(let yy=y+25;yy<y+h;yy+=51){ellipse(c,x-3,yy,8,4,'#7ca566');ellipse(c,x+width+3,yy+11,6,5,'#56895a')}
 }
 round(c,x-8,y-14,width+16,12,3,theme==='label_lab'?'#d4f2ff':p.light);
 round(c,x-6,y-17,width+12,4,2,'#fff9dc');
 // Guide tile is integrated as a carved plaque rather than an alien detached arrow.
 if(theme!=='cafeteria'){round(c,x+4,y+20,width-8,38,4,p.edge);centerText(c,'↑',x+width/2,y+47,28,p.glow,p.dark)}
 c.restore();
}
function conveyor(c,cv,cam,t){const x=cv.x-cam,y=548,w=cv.w;
 round(c,x-8,y-14,w+16,32,8,'#3f5c69');round(c,x-4,y-10,w+8,18,6,'#a6cdd4');round(c,x,y-7,w,11,4,'#4b7f8b');
 for(let k=0;k<w/36;k++){const u=(k*36+t*80*cv.dir)%(w-26);round(c,x+8+u,y-5,21,7,2,'#e4f2e6')}
 for(const z of [x+10,x+w-10]){ellipse(c,z,y+11,7,7,'#435d65');ellipse(c,z,y+11,3,3,'#dff4e9')}
}
function cart(c,x,y,world,t,carrying=false){c.save();c.translate(x,y);
 c.shadowColor='#18364744';c.shadowBlur=11;round(c,-43,-50,87,46,6,'#658894');c.shadowBlur=0;
 round(c,-42,-49,84,11,5,'#d7ebe4');round(c,-36,-38,72,22,4,'#b6d4cc');
 for(const xx of [-26,26]){ellipse(c,xx,-1,11,11,'#2b5663');ellipse(c,xx,-1,5,5,'#bad4d9')}
 round(c,-19,-56,40,7,3,'#e5ceab');round(c,-14,-68,27,12,5,'#f9de88');
 c.fillStyle='#4c7481';c.font='900 12px system-ui';c.textAlign='center';c.fillText(carrying?'ARRIVED':'TRAY',0,-18);c.restore()}
function taskObject(c,task,world,cam,t){const x=task.x-cam,y=567,id=task.id,done=world.state.done.has(task.id),p=palettes[world.scene];
 if(done&&task.kind==='npc')return;
 c.save();c.translate(x,y);
 if(task.kind==='pickup'){
   // Pedestal and mechanically collectible item, not a giant glowing emoji.
   ellipse(c,0,1,26,7,'#243c4255');round(c,-13,-29,26,27,5,p.mid);round(c,-19,-33,38,7,3,p.light);
   c.fillStyle=p.glow;c.font='32px system-ui';c.textAlign='center';c.shadowColor=p.glow;c.shadowBlur=8;c.fillText(task.icon,0,-44+Math.sin(t*3)*3);c.shadowBlur=0;
 }else if(task.kind==='lever'){
   round(c,-26,-42,53,43,7,'#4d6771');round(c,-20,-38,40,34,4,'#8baaa2');
   c.save();c.translate(0,-22);c.rotate(done?-.7:.7);line(c,0,0,0,-40,'#e8b56c',7);ellipse(c,0,-41,10,10,'#f8d384');c.restore();
   round(c,-26,-49,52,6,3,'#d6ddd3');
 }else if(world.scene==='label_lab'){
   // Information station: visible label, real inspector opens using E.
   round(c,-58,-86,116,83,9,'#4b758c');round(c,-52,-81,104,70,6,'#d9e9e9');round(c,-47,-72,94,54,3,'#fffcef');
   for(let k=0;k<4;k++)round(c,-36,-61+k*11,72-k*8,3,1,k%2?'#94afba':'#c4d5d8');
   round(c,-64,-99,128,16,5,'#315768');centerText(c,id==='magnifier'?'MAGNIFY':`READ ${id.replace('label','')}` ,0,-87,13,'#fff6c9');
 }else if(world.scene==='cafeteria'){
   // Serve/verify station with cart and physical equipment.
   round(c,-54,-88,108,80,7,'#517d80');round(c,-49,-82,98,56,4,'#d9e6d8');
   round(c,-39,-73,78,29,5,'#a3c3bd');for(let k=0;k<3;k++)ellipse(c,-25+k*24,-57,9,9,'#e8f4e6');
   round(c,-59,-99,118,17,5,'#385968');centerText(c,id==='ari'?'TEAM DESK':id==='station2'?'CLEAN GEAR':id==='station1'?'VERIFY':'ART',0,-86,12,'#ffea98');
 }else if(world.scene==='garden'){
   round(c,-63,-59,126,53,8,'#a78660');round(c,-57,-62,114,10,4,'#efcf9b');for(let v of [-45,45]){round(c,v-7,-8,15,16,4,'#6c594b')}
   for(let k=0;k<5;k++)round(c,-42+k*20,-77,16,13,3,['#f0a5bc','#87c8e3','#e9cd7c'][k%3]);
   centerText(c,id==='crafts'?'ART & CRAFTS':id==='music'?'MUSIC':'PARTY',0,-83,13,'#fff6d0');
 }else if(world.scene==='celebration'){
   round(c,-50,-58,101,51,7,'#836480');round(c,-56,-63,112,11,5,'#eeb6ce');
   round(c,-47,-76,95,17,5,'#83678a');centerText(c,id==='team'?'TEAM UP':'CELEBRATE',0,-63,11,'#fff3b8');
 }else{
   // Authentic school activity board: a sign set into its own scene props.
   round(c,-46,-67,92,61,7,'#745b49');round(c,-40,-62,80,48,4,'#f2dfad');centerText(c,'ALLY',0,-30,18,'#53766a');
 }
 // Arranged objects stay in the game world. Partial progress is visible as well.
 const moves=world.state.activityStages?.[id]||[],count=moves.length;
 if(count>0||done){
  c.save();
  // Tiny inset workbench indicator lights are sufficient; no text plaques over faces.
  round(c,-33,-108,66,13,6,done?'#246859':'#365773');
  for(let k=0;k<3;k++)ellipse(c,-21+k*21,-102,4.5,4.5,k<count?'#f5df86':'#8198b2');
  if(['crafts','station3'].includes(id)){
    round(c,-44,-177,88,45,4,'#f4eddc');
    const motifs=['★','♥','✿'];for(let j=0;j<(done?3:count);j++)centerText(c,motifs[j],-26+j*26,-145,26,['#e5a254','#d97dbd','#60aa95'][j]);
  }
  else if(id==='music'){
    round(c,-44,-163,89,38,5,'#eacb87');
    for(let j=0;j<(done?4:count);j++)centerText(c,j%2?'♫':'♪',-28+j*19,-136,25,'#7750a0');
  }
  else if(id==='welcome'){
    round(c,-49,-180,98,44,5,'#78baa8');centerText(c,done?'EVERYONE':`WELCOME ${count}`,0,-156,12,'#fff6c3');
    if(done)centerText(c,'BELONGS!',0,-143,10,'#fff6c3');
  }
  else if(id==='game'){
    round(c,-50,-178,100,42,4,'#d2cbaa');centerText(c,done?'3 CLUES FOUND':'SCAVENGER MAP',0,-157,11,'#396e78');
    for(let j=0;j<(done?3:count);j++)ellipse(c,-27+j*28,-146,4,4,'#438b70');
  }
  else if(id==='station2'||id==='check'){
    for(let j=0;j<(done?3:count);j++){
       round(c,-42+j*31,-146,24,25,4,'#dfebd8');centerText(c,'✓',-30+j*31,-129,17,'#287f75');
    }
  }
  else if(id==='station1'){
    round(c,-43,-155,88,30,5,'#beddd5');centerText(c,done?'TRAY AT HELPER':'TRAY TO REVIEW',0,-135,10,'#305d6d');
  }
  c.restore();
 }
 if(done){round(c,-18,-21,36,23,7,'#2f9c79');centerText(c,'✓',0,-4,20,'#fff')}

 c.restore();
}
function finish(c,world,cam,t){const x=world.finishX-cam,p=palettes[world.scene]||palettes.school;if(x>2000||x<-130)return;
 c.save();c.translate(x,567);
 for(const sx of [-22,82]){round(c,sx,-175,11,175,4,p.dark);round(c,sx+2,-168,4,155,2,p.light)}
 const flag=vgrad(c,-160,73,[[0,world.color],[1,p.edge]]);round(c,-17,-158,102,73,9,flag);
 round(c,-11,-153,90,6,3,'rgba(255,255,255,.47)');centerText(c,'GOAL',33,-118,23,'#fff7cc');centerText(c,'★',33,-89,21,'#ffe171');
 for(let k=0;k<4;k++)ellipse(c,-8+k*26,-167+Math.sin(t*2+k)*3,3,4,p.glow);
 c.restore()}
function backfill(c,scene,cw,cam,time){
 const isGarden=scene==='garden',p=palettes[scene]||palettes.school;
 // Built from actual layer-appropriate foliage, fences and distant garden fixtures.
 // This intentionally contains NO baked character or fake traversable platform.
 c.save();const band=vgrad(c,383,185,[[0,'#95b9b300'],[.35,isGarden?'#a9cabe':'#b7b9ba'],[1,isGarden?'#779d80':'#9c9fb1']]);
 round(c,0,383,cw,188,0,band);
 const base=Math.floor(cam*.27/184)*184-184;
 for(let worldX=base;worldX<cam*.27+cw+200;worldX+=184){const sx=worldX-cam*.27,v=hash(worldX,13),yy=487+v*25;
  c.save();c.globalAlpha=.66;
  // Backmost tree canopy, softly clustered to complement readable playable platforms.
  for(let k=0;k<7;k++){
   const x=sx-56+k*21,y=yy-25+Math.sin(k*1.5+v*5)*14;
   ellipse(c,x,y,31+(k%2)*8,34,isGarden?(k%3?'#6e9d76':'#8eb28a'):(k%2?'#9a9db4':'#89a4a2'));
   ellipse(c,x-7,y-9,16,14,isGarden?'#b5cf9b':'#b6bfbb');
  }
  if(Math.round(worldX/184)%3===0){
   round(c,sx-46,506,101,50,6,isGarden?'#8c9a7d':'#8e8a8f');
   round(c,sx-43,507,94,7,2,isGarden?'#d3d6ae':'#c7b1a7');
   for(const at of [-35,38]){round(c,sx+at,515,4,33,2,'#6e857c')}
  }
  if(isGarden){for(let k=0;k<5;k++){
   const x=sx-58+k*24,yy=535+(k%2)*9;ellipse(c,x,yy,7,7,['#d3abcf','#faf0c0','#ddc1d8'][k%3]);
   ellipse(c,x+9,yy+8,12,7,'#729b70')
  }}
  c.restore();
 }
 // Layered vertical fence establishes location without implying any collision.
 for(let x=-((cam*.27)%73);x<cw+75;x+=73){
   round(c,x,499,7,66,3,isGarden?'#d6dfc5':'#c7afbd');
   round(c,x-3,489,13,12,4,isGarden?'#e6e8cb':'#e1c6c2')
 }
 line(c,0,528,cw,528,isGarden?'rgba(229,237,201,.7)':'rgba(227,207,215,.6)',6);
 c.restore();
}
window.ALLY_FOREGROUND={ground,platform,wall,conveyor,taskObject,cart,finish,backfill,palettes};
})();
