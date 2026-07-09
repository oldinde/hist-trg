import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://uarvahbizfvltltwdhzb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LxdEDCcdffWp0nxzKQlF6Q_Jd7ucAiG';

window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
