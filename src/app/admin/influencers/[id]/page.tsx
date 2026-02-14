'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { ArrowLeft, Mail, MapPin, Edit, FileText, Smartphone } from 'lucide-react';
import { Influencer } from '@/lib/types';
import { useToast } from '@/components/ToastContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import { AIAssistant } from '@/components/admin/AIAssistant';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import styles from './detail.module.css';

export default function InfluencerDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { showToast } = useToast();
    const [influencer, setInfluencer] = useState<Influencer | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // We use the store directly so that if we are in Mock Mode (using localStorage),
                // the data is retrieved from the browser's storage instead of the server (which is empty).
                const data = await import('@/lib/store').then(mod => mod.dataStore.getInfluencer(id));
                if (data) {
                    setInfluencer(data);
                } else {
                    console.error("Influencer not found");
                }
            } catch (err) {
                console.error("Error fetching influencer:", err);
                showToast("Failed to load influencer details", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, showToast]);

    if (loading) return <div className={styles.container}>Loading talent details...</div>;
    if (!influencer) return <div className={styles.container}>Influencer not found</div>;

    const handleDeleteConfirm = async () => {
        try {
            const res = await fetch(`/api/influencers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast(`${influencer.name} has been deleted`);
                router.push('/admin/influencers');
            } else {
                showToast('Failed to delete influencer', 'error');
            }
        } catch (err) {
            console.error("Delete failed:", err);
            showToast("An error occurred while deleting", "error");
        } finally {
            setShowDeleteModal(false);
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/admin/influencers" className={clsx("btn btn-outline", styles.backBtn)}>
                <ArrowLeft size={16} /> Back
            </Link>

            <div className={styles.header}>
                <div className={styles.profileInfo}>
                    <div className={styles.avatar}>{influencer.name ? influencer.name[0] : '?'}</div>
                    <div>
                        <h1 className={styles.name}>{influencer.name}</h1>
                        <div className={styles.meta}>
                            <span className="badge-editorial">{influencer.tier || 'Micro'}</span>
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

                <div className={styles.headerActions}>
                    <button onClick={() => setShowDeleteModal(true)} className={clsx("btn btn-outline", styles.deleteBtn)}>
                        Delete Profile
                    </button>
                    <Link href={`/admin/influencers/${id}/edit`} className="btn btn-primary">
                        <Edit size={16} /> Edit Profile
                    </Link>
                </div>
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
                            dataKey="rate"
                            data={[
                                { name: 'Week 1', rate: (influencer.platforms[0]?.engagementRate || 0) * 0.8 },
                                { name: 'Week 2', rate: (influencer.platforms[0]?.engagementRate || 0) * 0.9 },
                                { name: 'Week 3', rate: (influencer.platforms[0]?.engagementRate || 0) * 0.85 },
                                { name: 'Week 4', rate: (influencer.platforms[0]?.engagementRate || 0) },
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
                        metrics={`${((influencer.platforms?.[0]?.followers || 0) / 1000).toFixed(1)}k followers`}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Influencer"
                message={`Are you sure you want to delete ${influencer.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
}
