'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowRight, Calendar } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { Campaign, Client } from '@/lib/types';
import styles from './dashboard.module.css';
import clsx from 'clsx';

export default function ClientDashboard() {
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        const clientId = localStorage.getItem('portal_client_id');
        const timer = setTimeout(() => {
            setHasMounted(true);
            if (!clientId) {
                router.push('/portal');
                return;
            }

            const foundClient = dataStore.getClients().find(c => c.id === clientId);
            if (foundClient) {
                setClient(foundClient);
                setCampaigns(dataStore.getCampaigns(clientId));
            } else {
                router.push('/portal');
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [router]);

    if (!hasMounted || !client) return null;

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
                    <div key={camp.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                <Briefcase size={24} />
                            </div>
                            <div className={clsx(styles.statusBadge, camp.status === 'Active' ? styles.statusActive : styles.statusProposed)}>
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
                            <Link href={`/portal/campaigns/${camp.id}`} className={clsx("btn btn-primary", styles.portalLink)}>
                                Open Portal <ArrowRight size={16} className={styles.portalArrow} />
                            </Link>
                        </div>
                    </div>
                ))}
                {campaigns.length === 0 && (
                    <div className={styles.emptyState}>
                        <Briefcase size={48} className={styles.emptyIcon} />
                        <h3>No active campaigns</h3>
                        <p>Your active campaigns will appear here once they are launched. Contact your account manager for more details.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
