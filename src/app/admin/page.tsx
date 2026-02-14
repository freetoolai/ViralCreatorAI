'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Briefcase, PlusCircle, Globe, Calendar, Folder } from 'lucide-react';
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
        const fetchData = async () => {
            try {
                const infs = await dataStore.getInfluencers();
                const camps = await dataStore.getCampaigns();
                setInfluencers(infs);
                setCampaigns(camps);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsHydrated(true);
            }
        };
        fetchData();
    }, []);

    // Prevent render until hydrated to avoid mismatch
    if (!isHydrated) return <div className={clsx("container", styles.loadingState)}>Loading...</div>;

    const totalReach = influencers.reduce((acc, inf) => {
        const infReach = (inf.platforms || []).reduce((sum, p) => sum + (p.followers || 0), 0);
        return acc + infReach;
    }, 0);

    const formatReach = (reach: number) => {
        if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
        if (reach >= 1000) return `${(reach / 1000).toFixed(1)}K`;
        return reach.toString();
    };

    // Calculate ROI from campaigns
    let totalClientFees = 0;
    let totalInfluencerFees = 0;
    campaigns.forEach(c => {
        (c.influencers || []).forEach(ref => {
            totalClientFees += Number(ref.clientFee) || 0;
            totalInfluencerFees += Number(ref.influencerFee) || 0;
        });
    });
    const avgROI = totalInfluencerFees > 0 ? (totalClientFees / totalInfluencerFees).toFixed(1) : '0';

    const statsData = [
        { label: 'Total Creators', value: influencers.length, color: '#2F5E4E', href: '/admin/influencers', trend: [{ v: 0 }, { v: 2 }, { v: 5 }, { v: influencers.length }] },
        { label: 'Campaigns', value: campaigns.length, color: '#2F5E4E', href: '/admin/campaigns', trend: [{ v: 0 }, { v: 1 }, { v: campaigns.length }] },
        { label: 'Network Reach', value: formatReach(totalReach), color: '#2F5E4E', href: '/admin/influencers', trend: [{ v: 0 }, { v: totalReach }] },
        { label: 'Avg ROI', value: `${avgROI}x`, color: '#2F5E4E', href: '/admin/campaigns', trend: [{ v: 0 }, { v: Number(avgROI) }] },
    ];

    const quickActions = [
        { title: 'Add Creator', icon: PlusCircle, href: '/admin/influencers/new' },
        { title: 'New Campaign', icon: Briefcase, href: '/admin/campaigns' },
        { title: 'New Group', icon: Folder, href: '/admin/groups/new' },
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
                    <Link key={stat.label} href={stat.href} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div>
                                <div className={styles.statLabel}>{stat.label}</div>
                                <div className={styles.statValue}>{stat.value}</div>
                            </div>
                            <Sparkline data={stat.trend} color={stat.color} />
                        </div>
                    </Link>
                ))}
            </div>

            <div className={styles.chartGrid}>
                <AnalyticsChart
                    title="Network Growth"
                    data={[
                        { name: 'Start', value: 0 },
                        { name: 'Current', value: influencers.length },
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
                            <Link key={inf.id} href={`/admin/influencers/${inf.id}`} className={styles.influencerItem}>
                                <div className={styles.avatar}>
                                    {inf.name[0]}
                                </div>
                                <div>
                                    <div className={styles.boldText}>{inf.name}</div>
                                    <div className={styles.mutedText}>{inf.tier} • {inf.primaryNiche}</div>
                                </div>
                            </Link>
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
                            <Link key={camp.id} href={`/admin/campaigns/${camp.id}`} className={styles.campaignItem}>
                                <div>
                                    <div className={styles.boldText}>{camp.title}</div>
                                    <div className={styles.mutedText}>Budget: ${camp.totalBudget.toLocaleString()}</div>
                                </div>
                                <span className={styles.statusBadge}>
                                    {camp.status}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
