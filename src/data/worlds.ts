/** Availability is truthful. Nothing here claims the rejected Level 1 exists. */
export interface World { id: string; title: string; icon: string; description: string; status: 'planned' | 'available' }
export const worlds: readonly World[] = [
  {id:'welcome-street',title:'Welcome Street',icon:'🏫',description:'A playful school-day adventure',status:'planned'},
  {id:'cafeteria-circuit',title:'Cafeteria Circuit',icon:'🍽️',description:'Machines, movement and teamwork',status:'planned'},
  {id:'birthday-boulevard',title:'Birthday Boulevard',icon:'🎈',description:'Surprises and celebrations',status:'planned'},
  {id:'picnic-park',title:'Picnic Park',icon:'🌳',description:'Wind, bridges and discovery',status:'planned'},
  {id:'label-lab',title:'Label Lab',icon:'🔎',description:'Exploration and observation',status:'planned'},
];
