// Optional production persistence. Uses only the browser-safe Supabase publishable key.
// Never place a service_role key in this file or any client-side config.
export class SupabaseService {
  constructor(){ this.client=null; this.ready=false; }
  async init(){
    const cfg=window.QURAN_USTADH_CONFIG?.supabase;
    if(!cfg?.url || !cfg?.publishableKey) return false;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    this.client=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    this.ready=true;
    return true;
  }
  async getSession(){ if(!this.ready) return null; return (await this.client.auth.getSession()).data.session; }
  async saveSessionSummary(studentId,summary){
    if(!this.ready || !studentId) return { skipped:true };
    const {data,error}=await this.client.from('lesson_sessions').insert({
      student_id:studentId,
      started_at:summary.startedAt||new Date().toISOString(),
      ended_at:new Date().toISOString(),
      summary
    }).select('id').single();
    if(error) throw error;
    return data;
  }
}
export const supabaseService=new SupabaseService();