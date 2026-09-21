// MOCKED SERVICE: deterministic phase-1 simulation. Never presented as real speech recognition.
export class MockRecitationEvaluationService{
  evaluate(){return {mode:'SIMULATED',accuracyScore:88,fluencyScore:82,recognitionConfidence:0.94,mistakes:[{verseKey:'78:12',wordId:'78:12:4',type:'MISSED_WORD',confidence:0.96,corrected:false},{verseKey:'78:14',wordId:'78:14:3',type:'HESITATION',confidence:0.79,corrected:false}]};}
}
export const mockRecitationService=new MockRecitationEvaluationService();