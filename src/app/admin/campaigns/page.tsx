'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, MoreHorizontal } from 'lucide-react';
import { Campaign, Client } from '@/lib/types';
import { useToast } from '@/components/ToastContext';
import tableStyles from '@/components/admin/Table.module.css';
import styles from './list.module.css';
import clsx from 'clsx';

import { useSearchParams } from 'next/navigation';

function CampaignsContent() {
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');
    const { showToast } = useToast();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use dataStore directly for mock mode support
                const mod = await import('@/lib/store');
                const [campsData, clientsData] = await Promise.all([
                    mod.dataStore.getCampaigns(clientId || undefined),
                    mod.dataStore.getClients()
                ]);

                setCampaigns(campsData);
                setClients(clientsData);
            } catch (error) {
                console.error("Failed to load campaigns:", error);
                showToast("Failed to load campaigns", "error");
            }
        };
        fetchData();
    }, [clientId, showToast]);

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
        <div className="container">
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Campaigns</h1>
                    <p className={styles.subtitle}>Manage and track your active campaigns.</p>
                </div>
                <Link href="/admin/campaigns/new" className="btn btn-primary">
                    <Plus size={16} /> New Campaign
                </Link>
            </div>

            <div className={styles.mobileGrid}>
                {campaigns.map((camp) => (
                    <div key={camp.id} className={styles.mobileCard}>
                        <div className={styles.mobileCardHeader}>
                            <div>
                                <div className={styles.mobileCardTitle}>{camp.title}</div>
                                <span className={styles.clientName}>
                                    <Briefcase size={12} /> {getClientName(camp.clientId)}
                                </span>
                            </div>
                            <span className={clsx(styles.statusBadge, getStatusClass(camp.status))}>
                                {camp.status}
                            </span>
                        </div>
                        <div className={styles.mobileCardRow}>
                            <span className={styles.mobileLabel}>Budget</span>
                            <span className={styles.budget}>${camp.totalBudget?.toLocaleString() || 0}</span>
                        </div>
                        <div className={styles.mobileCardRow}>
                            <span className={styles.mobileLabel}>Platform</span>
                            <div className={styles.platformIcons}>
                                {camp.platformFocus?.map(p => (
                                    <div key={p} className={styles.platformIcon} title={p}>{p[0]}</div>
                                )) || <span>-</span>}
                            </div>
                        </div>
                        <div className={styles.mobileCardRow}>
                            <span className={styles.mobileLabel}>Influencers</span>
                            <span>{camp.influencers?.length || 0}</span>
                        </div>
                        <div className={styles.mobileCardFooter}>
                            <Link
                                href={`/admin/campaigns/${camp.id}`}
                                className={clsx("btn btn-primary btn-sm", styles.mobileCardAction)}
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
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
