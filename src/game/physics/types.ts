/** Simulation data, independent of rendering and DOM. */
export interface Vec2 {x:number;y:number}
export interface Rect{x:number;y:number;w:number;h:number}
export interface Platform extends Rect{id:string;oneWay?:boolean;moving?:boolean;baseX?:number;baseY?:number;amplitude?:number;frequency?:number;phase?:number;dx?:number;dy?:number}
export interface InputFrame{x:number;y:number;jump:boolean;jumpHeld:boolean;interact:boolean;dash:boolean}
export type GameMode='side'|'top';
export type EventKind='jump'|'land'|'bounce'|'ribbon'|'checkpoint'|'push'|'gate'|'finish'|'respawn'|'dash'|'interact';
export interface GameEvent{type:EventKind;x:number;y:number}
export interface Actor{x:number;y:number;vx:number;vy:number}
export interface Ribbon{x:number;y:number;got:boolean;id:number}
export interface Stats{ribbons:number;attempts:number;finished:boolean;elapsed:number;interactions:number}
export interface Sim{readonly mode:GameMode;readonly width:number;readonly height:number;readonly player:Actor;readonly ribbons:Ribbon[];readonly events:GameEvent[];readonly stats:Stats;readonly checkpoint:Vec2;readonly gateOpen:boolean;readonly ball:Actor;step(dt:number,input:InputFrame):void;reset():void}
export const EMPTY_INPUT:InputFrame={x:0,y:0,jump:false,jumpHeld:false,interact:false,dash:false};
export const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
export const approach=(v:number,t:number,d:number)=>v<t?Math.min(t,v+d):Math.max(t,v-d);
export const intersect=(a:Rect,b:Rect)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y);
