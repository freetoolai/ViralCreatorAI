'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { ArrowLeft, Mail, MapPin, Edit, FileText, Smartphone } from 'lucide-react';
import { Influencer } from '@/lib/types';
import { AIAssistant } from '@/components/admin/AIAssistant';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import styles from './detail.module.css';

export default function InfluencerDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [influencer, setInfluencer] = useState<Influencer | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/influencers/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setInfluencer(data);
                }
            } catch {
                // Error fetching influencer - handle silently or use error tracking service
            }
        };
        fetchData();
    }, [id]);

    if (!influencer) return <div className="container">Loading...</div>;

    return (
        <div className={styles.container}>
            <Link href="/admin/influencers" className={clsx("btn btn-outline", styles.backBtn)}>
                <ArrowLeft size={16} /> Back
            </Link>

            <div className={styles.header}>
                <div className={styles.profileInfo}>
                    <div className={styles.avatar}>{influencer.name[0]}</div>
                    <div>
                        <h1 className={styles.name}>{influencer.name}</h1>
                        <div className={styles.meta}>
                            <span className="badge-editorial">{influencer.tier}</span>
                            <span className={styles.mutedText}>•</span>
                            <span>{influencer.primaryNiche}</span>
                            {influencer.secondaryNiches && influencer.secondaryNiches.length > 0 && (
                                <>
                                    <span className={styles.mutedText}>•</span>
                                    <span className={styles.mutedText}>{influencer.secondaryNiches.join(', ')}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Link href={`/admin/influencers/${id}/edit`} className="btn btn-primary">
                    <Edit size={16} /> Edit Profile
                </Link>
            </div>

            <div className={styles.grid}>
                <div>
                    <h2 className={styles.sectionTitle}><Smartphone size={18} /> Social Platforms</h2>
                    {influencer.platforms.map((p, i) => (
                        <div key={i} className={styles.platformCard}>
                            <div className={styles.platformHeader}>
                                <div className={styles.platformName}>
                                    {p.platform} <span className={styles.mutedText}>{p.handle}</span>
                                </div>
                                <a href={p.link} target="_blank" className={clsx("btn btn-outline", styles.viewBtn)}>View</a>
                            </div>
                            <div className={styles.statGrid}>
                                <div className={styles.stat}>
                                    <div className={styles.statLabel}>Followers</div>
                                    <div className={styles.statValue}>{p.followers.toLocaleString()}</div>
                                </div>
                                {p.avgViews && (
                                    <div className={styles.stat}>
                                        <div className={styles.statLabel}>Avg Views</div>
                                        <div className={styles.statValue}>{p.avgViews.toLocaleString()}</div>
                                    </div>
                                )}
                                {p.engagementRate && (
                                    <div className={styles.stat}>
                                        <div className={styles.statLabel}>Engagement</div>
                                        <div className={styles.statValue}>{p.engagementRate}%</div>
                                    </div>
                                )}
                                {p.price && (
                                    <div className={styles.stat}>
                                        <div className={styles.statLabel}>Est. Price</div>
                                        <div className={styles.statValue}>${p.price.toLocaleString()}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className={styles.chartContainer}>
                        <AnalyticsChart
                            title="Engagement Trend"
                            dataKey="率"
                            data={[
                                { name: 'Week 1', 率: (influencer.platforms[0]?.engagementRate || 0) * 0.8 },
                                { name: 'Week 2', 率: (influencer.platforms[0]?.engagementRate || 0) * 0.9 },
                                { name: 'Week 3', 率: (influencer.platforms[0]?.engagementRate || 0) * 0.85 },
                                { name: 'Week 4', 率: (influencer.platforms[0]?.engagementRate || 0) },
                            ]}
                            color="#E11D48"
                        />
                    </div>
                </div>

                <div>
                    <div className={`glass-panel ${styles.card}`}>
                        <h2 className={styles.sectionTitle}><FileText size={18} /> Contact & Info</h2>

                        <div className={styles.fieldGroup}>
                            <div className={styles.label}>Email</div>
                            <div className={clsx(styles.value, styles.flexRowGap)}>
                                <Mail size={14} /> {influencer.email}
                            </div>
                        </div>

                        {influencer.phone && (
                            <div className={styles.fieldGroup}>
                                <div className={styles.label}>Phone</div>
                                <div className={styles.value}>{influencer.phone}</div>
                            </div>
                        )}

                        <div className={styles.fieldGroup}>
                            <div className={styles.label}>Shipping Address</div>
                            <div className={clsx(styles.value, styles.flexStartGap)}>
                                <MapPin size={14} className={styles.marginT2} />
                                {influencer.shippingAddress || 'No address provided'}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <div className={styles.label}>Internal Notes</div>
                            <p className={styles.notesText}>
                                {influencer.internalNotes || 'No notes available.'}
                            </p>
                        </div>
                    </div>

                    <AIAssistant
                        influencerName={influencer.name}
                        niche={influencer.primaryNiche}
                        metrics={`${(influencer.platforms[0]?.followers / 1000).toFixed(1)}k followers`}
                    />
                </div>
            </div>
        </div>
    );
}
