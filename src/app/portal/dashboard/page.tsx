'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowRight, Calendar, Folder } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { Campaign, Client, CampaignGroup } from '@/lib/types';
import styles from './dashboard.module.css';
import clsx from 'clsx';

export default function ClientDashboard() {
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [groups, setGroups] = useState<CampaignGroup[]>([]);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const clientId = localStorage.getItem('portal_client_id');
            setHasMounted(true);

            if (!clientId) {
                router.push('/portal');
                return;
            }

            try {
                const clients = await dataStore.getClients();
                const foundClient = clients.find(c => c.id === clientId);

                if (foundClient) {
                    setClient(foundClient);
                    const [camps, grps] = await Promise.all([
                        dataStore.getCampaigns(clientId),
                        dataStore.getGroups(clientId)
                    ]);
                    setCampaigns(camps);
                    setGroups(grps);
                } else {
                    router.push('/portal');
                }
            } catch (error) {
                console.error("Failed to load portal data:", error);
                router.push('/portal');
            }
        };
        fetchData();
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

            {groups.length > 0 && (
                <section className={styles.groupsSection}>
                    <h2 className={styles.sectionTitle}>Shared Groups</h2>
                    <div className={styles.grid}>
                        {groups.map(group => (
                            <Link href={`/portal/groups/${group.id}`} key={group.id} className={clsx(styles.card, styles.groupCard)}>
                                <div className={styles.cardHeader}>
                                    <div className={clsx(styles.iconWrapper, styles.groupIcon)}>
                                        <Folder size={24} />
                                    </div>
                                    <div className={styles.groupBadge}>Campaign Group</div>
                                </div>
                                <h3 className={styles.cardTitle}>{group.title}</h3>
                                {group.description && <p className={styles.groupDesc}>{group.description}</p>}
                                <div className={styles.cardFooter}>
                                    <div>
                                        <div className={styles.creatorsLabel}>{group.campaignIds.length} CAMPAIGNS</div>
                                    </div>
                                    <div className={styles.portalLink}>
                                        Open View <ArrowRight size={16} className={styles.portalArrow} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className={styles.campaignsSection}>
                <h2 className={styles.sectionTitle}>{groups.length > 0 ? 'All Campaigns' : 'Active Campaigns'}</h2>
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
                    {campaigns.length === 0 && groups.length === 0 && (
                        <div className={styles.emptyState}>
                            <Briefcase size={48} className={styles.emptyIcon} />
                            <h3>No active campaigns</h3>
                            <p>Your active campaigns will appear here once they are launched. Contact your account manager for more details.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
