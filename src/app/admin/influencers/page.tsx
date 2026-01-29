'use client';

import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { Search, Plus, Instagram, MessageCircle, Twitter, Youtube } from 'lucide-react';
import { Influencer, PlatformName, Campaign } from '@/lib/types';
import { dataStore } from '@/lib/store';
import { useToast } from '@/components/ToastContext';
import styles from './influencers.module.css';

export default function InfluencersPage() {
    const { showToast } = useToast();
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformName | 'All'>('All');
    const [selectedInfluencerIds, setSelectedInfluencerIds] = useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        setInfluencers(dataStore.getInfluencers());
        setCampaigns(dataStore.getCampaigns());
    }, []);

    const stats = useMemo(() => {
        const totalCreators = influencers.length;
        const totalReach = influencers.reduce((acc, inf) => acc + (inf.platforms[0]?.followers || 0), 0);
        const avgProfit = totalCreators > 0 ? influencers.reduce((acc, inf) => acc + ((inf.typicalCharge || 0) - (inf.typicalPayout || 0)), 0) / totalCreators : 0;

        return { count: totalCreators, reach: totalReach, avgProfit };
    }, [influencers]);


    const toggleInfluencerSelection = (id: string) => {
        setSelectedInfluencerIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getPlatformIcon = (platform: PlatformName) => {
        switch (platform) {
            case 'Instagram': return <Instagram size={14} />;
            case 'TikTok': return <MessageCircle size={14} />;
            case 'Twitter': return <Twitter size={14} />;
            case 'YouTube': return <Youtube size={14} />;
            default: return null;
        }
    };

    const filteredInfluencers = useMemo(() => {
        return influencers.filter((inf: Influencer) => {
            const primaryProfile = inf.platforms[0];
            const handle = primaryProfile?.handle || '';
            const platform = primaryProfile?.platform || 'Other';

            const matchesSearch = inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inf.primaryNiche.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPlatform = selectedPlatform === 'All' || platform === selectedPlatform;
            return matchesSearch && matchesPlatform;
        });
    }, [influencers, searchQuery, selectedPlatform]);

    const handleAddToCampaign = (campaignId: string) => {
        const camp = dataStore.getCampaign(campaignId);
        if (!camp) return;

        selectedInfluencerIds.forEach(id => {
            dataStore.addInfluencerToCampaign(campaignId, id);
        });

        setIsAddModalOpen(false);
        setSelectedInfluencerIds([]);
        showToast(`Successfully added ${selectedInfluencerIds.length} creators to ${camp.title}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Creator Network</h1>
                    <p className={styles.subtitle}>Curate and manage your exclusive roster of talent.</p>
                </div>
                <div className={styles.headerRight}>
                    <Link href="/admin/influencers/new" className="btn btn-primary">
                        <Plus size={16} /> Add Creator
                    </Link>
                </div>
            </div>

            <div className={styles.statsWrapper}>
                <div className={styles.editorialStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Network</span>
                        <span className={styles.statNumber}>{stats.count}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Aggregate Reach</span>
                        <span className={styles.statNumber}>{(stats.reach / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Avg Yield</span>
                        <span className={styles.statNumber}>${Math.round(stats.avgProfit).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className={styles.controlsRow}>
                <div className={styles.filterGroup}>
                    <div className={styles.searchWrapper}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search creators..."
                            className={clsx("input", styles.searchInput)}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            title="Search creators by name or niche"
                        />
                    </div>
                    <div className={styles.filterWrapper}>
                        <select
                            className={clsx("input", styles.filterSelect)}
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value as PlatformName | 'All')}
                            title="Filter by platform"
                        >
                            <option value="All">All Platforms</option>
                            <option value="Instagram">Instagram</option>
                            <option value="TikTok">TikTok</option>
                            <option value="YouTube">YouTube</option>
                            <option value="Twitter">Twitter</option>
                        </select>
                    </div>
                </div>

                {selectedInfluencerIds.length > 0 && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add to Campaign ({selectedInfluencerIds.length})
                    </button>
                )}
            </div>

            <div className={styles.mobileGrid}>
                {filteredInfluencers.map((inf: Influencer) => {
                    const primaryProfile = inf.platforms[0];
                    const profit = (inf.typicalCharge || 0) - (inf.typicalPayout || 0);

                    return (
                        <div
                            key={inf.id}
                            className={styles.mobileCard}
                            onClick={() => toggleInfluencerSelection(inf.id)}
                        >
                            <div className={styles.mobileCardHeader}>
                                <div className={styles.influencerCell}>
                                    <div className={styles.avatar}>{inf.name[0]}</div>
                                    <div className={styles.nameInfo}>
                                        <span className={styles.name}>{inf.name}</span>
                                        <span className={styles.handle}>{primaryProfile?.handle || '@handle'}</span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedInfluencerIds.includes(inf.id)}
                                    onChange={() => toggleInfluencerSelection(inf.id)}
                                    aria-label={`Select ${inf.name}`}
                                />
                            </div>
                            <div className={styles.mobileCardRow}>
                                <span className={styles.mobileLabel}>Platform</span>
                                <div className={styles.platformBadge}>
                                    {getPlatformIcon(primaryProfile?.platform || 'Other')}
                                    {primaryProfile?.platform || 'Other'}
                                </div>
                            </div>
                            <div className={styles.mobileCardRow}>
                                <span className={styles.mobileLabel}>Reach</span>
                                <span className={styles.metricValue}>{(primaryProfile?.followers || 0).toLocaleString()}</span>
                            </div>
                            <div className={styles.mobileCardRow}>
                                <span className={styles.mobileLabel}>Profit</span>
                                <span className={profit > 0 ? styles.profitPositive : profit < 0 ? styles.profitNegative : ''}>
                                    ${profit.toLocaleString()}
                                </span>
                            </div>
                            <div className={styles.mobileCardRow}>
                                <span className={styles.mobileLabel}>Tier</span>
                                <span className={clsx(styles.tierBadge, styles[`tier${inf.tier.replace('-', '')}`])}>
                                    {inf.tier}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.checkboxCell}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedInfluencerIds.length === filteredInfluencers.length && filteredInfluencers.length > 0}
                                    onChange={() => {
                                        if (selectedInfluencerIds.length === filteredInfluencers.length) {
                                            setSelectedInfluencerIds([]);
                                        } else {
                                            setSelectedInfluencerIds(filteredInfluencers.map(i => i.id));
                                        }
                                    }}
                                    aria-label="Select all creators"
                                />
                            </th>
                            <th>Creator</th>
                            <th>Platform</th>
                            <th>Reach</th>
                            <th>Profitability</th>
                            <th>Niche</th>
                            <th>Tier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInfluencers.map((inf: Influencer) => {
                            const primaryProfile = inf.platforms[0];
                            const profit = (inf.typicalCharge || 0) - (inf.typicalPayout || 0);

                            return (
                                <tr
                                    key={inf.id}
                                    className={clsx(selectedInfluencerIds.includes(inf.id) && styles.selectedRow)}
                                    onClick={() => toggleInfluencerSelection(inf.id)}
                                >
                                    <td className={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={selectedInfluencerIds.includes(inf.id)}
                                            onChange={() => toggleInfluencerSelection(inf.id)}
                                            onClick={e => e.stopPropagation()}
                                            aria-label={`Select ${inf.name}`}
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.influencerCell}>
                                            <div className={styles.avatar}>{inf.name[0]}</div>
                                            <div className={styles.nameInfo}>
                                                <span className={styles.name}>{inf.name}</span>
                                                <span className={styles.handle}>{primaryProfile?.handle || '@handle'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.platformBadge}>
                                            {getPlatformIcon(primaryProfile?.platform || 'Other')}
                                            {primaryProfile?.platform || 'Other'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.metricValue}>
                                            {(primaryProfile?.followers || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={profit > 0 ? styles.profitPositive : profit < 0 ? styles.profitNegative : ''}>
                                            ${profit.toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.nicheTag}>{inf.primaryNiche}</span>
                                    </td>
                                    <td>
                                        <span className={clsx(styles.tierBadge, styles[`tier${inf.tier.replace('-', '')}`])}>
                                            {inf.tier}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Bulk Add Modal */}
            {isAddModalOpen && (
                <div role="dialog" aria-modal="true" className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Add to Campaign</h3>
                        <p className={styles.modalSubtitle}>
                            Select a campaign to add {selectedInfluencerIds.length} creators to.
                        </p>

                        <div className={styles.campaignList}>
                            {campaigns.map(camp => (
                                <div
                                    key={camp.id}
                                    className={styles.campaignItem}
                                    onClick={() => handleAddToCampaign(camp.id)}
                                >
                                    <div>
                                        <div className={styles.campaignTitle}>{camp.title}</div>
                                        <div className={styles.campaignMeta}>Status: {camp.status}</div>
                                    </div>
                                    <Plus size={16} />
                                </div>
                            ))}
                            {campaigns.length === 0 && (
                                <div className={styles.emptyState}>
                                    No active campaigns found. Create one first.
                                </div>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
