const SOURCE_URL='https://cdn.jsdelivr.net/gh/DigitalKhatt/digitalkhatt-js@main/apps/site-angular/src/app/services/quran_text_indopak_15.ts';

function tokenize(line,page,lineNumber){
  return String(line||'').trim().split(/\s+/).filter(Boolean).map((text,index)=>({
    id:`p${page}:l${lineNumber}:w${index+1}`,
    text,
    page,
    line:lineNumber,
    position:index+1
  }));
}
function isSurahHeader(text){ return /^سُورَةُ\s/.test(String(text||'').trim()); }
function isBismillah(text){ return /^بِسْمِ\s/.test(String(text||'').trim()); }

export class OpenIndoPakService{
  constructor(){ this.pages=null; this.loading=null; this.surahIndex=null; }
  async load(){
    if(this.pages) return this.pages;
    if(this.loading) return this.loading;
    this.loading=(async()=>{
      const res=await fetch(SOURCE_URL,{cache:'force-cache'});
      if(!res.ok) throw new Error(`Open Quran source unavailable (${res.status})`);
      const source=await res.text();
      if(!source.includes('let quranText') || !source.includes('export { quranText }')) throw new Error('Unexpected open Quran dataset format.');
      const blob=new Blob([source],{type:'text/javascript'});
      const url=URL.createObjectURL(blob);
      try{
        const mod=await import(url);
        if(!Array.isArray(mod.quranText) || mod.quranText.length!==610) throw new Error('Expected 610-page IndoPak dataset.');
        this.pages=mod.quranText;
        this.surahIndex=this.buildSurahIndex();
        return this.pages;
      }finally{
        URL.revokeObjectURL(url);
      }
    })().finally(()=>{this.loading=null});
    return this.loading;
  }
  buildSurahIndex(){
    const result=[];
    this.pages.forEach((lines,pageIndex)=>{
      lines.forEach((line,lineIndex)=>{
        if(isSurahHeader(line)) result.push({
          title:String(line).trim(),
          page:pageIndex+1,
          line:lineIndex+1
        });
      });
    });
    return result;
  }
  async getSurahs(){ await this.load(); return this.surahIndex || []; }
  async getPage(page){
    await this.load();
    const p=Math.max(1,Math.min(610,Number(page)||1));
    const raw=this.pages[p-1] || [];
    return {
      page:p,
      lines:raw.map((text,i)=>({
        number:i+1,
        text,
        type:isSurahHeader(text)?'surah':isBismillah(text)?'bismillah':'ayah',
        words:tokenize(text,p,i+1)
      }))
    };
  }
  async getSurahPage(index){
    const surahs=await this.getSurahs();
    const item=surahs[Number(index)-1];
    return item?.page || 1;
  }
}
export const openIndoPakService=new OpenIndoPakService();