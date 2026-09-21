export class LearningEngine{
  buildSessionContext(state){
    return {student_name:state.student.name,language:state.student.language,current_activity:'sabaq',expected_ayah:'78:11-15',weak_ayahs:state.progress.weakAyahs.slice(0,3),teacher_instruction:'Check previous lesson, correct one weak word, then continue.'};
  }
  getPlan(state){return [
    {key:'review',label:'Previous Sabaq',detail:'An-Naba 11–12'},
    {key:'sabaq',label:'New Sabaq',detail:'An-Naba 13–15'},
    {key:'words',label:'Difficult words',detail:`${state.progress.weakWords.length} due`}
  ];}
  completeSession(state){
    const next=structuredClone(state); next.progress.sessions+=1; next.progress.minutes+=18; next.progress.todayPercent=100; next.progress.streak+=1; next.progress.revisionDue=1; next.progress.lastRead='78:15'; next.lastSession={duration:18,mistakes:2,corrected:1,needsRevision:['78:12'],at:new Date().toISOString()}; return next;
  }
}
export const learningEngine=new LearningEngine();