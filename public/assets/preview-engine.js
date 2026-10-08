// Doar previzualizare statică. Aplicația Laravel folosește exclusiv motorul PHP.
const key='sort-adventure-preview-v1';
export function target(level){return [...level.numbers].sort((a,b)=>level.direction==='asc'?a-b:b-a);}
export function create(level,values){const t=target(level);if(!values){values=[...t];for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}if(values.every((v,i)=>v===t[i]))[values[0],values[1]]=[values[1],values[0]];}return {level_id:level.id,values:[...values],target:t,moves:0,comparisons:0,cursor:0,end:values.length-1,pass_swapped:false,passes:1,completed:values.every((v,i)=>v===t[i]),message:'Apasă un obiect pentru a începe.',run_id:globalThis.crypto.randomUUID(),revision:0};}
export function step(state,level,value){const s=structuredClone(state);if(s.completed)return s;const i=s.values.indexOf(value);if(i<0)throw Error('Obiect inexistent.');if(level.mode==='direct'){const dest=s.target.indexOf(value);if(i===dest)s.message=`${value} este deja la locul potrivit.`;else{[s.values[i],s.values[dest]]=[s.values[dest],s.values[i]];s.moves++;s.message=`${value} s-a mutat la poziția ${dest+1}.`;}}else{const j=s.cursor;if(i!==j&&i!==j+1)throw Error('Apasă unul dintre cei doi vecini evidențiați.');const a=s.values[j],b=s.values[j+1],swap=level.direction==='asc'?a>b:a<b;s.comparisons++;if(swap){[s.values[j],s.values[j+1]]=[b,a];s.moves++;s.pass_swapped=true;}s.message=swap?`${a} și ${b} au schimbat locurile.`:`${a} și ${b} sunt în ordinea corectă. Continuăm!`;s.cursor++;if(s.cursor>=s.end){s.end--;s.completed=!s.pass_swapped||s.end<1;s.cursor=0;s.pass_swapped=false;s.passes++;}}s.completed=s.completed||s.values.every((v,i)=>v===s.target[i]);s.revision++;if(s.completed)s.message='Bravo! Toate numerele sunt la locul lor.';return s;}
export function load(levels){
 try{
  const d=JSON.parse(localStorage.getItem(key));
  const mechanics=l=>JSON.stringify([l?.id,l?.mode,l?.direction,l?.numbers,l?.object,l?.theme]);
  if(d?.game&&d?.progress&&Array.isArray(d.levels)&&d.levels.every(old=>mechanics(old)===mechanics(levels.find(l=>l.id===old.id)))){
   d.levels=levels;
   for(const l of levels)if(Object.hasOwn(d.progress.completed,l.id))d.progress.unlocked=Math.max(d.progress.unlocked,Math.min(levels.length,l.id+1));
   try{localStorage.setItem(key,JSON.stringify(d));}catch{}
   return d;
  }
 }catch{}
 return {demo:true,levels,game:create(levels[0]),progress:{unlocked:1,completed:{}}};
}
export async function request(path,body,data){let d=structuredClone(data);if(path==='start'){const l=d.levels.find(l=>l.id===body.level_id);if(!l||l.id>d.progress.unlocked)throw Error('Nivel blocat.');d.game=create(l);}if(path==='move'){if(body.run_id!==d.game.run_id||body.revision!==d.game.revision)throw Error('Jocul s-a schimbat.');const l=d.levels.find(l=>l.id===d.game.level_id);d.game=step(d.game,l,body.value);if(d.game.completed){const old=d.progress.completed[l.id];d.progress.completed[l.id]={best_moves:old?Math.min(old.best_moves,d.game.moves):d.game.moves};d.progress.unlocked=Math.max(d.progress.unlocked,Math.min(d.levels.length,l.id+1));}}try{localStorage.setItem(key,JSON.stringify(d));}catch{}return d;}
