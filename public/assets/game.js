import {character} from './characters.js';
const $=id=>document.getElementById(id);
let data=JSON.parse($('initial-state').textContent), busy=false, auto=false, sound=false, audio, lastWin=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let demo;
if(data.demo){demo=await import('./preview-engine.js');data=demo.load(data.levels);}
async function api(path,body){
 if(demo)return demo.request(path,body,data);
 const response=await fetch('/game/'+path,{method:body?'POST':'GET',headers:{'Accept':'application/json','Content-Type':'application/json','X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]').content},...(body?{body:JSON.stringify(body)}:{})});
 const result=await response.json().catch(()=>({message:'Răspuns neașteptat. Reîncarcă pagina.'}));
 if(!response.ok){if(response.status===409)data=await api('state');throw Error(response.status===419?'Sesiunea a expirat. Reîncarcă pagina.':result.message||'Nu am putut salva mutarea. Încearcă din nou.');}
 return result;
}
function level(){return data.levels.find(l=>l.id===data.game.level_id);}
function tone(win=false){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(win?640:440,audio.currentTime);o.frequency.exponentialRampToValueAtTime(win?960:620,audio.currentTime+.12);g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.2);}catch{}}
function render(){
 const l=level(),s=data.game;
 document.querySelector('.board').style.setProperty('--count',s.values.length);
 const positions=new Map([...$('objects').children].map(el=>[Number(el.dataset.value),el.getBoundingClientRect()]));
 $('levels').replaceChildren(...data.levels.map(item=>{
  const b=document.createElement('button'),locked=item.id>data.progress.unlocked,done=Object.hasOwn(data.progress.completed,item.id);
  b.className='level'+(item.id===l.id?' current':'');b.disabled=locked||busy||auto;b.setAttribute('aria-label',`Nivel ${item.id}: ${item.name}${locked?', blocat':''}`);if(item.id===l.id)b.setAttribute('aria-current','step');
  b.innerHTML=`<span class="level-icon">${{penguin:'🐧',frog:'🐸',car:'🚗',planet:'🪐'}[item.object]}</span><span class="level-copy"><strong>${item.name}</strong><small>${String(item.id).padStart(2,'0')} · ${item.mode==='direct'?'Mutare directă':'Bubble Sort'}</small></span><span class="level-state">${locked?'⌑':done?'✓':item.id===l.id?'●':'○'}</span>`;
  b.onclick=()=>start(item.id);return b;
 }));
 $('mode-tag').textContent=l.mode==='direct'?'MUTARE DIRECTĂ · APASĂ ȘI DESCOPERĂ':'BUBBLE SORT · COMPARĂ VECINII';
 $('level-title').textContent=l.name;$('level-number').textContent=String(l.id).padStart(2,'0');$('subtitle').textContent=l.subtitle;
 $('scene').className='scene '+l.theme;$('direction').textContent=l.direction==='asc'?'Crescător ↗':'Descrescător ↘';
 $('counter').textContent=`${s.moves} schimburi${l.mode==='bubble'?` · ${s.comparisons} comparații`:''}`;
 $('scene-label').textContent={ice:'BUN VENIT LA POLUL NORD',pond:'O AVENTURĂ PE LAC',race:'PREGĂTEȘTE-TE DE CURSĂ',space:'NUMERE PRINTRE STELE'}[l.theme];
 $('scene-instruction').textContent=s.completed?'Toți prietenii sunt la locul lor!':l.mode==='direct'?'Fiecare prieten are locul lui.':'Doi vecini. O comparație. Un pas înainte.';
 const existing=new Map([...$('objects').children].map(el=>[Number(el.dataset.value),el]));
 for(const [i,v]of s.values.entries()){
  let b=existing.get(v);if(!b||b.dataset.object!==l.object){b?.remove();b=document.createElement('button');b.className='object';b.dataset.value=v;b.dataset.object=l.object;b.innerHTML=character(l.object,s.target.indexOf(v))+`<span class="number">${v}</span><span class="foot"></span>`;b.onclick=()=>move(v);}
  const active=l.mode==='bubble'&&!s.completed&&(i===s.cursor||i===s.cursor+1),correct=v===s.target[i];
  b.className='object'+(correct?' correct':'')+(active?' active':'')+(l.mode==='bubble'&&!active&&!s.completed?' inactive':'');b.disabled=busy||auto||s.completed||(l.mode==='bubble'&&!active);b.setAttribute('aria-label',`${v}${active?', vecin de comparat':correct?', la locul potrivit':''}`);$('objects').append(b);existing.delete(v);
 }
 for(const b of existing.values())b.remove();
 if(l.mode==='bubble'&&!s.completed){const arena=document.querySelector('.arena'),b=$('objects').children[s.cursor],rect=b.getBoundingClientRect(),container=arena.getBoundingClientRect();if(rect.left<container.left||rect.right>container.right)arena.scrollTo({left:arena.scrollLeft+rect.left-container.left-30,behavior:reduced?'instant':'smooth'});}
 if(!reduced)for(const b of $('objects').children){const old=positions.get(Number(b.dataset.value)),now=b.getBoundingClientRect();if(old&&Math.abs(old.x-now.x)>1)b.animate([{transform:`translate(${old.x-now.x}px,${old.y-now.y}px)`},{transform:'translate(0, -16px)',offset:.5},{transform:'translate(0,0)'}],{duration:430,easing:'ease-in-out'});}
 $('targets').innerHTML=s.target.map(v=>`<div class="target"><span>${v}</span></div>`).join('');
 $('status').textContent=s.message;
 $('help-title').textContent=l.mode==='direct'?'Apasă. Mută. Descoperă.':`Bubble Sort · Trecerea ${s.passes}`;
 $('help-text').textContent=l.mode==='direct'?'Apasă un număr: se mută direct la poziția lui în șirul ordonat și schimbă locul cu obiectul de acolo.':s.completed?'Prin comparații și schimburi între vecini, șirul a fost ordonat.':`Apasă unul dintre vecinii evidențiați (${s.values[s.cursor]} și ${s.values[s.cursor+1]}). Îi schimbăm doar dacă ordinea este greșită, apoi avansăm la următoarea pereche.`;
 $('compare').hidden=$('pass').hidden=l.mode!=='bubble'||s.completed;$('compare').disabled=busy||auto;$('pass').disabled=busy&&!auto;$('pass').textContent=auto?'Oprește animația':'Animează o trecere';
 $('target-text').textContent=s.target.join(l.direction==='asc'?' < ':' > ');
 const correct=s.values.filter((v,i)=>v===s.target[i]).length;$('progress-bar').style.width=`${correct/s.values.length*100}%`;$('placed').textContent=`${correct} din ${s.values.length} numere la locul potrivit`;
 $('next').disabled=busy||auto;$('hint').disabled=$('retry').disabled=busy||auto;$('hint').hidden=l.mode==='bubble';
 if(s.completed&&lastWin!==s.run_id){lastWin=s.run_id;tone(true);$('win-detail').textContent=`Nivelul ${l.id} terminat în ${s.moves} schimburi${l.mode==='bubble'?` și ${s.comparisons} comparații`:''}. ${l.id<data.levels.length?'O lume nouă te așteaptă!':`Ai încheiat toate cele ${data.levels.length} aventuri!`}`;$('next').textContent=l.id<data.levels.length?'Următoarea aventură →':'Joacă din nou ↻';$('win').showModal();}
}
async function start(id){if(busy||auto)return;busy=true;render();let error;try{data=await api('start',{level_id:id});lastWin=null;}catch(e){error=e.message;}finally{busy=false;render();if(error)$('status').textContent=error;}}
async function move(value){if(busy||data.game.completed)return;busy=true;render();let error;try{data=await api('move',{value,run_id:data.game.run_id,revision:data.game.revision});tone();}catch(e){error=e.message;auto=false;}finally{render();await pause(reduced?10:460);busy=false;render();if(error)$('status').textContent=error;}}
$('retry').onclick=()=>start(level().id);
$('hint').onclick=()=>{const s=data.game,v=s.values.find((v,i)=>v!==s.target[i]);if(v===undefined)return;const b=[...$('objects').children].find(b=>Number(b.dataset.value)===v);b.classList.remove('hint');void b.offsetWidth;b.classList.add('hint');$('status').textContent=`Încearcă numărul ${v}. Destinația lui este poziția ${s.target.indexOf(v)+1}.`;};
$('compare').onclick=()=>move(data.game.values[data.game.cursor]);
$('pass').onclick=async()=>{if(auto){auto=false;return;}auto=true;render();const pass=data.game.passes;while(auto&&!data.game.completed&&data.game.passes===pass){await move(data.game.values[data.game.cursor]);}auto=false;render();};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♫ Sunet pornit':'♫ Sunet oprit';$('sound').setAttribute('aria-pressed',String(sound));tone();};
$('next').onclick=()=>{$('win').close();start(Math.min(level().id+1,data.levels.length));};
$('close-win').onclick=()=>$('win').close();
render();
