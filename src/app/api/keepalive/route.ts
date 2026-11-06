import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint is called by an external cron service (cron-job.org) every day
// to keep the Supabase free-tier project from auto-pausing after 7 days of inactivity.
export async function GET(request: Request) {
  // Simple security check - require a secret token so random people can't call this
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.KEEPALIVE_SECRET && token !== 'egzone-keepalive-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(
      "https://oshsvjcapdffhebrfuzg.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaHN2amNhcGRmZmhlYnJmdXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTkwOTcsImV4cCI6MjA5ODA3NTA5N30.OSB4jPk75du7EQFVSetwnImXvnnjWACH_xk5ObeLxUg"
    );

    // Lightweight query - just count rows, doesn't load any data
    const { count, error } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      scores_count: count,
      message: 'Supabase keep-alive ping successful ✅'
    });

  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: err.message || 'Keep-alive ping failed'
    }, { status: 500 });
  }
}
