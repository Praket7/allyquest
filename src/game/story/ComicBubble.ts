/** DOM speech balloon: remains attached to the actual NPC, never the top instruction strip. */
export interface DialogueLine {speaker:'Maya'|'Ethan';text:string;choices?:{label:string;response:string}[]}
export const MAYA_FIRST_DIALOGUE:DialogueLine[]=[
 {speaker:'Maya',text:'Ethan! The celebration banner is missing. I found a golden thread near the creek.'},
 {speaker:'Ethan',text:'We can find it together! Where should we look first?',choices:[
  {label:'Follow the golden thread',response:'Maya: Great! Look near the bridges and the garden.'},
  {label:'How can I help everyone?',response:'Maya: Find the banner first. For food at the celebration, we’ll ask a trusted adult to check what’s safe for each friend.'}
 ]},
 {speaker:'Maya',text:'Meet me back here later! Explore the creek and follow the sparkle trail. You’ve got this!'}
];
export const MAYA_RETURN_DIALOGUE:DialogueLine[]=[
 {speaker:'Maya',text:'I’m cheering for you! Follow the trail east, and tell me if you find the banner.'},
 {speaker:'Maya',text:'Remember: everyone can join the celebration. We can always plan activities that include all our friends!'}
];
export class ComicBubble {
 readonly element:HTMLElement;private speaker:HTMLElement;private message:HTMLElement;private actions:HTMLElement;
 private lines:DialogueLine[]=[];private index=0;private open=false;private commit:(()=>void)|null=null;
 constructor(private readonly root:HTMLElement){
  const el=document.createElement('aside');el.id='aq-comic';el.className='aq-comic';el.setAttribute('aria-label','Comic speech bubble for Maya');el.setAttribute('aria-live','polite');el.hidden=true;
  el.innerHTML='<div class="aq-comic-top"><span id="aq-comic-speaker">MAYA</span><button class="aq-comic-close" aria-label="Close dialogue" type="button" hidden>×</button></div><p class="aq-comic-text"></p><div class="aq-comic-actions"></div><span class="aq-comic-tail" aria-hidden="true"></span>';
  root.append(el);this.element=el;
  this.speaker=el.querySelector('#aq-comic-speaker')!;this.message=el.querySelector('.aq-comic-text')!;this.actions=el.querySelector('.aq-comic-actions')!;
  el.querySelector<HTMLButtonElement>('.aq-comic-close')!.addEventListener('click',()=>this.close());
 }
 get dialogOpen(){return this.open}
 prompt(text='E · Talk to Maya'){if(this.open)return;this.element.hidden=false;this.element.classList.remove('aq-comic-open');this.speaker.textContent='MAYA';this.message.textContent=text;this.actions.replaceChildren();
  const btn=this.makeButton('Talk',()=>this.trigger(),true);btn.classList.add('aq-comic-prompt-button');this.actions.append(btn);
 }
 hidePrompt(){if(!this.open)this.element.hidden=true}
 private promptAction:()=>void=()=>{};
 setOpenHandler(fn:()=>void){this.promptAction=fn}
 private trigger(){this.promptAction()}
 start(lines:DialogueLine[],onEnd:()=>void){this.open=true;this.index=0;this.lines=lines.map(line=>({...line,choices:line.choices?.map(choice=>({...choice}))}));this.commit=onEnd;this.element.hidden=false;this.element.classList.add('aq-comic-open');this.render();}
 advance(){if(!this.open)return;this.index++;if(this.index>=this.lines.length){this.close(true);return}this.render()}
 private makeButton(text:string,click:()=>void,primary=false){const b=document.createElement('button');b.type='button';b.className='aq-comic-button'+(primary?' aq-comic-primary':'');b.textContent=text;b.addEventListener('click',click);return b}
 private render(){const line=this.lines[this.index];if(!line){this.close(true);return}this.speaker.textContent=line.speaker.toUpperCase();this.message.textContent=line.text;this.actions.replaceChildren();
  const close=this.element.querySelector<HTMLButtonElement>('.aq-comic-close')!;close.hidden=false;
  if(line.choices){for(const choice of line.choices)this.actions.append(this.makeButton(choice.label,()=>{
    this.lines.splice(this.index+1,0,{speaker:'Maya',text:choice.response.replace(/^Maya:\s*/, '')});this.advance()
  },true));}
  else this.actions.append(this.makeButton(this.index===this.lines.length-1?'Let’s do it!':'Continue →',()=>this.advance(),true));
  this.actions.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
 }
 close(commit=true){const onEnd=this.open&&commit?this.commit:null;this.open=false;this.commit=null;this.element.hidden=true;this.element.classList.remove('aq-comic-open');this.element.querySelector<HTMLButtonElement>('.aq-comic-close')!.hidden=true;onEnd?.();}
 /** The tail points to Maya's head, coordinates are clamped inside the viewport. */
 position(x:number,y:number){if(this.element.hidden)return;const w=this.root.clientWidth,h=this.root.clientHeight;const bubbleW=this.open?Math.min(345,w-22):Math.min(210,w-22);
  this.element.style.width=`${bubbleW}px`;const px=Math.max(bubbleW/2+11,Math.min(w-bubbleW/2-11,x));
  this.element.style.left=`${Math.round(px)}px`;
  const minimum=this.open?138:90;const top=Math.max(minimum,Math.min(h-210,y));
  this.element.style.top=`${Math.round(top)}px`;this.element.style.setProperty('--aq-tail-shift',`${Math.max(-bubbleW*.38,Math.min(bubbleW*.38,x-px))}px`);
 }
 destroy(){this.element.remove()}
}
