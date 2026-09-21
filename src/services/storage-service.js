const KEY='quran-ustadh-ai-state-v1';
export const defaults={
  onboarded:false,
  student:{name:'Hamdan',age:7,language:'Urdu',mode:'Both',classTime:'7:00 PM',classDays:['Mon','Tue','Wed','Thu','Fri','Sat']},
  progress:{currentSabaq:'78:11-15',sabqi:'78:1-10',manzil:'Surah Al-Mulk',lastRead:'78:11',streak:6,todayPercent:35,revisionDue:2,weakAyahs:['78:12','78:14'],weakWords:['78:12:4'],sessions:0,minutes:0,memorizedAyahs:28},
  lastSession:null
};
export class StorageService{
  load(){ try{return {...structuredClone(defaults),...(JSON.parse(localStorage.getItem(KEY)||'null')||{})};}catch{return structuredClone(defaults)} }
  save(state){ localStorage.setItem(KEY,JSON.stringify(state)); }
  reset(){ localStorage.removeItem(KEY); }
}
export const storageService=new StorageService();