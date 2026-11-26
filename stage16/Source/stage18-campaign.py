"""Welcome Street expansion. Authored scenarios with shared, declarative room geometry.
Run from any directory. The original five levels and eleven rooms remain byte-identical as data.
"""
from pathlib import Path
import json, copy
P=Path(__file__).parent
pack=json.loads((P/'content.json').read_text());pack['archetypes']={}
# chapter, location, character problem, setting, adult, teaching topics, object names / type, evidence, actions, concluding message
# Action kinds: inspect (use), transfer (move), rehearsal (gesture). All actions use fictional props.
# Each physical route begins with responsible adult guidance and ends in explicit review.
S=[
('birthday-invitation','The Birthday Invitation','Party planning room','community','teacher','Maya','A friend was told that the birthday cake is the ticket to joining the party. Maya wants to change the invitation.','include,ask','Party invitation','paper','The invitation says everyone must eat cake. A friend may choose not to eat or explain why.',[('move','invitation','Food-only invitation','paper','review','Review folder','bin','Set the old invitation aside for the adult to revise.'),('move','games','Game cards','paper','activity','Game table','table','Set out an activity everyone can join without eating.'),('use','board','Welcome message','board','','','','A welcoming invitation offers a choice and does not ask anyone to disclose an allergy.')],'Every friend is invited to play, whether or not they eat.'),
('bakery-order','The Bakery Order','Order review counter','market','chef','Leo','A bakery delivery for the next neighborhood party has no complete ingredient record. Leo needs a plan before the order is served.','labels,ask','Order docket','paper','The ingredient information for this practice order is missing. The box name is not enough.',[('use','label','Current package record','label','','','','Read the current information, including the missing ingredient details.'),('move','parcel','Unverified bakery box','package','hold','Adult review bin','bin','Keep the box unopened and separate for the adult.'),('move','ticket','Order correction card','paper','review','Order review desk','table','Leave a record of the unanswered question for the adult.')],'Uncertain food stays on hold; a trusted adult checks the individual plan.'),
('library-club','A Seat at Story Club','Library reading club','library','teacher','Ari','A reading club is offering mystery snacks as the prize for reading. Ari wants the club to be enjoyable without food pressure.','include,ask','Club reward list','paper','The reward list requires accepting a snack. Nobody should have to eat to earn recognition.',[('move','prize','Mystery snack prize','package','hold','Adult review bin','bin','Set the snack aside for the librarian.'),('move','bookmarks','Bookmark kit','paper','activity','Reading table','table','Put the non-food reward where the group can reach it.'),('use','board','Story circle plan','board','','','','Invite the friend to read, listen or draw, as they choose.')],'Story Club celebrates reading with bookmarks and invitations to everyone.'),
('shared-lunch','The Shared Lunch Tray','Lunch supervision room','school','chef','Ethan','A friend offers to swap lunches, not realizing that another student follows an individual allergy plan. Help the group avoid food sharing.','ask,include,contact','Lunch plan notice','paper','The lunch plan says food is not exchanged between students.',[('move','tray','Practice shared tray','tray','hold','Adult review area','bin','Pause the exchange and set the practice tray aside under adult guidance.'),('use','board','Lunch seating plan','board','','','','Choose a welcoming seating plan that follows the individual plan, not isolation by default.'),('move','cards','Conversation game','paper','activity','Shared game table','table','Arrange a non-food conversation activity for the group.')],'Friends can eat their own meals and enjoy lunch together without trading food.'),
('sports-break','Half-Time Together','Recreation equipment room','park','teacher','Leo','The sports team is passing around snacks and then touching the shared equipment. Leo wants everyone to join the second half.','contact,wash,include','Team break notice','paper','Food residue can transfer to shared objects even if nothing looks dirty.',[('move','snack','Unverified snack','package','hold','Adult holding bin','bin','Separate snacks from the equipment with the adult’s guidance.'),('gesture','sink','Practice handwashing','sink','','','','Wash with soap and running water for at least 20 seconds in real life.'),('move','cloth','Practice cleaning cloth','cloth','counter','Equipment workbench','counter','Bring cleaning supplies to the adult-directed work area.'),('gesture','counter','Equipment workbench','counter','','','','Practice cleaning motions; the adult decides the real cleaning procedure.')],'The team follows handwashing and equipment procedures and welcomes everyone back.'),
('recipe-revision','The Changed Recipe','Recipe comparison office','market','chef','Maya','The same brand of snack arrived with a new recipe. Maya has noticed a different ingredient list and asks for help.','labels,ask','Previous recipe card','paper','Yesterday’s recipe is not evidence of today’s ingredients.',[('use','label','Current ingredients: wheat, milk, sugar','label','','','','This fictional recipe now lists milk. Tell the adult; do not assume suitability.'),('move','parcel','Changed recipe carton','package','hold','Adult review bin','bin','Separate the changed package while the adult checks the individual plan.'),('move','ticket','Change notification','paper','review','Records desk','table','Record that the recipe changed; do not label it universally safe.')],'The crew checks every current label instead of relying on an old approval.'),
('class-science','Science Without Surprises','Science activity lab','school','teacher','Ethan','A science demonstration uses an egg carton and loose flour. A student is worried about the activity but wants to participate.','labels,include,contact','Science activity plan','paper','Food ingredients and residues can also occur in science materials.',[('move','material','Used egg carton prop','crate','hold','Materials hold bin','bin','Set the practice carton aside for adult review.'),('use','label','Material list: flour','label','','','','The fictional activity lists wheat flour. Ask the adult to evaluate materials.'),('move','kit','Paper model kit','crate','activity','Experiment bench','table','Prepare an adult-reviewed non-food model instead.'),('gesture','activity','Experiment bench','table','','','','Rehearse assembling the model without handling food.')],'The science class can learn the same idea using a reviewed alternative.'),
('art-supplies','The Hidden Craft Ingredient','Art materials studio','community','teacher','Ari','A craft dough tub has arrived without clear materials information. Ari wants to finish the community display without putting a friend at risk.','labels,include','Materials receipt','paper','A craft material is not automatically appropriate because it is not intended to be eaten.',[('use','label','Craft dough: ingredient details incomplete','label','','','','Incomplete craft-material information needs adult review.'),('move','material','Unverified dough tub','jar','hold','Materials review bin','bin','Set the practice tub aside.'),('move','heartpiece','Paper heart','heart','board','Community display','board','Add a paper heart to the adult-reviewed display.'),('move','sunpiece','Paper sun','sun','activity','Craft table','table','Prepare a second non-food decoration to invite a friend to help.')],'Art materials are reviewed and the display includes everyone.'),
('bus-trip','The Field Trip Bus','Trip planning office','school','teacher','Maya','Tomorrow’s trip includes a bus ride and lunch stop. A friend is anxious that nobody has thought about their allergy plan.','ask,include,emergency','Trip itinerary','paper','Trips need the same attention to individual allergy plans and emergency preparedness as school.',[('use','board','Trip meeting points','board','','','','Find the responsible adult and agreed meeting points before leaving.'),('move','plan','Private plan envelope','paper','review','Staff folder','bin','Bring the closed envelope to the adult; do not read or share private medical details.'),('move','schedule','Trip schedule','paper','activity','Planning desk','table','Include time for handwashing and staff-supervised meals.'),('use','notice','Emergency contact reminder','paper','','','','An adult prepares emergency supplies and knows how to get help promptly.')],'A responsible adult coordinates the plan and the friend can join the trip.'),
('market-stall','The Market Mystery','Market stockroom','market','chef','Leo','A volunteer put two unlabeled containers on the festival stall. Help them keep the delivery separate and find current records.','labels,ask','Stock receipt','paper','Matching container color is not a reliable ingredient record.',[('move','parcel','Unlabeled container','jar','hold','Adult review bin','bin','Set the container aside without tasting it.'),('use','label','Delivery list: item identity uncertain','label','','','','Record the missing identity rather than guessing.'),('move','ticket','Missing label report','paper','review','Inventory desk','table','Give the adult a record of the uncertainty.'),('use','board','Stock separation plan','board','','','','Unverified materials remain separate until a responsible adult reviews them.')],'The volunteer learns to keep records current and never guess about ingredients.'),
('handwash-club','The Sticky Game Pieces','Board-game workshop','library','teacher','Ethan','After snack time a game piece was handled with unwashed hands. Ethan wants to get the game ready again without blaming anyone.','contact,wash','Game room notice','paper','Food proteins may remain on hands and objects. Hand sanitizer alone is not a reliable way to remove food allergens.',[('move','piece','Used game piece','star','hold','Equipment review bin','bin','Stop using the affected piece and tell the adult.'),('gesture','sink','Handwashing sink','sink','','','','Rehearse soap-and-running-water handwashing; real handwashing lasts at least 20 seconds.'),('move','cloth','Cleaning cloth','cloth','counter','Cleaning bench','counter','Bring the adult-directed practice cleaning supplies to the bench.'),('gesture','counter','Cleaning bench','counter','','','','Practice cleaning the work surface; visible cleanliness alone is not proof of allergen removal.')],'The group uses adult-directed cleaning and good handwashing, without shaming anyone.'),
('picnic-weather','The Rainy Picnic','Picnic shelter','park','teacher','Ari','Rain moved the picnic indoors, where the group planned to put all the snacks on one table. Ari wants the new space to follow the same allergy plan.','contact,ask,include','New picnic map','paper','Moving indoors changes the layout, not the need to follow individual allergy plans.',[('move','tray','Unverified picnic tray','tray','hold','Adult holding bin','bin','Separate the practice tray before anyone eats.'),('move','signcard','Non-food activity sign','paper','board','Shelter notice board','board','Show where everyone can play without food.'),('use','activity','Picnic activity table','table','','','','Keep a distinct activity zone away from food.'),('gesture','sink','Practice handwashing','sink','','','','Remember soap and running water before and after eating.')],'The rainy-day plan preserves the same precautions and welcomes everyone.'),
('club-bullying','More Than a Joke','Student support room','school','teacher','Maya','A classmate joked that a friend should just eat the snack and stop being difficult. Maya wants to support the friend and get help.','include,ask','Anonymous concern card','paper','Pressure and allergy teasing can be harmful. Take concerns seriously without exposing anyone’s private information.',[('use','board','Respectful club promise','board','','','','Practice saying: You do not have to eat anything to belong.'),('move','report','Private concern envelope','paper','review','Staff report box','bin','Bring the concern to the responsible adult without public disclosure.'),('move','invite','Inclusive invitation','paper','activity','Club activity table','table','Offer a choice to join without food pressure.'),('use','notice','Trusted adult contacts','paper','','','','Tell an adult about bullying or unsafe behavior. Do not retaliate.')],'The friend is heard, the concern is reported and the club makes a welcoming change.'),
('cafe-order','A Question at the Cafe','Cafe service counter','market','chef','Leo','A cafe menu says a dish is free from one ingredient, but the current recipe and preparation process are uncertain. Leo wants the adult to handle the order.','labels,contact,ask','Menu information','paper','A claim about one allergen does not prove a food is suitable for every person.',[('use','label','Current recipe and shared equipment question','label','','','','Ask about current ingredients and shared equipment; no game can approve food.'),('move','order','Practice order ticket','paper','review','Chef review desk','table','Keep the order pending for responsible adult review.'),('move','utensil','Used serving spoon','spoon','hold','Equipment return bin','bin','Separate used serving equipment.'),('use','board','Order status board','board','','','','Do not promise that a dish is safe; the adult follows the individual plan.')],'The order remains pending until the responsible adult has enough information.'),
('substitute-teacher','A New Teacher Today','Classroom planning room','school','teacher','Ethan','A substitute teacher arrived and is planning a class reward with snacks. Ethan wants the adult to know the school plan without sharing anyone’s private details.','include,ask','Classroom activity schedule','paper','A change in staff is a reason to check existing procedures, not to make new food decisions.',[('move','envelope','Staff procedure envelope','paper','review','Teacher folder','bin','Give the closed procedure envelope to the responsible adult.'),('move','snack','Proposed food reward','package','hold','Adult review bin','bin','Hold the proposed reward for review.'),('move','kit','Activity choice cards','paper','activity','Class activity desk','table','Prepare non-food rewards for everyone.'),('use','board','Class choice board','board','','','','Offer choices without requiring anyone to explain their allergy.')],'The substitute has the procedures and the class celebrates without food pressure.'),
('emergency-rehearsal','Speak Up Right Away','First-aid rehearsal room','community','nurse','Ari','This is a fictional emergency rehearsal: a friend says their throat feels tight after eating. Get help immediately; no other task comes first.','emergency','Emergency drill notice','paper','In a real emergency, alert a responsible adult and get emergency medical help immediately.',[],'The drill ends with the adult responding promptly, following the emergency plan and using epinephrine when indicated. No time score.'),
('accessible-fair','The Fairground Plan','Fair activity workshop','park','teacher','Maya','A festival booth has snacks as prizes and an arrangement that leaves a friend outside the group. Help the adult prepare a welcoming activity.','include,ask','Booth prize list','paper','Food prizes can exclude friends. A non-food reward can include more participants.',[('move','prize','Unverified food prize','package','hold','Adult hold bin','bin','Remove the proposed food prize for adult review.'),('move','ticket','Sticker reward cards','paper','activity','Game table','table','Prepare non-food rewards.'),('move','signcard','Open-to-everyone sign','paper','board','Booth sign stand','board','Create an invitation without food requirements.'),('gesture','activity','Game table','table','','','','Rehearse setting up a game that offers multiple ways to join.')],'The booth offers a welcoming game and non-food prizes.'),
('festival-supply','The Festival Supply Mix-up','Festival receiving room','festival','chef','Leo','Two trays were placed together and nobody is sure which tools touched them. Chef Marco needs the situation reported and the practice equipment separated.','contact,labels,ask','Receiving record','paper','When equipment use is uncertain, stop using the affected items and consult the adult.',[('move','tray','Questionable practice tray','tray','hold','Adult hold bin','bin','Keep the tray out of use.'),('move','spoon','Used serving spoon','spoon','returnbin','Equipment return box','crate','Separate used tools from the designated work area.'),('use','label','Current delivery information','label','','','','Bring the current ingredient details to the adult.'),('gesture','counter','Practice work surface','counter','','','','Practice the adult-directed cleaning motion; the game does not certify food or equipment.')],'The receiving team documents the mix-up and follows adult-directed separation.'),
('welcome-rehearsal','The Welcome Rehearsal','Community stage room','festival','teacher','Ethan','The crew is rehearsing the closing celebration. A friend wants to play music instead of joining the snack activity. Make that choice part of the plan.','include,wash,ask','Rehearsal programme','paper','Friends may join a celebration without eating or disclosing their medical details.',[('move','snack','Shared snack prop','package','hold','Adult holding area','bin','Keep the practice snack out of the activity area.'),('use','notice','Music sequence card','paper','','','','Offer a musical activity: clap, bell, drum.'),('gesture','claps','Clap pads','clap','','','','Rehearse the first beat.'),('gesture','bell','Bell','bell','','','','Rehearse the second beat.'),('gesture','drum','Drum','drum','','','','Rehearse the final beat.')],'The rehearsal celebrates every friend’s contribution, including music and non-food activities.'),
('welcome-promise','Everyone Belongs','Welcome Street assembly','festival','teacher','Ari','The neighborhood festival is ready for its final welcome. The crew must combine current information, individual plans, equipment separation and a non-food celebration.','ask,labels,contact,wash,include','Festival promise','paper','The promise is to ask, check, prevent cross-contact, include and get immediate help when needed.',[('use','label','Current supply record: missing details','label','','','','The missing details must be reviewed; nobody tastes to test.'),('move','parcel','Unverified festival carton','package','hold','Adult review bin','bin','Keep it separate for the adult.'),('gesture','sink','Handwashing sink','sink','','','','Practice handwashing with soap and running water.'),('move','signcard','Everyone belongs card','paper','board','Welcome promise board','board','Put up the welcome promise without food pressure.'),('move','kit','Non-food celebration kit','crate','activity','Celebration table','table','Set out the adult-reviewed activity so everyone can participate.')],'Welcome Street celebrates a community that listens, includes, checks and speaks up.')
]
assert len(S)==20
# Layouts vary within a shared geometry vocabulary. Keep a 100-unit aisle between workstations.
T={
 'community':('#e8e4d9','#dbd6c9','#b49372','#795c48','#e5d7bb','#426c78','#e6b65e',['#d5c0a5','#ddcbb6','#e3d4be','#d2bc9c'],'desk','craft'),
 'market':('#e7e4d6','#dcd8c8','#a38d70','#766052','#b7c9c9','#417b74','#e9b878',['#c9d1cb','#e0e1d8','#c4cec8','#d7dbcf'],'lab','steel'),
 'library':('#ede3d2','#e0d1bb','#b58762','#826447','#e7cfab','#576f8c','#dca565',['#d3b591','#e0c7a8','#c7ab8c','#dbc0a0'],'desk','craft'),
 'school':('#dfebed','#d5e1df','#8fa6a7','#4e6e79','#c6d9d9','#3c6981','#e4b65a',['#c6d4d1','#dee4d9','#c1d0cf','#d7dfd7'],'lab','desk'),
 'park':('#e2ead8','#d0e0c9','#9baf84','#667d60','#e2d9b9','#477a69','#e7bd65',['#d1d7be','#dfe0cd','#c4cfb7','#d5daca'],'craft','desk'),
 'festival':('#efe0e4','#e6d6da','#b08d7e','#7f626b','#e7d2bc','#78628f','#edbe69',['#d5c1aa','#e4d0bc','#d6bdae','#dec8b6'],'craft','desk')}
HERO=['ethan','maya','leo','ari']; adults={'teacher':'Ms. Rivera','chef':'Chef Marco','nurse':'Nurse Lina'}
room_topics={}
for i,s in enumerate(S,6):
 rid,title,roomtitle,setting,adult,friend,story,topics,evidence,etype,efact,actions,end=s
 room_topics[rid]=topics.split(','); themeid='theme-'+rid; emergency=rid=='emergency-rehearsal'; wall,tile,wood,side,top,trim,accent,floor,style1,style2=T[setting]
 # Theme palette with distinct signed wall fixtures, window arrangement and visual teaching cues.
 sign=roomtitle.upper(); wall_parts=[]
 if i%3==0: wall_parts=[{'kind':'window','x':248,'y':43,'w':230,'h':164},{'kind':'panel','x':514,'y':46,'w':296,'h':140,'title':sign,'lines':['Ask • check • include','A responsible adult reviews']},{'kind':'shelf','x':855,'y':72,'w':315,'h':81},{'kind':'plant','x':1110,'y':180,'w':80,'h':91}]
 elif i%3==1: wall_parts=[{'kind':'panel','x':256,'y':54,'w':280,'h':140,'title':sign,'lines':['Current information matters','Everyone has a place']},{'kind':'shelf','x':579,'y':74,'w':250,'h':74},{'kind':'window','x':875,'y':40,'w':301,'h':160},{'kind':'plant','x':770,'y':180,'w':77,'h':91}]
 else: wall_parts=[{'kind':'window','x':252,'y':46,'w':205,'h':151},{'kind':'shelf','x':487,'y':68,'w':246,'h':86},{'kind':'panel','x':768,'y':42,'w':350,'h':145,'title':sign,'lines':['Listen to friends','Follow the individual plan']},{'kind':'plant','x':1130,'y':175,'w':80,'h':96}]
 pack['archetypes'][themeid]={'theme':dict(wall=wall,tile=tile,floor=floor,wood=wood,side=side,top=top,trim=trim,accent=accent,name=sign),'wall':wall_parts}
 r={'meta':[roomtitle,themeid,adult],'look':[wall,tile,trim,sign,'custom'],'lesson':{'title':title,'theme':roomtitle,'why':efact,'end':end},'story':[title,story,end,'Friendship note','Give the note to your friend.','Invite without pressure.','activity'],'charm':title+' charm','kit':None,'education':{'objective':rid,'adultReview':True,'emergency':emergency,'reviewStatus':'pending-specialist','source':'https://www.cdc.gov/school-health-conditions/food-allergies/','topics':topics.split(',')},'steps':[],'incident':None,'objects':[],'shelves':[],'solids':[]}
 def obj(id,label,t,x,z,surface=None,**kw):
  if any(o['id']==id for o in r['objects']): return
  r['objects'].append(dict(id=id,label=label,type=t,x=x,y=485,ox=x,oy=485,wx=x,wz=z,surface=surface,**kw))
 def shelf(name,x,z,w,d,sty,anchor=None,items=()):
  if not anchor and not items:return
  j=len(r['shelves']);r['shelves'].append(dict(name=name,x=x,z=z,w=w,d=d,style=sty,items=[v[0] for v in items],anchor=anchor[0] if anchor else None));
  if anchor: obj(*anchor,x,z,surface=j,fixture=True)
  for k,(id,label,typ) in enumerate(items): obj(id,label,typ,x+(k-(len(items)-1)/2)*min(108,(w-68)/max(1,len(items)-1)),z,surface=j,slot=k)
 # Register task objects, retaining distinct physical types and destinations.
 defs={'record':(evidence,etype)}
 for kind,id,label,typ,to,tol,tot,msg in actions:
  defs[id]=(label,typ)
  if to:defs[to]=(tol,tot)
 if 'board' not in defs:defs['board']=('Community notice','board')
 obj('adult',adults[adult],'npc',1142,152)
 # Large freestanding objects on rear/right wall, portable materials on shelves, nonportable sinks/tables as anchors.
 boarddefs=[(k,*v) for k,v in defs.items() if v[1]=='board']; bins=[(k,*v) for k,v in defs.items() if v[1]=='bin' or k=='returnbin']; anchors=[(k,*v) for k,v in defs.items() if v[1] in ('sink','counter','table','rack')]; floorobjs=[(k,*v) for k,v in defs.items() if v[1]=='drum'];
 excluded={v[0] for v in boarddefs+bins+anchors+floorobjs}; ports=[(k,*v) for k,v in defs.items() if k not in excluded];
 # Need independent click targets; use separated shelves and dedicate wide label stand when present.
 left=[v for v in ports if v[0]=='record' or v[2]=='label']; others=[v for v in ports if v not in left];
 # Three islands with clear center aisle and a small front supply stand if needed.
 # Screen positions and object occlusion audited in browser tests.
 rear_x=335 if i%2==0 else 360; rear2_x=820 if i%2==0 else 835
 shelf('Evidence desk',rear_x,119,300,70,style1,None,left)
 rear_anchor=next((a for a in anchors if a[2]=='sink'),None)
 if rear_anchor: anchors.remove(rear_anchor)
 shelf(rear_anchor[1] if rear_anchor else 'Supply station',rear2_x,119,240 if rear_anchor else 292,70,'sink' if rear_anchor else style2,rear_anchor,[] if rear_anchor else others[:2]);
 if not rear_anchor:others=others[2:]
 # Front islands with 2-3 small props each. Keep front edges below rear table foot line.
 a=anchors.pop(0) if anchors else None
 shelf(a[1] if a else 'Activity supplies',335,286,300,76,'counter' if a and a[2]=='counter' else style2,a,others[:2]);others=others[2:]
 a=anchors.pop(0) if anchors else None
 shelf(a[1] if a else 'Practice materials',800,286,300,76,'counter' if a and a[2]=='counter' else style1,a,others[:3]);others=others[3:]
 assert not anchors and not others,(rid,anchors,others)
 for j,(k,l,t) in enumerate(boarddefs):obj(k,l,t,600+j*120,59)
 for j,(k,l,t) in enumerate(bins):obj(k,l,t,1100,266+j*78)
 for j,(k,l,t) in enumerate(floorobjs):obj(k,l,t,600,195+j*50)
 obj('charm',r['charm'],'charm',1166,369,optional=True)
 r['solids']=[{'x1':f['x']-f['w']/2,'x2':f['x']+f['w']/2,'z1':f['z']-f['d']/2,'z2':f['z']+f['d']/2,'ref':['shelf',j]} for j,f in enumerate(r['shelves'])]
 # No false full-length wall behind an object. The back-wall boundary is the shared engine bound.
 for o in r['objects']:
  if o['surface'] is None and o['type'] in ('board','bin','npc','drum'):
   x,z=o['wx'],o['wz'];w=55 if o['type']=='board' else 25;r['solids'].append(dict(x1=x-w,x2=x+w,z1=z-16,z2=z+16,ref=['object',o['id']]))
 def edge(kind,id,next,label,lesson,**kw):return dict(kind=kind,id=id,next=next,label=label,lesson=lesson,**kw)
 def node(prompt,*edges,complete=False):return dict(prompt=prompt,edges=list(edges),**({'complete':True} if complete else {}))
 nodes={}
 if emergency:
  nodes['arrived']=node('Practice drill: a friend has a tight throat after eating. Get adult and emergency help NOW.',edge('consult','adult','done','Get adult help now','I am calling emergency services and following the emergency plan. Epinephrine is first-line for anaphylaxis; do not delay help.'))
 else:
  nodes['arrived']=node('Find the '+evidence.lower()+', or ask '+adults[adult]+' for guidance.',edge('use','record','evidence','Inspect '+evidence,efact),edge('consult','adult','guided','Ask first','Thank you for asking. '+efact+' Let us follow the practice plan together.'))
  nodes['evidence']=node('Tell '+adults[adult]+' what you learned from the '+evidence.lower()+'.',edge('consult','adult','guided','Report evidence','Thank you for speaking up. We will follow the individual plan and keep uncertain items out of use.'))
  # The help-first branch still gets the evidence lesson. Parallel work is represented
  # as two real alternatives only where order is safe (review/inspect versus separation).
  def make_action(a,nxt):
   kind,id,label,typ,to,tol,tot,msg=a; kw={'to':to} if kind=='move' else {'n':4 if typ=='sink' else 3 if typ=='counter' else 2} if kind=='gesture' else {};return edge(kind,id,nxt,label,msg,**kw)
  def prompt(a):
   kind,id,label,typ,to,tol,tot,msg=a
   return ('Carry '+label.lower()+' to '+tol.lower()+'.' if kind=='move' else 'Practice '+label.lower()+'. Repeat the action as prompted.' if kind=='gesture' else 'Inspect '+label.lower()+'.')
  # Offer alternate safe ordering of a non-food inspection and a first hold/record action only.
  a0,a1=actions[:2]; branch=(a0[0]=='use' and a1[0]=='move') or (a0[0]=='move' and a1[0]=='use')
  if branch and a0[1]!=a1[1]:
   nxt='work-2' if len(actions)>2 else 'review';nodes['guided']=node(prompt(a0)+' Or '+prompt(a1).lower(),make_action(a0,'first-done'),make_action(a1,'second-done'));nodes['first-done']=node(prompt(a1),make_action(a1,nxt));nodes['second-done']=node(prompt(a0),make_action(a0,nxt));start=2
  else:
   start=0
  for j,a in enumerate(actions[start:],start):
   k='guided' if j==0 else 'work-'+str(j);nxt='review' if j==len(actions)-1 else 'work-'+str(j+1);nodes[k]=node(prompt(a),make_action(a,nxt))
  nodes['review']=node('Ask '+adults[adult]+' to review the completed practice plan.',edge('consult','adult','done','Final adult review',end))
 nodes['done']=node(end+' Return outside to continue.',complete=True);r['graph']={'start':'arrived','nodes':nodes}
 # Two actors use independent, state-aware policy weights, never authorize or handle food.
 r['crew']={'jobs':['Check '+evidence.lower(),'Arrange the non-food activity'],'favor':['friendship note','Listen and invite without food pressure.'],'routine':['organize','check supplies','visit a friend','rest'],'profiles':{'peer':{'goals':[{'id':'records','mode':'organize','target':'record','weight':4,'speed':88,'dwell':1.6},{'id':'notice','mode':'check supplies','target':'board','weight':3,'speed':78,'dwell':2.2},{'id':'rest','mode':'rest','weight':1,'speed':65,'dwell':1.8}]},'helper':{'goals':[{'id':'visit','mode':'visit a friend','weight':4,'speed':77,'dwell':2.1},{'id':'records','mode':'check supplies','target':'record','weight':2,'speed':92,'dwell':1.4},{'id':'rest','mode':'rest','weight':1,'speed':62,'dwell':1.1}]}}}
 # Set-specific circulation: keep the validated footprints, but shift their positions
 # in relation to the existing doorway and actors. Supported props and collision bounds move together.
 shifts={
 'birthday-invitation':[(20,-7),(-20,9),(10,5),(-12,-8)],
 'bakery-order':[(0,-10),(12,-10),(-18,4),(18,5)],
 'library-club':[(25,0),(-30,7),(0,8),(-25,-5)],
 'shared-lunch':[(0,-7),(-10,-7),(22,5),(-12,5)],
 'sports-break':[(28,-7),(-22,-6),(16,-7),(-8,7)],
 'class-science':[(8,-10),(10,-10),(-12,4),(10,4)],
 'art-supplies':[(18,6),(-12,-7),(-8,-4),(16,5)],
 'market-stall':[(12,-6),(-10,-6),(18,5),(-12,5)],
 'substitute-teacher':[(12,-8),(-15,6),(12,4),(-15,4)],
 'welcome-rehearsal':[(12,-7),(-22,-7),(15,3),(-15,3)],
 'festival-supply':[(8,-8),(12,-8),(-8,4),(8,4)]}
 for j,(dx,dz) in enumerate(shifts.get(rid,[])):
  if j>=len(r['shelves']):break
  f=r['shelves'][j];f['x']+=dx;f['z']+=dz
  for o in r['objects']:
   if o['surface']==j:
    for key in ['x','ox','wx']:o[key]+=dx
    o['wz']+=dz
  for b in r['solids']:
   if b['ref']==['shelf',j]:
    b['x1']+=dx;b['x2']+=dx;b['z1']+=dz;b['z2']+=dz
 # Give investigation a third route when a distinct clue board is present; all
 # paths retain the adult gate before any transfer or cleaning.
 if not emergency and rid in ('shared-lunch','class-science','club-bullying','cafe-order','substitute-teacher','welcome-promise'):
  nodes['arrived']['edges'].insert(1,edge('use','board','notice-read','Inspect the notice',efact))
  nodes['notice-read']=node('Bring your concern to '+adults[adult]+'.',edge('consult','adult','guided','Discuss the notice','Thank you for telling me. We will follow the individual plan and work together.'))
 # A real second ordering decision for independent non-food activity setup.
 # Preserve all mandatory actions and do not permit food handling before consultation.
 flexible={'birthday-invitation':('games','board'),'library-club':('bookmarks','board'),'substitute-teacher':('kit','board'),'club-bullying':('invite','notice'),'art-supplies':('heartpiece','sunpiece'),'bus-trip':('schedule','notice')}
 if rid in flexible:
  pair=flexible[rid]
  for key,n in list(nodes.items()):
   if len(n['edges'])!=1 or n['edges'][0]['id']!=pair[0]:continue
   a=n['edges'][0];later=nodes[a['next']]
   if len(later['edges'])!=1 or later['edges'][0]['id']!=pair[1]:continue
   b=later['edges'][0];swap='alternate-'+key
   nodes[swap]=node(n['prompt'],dict(a,next=b['next']))
   n['prompt']+=' Or '+later['prompt'][0].lower()+later['prompt'][1:]
   n['edges'].append(dict(b,next=swap));break
 pack['rooms'][rid]=r
 # Exterior route: actual entrance and gate; optional elevated stars, no compulsory timed hazards.
 # Distinct lengths, platform clusters and alternate paths, ground always reachable.
 door=850+(i%4)*80;finish=door+880+(i%3)*100;hero=HERO[(i-6)%4];scene={'community':'school','school':'school','market':'cafeteria','library':'label_lab','park':'garden','festival':'celebration'}[setting]
 l={'id':rid,'name':title,'subtitle':roomtitle,'scene':scene,'backdrop':'ws-'+setting,'color':trim,'icon':['✦','◆','★','✿','●'][i%5],'hero':hero,'npc':friend.lower(),'npcX':265,'npcName':friend,'width':finish+200,'intro':story,'mission':title,'mechanic':'Explore, investigate and help','lesson':end,'platforms':[{'x':420+(i%3)*25,'y':460-(i%2)*25,'w':170+(i%3)*20},{'x':door+235,'y':450+(i%3)*12,'w':160+(i%4)*20}], 'springs':[],'walls':[],'gaps':[],'stars':[{'x':350,'y':520},{'x':520+(i%3)*25,'y':400-(i%2)*25},{'x':door-120,'y':520},{'x':door+310,'y':390+(i%3)*12},{'x':finish-190,'y':520}], 'tasks':[{'id':'meet-'+rid,'x':265,'y':567,'kind':'npc','icon':'💬','title':'Meet '+friend,'prompt':'E · Talk to '+friend,'speaker':friend,'lines':[story], 'choices':[{'label':'Let’s work on it together','correct':True,'reply':'Come to the '+roomtitle.lower()+'. A responsible adult can help.'}]},{'id':rid,'x':door,'y':567,'kind':'choice','icon':'✦','title':roomtitle,'prompt':'E · Enter '+roomtitle,'speaker':friend,'lines':[story],'choices':[]}],'finishX':finish,'finishName':'WELCOME STREET'}
 # For emergency no social tasks precede the in-room drill itself; it is explicitly fictional.
 if emergency:l['tasks'][0]['lines']=['The nurse is running a fictional emergency practice drill. Enter the rehearsal room to practice immediately getting help.'];l['intro']=l['tasks'][0]['lines'][0]
 pack['levels'].append(l);pack['chapters'].append([f'{i:02}',title,story,end])
# Make the original fifth victory a bridge, not a second end of the world.
# Keep original pack content intact for compatibility regression; update transition in expanded pack only.
pack['chapters'][4][3]+=' Next, help the neighborhood prepare its own welcoming events.'
for j in range(5,len(pack['chapters'])-1):pack['chapters'][j][3]+=' Next: '+pack['levels'][j+1]['name']+'.'
(P/'welcome-street-25.json').write_text(json.dumps(pack,indent=2,ensure_ascii=False)+'\n');(P/'stage18-topics.json').write_text(json.dumps(room_topics,indent=2)+'\n')
print('Authored',len(pack['levels']),'adventures,',len(pack['rooms']),'rooms,',sum(len(v['graph']['nodes']) for v in pack['rooms'].values() if 'graph'in v),'new graph states')
