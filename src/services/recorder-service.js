export class RecorderService {
  constructor(){ this.recorder=null; this.stream=null; this.chunks=[]; this.lastBlob=null; this.lastUrl=null; }
  get supported(){ return !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder); }
  async start(){
    if(!this.supported) throw new Error('Microphone recording is not supported on this browser.');
    this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    this.chunks=[];
    const preferred=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported?.(t));
    this.recorder=new MediaRecorder(this.stream,preferred?{mimeType:preferred}:undefined);
    this.recorder.ondataavailable=e=>{ if(e.data?.size) this.chunks.push(e.data); };
    this.recorder.start(250);
    return true;
  }
  async stop(){
    if(!this.recorder || this.recorder.state==='inactive') return this.lastBlob;
    return new Promise((resolve,reject)=>{
      this.recorder.onerror=()=>reject(new Error('Recording failed.'));
      this.recorder.onstop=()=>{
        const type=this.recorder.mimeType || this.chunks[0]?.type || 'audio/webm';
        this.lastBlob=new Blob(this.chunks,{type});
        if(this.lastUrl) URL.revokeObjectURL(this.lastUrl);
        this.lastUrl=URL.createObjectURL(this.lastBlob);
        this.stream?.getTracks().forEach(t=>t.stop());
        this.stream=null; this.recorder=null; this.chunks=[];
        resolve(this.lastBlob);
      };
      this.recorder.stop();
    });
  }
  getPlaybackUrl(){ return this.lastUrl; }
  clear(){
    if(this.lastUrl) URL.revokeObjectURL(this.lastUrl);
    this.lastUrl=null; this.lastBlob=null;
  }
}
export const recorderService=new RecorderService();