import { QURAN_SAMPLE } from '../data/quran.js';
const pad=n=>String(n).padStart(3,'0');
export class QuranService {
  getSurah(id=78){ return id===78 ? QURAN_SAMPLE.surah : null; }
  getAyah(key){ return QURAN_SAMPLE.ayahs.find(a=>a.key===key)||null; }
  getPage(page=582){ return page===582 ? QURAN_SAMPLE.ayahs : []; }
  getJuz(juz=30){ return juz===30 ? QURAN_SAMPLE.ayahs : []; }
  getWords(key){ return this.getAyah(key)?.words ?? []; }
  getAyahAudio(key){ const [s,a]=key.split(':').map(Number); return `https://everyayah.com/data/Alafasy_128kbps/${pad(s)}${pad(a)}.mp3`; }
  getWordAudio(wordId){ const [s,a,w]=wordId.split(':').map(Number); return `https://audio.qurancdn.com/wbw/${pad(s)}_${pad(a)}_${pad(w)}.mp3`; }
  getPageLayout(){ return { mushaf:'IndoPak 15-Line', page:582, lines:15, sample:true }; }
  getNextAyah(key){ const i=QURAN_SAMPLE.ayahs.findIndex(a=>a.key===key); return QURAN_SAMPLE.ayahs[i+1]||null; }
  getPreviousAyah(key){ const i=QURAN_SAMPLE.ayahs.findIndex(a=>a.key===key); return QURAN_SAMPLE.ayahs[i-1]||null; }
}
export const quranService = new QuranService();