'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { Users, UserCircle, Briefcase, TrendingUp } from 'lucide-react';
import { dataStore } from '@/lib/store';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
    const influencers = dataStore.getInfluencers();
    const clients = dataStore.getClients();
    const campaigns = dataStore.getCampaigns();

    const stats = [
        { label: 'Total Influencers', value: influencers.length, icon: Users, className: styles.statBlue },
        { label: 'Active Clients', value: clients.length, icon: UserCircle, className: styles.statBlue },
        { label: 'Active Campaigns', value: campaigns.length, icon: Briefcase, className: styles.statGreen },
        { label: 'Pending Approvals', value: 3, icon: TrendingUp, className: styles.statOrange },
    ];

    return (
        <div>
            <header className={styles.header}>
                <h1 className={styles.title}>Dashboard Overview</h1>
                <p className={styles.subtitle}>Welcome back to the agency portal.</p>
            </header>

            <div className={styles.statsGrid}>
                {stats.map((stat) => (
                    <div key={stat.label} className={`glass-panel ${styles.statCard}`}>
                        <div className={styles.statHeader}>
                            <div className={clsx(styles.iconWrapper, stat.className)}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className={styles.contentGrid}>
                <div className={`glass-panel ${styles.sectionCard}`}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Recent Influencers</h3>
                        <Link href="/admin/influencers" className={`btn btn-outline ${styles.viewAllBtn}`}>View All</Link>
                    </div>
                    <div className={styles.list}>
                        {influencers.slice(0, 3).map(inf => (
                            <div key={inf.id} className={styles.influencerItem}>
                                <div className={styles.avatar}>
                                    {inf.name[0]}
                                </div>
                                <div>
                                    <div className={styles.boldText}>{inf.name}</div>
                                    <div className={styles.mutedText}>{inf.tier} • {inf.primaryNiche}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`glass-panel ${styles.sectionCard}`}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Active Campaigns</h3>
                        <Link href="/admin/campaigns" className={`btn btn-outline ${styles.viewAllBtn}`}>View All</Link>
                    </div>
                    <div className={styles.list}>
                        {campaigns.map(camp => (
                            <div key={camp.id} className={styles.campaignItem}>
                                <div>
                                    <div className={styles.boldText}>{camp.title}</div>
                                    <div className={styles.mutedText}>Budget: ${camp.totalBudget.toLocaleString()}</div>
                                </div>
                                <span className={styles.statusBadge}>
                                    {camp.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
