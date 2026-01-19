import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bwqngaqtnaozxpnmxgjv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cW5nYXF0bmFvenhwbm14Z2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDQ4MTEsImV4cCI6MjA4NDM4MDgxMX0.nUGc-Qc1rcV_--66_T0IL9YtbJO47f3U0DzjaIStKhQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);