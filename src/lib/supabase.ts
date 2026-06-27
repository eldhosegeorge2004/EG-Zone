import { createClient } from '@supabase/supabase-js';

// Completely hardcoded to override any broken Vercel environment variables
const supabaseUrl = "https://oshsvjcapdffhebrfuzg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaHN2amNhcGRmZmhlYnJmdXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTkwOTcsImV4cCI6MjA5ODA3NTA5N30.OSB4jPk75du7EQFVSetwnImXvnnjWACH_xk5ObeLxUg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
