/* Stage 18 environment overhaul. Geometry is projected into the walkable room,
not a reference-image overlay. All existing collision and hit regions are retained. */
if(compiledPack.levels.length>6){
const sceneProfiles={"birthday-invitation":["party","#f5dfd7","#e9b5ad","#a24f63","#f1d0a6","wood","INVITATIONS · CELEBRATIONS"],"bakery-order":["bakery","#f2e4cb","#c8b6a5","#4a7476","#e1b47c","tile","ORDER COLLECTION"],"library-club":["library","#e9d4af","#ad845f","#355b82","#cdb08c","carpet","STORY CLUB"],"shared-lunch":["cafeteria","#e0edf0","#98b8bc","#327b89","#c9dbd7","tile","SCHOOL CAFETERIA"],"sports-break":["gym","#e3e8ea","#a2b2bd","#34688b","#e5bf85","court","RECREATION GYM"],"recipe-revision":["office","#e3e5dd","#adc3b6","#526d69","#c2d1bf","tile","RECIPE RECORDS"],"class-science":["science","#d9e8e8","#8faeb7","#3d7280","#c0d8d8","lab","SCIENCE LAB"],"art-supplies":["art","#efe2d5","#dab99c","#997451","#e5c99c","wood","ART STUDIO"],"bus-trip":["transit","#e1e9ef","#95adbf","#345e85","#b4c8cd","rubber","FIELD TRIP OFFICE"],"market-stall":["factory","#dce2e2","#90a3a9","#3d555e","#b8c6c9","industrial","MARKET RECEIVING"],"handwash-club":["games","#e4dfef","#b3acc9","#645984","#d3c5dd","carpet","BOARD GAME CLUB"],"picnic-weather":["shelter","#e1e8d5","#a8b58d","#5d7950","#d6c7a5","stone","PICNIC PAVILION"],"club-bullying":["support","#f0e4dd","#d7b5a4","#946d76","#ddc8b2","carpet","STUDENT SUPPORT"],"cafe-order":["cafe","#e9dfcb","#b39b7b","#547470","#d9bc8e","tile","CAFÉ SERVICE"],"substitute-teacher":["classroom","#e4eadf","#a5b9a4","#466e65","#dfc9a2","wood","CLASSROOM"],"emergency-rehearsal":["clinic","#e4f0ec","#a3c9c5","#417e83","#cee0dc","lab","FIRST AID PRACTICE"],"accessible-fair":["fair","#f0e6d4","#d9b681","#916849","#e7c797","stone","FAIR WORKSHOP"],"festival-supply":["factory","#dce3e9","#9db0bd","#465a70","#b8ccd2","industrial","FESTIVAL DISTRIBUTION"],"welcome-rehearsal":["band","#e8dce1","#ae8f9d","#675576","#d7c3b5","wood","BAND REHEARSAL"],"welcome-promise":["assembly","#e5dff0","#b9aacb","#65547e","#dec9a6","wood","COMMUNITY ASSEMBLY"]};
const roomArt=()=>sceneProfiles[room?.task.id];
const shellBefore=realisticRoomShell,architectureCache=new Map();
const rect=(x,y,w,h,c,r=3)=>rrect(x,y,w,h,c,r);
const line=(x,y,X,Y,c,w=1)=>rline(x,y,X,Y,c,w);
function metal(x,y,w,h){rect(x,y,w,h,rgrad(0,y,h,'#e3eaeb','#758b91'),3);texRect('steel',x+2,y+2,w-4,h-4,.46);line(x+3,y+3,x+w-3,y+3,'#ffffffae',1.6)}
function cabinet(x,y,w,h,n,front,edge){rect(x-4,y-5,w+8,h+8,edge,5);rect(x,y,w,h,front,2);for(let i=0;i<n;i++){let a=x+i*w/n,ww=w/n;rect(a+3,y+5,ww-6,h-10,rgrad(0,y,h,front,edge),3);line(a+ww-16,y+16,a+ww-16,y+35,'#f0e6d0',3);line(a+6,y+8,a+ww-6,y+8,'#ffffff65',1);}}
function notice(x,y,w,h,title,rows,col){paperNotice(x,y,w,h,title,rows,col);}
function glass(x,y,w,h){rect(x-5,y-5,w+10,h+10,'#516d75',5);rect(x,y,w,h,rgrad(0,y,h,'#8fc7df','#e2eee0'),1);rx.save();rx.beginPath();rx.rect(x,y,w,h);rx.clip();for(let i=0;i<5;i++)rell(x+w*(i+.5)/5,y+h*.84,w*.13,h*.20,['#89ad83','#a3be88'][i%2]);rx.restore();line(x+w/2,y,x+w/2,y+h,'#ecedda',5);line(x,y+h*.55,x+w,y+h*.55,'#ecedda',5);poly([[x+8,y+8],[x+w*.42,y+8],[x+8,y+h*.52]],'#ffffff3b');rect(x-8,y+h,w+16,7,'#b7c8c2',2)}
function books(x,y,w,h){rect(x,y,w,h,'#634e3e',3);for(let row=0;row<2;row++){const yy=y+row*h/2;rect(x+5,yy+5,w-10,h/2-10,'#473c36',1);for(let i=0;i<Math.floor((w-16)/21);i++){let bh=28+(i*13+row*19)%Math.max(18,Math.floor(h/2)-33),xx=x+9+i*21,bottom=yy+h/2-7;const c=['#c26b64','#5c829d','#bca263','#71967f','#8b7da8'][i%5];rect(xx,bottom-bh,16,bh,rgrad(0,bottom-bh,bh,c,'#534b4c'),2);line(xx+3,bottom-bh+9,xx+13,bottom-bh+9,'#f4e8c6',1.7)}rect(x,yy+h/2-5,w,7,'#a6825d',1)}}
function lockers(x,y,w,h,front,edge,n=5){cabinet(x,y,w,h,n,front,edge);for(let i=0;i<n;i++){let a=x+(i+.5)*w/n;for(let j=0;j<4;j++)line(a-12,y+16+j*5,a+12,y+16+j*5,'#344c5570',1.5)}}
function shelfStock(x,y,w,h,col){rect(x,y,w,h,'#647881',4);for(let j=0;j<3;j++){let yy=y+j*h/3;rect(x+5,yy+5,w-10,h/3-9,'#36464b',1);for(let i=0;i<Math.floor(w/48);i++){const xx=x+8+i*48,hh=22+(i+j)%3*8;rect(xx,yy+h/3-hh-6,38,hh,['#caa06c','#9eb2ae','#e0c9a3'][i%3],2);rect(xx+6,yy+h/3-hh+2,25,10,'#f6edd8',2)}rect(x,yy+h/3-5,w,6,col,1)}}
function peg(x,y,w,h,col){rect(x,y,w,h,col,4);for(let a=x+10;a<x+w-8;a+=14)for(let b=y+10;b<y+h-8;b+=14)rell(a,b,1.1,1.1,'#28393d70')}
function wallArt(p,t){const [k,wall,lower,accent,top,floor,title]=p;
 rect(0,0,1280,306,rgrad(0,0,306,wall,lower),0);texRect(['cafeteria','bakery','science','clinic','factory','cafe'].includes(k)?'ceramic':'plaster',0,19,1280,278,.26);
 rect(0,0,1280,17,accent,0);rect(0,17,1280,5,'#fff6dd',0);rect(0,298,1280,8,accent,0);
 // Left 220px reserved for the real exit door. Rear fixtures are wall-mounted or flush to the wall.
 switch(k){
 case 'cafeteria':{for(let i=0;i<3;i++){let x=245+i*307;rect(x,55,285,148,'#365965',6);metal(x+5,60,275,12);rect(x+10,77,265,110,rgrad(0,77,110,'#b7d7d9','#5e8389'),2);rect(x+14,173,257,13,'#e3e9e3',2);for(let j=0;j<3;j++)rell(x+55+j*83,165,34,6,'#d5dfd7')}metal(232,202,955,25);cabinet(239,230,942,65,9,'#96b6b8','#597e83');notice(480,26,350,39,title,[],accent);break}
 case 'factory':{rect(230,30,960,253,'#788b91',4);for(let i=0;i<6;i++){let x=245+i*157;line(x,32,x,282,'#50636b',5);line(x+3,32,x+3,282,'#d4e0dc80',1.4)}shelfStock(245,53,250,171,accent);shelfStock(928,53,245,171,accent);metal(530,72,365,94);rect(548,85,329,65,'#354e58',4);for(let i=0;i<8;i++)rect(559+i*39,116,31,15,'#a3b0b0',2);notice(548,181,325,66,title,['RECEIVING · HOLD · REVIEW'],accent);rect(247,259,925,15,'#e9bf67',0);for(let x=250;x<1165;x+=42)poly([[x,259],[x+17,259],[x+3,274],[x-14,274]],'#53616a');break}
 case 'gym':{rect(232,205,950,91,'#7395aa',2);for(let x=240;x<1180;x+=58)rect(x,214,52,75,rgrad(0,214,75,'#a8c1cb','#567d96'),5);glass(250,43,213,126);glass(934,43,220,126);rect(535,48,212,108,'#f5f2e8',5);rect(588,79,106,59,'#b45b49',2);line(639,155,639,173,'#9b6351',6);rell(639,174,37,9,'#df7847');for(let i=0;i<8;i++)line(605+i*9,175,620+i*5,206,'#fff1d4',1.5);line(618,205,660,205,'#fff1d4',1.5);notice(760,63,146,84,'TEAM BREAK',['Together'],accent);break}
 case 'science':{glass(245,45,205,120);cabinet(472,40,278,127,3,'#9fbfc3','#557981');rect(783,39,360,162,'#55747e',5);metal(795,48,336,24);rect(803,79,320,107,'#345763',5);for(let j=0;j<5;j++){let xx=833+j*59;rect(xx,140,32,32,'#b4d5d8',3);rect(xx+9,119,14,25,'#e0ebd8',2);rell(xx+16,171,16,4,'#8eafa9')}metal(230,204,955,18);cabinet(238,226,940,70,10,'#a0b8b8','#577781');notice(267,173,180,30,'MATERIALS',[],accent);break}
 case 'classroom':{rect(244,36,565,177,'#8b714f',5);rect(252,44,549,161,'#355a50',3);for(let i=0;i<5;i++)line(275,81+i*22,777,81+i*22,'#e5e1c321',1);spText('EVERYONE CAN JOIN',526,95,26,'#f3e8c7',500);spText('Listen • Ask • Include',526,141,20,'#dce7c8',500);rect(247,211,560,9,'#c7a774',2);glass(841,40,310,151);books(854,204,289,88);break}
 case 'band':{for(let i=0;i<8;i++){let x=233+i*119;rect(x,24,108,211,rgrad(0,24,211,i%2?'#a58ba4':'#80697f','#4f455a'),4);for(let j=0;j<8;j++)line(x+7,34+j*25,x+101,34+j*25,'#d5c0c344',1)}rect(239,237,945,59,'#7a596a',2);for(let i=0;i<6;i++){let x=300+i*145;line(x,83,x,210,'#383c47',5);rell(x,215,35,6,'#333e48');rect(x-33,78,66,41,'#465363',3);for(let j=0;j<4;j++)line(x-23,87+j*7,x+22,87+j*7,'#c7bca3',1)}notice(465,31,350,39,title,[],accent);break}
 case 'library':case 'games':{books(240,35,353,255);books(838,35,344,255);glass(620,44,190,125);notice(622,179,187,97,k==='library'?'READ TOGETHER':'GAME CLUB',['Choose how to join'],accent);break}
 case 'bakery':case 'cafe':{glass(255,45,226,133);rect(509,36,408,153,'#594f45',5);rect(518,45,390,135,'#2f4847',2);spText(k==='cafe'?'TODAY’S MENU':'TODAY’S ORDERS',713,76,23,'#f6e9cd',375);for(let i=0;i<3;i++){line(540,99+i*24,866,99+i*24,'#edddbd80',1);rell(883,95+i*24,4,4,'#d7c697')}shelfStock(945,50,226,133,accent);metal(236,202,944,15);cabinet(244,221,929,74,9,'#b9a388','#796953');break}
 case 'clinic':{glass(253,43,241,141);cabinet(528,44,318,139,3,'#c4dedb','#699693');rect(871,51,302,135,'#edf4e8',5);rect(1006,73,31,76,'#a95658',3);rect(984,96,75,30,'#a95658',3);notice(530,198,316,83,'GET HELP NOW',['Tell an adult immediately'],accent);cabinet(249,213,241,80,3,'#a9c9c2','#648681');break}
 case 'transit':{glass(242,35,300,163);rect(570,45,594,156,'#d4e1e5',4);for(let i=0;i<4;i++){let x=600+i*154;rell(x,110,10,10,accent);if(i<3)line(x+10,110,x+144,110,accent,5);rect(x-17,138,80,12,'#8da7b4',2)}notice(593,51,530,44,'FIELD TRIP ROUTE',[],accent);lockers(242,220,923,74,'#9fb4c3','#587383',8);break}
 case 'office':{cabinet(240,42,395,249,5,'#b0bdb5','#6b8277');glass(661,44,209,137);notice(893,45,278,145,'CURRENT RECORDS',['Check the latest information','Report uncertainty'],accent);cabinet(661,201,510,90,5,'#b0c2b6','#688277');break}
 case 'art':{peg(246,38,453,170,'#c6a782');for(let i=0;i<7;i++){let x=270+i*60;line(x,82,x,174,'#6b6859',8);line(x,82,x,105,['#be6866','#8d9c5d','#7099b1'][i%3],11)}for(let i=0;i<4;i++){let x=734+i*108;rect(x,46,87,100,'#f9ebcc',4);rell(x+43,91,24,25,['#cb776a','#82a6a1','#d7b961','#9c83b5'][i]);}cabinet(240,222,942,73,9,'#c6aa85','#876b54');break}
 case 'shelter':{glass(239,30,940,213);for(let i=0;i<5;i++)rect(240+i*190,29,12,264,'#9e8666',2);rect(235,239,950,55,'#a18d70',3);notice(520,47,250,55,'RAIN PLAN',[],accent);break}
 case 'support':{glass(246,43,238,144);books(510,39,271,250);notice(810,39,355,149,'YOU BELONG',['Listen without pressure','Ask a trusted adult'],accent);cabinet(819,212,345,80,3,'#d4b5a4','#987c74');break}
 case 'party':case 'fair':case 'assembly':{glass(250,41,228,140);glass(947,41,228,140);rect(504,39,418,166,'#f6ead3',5);spText(k==='party'?'CELEBRATE TOGETHER':k==='fair'?'PLAY TOGETHER':'EVERYONE BELONGS',713,113,24,accent,392);for(let i=0;i<13;i++){let x=250+i*76,y=45+Math.sin(i/12*Math.PI)*20;poly([[x,y],[x+42,y+4],[x+21,y+45]],['#cc816f','#e4ba66','#78a9aa','#a38eb6'][i%4]);}cabinet(240,222,942,73,8,top,accent);break}
 }
 const shade=rx.createLinearGradient(0,0,0,88);shade.addColorStop(0,'#172f4039');shade.addColorStop(1,'#172f4000');rect(0,22,1280,66,shade,0);
}
function detailedFloor(p,t){const [k,wall,lower,accent,top,floor]=p,wood=['court','wood'].includes(floor),tile=['lab','tile','industrial','stone','rubber'].includes(floor),dep=wood?30:floor==='industrial'?86:58,step=wood?160:floor==='industrial'?170:105;
 const pal=floor==='court'?['#d2a56d','#e5c18a','#c89e66','#dbb880']:floor==='industrial'?['#a1b2b6','#b4c0c2','#97a9ae','#b9c4c5']:floor==='carpet'?['#b0a5b5','#c1b5c3','#b7abbb','#c6bac8']:floor==='rubber'?['#8b9ca6','#9fadb4','#8596a1','#aab6bb']:t.floor;
 for(let z=0;z<SZ;z+=dep)for(let x=-300-(wood&&Math.floor(z/dep)%2?80:0);x<1580;x+=step){let q=plane(x,z,x+step,Math.min(SZ,z+dep)),i=Math.abs(Math.floor(x/step)*7+Math.floor(z/dep)*3)%4;poly(q,pal[i]);texFace(wood?'oak':floor==='stone'?'stone':floor==='carpet'?'plaster':'ceramic',q,wood?.82:.55);poly(q,'#ffffff00',floor==='carpet'?'#645b6b26':'#47565b55',wood?.7:1)}
 if(floor==='court'){for(const z of [39,347])poly(plane(200,z,1160,z+4),'#f6f0df');for(const x of [190,640,1150])poly(plane(x,39,x+5,351),'#f6f0df');const q=plane(520,128,760,267);rx.save();rx.translate(640,sy(198));rx.scale(114,66);rx.beginPath();rx.arc(0,0,1,0,Math.PI*2);rx.strokeStyle='#f7eedb';rx.lineWidth=.045;rx.stroke();rx.restore()}
 if(floor==='industrial'){for(const x of [177,620,1040])for(let z=44;z<355;z+=30)poly(plane(x,z,x+7,z+18),'#eed18b');}
 if(floor==='carpet'){let q=plane(235,45,1040,350);poly(q,'#75678320','#fff3df80',2);for(let z=60;z<350;z+=44)poly(plane(250,z,1025,z+2),'#f2e4d33d')}
 if(k==='cafeteria'){for(const x of [235,725])poly(plane(x,40,x+300,355),'#75aeb21b','#f9f6de80',1.5)}
 const sh=rx.createLinearGradient(0,FLOOR,0,sy(160));sh.addColorStop(0,'#24363c45');sh.addColorStop(1,'#24363c00');rect(0,FLOOR,1280,sy(160)-FLOOR,sh,0);rect(0,sy(SZ),1280,720-sy(SZ),accent,0);rect(0,sy(SZ),1280,5,'#f3e7d0',0);
}
realisticRoomShell=function(t,kind){const p=roomArt();if(!p)return shellBefore(t,kind);const key=room.task.id+'-'+materialRevision;let im=architectureCache.get(key);if(!im){im=document.createElement('canvas');im.width=1280;im.height=720;const old=rx;try{rx=im.getContext('2d');wallArt(p,t);detailedFloor(p,t)}finally{rx=old}if(architectureCache.size>=6)architectureCache.clear();architectureCache.set(key,im)}rx.drawImage(im,0,0)};
/* A structural furniture vocabulary: silhouettes, supports and surfaces are
   projected from the same rectangles used by the collision system. Only special
   sink/rack/scrubbing fixtures retain the prior animation renderer. */
const oldFixture=drawFixture,customFixtureCache=new WeakMap();
function volume(x,z,w,d,h,base,front,side,top,material=null){
 const upper=plane(x-w/2,z-d/2,x+w/2,z+d/2,base+h),lower=plane(x-w/2,z-d/2,x+w/2,z+d/2,base);
 const F=[upper[3],upper[2],lower[2],lower[3]],R=[upper[1],upper[2],lower[2],lower[1]],L=[upper[0],upper[3],lower[3],lower[0]];
 poly(F,front);poly(R,side);poly(L,side);poly(upper,top);
 if(material){texFace(material,F,.28);texFace(material,R,.22);texFace(material,upper,.37)}
 shadeFace(F,'#ffffff10','#1b242838');shadeFace(R,'#ffffff05','#20303b45');shadeFace(upper,'#ffffff32','#263a3d16');line(...upper[3],...upper[2],'#ffffff9b',1.4);
}
function supportLegs(f,h,c,side,top){for(const dx of [-f.w/2+16,f.w/2-16])for(const dz of [-f.d/2+11,f.d/2-11])volume(f.x+dx,f.z+dz,12,12,h-8,0,c,side,top,'steel')}
function counterFace(f,h,p,n){const [k,wall,lower,accent,top]=p,xx=f.x,zz=f.z,w=f.w,d=f.d,cols=Math.max(2,n);
 volume(xx,zz,w-14,d-12,h-11,0,lower,accent,lower,['science','clinic','factory','bakery','cafe'].includes(k)?'steel':null);
 const fplane=plane(xx-w/2+10,zz+d/2-5,xx+w/2-10,zz+d/2-5),L=fplane[0][0],R=fplane[1][0],Y=fplane[0][1];
 for(let i=0;i<cols;i++){const u=L+(R-L)*i/cols,v=(R-L)/cols;rect(u+3,Y-h+18,v-6,h-26,rgrad(0,Y-h+18,h-26,lower,accent),3);line(u+v*.27,Y-h+29,u+v*.73,Y-h+29,'#f6f2e6',2.5)}
}
function physicalFurniture(f,p){const [k,wall,lower,accent,top]=p,h=fixtureHeight(f),x=f.x,z=f.z,w=f.w,d=f.d,X=sx(x,z),Y=sy(z+d/2);softShadow(X,Y+3,w*zscale(z)*.58,d*.32,.35);
 const topBlock=(mat='oak',color=top,depth=d)=>volume(x,z,w,depth,10,h-10,accent,accent,color,mat);
 switch(k){
 case 'cafeteria': // Integrated school lunch table with two bench seats in its real footprint.
  supportLegs(f,h,'#9cb8b7','#527781','#c6d1cd');
  volume(x,z,w-35,d*.25,8,24,'#7698a0','#526e78','#b9d6d0','steel');
  for(const q of [-1,1]){let zz=z+q*d*.36;volume(x,zz,w-12,d*.26,8,29,accent,'#4a6771','#abcac5','steel');for(const dx of [-w/2+24,w/2-24])volume(x+dx,zz,11,10,29,0,'#a9bec1','#657d84','#cbd5d2','steel')}
  topBlock('steel','#d7e5e1',d*.54);break;
 case 'factory': // Raised roller conveyor, solid side guards and numbered empty bins.
  supportLegs(f,h,'#9aaeb2','#445c68','#d6e0e0');
  volume(x,z,w-12,d-13,9,15,'#91a5ac','#405861','#9aafb4','steel');
  topBlock('steel','#beced1');for(let j=0;j<Math.floor(w/16);j++){const q=x-w/2+11+j*16;let u=plane(q,z-d/2+7,q+8,z+d/2-7,h+.6);poly(u,'#8a9ca3');line(...u[0],...u[3],'#e9f1ee',1)}
  for(const q of [-1,1])volume(x,z+q*(d/2-4),w,7,7,h-1,'#607b83','#415a62','#c1d2d2','steel');break;
 case 'science':case 'clinic': // Enclosed lab storage, reagent-free counter, clean work area.
  counterFace(f,h,p,Math.floor(w/70));topBlock('ceramic',k==='science'?'#49686e':'#d7e9e2');break;
 case 'classroom': // Individual classroom desk, open knee space and modesty panel.
  supportLegs(f,h,'#afbfbd','#627c79','#d5e3d9');volume(x,z-d*.24,w-23,7,37,11,accent,'#496259',lower);topBlock('oak','#d9bc88');break;
 case 'gym': // Metal equipment stand with low shelves; never a generic kitchen island.
  supportLegs(f,h,'#adc0c5','#456d82','#c4d1d4');volume(x,z,w-19,d-15,7,19,accent,'#4d6b7e','#98abb7','steel');for(let j=0;j<Math.floor(w/52);j++){const q=x-w/2+30+j*52,xx=sx(q,z),yy=sy(z)-29;rell(xx,yy,13,9,['#d6a35a','#668fa6','#bc796f'][j%3]);line(xx-6,yy-4,xx+6,yy+4,'#ffffff83',1.1)}
  topBlock('steel','#b7c8cc');break;
 case 'band': // Instrument console with a recessed grille, key strip and cable shelf.
  counterFace(f,h,p,3);topBlock('oak','#c9b3c5');
  {const q=plane(x-w/2+10,z+d/2-4,x+w/2-10,z+d/2-4),L=q[0][0],R=q[1][0],B=q[0][1];rect(L+8,B-55,R-L-16,28,'#3e4254',3);for(let j=0;j<Math.floor((R-L-26)/9);j++)line(L+15+j*9,B-51,L+15+j*9,B-30,'#85909c',1.1)}
  break;
 case 'library':case 'games': // Reading table above reachable storage cubbies.
  supportLegs(f,h,'#b79b77','#6f655d','#e0c9a1');volume(x,z,w-17,d-17,7,18,accent,'#756c66','#c4a784','oak');
  for(let j=0;j<Math.floor(w/25);j++){let xx=sx(x-w/2+20+j*25,z),yy=sy(z)-26,hh=18+(j%3)*5;rect(xx-8,yy-hh,16,hh,['#ad796b','#7794a2','#8b9e7b','#b49a70'][j%4],2)}
  topBlock('oak',k==='games'?'#d7c6db':'#d9bf94');break;
 case 'art': // Drafting worktable with shallow trays and a tool shelf beneath.
  supportLegs(f,h,'#c1aa8f','#806d5a','#e0cfaa');volume(x,z,w-20,d-16,6,19,accent,'#88715f','#d9bd95','oak');for(let j=0;j<3;j++)volume(x-w*.28+j*w*.28,z,Math.min(55,w*.23),d*.43,16,26,['#c4a787','#a7b5a1','#b49bb9'][j],accent,top);
  topBlock('oak','#e5cfaa');break;
 case 'bakery':case 'cafe': // Empty glass display cabinet. It cannot imply approval of real food.
  counterFace(f,h,p,Math.floor(w/85));topBlock('steel','#e0ded1');
  {const q=plane(x-w/2+10,z+d/2-4,x+w/2-10,z+d/2-4),L=q[0][0],R=q[1][0],B=q[0][1];rect(L+5,B-61,R-L-10,34,rgrad(0,B-61,34,'#c6dee0','#72969b'),4);for(let j=0;j<3;j++)line(L+12+j*(R-L-24)/3,B-56,L+29+j*(R-L-24)/3,B-31,'#ffffff79',2);line(L+8,B-32,R-8,B-32,'#e8ede3',3)}
  break;
 case 'office':case 'transit':case 'support':counterFace(f,h,p,Math.floor(w/84));topBlock('oak',top);break;
 case 'shelter': // Outdoor-style trestle table, protected interior pavilion.
  supportLegs(f,h,'#b19b7b','#756d56','#e1cca8');for(const q of [-1,1])volume(x,z+q*d*.30,w-25,7,7,26,accent,'#6b7357',top,'oak');topBlock('oak',top);break;
 default: // Event booths with fabric skirt; solid outline and true work surface.
  supportLegs(f,h,'#bdb7ac','#7b7771',top);volume(x,z,w-7,d-8,h-13,0,lower,accent,top);topBlock('oak',top);{
   let q=plane(x-w/2+5,z+d/2-3,x+w/2-5,z+d/2-3),L=q[0][0],R=q[1][0],B=q[0][1];for(let j=0;j<Math.floor((R-L)/27);j++)rect(L+j*27+5,B-h+15,13,h-24,'#fff4d726',1)}
 }
}
/*__ROOM_SPECIFIC_FURNITURE__*/
drawFixture=function(f,t){const p=roomArt();if(!p||['sink','counter','rack'].includes(f.style))return oldFixture(f,t);
 const h=fixtureHeight(f),X=sx(f.x,f.z),Y=sy(f.z),key=[materialRevision,room.task.id,f.x,f.z,f.w,f.d,f.style].join('|');
 let c=customFixtureCache.get(f);if(!c||c.key!==key){const points=plane(f.x-f.w/2,f.z-f.d/2,f.x+f.w/2,f.z+f.d/2),left=Math.floor(Math.min(...points.map(q=>q[0]))-45),top=Math.floor(Math.min(...points.map(q=>q[1]))-h-35),width=Math.ceil(Math.max(...points.map(q=>q[0]))-left+45),height=Math.ceil(Math.max(...points.map(q=>q[1]))-top+40);
  const im=document.createElement('canvas');im.width=Math.ceil(width*1.3);im.height=Math.ceil(height*1.3);const old=rx;try{rx=im.getContext('2d');rx.setTransform(1.3,0,0,1.3,-left*1.3,-top*1.3);if(modelHeights[f.style])furnitureModel(f,p);else physicalFurniture(f,p)}finally{rx=old}c={key,im,left,top,width,height};customFixtureCache.set(f,c)}
 rx.drawImage(c.im,c.left,c.top,c.width,c.height);const labelY=sy(f.z+f.d/2)-25;if(f.anchor){rect(X-65,labelY,130,16,'#f6edd8',3);spText(f.name,X,labelY+11,9,'#304951',124);}
 if(f.anchor){const o=f.anchor;roomHit.push({o,x:X,y:Y+f.d*.35,w:f.w*zscale(f.z),h:91});if(activeObject(o))drawTag(o,X,Y+f.d*.35+9)}
};
// State-dependent physical feedback follows the actual quest interaction. This is
// intentionally outside the collision layer: no new invisible hit regions.
const previousFX=immersionFX;
immersionFX=function(r,now,dt,walking){previousFX(r,now,dt,walking);const p=roomArt(),o=r?.actionObject&&roomObject(r.actionObject);if(!p||!o||r.actionTime<=0||preferences.reducedMotion)return;const X=sx(o.wx,o.wz),Y=sy(o.wz)-(o.surface?fixtureHeight(o.surface):0),a=Math.min(1,r.actionTime*2);rx.save();rx.globalAlpha=a*.8;
 if(['drum','bell','clap'].includes(o.type)){for(let j=0;j<3;j++){let u=(now/12+j*19)%60;rx.beginPath();rx.arc(X,Y-30,10+u,Math.PI*1.12,Math.PI*1.85);rx.strokeStyle=p[3];rx.lineWidth=2;rx.stroke()}}
 else if(o.type==='label'||o.type==='paper'||o.type==='board'){line(X-25,Y-22,X+25,Y-22,'#f9d98d',2);line(X-25,Y-27,X-25,Y-37,'#f9d98d',2);line(X+25,Y-27,X+25,Y-37,'#f9d98d',2)}
 else if(o.type==='sink'||o.type==='counter'){for(let i=0;i<5;i++)rell(X-25+i*12,Y-12-Math.sin(now/100+i)*7,2.5,2.5,'#f5fff5') }
 rx.restore();
};
if(window.__ALLY_ENABLE_QA===true)Object.assign(window.ALLY_ROOM_QA,{architecture:()=>{const p=roomArt();return p?{kind:p[0],floor:p[5],title:p[6],fixtureCount:room.plan.shelves.length,layout:room.plan.shelves.map(f=>[f.x,f.z,f.w,f.d])}:null}});
}
