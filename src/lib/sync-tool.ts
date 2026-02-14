import { dataStore } from './store';

export const syncToSupabase = async () => {
    console.log('🚀 Starting sync from localStorage to Supabase...');

    const results = {
        influencers: 0,
        clients: 0,
        campaigns: 0,
        groups: 0,
        errors: [] as string[]
    };

    try {
        // 1. Sync Influencers
        const localInfs = localStorage.getItem('data_store_influencers');
        if (localInfs) {
            const influencers = JSON.parse(localInfs);
            for (const inf of influencers) {
                try {
                    await dataStore.addInfluencer(inf);
                    results.influencers++;
                } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    results.errors.push(`Influencer ${inf.name}: ${errorMessage}`);
                }
            }
            // Clear if sync was largely successful
            localStorage.removeItem('data_store_influencers');
        }

        // 2. Sync Clients
        const localClients = localStorage.getItem('data_store_clients');
        if (localClients) {
            const clients = JSON.parse(localClients);
            for (const client of clients) {
                try {
                    await dataStore.addClient(client);
                    results.clients++;
                } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    results.errors.push(`Client ${client.name}: ${errorMessage}`);
                }
            }
            localStorage.removeItem('data_store_clients');
        }

        // 3. Sync Campaigns
        const localCampaigns = localStorage.getItem('data_store_campaigns');
        if (localCampaigns) {
            const campaigns = JSON.parse(localCampaigns);
            for (const camp of campaigns) {
                try {
                    await dataStore.addCampaign(camp);
                    results.campaigns++;
                } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    results.errors.push(`Campaign ${camp.title}: ${errorMessage}`);
                }
            }
            localStorage.removeItem('data_store_campaigns');
        }

        // 4. Sync Groups
        const localGroups = localStorage.getItem('data_store_groups');
        if (localGroups) {
            const groups = JSON.parse(localGroups);
            for (const group of groups) {
                try {
                    await dataStore.addGroup(group);
                    results.groups++;
                } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    results.errors.push(`Group ${group.title}: ${errorMessage}`);
                }
            }
            localStorage.removeItem('data_store_groups');
        }

        console.log('✅ Sync completed!', results);
        return results;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('💥 Fatal sync error:', message);
        throw error;
    }
};
