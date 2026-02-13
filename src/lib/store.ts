import { Influencer, Client, Campaign, CampaignInfluencerRef, CampaignGroup } from './types';
import { supabase } from './supabase';

interface InfluencerRow {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    shipping_address: string | null;
    primary_niche: string | null;
    secondary_niches: string[] | null;
    tier: Influencer['tier'];
    internal_notes: string | null;
    platforms: import('./types').SocialProfile[] | null;
    typical_payout: number | null;
    typical_charge: number | null;
    media_kit_url: string | null;
    created_at?: string;
}

interface ClientRow {
    id: string;
    name: string;
    email: string;
    company_name: string | null;
    access_code: string | null;
    created_at?: string;
}

interface CampaignRow {
    id: string;
    client_id: string;
    title: string;
    status: Campaign['status'];
    total_budget: number | null;
    platform_focus: string[] | null;
    required_niches: string[] | null;
    influencers: CampaignInfluencerRef[] | null;
    description: string | null;
    created_at?: string;
}

interface GroupRow {
    id: string;
    title: string;
    description: string | null;
    campaign_ids: string[] | null;
    client_id: string;
    created_at: string;
}

class Store {
    // --- INFLUENCER ACTIONS ---

    async getInfluencers(): Promise<Influencer[]> {
        const { data, error } = await supabase
            .from('influencers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map snake_case from DB to camelCase for app
        return (data || []).map(this.mapInfluencerFromDB);
    }

    async getInfluencer(id: string): Promise<Influencer | undefined> {
        const { data, error } = await supabase
            .from('influencers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return this.mapInfluencerFromDB(data);
    }

    async addInfluencer(inf: Influencer) {
        const dbEntry = this.mapInfluencerToDB(inf);
        const { error } = await supabase
            .from('influencers')
            .insert(dbEntry);

        if (error) throw error;
    }

    async addInfluencers(influencers: Influencer[]) {
        const dbEntries = influencers.map(inf => this.mapInfluencerToDB(inf));
        const { error } = await supabase
            .from('influencers')
            .insert(dbEntries);

        if (error) throw error;
    }

    async updateInfluencer(id: string, updates: Partial<Influencer>) {
        const updatesToApply: Partial<InfluencerRow> = { ...this.mapInfluencerToDB(updates as Influencer) };
        delete updatesToApply.id;
        const { error } = await supabase
            .from('influencers')
            .update(updatesToApply)
            .eq('id', id);

        if (error) throw error;
    }

    async deleteInfluencer(id: string) {
        const { error } = await supabase
            .from('influencers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- CLIENT ACTIONS ---

    async getClients(): Promise<Client[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapClientFromDB);
    }

    async addClient(client: Client) {
        const dbEntry = this.mapClientToDB(client);
        const { error } = await supabase
            .from('clients')
            .insert(dbEntry);

        if (error) throw error;
    }

    async updateClient(id: string, updates: Partial<Client>) {
        const updatesToApply: Partial<ClientRow> = { ...this.mapClientToDB(updates as Client) };
        delete updatesToApply.id;
        const { error } = await supabase
            .from('clients')
            .update(updatesToApply)
            .eq('id', id);

        if (error) throw error;
    }

    async deleteClient(id: string) {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- CAMPAIGN ACTIONS ---

    async getCampaigns(clientId?: string): Promise<Campaign[]> {
        let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(this.mapCampaignFromDB);
    }

    async getCampaign(id: string): Promise<Campaign | undefined> {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return this.mapCampaignFromDB(data);
    }

    async addCampaign(camp: Campaign) {
        const dbEntry = this.mapCampaignToDB(camp);
        const { error } = await supabase
            .from('campaigns')
            .insert(dbEntry);

        if (error) throw error;
    }

    async updateCampaign(id: string, updates: Partial<Campaign>) {
        const updatesToApply: Partial<CampaignRow> = { ...this.mapCampaignToDB(updates as Campaign) };
        delete updatesToApply.id;
        const { error } = await supabase
            .from('campaigns')
            .update(updatesToApply)
            .eq('id', id);

        if (error) throw error;
    }

    async deleteCampaign(id: string) {
        const { error } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- GROUP ACTIONS ---

    async getGroups(clientId?: string): Promise<CampaignGroup[]> {
        let query = supabase.from('campaign_groups').select('*').order('created_at', { ascending: false });
        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(this.mapGroupFromDB);
    }

    async getGroup(id: string): Promise<CampaignGroup | undefined> {
        const { data, error } = await supabase
            .from('campaign_groups')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return this.mapGroupFromDB(data);
    }

    async addGroup(group: CampaignGroup) {
        const dbEntry = this.mapGroupToDB(group);
        const { error } = await supabase
            .from('campaign_groups')
            .insert(dbEntry);

        if (error) throw error;
    }

    async deleteGroup(id: string) {
        const { error } = await supabase
            .from('campaign_groups')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async purgeAllData() {
        // Delete in order to handle potential dependencies (though RLS/FK might handle it)
        const tables = ['campaign_groups', 'campaigns', 'influencers', 'clients'];
        for (const table of tables) {
            const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
            if (error) {
                console.error(`Failed to purge ${table}:`, error);
                throw error;
            }
        }
    }

    // --- CAMPAIGN ROSTER ACTIONS ---

    async addInfluencerToCampaign(campaignId: string, influencerId: string) {
        const camp = await this.getCampaign(campaignId);
        const inf = await this.getInfluencer(influencerId);

        if (camp && inf) {
            if (camp.influencers?.some((ref: CampaignInfluencerRef) => ref.influencerId === influencerId)) return;

            const newRef: CampaignInfluencerRef = {
                influencerId: inf.id,
                status: 'Shortlisted',
                influencerFee: inf.typicalPayout || 0,
                clientFee: inf.typicalCharge || 0,
                deliverables: 'To be defined',
                productAccess: false,
                updatedAt: new Date().toISOString()
            };

            const updatedInfluencers = [...(camp.influencers || []), newRef];
            await this.updateCampaign(campaignId, { influencers: updatedInfluencers });
        }
    }

    async updateInfluencerInCampaign(campaignId: string, influencerId: string, updates: Partial<CampaignInfluencerRef>) {
        const camp = await this.getCampaign(campaignId);
        if (camp) {
            const updatedInfluencers = camp.influencers.map((ref: CampaignInfluencerRef) =>
                ref.influencerId === influencerId ? { ...ref, ...updates, updatedAt: new Date().toISOString() } : ref
            );
            await this.updateCampaign(campaignId, { influencers: updatedInfluencers });
        }
    }

    async removeInfluencerFromCampaign(campaignId: string, influencerId: string) {
        const camp = await this.getCampaign(campaignId);
        if (camp && camp.influencers) {
            const updatedInfluencers = camp.influencers.filter((ref: CampaignInfluencerRef) => ref.influencerId !== influencerId);
            await this.updateCampaign(campaignId, { influencers: updatedInfluencers });
        }
    }

    // --- FINANCIAL SUMMARY ---

    async getCampaignFinancials(campaignId: string) {
        const camp = await this.getCampaign(campaignId);
        if (!camp || !camp.influencers) return { totalPayout: 0, totalRevenue: 0, totalProfit: 0 };

        return camp.influencers.reduce((acc: { totalPayout: number, totalRevenue: number, totalProfit: number }, curr: CampaignInfluencerRef) => {
            const infFee = Number(curr.influencerFee) || 0;
            const cliFee = Number(curr.clientFee) || 0;
            return {
                totalPayout: acc.totalPayout + infFee,
                totalRevenue: acc.totalRevenue + cliFee,
                totalProfit: acc.totalProfit + (cliFee - infFee)
            };
        }, { totalPayout: 0, totalRevenue: 0, totalProfit: 0 });
    }

    // --- UTILS / MAPPING ---

    private mapInfluencerFromDB(row: InfluencerRow): Influencer {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone || undefined,
            shippingAddress: row.shipping_address || undefined,
            primaryNiche: row.primary_niche || '',
            secondaryNiches: row.secondary_niches || [],
            tier: row.tier,
            internalNotes: row.internal_notes || undefined,
            platforms: row.platforms || [],
            typicalPayout: row.typical_payout || undefined,
            typicalCharge: row.typical_charge || undefined,
            mediaKitUrl: row.media_kit_url || undefined
        };
    }

    private mapInfluencerToDB(inf: Influencer): InfluencerRow {
        return {
            id: inf.id,
            name: inf.name,
            email: inf.email,
            phone: inf.phone || null,
            shipping_address: inf.shippingAddress || null,
            primary_niche: inf.primaryNiche || null,
            secondary_niches: inf.secondaryNiches || null,
            tier: inf.tier,
            internal_notes: inf.internalNotes || null,
            platforms: inf.platforms || null,
            typical_payout: inf.typicalPayout || null,
            typical_charge: inf.typicalCharge || null,
            media_kit_url: inf.mediaKitUrl || null
        };
    }

    private mapClientFromDB(row: ClientRow): Client {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            companyName: row.company_name || '',
            accessCode: row.access_code || ''
        };
    }

    private mapClientToDB(client: Client): ClientRow {
        return {
            id: client.id,
            name: client.name,
            email: client.email,
            company_name: client.companyName || null,
            access_code: client.accessCode || null
        };
    }

    private mapCampaignFromDB(row: CampaignRow): Campaign {
        return {
            id: row.id,
            clientId: row.client_id,
            title: row.title,
            status: row.status,
            totalBudget: row.total_budget || 0,
            platformFocus: (row.platform_focus || []) as import('./types').PlatformName[],
            requiredNiches: row.required_niches || [],
            influencers: row.influencers || [],
            createdAt: row.created_at || new Date().toISOString(),
            description: row.description || undefined
        };
    }

    private mapCampaignToDB(camp: Campaign): CampaignRow {
        return {
            id: camp.id,
            client_id: camp.clientId,
            title: camp.title,
            status: camp.status,
            total_budget: camp.totalBudget || null,
            platform_focus: camp.platformFocus || null,
            required_niches: camp.requiredNiches || null,
            influencers: camp.influencers || null,
            description: camp.description || null
        };
    }

    private mapGroupFromDB(row: GroupRow): CampaignGroup {
        return {
            id: row.id,
            title: row.title,
            description: row.description || undefined,
            campaignIds: row.campaign_ids || [],
            clientId: row.client_id,
            createdAt: row.created_at
        };
    }

    private mapGroupToDB(group: CampaignGroup): Partial<GroupRow> {
        return {
            id: group.id,
            title: group.title,
            description: group.description || null,
            campaign_ids: group.campaignIds || null,
            client_id: group.clientId
        };
    }

    // --- USER / TEAM ACTIONS ---

    getUsers(): import('./types').User[] {
        // This is still using mock data for the team view for now as we don't have a users table yet
        return [
            { id: 'u1', name: 'Admin User', email: 'admin@viralcreatorai.io', role: 'Admin' },
            { id: 'u2', name: 'Sarah Campaigner', email: 'sarah@agency.com', role: 'Campaign Manager' },
            { id: 'u3', name: 'James Viewer', email: 'james@client.com', role: 'Viewer' }
        ];
    }
}

export const dataStore = new Store();
