import {approach,clamp,distance,intersect,type Actor,type GameEvent,type InputFrame,type Platform,type Rect,type Ribbon,type Sim,type Stats,type Vec2} from './types.js';
/** Deterministic platformer with continuous movement, colliders and physical props. */
export class SideWorld implements Sim {
 readonly mode='side' as const; readonly width=3250;readonly height=760;
 readonly player:Actor={x:82,y:565,vx:0,vy:0};readonly ball:Actor={x:2125,y:540,vx:0,vy:0};
 readonly ribbons:Ribbon[]=[{x:298,y:429,got:false,id:1},{x:612,y:388,got:false,id:2},{x:1120,y:430,got:false,id:3},{x:1790,y:365,got:false,id:4},{x:2800,y:450,got:false,id:5}];
 readonly platforms:Platform[]=[
  {id:'ground-1',x:-100,y:565,w:975,h:140},
  {id:'ground-2',x:995,y:565,w:855,h:140},
  {id:'ground-3',x:1975,y:565,w:700,h:140},
  {id:'ground-4',x:2675,y:565,w:655,h:140},
  // Shallow, walkable rope-bridge spans for a forgiving Level 1; water remains below.
  {id:'bridge-1',x:870,y:565,w:132,h:16,oneWay:true},
  {id:'bridge-2',x:1845,y:565,w:135,h:16,oneWay:true},
  {id:'ledge-1',x:248,y:455,w:133,h:18,oneWay:true},{id:'ledge-2',x:565,y:424,w:112,h:18,oneWay:true},
  {id:'ledge-3',x:1020,y:464,w:92,h:18,oneWay:true},{id:'ledge-4',x:1510,y:418,w:135,h:18,oneWay:true},
  {id:'ledge-5',x:2050,y:443,w:110,h:18,oneWay:true},{id:'ledge-6',x:2790,y:468,w:123,h:18,oneWay:true},
  {id:'moving-1',x:1340,y:475,w:124,h:18,oneWay:true,moving:true,baseX:1340,baseY:475,amplitude:100,frequency:.9,phase:0},
  {id:'moving-2',x:2220,y:420,w:118,h:18,oneWay:true,moving:true,baseX:2220,baseY:420,amplitude:62,frequency:1.15,phase:1.3}
 ];
 // Bounce challenges: tall, solid garden pillars prevent bypass via a normal jump.
 // Their feet meet the ground and their crests are beyond the maximum regular jump arc.
 readonly bounceWalls:Rect[]=[{x:548,y:258,w:36,h:307},{x:1782,y:225,w:40,h:340}];
 // Spring tops align with the trampoline mat. Steel legs touch the 565px ground.
 readonly springs:Rect[]=[{x:465,y:532,w:58,h:33},{x:1698,y:532,w:58,h:33}];
 readonly gate:Rect={x:2530,y:410,w:24,h:155};readonly checkpoint:Vec2={x:82,y:565};
 readonly events:GameEvent[]=[];readonly stats:Stats={ribbons:0,attempts:0,finished:false,elapsed:0,interactions:0};
 gateOpen=false;grounded=true;private standId='ground-1';private wasGrounded=true;
 private coyote=.11;private buffer=0;private jumpHold=0;private time=0;private pushCooldown=0;
 get clock(){return this.time;}
 get gateRect():Rect{return this.gate;}
 reset(){
  Object.assign(this.player,{x:82,y:565,vx:0,vy:0});Object.assign(this.ball,{x:2125,y:540,vx:0,vy:0});
  this.grounded=true;this.wasGrounded=true;this.standId='ground-1';this.coyote=.11;this.buffer=0;this.jumpHold=0;this.time=0;this.pushCooldown=0;this.gateOpen=false;
  Object.assign(this.stats,{ribbons:0,attempts:0,finished:false,elapsed:0,interactions:0});Object.assign(this.checkpoint,{x:82,y:565});
  this.ribbons.forEach(r=>r.got=false);this.events.length=0;
 }
 private emit(type:GameEvent['type'],x=this.player.x,y=this.player.y){this.events.push({type,x,y})}
 private playerRect():Rect{return{x:this.player.x-16,y:this.player.y-46,w:32,h:46}}
 step(dt:number,input:InputFrame){
  if(this.stats.finished)return;
  dt=clamp(dt,0,1/30);this.events.length=0;this.time+=dt;this.stats.elapsed+=dt;this.pushCooldown=Math.max(0,this.pushCooldown-dt);
  for(const p of this.platforms){if(!p.moving)continue;
   const ox=p.x,oy=p.y;
   p.x=(p.baseX??p.x)+Math.sin(this.time*(p.frequency??1)+(p.phase??0))*(p.amplitude??0);
   p.y=(p.baseY??p.y)+(p.id==='moving-2'?Math.sin(this.time*1.5)*20:0);
   p.dx=p.x-ox;p.dy=p.y-oy;
  }
  const a=this.player;
  if(this.grounded){const platform=this.platforms.find(p=>p.id===this.standId);if(platform?.moving){a.x+=platform.dx??0;a.y+=platform.dy??0;}}
  this.wasGrounded=this.grounded;this.coyote=this.grounded?.115:Math.max(0,this.coyote-dt);
  this.buffer=input.jump?.145:Math.max(0,this.buffer-dt);
  const axis=clamp(input.x,-1,1),goal=axis*264;
  a.vx=approach(a.vx,goal,(axis!==0?(this.grounded?2350:1500):(this.grounded?3100:800))*dt);
  // Air-flow area changes velocity continuously; this is not a canned trajectory.
  if(a.x>1490&&a.x<1655)a.vx+=(Math.sin(this.time*4.4)*65+44)*dt;
  if(this.buffer>0&&this.coyote>0){a.vy=-675;this.grounded=false;this.coyote=0;this.buffer=0;this.jumpHold=.19;this.emit('jump');}
  a.vy=clamp(a.vy+(a.vy<0&&input.jumpHeld&&this.jumpHold>0?1130:1880)*dt,-1100,980);
  if(a.vy<0&&!input.jumpHeld&&this.jumpHold>0)a.vy=Math.max(a.vy,-275);
  this.jumpHold=Math.max(0,this.jumpHold-dt);
  const oldX=a.x,oldFeet=a.y;
  a.x=clamp(a.x+a.vx*dt,16,this.width-16);this.resolveHorizontal(oldX);this.resolveSpringSides(oldX);
  a.y+=a.vy*dt;this.grounded=false;this.standId='';
  if(a.vy>=0){for(const p of this.platforms){
    if(a.x+14<=p.x||a.x-14>=p.x+p.w)continue;
    if(oldFeet<=(p.y-(p.dy??0))+7&&a.y>=p.y&&a.y<=(p.y+p.h+22)){
     a.y=p.y;a.vy=0;this.grounded=true;this.standId=p.id;if(!this.wasGrounded)this.emit('land');break;
    }
   }}else{for(const p of this.platforms){if(p.oneWay)continue;
    if(a.x+12<=p.x||a.x-12>=p.x+p.w)continue;
    if(oldFeet-46>=p.y+p.h-3&&a.y-46<=p.y+p.h){a.y=p.y+p.h+46;a.vy=0;break;}
   }}
  // Land from above on the actual blue mat; cannot enter from the side/below.
  for(const pad of this.springs){if(a.vy>=0&&a.x>pad.x-14&&a.x<pad.x+pad.w+14&&oldFeet<=pad.y+7&&a.y>=pad.y){a.y=pad.y;a.vy=-1120;this.grounded=false;this.coyote=0;this.jumpHold=.12;this.emit('bounce');}}
  if(a.y>this.height+65){this.respawn();return;}
  this.updateBall(dt);
  if(!this.gateOpen&&this.ball.x>2290&&this.ball.x<2365&&this.ball.y>=538){this.gateOpen=true;this.emit('gate',this.gate.x,450);}
  if(!this.gateOpen&&input.interact&&Math.abs(a.x-2476)<100&&Math.abs(a.y-565)<120){this.gateOpen=true;this.stats.interactions++;this.emit('gate',this.gate.x,450);}
  if(input.interact&&Math.abs(a.x-1185)<100&&Math.abs(a.y-565)<130){this.stats.interactions++;this.emit('interact',1185,480);}
  for(const r of this.ribbons)if(!r.got&&distance({x:a.x,y:a.y-28},r)<34){r.got=true;this.stats.ribbons++;this.emit('ribbon',r.x,r.y);}
  if(a.x>1580&&this.checkpoint.x<1000){this.checkpoint.x=1590;this.checkpoint.y=565;this.emit('checkpoint');}
  if(a.x>2085&&this.checkpoint.x<1900){this.checkpoint.x=2095;this.checkpoint.y=565;this.emit('checkpoint');}
  if(a.x>=3090){this.stats.finished=true;this.emit('finish');}
 }
 private resolveSpringSides(oldX:number){
  const a=this.player;
  // The trampoline is an obstacle when approached on foot. Once airborne,
  // the player's body may overlap its mat from above to trigger a proper bounce.
  for(const pad of this.springs){
   if(a.y<=pad.y+3||a.y-46>=pad.y+pad.h)continue;
   if(oldX<=pad.x-16&&a.x+16>pad.x){a.x=pad.x-16;a.vx=0;}
   else if(oldX>=pad.x+pad.w+16&&a.x-16<pad.x+pad.w){a.x=pad.x+pad.w+16;a.vx=0;}
  }
 }
 private resolveHorizontal(oldX:number){
  const p=this.player,rr=this.playerRect(),colliders:Rect[]=[
   ...this.platforms.filter(v=>!v.oneWay),
   ...this.bounceWalls
  ];
  if(!this.gateOpen)colliders.push(this.gateRect);
  for(const r of colliders){if(!intersect(rr,r))continue;
   if(oldX<=r.x&&p.x+16>=r.x){p.x=r.x-16;p.vx=0;}
   else if(oldX>=r.x+r.w&&p.x-16<=r.x+r.w){p.x=r.x+r.w+16;p.vx=0;}
  }
 }
 private updateBall(dt:number){const b=this.ball;b.vy=Math.min(900,b.vy+1750*dt);b.vx=approach(b.vx,0,225*dt);
  if(b.x>1490&&b.x<1655)b.vx+=55*dt;
  const oldY=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;const r=21;
  for(const p of this.platforms){if(p.oneWay)continue;
   if(b.x+r<=p.x||b.x-r>=p.x+p.w)continue;
   if(oldY+r<=p.y+8&&b.y+r>=p.y&&b.vy>=0){b.y=p.y-r;b.vy=0;}
  }
  if(b.y>this.height+80)Object.assign(b,{x:2125,y:540,vx:0,vy:0});
  if(Math.abs(this.player.y-22-b.y)<46){const d=b.x-this.player.x;
   if(Math.abs(d)<39){const dir=d>=0?1:-1;this.player.x=b.x-dir*39;
    const speed=Math.abs(this.player.vx);b.vx=clamp(b.vx+dir*(speed*.7+50),-410,410);
    if(this.pushCooldown===0){this.emit('push',b.x,b.y);this.pushCooldown=.18;}
   }
  }
 }
 private respawn(){Object.assign(this.player,{x:this.checkpoint.x,y:this.checkpoint.y,vx:0,vy:0});this.grounded=true;this.standId=this.checkpoint.x>1900?'ground-3':this.checkpoint.x>=995?'ground-2':'ground-1';this.stats.attempts++;this.coyote=.11;this.jumpHold=0;this.emit('respawn');}
}
