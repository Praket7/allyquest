import type {Actor,Platform} from '../physics/types.js';

export const GAME_ART: Record<string,string> = {
  panorama:'assets/game/welcome_playback.webp',
  trampoline:'assets/game/trampoline.webp',
  maya:'assets/game/maya_00.webp',
  maya1:'assets/game/maya_01.webp',maya2:'assets/game/maya_02.webp',
  maya3:'assets/game/maya_03.webp',maya4:'assets/game/maya_04.webp',
  maya5:'assets/game/maya_05.webp',maya6:'assets/game/maya_06.webp',
  maya7:'assets/game/maya_07.webp',
  stone:'assets/game/stone_wall.webp',
  grass:'assets/game/grass_tuft.png',
  pose0:'assets/game/ethan_00.webp', pose1:'assets/game/ethan_01.webp',
  pose2:'assets/game/ethan_02.webp', pose3:'assets/game/ethan_03.webp',
  pose4:'assets/game/ethan_04.webp', pose5:'assets/game/ethan_05.webp',
  pose6:'assets/game/ethan_06.webp', pose7:'assets/game/ethan_07.webp',
};
const artClamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
const artEase=(a:number,b:number,x:number)=>{const t=artClamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const artNoise=(x:number)=>{const n=Math.sin(x*87.239+11.87)*31675.34;return n-Math.floor(n)};
/** Painted layers never determine collisions: positions come only from SideWorld. */
export class ArtAssets {
  private atlas=new Map<string,HTMLImageElement>();private geometryCache=new Map<string,{surface:HTMLCanvasElement;left:number;top:number}>();loaded=0;
  constructor(){for(const [id,url] of Object.entries(GAME_ART)){
    const img=new Image();img.decoding='async';img.src=url;
    img.addEventListener('load',()=>this.loaded++);this.atlas.set(id,img);
  }}
  image(name:string){const im=this.atlas.get(name);return im?.complete&&im.naturalWidth>0?im:null}

  /** One precomposed painterly panorama, never a tiled or alpha-crossfaded backdrop. */
  background(c:CanvasRenderingContext2D,w:number,h:number,cameraX:number,floor:number,quiet:boolean,t:number){
    const img=this.image('panorama')??this.image('background');if(!img)return false;
    const targetH=artClamp(floor,h*.43,h*1.10)+6;
    c.save();
    const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#8ccbfa');sky.addColorStop(1,'#d5efd9');
    c.fillStyle=sky;c.fillRect(0,0,w,h);
    const srcH=img===this.image('panorama')?img.naturalHeight:img.naturalHeight*.738;
    const srcW=Math.min(img.naturalWidth,srcH*w/Math.max(1,targetH));
    // Advance through actual source pixels with the player, while preserving image proportions.
    // This is a camera pan through a single artwork, not a moving boundary between screenshots.
    const travel=artClamp(cameraX/2200,0,1);
    const pan=travel*travel*(3-2*travel);
    const sx=(img.naturalWidth-srcW)*pan;
    c.drawImage(img,sx,0,srcW,srcH,0,0,w,targetH);
    // Playback artwork is already color-graded off-line. Avoid full-screen gradients every frame.
    c.fillStyle='rgba(242,248,252,.045)';c.fillRect(0,0,w,targetH);
    c.restore();return true;
  }
  hero(c:CanvasRenderingContext2D,p:Actor,grounded:boolean,t:number,finished=false){
    const moving=Math.abs(p.vx)>48;
    const pose=finished?7:!grounded?(p.vy<-100?5:6):moving?[1,2,3,4][Math.floor(t*11)%4]:0;
    const im=this.image('pose'+pose)??this.image('pose0');if(!im)return false;
    const h=143,w=143;
    c.save();c.translate(p.x,p.y);if(p.vx<-10)c.scale(-1,1);
    const bob=grounded&&moving?Math.sin(t*19)*1.3:!moving&&grounded?Math.sin(t*2):0;
    c.fillStyle='rgba(23,49,38,.20)';c.beginPath();c.ellipse(2,1,26,6,0,0,Math.PI*2);c.fill();
    c.drawImage(im,-w/2,-h-bob,w,h);c.restore();return true;
  }
  /** Maya is the same normalized 256px atlas design as Ethan; no improvised stick legs. */
  npc(c:CanvasRenderingContext2D,x:number,y:number,t:number,near=false,scale=1){
    const pose=near?(Math.floor(t*.9)%2?7:0):0;
    const im=this.image(pose===0?'maya':`maya${pose}`)??this.image('maya');if(!im)return false;
    const size=143;
    c.save();c.translate(x,y);c.scale(scale,scale);
    c.fillStyle='rgba(13,46,38,.22)';c.beginPath();c.ellipse(0,1,26,6,0,0,Math.PI*2);c.fill();
    c.drawImage(im,-size/2,-size+Math.sin(t*2)*.7,size,size);
    c.restore();return true;
  }
  private pill(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,color:string|CanvasGradient){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
  private oval(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string|CanvasGradient){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
  private drawStoneSection(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){
    const stone=this.image('stone');c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    if(stone){
      // Alternate translated rows so repeating texture lines never line up as a vertical seam.
      for(let yy=y;yy<y+h+240;yy+=188){
        const row=Math.floor((yy-y)/188),offset=row%2?-210:0;
        for(let xx=x+offset;xx<x+w+800;xx+=760)c.drawImage(stone,xx,yy,762,193);
      }
    }else{
      c.fillStyle='#96866e';c.fillRect(x,y,w,h);
    }
    const tint=c.createLinearGradient(x,y,x+w,y);tint.addColorStop(0,'rgba(22,38,34,.24)');tint.addColorStop(.15,'rgba(255,244,194,.03)');tint.addColorStop(.84,'rgba(255,244,194,.015)');tint.addColorStop(1,'rgba(25,43,37,.25)');c.fillStyle=tint;c.fillRect(x,y,w,h);
    c.restore();
  }
  private edgeGrass(c:CanvasRenderingContext2D,x:number,y:number,w:number){
    const grass=this.image('grass');
    c.fillStyle='#3a6431';c.fillRect(x,y-3,w,10);
    if(grass){c.save();c.beginPath();c.rect(x,y-16,w,29);c.clip();for(let gx=x;gx<x+w;gx+=248)c.drawImage(grass,gx,y-13,253,24);c.restore()}
    else this.pill(c,x,y-12,w,15,5,'#8fba51');
  }
  private foliage(c:CanvasRenderingContext2D,x:number,y:number,w:number,seed:number){
    c.save();
    for(let i=0;i<Math.floor(w/74);i++){
      const xx=x+24+i*73+artNoise(i+seed)*19;
      if(xx>x+w-8)continue;
      const vine=8+artNoise(i*4+seed)*22;
      c.strokeStyle=i%2?'#4a863e':'#69994a';c.lineWidth=2.7;c.lineCap='round';
      c.beginPath();c.moveTo(xx,y+6);c.quadraticCurveTo(xx-5,y+vine*.55,xx+2,y+vine);c.stroke();
      for(let j=0;j<3;j++)this.oval(c,xx+(j%2?5:-3),y+11+j*vine/4,5.5,3,j%2?'#85ae50':'#548f41');
    }
    // Very sparse foreground flowers that match the painted plate rather than garish dots.
    for(let i=0;i<Math.floor(w/285);i++){
      const fx=x+60+i*207+artNoise(seed+i)*55;
      const fy=y-13-artNoise(i*3+seed)*7;
      const col=i%3===0?'#f5cfe5':i%3===1?'#f5f3db':'#e0d1f6';
      for(let k=0;k<5;k++)this.oval(c,fx+Math.cos(k*Math.PI*2/5)*4,fy+Math.sin(k*Math.PI*2/5)*4,3.5,3.3,col);
      this.oval(c,fx,fy,2,2,'#f2c463');
    }
    c.restore();
  }
  private ground(c:CanvasRenderingContext2D,p:Platform){
    const {x,y,w}=p;
    c.save();c.shadowColor='rgba(19,45,33,.2)';c.shadowBlur=12;c.shadowOffsetY=4;
    this.drawStoneSection(c,x,y,w,960);c.restore();
    const topShade=c.createLinearGradient(0,y,0,y+130);topShade.addColorStop(0,'rgba(18,44,28,.34)');topShade.addColorStop(.28,'rgba(26,50,31,.06)');topShade.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=topShade;c.fillRect(x,y,w,130);
    c.fillStyle='#272f2c';c.fillRect(x,y+1,w,4);
    this.edgeGrass(c,x,y,w);this.foliage(c,x,y,w,x*.07);
    // GAMEPLAY VALUE HIERARCHY: an uninterrupted, contrasting landing lip matching the collider.
    // Cream catchlight and darker undercut are consistent on every walkable segment.
    c.save();c.shadowColor='rgba(20,37,27,.42)';c.shadowBlur=8;c.shadowOffsetY=4;
    this.pill(c,x,y-8,w,8,2,'#405d31');c.restore();
    this.pill(c,x,y-10,w,5,2,'#d9e7a2');
    this.pill(c,x,y-11,w,2,1,'#fcf5cc');
    // An exposed stone-and-earth edge communicates a genuine break in the walkable terrain.
    c.fillStyle='rgba(38,38,36,.32)';c.fillRect(x+w-9,y+7,9,440);
    c.fillStyle='rgba(249,234,185,.18)';c.fillRect(x+3,y+7,4,370);
  }
  private ledge(c:CanvasRenderingContext2D,p:Platform){
    const {x,y,w}=p;
    // A shallow, readable cantilever platform. Long decorative legs previously
    // cut through the characters and did not match any collision surface.
    // The physical landing edge remains EXACTLY at p.y, across p.x..p.x+p.w.
    c.save();
    c.fillStyle='rgba(23,48,38,.18)';c.beginPath();c.ellipse(x+w/2,y+31,w*.46,8,0,0,Math.PI*2);c.fill();
    // Short stone wall-brackets suggest support without drawing non-solid columns
    // through the playable route beneath the platform.
    for(const xx of [x+20,x+w-20]){
      c.fillStyle='#6d6555';c.beginPath();c.moveTo(xx-10,y+21);c.lineTo(xx+10,y+21);
      c.lineTo(xx+3,y+42);c.lineTo(xx-3,y+42);c.closePath();c.fill();
      c.strokeStyle='#bda98a';c.lineWidth=2;c.beginPath();c.moveTo(xx-7,y+24);c.lineTo(xx-1,y+37);c.stroke();
    }
    const slab=c.createLinearGradient(0,y,0,y+26);
    slab.addColorStop(0,'#a8987b');slab.addColorStop(.55,'#786a56');slab.addColorStop(1,'#544d41');
    this.pill(c,x-3,y+3,w+6,27,5,slab);
    this.drawStoneSection(c,x+2,y+11,w-4,15);
    this.pill(c,x-4,y+27,w+8,5,2,'#433f36');
    this.edgeGrass(c,x-3,y+3,w+6);
    // Landable edge is the brightest line in this compact silhouette.
    c.shadowColor='rgba(20,39,30,.35)';c.shadowBlur=8;c.shadowOffsetY=2;
    this.pill(c,x-4,y-8,w+8,8,3,'#3c6655');
    c.shadowBlur=0;c.shadowOffsetY=0;
    this.pill(c,x-3,y-8,w+6,4,2,'#f7e7af');
    this.pill(c,x+7,y-11,Math.max(4,w-14),2,1,'#fffdf0');
    c.restore();
  }
  private moving(c:CanvasRenderingContext2D,p:Platform){
    const {x,y,w}=p,anchor=p.baseX??p.x,mid=anchor+w/2;
    // Suspended deck: slim, clearly non-solid cables stay in the upper scene.
    // Earlier full-height gantry POSTS crossed the walkable path and NPCs.
    const beamY=270;
    c.save();
    c.lineCap='round';
    c.strokeStyle='rgba(31,63,70,.35)';c.lineWidth=11;c.beginPath();
    c.moveTo(mid-90,beamY+4);c.lineTo(mid+90,beamY+4);c.stroke();
    c.strokeStyle='#80654b';c.lineWidth=8;c.beginPath();
    c.moveTo(mid-91,beamY);c.lineTo(mid+91,beamY);c.stroke();
    c.strokeStyle='#dfbf88';c.lineWidth=2;c.beginPath();
    c.moveTo(mid-85,beamY-3);c.lineTo(mid+85,beamY-3);c.stroke();
    for(const side of [-1,1]){
      const sx=mid+side*62,tx=x+w/2+side*(w*.36);
      this.oval(c,sx,beamY,10,10,'#5a4939');this.oval(c,sx,beamY,5,5,'#dbc69e');
      c.strokeStyle='#71583c';c.lineWidth=4;c.beginPath();c.moveTo(sx,beamY+10);c.lineTo(tx,y+1);c.stroke();
      c.strokeStyle='#e8c896';c.lineWidth=1.3;c.beginPath();c.moveTo(sx-1,beamY+11);c.lineTo(tx-1,y+1);c.stroke();
    }
    // Keep visible thickness close to the real one-way collision rectangle.
    c.shadowColor='rgba(23,40,34,.27)';c.shadowBlur=8;c.shadowOffsetY=5;
    const wood=c.createLinearGradient(0,y,0,y+20);wood.addColorStop(0,'#f6d5a2');wood.addColorStop(.35,'#bf9362');wood.addColorStop(1,'#704d38');
    this.pill(c,x-3,y,w+6,20,5,wood);c.shadowBlur=0;c.shadowOffsetY=0;
    this.pill(c,x+3,y+2,w-6,3,1,'#fff2d1');
    this.pill(c,x+4,y+17,w-8,3,1,'#594536');
    for(let i=1;i<5;i++){const xx=x+i*w/5;c.strokeStyle='rgba(80,53,35,.43)';c.lineWidth=1.5;c.beginPath();c.moveTo(xx,y+5);c.lineTo(xx,y+18);c.stroke();}
    this.oval(c,x+12,y+10,2.8,2.8,'#f7e8c5');this.oval(c,x+w-12,y+10,2.8,2.8,'#f7e8c5');
    c.restore();
  }
  private bridge(c:CanvasRenderingContext2D,p:Platform,t:number){
    const {x,y,w}=p;
    // Functional timber footbridge; the drawn walking deck is exactly the one-way collision top.
    const sway=Math.sin(t*1.8+x*.01)*1.5;
    c.save();
    // Two hand-rope rails with carved shore posts, not floating geometry.
    for(const px of [x-5,x+w+5]){
      const footY=566;
      c.strokeStyle='#5e4834';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(px,footY+1);c.lineTo(px,y-44);c.stroke();
      this.oval(c,px,y-47,5,6,'#d4a35d');
    }
    c.strokeStyle='#704b2f';c.lineWidth=5;c.beginPath();c.moveTo(x-5,y-39);c.quadraticCurveTo(x+w/2,y-16+sway,x+w+5,y-39);c.stroke();
    c.strokeStyle='#e9c588';c.lineWidth=2;c.beginPath();c.moveTo(x-5,y-41);c.quadraticCurveTo(x+w/2,y-18+sway,x+w+5,y-41);c.stroke();
    // Walking surface, plank-by-plank, aligned directly beneath the physical y coordinate.
    c.shadowColor='#1d2b24';c.shadowBlur=13;c.shadowOffsetY=6;
    const plankW=13;for(let i=0;i<Math.ceil(w/plankW);i++){
      const px=x+i*plankW;const seg=Math.min(plankW-1,x+w-px);const bob=Math.sin(i*.75+t*.9)*1.3;
      const g=c.createLinearGradient(0,y,0,y+14);g.addColorStop(0,i%3===0?'#eac38d':'#d2a875');g.addColorStop(1,i%3===0?'#8d6142':'#785237');
      this.pill(c,px,y+bob,seg,14,2,g);
      c.strokeStyle='rgba(80,56,35,.35)';c.lineWidth=1;c.beginPath();c.moveTo(px+3,y+5+bob);c.lineTo(px+seg-2,y+5+bob);c.stroke();
    }
    c.shadowBlur=0;c.shadowOffsetY=0;
    c.strokeStyle='#65442d';c.lineWidth=2;c.beginPath();c.moveTo(x,y+12);c.lineTo(x+w,y+12);c.stroke();
    // Rope lashings under the rail: support, depth, and readable silhouette.
    for(let i=1;i<5;i++){
      const px=x+i*w/5;
      const topY=y-39+(-16+39)*Math.sin(Math.PI*i/5);
      c.strokeStyle='#d5af79';c.lineWidth=2;c.beginPath();c.moveTo(px,topY);c.lineTo(px,y+1);c.stroke();
    }
    c.restore();
  }
  platform(c:CanvasRenderingContext2D,p:Platform,t=0){
    if(p.id.startsWith('bridge'))this.bridge(c,p,t);
    else if(p.moving)this.moving(c,p);
    else if(this.image('stone')&&this.image('grass')){
      // Static ledges/ground are built once and blitted as images on subsequent frames.
      // Their visual tops stay at the exact physics y coordinate.
      let cache=this.geometryCache.get(p.id);
      if(!cache){
        const ground=p.id.startsWith('ground'),margin=ground?10:24;
        const left=p.x-margin,top=p.y-30;
        const surface=document.createElement('canvas');surface.width=Math.ceil(p.w+margin*2);
        surface.height=Math.ceil(ground?425:565-p.y+75);
        const cc=surface.getContext('2d',{alpha:true});
        if(cc){cc.translate(-left,-top);if(ground)this.ground(cc,p);else this.ledge(cc,p);
          cache={surface,left,top};this.geometryCache.set(p.id,cache);}
      }
      if(cache)c.drawImage(cache.surface,cache.left,cache.top);
      else if(p.id.startsWith('ground'))this.ground(c,p);else this.ledge(c,p);
    }
    else if(p.id.startsWith('ground'))this.ground(c,p);
    else this.ledge(c,p);
    return true;
  }
  spring(c:CanvasRenderingContext2D,x:number,y:number,w:number,t:number){
    const im=this.image('trampoline');if(!im)return false;
    const width=w+18, height=width*im.naturalHeight/im.naturalWidth;
    const push=Math.sin(t*5)*.6;
    this.oval(c,x+w/2,y+3,(w+18)*.47,7,'rgba(20,39,34,.23)');
    c.drawImage(im,x-9,y-height+12+push,width,height);return true;
  }
}
