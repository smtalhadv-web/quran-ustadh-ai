// Copy to config.js for local/static deployment, or generate at deploy time.
// The Supabase publishable key is intended for browser use. Protect data with RLS.
// Never put a service_role key here.
window.QURAN_USTADH_CONFIG = {
  supabase: {
    url: "",
    publishableKey: ""
  }
};