/* Loaded after the legacy behavior modules, before setup(). Content replaces construction, not controls. */
const compiledPack=__AQ_PACK__;
const checkedPack=AQContent.validate(compiledPack);
if(checkedPack.errors.length)throw new Error('Invalid Ally Quest content: '+checkedPack.errors.join('; '));
const originalPlan16=roomPlan,originalSpatial16=spatialPlan;
// The maps are replaced before setup and before the first world is initialized.
LEVELS.splice(0,LEVELS.length,...AQContent.clone(compiledPack.levels));
FESTIVAL_CHAPTERS.splice(0,FESTIVAL_CHAPTERS.length,...AQContent.clone(compiledPack.chapters));
for(const [id,c] of Object.entries(compiledPack.rooms)){
 ROOM_META[id]=AQContent.clone(c.meta);ROOM_LESSONS[id]=AQContent.clone(c.lesson);ROOM_LOOK[id]=AQContent.clone(c.look);ROOM_STORY[id]=AQContent.clone(c.story);INCIDENTS[id]=AQContent.clone(c.incident);CREW_JOBS[id]=AQContent.clone(c.crew.jobs);CREW_HELP[id]=AQContent.clone(c.crew.favor);CHARM_NAMES[id]=c.charm;if(c.kit!==null)liveKit[id]=c.kit;
}
// Fresh object graph per visit, with surface/solid references restored by stable data IDs.
roomPlan=id=>AQContent.hydrate(compiledPack.rooms[id]);
spatialPlan=(p,id)=>{if(!p.shelves||!p.solids)throw Error('Missing compiled room geometry: '+id)};
const baseIntent16=crewIntent;
crewIntent=function(r,p,helper){const config=compiledPack.rooms[r.task.id]?.crew?.routine;const phase=r.crew.phase;
 if(config&&phase==='routine'&&!(helper&&['requested','found','arranged'].includes(r.crew.side)))return AQContent.chooseIntent(config,crewRandom(r.crew));
 return baseIntent16(r,p,helper);
};
// Explicit policy boundary: a required incident is never advanced by an NPC or a generic object action.
const baseAdvance16=roomAdvance;
roomAdvance=function(message){const r=room,s=r?.plan.steps[r.step];if(!s)return;if(s.kind==='incident'&&!r.trace.live?.resolved){roomMessage('Get the responsible adult to review this practice incident.');return;}return baseAdvance16(message);};
// Keep existing production QA opt-in; additional content diagnostics never appear in ordinary play.
if(window.__ALLY_ENABLE_QA===true){window.ALLY_CONTENT_QA={summary:()=>({version:compiledPack.version,levels:LEVELS.length,rooms:Object.keys(compiledPack.rooms).length,steps:Object.values(compiledPack.rooms).reduce((n,r)=>n+r.steps.length,0)}),compare:()=>Object.keys(compiledPack.rooms).map(id=>{const before=originalPlan16(id);originalSpatial16(before,id);const after=roomPlan(id);const snap=p=>JSON.stringify({steps:p.steps,objects:p.objects.map(({surface,...o})=>({...o,surface:surface?p.shelves.indexOf(surface):null})),shelves:p.shelves.map(({items,anchor,...s})=>({...s,items:items.map(o=>o.id),anchor:anchor?.id??null})),solids:p.solids.map(({ref,...s})=>({...s,ref:p.objects.includes(ref)?['object',ref.id]:p.shelves.includes(ref)?['shelf',p.shelves.indexOf(ref)]:null}))});const a=JSON.parse(snap(before)),b=JSON.parse(snap(after));const diffs=[];const diff=(x,y,path)=>{if(typeof x!==typeof y||x===null||y===null||typeof x!=='object'){if(x!==y)diffs.push({path,x,y});return;}for(const k of new Set([...Object.keys(x),...Object.keys(y)]))diff(x[k],y[k],path+'.'+k);};diff(a,b,id);return{id,equal:diffs.length===0,diffs};}),quest:()=>room?AQContent.questStatus(room.plan,room.plan.steps.slice(0,room.step).map(s=>s.key)):null,validation:()=>checkedPack};}
