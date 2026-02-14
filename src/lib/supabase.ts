import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isInvalid = !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === 'your_project_url_here' ||
    !supabaseUrl.startsWith('http');

if (isInvalid) {
    console.warn('⚠️ Supabase URL or Anon Key is missing or invalid. Database features will be mocked.');
}

// Comprehensive mock for build-time safety and graceful degradation
const createMockChain = () => {
    const chain: Record<string, unknown> = {
        select: () => chain,
        insert: () => chain,
        update: () => chain,
        delete: () => chain,
        upsert: () => chain,
        eq: () => chain,
        single: () => chain,
        order: () => chain,
        limit: () => chain,
        // Make it thenable so it can be awaited
        then: (onfulfilled?: (value: { data: any; error: any }) => any) => {
            return Promise.resolve({ data: null, error: null }).then(onfulfilled);
        }
    };
    return chain as any; // Cast back to any for wide compatibility in mock
};

const mockSupabase = {
    from: () => createMockChain()
};

export const supabase = isInvalid
    ? (mockSupabase as unknown as ReturnType<typeof createClient>)
    : createClient(supabaseUrl, supabaseAnonKey);
