import { useState, useCallback } from 'react';
import { dataStore } from '@/lib/store';

import { Influencer, Client, Campaign } from '@/lib/types';

export type SearchResultGroup = {
    type: string;
    items: (Influencer | Client | Campaign)[];
    path: string;
    key: string;
    label: string;
    sub: string;
};

export function useGlobalSearch() {
    const [results, setResults] = useState<SearchResultGroup[]>([]);

    const search = useCallback(async (query: string) => {
        if (!query || query.length < 1) {
            setResults([]);
            return;
        }

        const lowerQ = query.toLowerCase();

        try {
            const [allInfs, allClients, allCamps] = await Promise.all([
                dataStore.getInfluencers(),
                dataStore.getClients(),
                dataStore.getCampaigns()
            ]);

            // Search Influencers
            const infs = allInfs.filter(i =>
                i.name.toLowerCase().includes(lowerQ) ||
                i.primaryNiche.toLowerCase().includes(lowerQ) ||
                i.platforms.some(p => p.handle.toLowerCase().includes(lowerQ))
            ).slice(0, 3);

            // Search Clients
            const clients = allClients.filter(c =>
                c.name.toLowerCase().includes(lowerQ) ||
                c.companyName.toLowerCase().includes(lowerQ)
            ).slice(0, 3);

            // Search Campaigns
            const camps = allCamps.filter(c =>
                c.title.toLowerCase().includes(lowerQ)
            ).slice(0, 3);

            const newResults: SearchResultGroup[] = [];

            if (infs.length) {
                newResults.push({
                    type: 'Influencers',
                    items: infs,
                    path: '/admin/influencers',
                    key: 'id',
                    label: 'name',
                    sub: 'primaryNiche'
                });
            }

            if (clients.length) {
                newResults.push({
                    type: 'Clients',
                    items: clients,
                    path: '/admin/clients',
                    key: 'id',
                    label: 'companyName',
                    sub: 'name'
                });
            }

            if (camps.length) {
                newResults.push({
                    type: 'Campaigns',
                    items: camps,
                    path: '/admin/campaigns',
                    key: 'id',
                    label: 'title',
                    sub: 'status'
                });
            }

            setResults(newResults);
        } catch (error) {
            console.error("Global search failed:", error);
            setResults([]);
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults([]);
    }, []);

    return { results, search, clearResults };
}
