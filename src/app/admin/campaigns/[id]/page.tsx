'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar, Plus, X, Search } from 'lucide-react';
import { Campaign, Influencer } from '@/lib/types';
import styles from './detail.module.css';
import clsx from 'clsx';

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

    return (
        <div className={styles.container}>
            <Link href="/admin/campaigns" className={styles.backLinkWrap}>
                <ArrowLeft size={16} className={styles.iconMarginRight} /> Back to Campaigns
            </Link>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{campaign.title}</h1>
                    <div className={styles.meta}>
                        <div className={styles.metaItem}><Users size={16} /> Client ID: {campaign.clientId}</div>
                        <div className={styles.metaItem}><Calendar size={16} /> Created: {new Date(campaign.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
                <div className={styles.headerActions}>
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
                    <Plus size={16} className={styles.iconMarginRight} /> Add Creators
                </button>
            </div>

            {campaignInfluencers.length > 0 ? (
                <div className={styles.influencerGrid}>
                    {campaignInfluencers.map((item, idx) => (
                        <div key={idx} className={clsx("glass-panel", styles.card)}>
                            <span className={clsx(styles.statusTag, item.status === 'Approved' ? styles.statusApproved : item.status === 'Rejected' ? styles.statusRejected : '')}>
                                {item.status}
                            </span>

                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>{item.details?.name[0]}</div>
                                <div>
                                    <div className={styles.cardName}>{item.details?.name || 'Unknown'}</div>
                                    <div className={styles.cardTier}>{item.details?.tier} • {item.details?.primaryNiche}</div>
                                </div>
                            </div>

                            <div className={styles.deliverablesText}>
                                <strong>Deliverables:</strong> {item.deliverables}
                            </div>
                            <div className={styles.cardFooter}>
                                <div>
                                    <strong className={styles.mutedLabel}>Budget:</strong> ${item.proposedBudget}
                                </div>
                                {item.updatedAt && (
                                    <div className={styles.mutedLabel}>
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
                    <button className={clsx("btn btn-primary", styles.mt1)} onClick={() => setIsModalOpen(true)}>Add Creators</button>
                </div>
            )}

            {/* Add Influencer Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={clsx("glass-panel", styles.modalContent)}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Add Creators to Campaign</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={styles.closeButton}
                                aria-label="Close modal"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.searchWrapper}>
                                <Search size={16} className={styles.modalSearchIcon} />
                                <input
                                    type="text"
                                    className={clsx("input", styles.modalSearchInput)}
                                    placeholder="Search available influencers..."
                                    aria-label="Search influencers"
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                />
                            </div>

                            {filteredModalInfluencers.map(inf => (
                                <div key={inf.id} className={styles.influencerRow} onClick={() => toggleSelect(inf.id)}>
                                    <div className={styles.influencerInfoFix}>
                                        <div className={styles.avatarSmall}>
                                            {inf.name[0]}
                                        </div>
                                        <div>
                                            <div className={styles.influencerName}>{inf.name}</div>
                                            <div className={styles.influencerMeta}>{inf.primaryNiche} • {inf.tier}</div>
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
                                <div className={styles.emptyModalText}>
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
