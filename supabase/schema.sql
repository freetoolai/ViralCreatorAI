-- Influencers Table
CREATE TABLE IF NOT EXISTS influencers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    shipping_address TEXT,
    primary_niche TEXT,
    secondary_niches TEXT [],
    -- Array of strings
    tier TEXT,
    internal_notes TEXT,
    platforms JSONB DEFAULT '[]'::jsonb,
    -- Store social profiles as JSONB array
    typical_payout NUMERIC,
    typical_charge NUMERIC,
    media_kit_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT,
    access_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    total_budget NUMERIC,
    platform_focus TEXT [],
    required_niches TEXT [],
    influencers JSONB DEFAULT '[]'::jsonb,
    -- Store campaign influencer refs as JSONB
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Campaign Groups Table
CREATE TABLE IF NOT EXISTS campaign_groups (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    campaign_ids TEXT [],
    -- Array of campaign IDs
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable Row Level Security (RLS)
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_groups ENABLE ROW LEVEL SECURITY;
-- Simple permissive policies (using DO blocks to avoid errors if they exist)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Public full access'
        AND polrelid = 'influencers'::regclass
) THEN CREATE POLICY "Public full access" ON influencers FOR ALL USING (true) WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Public full access'
        AND polrelid = 'clients'::regclass
) THEN CREATE POLICY "Public full access" ON clients FOR ALL USING (true) WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Public full access'
        AND polrelid = 'campaigns'::regclass
) THEN CREATE POLICY "Public full access" ON campaigns FOR ALL USING (true) WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Public full access'
        AND polrelid = 'campaign_groups'::regclass
) THEN CREATE POLICY "Public full access" ON campaign_groups FOR ALL USING (true) WITH CHECK (true);
END IF;
END $$;