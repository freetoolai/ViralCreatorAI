import { Influencer, Client, Campaign, User } from './types';

// Mock Users (Team)
const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Alice Admin', email: 'alice@agency.com', role: 'Admin' },
    { id: 'u2', name: 'Bob Manager', email: 'bob@agency.com', role: 'Campaign Manager' },
];

// Mock Data
const MOCK_INFLUENCERS: Influencer[] = [
    {
        id: '1',
        name: 'Tech Reviewer A',
        email: 'contact@techA.com',
        primaryNiche: 'Tech',
        secondaryNiches: ['Gaming', 'Software'],
        tier: 'Macro',
        platforms: [
            {
                platform: 'YouTube',
                handle: 'TechA',
                link: 'https://youtube.com/@techa',
                followers: 1200000,
                avgViews: 450000,
                price: 5000,
                deliverableType: 'Dedicated Review'
            },
            {
                platform: 'Twitter',
                handle: '@techa',
                link: 'https://twitter.com/techa',
                followers: 500000
            },
        ],
        internalNotes: 'Great for B2B software reviews. High conversion.',
    },
    {
        id: '2',
        name: 'Sarah Style',
        email: 'sarah@style.com',
        primaryNiche: 'Fashion',
        secondaryNiches: ['Lifestyle', 'Beauty'],
        tier: 'Mid-Tier',
        platforms: [
            {
                platform: 'Instagram',
                handle: '@sarahstyle',
                link: 'https://instagram.com/sarahstyle',
                followers: 150000,
                engagementRate: 4.5,
                price: 1500,
                deliverableType: 'Reel + Story'
            },
        ],
    },
    {
        id: '3',
        name: 'Dev Daily',
        email: 'dev@daily.com',
        primaryNiche: 'Coding',
        secondaryNiches: ['Tech', 'Career'],
        tier: 'Micro',
        platforms: [
            { platform: 'Twitter', handle: '@devdaily', link: 'https://x.com', followers: 25000, price: 300 }
        ]
    }
];

const MOCK_CLIENTS: Client[] = [
    {
        id: 'c1',
        name: 'Jane Doe',
        email: 'jane@fintech.com',
        companyName: 'FinTech Co',
        accessCode: '1111',
    },
    {
        id: 'c2',
        name: 'Mike Shoe',
        email: 'mike@sneakers.com',
        companyName: 'SneakerHead',
        accessCode: '2222',
    },
];

const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: 'camp1',
        clientId: 'c1',
        title: 'Q3 Product Launch',
        status: 'Active',
        totalBudget: 75000,
        platformFocus: ['YouTube', 'Twitter'],
        requiredNiches: ['Tech', 'Finance'],
        influencers: [
            {
                influencerId: '1',
                status: 'Approved',
                proposedBudget: 5500,
                deliverables: 'YouTube Integration',
                updatedAt: new Date().toISOString()
            }
        ],
        createdAt: new Date().toISOString(),
    },
];

class Store {
    private influencers: Influencer[] = MOCK_INFLUENCERS;
    private clients: Client[] = MOCK_CLIENTS;
    private campaigns: Campaign[] = MOCK_CAMPAIGNS;
    private users: User[] = MOCK_USERS;

    constructor() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('apple_crm_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.influencers = parsed.influencers || MOCK_INFLUENCERS;
                this.clients = parsed.clients || MOCK_CLIENTS;
                this.campaigns = (parsed.campaigns || MOCK_CAMPAIGNS).map((c: any) => ({
                    ...c,
                    influencers: c.influencers?.map((inf: any) => ({
                        ...inf,
                        updatedAt: inf.updatedAt || (inf.status !== 'Pending' ? c.createdAt : undefined)
                    }))
                }));
                this.save();
            }
        }
    }

    // Getters
    getInfluencers() { return this.influencers; }
    getClients() { return this.clients; }
    getUsers() { return this.users; }

    getCampaigns(clientId?: string) {
        if (clientId) return this.campaigns.filter(c => c.clientId === clientId);
        return this.campaigns;
    }

    getCampaign(id: string) {
        return this.campaigns.find(c => c.id === id);
    }

    getInfluencer(id: string) {
        return this.influencers.find(i => i.id === id);
    }

    // Setters / Actions
    // --- INFLUENCER ACTIONS ---

    addInfluencer(inf: Influencer) {
        this.influencers = [inf, ...this.influencers];
        this.save();
    }

    addInfluencers(infs: Influencer[]) {
        this.influencers = [...infs, ...this.influencers]; // Newest first
        this.save();
    }

    updateInfluencer(id: string, updates: Partial<Influencer>) {
        this.influencers = this.influencers.map(inf =>
            inf.id === id ? { ...inf, ...updates } : inf
        );
        this.save();
    }

    deleteInfluencer(id: string) {
        this.influencers = this.influencers.filter(inf => inf.id !== id);
        // Also remove from all campaigns
        this.campaigns.forEach(camp => {
            if (camp.influencers) {
                camp.influencers = camp.influencers.filter(ref => ref.influencerId !== id);
            }
        });
        this.save();
    }

    deleteInfluencers(ids: string[]) {
        this.influencers = this.influencers.filter(inf => !ids.includes(inf.id));
        this.save();
    }

    // --- CLIENT ACTIONS ---

    addClient(client: Client) {
        this.clients = [client, ...this.clients];
        this.save();
    }

    updateClient(id: string, updates: Partial<Client>) {
        this.clients = this.clients.map(c =>
            c.id === id ? { ...c, ...updates } : c
        );
        this.save();
    }

    deleteClient(id: string) {
        this.clients = this.clients.filter(c => c.id !== id);
        // Also clean up campaigns for this client? 
        // For now, keep them or the store might break if they refer to non-existent client.
        // Usually better to keep historical data or cascade delete.
        this.save();
    }

    // --- CAMPAIGN ACTIONS ---

    addCampaign(camp: Campaign) {
        this.campaigns = [camp, ...this.campaigns];
        this.save();
    }

    updateCampaign(id: string, updates: Partial<Campaign>) {
        this.campaigns = this.campaigns.map(c =>
            c.id === id ? { ...c, ...updates } : c
        );
        this.save();
    }

    deleteCampaign(id: string) {
        this.campaigns = this.campaigns.filter(c => c.id !== id);
        this.save();
    }

    updateCampaignStatus(id: string, status: Campaign['status']) {
        const camp = this.campaigns.find(c => c.id === id);
        if (camp) {
            camp.status = status;
            this.save();
        }
    }

    // --- CAMPAIGN ROSTER ACTIONS ---

    addInfluencerToCampaign(campaignId: string, influencerId: string) {
        const camp = this.campaigns.find(c => c.id === campaignId);
        const inf = this.influencers.find(i => i.id === influencerId);

        if (camp && inf) {
            // Check for duplicates
            if (camp.influencers?.some(ref => ref.influencerId === influencerId)) return;

            const newRef = {
                influencerId: inf.id,
                status: 'Pending' as const,
                proposedBudget: 0,
                deliverables: 'To be defined',
                updatedAt: new Date().toISOString()
            };

            camp.influencers = [...(camp.influencers || []), newRef];
            this.save();
        }
    }

    removeInfluencerFromCampaign(campaignId: string, influencerId: string) {
        const camp = this.campaigns.find(c => c.id === campaignId);
        if (camp && camp.influencers) {
            camp.influencers = camp.influencers.filter(ref => ref.influencerId !== influencerId);
            this.save();
        }
    }

    updateInfluencerApproval(campaignId: string, influencerId: string, status: 'Approved' | 'Rejected', reason?: string) {
        const camp = this.campaigns.find(c => c.id === campaignId);
        if (camp) {
            const ref = camp.influencers?.find(i => i.influencerId === influencerId);
            if (ref) {
                ref.status = status;
                ref.updatedAt = new Date().toISOString();
                if (reason) ref.rejectionReason = reason;
                this.save();
            }
        }
    }

    private save() {
        if (typeof window !== 'undefined') {
            const state = {
                influencers: this.influencers,
                clients: this.clients,
                campaigns: this.campaigns
            };
            localStorage.setItem('apple_crm_state', JSON.stringify(state));
        }
    }
}

export const dataStore = new Store();
