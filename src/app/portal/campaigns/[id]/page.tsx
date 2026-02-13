'use client';

import { use, useState, useEffect } from 'react';
import { ArrowLeft, Check, X, ExternalLink, Instagram, Youtube, Twitter, Twitch, MessageCircle, Globe, LucideIcon } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { PlatformName, Influencer, CampaignInfluencerRef, Campaign } from '@/lib/types';
import Link from 'next/link';
import styles from './campaign.module.css';

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

    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, [id]);

    const handleDecision = async (influencerId: string, status: 'Approved' | 'Rejected') => {
        if (!campaign) return;

        const now = new Date().toISOString();

        try {
            // Update Store
            await dataStore.updateInfluencerInCampaign(id, influencerId, { status });

            // Update local state to trigger re-render
            const updatedInfluencers = (campaign.influencers || []).map((ref: CampaignInfluencerRef) => {
                if (ref.influencerId === influencerId) {
                    return { ...ref, status, updatedAt: now };
                }
                return ref;
            });

            setCampaign({ ...campaign, influencers: updatedInfluencers });

            // Update the combined roster state
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
                <div>
                    <div className={styles.budgetLabel}>TOTAL BUDGET</div>
                    <div className={styles.budgetValue}>${(Number(campaign.totalBudget) || 0).toLocaleString()}</div>
                </div>
            </header>

            <div className={styles.grid}>
                {influencers.map(inf => {
                    const status = inf.status;
                    const isApproved = status === 'Approved';
                    const isRejected = status === 'Rejected';

                    let cardClass = `${styles.card} glass-panel`;
                    if (isApproved) cardClass += ` ${styles.cardApproved}`;
                    if (isRejected) cardClass += ` ${styles.cardRejected}`;

                    return (
                        <div key={inf.id} className={cardClass}>
                            <div className={styles.profileHeader}>
                                <div className={styles.profileInfo}>
                                    <h3 className={styles.name}>{inf.name}</h3>
                                    <div className={styles.tier}>{inf.tier} Influencer</div>
                                </div>
                                <div className={styles.socials}>
                                    {inf.platforms?.map((s) => {
                                        const Icon = PLATFORM_ICONS[s.platform] || ExternalLink;
                                        return (
                                            <a
                                                key={s.platform}
                                                href={s.link}
                                                target="_blank"
                                                className={`btn btn-outline ${styles.socialBtn}`}
                                                title={s.platform}
                                            >
                                                <Icon size={16} />
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
                                <span className={styles.rateValue}>${(Number(inf.clientFee) || 0).toLocaleString()}</span>
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
                                            <X size={18} /> Reject
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleDecision(inf.id, 'Approved')}>
                                            <Check size={18} /> Approve
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
