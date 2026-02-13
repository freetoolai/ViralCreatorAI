'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { ArrowLeft, Save, AlertCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { Influencer, SocialProfile, PlatformName, Tier } from '@/lib/types';
import styles from '../../new/new-influencer.module.css';

export default function EditInfluencerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        shippingAddress: '',
        primaryNiche: 'Tech',
        secondaryNiches: [] as string[],
        tier: 'Micro' as Tier,
        internalNotes: ''
    });

    const [platforms, setPlatforms] = useState<SocialProfile[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Options
    const niches = ['Tech', 'Fashion', 'Gaming', 'Lifestyle', 'Beauty', 'Finance', 'Food', 'Travel', 'Fitness'];
    const tiers: Tier[] = ['Nano', 'Micro', 'Mid-Tier', 'Macro', 'Mega'];
    const platformOptions: PlatformName[] = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Twitch', 'Other'];

    useEffect(() => {
        const fetchInfluencer = async () => {
            try {
                const inf = await dataStore.getInfluencer(id);
                if (inf) {
                    setFormData({
                        name: inf.name,
                        email: inf.email,
                        phone: inf.phone || '',
                        shippingAddress: inf.shippingAddress || '',
                        primaryNiche: inf.primaryNiche,
                        secondaryNiches: inf.secondaryNiches || [],
                        tier: inf.tier,
                        internalNotes: inf.internalNotes || ''
                    });
                    setPlatforms(inf.platforms || []);
                } else {
                    setError('Influencer not found.');
                }
            } catch (err) {
                console.error("Failed to fetch influencer:", err);
                setError('Failed to load influencer data.');
            } finally {
                setIsFetching(false);
            }
        };
        fetchInfluencer();
    }, [id]);

    const handleAddPlatform = () => {
        const newPlatform: SocialProfile = {
            platform: 'Instagram',
            handle: '',
            link: '',
            followers: 0,
            engagementRate: 0
        };
        setPlatforms([...platforms, newPlatform]);
    };

    const handleRemovePlatform = (index: number) => {
        setPlatforms(platforms.filter((_, i) => i !== index));
    };

    const updatePlatform = <K extends keyof SocialProfile>(index: number, field: K, value: SocialProfile[K]) => {
        const updated = [...platforms];
        updated[index] = { ...updated[index], [field]: value };
        setPlatforms(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.name || !formData.email) {
            setError('Name and Email are required.');
            setIsLoading(false);
            return;
        }

        try {
            const updatedInfluencer: Partial<Influencer> = {
                ...formData,
                platforms: platforms
            };

            await dataStore.updateInfluencer(id, updatedInfluencer);
            router.push('/admin/influencers');
        } catch (error) {
            console.error("Failed to update influencer:", error);
            setError('Failed to update influencer.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className={clsx("container", styles.formContainer)}>
            <Link href="/admin/influencers" className={clsx("btn btn-outline", styles.backBtn)}>
                <ArrowLeft size={16} className={styles.iconMargin} /> Back to Influencers
            </Link>

            <div className={clsx("glass-panel", styles.formCard)}>
                <header className={styles.formHeader}>
                    <h1 className={styles.formTitle}>Edit Profile</h1>
                    <p className={styles.formSubtitle}>Update information for {formData.name}.</p>
                </header>

                {error && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Section 1: Basic Information */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.stepIcon}>1</span>
                            Basic Information
                        </h2>

                        <div className={styles.grid2}>
                            <div>
                                <label htmlFor="fullName" className={styles.label}>Full Name *</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    className="input"
                                    placeholder="e.g. Sarah Johnson"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="emailAddress" className={styles.label}>Email Address *</label>
                                <input
                                    id="emailAddress"
                                    type="email"
                                    className="input"
                                    placeholder="e.g. sarah@creators.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    className="input"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="shippingAddress" className={styles.label}>Shipping Address</label>
                                <input
                                    id="shippingAddress"
                                    type="text"
                                    className="input"
                                    placeholder="For gifting/deliveries"
                                    value={formData.shippingAddress}
                                    onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Profile & Classification */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.stepIcon}>2</span>
                            Profile & Classification
                        </h2>

                        <div className={styles.grid2}>
                            <div>
                                <label htmlFor="primaryNiche" className={styles.label}>Primary Niche</label>
                                <select
                                    id="primaryNiche"
                                    className="input"
                                    value={formData.primaryNiche}
                                    onChange={e => setFormData({ ...formData, primaryNiche: e.target.value })}
                                >
                                    {niches.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tier" className={styles.label}>Tier</label>
                                <select
                                    id="tier"
                                    className="input"
                                    value={formData.tier}
                                    onChange={e => setFormData({ ...formData, tier: e.target.value as Tier })}
                                >
                                    {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Social Profiles */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.stepIcon}>3</span>
                                Social Profiles
                            </h2>
                            <button
                                type="button"
                                className={clsx("btn btn-outline", styles.addBtn)}
                                onClick={handleAddPlatform}
                            >
                                <Plus size={14} className={styles.iconMargin} /> Add Platform
                            </button>
                        </div>

                        {platforms.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No platforms added yet. Add Instagram, YouTube, etc.</p>
                            </div>
                        ) : (
                            <div className={styles.gridAuto}>
                                {platforms.map((p, idx) => (
                                    <div key={idx} className={clsx("glass-panel", styles.platformItem)}>
                                        <div className={styles.platformGrid}>
                                            <div>
                                                <label htmlFor={`platform-${idx}`} className={styles.platformLabel}>Platform</label>
                                                <select
                                                    id={`platform-${idx}`}
                                                    className="input"
                                                    value={p.platform}
                                                    onChange={e => updatePlatform(idx, 'platform', e.target.value as PlatformName)}
                                                    aria-label="Platform"
                                                >
                                                    {platformOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor={`handle-${idx}`} className={styles.platformLabel}>Handle / URL</label>
                                                <input
                                                    id={`handle-${idx}`}
                                                    type="text"
                                                    className="input"
                                                    placeholder="@handle"
                                                    value={p.handle}
                                                    onChange={e => updatePlatform(idx, 'handle', e.target.value)}
                                                    aria-label="Social Media Handle or URL"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor={`followers-${idx}`} className={styles.platformLabel}>Followers</label>
                                                <input
                                                    id={`followers-${idx}`}
                                                    type="number"
                                                    className="input"
                                                    value={p.followers}
                                                    onChange={e => updatePlatform(idx, 'followers', parseInt(e.target.value) || 0)}
                                                    aria-label="Number of Followers"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor={`engagement-${idx}`} className={styles.platformLabel}>Engagement %</label>
                                                <input
                                                    id={`engagement-${idx}`}
                                                    type="number"
                                                    step="0.1"
                                                    className="input"
                                                    placeholder="e.g. 4.2"
                                                    value={p.engagementRate}
                                                    onChange={e => updatePlatform(idx, 'engagementRate', parseFloat(e.target.value) || 0)}
                                                    aria-label="Engagement Rate Percentage"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePlatform(idx)}
                                                className={styles.removeBtn}
                                                aria-label="Remove platform"
                                                title="Remove platform"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Section 4: Internal Notes */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.stepIcon}>4</span>
                            Internal Notes
                        </h2>
                        <label htmlFor="internalNotes" className="sr-only">Internal Notes</label>
                        <textarea
                            id="internalNotes"
                            className={clsx("input", styles.textarea)}
                            placeholder="Add private notes about this talent, past collaborations, or contact preferences..."
                            value={formData.internalNotes}
                            onChange={e => setFormData({ ...formData, internalNotes: e.target.value })}
                        />
                    </section>

                    <div className={styles.formFooter}>
                        <Link href="/admin/influencers" className={clsx("btn btn-secondary", styles.footerBtn)}>Cancel</Link>
                        <button type="submit" className={clsx("btn btn-primary", styles.primaryFooterBtn)} disabled={isLoading}>
                            <Save size={18} className={styles.iconMargin} />
                            {isLoading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
