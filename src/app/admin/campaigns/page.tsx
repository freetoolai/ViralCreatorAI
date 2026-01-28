'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, MoreHorizontal } from 'lucide-react';
import { Campaign, Client } from '@/lib/types';
import tableStyles from '@/components/admin/Table.module.css';
import styles from './list.module.css';
import clsx from 'clsx';

import { useSearchParams } from 'next/navigation';

function CampaignsContent() {
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campsRes, clientsRes] = await Promise.all([
                    fetch(clientId ? `/api/campaigns?clientId=${clientId}` : '/api/campaigns'),
                    fetch('/api/clients')
                ]);
                const [campsData, clientsData] = await Promise.all([
                    campsRes.json(),
                    clientsRes.json()
                ]);
                setCampaigns(campsData);
                setClients(clientsData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, [clientId]);

    const getClientName = (id: string) => clients.find(c => c.id === id)?.companyName || 'Unknown Client';

    // Helper for status styles
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Draft': return styles.statusDraft;
            case 'Sent': return styles.statusSent;
            case 'Active': return styles.statusActive;
            case 'Completed': return styles.statusCompleted;
            default: return styles.statusDraft;
        }
    };

    return (
        <div>
            <div className={tableStyles.tableHeader}>
                <div>
                    <h1 className={tableStyles.headerTitle}>Campaigns</h1>
                    <p className={tableStyles.headerSubtitle}>Manage all active and past campaigns.</p>
                </div>
                <Link href="/admin/campaigns/new" className="btn btn-primary">
                    <Plus size={16} /> New Campaign
                </Link>
            </div>

            <div className={styles.container}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Campaign Name</th>
                            <th>Status</th>
                            <th>Platforms</th>
                            <th>Budget</th>
                            <th>Influencers</th>
                            <th>Last Updated</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((camp) => (
                            <tr key={camp.id}>
                                <td>
                                    <span className={styles.campaignName}>{camp.title}</span>
                                    <span className={styles.clientName}>
                                        <Briefcase size={12} /> {getClientName(camp.clientId)}
                                    </span>
                                </td>
                                <td>
                                    <span className={clsx(styles.statusBadge, getStatusClass(camp.status))}>
                                        {camp.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.platformIcons}>
                                        {camp.platformFocus?.map(p => (
                                            <div key={p} className={styles.platformIcon} title={p}>{p[0]}</div>
                                        )) || <span>-</span>}
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.budget}>${camp.totalBudget?.toLocaleString() || 0}</span>
                                </td>
                                <td>
                                    {camp.influencers?.length || 0}
                                </td>
                                <td className={tableStyles.headerSubtitle}>
                                    {new Date(camp.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <Link
                                            href={`/admin/campaigns/${camp.id}`}
                                            className={clsx("btn btn-outline", styles.actionBtnSmall)}
                                            title="View Details"
                                        >
                                            <MoreHorizontal size={14} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {campaigns.length === 0 && (
                            <tr className={styles.emptyStateRow}>
                                <td colSpan={7}>
                                    No campaigns found. Create your first one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { Suspense } from 'react';

export default function CampaignsPage() {
    return (
        <Suspense fallback={<div>Loading campaigns...</div>}>
            <CampaignsContent />
        </Suspense>
    );
}
