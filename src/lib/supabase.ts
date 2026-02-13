import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const isMissingKeys = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (isMissingKeys) {
    console.warn('⚠️ Supabase URL or Anon Key is missing. Database features will not work in this environment.');
}

// Minimal mock for build-time safety
const mockSupabase = {
    from: () => ({
        select: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
            eq: () => ({
                single: () => Promise.resolve({ data: null, error: null }),
                order: () => Promise.resolve({ data: [], error: null }),
            }),
            limit: () => ({
                order: () => Promise.resolve({ data: [], error: null })
            })
        }),
        insert: () => Promise.resolve({ error: null }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        upsert: () => Promise.resolve({ error: null }),
    })
};

export const supabase = isMissingKeys
    ? (mockSupabase as unknown as ReturnType<typeof createClient>)
    : createClient(supabaseUrl, supabaseAnonKey);
