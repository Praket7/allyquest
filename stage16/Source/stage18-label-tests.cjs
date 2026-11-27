'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/stage18-label-detective.js','utf8').split('if(compiledPack.levels.length>6)')[0];
const api=vm.runInNewContext(source+'\nAQLabelCases;');
const expected={'bakery-order':{oat:'candidate',berry:'conflict',vanilla:'conflict',mystery:'hold'},'recipe-revision':{plain:'candidate',cheese:'conflict',garden:'conflict',batch:'hold'},'market-stall':{salt:'candidate',chili:'conflict',nut:'conflict',rice:'hold',loose:'hold'}};
let n=0;
for(const [name,c] of Object.entries(api.cases))for(const p of c.products){assert.equal(api.result(c,p),expected[name][p.id]);assert(api.reason(c,p).length>30);assert.match(p.source,/^https:\/\//);assert(p.sourceName);assert.equal(api.matchesClues(c,p,api.clues(c,p)),true);n++}
const p={ingredients:['corn','annatto extract (color)'],contains:[],advisory:[],lot:'1',receiptLot:'1'};
assert.equal(api.result({avoid:[],colorRule:'certified'},p),'candidate');assert.equal(api.result({avoid:[],colorRule:'all'},p),'conflict');
assert.equal(api.result({avoid:['milk'],colorRule:'all'},{...p,ingredients:['corn'],advisory:['milk']}),'hold');assert.equal(api.result({avoid:[],colorRule:'all'},{...p,ingredients:null}),'hold');assert.equal(api.result({avoid:[],colorRule:'all'},{...p,ingredients:['corn'],receiptLot:'2'}),'hold');assert.match(api.reason({avoid:[],colorRule:'all'},{...p,ingredients:['corn']}),/not proof of safety/);
const r=api.cases['recipe-revision'];assert.deepEqual(Array.from(api.clues(r,r.products[1])),['ingredient-18','ingredient-19','ingredient-20','contains-0']);assert.equal(api.matchesClues(r,r.products[1],['contains-0','ingredient-18']),false);
const b=api.cases['bakery-order'];assert.deepEqual(Array.from(api.clues(b,b.products[2])),['ingredient-3','ingredient-7']);assert(b.products[0].ingredients[0].includes('1 cup'));assert(b.products[2].ingredients[7].includes('2 large eggs'));assert.match(api.photos['banana-oat'],/^data:image\/jpeg;base64,/);assert.match(api.photos['chocolate-chip'],/^data:image\/jpeg;base64,/);
assert.deepEqual(Array.from(api.clues(api.cases['market-stall'],api.cases['market-stall'].products[3])),['advisory-0']);assert.deepEqual(Array.from(api.clues(r,r.products[2])),['ingredient-15']);assert.deepEqual(Array.from(api.clues(r,r.products[3])),['lot']);assert.deepEqual(Array.from(api.clues(b,b.products[3])),['missing']);
console.log(`${n} source-backed classifications and independent safety, provenance, recipe and evidence checks passed`);
