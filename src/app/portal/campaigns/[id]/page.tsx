'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, ExternalLink, Instagram, Youtube, Twitter, Twitch, MessageCircle, Globe, LucideIcon, Eye } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { PlatformName, Influencer, CampaignInfluencerRef, Campaign } from '@/lib/types';
import Link from 'next/link';
import styles from './campaign.module.css';
import clsx from 'clsx';

const PLATFORM_ICONS: Record<PlatformName, LucideIcon> = {
    YouTube: Youtube,
    Instagram: Instagram,
    TikTok: MessageCircle,
    Twitter: Twitter,
    Twitch: Twitch,
    Other: Globe
};

type PortalInfluencer = Influencer & CampaignInfluencerRef;

export default function CampaignDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [hasMounted, setHasMounted] = useState(false);
    const [influencers, setInfluencers] = useState<PortalInfluencer[]>([]);
    const [selectedInfluencer, setSelectedInfluencer] = useState<PortalInfluencer | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const found = await dataStore.getCampaign(id);
            setCampaign(found ? { ...found } : null);

            if (found) {
                const allInfs = await dataStore.getInfluencers();
                const roster = (found.influencers || []).map((ref: CampaignInfluencerRef) => {
                    const details = allInfs.find(i => i.id === ref.influencerId);
                    if (!details) return null;
                    return { ...details, ...ref } as PortalInfluencer;
                }).filter((i): i is PortalInfluencer => i !== null);
                setInfluencers(roster);
            }
        } catch (error) {
            console.error("Failed to fetch portal campaign data:", error);
        } finally {
            setHasMounted(true);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDecision = async (influencerId: string, status: 'Approved' | 'Rejected') => {
        if (!campaign) return;

        const now = new Date().toISOString();

        try {
            await dataStore.updateInfluencerInCampaign(id, influencerId, { status });

            const updatedInfluencers = (campaign.influencers || []).map((ref: CampaignInfluencerRef) => {
                if (ref.influencerId === influencerId) {
                    return { ...ref, status, updatedAt: now };
                }
                return ref;
            });

            setCampaign({ ...campaign, influencers: updatedInfluencers });
            setInfluencers(prev => prev.map(inf =>
                inf.id === influencerId ? { ...inf, status, updatedAt: now } : inf
            ));
        } catch (error) {
            console.error("Failed to update decision:", error);
        }
    };

    if (!hasMounted || !campaign) return <div className="container">Loading...</div>;

    return (
        <div className={styles.container}>
            <Link href="/portal/dashboard" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{campaign.title}</h1>
                    <p className={styles.subtitle}>
                        Review and approve creators for this campaign.
                    </p>
                </div>
                <div className={styles.headerStats}>
                    <div className={styles.budgetLabel}>CAMPAIGN BUDGET</div>
                    <div className={styles.budgetValue}>${(Number(campaign.totalBudget) || 0).toLocaleString()}</div>
                </div>
            </header>

            <div className={styles.grid}>
                {influencers.map(inf => {
                    const status = inf.status;
                    const isApproved = status === 'Approved';
                    const isRejected = status === 'Rejected';

                    return (
                        <div key={inf.id} className={clsx(styles.card, isApproved && styles.cardApproved, isRejected && styles.cardRejected)}>
                            <div className={styles.profileHeader}>
                                <div className={styles.profileInfo}>
                                    <h3 className={styles.influencerName}>{inf.name}</h3>
                                    <div className={styles.influencerHandle}>
                                        {inf.platforms?.[0]?.handle || '@talent'}
                                    </div>
                                </div>
                                <div className={clsx(styles.statusBadge,
                                    status === 'Approved' ? styles.statusApproved :
                                        status === 'Rejected' ? styles.statusRejected : styles.statusPending
                                )}>
                                    {status}
                                </div>
                            </div>

                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <div className={styles.statLabel}>Followers</div>
                                    <div className={styles.statValue}>
                                        {(inf.platforms?.reduce((acc, p) => acc + (p.followers || 0), 0) / 1000).toFixed(1)}k
                                    </div>
                                </div>
                                <div className={styles.stat}>
                                    <div className={styles.statLabel}>Tier</div>
                                    <div className={styles.statValue}>{inf.tier}</div>
                                </div>
                                <div className={styles.stat}>
                                    <div className={styles.statLabel}>Proposed Fee</div>
                                    <div className={styles.statValue}>${(Number(inf.clientFee) || 0).toLocaleString()}</div>
                                </div>
                            </div>

                            <button
                                className={clsx("btn btn-outline", styles.viewDetailsBtn)}
                                onClick={() => setSelectedInfluencer(inf)}
                                title={`View details for ${inf.name}`}
                            >
                                <Eye size={16} className={styles.btnIcon} /> View Full Profile
                            </button>

                            {inf.updatedAt && (
                                <div className={styles.decisionDate}>
                                    Decision made on {new Date(inf.updatedAt).toLocaleDateString()}
                                </div>
                            )}

                            <div className={styles.actions}>
                                {isApproved ? (
                                    <div className={styles.approvedBanner}>
                                        <Check size={18} /> Ready for Deployment
                                    </div>
                                ) : isRejected ? (
                                    <div className={styles.rejectedBanner}>
                                        <X size={18} /> Talent Rejected
                                    </div>
                                ) : (
                                    <>
                                        <button className={clsx("btn", styles.rejectBtn)} onClick={() => handleDecision(inf.id, 'Rejected')} title="Reject talent">
                                            <X size={18} /> Reject
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleDecision(inf.id, 'Approved')} title="Approve talent">
                                            <Check size={18} /> Approve Talent
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Influencer Detail Modal */}
            {selectedInfluencer && (
                <div className={styles.modalOverlay} onClick={() => setSelectedInfluencer(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{selectedInfluencer.name}</h2>
                            <button className={styles.closeButton} onClick={() => setSelectedInfluencer(null)} aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Niche</span>
                                    <span className={styles.detailValue}>{selectedInfluencer.primaryNiche}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Tier</span>
                                    <span className={styles.detailValue}>{selectedInfluencer.tier}</span>
                                </div>
                            </div>

                            <div className={styles.influencerBio}>
                                <p>Specialized in <strong>{selectedInfluencer.secondaryNiches.join(', ')}</strong> content. This creator has been vetted for high-quality production and consistent brand alignment.</p>
                            </div>

                            <h4 className={styles.detailLabel}>Platform Breakdown</h4>
                            <div className={styles.platformsGrid}>
                                {selectedInfluencer.platforms.map((p, i) => {
                                    const Icon = PLATFORM_ICONS[p.platform] || Globe;
                                    return (
                                        <div key={i} className={styles.platformDetail}>
                                            <div className={styles.platformInfo}>
                                                <Icon size={20} className={styles.accentIcon} />
                                                <div>
                                                    <div className={styles.detailValue}>{p.platform}</div>
                                                    <div className={styles.metricLabelSub}>{p.handle}</div>
                                                </div>
                                            </div>
                                            <div className={styles.platformMetrics}>
                                                <span className={styles.metricValueMain}>{(p.followers / 1000).toFixed(1)}k</span>
                                                <span className={styles.metricLabelSub}>Followers</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.socialRow}>
                                {selectedInfluencer.platforms.map((s, i) => (
                                    <a
                                        key={i}
                                        href={s.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={clsx("btn btn-outline", styles.socialLink)}
                                    >
                                        Visit {s.platform} <ExternalLink size={12} className={styles.btnIconSmall} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className={styles.modalFooterDetail}>
                            <button className="btn btn-primary" onClick={() => setSelectedInfluencer(null)}>
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
