import { storageService } from './services/storage-service.js';
import { quranService } from './services/quran-service.js';
import { learningEngine } from './services/learning-engine.js';
import { mockRecitationService } from './services/mock-recitation-service.js';
import { recorderService } from './services/recorder-service.js';
import { supabaseService } from './services/supabase-service.js';

let state = storageService.load();
let route = state.onboarded ? 'home' : 'login';
let selectedWord = null;
let classStage = 'ready';
let evalResult = null;
let hidden = new Set();
let micError = '';
const app = document.querySelector('#app');

const icons={home:'⌂',quran:'☾',learn:'◉',progress:'↗',profile:'◎'};

function nav(){
  return `<nav class="bottomnav">${Object.entries(icons).map(([k,v])=>`<button class="navbtn ${route===k?'active':''}" data-route="${k}"><span class="navicon">${v}</span>${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</nav>`;
}
function shell(content,withNav=true){return `<main class="app">${content}${withNav?nav():''}</main>`;}
function top(title='Quran Ustadh AI',back=false){
  return `<div class="topbar">${back?'<button class="back" data-route="home">← Back</button>':`<div class="brand"><div class="logo">ق</div><div><div class="eyebrow">Personal Quran Teacher</div><strong>${title}</strong></div></div>`}<span class="pill">30 Juz</span></div>`;
}
function login(){
  return shell(`<div class="page"><div class="login-logo">ق</div><h1 class="login-title">Quran Ustadh AI</h1><p class="login-sub">A Quran teacher that remembers where you stopped and prepares your next lesson.</p><div class="card"><h2>Welcome</h2><p class="small" style="margin:7px 0 16px">Create a student profile to begin the prototype.</p><button class="primary" style="width:100%" data-route="onboarding">Create student profile</button></div><p class="source-note center">Quran content and AI conversation are separated by design. Speech evaluation in this prototype is simulated and clearly marked.</p></div>`,false);
}
function onboarding(){
  return shell(`${top('Student Setup',true)}<div class="page"><div class="card"><h2>Student profile</h2><p class="small" style="margin:6px 0 16px">The Ustadh will use this to continue lessons automatically.</p><form id="onboard" class="form"><div class="field"><label>Name</label><input name="name" value="${state.student.name}" required></div><div class="grid2"><div class="field"><label>Age</label><input name="age" type="number" min="4" value="${state.student.age}"></div><div class="field"><label>Language</label><select name="language"><option>Urdu</option><option>English</option><option>Arabic</option></select></div></div><div class="field"><label>Learning mode</label><select name="mode"><option>Both</option><option>Nazirah</option><option>Hifz</option></select></div><div class="field"><label>Daily class time</label><input name="classTime" value="7:00 PM"></div><button class="primary" type="submit">Save & open Home</button></form></div></div>`,false);
}
function home(){
  const p=state.progress,s=state.student;
  return shell(`${top()}<div class="page"><section class="hero"><div class="arabic">السلام عليكم، ${s.name}</div><h1>Today's Quran Class</h1><p>Your revision is ready. Ustadh remembers yesterday’s stopping point.</p><button class="primary" data-route="class">Start Quran Class</button></section><h2 class="section-title">Today</h2><div class="card"><div class="lesson-row"><div class="lesson-dot">س</div><div><div class="label">SABAQ</div><div class="value">Surah An-Naba · Ayah 11–15</div></div></div><div class="lesson-row"><div class="lesson-dot">ق</div><div><div class="label">SABQI</div><div class="value">An-Naba · Ayah 1–10</div></div></div><div class="lesson-row"><div class="lesson-dot">م</div><div><div class="label">MANZIL</div><div class="value">${p.manzil}</div></div></div></div><div class="grid2" style="margin-top:10px"><div class="card"><div class="label">Current streak</div><div class="metric">${p.streak} <span style="font-size:15px">days</span></div></div><div class="card"><div class="label">Next class</div><div class="value">${s.classTime}</div><div class="small">Mon–Sat</div></div></div><div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between"><div><div class="label">TODAY'S PROGRESS</div><div class="value">${p.todayPercent}% complete</div></div><span class="pill warning">${p.revisionDue} revision due</span></div><div class="progressbar"><span style="width:${p.todayPercent}%"></span></div></div><h2 class="section-title">Continue</h2><div class="grid2"><button class="secondary" data-route="quran">Continue Quran<br><span class="small">An-Naba 11</span></button><button class="ghost" data-route="progress">View Progress<br><span class="small">${p.memorizedAyahs} ayahs memorized</span></button></div></div>`);
}
function quranWord(w,key){
  const cls=['word']; if(selectedWord===w.id)cls.push('selected');
  return `<span class="${cls.join(' ')}" data-word="${w.id}" data-ayah="${key}">${w.text}</span>`;
}
function quran(){
  return shell(`${top('Quran Reader',true)}<div class="page"><div class="badge-row"><span class="pill">Juz 30</span><span class="pill">Page 582</span><span class="pill">15-Line mode</span></div><div class="quran-shell" style="margin-top:10px"><div class="mushaf-header">سُورَةُ النَّبَإ · An-Naba</div>${quranService.getPage(582).map(a=>`<div class="ayah">${a.words.map(w=>quranWord(w,a.key)).join(' ')} <span class="ayah-num">﴿${a.number}﴾</span></div>`).join('')}</div><div class="reader-tools"><button class="secondary" id="playAyah">▶ Ayah</button><button class="secondary" id="playWord">🔊 Word</button></div><div class="card"><div class="label">SELECTED WORD</div><div class="value" id="selectedLabel">Tap any Quran word</div><p class="small" style="margin-top:5px">Each word has a stable ID and can be highlighted independently.</p></div><p class="source-note">Prototype sample Arabic: verified Quran content for 78:11–15. Audio: recorded Mishary Alafasy ayah recitation via EveryAyah. The production Quran repository should import and checksum a complete licensed IndoPak 15-line dataset.</p></div>`);
}
function classScreen(){
  const ctx=learningEngine.buildSessionContext(state);
  const ayahs=quranService.getPage(582);
  return shell(`${top('Live Quran Class',true)}<div class="page"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span class="pill">Lesson 1 of 3</span><button class="back" data-route="home">End Class</button></div><div class="teacher-box"><div class="avatar">ا</div><div><strong>Ustadh</strong><p class="urdu" id="teacherMsg">السلام علیکم ${ctx.student_name}۔ آج پہلے کل کا سبق سنیں گے۔ بسم اللہ پڑھ کر شروع کریں۔</p></div></div><div class="quran-shell" style="margin-top:12px;min-height:330px">${ayahs.slice(0,4).map(a=>`<div class="ayah" data-verse="${a.key}">${a.words.map(w=>{const classes=['word'];if(evalResult?.mistakes.some(m=>m.wordId===w.id&&!m.corrected))classes.push('error');if(evalResult?.mistakes.some(m=>m.wordId===w.id&&m.corrected))classes.push('corrected');if(hidden.has(w.id))classes.push('hideword');return `<span class="${classes.join(' ')}" data-word="${w.id}" data-ayah="${a.key}">${w.text}</span>`;}).join(' ')} <span class="ayah-num">﴿${a.number}﴾</span></div>`).join('')}</div><div class="reader-tools"><button class="secondary" id="classAudio">▶ Reference</button><button class="secondary" id="hideWords">◌ Hide words</button></div><button class="mic ${classStage==='recording'?'recording':''}" id="micBtn">${classStage==='recording'?'■':'🎙'}</button><div class="status">${classStage==='recording'?'Listening…':'Tap microphone to begin'}</div>${recorderService.getPlaybackUrl()?`<div class="reader-tools"><button class="ghost" id="playRecording">▶ My recitation</button></div>`:''}${micError?`<div class="card mistake-card"><strong>Microphone unavailable</strong><p class="small">${micError}</p></div>`:''}${evalResult?mistakePanel():''}<div class="spacer"></div><button class="primary" style="width:100%" id="completeClass" ${evalResult?'':'disabled'}>Complete Lesson</button><p class="source-note center">Recitation evaluation is SIMULATED in Phase 1. No real speech mistake claim is being made.</p></div>`);
}
function mistakePanel(){
  const remaining=evalResult.mistakes.filter(m=>!m.corrected);
  if(!remaining.length) return `<div class="card"><strong>✓ Mistake corrected</strong><p class="small">Now recite the full ayah once more.</p></div>`;
  const m=remaining[0],word=quranService.getWords(m.verseKey).find(w=>w.id===m.wordId);
  return `<div class="card mistake-card"><div style="display:flex;justify-content:space-between;gap:10px"><div><div class="label">SIMULATED CHECK · ${Math.round(m.confidence*100)}% confidence</div><div class="value">Repeat: <span class="urdu">${word.text}</span></div></div><span class="pill warning">${m.type.replace('_',' ')}</span></div><p class="urdu" style="margin:8px 0">یہ لفظ ایک مرتبہ دوبارہ پڑھیں۔ پہلے سنیں، پھر آپ پڑھیں۔</p><div class="actions"><button class="secondary" id="listenMistake">🔊 Listen</button><button class="primary" id="correctMistake">✓ Mark corrected</button></div></div>`;
}
function progress(){
  const p=state.progress;
  return shell(`${top('Progress',true)}<div class="page"><div class="card"><div class="label">CURRENT HIFZ POSITION</div><div class="value">Surah An-Naba · 11–15</div><div class="progressbar"><span style="width:58%"></span></div></div><div class="grid2" style="margin-top:10px"><div class="card"><div class="metric">${p.memorizedAyahs}</div><div class="small">Ayahs memorized</div></div><div class="card"><div class="metric">${p.minutes}</div><div class="small">Minutes studied</div></div><div class="card"><div class="metric">${p.sessions}</div><div class="small">Classes completed</div></div><div class="card"><div class="metric">${p.weakAyahs.length}</div><div class="small">Weak ayahs</div></div></div><h2 class="section-title">Needs revision</h2>${p.weakAyahs.map(k=>`<div class="card" style="margin-bottom:8px"><strong>Ayah ${k}</strong><p class="small">Scheduled earlier because this passage needs reinforcement.</p></div>`).join('')}</div>`);
}
function placeholder(title,text){
  return shell(`${top(title,true)}<div class="page"><div class="card center"><div class="logo" style="margin:0 auto 14px">ق</div><h2>${title}</h2><p class="small" style="margin-top:8px">${text}</p></div></div>`);
}
function complete(){
  const l=state.lastSession;
  return shell(`<div class="topbar"><div class="brand"><div class="logo">ق</div><strong>Quran Ustadh AI</strong></div><span class="pill">Saved</span></div><div class="page"><div class="card complete center"><div style="font-size:46px">✓</div><h1>Class Complete</h1><p class="urdu" style="text-align:center;margin-top:6px">ماشاء اللہ، آج کا سبق مکمل ہوگیا۔ اگلی کلاس میں پہلے آیت 12 دوبارہ سنیں گے۔</p></div><h2 class="section-title">Today</h2><div class="grid2"><div class="card"><div class="metric">${l.duration}m</div><div class="small">Duration</div></div><div class="card"><div class="metric">${l.corrected}</div><div class="small">Mistakes corrected</div></div><div class="card"><div class="value">5 ayahs</div><div class="small">Sabaq completed</div></div><div class="card"><div class="value">2 pages</div><div class="small">Revision reviewed</div></div></div><div class="card" style="margin-top:10px"><div class="label">NEXT CLASS</div><div class="value">${state.student.classTime}</div><p class="small">Revision first: Ayah 78:12</p></div><button class="primary" style="width:100%;margin-top:12px" data-route="home">Back to Home</button></div>`,false);
}
function render(){
  const map={login,onboarding,home,quran,class:classScreen,progress,learn:()=>placeholder('Learn','Nazirah and Hifz engines are prepared for the next phase.'),profile:()=>placeholder('Profile','Student language, schedule, family and privacy controls will live here.'),complete};
  app.innerHTML=(map[route]||home)();
  bind();
}
function play(url){
  const a=new Audio(url);
  a.play().catch(()=>alert('Audio playback needs internet access in this prototype.'));
}
function bind(){
  document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{route=b.dataset.route;render();});
  document.querySelector('#onboard')?.addEventListener('submit',e=>{
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    state.student={...state.student,name:f.get('name'),age:Number(f.get('age')),language:f.get('language'),mode:f.get('mode'),classTime:f.get('classTime')};
    state.onboarded=true;storageService.save(state);route='home';render();
  });
  document.querySelectorAll('[data-word]').forEach(w=>w.onclick=()=>{
    selectedWord=w.dataset.word;
    document.querySelectorAll('.word').forEach(x=>x.classList.toggle('selected',x.dataset.word===selectedWord));
    const l=document.querySelector('#selectedLabel');
    if(l)l.textContent=`${w.textContent} · ${selectedWord}`;
  });
  document.querySelector('#playAyah')?.addEventListener('click',()=>play(quranService.getAyahAudio(selectedWord?selectedWord.split(':').slice(0,2).join(':'):'78:11')));
  document.querySelector('#playWord')?.addEventListener('click',()=>{if(!selectedWord)return alert('Tap a Quran word first.');play(quranService.getWordAudio(selectedWord));});
  document.querySelector('#classAudio')?.addEventListener('click',()=>play(quranService.getAyahAudio('78:11')));
  document.querySelector('#micBtn')?.addEventListener('click',async()=>{
    micError='';
    if(classStage==='recording'){
      classStage='checking';render();
      try{
        await recorderService.stop();
        evalResult=mockRecitationService.evaluate();
        classStage='result';
      }catch(err){
        micError=err?.message||'Could not finish recording.';
        classStage='ready';
      }
      render();
    } else {
      try{
        await recorderService.start();
        classStage='recording';
      }catch(err){
        micError=err?.message||'Please allow microphone access in your browser.';
        classStage='ready';
      }
      render();
    }
  });
  document.querySelector('#playRecording')?.addEventListener('click',()=>{
    const url=recorderService.getPlaybackUrl();
    if(url) play(url);
  });
  document.querySelector('#hideWords')?.addEventListener('click',()=>{
    const candidates=quranService.getAyah('78:13').words;
    hidden.size?hidden.clear():candidates.slice(0,2).forEach(w=>hidden.add(w.id));
    render();
  });
  document.querySelector('#listenMistake')?.addEventListener('click',()=>{
    const m=evalResult.mistakes.find(x=>!x.corrected); play(quranService.getWordAudio(m.wordId));
  });
  document.querySelector('#correctMistake')?.addEventListener('click',()=>{
    const m=evalResult.mistakes.find(x=>!x.corrected);m.corrected=true;render();
  });
  document.querySelector('#completeClass')?.addEventListener('click',()=>{
    state=learningEngine.completeSession(state);storageService.save(state);
    const sid=state.student.remoteId;
    supabaseService.saveSessionSummary(sid,state.lastSession).catch(()=>{});
    route='complete';render();
  });
}
supabaseService.init().catch(()=>{});
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});