/** Tiny original four-bar Ally Quest motif, synthesized locally; no network/audio files. */
export class AmbientScore {
 private next=0;private index=0;
 private readonly tones=[392,440,523.25,587.33,523.25,440,392,329.63,349.23,392,466.16,523.25,440,392,349.23,329.63];
 reset(){this.next=0;this.index=0}
 step(ctx:AudioContext|null,muted:boolean,paused:boolean){
  if(!ctx||muted||paused||ctx.state!=='running'){this.next=0;return}
  const now=ctx.currentTime;
  if(this.next===0||now>this.next+2)this.next=now+.07;
  if(now+0.04<this.next)return;
  const frequency=this.tones[this.index%this.tones.length];
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type='sine';osc.frequency.value=frequency;
  gain.gain.setValueAtTime(.00001,this.next);
  gain.gain.exponentialRampToValueAtTime(.009,this.next+.055);
  gain.gain.exponentialRampToValueAtTime(.00001,this.next+.49);
  osc.connect(gain).connect(ctx.destination);osc.start(this.next);osc.stop(this.next+.5);
  this.next+=.66;this.index++;
 }
}
