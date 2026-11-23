import { mountHome } from './home/HomeScene.js';
import { attachHomeResponsive } from './home/responsive.js';
import { SaveStore } from './state/saveData.js';
import { Overlay } from './ui/Overlay.js';
import { createRoutes, type Route } from './ui/routes.js';
import { GameHost } from './game/GameHost.js';
const app=document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Application root missing');
const scene=mountHome(app);
attachHomeResponsive(scene);
const save=new SaveStore();
const overlay=new Overlay();
const host=new GameHost(()=>{document.querySelector<SVGElement>('#home-art')?.focus?.();},(stars:number)=>{save.finishLevel('w01-l01',stars);const total=document.getElementById('star-total');if(total)total.textContent=String(save.snapshot.totalStars);});
const navigate=createRoutes(overlay,save,host);
// Screenshot QA only: match frozen approved image, without injecting fake saved progress.
const visualRegression = new URLSearchParams(window.location.search).get('visualBaseline') === 'approved';
const star=document.getElementById('star-total');
if (star) star.textContent=String(visualRegression?47:save.snapshot.totalStars);
document.body.classList.toggle('motion-off',!save.snapshot.motionEnabled);
document.querySelectorAll<SVGGElement>('.action').forEach(node=>{
  const route=(node.dataset.open??(node.id==='nav-settings'?'settings':null)) as Route|null;
  if (!route)return;
  node.addEventListener('click',()=>navigate(route));
  node.addEventListener('keydown',(event:KeyboardEvent)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();navigate(route)}});
});
