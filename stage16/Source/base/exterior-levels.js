/* Ally Quest – five Welcome Street adventures. All educational dialogue is fictional and requires specialist review before public educational claims. */
const LEVELS = [
  {
    id:'banner',name:'The Missing Banner',subtitle:'A schoolyard mystery',scene:'school',color:'#43a4ff',icon:'🏫',hero:'ethan',npc:'maya',npcX:425,npcName:'Maya',width:3450,
    intro:'The welcome banner has disappeared! Meet Maya, follow three golden ribbons, and bring them to the celebration garden.',
    mission:'Find the banner pieces',mechanic:'Bounce and explore',lesson:'Friendship starts with listening and helping everyone feel included.',
    platforms:[{x:650,y:454,w:165},{x:1130,y:420,w:162},{x:1655,y:446,w:175},{x:2250,y:425,w:168},{x:2790,y:444,w:170}],
    springs:[{x:795,y:544,w:102},{x:1960,y:544,w:102}],walls:[{x:930,y:250,w:34,h:317},{x:2097,y:312,w:36,h:255}],
    stars:[{x:725,y:404},{x:1170,y:371},{x:1690,y:390},{x:2370,y:520},{x:2860,y:397}],
    tasks:[{id:'maya',x:425,y:567,kind:'npc',icon:'💬',title:'Ask Maya',prompt:'E  Talk to Maya',speaker:'Maya',lines:[
      'Ethan! Our celebration banner is missing. Can you help me find three golden ribbons?',
      'Thanks for helping! Let’s make our celebration fun for all our friends.'
    ],choices:[{label:'Let’s look together!',correct:true,reply:'Great! Bounce and explore. Follow the glowing ribbon pieces.'},{label:'Can we skip the party?',correct:false,reply:'We can include everyone! Let’s help prepare an event everyone can enjoy.'}]},
      {id:'piece1',x:1260,y:530,kind:'pickup',icon:'🎗️',title:'Golden ribbon 1',prompt:'Collect a ribbon'},
      {id:'piece2',x:2030,y:530,kind:'pickup',icon:'🎗️',title:'Golden ribbon 2',prompt:'Collect a ribbon'},
      {id:'piece3',x:2980,y:530,kind:'pickup',icon:'🎗️',title:'Golden ribbon 3',prompt:'Collect the final ribbon'}],finishX:3290,finishName:'CELEBRATION GARDEN'
  },
  {
    id:'cafeteria',name:'Cafeteria Clue',subtitle:'An inclusive lunch plan',scene:'cafeteria',color:'#ff9c48',icon:'🥗',hero:'maya',npc:'ari',npcX:380,npcName:'Ari',width:3440,
    intro:'The cafeteria is preparing a class event. Help Ari organize lunch choices without guessing whether any food is safe.',
    mission:'Prepare the lunch stations',mechanic:'Conveyor belts and adult check',lesson:'Labels can change. A trusted adult should verify ingredients and each student’s individual needs.',
    platforms:[{x:640,y:457,w:210},{x:1280,y:445,w:195,moving:true,amplitude:82,period:2.8},{x:1920,y:425,w:194},{x:2540,y:443,w:204}],
    conveyors:[{x:1000,w:310,dir:1},{x:2010,w:315,dir:-1}],
    springs:[{x:1670,y:544,w:98}],walls:[{x:1815,y:340,w:37,h:227}],
    stars:[{x:690,y:410},{x:1350,y:400},{x:2000,y:382},{x:2410,y:519},{x:2820,y:401}],
    tasks:[{id:'ari',x:380,y:567,kind:'npc',icon:'💬',title:'Ask Ari',prompt:'E  Talk to Ari',speaker:'Ari',lines:['We’re making a welcoming lunch station. Food allergies are different for different friends.','Can you help me with the signs and ask an adult before sharing food?'],choices:[{label:'Ask an adult to help',correct:true,reply:'Exactly! A trusted adult can check labels and each friend’s plan.'},{label:'Guess from the food photo',correct:false,reply:'A picture cannot tell us ingredients or whether something is suitable. Let’s ask an adult.'}]},
      {id:'station1',x:1040,y:567,kind:'choice',icon:'🥪',title:'Lunch tray',prompt:'E  Check lunch plan',speaker:'Cafeteria helper',lines:['A tray looks familiar, but ingredients and preparation can change. What should we do before offering it?'],choices:[{label:'Have a trusted adult check',correct:true,reply:'Right. We should never guess about food safety.'},{label:'Assume it is the same',correct:false,reply:'Recipes can change. Ask a trusted adult to check before sharing.'}]},
      {id:'station2',x:2120,y:567,kind:'choice',icon:'🧼',title:'Shared utensils',prompt:'E  Check shared utensils',speaker:'Cafeteria helper',lines:['Different foods have used these utensils. How can we help avoid cross-contact?'],choices:[{label:'Ask an adult to provide clean equipment',correct:true,reply:'Great. Clean equipment and adult guidance help manage cross-contact.'},{label:'Just wipe them with a sleeve',correct:false,reply:'That is not a reliable way to prevent cross-contact. Ask an adult to handle it.'}]},
      {id:'station3',x:2790,y:567,kind:'choice',icon:'🎨',title:'Inclusive lunch activity',prompt:'E  Plan an activity',speaker:'Ari',lines:['What activity could everyone enjoy without needing to share food?'],choices:[{label:'Create a table mural',correct:true,reply:'A colorful class mural is something everyone can join!'}, {label:'Require everyone to eat the same snack',correct:false,reply:'Friends have different food needs. A non-food activity includes everyone.'}]}],finishX:3295,finishName:'LUNCH PLAN READY'
  },
  {
    id:'labels',name:'Label Detectives',subtitle:'Discover before deciding',scene:'label_lab',color:'#63dcb8',icon:'🔎',hero:'leo',npc:'maya',npcX:360,npcName:'Maya',width:3500,
    intro:'The Label Lab has three mysterious packages. Find the magnifier and look for information instead of making assumptions.',
    mission:'Investigate three packages',mechanic:'Magnifier and label clues',lesson:'A missing warning does not mean a food is suitable. Labels need careful review by a trusted adult.',
    platforms:[{x:610,y:455,w:185},{x:1200,y:415,w:174},{x:1790,y:437,w:170,moving:true,amplitude:65,period:3},{x:2590,y:412,w:190}],
    springs:[{x:1440,y:544,w:98},{x:2300,y:544,w:100}],walls:[{x:1510,y:235,w:40,h:332},{x:2380,y:235,w:34,h:332}],
    stars:[{x:700,y:403},{x:1225,y:366},{x:1850,y:384},{x:2640,y:363},{x:3000,y:522}],
    tasks:[{id:'maya',x:360,y:567,kind:'npc',icon:'💬',title:'Meet Maya',prompt:'E  Talk to Maya',speaker:'Maya',lines:['Detectives don’t guess! Let’s inspect clues, and ask a trusted adult about food ingredients.'],choices:[{label:'Find the magnifier!',correct:true,reply:'Great! It’s by the first reading desk.'},{label:'Taste-test to find out',correct:false,reply:'Never taste a food to test an allergy. Let’s use information and adult support.'}]},
      {id:'magnifier',x:735,y:567,kind:'pickup',icon:'🔎',title:'Detective magnifier',prompt:'E  Take the magnifier'},
      {id:'label1',x:1150,y:567,kind:'choice',requires:'magnifier',icon:'📦',title:'Package A',prompt:'E  Investigate package A',speaker:'Label Detective',lines:['The ingredient list names an allergen. What should you do before offering it?'],choices:[{label:'Do not share it; tell the adult',correct:true,reply:'Good detective work. We should not offer food that may be unsuitable.'},{label:'Remove the visible ingredient',correct:false,reply:'Removing what you can see does not make it safe. Ask an adult.'}]},
      {id:'label2',x:2100,y:567,kind:'choice',requires:'magnifier',icon:'📋',title:'Package B',prompt:'E  Inspect an unclear label',speaker:'Label Detective',lines:['The label is hard to read and has no visible precautionary warning. Is that enough to know it is suitable?'],choices:[{label:'No — ask a trusted adult to verify',correct:true,reply:'Right. No warning is not proof of safety. Adults can check the details.'},{label:'Yes — no warning means safe',correct:false,reply:'A missing warning does not prove the food is safe. Ask an adult.'}]},
      {id:'label3',x:2820,y:567,kind:'choice',requires:'magnifier',icon:'🧾',title:'Package C',prompt:'E  Review the new recipe',speaker:'Label Detective',lines:['This brand has changed its recipe. Who should check before anyone eats it?'],choices:[{label:'A trusted adult, using the current label',correct:true,reply:'Exactly. The current ingredients matter, even with familiar products.'},{label:'Use last month’s package',correct:false,reply:'Recipes change. An adult should check the current package.'}]}],finishX:3330,finishName:'CASE SOLVED'
  },
  {
    id:'party',name:'Garden Party Prep',subtitle:'Everyone belongs',scene:'garden',color:'#eb79d4',icon:'🎈',hero:'ari',npc:'leo',npcX:400,npcName:'Leo',width:3490,
    intro:'The party garden needs music, decorations, and places for friends to join. Help Leo make it inclusive using non-food fun!',
    mission:'Prepare three party activities',mechanic:'Lever bridge and decoration pickups',lesson:'Inclusive celebrations can focus on art, games, music and friendship rather than shared food.',
    platforms:[{x:670,y:447,w:189},{x:1240,y:420,w:175},{x:1890,y:438,w:185},{x:2520,y:424,w:190}],
    springs:[{x:990,y:544,w:100},{x:2250,y:544,w:96}],walls:[{x:1080,y:330,w:38,h:237}],
    gaps:[{x:1710,w:190,bridgeBy:'lever'}],
    stars:[{x:700,y:390},{x:1320,y:368},{x:1950,y:389},{x:2600,y:371},{x:2940,y:522}],
    tasks:[{id:'leo',x:400,y:567,kind:'npc',icon:'💬',title:'Meet Leo',prompt:'E  Talk to Leo',speaker:'Leo',lines:['The party garden is ready for something special. Let’s plan activities everyone can enjoy!'],choices:[{label:'Let’s plan non-food activities',correct:true,reply:'Awesome! Find the craft table, balloon kit, and music box.'},{label:'Only invite friends eating the same food',correct:false,reply:'Friends have different needs. Everyone deserves a chance to join in.'}]},
      {id:'crafts',x:900,y:567,kind:'choice',icon:'🎨',title:'Art table',prompt:'E  Set up the craft table',speaker:'Leo',lines:['What could we do at this table instead of using food in crafts?'],choices:[{label:'Draw colorful posters',correct:true,reply:'Fantastic! Art supplies can make this a fun food-free activity.'},{label:'Use peanut shells for collage',correct:false,reply:'Food allergens can be risky in activities. Let’s choose non-food art supplies.'}]},
      {id:'lever',x:1530,y:567,kind:'lever',icon:'⚙️',title:'Bridge lever',prompt:'E  Lower the garden bridge'},
      {id:'balloons',x:2050,y:567,kind:'pickup',icon:'🎈',title:'Balloon decorations',prompt:'E  Collect balloons'},
      {id:'music',x:2760,y:567,kind:'choice',icon:'🎶',title:'Music station',prompt:'E  Start the music',speaker:'Leo',lines:['Which activity can include friends who bring different foods or choose not to eat?'],choices:[{label:'A group dance and games',correct:true,reply:'Yes! Music and games let everyone join in.'},{label:'A food-eating contest',correct:false,reply:'A food competition may exclude people. Let’s celebrate with music and games.'}]}],finishX:3305,finishName:'GARDEN READY'
  },
  {
    id:'celebration',name:'The Big Celebration',subtitle:'All together now!',scene:'celebration',color:'#ffcb57',icon:'🎉',hero:'ethan',npc:'ari',npcX:395,npcName:'Ari',width:3550,
    intro:'The big day is here! Help your friends finish the last details, then celebrate everything you learned about including everyone.',
    mission:'Finish the celebration together',mechanic:'Switches, teamwork, grand finale',lesson:'A good ally listens, includes others, and seeks trusted adult help about food-related safety.',
    platforms:[{x:710,y:446,w:185},{x:1240,y:414,w:195,moving:true,amplitude:80,period:3.2},{x:1870,y:440,w:184},{x:2460,y:405,w:195},{x:2950,y:433,w:185}],
    springs:[{x:960,y:544,w:95},{x:2160,y:544,w:98}],walls:[{x:1080,y:260,w:36,h:307},{x:2310,y:331,w:36,h:236}],
    stars:[{x:770,y:397},{x:1320,y:363},{x:1930,y:392},{x:2570,y:355},{x:3070,y:386}],
    tasks:[{id:'ari',x:395,y:567,kind:'npc',icon:'💬',title:'Ask Ari',prompt:'E  Talk to Ari',speaker:'Ari',lines:['Look! The Ally Crew is almost ready. We have one last mission to make the celebration welcoming for everyone.'],choices:[{label:'Let’s work as a team!',correct:true,reply:'Hooray! Complete the three celebration stations and meet everyone by the banner.'},{label:'Leave someone out?',correct:false,reply:'An ally makes room for everyone. Let’s make the party welcoming.'}]},
      {id:'welcome',x:935,y:567,kind:'choice',icon:'🤝',title:'Welcome station',prompt:'E  Set up welcome signs',speaker:'Maya',lines:['A friend feels unsure about participating. What should we do?'],choices:[{label:'Ask what would help them join',correct:true,reply:'Listening matters. Invite friends without pressuring them.'},{label:'Tell them they must join',correct:false,reply:'Friends have choices. Listen and make them feel welcome.'}]},
      {id:'game',x:1900,y:567,kind:'choice',icon:'🎲',title:'Game station',prompt:'E  Organize activities',speaker:'Leo',lines:['Which game gives every friend a way to participate without sharing snacks?'],choices:[{label:'Team scavenger hunt',correct:true,reply:'Perfect! Find clues together and celebrate everyone’s ideas.'},{label:'Guess whose food is safe',correct:false,reply:'We never guess about food safety. Choose a fun team activity instead.'}]},
      {id:'check',x:2760,y:567,kind:'choice',icon:'💛',title:'Friendship station',prompt:'E  Get ready to celebrate',speaker:'Ari',lines:['A friend asks about a treat. What is a helpful response?'],choices:[{label:'Ask a trusted adult to check',correct:true,reply:'That’s being an ally. Never decide for someone else.'},{label:'Say it looks safe',correct:false,reply:'Appearance cannot establish food safety. Get a trusted adult.'}]}],finishX:3390,finishName:'ALLY CREW CELEBRATION'
  }
];
const byId=id=>LEVELS.find(l=>l.id===id);
if(typeof module!=='undefined')module.exports={LEVELS,byId};
