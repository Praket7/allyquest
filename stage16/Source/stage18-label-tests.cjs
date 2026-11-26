'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/stage18-label-detective.js','utf8').split('if(compiledPack.levels.length>6)')[0];
const api=vm.runInNewContext(source+'\nAQLabelCases;');
const expected={'bakery-order':{oat:'candidate',berry:'conflict',vanilla:'conflict',mystery:'hold'},'recipe-revision':{plain:'candidate',cheese:'conflict',garden:'conflict',batch:'hold'},'market-stall':{salt:'candidate',chili:'conflict',nut:'conflict',rice:'hold',loose:'hold'}};
let n=0;
for(const [name,caseData] of Object.entries(api.cases))for(const p of caseData.products){assert.equal(api.result(caseData,p),expected[name][p.id]);assert(api.reason(caseData,p).length>30);n++}
const p={ingredients:['corn','annatto extract (color)'],contains:[],advisory:[],lot:'1',receiptLot:'1'};
assert.equal(api.result({avoid:[],colorRule:'certified'},p),'candidate');assert.equal(api.result({avoid:[],colorRule:'all'},p),'conflict');
assert.equal(api.result({avoid:['milk'],colorRule:'all'},{...p,ingredients:['corn'],advisory:['milk']}),'hold');
assert.equal(api.result({avoid:[],colorRule:'all'},{...p,ingredients:null}),'hold');
assert.equal(api.result({avoid:[],colorRule:'all'},{...p,ingredients:['corn'],receiptLot:'2'}),'hold');
assert.match(api.reason({avoid:[],colorRule:'all'},{...p,ingredients:['corn']}),/not proof of safety/);
assert.deepEqual(Array.from(api.clues(api.cases['recipe-revision'],api.cases['recipe-revision'].products[1])),['ingredient-3','contains-0']);
assert.deepEqual(Array.from(api.clues(api.cases['market-stall'],api.cases['market-stall'].products[3])),['advisory-0']);
assert.equal(api.matchesClues(api.cases['recipe-revision'],api.cases['recipe-revision'].products[1],[]),false);
assert.equal(api.matchesClues(api.cases['recipe-revision'],api.cases['recipe-revision'].products[1],['contains-0','ingredient-3']),true);
console.log(`${n} fictional product classifications plus ten independent safety/labeling checks passed`);
