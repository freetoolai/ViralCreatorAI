'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Instagram,
    Twitter,
    Youtube,
    FileDown,
    MapPin,
    ArrowUpDown
} from 'lucide-react';
import { dataStore } from '@/lib/store';
import { Influencer, PlatformName, Campaign } from '@/lib/types';
import styles from '@/components/admin/Table.module.css';

export default function InfluencersPage() {
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformName | 'All'>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedInfluencerIds, setSelectedInfluencerIds] = useState<string[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');

    useEffect(() => {
        setInfluencers(dataStore.getInfluencers());
        setCampaigns(dataStore.getCampaigns());
    }, []);

    const filteredInfluencers = influencers.filter(inf => {
        const primarySocial = inf.platforms?.[0];
        const matchesSearch = inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            primarySocial?.handle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = selectedPlatform === 'All' || inf.platforms?.some(p => p.platform === selectedPlatform);
        return matchesSearch && matchesPlatform;
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this influencer?')) {
            dataStore.deleteInfluencer(id);
            setInfluencers(dataStore.getInfluencers());
        }
    };

    const toggleSelectAll = () => {
        if (selectedInfluencerIds.length === filteredInfluencers.length) {
            setSelectedInfluencerIds([]);
        } else {
            setSelectedInfluencerIds(filteredInfluencers.map(i => i.id));
        }
    };

    const toggleSelectInfluencer = (id: string) => {
        setSelectedInfluencerIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAddToCampaign = () => {
        if (!selectedCampaignId || selectedInfluencerIds.length === 0) return;

        selectedInfluencerIds.forEach(infId => {
            dataStore.addInfluencerToCampaign(selectedCampaignId, infId);
        });

        alert(`Added ${selectedInfluencerIds.length} influencers to campaign`);
        setIsAddModalOpen(false);
        setSelectedInfluencerIds([]);
        setSelectedCampaignId('');
    };

    const getPlatformIcon = (platform: PlatformName) => {
        switch (platform) {
            case 'Instagram': return <Instagram size={14} />;
            case 'Twitter': return <Twitter size={14} />;
            case 'YouTube': return <Youtube size={14} />;
            case 'TikTok': return <div className={styles.tiktokIcon}>TT</div>;
            default: return null;
        }
    };

    return (
        <div>
            <div className={styles.headerContainer}>
                <div>
                    <h1 className={styles.headerTitleLarge}>Influencers</h1>
                    <p className={styles.headerDescription}>Manage and discover influencers for your campaigns.</p>
                </div>
                <div className={styles.headerActionsFlex}>
                    <Link href="/admin/influencers/import" className="btn btn-outline">
                        <FileDown size={16} className={styles.iconMarginRight} /> Import CSV
                    </Link>
                    <button className="btn btn-primary">
                        <Plus size={16} className={styles.iconMarginRight} /> Add Influencer
                    </button>
                </div>
            </div>

            <div className={clsx("glass-panel", styles.searchBarContainer)}>
                <div className={styles.searchInputRelative}>
                    <Search className={styles.searchIconAbsolute} size={16} />
                    <input
                        type="text"
                        placeholder="Search influencers by name or handle..."
                        className={clsx("input", styles.searchInputPadding)}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        title="Search Influencers"
                    />
                </div>
                <div className={styles.filterWrapper}>
                    <Filter size={16} className={styles.filterIconColor} />
                    <select
                        className={clsx("input", styles.filterSelectWidth)}
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value as any)}
                        title="Filter by Platform"
                    >
                        <option value="All">All Platforms</option>
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Twitter">Twitter</option>
                        <option value="YouTube">YouTube</option>
                    </select>
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

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.headerRow}>
                            <th className={clsx(styles.headerCell, styles.checkboxCell)}>
                                <input
                                    type="checkbox"
                                    checked={selectedInfluencerIds.length === filteredInfluencers.length && filteredInfluencers.length > 0}
                                    onChange={toggleSelectAll}
                                    title="Toggle Select All"
                                />
                            </th>
                            <th className={styles.headerCell}>INFLUENCER</th>
                            <th className={styles.headerCell}>PLATFORM</th>
                            <th className={styles.headerCell}>FOLLOWERS <ArrowUpDown size={12} className={styles.sortIcon} /></th>
                            <th className={styles.headerCell}>ENG. RATE <ArrowUpDown size={12} className={styles.sortIcon} /></th>
                            <th className={styles.headerCell}>LOCATION</th>
                            <th className={clsx(styles.headerCell, styles.alignRight)}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInfluencers.map((inf) => {
                            const primarySocial = inf.platforms?.[0];
                            return (
                                <tr key={inf.id} className={styles.row}>
                                    <td className={clsx(styles.cell, styles.checkboxCell)}>
                                        <input
                                            type="checkbox"
                                            checked={selectedInfluencerIds.includes(inf.id)}
                                            onChange={() => toggleSelectInfluencer(inf.id)}
                                            title={`Select ${inf.name}`}
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <Link href={`/admin/influencers/${inf.id}`} className={styles.profileCell}>
                                            <div className={styles.avatar}>
                                                {inf.name[0]}
                                            </div>
                                            <div>
                                                <div className={styles.primaryText}>{inf.name}</div>
                                                <div className={styles.secondaryText}>@{primarySocial?.handle || 'no-handle'}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className={styles.cell}>
                                        <div className={styles.platformBadge}>
                                            {primarySocial ? getPlatformIcon(primarySocial.platform) : null}
                                            <span>{primarySocial?.platform || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className={clsx(styles.cell, styles.tabularNums)}>
                                        {primarySocial ? `${(primarySocial.followers / 1000).toFixed(1)}k` : '0k'}
                                    </td>
                                    <td className={clsx(styles.cell, styles.tabularNums)}>
                                        {primarySocial?.engagementRate || 0}%
                                    </td>
                                    <td className={styles.cell}>
                                        <div className={styles.locationCell}>
                                            <MapPin size={12} /> {inf.shippingAddress || 'Remote'}
                                        </div>
                                    </td>
                                    <td className={clsx(styles.cell, styles.alignRight)}>
                                        <div className={styles.actionsCell}>
                                            <button
                                                className={clsx("btn btn-outline", styles.iconOnlyBtn, styles.dangerOutline)}
                                                onClick={() => handleDelete(inf.id)}
                                                title="Delete Influencer"
                                                aria-label={`Delete ${inf.name}`}
                                            >
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {filteredInfluencers.length === 0 && (
                            <tr>
                                <td colSpan={7} className={styles.emptyStateCell}>
                                    <div className={styles.emptyStateContent}>
                                        <p className={styles.emptyStateTitle}>
                                            No influencers found
                                        </p>
                                        <p className={styles.emptyStateSubtitle}>
                                            Try adjusting your filters or import influencers to get started
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add to Campaign Modal */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={clsx("glass-panel", styles.smallModal)}>
                        <h3 className={styles.modalTitle}>Add to Campaign</h3>

                        <div className={styles.modalField}>
                            <label className={styles.modalLabel}>Select Campaign</label>
                            <select
                                value={selectedCampaignId}
                                onChange={(e) => setSelectedCampaignId(e.target.value)}
                                className={clsx("input", styles.fullWidth)}
                                title="Select Campaign"
                            >
                                <option value="">Choose a campaign...</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.modalActions}>
                            <button className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddToCampaign}
                                disabled={!selectedCampaignId}
                            >
                                Add Influencers
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
