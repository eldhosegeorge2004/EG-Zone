const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://oshsvjcapdffhebrfuzg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaHN2amNhcGRmZmhlYnJmdXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTkwOTcsImV4cCI6MjA5ODA3NTA5N30.OSB4jPk75du7EQFVSetwnImXvnnjWACH_xk5ObeLxUg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Testing Supabase Insert...");
  const { data, error } = await supabase
    .from('scores')
    .insert([
      { 
        game_id: 'test_game', 
        player_name: 'test_player', 
        score: 100 
      }
    ]);

  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success:", data);
  }

  console.log("Testing Supabase Fetch...");
  const { data: fetch_data, error: fetch_error } = await supabase
    .from('scores')
    .select('*')
    .limit(1);
    
  if (fetch_error) {
    console.error("Fetch Error:", fetch_error);
  } else {
    console.log("Fetch Success:", fetch_data);
  }
}

testInsert();
