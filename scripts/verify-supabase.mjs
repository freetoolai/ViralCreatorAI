import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables in .env.local');
    process.exit(1);
}

console.log(`🔍 Connecting to Supabase at: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    const tables = ['influencers', 'clients', 'campaigns', 'campaign_groups'];

    for (const table of tables) {
        try {
            console.log(`\n📊 Checking table: ${table}...`);
            const { data, error } = await supabase.from(table).select('*').limit(1);

            if (error) {
                if (error.code === '42P01') {
                    console.error(`❌ Table "${table}" does not exist in the database.`);
                } else if (error.code === 'PGRST301') {
                    console.error(`❌ JWT/Permissions error: ${error.message}`);
                } else {
                    console.error(`❌ Error fetching from "${table}":`, JSON.stringify(error, null, 2));
                }
            } else {
                console.log(`✅ Table "${table}" is accessible. Row count (limited to 1): ${data.length}`);
            }
        } catch (e) {
            console.error(`💥 Fatal error checking table ${table}:`, e);
        }
    }
}

verify().catch(console.error);
