'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar, Plus, X, Search } from 'lucide-react';
import { Campaign, Influencer } from '@/lib/types';
import styles from './detail.module.css';

export default function CampaignAdminDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [allInfluencers, setAllInfluencers] = useState<Influencer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedForAdd, setSelectedForAdd] = useState<Set<string>>(new Set());

    // Hydrate
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campRes, infRes] = await Promise.all([
                    fetch(`/api/campaigns/${id}`),
                    fetch('/api/influencers')
                ]);

                if (campRes.ok) {
                    const campData = await campRes.json();
                    setCampaign(campData);
                }

                const infData = await infRes.json();
                setAllInfluencers(infData);
            } catch (error) {
                console.error('Failed to fetch campaign details:', error);
            }
        };
        fetchData();
    }, [id]);

    const handleAddInfluencers = async () => {
        if (!campaign) return;

        // Note: For now we'll simulate adding, in Phase 15 we'd have a POST to /api/campaigns/[id]/influencers
        alert('Influencer addition will be fully integrated with the DB in the next step.');
        setIsModalOpen(false);
        setSelectedForAdd(new Set());
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedForAdd);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedForAdd(newSet);
    };

    const [modalSearch, setModalSearch] = useState('');

    if (!campaign) return <div className="container">Loading...</div>;

    // Resolve Influencer Details (Safely after null check)
    const campaignInfluencers = campaign.influencers?.map(ref => {
        const details = allInfluencers.find(i => i.id === ref.influencerId);
        return { ...ref, details };
    }) || [];

    const availableInfluencers = allInfluencers.filter(inf =>
        !campaign.influencers?.some(existing => existing.influencerId === inf.id)
    );

    const filteredModalInfluencers = availableInfluencers.filter(inf =>
        inf.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        inf.primaryNiche.toLowerCase().includes(modalSearch.toLowerCase())
    );

    if (!campaign) return <div className="container">Loading...</div>;

    return (
        <div className={styles.container}>
            <Link href="/admin/campaigns" className={styles.backLink} style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Campaigns
            </Link>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{campaign.title}</h1>
                    <div className={styles.meta}>
                        <div className={styles.metaItem}><Users size={16} /> Client ID: {campaign.clientId}</div>
                        <div className={styles.metaItem}><Calendar size={16} /> Created: {new Date(campaign.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Budget</div>
                        <div className={styles.statValue}>${campaign.totalBudget.toLocaleString()}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Spent (Est)</div>
                        <div className={styles.statValue}>$0</div>
                    </div>
                </div>
            </header>

            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Campaign Roster ({campaignInfluencers.length})</h2>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Creators
                </button>
            </div>

            {campaignInfluencers.length > 0 ? (
                <div className={styles.influencerGrid}>
                    {campaignInfluencers.map((item, idx) => (
                        <div key={idx} className={`glass-panel ${styles.card}`}>
                            <span className={`${styles.statusTag} ${item.status === 'Approved' ? styles.statusApproved : item.status === 'Rejected' ? styles.statusRejected : ''}`}>
                                {item.status}
                            </span>

                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>{item.details?.name[0]}</div>
                                <div>
                                    <div className={styles.cardName}>{item.details?.name || 'Unknown'}</div>
                                    <div className={styles.cardTier}>{item.details?.tier} • {item.details?.primaryNiche}</div>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <strong>Deliverables:</strong> {item.deliverables}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                <div>
                                    <strong style={{ color: 'hsl(var(--muted-foreground))' }}>Budget:</strong> ${item.proposedBudget}
                                </div>
                                {item.updatedAt && (
                                    <div style={{ color: 'hsl(var(--muted-foreground))' }}>
                                        Updated: {new Date(item.updatedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>No influencers added to this campaign yet.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsModalOpen(true)}>Add Creators</button>
                </div>
            )}

            {/* Add Influencer Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`glass-panel ${styles.modalContent}`}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Add Creators to Campaign</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                aria-label="Close modal"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div style={{ marginBottom: '1rem', position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search available influencers..."
                                    style={{ paddingLeft: '2.2rem' }}
                                    aria-label="Search influencers"
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                />
                            </div>

                            {filteredModalInfluencers.map(inf => (
                                <div key={inf.id} className={styles.influencerRow} onClick={() => toggleSelect(inf.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {inf.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{inf.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{inf.primaryNiche} • {inf.tier}</div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={selectedForAdd.has(inf.id)}
                                        readOnly
                                        aria-label={`Select ${inf.name}`}
                                    />
                                </div>
                            ))}

                            {availableInfluencers.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                                    All influencers are already in this campaign.
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddInfluencers} disabled={selectedForAdd.size === 0}>
                                Add {selectedForAdd.size} Creators
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
