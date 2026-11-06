const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://oshsvjcapdffhebrfuzg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaHN2amNhcGRmZmhlYnJmdXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTkwOTcsImV4cCI6MjA5ODA3NTA5N30.OSB4jPk75du7EQFVSetwnImXvnnjWACH_xk5ObeLxUg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("1. Testing connection - reading scores table...");
  const { data: readData, error: readError } = await supabase
    .from('scores')
    .select('*')
    .limit(3);

  if (readError) {
    console.error("READ ERROR:", JSON.stringify(readError, null, 2));
  } else {
    console.log("READ SUCCESS. Sample rows:", JSON.stringify(readData, null, 2));
  }

  console.log("\n2. Testing INSERT into scores table...");
  const { data: insertData, error: insertError } = await supabase
    .from('scores')
    .insert([{ game_id: 'snake', player_name: 'TestPlayer', score: 999 }])
    .select();

  if (insertError) {
    console.error("INSERT ERROR:", JSON.stringify(insertError, null, 2));
    console.error("\nError code:", insertError.code);
    console.error("Error message:", insertError.message);
    console.error("Error details:", insertError.details);
    console.error("Error hint:", insertError.hint);
  } else {
    console.log("INSERT SUCCESS:", JSON.stringify(insertData, null, 2));
    // Clean up test row
    if (insertData && insertData[0]) {
      await supabase.from('scores').delete().eq('id', insertData[0].id);
      console.log("Test row cleaned up.");
    }
  }
}

test().catch(console.error);
