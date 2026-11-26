/* Art direction layer: all art is drawn into existing static caches. No new collision geometry,
   no overlay on game UI, no shader or external asset dependency. */
const cinema18Wall=wallArt,cinema18Floor=detailedFloor,cinema18Furniture=furnitureModel;
function cinema18Capsule(x,y,w,h,c){rect(x,y,w,h,rgrad(0,y,h,polish18Tint(c,.35),polish18Tint(c,-.25)),Math.min(8,h/2));line(x+4,y+2,x+w-4,y+2,'#fff9e7a0',1.2)}
function cinema18Screw(x,y){rell(x,y,2.8,2.8,'#425864');rell(x-.5,y-.5,1.6,1.6,'#e2e7de');line(x-1,y+1,x+1,y-1,'#6b8587',.7)}
function cinema18Clock(x,y){softShadow(x+3,y+4,23,20,.21);rell(x,y,23,23,'#60777b');rell(x,y,20,20,rgrad(0,y-20,40,'#fffdf0','#dfded0'));for(let j=0;j<12;j++){let a=j*Math.PI/6;line(x+Math.sin(a)*16,y-Math.cos(a)*16,x+Math.sin(a)*18,y-Math.cos(a)*18,'#657579',1.5)}line(x,y,x+7,y-10,'#354c55',2);line(x,y,x-10,y-4,'#354c55',2.7);rell(x,y,2.2,2.2,'#af865a')}
function cinema18Poster(x,y,w,h,title,sub,accent){softShadow(x+w/2,y+h+3,w*.47,4,.13);rect(x,y,w,h,'#846f5c',4);rect(x+3,y+3,w-6,h-6,rgrad(0,y,h,'#fffae8','#e4d8ba'),2);rect(x+7,y+7,w-14,20,accent,2);spText(title,x+w/2,y+21,10,'#fff9e6',w-20);spText(sub,x+w/2,y+41,9,'#35535a',w-18);for(let j=0;j<2;j++)line(x+14,y+49+j*7,x+w-14,y+49+j*7,'#9a9d8460',.7)}
function cinema18Bottles(x,y,n){for(let i=0;i<n;i++){const X=x+i*31,hh=26+(i%3)*5;rect(X-8,y-hh,16,hh,rgrad(0,y-hh,hh,['#c7e0dc','#d8c9b1','#c8cfdc'][i%3],'#769b9b'),5);rect(X-5,y-hh-7,10,9,'#738f95',2);rect(X-6,y-15,12,9,'#f6f2db',1);line(X-5,y-hh+4,X-5,y-5,'#fffaf380',1)}}
function cinema18Shelf(x,y,w){rect(x,y,w,6,rgrad(0,y,6,'#c4b28d','#826e53'),1);for(const dx of [14,w-14])poly([[x+dx-5,y+6],[x+dx+5,y+6],[x+dx-5,y+21]],'#86765c')}
wallArt=function(p,t){cinema18Wall(p,t);const k=p[0],accent=p[3];
 // Finishing trim is physically behind the playfield. The color grade is applied only to static art.
 for(const x of [232,1183]){rect(x-3,25,6,273,rgrad(0,25,273,'#fff5d760','#233e4a23'),1)}
 if(['gym','classroom','band','science','cafeteria','factory','clinic'].includes(k))cinema18Clock(1221,70);
 if(k==='gym'){// Scored court backboard, nets and storage rail.
  rect(777,204,150,84,'#587484',4);rect(783,210,138,72,rgrad(0,210,72,'#486679','#2c4558'),3);spText('TEAM • PLAY',852,228,12,'#e9f4dc',129);for(const [x,c] of [[807,'#e6ae6b'],[851,'#c5d7bf'],[895,'#e8cf9b']]){rell(x,254,15,15,rgrad(0,239,30,c,'#688086'));rx.save();rx.beginPath();rx.arc(x,254,15,0,Math.PI*2);rx.clip();line(x-15,254,x+15,254,'#5d5e58',1);rx.beginPath();rx.ellipse(x,254,6,15,0,0,Math.PI*2);rx.strokeStyle='#5d5e58';rx.lineWidth=1;rx.stroke();rx.restore();rell(x-5,248,4,2,'#ffffff60')}
 }else if(k==='classroom'){cinema18Poster(821,53,104,70,'CLASS JOBS','Listen & help',accent);cinema18Shelf(270,218,155);for(let i=0;i<5;i++){let x=281+i*25;rect(x,202,18,16,['#bd8070','#76a1a7','#d0b477','#9f9d82'][i%4],2);line(x+3,204,x+15,204,'#fff5d8',1)}}
 else if(k==='science'){cinema18Shelf(805,182,302);cinema18Bottles(827,181,8);for(let j=0;j<3;j++){let x=513+j*72;rect(x,51,56,61,'#526e78',3);rect(x+3,54,50,55,rgrad(0,54,55,'#bbdce0','#739ca4'),2);poly([[x+5,56],[x+24,56],[x+5,85]],'#fffaf653');cinema18Screw(x+48,101)}}
 else if(k==='band'){// Instrument silhouettes recessed on acoustic wall, not in the walking space.
  for(const x of [287,1018]){const y=134;rx.save();rx.lineCap='round';rx.beginPath();rx.moveTo(x-17,y-31);rx.bezierCurveTo(x+20,y-39,x+27,y+14,x-4,y+24);rx.bezierCurveTo(x-29,y+35,x-32,y-8,x-8,y-9);rx.strokeStyle='#9b7344';rx.lineWidth=10;rx.stroke();rx.strokeStyle='#eac17b';rx.lineWidth=5;rx.stroke();rx.restore();poly([[x-11,y-36],[x-34,y-48],[x-34,y-25]],rgrad(0,y-48,23,'#efd48c','#ad824a'));for(let j=0;j<3;j++)cinema18Capsule(x+8+j*6,y-8,5,12,'#d2a96a')}
 }else if(k==='cafeteria'){for(let j=0;j<3;j++){let x=274+j*307;cinema18Capsule(x,175,239,11,'#9bb1b2');for(let i=0;i<4;i++)rell(x+26+i*58,174,22,5,'#f0e7ce');cinema18Screw(x+4,180);cinema18Screw(x+235,180)}}
 else if(k==='factory'){for(let i=0;i<5;i++){let x=552+i*65;rect(x,77,49,23,'#1f414a',3);rect(x+3,80,43,17,rgrad(0,80,17,'#a5d3b5','#537f7d'),1);for(let n=0;n<4;n++)rect(x+8+n*8,88,5,4,'#315a60',1);cinema18Screw(x+47,101)}}
 else if(k==='bakery'||k==='cafe'){cinema18Shelf(268,182,196);for(let i=0;i<5;i++){let x=282+i*33;rell(x,176,12,5,'#b4c7c6');rect(x-9,155,18,19,rgrad(0,155,19,'#f5e8d0','#a4b3ad'),4);rell(x,156,9,3,'#a6b0a5');rx.save();rx.beginPath();rx.arc(x+8,165,6,-Math.PI/2,Math.PI/2);rx.strokeStyle='#e6d8bb';rx.lineWidth=3;rx.stroke();rx.restore()}}
 else if(k==='library'||k==='games'){for(const x of [253,841])for(let j=0;j<2;j++){const y=125+j*125;line(x,y,x+330,y,'#dfbb865c',2);cinema18Screw(x+6,y+2)}}
 else if(k==='art'){cinema18Shelf(753,195,397);for(let i=0;i<9;i++){let x=769+i*40;rect(x-10,173,20,21,rgrad(0,173,21,['#d9a18a','#a8bdb2','#d4c08b'][i%3],'#787f76'),3);for(let j=0;j<3;j++){line(x-6+j*6,174,x-9+j*8,158,'#725c43',2);line(x-9+j*8,158,x-10+j*8,152,['#a76c6d','#597e96','#b3a46d'][j],3)}}}
 else if(k==='clinic'){cinema18Shelf(883,190,274);cinema18Bottles(906,189,7)}
 else if(k==='transit'){cinema18Poster(1115,104,100,76,'TRIP PLAN','Ask an adult',accent)}
 else if(k==='office'){cinema18Shelf(688,198,172);for(let i=0;i<4;i++)rect(702+i*37,175,26,22,rgrad(0,175,22,'#d4c4a5','#a49375'),2)}
 else if(k==='support'){cinema18Poster(829,194,154,72,'YOU BELONG','Listen first',accent)}
 else if(k==='shelter'){for(const x of [420,798]){rect(x-7,32,14,231,rgrad(0,32,231,'#d2bb94','#9d8061'),2);line(x-5,34,x-5,258,'#f4deae70',2)}}
 else {for(const x of [286,1130]){rell(x,203,19,5,'#b7a183');rect(x-15,172,30,30,rgrad(0,172,30,'#d6c4a1','#988568'),6);for(let j=0;j<5;j++){let a=(j-2)*.5;rx.save();rx.translate(x,177);rx.rotate(a);rell(0,-19,7,19,rgrad(0,-38,38,'#a5c291','#557e71'));rx.restore()}}}
 // Warm rim and wall bounce: no contrast-reducing overlay on text or characters.
 const edge=rx.createLinearGradient(0,0,1280,0);edge.addColorStop(0,'#19374820');edge.addColorStop(.15,'#19374800');edge.addColorStop(.87,'#19374800');edge.addColorStop(1,'#19374819');rx.fillStyle=edge;rx.fillRect(0,22,1280,276);
};
detailedFloor=function(p,t){cinema18Floor(p,t);const end=sy(SZ);rx.save();rx.beginPath();rx.rect(0,306,1280,end-306);rx.clip();const bounce=rx.createLinearGradient(0,306,0,end);bounce.addColorStop(0,'#24465222');bounce.addColorStop(.26,'#fff9df0a');bounce.addColorStop(.82,'#fff2cf09');bounce.addColorStop(1,'#28445013');rx.fillStyle=bounce;rx.fillRect(0,306,1280,end-306);const positions=p[0]==='factory'?[385,930]:[312,1010];for(const x of positions){let g=rx.createRadialGradient(x,399,8,x,399,214);g.addColorStop(0,'#fff9dc22');g.addColorStop(1,'#fff9dc00');rx.fillStyle=g;rx.fillRect(x-214,306,428,end-306)}rx.restore()};
furnitureModel=function(f,p){cinema18Furniture(f,p);const s=f.style,x=f.x,z=f.z,w=f.w,d=f.d,h=fixtureHeight(f),X=sx(x,z),Y=sy(z+d/2),W=Math.abs(sx(x+w/2,z+d/2)-sx(x-w/2,z+d/2));
 // Build subtle believable joinery at the furniture's own coordinates, rather than floating stickers.
 if(['teacher-desk','staff-desk','student-desk','art-table','banquet','picnic-table'].includes(s)){const q=plane(x-w/2+8,z+d/2-3,x+w/2-8,z+d/2-3,h-5);line(...q[0],...q[1],'#654f3b55',1);if(s!=='student-desk')for(const v of [-.35,.35])cinema18Screw(X+v*W,Y-h+12)}
 if(['service-counter','receiving-counter','lab-bench','lab-island','clinic-cabinet','locker','filing-counter'].includes(s)){const L=X-W*.43,R=X+W*.43;line(L,Y-6,R,Y-6,'#304a524e',1.3);line(L+2,Y-4,R-2,Y-4,'#e0ece54f',1);for(const q of [-1,1])cinema18Screw(X+q*W*.40,Y-h+14)}
 if(s==='sofa'||s==='seat-bank'){const n=Math.max(1,Math.floor(W/45));for(let j=0;j<n;j++){let a=X-W*.43+j*W*.86/n,b=a+W*.86/n;rx.save();rx.beginPath();rx.moveTo(a,Y-32);rx.quadraticCurveTo((a+b)/2,Y-36,b,Y-32);rx.strokeStyle='#f6eee766';rx.lineWidth=1.4;rx.stroke();rx.restore()}}
 if(s==='exam-bed'){line(X-W*.39,Y-h+6,X+W*.39,Y-h+6,'#f7fff3b0',1.8);line(X-W*.38,Y-h+11,X+W*.38,Y-h+11,'#64888b70',1)}
 if(s==='conveyor'){const a=plane(x-w/2+7,z-d/2+7,x+w/2-7,z+d/2-7,h+2);for(let j=0;j<3;j++)line(a[0][0]+j*4,a[0][1]+j,a[1][0]-j*4,a[1][1]+j,'#edf5ec55',1)}
 if(s==='music-chair'){line(X-W*.32,Y-h+10,X+W*.32,Y-h+10,'#e0f0e8a0',1.2)}
};
