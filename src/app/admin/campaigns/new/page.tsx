'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { Client, PlatformName } from '@/lib/types';
import styles from './new.module.css';

export default function NewCampaignPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [budget, setBudget] = useState('');
    const [platforms, setPlatforms] = useState<PlatformName[]>([]);
    const [niches, setNiches] = useState<string[]>([]); // simplified for demo logic

    useEffect(() => {
        setClients(dataStore.getClients());
    }, []);

    const handlePlatformToggle = (p: PlatformName) => {
        setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const newCampaign = {
            id: `camp-${Date.now()}`,
            clientId,
            title,
            status: 'Draft' as const,
            totalBudget: Number(budget),
            platformFocus: platforms,
            requiredNiches: niches,
            influencers: [],
            createdAt: new Date().toISOString()
        };

        // Use real store method
        dataStore.addCampaign(newCampaign);

        setTimeout(() => {
            router.push('/admin/campaigns');
        }, 800);
    };

    const availablePlatforms: PlatformName[] = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'Twitch'];

    return (
        <div className={styles.container}>
            <Link href="/admin/campaigns" className="btn btn-outline" style={{ border: 'none', paddingLeft: 0, color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Campaigns
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>Create New Campaign</h1>
                <p className={styles.subtitle}>Define the goals and budget for your next activation.</p>
            </header>

            <form onSubmit={handleSubmit} className={`glass-panel ${styles.formCard}`}>
                <div className={styles.sectionTitle}>Campaign Details</div>

                <div className={styles.row}>
                    <div className={styles.col}>
                        <label className={styles.label}>Campaign Title</label>
                        <input
                            required
                            type="text"
                            className="input"
                            placeholder="e.g. Summer Fashion Launch"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div className={styles.col}>
                        <label className={styles.label}>Client</label>
                        <select
                            required
                            className="input"
                            value={clientId}
                            onChange={e => setClientId(e.target.value)}
                        >
                            <option value="">Select a Client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.col}>
                        <label className={styles.label}>Total Budget ($)</label>
                        <input
                            required
                            type="number"
                            className="input"
                            placeholder="50000"
                            value={budget}
                            onChange={e => setBudget(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Platforms & Targeting</div>

                <div className={styles.col} style={{ marginBottom: '1.5rem' }}>
                    <label className={styles.label}>Target Platforms</label>
                    <div className={styles.checkboxGroup}>
                        {availablePlatforms.map(p => (
                            <div
                                key={p}
                                className={`${styles.checkboxLabel} ${platforms.includes(p) ? styles.checkboxActive : ''}`}
                                onClick={() => handlePlatformToggle(p)}
                            >
                                {p}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.col}>
                    <label className={styles.label}>Target Niches (Comma separated)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Tech, Gaming, Lifestyle..."
                        onChange={e => setNiches(e.target.value.split(',').map(s => s.trim()))}
                    />
                    <div className={styles.helper}>We will filter for influencers matching these tags.</div>
                </div>

                <div className={styles.actions}>
                    <Link href="/admin/campaigns" className="btn btn-secondary">Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : (
                            <>
                                <Save size={16} style={{ marginRight: '0.5rem' }} /> Create Draft
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
