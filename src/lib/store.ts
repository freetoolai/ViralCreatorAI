import { Influencer, Client, Campaign, User, CampaignInfluencerRef, CampaignGroup } from './types';

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
        typicalPayout: 5000,
        typicalCharge: 7500
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
        typicalPayout: 1500,
        typicalCharge: 2200
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
        ],
        typicalPayout: 300,
        typicalCharge: 500
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
                influencerFee: 5000,
                clientFee: 7500,
                deliverables: 'YouTube Integration',
                productAccess: true,
                plannedDate: '2026-02-15',
                updatedAt: new Date().toISOString()
            }
        ],
        createdAt: new Date().toISOString(),
        description: 'Launching our new SaaS product to the tech community.'
    },
];

const MOCK_GROUPS: CampaignGroup[] = [
    {
        id: 'grp1',
        title: 'Q1 Active Groups',
        description: 'Core campaigns for the first quarter.',
        campaignIds: ['camp1'],
        clientId: 'c1',
        createdAt: new Date().toISOString()
    }
];

class Store {
    private influencers: Influencer[] = MOCK_INFLUENCERS;
    private clients: Client[] = MOCK_CLIENTS;
    private campaigns: Campaign[] = MOCK_CAMPAIGNS;
    private users: User[] = MOCK_USERS;
    private groups: CampaignGroup[] = MOCK_GROUPS;

    constructor() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('apple_crm_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.influencers = parsed.influencers || MOCK_INFLUENCERS;
                this.clients = parsed.clients || MOCK_CLIENTS;
                this.campaigns = parsed.campaigns || MOCK_CAMPAIGNS;
                this.groups = parsed.groups || MOCK_GROUPS;
            }
        }
    }

    // Getters
    getInfluencers() { return this.influencers; }
    getClients() { return this.clients; }
    getUsers() { return this.users; }
    getGroups(clientId?: string) {
        if (clientId) return this.groups.filter(g => g.clientId === clientId);
        return this.groups;
    }

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
        this.influencers = [...infs, ...this.influencers];
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
        this.campaigns.forEach(camp => {
            if (camp.influencers) {
                camp.influencers = camp.influencers.filter(ref => ref.influencerId !== id);
            }
        });
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

    // --- CAMPAIGN ROSTER ACTIONS ---

    addInfluencerToCampaign(campaignId: string, influencerId: string) {
        const camp = this.campaigns.find(c => c.id === campaignId);
        const inf = this.influencers.find(i => i.id === influencerId);

        if (camp && inf) {
            if (camp.influencers?.some(ref => ref.influencerId === influencerId)) return;

            const newRef: CampaignInfluencerRef = {
                influencerId: inf.id,
                status: 'Shortlisted',
                influencerFee: inf.typicalPayout || 0,
                clientFee: inf.typicalCharge || 0,
                deliverables: 'To be defined',
                productAccess: false,
                updatedAt: new Date().toISOString()
            };

            camp.influencers = [...(camp.influencers || []), newRef];
            this.save();
        }
    }

    updateInfluencerInCampaign(campaignId: string, influencerId: string, updates: Partial<CampaignInfluencerRef>) {
        const camp = this.campaigns.find(c => c.id === campaignId);
        if (camp) {
            camp.influencers = camp.influencers.map(ref =>
                ref.influencerId === influencerId ? { ...ref, ...updates, updatedAt: new Date().toISOString() } : ref
            );
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

    // --- GROUP ACTIONS ---

    addGroup(group: CampaignGroup) {
        this.groups = [group, ...this.groups];
        this.save();
    }

    updateGroup(id: string, updates: Partial<CampaignGroup>) {
        this.groups = this.groups.map(g => g.id === id ? { ...g, ...updates } : g);
        this.save();
    }

    deleteGroup(id: string) {
        this.groups = this.groups.filter(g => g.id !== id);
        this.save();
    }

    // --- FINANCIAL SUMMARY ---

    getCampaignFinancials(campaignId: string) {
        const camp = this.getCampaign(campaignId);
        if (!camp || !camp.influencers) return { totalPayout: 0, totalRevenue: 0, totalProfit: 0 };

        return camp.influencers.reduce((acc, curr) => {
            const infFee = Number(curr.influencerFee) || 0;
            const cliFee = Number(curr.clientFee) || 0;
            return {
                totalPayout: acc.totalPayout + infFee,
                totalRevenue: acc.totalRevenue + cliFee,
                totalProfit: acc.totalProfit + (cliFee - infFee)
            };
        }, { totalPayout: 0, totalRevenue: 0, totalProfit: 0 });
    }

    private save() {
        if (typeof window !== 'undefined') {
            const state = {
                influencers: this.influencers,
                clients: this.clients,
                campaigns: this.campaigns,
                groups: this.groups
            };
            localStorage.setItem('apple_crm_state', JSON.stringify(state));
        }
    }
}

export const dataStore = new Store();
