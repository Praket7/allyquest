import {GameHost} from '../game/GameHost.js';
import { worlds } from '../data/worlds.js';
import { SaveStore, SWATCHES } from '../state/saveData.js';
import { Overlay } from './Overlay.js';
export type Route = 'play'|'map'|'crew'|'workshop'|'daily'|'settings';
const portraits = ['ethan','maya','leo','ari'] as const;
export function createRoutes(overlay:Overlay,save:SaveStore,host:GameHost) {
  function choosePrototype():void {
    // Side-scrolling is the approved single gameplay direction.
    overlay.close(); host.launch('side');
  }
  function daily():void {overlay.open('Daily adventures',`<p>The previous fan-puzzle daily challenge was retired. A new challenge will be built after the movement prototype has been tested with children.</p><p class="status-line">No streaks or penalties.</p>`)}
  function worldMap():void {
    const body=overlay.open('Explore the worlds',`<p>Explore Welcome Street, our side-scrolling development preview. The other four worlds are still being designed.</p><div class="tiles">${worlds.map((world,i)=>`<div class="tile" aria-label="${world.title}${i===0?', playable preview':', coming soon'}"><span class="emoji">${world.icon}</span><strong>${world.title}</strong><span>${world.description}</span><span class="preview-label">${i===0?'Movement preview':'Coming soon'}</span>${i===0?'<button id="aq-world1-launch" type="button" class="primary">Play preview</button>':''}</div>`).join('')}</div>`);
    body.querySelector('#aq-world1-launch')?.addEventListener('click',()=>{overlay.close();host.launch('side')});
  }
  function crew():void{
    const names=['Ethan','Maya','Leo','Ari'];const descriptions=['Loves inventing new things.','Finds clever ways around problems.','Always ready to explore.','Makes sure everyone belongs.'];
    overlay.open('Meet the Ally Crew',`<p>Four friends, different strengths, one adventure.</p><div class="crew">${portraits.map((name,i)=>`<div class="person"><div class="avatar"><img src="./assets/${name}.png" alt="${names[i]}" loading="lazy"></div><strong>${names[i]}</strong><p>${descriptions[i]}</p></div>`).join('')}</div>`);
  }
  function workshop():void{
    let current=save.snapshot.chairColor;
    const body=overlay.open('My Workshop',`<p>This is a small decorating preview, not a playable adventure level. Your chair color is saved on this device.</p><div style="height:218px;display:grid;place-items:center;background:linear-gradient(#f6e8d1,#eacfa5);border:3px solid #fff;border-radius:22px;position:relative;overflow:hidden"><div style="position:absolute;bottom:0;width:100%;height:55px;background:#c79e75"></div><svg width="170" height="180" viewBox="0 0 170 180" style="position:relative"><rect x="38" y="46" width="95" height="80" rx="20" fill="${current}" id="chair-back" stroke="#94633b" stroke-width="5"/><rect x="29" y="109" width="112" height="42" rx="15" fill="${current}" id="chair-seat" stroke="#94633b" stroke-width="5"/><path d="M45 147V166M125 147V166" stroke="#875e3f" stroke-width="10" stroke-linecap="round"/><path d="M48 55Q86 39 121 55" stroke="#fff8d5" stroke-width="9" opacity=".65" fill="none" stroke-linecap="round"/></svg></div><p>Choose a chair color:</p><div class="option-list">${SWATCHES.map(color=>`<button class="swatch" type="button" style="background:${color}" data-color="${color}" aria-label="Choose ${color} chair color"></button>`).join('')}</div><p class="coming-note">More customization will arrive after the core game is fun to play.</p>`);
    body.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(btn=>btn.addEventListener('click',()=>{current=btn.dataset.color??current;save.update({chairColor:current});body.querySelectorAll('#chair-back,#chair-seat').forEach(node=>node.setAttribute('fill',current));overlay.alert('Workshop color saved');}));
  }
  function settings():void{
    const body=overlay.open('Settings',`<p>Adjust the welcome screen to suit you.</p><label class="setting">Gentle tree movement <input type="checkbox" id="setting-motion" ${save.snapshot.motionEnabled?'checked':''}></label><label class="setting">Sound effects (future levels) <input type="checkbox" disabled></label><p class="mini-tip">Your device's reduced-motion preference is respected. No accounts, advertising, trackers, or personal information are collected.</p>`);
    body.querySelector<HTMLInputElement>('#setting-motion')?.addEventListener('change',e=>{const v=(e.currentTarget as HTMLInputElement).checked;save.update({motionEnabled:v});document.body.classList.toggle('motion-off',!v);});
  }
  const handlers:Record<Route,()=>void>={play:choosePrototype,map:worldMap,crew,workshop,daily,settings};
  return (route:Route):void=>handlers[route]();
}
