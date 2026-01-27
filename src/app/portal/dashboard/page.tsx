'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowRight, Calendar } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { Campaign, Client } from '@/lib/types';
import styles from './dashboard.module.css';

export default function ClientDashboard() {
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const clientId = localStorage.getItem('portal_client_id');
        if (!clientId) {
            router.push('/portal');
            return;
        }

        const clients = dataStore.getClients();
        const foundClient = clients.find(c => c.id === clientId);

        if (foundClient) {
            setClient(foundClient);
            setCampaigns(dataStore.getCampaigns(clientId));
        } else {
            router.push('/portal');
        }
    }, [router]);

    if (!client) return null;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Welcome, {client.companyName}</h1>
                <p className={styles.subtitle}>
                    Track your active campaigns and approve influencers below.
                </p>
            </header>

            <div className={styles.grid}>
                {campaigns.map(camp => (
                    <div key={camp.id} className={`glass-panel ${styles.card}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                <Briefcase size={24} />
                            </div>
                            <div className={`${styles.statusBadge} ${camp.status === 'Active' ? styles.statusActive : styles.statusProposed}`}>
                                {camp.status}
                            </div>
                        </div>

                        <h3 className={styles.cardTitle}>{camp.title}</h3>
                        <div className={styles.meta}>
                            <Calendar size={14} /> Created recently
                        </div>

                        <div className={styles.cardFooter}>
                            <div>
                                <div className={styles.creatorsLabel}>PROPOSED INFLUENCERS</div>
                                <div className={styles.creatorsCount}>{camp.influencers?.length || 0} Creators</div>
                            </div>
                            <Link href={`/portal/campaigns/${camp.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                Open Portal <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                            </Link>
                        </div>
                    </div>
                ))}
                {campaigns.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No active campaigns found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
