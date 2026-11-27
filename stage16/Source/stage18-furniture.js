/* Model selection is per fixture, not per room. Floor plans own the physical footprints. */
const modelHeights={'welcome-stand':73,'notice-post':69,'banquet':68,'gift-cart':56,'seat-bank':36,'service-counter':85,'packing-cart':58,'staff-desk':65,'stock-shelf':78,'bookshelf':104,'reading-circle':62,'book-cart':55,'lunch-table':70,'bleachers':76,'equipment-cart':57,'filing-counter':75,'lab-bench':78,'lab-island':78,'lab-stool':38,'supply-cubby':68,'easel':74,'art-table':68,'reception':76,'locker':108,'receiving-counter':74,'conveyor':67,'game-table':62,'picnic-table':68,'sofa':38,'circle-table':59,'bistro':63,'teacher-desk':69,'student-desk':61,'exam-bed':44,'clinic-cabinet':85,'ticket-booth':79,'music-stand':77,'music-chair':37,'instrument-stand':57};
const priorHeight18=fixtureHeight;fixtureHeight=f=>modelHeights[f.style]||priorHeight18(f);
function furnitureModel(f,p){
 const h=fixtureHeight(f),x=f.x,z=f.z,w=f.w,d=f.d,style=f.style,metal='#849da3',dark='#425d66',light='#d0ddda',oak='#d7b482',wood='#927352',woodSide='#745a47',cloth='#789eaf',accent=p[3];
 const V=(X,Z,W,D,H,B,F,S,T,M=null)=>volume(X,Z,W,D,H,B,F,S,T,M);
 const top=(color=oak,mat='oak',width=w,depth=d,zz=z)=>V(x,zz,width,depth,7,h-7,wood,woodSide,color,mat);
 const legs=(height=h-7,width=w,depth=d,zz=z,c=metal)=>{for(const dx of [-width/2+10,width/2-10])for(const dz of [-depth/2+8,depth/2-8])V(x+dx,zz+dz,7,7,Math.max(4,height),0,c,dark,light,'steel')};
 const frame=(height=h-7)=>{V(x,z,w-12,d-12,height,0,p[2],accent,p[4]);};
 const chair=(X,Z,W,D,H=35)=>{for(const dx of [-W/2+7,W/2-7])for(const dz of [-D/2+5,D/2-5])V(X+dx,Z+dz,5,5,H-5,0,metal,dark,light,'steel');V(X,Z,W,D,6,H-6,cloth,dark,'#a6bfca');V(X,Z+D/2-4,W,6,30,H,cloth,dark,'#b6cbd0');};
 const wheel=(X,Z)=>{const xx=sx(X,Z),yy=sy(Z)-5;rell(xx,yy,7,7,'#35454b');rell(xx,yy,3,3,'#b5c2c1');};
 const shelving=(rows=2,booksMode=false)=>{frame();for(let j=0;j<rows;j++){let base=j*(h-8)/rows+5;V(x,z,w-6,d-5,5,base,wood,woodSide,oak,'oak');for(let i=0;i<Math.floor(w/24);i++){let X=x-w/2+14+i*24,Z=z+d/2-7,hh=booksMode?12+(i*7+j*5)%17:12+(i%2)*6;V(X,Z,17,Math.min(20,d-9),hh,base+5,['#b88b69','#8fa5a8','#c2a46e','#94a68d'][i%4],woodSide,light)}}top(p[4],'oak');};
 softShadow(sx(x,z),sy(z+d/2)+2,w*zscale(z)*.58,Math.max(8,d*.27),.30);
 switch(style){
 case 'bleachers': // Three stepped seating tiers, no worktops or desks.
  for(let i=2;i>=0;i--){let depth=d/3,zz=z+d/2-depth*(i+.5),height=22+i*25;V(x,zz,w,depth,height,0,'#667d91','#425e73','#aabac8','steel');V(x,zz,w,depth-3,5,height,'#a8b8c8','#536c83','#c7d2da','steel');for(let j=1;j<6;j++)V(x-w/2+j*w/6,zz,3,depth-4,2,height+5,'#7b90a4','#536c83','#7b90a4');}break;
 case 'notice-post':case 'welcome-stand':case 'music-stand':
  V(x,z,Math.min(w,56),Math.min(d,27),5,0,metal,dark,light,'steel');V(x,z,8,8,h-12,4,metal,dark,light,'steel');V(x,z,w,d-4,8,h-8,style==='music-stand'?'#354f61':wood,dark,style==='music-stand'?'#547180':'#e9d9b8');break;
 case 'equipment-cart':case 'packing-cart':case 'book-cart':case 'gift-cart':case 'instrument-stand':
  for(const dx of [-w/2+10,w/2-10])for(const dz of [-d/2+8,d/2-8])wheel(x+dx,z+dz);legs(h-7,w,d,z);V(x,z,w-9,d-7,5,16,metal,dark,light,'steel');V(x,z,w,d,7,h-7,metal,dark,style==='gift-cart'?'#e8c89b':'#c5d4d1','steel');V(x+w/2-5,z,6,d,20,h-20,dark,dark,metal);if(style==='equipment-cart'){for(let j=0;j<3;j++){let xx=sx(x-w*.28+j*w*.27,z),yy=sy(z)-30;rell(xx,yy,10,10,['#d58c4a','#7aa5af','#c68b6c'][j]);line(xx-7,yy,xx+7,yy,'#6a5247',1)}}break;
 case 'student-desk':{const depth=d*.64,zz=z-d*.16;legs(h-7,w-8,depth,zz);top('#dbbe91','oak',w,depth,zz);V(x,zz-d*.15,w-18,5,18,21,metal,dark,light);chair(x,z+d*.27,Math.min(48,w*.49),d*.40,29);break;}
 case 'teacher-desk':case 'staff-desk':legs();V(x,z-d*.27,w-16,7,40,12,wood,woodSide,oak,'oak');V(x+w*.31,z,Math.min(w*.26,52),d-11,h-12,0,wood,woodSide,oak,'oak');top('#dbbd8d');break;
 case 'music-chair':chair(x,z,w-7,d-7,h);break;
 case 'lab-stool':V(x,z,7,7,h-6,0,metal,dark,light,'steel');V(x,z,w-8,d-10,5,8,metal,dark,light,'steel');top('#779da5','steel');break;
 case 'seat-bank':case 'sofa':{const c=style==='sofa'?'#b49aa8':'#799eaf';legs(15);V(x,z,w,d,22,12,c,dark,'#d0c2c5');V(x,z-d*.35,w,12,30,32,c,dark,'#d6c6c6');for(let j=1;j<Math.ceil(w/65);j++)V(x-w/2+j*w/Math.ceil(w/65),z,2,d-8,2,34,'#596c76','#596c76','#596c76');break;}
 case 'lunch-table':case 'picnic-table':{const dep=d*.46;legs(h-7,w,dep,z);for(const q of [-1,1]){let zz=z+q*d*.37;legs(29,w-8,d*.23,zz);V(x,zz,w-5,d*.24,6,29,style==='picnic-table'?wood:metal,dark,style==='picnic-table'?oak:'#b5c8c7',style==='picnic-table'?'oak':'steel')}top(style==='picnic-table'?oak:'#d4e4df',style==='picnic-table'?'oak':'steel',w,dep,z);break;}
 case 'conveyor':{legs();top('#a7bdc1','steel');if(w>d){for(let q=x-w/2+7;q<x+w/2-6;q+=15)V(q,z,8,d-10,3,h-1,metal,dark,light,'steel')}else{for(let q=z-d/2+7;q<z+d/2-6;q+=13)V(x,q,w-10,7,3,h-1,metal,dark,light,'steel')}break;}
 case 'bookshelf':case 'stock-shelf':case 'supply-cubby':shelving(style==='bookshelf'?3:2,style==='bookshelf');break;
 case 'locker':case 'clinic-cabinet':case 'filing-counter':case 'service-counter':case 'receiving-counter':case 'reception':case 'lab-bench':case 'lab-island':case 'ticket-booth':
  counterFace(f,h,p,Math.max(2,Math.floor(w/58)));top(['lab-bench','lab-island'].includes(style)?'#496970':p[4],['lab-bench','lab-island','receiving-counter','service-counter','clinic-cabinet'].includes(style)?'steel':'oak');break;
 case 'exam-bed':legs(h-10);V(x,z,w,d,12,h-12,'#9cb9bc','#63868c','#e6efea');V(x-w*.33,z,w*.24,d-9,7,h,'#d6e2df','#9cb8b7','#f8faf1');break;
 case 'easel':{legs(35);V(x,z,w-5,d-15,6,h-6,wood,woodSide,oak);V(x,z-d/2+4,w-12,8,39,h-39,wood,woodSide,'#e6d6b6');break;}
 case 'reading-circle':case 'circle-table':case 'bistro':case 'game-table':{legs(h-7,w*.7,d*.65,z);const pts=[];for(let i=0;i<24;i++){let a=i*Math.PI/12,xx=x+Math.cos(a)*w*.49,zz=z+Math.sin(a)*d*.49;pts.push([sx(xx,zz),sy(zz)-h])}poly(pts,wood);const pts2=pts.map(q=>[q[0],q[1]-3]);poly(pts2,style==='game-table'?'#9eb5af':oak,'#f2ddbd',2);break;}
 default:legs();top(style==='banquet'?'#e6c59d':oak,'oak');break;
 }
}

const boardWords={'birthday-invitation':['YOU ARE INVITED','Eating is optional'],'bakery-order':['ORDER PENDING','Ask about ingredients'],'library-club':['READ · LISTEN','Choose your reward'],'shared-lunch':['LUNCH TOGETHER','No food trading'],'sports-break':['TEAM BREAK','Wash · clean · play'],'recipe-revision':['CURRENT RECIPE','Check every label'],'class-science':['SCIENCE FOR ALL','Review materials'],'art-supplies':['PAPER ART','Ask about supplies'],'bus-trip':['TRIP CHECKLIST','Know who can help'],'market-stall':['STOCK ON HOLD','Never guess labels'],'handwash-club':['GAME CLUB','Soap and water'],'picnic-weather':['RAIN PLAN','Food and play apart'],'club-bullying':['YOU BELONG','Listen · tell an adult'],'cafe-order':['ORDER PENDING','Ask before serving'],'substitute-teacher':['CLASS CHOICES','No food required'],'emergency-rehearsal':['DRILL ONLY','Get help immediately'],'accessible-fair':['FAIR FOR ALL','Choose how to play'],'festival-supply':['HOLD · REVIEW','Keep tools separate'],'welcome-rehearsal':['REHEARSAL','Clap · bell · drum'],'welcome-promise':['EVERYONE BELONGS','Ask · check · include']};
const detailBefore18=drawDetailedItem;drawDetailedItem=function(o){detailBefore18(o);const words=boardWords[room?.task.id];if(o.type==='board'&&words){rrect(-60,-123,120,28,'#416b76',4);spText(words[0],0,-105,11,'#fff7de',115);spText(words[1],0,-72,11,'#344f55',115);rline(-46,-52,46,-52,'#b8a77f',1.4);}};
