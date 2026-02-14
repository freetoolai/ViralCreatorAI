'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Client, Campaign, CampaignGroup } from '@/lib/types';
import { useToast } from '@/components/ToastContext';
import styles from './new-group.module.css';
import clsx from 'clsx';

export default function NewGroupPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        clientId: ''
    });
    const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use dataStore directly for mock mode support
                const mod = await import('@/lib/store');
                const [c, camp] = await Promise.all([
                    mod.dataStore.getClients(),
                    mod.dataStore.getCampaigns()
                ]);
                setClients(c);
                setCampaigns(camp);
            } catch (error) {
                console.error("Failed to load data for new group:", error);
                showToast("Failed to load clients and campaigns", "error");
            }
        };
        fetchData();
    }, [showToast]);

    const filteredCampaigns = campaigns.filter(c =>
        !form.clientId || c.clientId === form.clientId
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const mod = await import('@/lib/store');

            if (!form.clientId || selectedCampaigns.size === 0) {
                showToast('Please select a client and at least one campaign.', 'error');
                return;
            }

            // We need to construct the full CampaignGroup object as required by addGroup
            // Note: addGroup in store expects CampaignGroup, but the internal mapping handles IDs.
            // The usage here was passing a plain object, which matches the shape roughly.
            // Let's ensure it matches the full type.

            const newGroup: CampaignGroup = {
                id: `grp_${Date.now()}`,
                title: form.title,
                description: form.description,
                clientId: form.clientId,
                campaignIds: Array.from(selectedCampaigns),
                createdAt: new Date().toISOString()
            };

            await mod.dataStore.addGroup(newGroup);
            showToast("Campaign group created successfully");
            router.push('/admin/groups');
        } catch (error) {
            console.error("Failed to create group:", error);
            showToast("Failed to create group", "error");
        }
    };

    const toggleCampaign = (id: string) => {
        const newSet = new Set(selectedCampaigns);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedCampaigns(newSet);
    };

    return (
        <div className={styles.container}>
            <Link href="/admin/groups" className={styles.backLinkWrap}>
                <ArrowLeft size={16} className={styles.iconMarginRight} /> Back to Groups
            </Link>

            <h1 className={styles.title}>Create New Campaign Group</h1>
            <p className={styles.subtitle}>Combine multiple campaigns into one client view.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.section}>
                    <label className={styles.label}>Group Title</label>
                    <input
                        required
                        className="input"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Q1 Marketing Initiatives"
                    />
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>Description (Optional)</label>
                    <textarea
                        className="input"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Internal notes or client message..."
                        rows={3}
                    />
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>Select Client</label>
                    <select
                        required
                        className="input"
                        value={form.clientId}
                        title="Select Client"
                        onChange={e => {
                            setForm({ ...form, clientId: e.target.value });
                            setSelectedCampaigns(new Set()); // Reset on client change
                        }}
                    >
                        <option value="">-- Choose Client --</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.companyName} ({c.name})</option>
                        ))}
                    </select>
                </div>

                {form.clientId && (
                    <div className={styles.section}>
                        <label className={styles.label}>Select Campaigns</label>
                        <div className={styles.campaignList}>
                            {filteredCampaigns.map(camp => (
                                <div
                                    key={camp.id}
                                    className={clsx(styles.campaignItem, selectedCampaigns.has(camp.id) && styles.selected)}
                                    onClick={() => toggleCampaign(camp.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCampaigns.has(camp.id)}
                                        readOnly
                                        className={styles.checkbox}
                                        aria-label={`Select campaign ${camp.title}`}
                                        title={`Select ${camp.title}`}
                                    />
                                    <div>
                                        <div className={styles.campTitle}>{camp.title}</div>
                                        <div className={styles.campMeta}>{camp.status} • {camp.influencers.length} Creators</div>
                                    </div>
                                </div>
                            ))}
                            {filteredCampaigns.length === 0 && (
                                <div className={styles.emptyState}>No campaigns found for this client.</div>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button type="submit" className="btn btn-primary">
                        <Save size={16} className={styles.iconMarginRight} /> Create Group
                    </button>
                </div>
            </form>
        </div>
    );
}
