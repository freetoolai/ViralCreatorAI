import { Influencer, Client, Campaign, CampaignInfluencerRef, CampaignGroup } from './types';
import { supabase, isInvalid } from './supabase';

const isBrowser = typeof window !== 'undefined';
let mockInfluencers: InfluencerRow[] = [];
let mockCampaigns: CampaignRow[] = [];
let mockClients: ClientRow[] = [];
let mockGroups: GroupRow[] = [];

if (isBrowser) {
    const savedInf = localStorage.getItem('data_store_influencers');
    if (savedInf) {
        try { mockInfluencers = JSON.parse(savedInf); } catch { }
    }
    const savedCamp = localStorage.getItem('data_store_campaigns');
    if (savedCamp) {
        try { mockCampaigns = JSON.parse(savedCamp); } catch { }
    }
    const savedClients = localStorage.getItem('data_store_clients');
    if (savedClients) {
        try { mockClients = JSON.parse(savedClients); } catch { }
    }
    const savedGroups = localStorage.getItem('data_store_groups');
    if (savedGroups) {
        try { mockGroups = JSON.parse(savedGroups); } catch { }
    }
}

const saveToMock = () => {
    if (isBrowser) {
        localStorage.setItem('data_store_influencers', JSON.stringify(mockInfluencers));
        localStorage.setItem('data_store_campaigns', JSON.stringify(mockCampaigns));
        localStorage.setItem('data_store_clients', JSON.stringify(mockClients));
        localStorage.setItem('data_store_groups', JSON.stringify(mockGroups));
    }
};

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
        if (isInvalid) {
            return mockInfluencers.map(row => this.mapInfluencerFromDB(row));
        }

        const { data, error } = await supabase
            .from('influencers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map snake_case from DB to camelCase for app
        return (data || []).map(this.mapInfluencerFromDB);
    }

    async getInfluencer(id: string): Promise<Influencer | undefined> {
        if (isInvalid) {
            const found = mockInfluencers.find(i => i.id === id);
            return found ? this.mapInfluencerFromDB(found) : undefined;
        }

        const { data, error } = await supabase
            .from('influencers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return this.mapInfluencerFromDB(data);
    }

    async addInfluencer(inf: Influencer): Promise<Influencer> {
        const dbEntry = this.mapInfluencerToDB(inf);

        if (isInvalid) {
            // Check for duplicates
            if (mockInfluencers.some(i => i.email.toLowerCase() === inf.email.toLowerCase())) {
                throw new Error('An influencer with this email already exists.');
            }
            const row: InfluencerRow = {
                ...dbEntry,
                id: dbEntry.id || `inf-${Date.now()}`,
                created_at: new Date().toISOString()
            };
            mockInfluencers.push(row);
            saveToMock();
            return this.mapInfluencerFromDB(row);
        }

        // Remove ID if it's one of our temporary ones to let Supabase generate a UUID
        if (dbEntry.id && dbEntry.id.startsWith('inf-')) {
            delete (dbEntry as any).id;
        }

        const { data, error } = await supabase
            .from('influencers')
            .insert(dbEntry)
            .select()
            .single();

        if (error) throw error;
        if (!data) return inf; // Fallback for mock
        return this.mapInfluencerFromDB(data);
    }

    async addInfluencers(influencers: Influencer[]) {
        const dbEntries = influencers.map(inf => this.mapInfluencerToDB(inf));
        const { error } = await supabase
            .from('influencers')
            .insert(dbEntries);

        if (error) throw error;
    }

    async updateInfluencer(id: string, updates: Partial<Influencer>) {
        if (isInvalid) {
            const index = mockInfluencers.findIndex(i => i.id === id);
            if (index !== -1) {
                const fullMapped = this.mapInfluencerToDB(updates as Influencer);
                Object.keys(updates).forEach(key => {
                    const dbKey = this.getDbKeyForAppKey(key as keyof Influencer);
                    if (dbKey) {
                        (mockInfluencers[index] as any)[dbKey] = (fullMapped as any)[dbKey];
                    }
                });
                saveToMock();
            }
            return;
        }

        const fullMapped = this.mapInfluencerToDB(updates as Influencer);

        // Only include keys that were actually present in the updates object
        const updatesToApply: any = {};
        Object.keys(updates).forEach(key => {
            const dbKey = this.getDbKeyForAppKey(key as keyof Influencer);
            if (dbKey) {
                updatesToApply[dbKey] = (fullMapped as any)[dbKey];
            }
        });

        const { error } = await supabase
            .from('influencers')
            .update(updatesToApply)
            .eq('id', id);

        if (error) throw error;
    }

    private getDbKeyForAppKey(key: keyof Influencer): string | null {
        const mapping: Record<string, string> = {
            id: 'id',
            name: 'name',
            email: 'email',
            phone: 'phone',
            shippingAddress: 'shipping_address',
            primaryNiche: 'primary_niche',
            secondaryNiches: 'secondary_niches',
            tier: 'tier',
            internalNotes: 'internal_notes',
            platforms: 'platforms',
            typicalPayout: 'typical_payout',
            typicalCharge: 'typical_charge',
            mediaKitUrl: 'media_kit_url'
        };
        return mapping[key] || null;
    }

    async deleteInfluencer(id: string) {
        if (isInvalid) {
            mockInfluencers = mockInfluencers.filter(i => i.id !== id);
            saveToMock();
            return;
        }

        const { error } = await supabase
            .from('influencers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- CLIENT ACTIONS ---

    async getClients(): Promise<Client[]> {
        if (isInvalid) {
            return mockClients.map(row => this.mapClientFromDB(row));
        }

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapClientFromDB);
    }

    async addClient(client: Client) {
        if (isInvalid) {
            const dbEntry = this.mapClientToDB(client);
            const row: ClientRow = {
                ...dbEntry,
                id: dbEntry.id || `client-${Date.now()}`,
                created_at: new Date().toISOString()
            };
            mockClients.push(row);
            saveToMock(); // Ensure immediate save
            return;
        }

        const dbEntry = this.mapClientToDB(client);
        const { error } = await supabase
            .from('clients')
            .insert(dbEntry);

        if (error) throw error;
    }

    async updateClient(id: string, updates: Partial<Client>) {
        if (isInvalid) {
            const index = mockClients.findIndex(c => c.id === id);
            if (index !== -1) {
                // Similar manual merge strategy as campaign
                const updatesToApply: any = {};
                const mapKey = (k: keyof Client): keyof ClientRow | null => {
                    if (k === 'companyName') return 'company_name';
                    if (k === 'accessCode') return 'access_code';
                    return k as keyof ClientRow;
                };

                Object.keys(updates).forEach(key => {
                    const dbKey = mapKey(key as keyof Client);
                    if (dbKey) {
                        if (key === 'companyName') (updatesToApply as any).company_name = updates.companyName;
                        else if (key === 'accessCode') (updatesToApply as any).access_code = updates.accessCode;
                        else (updatesToApply as any)[dbKey] = (updates as any)[key];
                    }
                });

                mockClients[index] = { ...mockClients[index], ...updatesToApply };
                saveToMock();
            }
            return;
        }

        const updatesToApply: Partial<ClientRow> = { ...this.mapClientToDB(updates as Client) };
        delete updatesToApply.id;
        const { error } = await supabase
            .from('clients')
            .update(updatesToApply)
            .eq('id', id);

        if (error) throw error;
    }

    async deleteClient(id: string) {
        if (isInvalid) {
            mockClients = mockClients.filter(c => c.id !== id);
            saveToMock();
            return;
        }

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- CAMPAIGN ACTIONS ---

    async getCampaigns(clientId?: string): Promise<Campaign[]> {
        if (isInvalid) {
            let filtered = mockCampaigns;
            if (clientId) {
                filtered = mockCampaigns.filter(c => c.client_id === clientId);
            }
            return filtered.map(row => this.mapCampaignFromDB(row));
        }

        let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(this.mapCampaignFromDB);
    }

    async getCampaign(id: string): Promise<Campaign | undefined> {
        if (isInvalid) {
            const found = mockCampaigns.find(c => c.id === id);
            return found ? this.mapCampaignFromDB(found) : undefined;
        }

        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return this.mapCampaignFromDB(data);
    }

    async addCampaign(camp: Campaign) {
        if (isInvalid) {
            const dbEntry = this.mapCampaignToDB(camp);
            const row: CampaignRow = {
                ...dbEntry,
                id: dbEntry.id || `camp-${Date.now()}`,
                created_at: new Date().toISOString()
            };
            mockCampaigns.push(row);
            saveToMock(); // Ensure we save to localStorage immediately
            return;
        }

        const dbEntry = this.mapCampaignToDB(camp);
        const { error } = await supabase
            .from('campaigns')
            .insert(dbEntry);

        if (error) throw error;
    }

    async updateCampaign(id: string, updates: Partial<Campaign>) {
        if (isInvalid) {
            const index = mockCampaigns.findIndex(c => c.id === id);
            if (index !== -1) {
                // We need to merge carefully because mapCampaignToDB might overwrite missing keys with null if we passed a partial object cast to Campaign, 
                // but here we are constructing a full object first so it should be safe.
                // However, mapCampaignToDB expects a full Campaign object. 
                // Let's do it manually for partial updates to be safe and consistent with updateInfluencer logic.

                const updatesToApply: any = {};
                // Helper to map keys
                const mapKey = (k: keyof Campaign): keyof CampaignRow | null => {
                    if (k === 'clientId') return 'client_id';
                    if (k === 'totalBudget') return 'total_budget';
                    if (k === 'platformFocus') return 'platform_focus';
                    if (k === 'requiredNiches') return 'required_niches';
                    return k as keyof CampaignRow;
                };

                Object.keys(updates).forEach(key => {
                    const dbKey = mapKey(key as keyof Campaign);
                    if (dbKey) {
                        // We need to handle the mapping of values too
                        if (key === 'clientId') (updatesToApply as any).client_id = updates.clientId;
                        else if (key === 'totalBudget') (updatesToApply as any).total_budget = updates.totalBudget;
                        else if (key === 'platformFocus') (updatesToApply as any).platform_focus = updates.platformFocus;
                        else if (key === 'requiredNiches') (updatesToApply as any).required_niches = updates.requiredNiches;
                        else (updatesToApply as any)[dbKey] = (updates as any)[key];
                    }
                });

                // Merging
                mockCampaigns[index] = { ...mockCampaigns[index], ...updatesToApply };
                saveToMock();
            }
            return;
        }

        const updatesToApply: Partial<CampaignRow> = { ...this.mapCampaignToDB(updates as Campaign) };
        delete updatesToApply.id;
        const { error } = await supabase
            .from('campaigns')
            .update(updatesToApply)
            .eq('id', id);

        if (error) throw error;
    }

    async deleteCampaign(id: string) {
        if (isInvalid) {
            mockCampaigns = mockCampaigns.filter(c => c.id !== id);
            saveToMock();
            return;
        }

        const { error } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- GROUP ACTIONS ---

    async getGroups(clientId?: string): Promise<CampaignGroup[]> {
        if (isInvalid) {
            let filtered = mockGroups;
            if (clientId) {
                filtered = mockGroups.filter(g => g.client_id === clientId);
            }
            return filtered.map(row => this.mapGroupFromDB(row));
        }

        let query = supabase.from('campaign_groups').select('*').order('created_at', { ascending: false });
        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(this.mapGroupFromDB);
    }

    async getGroup(id: string): Promise<CampaignGroup | undefined> {
        if (isInvalid) {
            const found = mockGroups.find(g => g.id === id);
            return found ? this.mapGroupFromDB(found) : undefined;
        }

        const { data, error } = await supabase
            .from('campaign_groups')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return this.mapGroupFromDB(data);
    }

    async addGroup(group: CampaignGroup) {
        if (isInvalid) {
            const row: GroupRow = {
                id: group.id || `group-${Date.now()}`,
                title: group.title,
                description: group.description || null,
                campaign_ids: group.campaignIds || null,
                client_id: group.clientId,
                created_at: new Date().toISOString()
            };
            mockGroups.push(row);
            saveToMock(); // Ensure persistence
            return;
        }

        const dbEntry = this.mapGroupToDB(group);
        const { error } = await supabase
            .from('campaign_groups')
            .insert(dbEntry);

        if (error) throw error;
    }

    async deleteGroup(id: string) {
        if (isInvalid) {
            mockGroups = mockGroups.filter(g => g.id !== id);
            saveToMock();
            return;
        }

        const { error } = await supabase
            .from('campaign_groups')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async purgeAllData() {
        if (isInvalid) {
            mockGroups = [];
            mockCampaigns = [];
            mockInfluencers = [];
            mockClients = [];
            saveToMock();
            return;
        }

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
        // Return an empty array for now since we don't have a users table yet.
        // This prevents showing hardcoded demo team members in the UI.
        return [];
    }
}

export const dataStore = new Store();
