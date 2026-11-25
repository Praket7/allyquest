/** Stage 12 interactive stations: data only, no web requests or account information. */
const STATION_GAMES={
 station1:{mode:'sequence',title:'Adult verification handoff',brief:'Move the tray through a real review sequence. The cart has already arrived; food suitability is determined by the trusted adult using the friend’s own plan.',
  items:[['tray','🛒','Delivered tray'],['helper','🧑‍🍳','Trusted adult review'],['details','📋','Current product information'],['guess','👀','Guess from appearance']],
  steps:[['tray','Put the delivered tray on the inspection desk'],['details','Attach the current ingredients and preparation information'],['helper','Ask the trusted adult to review the individual plan']]},
 station2:{mode:'sort',title:'Prevent cross-contact',brief:'Move used equipment away from the serving area. Equipment identified as unused and provided by an adult belongs at the clean station. Appearance alone cannot confirm equipment is suitable.',
  items:[['used-spoon','🥄','Used spoon'],['fresh-kit','🧰','Adult-provided unused kit'],['used-tongs','🍴','Used tongs']],
  zones:[['return','USED EQUIPMENT · RETURN'],['adult','ADULT-ISSUED EQUIPMENT']],targets:{'used-spoon':'return','fresh-kit':'adult','used-tongs':'return'}},
 station3:{mode:'art',title:'Make a food-free table mural',brief:'Choose three colorful decorations and place them on the paper mural. Everyone can join this non-food activity.',
  items:[['sun','☀️','Sunshine'],['star','⭐','Star'],['heart','💜','Heart']],steps:[['one','Left poster'],['two','Center poster'],['three','Right poster']]},
 crafts:{mode:'art',title:'Design the garden welcome poster',brief:'Place three non-food shapes on the garden poster. You can choose their order; all friends can help create the display.',
  items:[['flower','🌼','Flower'],['ribbon','🎀','Ribbon'],['leaf','🍃','Leaf']],steps:[['one','Left panel'],['two','Center panel'],['three','Right panel']]},
 music:{mode:'rhythm',title:'Start a welcoming music beat',brief:'Follow the original four-beat pattern and start a group dance. Everyone can participate without a food activity.',
  items:[['clap','👏','Clap'],['bell','🔔','Bell'],['drum','🥁','Drum']],pattern:['clap','drum','clap','bell']},
 welcome:{mode:'sequence',title:'Build an inclusive welcome sign',brief:'Place three welcoming messages in a helpful order: listen, make space, then invite without pressure.',
  items:[['invite','🌟','Invite everyone'],['listen','👂','Listen first'],['space','🪑','Make room'],['exclude','🚫','Only friends with the same snacks']],
  steps:[['listen','Hear what the friend wants'],['space','Provide an accessible activity space'],['invite','Invite them without pressure']]},
 game:{mode:'hunt',title:'Team scavenger hunt',brief:'Find three hidden non-food objects in the activity box. A scavenger hunt can include friends with different food needs.',
  items:[['balloon','🎈','Balloon'],['apple','🍎','Decoration apple'],['map','🗺️','Team map'],['scarf','🧣','Friendship scarf'],['cake','🎂','Party cake'],['cup','🥤','Drink cup']],targets:['balloon','map','scarf']},
 check:{mode:'sort',title:'Plan inclusive help',brief:'Sort each question to a trusted adult or a friendship activity. Food safety is individualized: do not decide a snack is safe for somebody else.',
  items:[['food','🥪','Food ingredient question'],['label','📦','Unclear package label'],['game','🎲','Friend wants an activity']],
  zones:[['adult','TRUSTED ADULT · FOOD REVIEW'],['play','FRIENDSHIP · ACTIVITY IDEAS']],targets:{food:'adult',label:'adult',game:'play'}}
};
function validateStationGames(){for(const [id,g] of Object.entries(STATION_GAMES)){
 if(!['sequence','sort','art','rhythm','hunt'].includes(g.mode))throw Error('Invalid station '+id);
 if((g.items||[]).length<3)throw Error('Missing station items '+id);
 if((g.mode==='sequence'||g.mode==='art')&&g.steps.length!==3)throw Error('Missing placement steps '+id);
 if(g.mode==='sort'&&Object.keys(g.targets).length!==g.items.length)throw Error('Missing sorting targets '+id);
 if(g.mode==='rhythm'&&g.pattern.length<3)throw Error('Missing rhythm '+id);
 }}
validateStationGames();
if(typeof window!=='undefined')window.ALLY_STATION_GAMES=STATION_GAMES;
if(typeof module!=='undefined')module.exports={STATION_GAMES,validateStationGames};
