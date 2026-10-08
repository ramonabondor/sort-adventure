import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {create,step,target,request,load} from '../public/assets/preview-engine.js';
const levels=JSON.parse(fs.readFileSync(new URL('../preview/levels.json',import.meta.url)));
function permutations(a){return a.length<=1?[a]:a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[v,...p]));}
for(const mode of ['direct','bubble'])for(const direction of ['asc','desc'])test(`${mode} ${direction}: toate cele 120 permutări`,()=>{
 const l={id:1,numbers:[2,4,8,16,32],mode,direction};
 for(const values of permutations(l.numbers)){
  let s=create(l,values),iterations=0;
  while(!s.completed){const before=s.values.slice();s=step(s,l,mode==='direct'?s.values.find((v,i)=>v!==s.target[i]):s.values[s.cursor]);assert.deepEqual([...s.values].sort((a,b)=>a-b),l.numbers);const changed=before.map((v,i)=>v!==s.values[i]?i:null).filter(i=>i!==null);if(mode==='bubble'&&changed.length)assert.equal(changed[1]-changed[0],1);assert.ok(++iterations<=20);}
  assert.deepEqual(s.values,target(l));
 }
});
test('respingerea obiectelor inexistente și a perechilor neactive',()=>{const l=levels[3],s=create(l,[6,5,4,3,2,1]);assert.throws(()=>step(s,l,1));assert.throws(()=>step(s,l,999));assert.deepEqual(s.values,[6,5,4,3,2,1]);});
test('un număr deja plasat nu adaugă schimburi',()=>{const l=levels[0],s=step(create(l,[1,3,2,4,5]),l,1);assert.equal(s.moves,0);assert.equal(s.completed,false);});
test('compararea unei perechi ordonate nu face schimb',()=>{const l=levels[3],s=step(create(l,[1,3,2,4,5,6]),l,1);assert.equal(s.comparisons,1);assert.equal(s.moves,0);assert.equal(s.cursor,1);});
test('un nivel nou nu începe deja rezolvat',()=>{for(const l of levels)for(let i=0;i<30;i++)assert.equal(create(l).completed,false);});
test('progresul deblochează nivelul următor și reține cel mai bun rezultat',async()=>{
 globalThis.localStorage={setItem(){}};
 let d={levels,game:create(levels[0],[2,1,3,4,5]),progress:{unlocked:1,completed:{}}};
 await assert.rejects(()=>request('start',{level_id:4},d));
 d=await request('move',{value:2,run_id:d.game.run_id,revision:0},d);assert.equal(d.progress.unlocked,2);assert.equal(d.progress.completed[1].best_moves,1);
 await assert.rejects(()=>request('move',{value:2,run_id:d.game.run_id,revision:0},d));
 d=await request('start',{level_id:2},d);assert.equal(d.game.level_id,2);
});

test('nivelurile 7–10 se rezolvă și în ordinea inițială cea mai dificilă',()=>{
 assert.equal(levels.length,10);
 for(const l of levels.slice(6)){
  let s=create(l,target(l).reverse()),steps=0;
  while(!s.completed){const v=l.mode==='direct'?s.values.find((v,i)=>v!==s.target[i]):s.values[s.cursor];s=step(s,l,v);assert.ok(++steps<=l.numbers.length*(l.numbers.length-1)/2);}
  assert.deepEqual(s.values,target(l));
 }
});
test('actualizarea de la șase niveluri păstrează partida și deblochează 7',()=>{
 const oldLevels=structuredClone(levels.slice(0,6));oldLevels[5].subtitle='Provocarea finală: Bubble Sort descrescător.';
 const game=create(oldLevels[5],target(oldLevels[5]));
 const stored={demo:true,levels:oldLevels,game,progress:{unlocked:6,completed:{6:{best_moves:8}}}};
 let saved;
 globalThis.localStorage={getItem:()=>JSON.stringify(stored),setItem:(_,v)=>saved=JSON.parse(v)};
 const d=load(levels);assert.deepEqual(d.game,game);assert.equal(d.progress.unlocked,7);assert.equal(d.progress.completed[6].best_moves,8);assert.equal(saved.levels.length,10);
});
test('actualizarea nu deblochează 7 dacă 6 nu a fost terminat',()=>{
 const game=create(levels[5],[5,10,15,20,25,30,35,40]);
 const stored={demo:true,levels:levels.slice(0,6),game,progress:{unlocked:6,completed:{5:{best_moves:6}}}};
 globalThis.localStorage={getItem:()=>JSON.stringify(stored),setItem(){}};
 const d=load(levels);assert.equal(d.progress.unlocked,6);assert.deepEqual(d.game,game);
});
