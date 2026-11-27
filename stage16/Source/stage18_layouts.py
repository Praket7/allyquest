"""Room-specific floor plans. Each fixture footprint is also its collision boundary.
The quest graph is independent of the furniture; every prop is explicitly assigned.
"""
# (model, centre x,z, width,depth, anchor, supported prop IDs)
L={
'birthday-invitation': [('welcome-stand',290,65,110,35,None,'record'),('banquet',500,280,335,85,'activity','games'),('gift-cart',930,110,175,55,None,'invitation'),('seat-bank',825,55,220,42,None,'')],
'bakery-order': [('service-counter',465,72,430,62,None,'record label'),('packing-cart',870,215,165,62,None,'parcel ticket'),('staff-desk',300,300,175,65,'review',''),('stock-shelf',1040,55,150,48,None,'')],
'library-club': [('welcome-stand',280,75,110,36,None,'record'),('bookshelf',505,58,240,52,None,''),('reading-circle',530,280,185,92,'activity','bookmarks'),('book-cart',930,160,125,55,None,'prize'),('seat-bank',900,65,180,48,None,'')],
'shared-lunch': [('service-counter',430,70,350,62,None,'record'),('lunch-table',320,235,240,88,None,'tray'),('lunch-table',820,290,260,86,'activity','cards'),('lunch-table',820,117,245,78,None,'')],
'sports-break': [('notice-post',265,68,105,32,None,'record'),('bleachers',585,57,400,62,None,''),('sink',1005,75,145,58,'sink',''),('equipment-cart',1060,280,145,62,'counter','snack cloth')],
'recipe-revision': [('filing-counter',395,80,265,58,None,'record label'),('stock-shelf',880,65,210,50,None,'parcel'),('staff-desk',735,270,200,74,'review','ticket')],
'class-science': [('lab-bench',410,80,320,62,None,'record label'),('lab-island',780,228,280,88,'activity','kit'),('lab-bench',280,305,165,58,None,'material'),('lab-stool',1050,75,55,44,None,'')],
'art-supplies': [('supply-cubby',305,66,200,50,None,'record label'),('easel',580,230,110,55,None,'heartpiece'),('art-table',860,278,245,95,'activity','sunpiece'),('supply-cubby',1000,65,150,45,None,'material')],
'bus-trip': [('reception',420,70,350,60,None,'record plan'),('seat-bank',720,62,180,45,None,''),('staff-desk',870,268,210,80,'activity','schedule notice'),('locker',285,290,110,55,None,'')],
'market-stall': [('receiving-counter',350,68,220,58,None,'record label'),('conveyor',790,132,340,75,None,'parcel ticket'),('staff-desk',300,295,155,70,'review',''),('stock-shelf',910,306,230,52,None,'')],
'handwash-club': [('notice-post',300,65,120,36,None,'record'),('sink',1000,74,150,58,'sink',''),('game-table',530,250,240,95,'counter','piece cloth'),('seat-bank',850,320,180,42,None,'')],
'picnic-weather': [('welcome-stand',295,70,120,40,None,'record'),('sink',1040,70,145,55,'sink',''),('picnic-table',575,240,330,100,'activity','tray signcard'),('seat-bank',875,330,210,48,None,'')],
'club-bullying': [('reception',390,75,270,60,None,'record report'),('sofa',480,285,240,74,None,''),('circle-table',810,235,155,82,'activity','invite notice'),('seat-bank',900,60,160,45,None,'')],
'cafe-order': [('service-counter',510,75,440,65,None,'record label'),('equipment-cart',990,268,145,62,None,'utensil'),('bistro',335,290,145,75,None,'order'),('reception',860,105,180,60,'review','')],
'substitute-teacher': [('teacher-desk',350,70,195,58,None,'record envelope'),('student-desk',320,167,112,53,None,''),('student-desk',570,167,112,53,None,''),('student-desk',820,167,112,53,None,''),('student-desk',320,304,112,53,None,''),('student-desk',570,304,112,53,None,''),('student-desk',820,304,112,53,'activity','kit'),('supply-cubby',1015,75,125,50,None,'snack')],
'emergency-rehearsal': [('notice-post',320,70,110,36,None,'record'),('exam-bed',800,110,250,90,None,''),('clinic-cabinet',1000,55,135,45,None,''),('seat-bank',330,300,180,46,None,'')],
'accessible-fair': [('ticket-booth',380,70,240,72,None,'record prize'),('game-table',780,245,230,100,'activity','ticket signcard'),('seat-bank',1000,65,180,42,None,''),('gift-cart',330,300,140,58,None,'')],
'festival-supply': [('conveyor',325,219,145,210,None,'tray spoon'),('receiving-counter',720,65,245,58,None,'record label'),('equipment-cart',860,280,200,70,'counter',''),('stock-shelf',1025,70,125,55,None,'')],
'welcome-rehearsal': [('music-stand',290,70,105,35,None,'record'),('music-stand',500,78,105,35,None,'notice'),('supply-cubby',1010,65,130,48,None,'snack'),('music-chair',390,230,78,55,None,''),('music-chair',565,305,78,55,None,''),('instrument-stand',770,270,175,60,None,'claps bell'),('music-chair',980,320,78,55,None,'')],
'welcome-promise': [('reception',390,70,285,62,None,'record label'),('sink',1010,70,145,55,'sink',''),('banquet',790,275,275,86,'activity','kit signcard'),('gift-cart',300,245,145,60,None,'parcel'),('seat-bank',510,340,175,42,None,'')],
}
# Floor objects use authored independent locations; no invisible collision extensions.
F={
'birthday-invitation':{'board':(650,63),'review':(1085,310)},
'bakery-order':{'board':(760,55),'hold':(1090,330)},
'library-club':{'board':(710,65),'hold':(1100,315)},
'shared-lunch':{'board':(650,65),'hold':(1095,310)},
'sports-break':{'board':(845,65),'hold':(1125,365)},
'recipe-revision':{'board':(650,55),'hold':(1070,315)},
'class-science':{'board':(710,65),'hold':(1100,320)},
'art-supplies':{'board':(610,65),'hold':(1100,315)},
'bus-trip':{'board':(920,65),'review':(1100,320)},
'market-stall':{'board':(630,55),'hold':(1100,240)},
'handwash-club':{'board':(640,60),'hold':(1090,290)},
'picnic-weather':{'board':(660,55),'hold':(1100,295)},
'club-bullying':{'board':(680,55),'review':(1090,305)},
'cafe-order':{'board':(790,50),'hold':(1100,355)},
'substitute-teacher':{'board':(665,52),'review':(1065,240),'hold':(1080,340)},
'emergency-rehearsal':{'board':(585,65)},
'accessible-fair':{'board':(700,65),'hold':(1090,300)},
'festival-supply':{'board':(480,55),'hold':(1110,325),'returnbin':(1095,220)},
'welcome-rehearsal':{'board':(690,55),'hold':(1110,340),'drum':(660,150)},
'welcome-promise':{'board':(690,55),'hold':(1100,310)},
}
N={'notice-post':'Team notice stand','welcome-stand':'Welcome stand','banquet':'Activity table','gift-cart':'Supply cart','seat-bank':'Seating','service-counter':'Serving counter','packing-cart':'Packing trolley','staff-desk':'Staff review','stock-shelf':'Storage shelving','bookshelf':'Bookcase','reading-circle':'Reading circle','book-cart':'Book trolley','lunch-table':'Lunch seating','bleachers':'Bleachers','equipment-cart':'Equipment cart','filing-counter':'Records counter','lab-bench':'Lab bench','lab-island':'Experiment island','lab-stool':'Lab stool','supply-cubby':'Storage cubbies','easel':'Easel','art-table':'Art table','reception':'Reception','locker':'Lockers','receiving-counter':'Receiving counter','conveyor':'Roller conveyor','game-table':'Game area','picnic-table':'Picnic table','sofa':'Sofa','circle-table':'Discussion circle','bistro':'Café seating','teacher-desk':'Teacher desk','student-desk':'Student desk','exam-bed':'Examination bed','clinic-cabinet':'Medical cabinet','ticket-booth':'Fair booth','music-stand':'Music stand','music-chair':'Musician chair','instrument-stand':'Percussion rack','sink':'Handwashing sink'}
def apply_layout(r,rid):
 if rid not in L:return
 by={o['id']:o for o in r['objects']};assigned=set();r['shelves']=[];r['solids']=[]
 def put(id,x,z,surface=None,fixture=False):
  assert id in by and id not in assigned,(rid,id);assigned.add(id);o=by[id];o.update(x=x,ox=x,wx=x,wz=z,surface=surface);o.pop('fixture',None);o.pop('slot',None)
  if fixture:o['fixture']=True
 for style,x,z,w,d,anchor,ids in L[rid]:
  items=ids.split();j=len(r['shelves']);name=by[anchor]['label'] if anchor else N[style]
  r['shelves'].append(dict(name=name,x=x,z=z,w=w,d=d,style=style,anchor=anchor,items=items))
  if anchor:put(anchor,x,z,j,True)
  for i,id in enumerate(items):
   # Center items on the modeled work surface; separate targets in screen space.
   xx=x+(i-(len(items)-1)/2)*min(105,(w-30)/max(1,len(items)-1));put(id,xx,z,j)
  r['solids'].append(dict(x1=x-w/2,x2=x+w/2,z1=z-d/2,z2=z+d/2,ref=['shelf',j]))
 for id,(x,z) in F[rid].items():put(id,x,z)
 put('adult',1142,152);put('charm',1180,380)
 assert assigned==set(by),(rid,set(by)-assigned)
 for o in r['objects']:
  if o['surface'] is None and o['type'] in ('board','bin','npc','drum','crate'):
   x,z=o['wx'],o['wz'];w=45 if o['type']=='board' else 24;r['solids'].append(dict(x1=x-w,x2=x+w,z1=z-15,z2=z+15,ref=['object',o['id']]))
 if rid=='sports-break':
  old='Equipment workbench';new='Equipment cleaning cart';by['counter']['label']=new
  for f in r['shelves']:
   if f['anchor']=='counter':f['name']=new
  for n in r['graph']['nodes'].values():
   n['prompt']=n['prompt'].replace(old.lower(),new.lower())
   for e in n['edges']:e['label']=e['label'].replace(old,new);e['lesson']=e['lesson'].replace(old.lower(),new.lower())
 # Reject geometric overlap, and ensure each model footprint has its exact collider.
 from itertools import combinations
 for a,b in combinations(r['solids'],2):
  assert not (max(a['x1'],b['x1'])<min(a['x2'],b['x2']) and max(a['z1'],b['z1'])<min(a['z2'],b['z2'])),(rid,'overlap',a['ref'],b['ref'])
 if rid=='sports-break':
  assert set(f['style'] for f in r['shelves'])=={'notice-post','bleachers','sink','equipment-cart'}
  assert sum(f['w']*f['d'] for f in r['shelves'])<1280*400*.12
 if rid=='substitute-teacher':assert sum(f['style']=='student-desk' for f in r['shelves'])>=6
 if rid=='welcome-rehearsal':assert sum(f['style']=='music-chair' for f in r['shelves'])>=3
