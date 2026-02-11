
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log('Fetching events...');
    const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, slug, description, content, news_publish_date, image_url, created_at, is_hidden')
        .not('news_publish_date', 'is', null)
        .order('news_publish_date', { ascending: false });

    if (eventsError) {
        console.error('Error fetching events:', eventsError);
    } else {
        console.log(`Fetched ${events.length} events`);
        if (events.length > 0) console.log('Sample:', events[0]);
    }
}

testFetch();
