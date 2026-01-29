'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Briefcase, PlusCircle, Globe, Calendar } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Influencer, Campaign } from '@/lib/types';
import styles from './dashboard.module.css';

const Sparkline = ({ data, color }: { data: { v: number }[], color: string }) => (
    <div className={styles.statSparkline}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <Area
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.1}
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export default function AdminDashboard() {
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setInfluencers(dataStore.getInfluencers());
        setCampaigns(dataStore.getCampaigns());
        setIsHydrated(true);
    }, []);

    // Prevent render until hydrated to avoid mismatch
    if (!isHydrated) return <div className={clsx("container", styles.loadingState)}>Loading...</div>;

    const statsData = [
        { label: 'Total Creators', value: influencers.length, color: '#2F5E4E', trend: [{ v: 10 }, { v: 12 }, { v: 11 }, { v: 14 }, { v: 15 }, { v: influencers.length }] },
        { label: 'Campaigns', value: campaigns.length, color: '#2F5E4E', trend: [{ v: 2 }, { v: 3 }, { v: 2 }, { v: 4 }, { v: 3 }, { v: campaigns.length }] },
        { label: 'Network Reach', value: '4.2M', color: '#2F5E4E', trend: [{ v: 3.8 }, { v: 3.9 }, { v: 4.1 }, { v: 4.0 }, { v: 4.2 }, { v: 4.2 }] },
        { label: 'Avg ROI', value: '3.4x', color: '#2F5E4E', trend: [{ v: 2.8 }, { v: 3.0 }, { v: 3.2 }, { v: 3.1 }, { v: 3.4 }, { v: 3.4 }] },
    ];

    const quickActions = [
        { title: 'Add Creator', icon: PlusCircle, href: '/admin/influencers/new' },
        { title: 'New Campaign', icon: Briefcase, href: '/admin/campaigns' },
        { title: 'Export Data', icon: Globe, href: '#' },
    ];

    return (
        <div className="container">
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>Dashboard overview</h1>
                        <p className={styles.subtitle}>Track your agency performance and network growth.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <div className={styles.dateFilter}>
                            <Calendar size={14} className={styles.mr8} />
                            Last 30 days
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.quickActionsGrid}>
                {quickActions.map(action => (
                    <Link key={action.title} href={action.href} className={styles.actionButton}>
                        <div className={styles.actionIcon}>
                            <action.icon size={18} />
                        </div>
                        <span className={styles.actionTitle}>{action.title}</span>
                    </Link>
                ))}
            </div>

            <div className={styles.statsGrid}>
                {statsData.map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div>
                                <div className={styles.statLabel}>{stat.label}</div>
                                <div className={styles.statValue}>{stat.value}</div>
                            </div>
                            <Sparkline data={stat.trend} color={stat.color} />
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.chartGrid}>
                <AnalyticsChart
                    title="Network Growth"
                    data={[
                        { name: 'Jan', value: 12 },
                        { name: 'Feb', value: 18 },
                        { name: 'Mar', value: 25 },
                        { name: 'Apr', value: 34 },
                        { name: 'May', value: 42 },
                        { name: 'Jun', value: influencers.length },
                    ]}
                    dataKey="value"
                />
                <AnalyticsChart
                    title="Budget Utilization"
                    type="bar"
                    data={campaigns.slice(0, 5).map(c => ({ name: c.title.split(' ')[0], value: c.totalBudget }))}
                    dataKey="value"
                    color="#1A1A1A"
                />
            </div>

            <div className={styles.contentGrid}>
                <section className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Network growth</h2>
                        <Link href="/admin/influencers" className={`btn btn-text ${styles.viewAllBtn}`}>View all</Link>
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
                </section>

                <section className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Active campaigns</h2>
                        <Link href="/admin/campaigns" className={`btn btn-text ${styles.viewAllBtn}`}>View all</Link>
                    </div>
                    <div className={styles.list}>
                        {campaigns.slice(0, 5).map(camp => (
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
                </section>
            </div>
        </div>
    );
}
