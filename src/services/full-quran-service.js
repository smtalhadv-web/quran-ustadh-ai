export class FullQuranService {
  constructor(){ this.pageCache=new Map(); this.chaptersCache=null; }
  async request(params){
    const qs=new URLSearchParams(params);
    const res=await fetch(`/api/quran?${qs}`,{headers:{Accept:'application/json'}});
    const data=await res.json().catch(()=>({}));
    if(!res.ok) {
      const error=new Error(data.message || 'Full Quran service is unavailable.');
      error.code=data.error || 'QURAN_API_ERROR';
      throw error;
    }
    return data;
  }
  async getChapters(){
    if(this.chaptersCache) return this.chaptersCache;
    const data=await this.request({action:'chapters'});
    this.chaptersCache=data.chapters || [];
    return this.chaptersCache;
  }
  async getPage(page){
    const p=Math.max(1,Math.min(610,Number(page)||1));
    if(this.pageCache.has(p)) return this.pageCache.get(p);
    const data=await this.request({action:'page',page:String(p)});
    const normalized=this.normalizePage(data,p);
    this.pageCache.set(p,normalized);
    return normalized;
  }
  async lookupVerse(verse){
    const data=await this.request({action:'lookup',verse});
    const entries=Object.entries(data.pages || {});
    if(!entries.length) return null;
    const [page,meta]=entries[0];
    return {page:Number(page),...meta};
  }
  async lookupJuz(juz){
    const data=await this.request({action:'juz',juz:String(juz)});
    return data.pages || {};
  }
  normalizePage(data,page){
    const verses=(data.verses || []).map(v=>({
      id:v.id,
      key:v.verse_key,
      number:v.verse_number,
      juz:v.juz_number,
      page:v.page_number || page,
      text:v.text_indopak,
      words:(v.words || []).filter(w=>w.char_type_name!=='end').map(w=>({
        id:String(w.location || `${v.verse_key}:${w.position}`),
        apiId:w.id,
        text:w.text_indopak || w.text,
        verseKey:w.verse_key || v.verse_key,
        position:w.position,
        page:w.page_number || page,
        line:w.line_number,
        audioUrl:w.audio_url || null
      }))
    }));
    const lines=new Map();
    for(const verse of verses){
      for(const word of verse.words){
        const n=Number(word.line)||1;
        if(!lines.has(n)) lines.set(n,[]);
        lines.get(n).push(word);
      }
    }
    return {
      page,
      verses,
      lines:[...lines.entries()].sort((a,b)=>a[0]-b[0]).map(([number,words])=>({number,words}))
    };
  }
}
export const fullQuranService=new FullQuranService();