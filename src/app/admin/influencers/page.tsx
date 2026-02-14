'use client';

import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { Search, Plus, Instagram, MessageCircle, Twitter, Youtube, Trash2, Edit2, Eye, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { Influencer, PlatformName, Campaign, Tier } from '@/lib/types';
import { dataStore } from '@/lib/store';
import { useToast } from '@/components/ToastContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import styles from './influencers.module.css';

export default function InfluencersPage() {
    const { showToast } = useToast();
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformName | 'All'>('All');
    const [selectedInfluencerIds, setSelectedInfluencerIds] = useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const infs = await dataStore.getInfluencers();
                const camps = await dataStore.getCampaigns();
                setInfluencers(infs);
                setCampaigns(camps);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                showToast("Failed to load creators or campaigns.", "error");
            }
        };
        fetchData();
    }, [showToast]);

    const stats = useMemo(() => {
        const totalCreators = influencers.length;
        const totalReach = influencers.reduce((acc, inf) => {
            const infReach = (inf.platforms || []).reduce((sum, p) => sum + (p.followers || 0), 0);
            return acc + infReach;
        }, 0);
        const avgProfit = totalCreators > 0 ? influencers.reduce((acc, inf) => acc + ((inf.typicalCharge || 0) - (inf.typicalPayout || 0)), 0) / totalCreators : 0;

        return { count: totalCreators, reach: totalReach, avgProfit };
    }, [influencers]);

    const formatReach = (reach: number) => {
        if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
        if (reach >= 1000) return `${(reach / 1000).toFixed(0)}K`;
        return reach.toLocaleString();
    };


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
            case 'Twitch': return <Zap size={14} />;
            default: return null;
        }
    };

    const filteredInfluencers = useMemo(() => {
        const filtered = influencers.filter((inf: Influencer) => {
            const primaryProfile = inf.platforms?.[0];
            const handle = primaryProfile?.handle || '';
            const name = inf.name || 'Unknown';
            const niche = inf.primaryNiche || '';

            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                niche.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesPlatform = selectedPlatform === 'All' ||
                (inf.platforms || []).some(p => p.platform === selectedPlatform);

            return matchesSearch && matchesPlatform;
        });

        return filtered.sort((a, b) => {
            let valA: string | number;
            let valB: string | number;

            switch (sortConfig.key) {
                case 'name':
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                case 'reach':
                    valA = (a.platforms || []).reduce((sum, p) => sum + (p.followers || 0), 0);
                    valB = (b.platforms || []).reduce((sum, p) => sum + (p.followers || 0), 0);
                    break;
                case 'yield':
                    valA = (a.typicalCharge || 0) - (a.typicalPayout || 0);
                    valB = (b.typicalCharge || 0) - (b.typicalPayout || 0);
                    break;
                case 'tier':
                    const tiers: Record<Tier, number> = { 'Nano': 1, 'Micro': 2, 'Mid-Tier': 3, 'Macro': 4, 'Mega': 5 };
                    valA = tiers[a.tier || 'Micro'] || 0;
                    valB = tiers[b.tier || 'Micro'] || 0;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [influencers, searchQuery, selectedPlatform, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (column: string) => {
        if (sortConfig.key !== column) return null;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    const [isAddingToCampaign, setIsAddingToCampaign] = useState(false);

    const handleAddToCampaign = async (campaignId: string) => {
        const camp = await dataStore.getCampaign(campaignId);
        if (!camp) return;

        setIsAddingToCampaign(true);
        try {
            await Promise.all(selectedInfluencerIds.map(id =>
                dataStore.addInfluencerToCampaign(campaignId, id)
            ));

            setIsAddModalOpen(false);
            setSelectedInfluencerIds([]);
            showToast(`Successfully added ${selectedInfluencerIds.length} creators to ${camp.title}`);
        } catch (error) {
            console.error("Failed to add to campaign:", error);
            showToast("Failed to add creators to campaign.", "error");
        } finally {
            setIsAddingToCampaign(false);
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = async () => {
        const { id, name } = deleteModal;
        try {
            await dataStore.deleteInfluencer(id);
            setInfluencers(prev => prev.filter(inf => inf.id !== id));
            showToast(`${name} has been removed from the network.`);
        } catch (error) {
            console.error("Failed to delete influencer:", error);
            showToast("Failed to remove creator.", "error");
        } finally {
            setDeleteModal({ isOpen: false, id: '', name: '' });
        }
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
                        <span className={styles.statNumber}>{formatReach(stats.reach)}</span>
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
                            <option value="Twitch">Twitch</option>
                            <option value="Other">Other</option>
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
                    const primaryProfile = inf.platforms?.[0];
                    const profit = (inf.typicalCharge || 0) - (inf.typicalPayout || 0);

                    return (
                        <div
                            key={inf.id}
                            className={styles.mobileCard}
                            onClick={() => toggleInfluencerSelection(inf.id)}
                        >
                            <div className={styles.mobileCardHeader}>
                                <div className={styles.influencerCell}>
                                    <div className={styles.avatar}>{inf.name ? inf.name[0] : '?'}</div>
                                    <div className={styles.nameInfo}>
                                        <span className={styles.name}>{inf.name || 'Unnamed'}</span>
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
                                <span className={clsx(styles.tierBadge, styles[`tier${(inf.tier || 'Micro').replace('-', '')}`])}>
                                    {inf.tier || 'Micro'}
                                </span>
                            </div>
                            <div className={styles.mobileActions}>
                                <Link href={`/admin/influencers/${inf.id}`} className={styles.actionBtn} onClick={e => e.stopPropagation()}>
                                    <Eye size={16} /> Details
                                </Link>
                                <Link href={`/admin/influencers/${inf.id}/edit`} className={styles.actionBtn} onClick={e => e.stopPropagation()}>
                                    <Edit2 size={16} /> Edit
                                </Link>
                                <button
                                    className={clsx(styles.actionBtn, styles.deleteAction)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(inf.id, inf.name);
                                    }}
                                    title={`Delete ${inf.name}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )
                })}
                {filteredInfluencers.length === 0 && (
                    <div className={styles.emptyState}>
                        No creators found matching your criteria.
                    </div>
                )}
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
                            <th className={styles.sortableHeader} onClick={() => requestSort('name')}>
                                <div className={styles.headerContent}>Creator {renderSortIcon('name')}</div>
                            </th>
                            <th>Platform</th>
                            <th className={styles.sortableHeader} onClick={() => requestSort('reach')}>
                                <div className={styles.headerContent}>Reach {renderSortIcon('reach')}</div>
                            </th>
                            <th className={styles.sortableHeader} onClick={() => requestSort('yield')}>
                                <div className={styles.headerContent}>Est. Yield {renderSortIcon('yield')}</div>
                            </th>
                            <th>Primary Niche</th>
                            <th className={styles.sortableHeader} onClick={() => requestSort('tier')}>
                                <div className={styles.headerContent}>Tier {renderSortIcon('tier')}</div>
                            </th>
                            <th className={styles.actionsCell}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInfluencers.map((inf: Influencer) => {
                            const primaryProfile = inf.platforms?.[0];
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
                                            <div className={styles.avatar}>{inf.name ? inf.name[0] : '?'}</div>
                                            <div className={styles.nameInfo}>
                                                <Link href={`/admin/influencers/${inf.id}`} className={styles.nameLink} onClick={e => e.stopPropagation()}>
                                                    <span className={styles.name}>{inf.name || 'Unnamed'}</span>
                                                </Link>
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
                                            {formatReach(primaryProfile?.followers || 0)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={profit > 0 ? styles.profitPositive : profit < 0 ? styles.profitNegative : ''}>
                                            ${profit.toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.nicheTag}>{inf.primaryNiche || 'General'}</span>
                                    </td>
                                    <td>
                                        <span className={clsx(styles.tierBadge, styles[`tier${(inf.tier || 'Micro').replace('-', '')}`])}>
                                            {inf.tier || 'Micro'}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actionButtons}>
                                            <Link
                                                href={`/admin/influencers/${inf.id}`}
                                                className={styles.iconButton}
                                                title="View Details"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <Link
                                                href={`/admin/influencers/${inf.id}/edit`}
                                                className={styles.iconButton}
                                                title="Edit Influencer"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <Edit2 size={18} />
                                            </Link>
                                            <button
                                                className={clsx(styles.iconButton, styles.deleteButton)}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(inf.id, inf.name);
                                                }}
                                                title="Delete Influencer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredInfluencers.length === 0 && (
                            <tr className={styles.emptyStateRow}>
                                <td colSpan={8}>
                                    No creators found matching your criteria.
                                </td>
                            </tr>
                        )}
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

                        <div className={clsx(styles.campaignList, isAddingToCampaign && styles.loading)}>
                            {campaigns.map(camp => (
                                <div
                                    key={camp.id}
                                    className={clsx(styles.campaignItem, isAddingToCampaign && styles.disabled)}
                                    onClick={() => !isAddingToCampaign && handleAddToCampaign(camp.id)}
                                >
                                    <div>
                                        <div className={styles.campaignTitle}>{camp.title}</div>
                                        <div className={styles.campaignMeta}>Status: {camp.status}</div>
                                    </div>
                                    {isAddingToCampaign ? (
                                        <div className={styles.spinnerSmall} />
                                    ) : (
                                        <Plus size={16} />
                                    )}
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

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Creator"
                message={`Are you sure you want to delete ${deleteModal.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
            />
        </div>
    );
}
