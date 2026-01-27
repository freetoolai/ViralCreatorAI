'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, ExternalLink, Instagram, Youtube, Twitter, Twitch, MessageCircle, Globe } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { Campaign, PlatformName } from '@/lib/types';
import Link from 'next/link';
import styles from './campaign.module.css';

const PLATFORM_ICONS: Record<PlatformName, any> = {
    YouTube: Youtube,
    Instagram: Instagram,
    TikTok: MessageCircle,
    Twitter: Twitter,
    Twitch: Twitch,
    Other: Globe
};

export default function CampaignDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [influencers, setInfluencers] = useState<any[]>([]);
    const [approvals, setApprovals] = useState<Record<string, 'Approved' | 'Rejected' | 'Pending'>>({});

    useEffect(() => {
        // 1. Get Campaign
        const allCampaigns = dataStore.getCampaigns();
        const foundCamp = allCampaigns.find(c => c.id === id);

        if (foundCamp) {
            setCampaign(foundCamp);

            // 2. Get Influencers & Merge Status from Campaign Refs
            const allInfluencers = dataStore.getInfluencers();
            const campaignInfluencers = (foundCamp.influencers || []).map(ref => {
                const details = allInfluencers.find(i => i.id === ref.influencerId);
                return { ...details, ...ref }; // Merge details with ref (status, budget)
            }).filter(i => i.id); // Filter out missing

            setInfluencers(campaignInfluencers);

            // 3. Initialize Approvals Map
            const initialStatus: Record<string, any> = {};
            foundCamp.influencers?.forEach(ref => {
                if (ref.influencerId) initialStatus[ref.influencerId] = ref.status;
            });
            setApprovals(initialStatus);
        }
    }, [id]);

    const handleDecision = (influencerId: string, status: 'Approved' | 'Rejected') => {
        const now = new Date().toISOString();
        setApprovals(prev => ({ ...prev, [influencerId]: status }));

        // Update local influencers list to show the date immediately
        setInfluencers(prev => prev.map(inf =>
            inf.id === influencerId ? { ...inf, status, updatedAt: now } : inf
        ));

        dataStore.updateInfluencerApproval(id, influencerId, status);
    };

    if (!campaign) return <div className="container">Loading...</div>;

    return (
        <div className={styles.container}>
            <Link href="/portal/dashboard" className={styles.backLink}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </Link>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{campaign.title}</h1>
                    <p className={styles.subtitle}>
                        Review and approve creators for this campaign.
                    </p>
                </div>
                <div>
                    <div className={styles.budgetLabel}>TOTAL BUDGET</div>
                    <div className={styles.budgetValue}>${campaign.totalBudget?.toLocaleString()}</div>
                </div>
            </header>

            <div className={styles.grid}>
                {influencers.map(inf => {
                    const status = approvals[inf.id];
                    const isApproved = status === 'Approved';
                    const isRejected = status === 'Rejected';

                    let cardClass = `glass-panel ${styles.card}`;
                    if (isApproved) cardClass += ` ${styles.cardApproved}`;
                    if (isRejected) cardClass += ` ${styles.cardRejected}`;

                    return (
                        <div key={inf.id} className={cardClass}>
                            <div className={styles.banner}>
                                <div className={styles.avatarWrapper}>
                                    <div className={styles.avatar}>
                                        {inf.name?.[0]}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.content}>
                                <div className={styles.profileHeader}>
                                    <div>
                                        <h3 className={styles.name}>{inf.name}</h3>
                                        <div className={styles.tier}>{inf.tier} Influencer</div>
                                    </div>
                                    <div className={styles.socials}>
                                        {inf.platforms?.map((s: any) => {
                                            const Icon = PLATFORM_ICONS[s.platform as PlatformName] || ExternalLink;
                                            return (
                                                <a
                                                    key={s.platform}
                                                    href={s.link}
                                                    target="_blank"
                                                    className={`btn btn-outline ${styles.socialBtn}`}
                                                    title={s.platform}
                                                >
                                                    <Icon size={14} />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.tags}>
                                    {inf.secondaryNiches?.map((n: string) => (
                                        <span key={n} className={styles.tag}>{n}</span>
                                    ))}
                                </div>

                                <div className={styles.rateRow}>
                                    <span className={styles.rateLabel}>Proposed Fee</span>
                                    <span className={styles.rateValue}>${(inf.proposedBudget || inf.price || 0).toLocaleString()}</span>
                                </div>

                                {inf.updatedAt && (
                                    <div className={styles.decisionDate}>
                                        Decision on {new Date(inf.updatedAt).toLocaleDateString()}
                                    </div>
                                )}

                                <div className={styles.actions}>
                                    {isApproved ? (
                                        <div className={styles.approvedBanner}>
                                            <Check size={18} /> Approved
                                        </div>
                                    ) : isRejected ? (
                                        <div className={styles.rejectedBanner}>
                                            Rejected
                                        </div>
                                    ) : (
                                        <>
                                            <button className={`btn btn-outline ${styles.rejectBtn}`} onClick={() => handleDecision(inf.id, 'Rejected')}>
                                                <X size={18} style={{ marginRight: '0.5rem' }} /> Reject
                                            </button>
                                            <button className="btn btn-primary" onClick={() => handleDecision(inf.id, 'Approved')}>
                                                <Check size={18} style={{ marginRight: '0.5rem' }} /> Approve
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
