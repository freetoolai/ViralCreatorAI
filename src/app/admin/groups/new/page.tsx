'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Client, Campaign } from '@/lib/types';
import { dataStore } from '@/lib/store';
import styles from './new-group.module.css';
import clsx from 'clsx';

export default function NewGroupPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        clientId: ''
    });
    const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());

    useEffect(() => {
        Promise.resolve().then(() => {
            setClients(dataStore.getClients());
            setCampaigns(dataStore.getCampaigns());
        });
    }, []);

    const filteredCampaigns = campaigns.filter(c =>
        !form.clientId || c.clientId === form.clientId
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.clientId || selectedCampaigns.size === 0) {
            alert('Please select a client and at least one campaign.');
            return;
        }

        const newGroup = {
            id: `grp_${Date.now()}`,
            title: form.title,
            description: form.description,
            clientId: form.clientId,
            campaignIds: Array.from(selectedCampaigns),
            createdAt: new Date().toISOString()
        };

        dataStore.addGroup(newGroup);
        router.push('/admin/groups');
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
