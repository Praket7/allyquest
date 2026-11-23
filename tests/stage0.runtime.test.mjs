import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveStore,sanitizeSave} from '../web/assets/js/state/saveData.js';
test('rejects malformed local data and uses safe defaults',()=>{
 assert.equal(sanitizeSave({version:2,totalStars:800}).totalStars,0);
 assert.equal(sanitizeSave({version:1,totalStars:-1,completedLevels:['../../bad','welcome-street'],chairColor:'red',motionEnabled:'yes'}).totalStars,0);
 const clean=sanitizeSave({version:1,totalStars:5,completedLevels:['../../bad','welcome-street'],chairColor:'red',motionEnabled:'yes'});
 assert.deepEqual(clean.completedLevels,['welcome-street']);assert.equal(clean.chairColor,'#f2c365');
});
test('progress writes once per level and persists safely',()=>{
 const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const s=new SaveStore(storage);
 assert.equal(s.snapshot.totalStars,0);
 s.finishLevel('welcome-street-1',3);s.finishLevel('welcome-street-1',3);
 assert.equal(s.snapshot.totalStars,3);
 assert.equal(new SaveStore(storage).snapshot.totalStars,3);
});
test('storage can be unavailable without losing live UI',()=>{
 const broken={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
 const s=new SaveStore(broken);s.update({chairColor:'#80c8d8'});
 assert.equal(s.snapshot.chairColor,'#80c8d8');
});
