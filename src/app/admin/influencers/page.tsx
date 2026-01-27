'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Plus, Upload, MoreHorizontal, ExternalLink } from 'lucide-react';
import { Influencer, Tier, PlatformName, Campaign } from '@/lib/types';
import { InfluencerFilters } from '@/components/admin/InfluencerFilters';
import styles from '@/components/admin/Table.module.css';

export default function InfluencerPage() {
    // State
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState({ tier: '', niche: '', platform: '' });
    const [search, setSearch] = useState('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');

    // Hydrate
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get ID from params (assuming params is Promise<{id:string}>)
                // However, for now let's just use the current logic but with API
                const infRes = await fetch('/api/influencers'); // Should really be /api/influencers/[id]
                const infData = await infRes.json();
                setInfluencers(infData);

                const campRes = await fetch('/api/campaigns');
                const campData = await campRes.json();
                setCampaigns(campData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);

    // Filter Logic
    const filteredInfluencers = useMemo(() => {
        return influencers.filter(inf => {
            const matchesSearch = inf.name.toLowerCase().includes(search.toLowerCase()) ||
                inf.email.toLowerCase().includes(search.toLowerCase());
            const matchesTier = !filters.tier || inf.tier === filters.tier;
            const matchesNiche = !filters.niche || inf.primaryNiche === filters.niche || inf.secondaryNiches.includes(filters.niche);
            const matchesPlatform = !filters.platform || inf.platforms.some(p => p.platform === filters.platform);

            return matchesSearch && matchesTier && matchesNiche && matchesPlatform;
        });
    }, [influencers, search, filters]);

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredInfluencers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredInfluencers.map(i => i.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    // Derive Filter Options
    const allTiers: Tier[] = Array.from(new Set(influencers.map(i => i.tier))) as Tier[];
    const allNiches: string[] = Array.from(new Set(influencers.map(i => i.primaryNiche)));
    const allPlatforms: PlatformName[] = ['YouTube', 'Instagram', 'TikTok', 'Twitter'];

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.size} influencers?`)) {
            setInfluencers(prev => prev.filter(i => !selectedIds.has(i.id)));
            setSelectedIds(new Set());
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this influencer?')) {
            setInfluencers(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleAddToCampaign = () => {
        if (!selectedCampaignId) return;

        alert(`Success! ${selectedIds.size} influencers added to campaign (Simulated).`);
        setIsAddModalOpen(false);
        setSelectedIds(new Set());
        setSelectedCampaignId('');
    };

    // ... (rest of render)

    return (
        <div>
            <div className={styles.tableHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Influencers</h1>
                    <p className={styles.headerSubtitle}>Manage your creator roster.</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/influencers/import" className="btn btn-outline">
                        <Upload size={16} /> Import CSV
                    </Link>
                    <Link href="/admin/influencers/new" className="btn btn-primary">
                        <Plus size={16} /> New Influencer
                    </Link>
                </div>
            </div>

            <div className={clsx("glass-panel", styles.filterSection)}>
                <input
                    type="text"
                    placeholder="Search by name, email..."
                    className={clsx("input", styles.searchInputFull)}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <InfluencerFilters
                    tiers={allTiers}
                    niches={allNiches}
                    platforms={allPlatforms}
                    activeFilters={filters}
                    onFilterChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
                    onClear={() => setFilters({ tier: '', niche: '', platform: '' })}
                />
            </div>

            <div className={styles.tableContainer}>
                {selectedIds.size > 0 && (
                    <div className={styles.bulkActions}>
                        <span>{selectedIds.size} influencers selected</span>
                        <div>
                            <button className={styles.bulkBtn} onClick={() => setIsAddModalOpen(true)}>Add to Campaign</button>
                            <button
                                className={clsx(styles.bulkBtn, styles.dangerOutline)}
                                onClick={handleBulkDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.rowSelect}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedIds.size === filteredInfluencers.length && filteredInfluencers.length > 0}
                                    onChange={toggleSelectAll}
                                    aria-label="Select all influencers"
                                    title="Select all"
                                />
                            </th>
                            <th>Influencer</th>
                            <th>Niche</th>
                            <th>Tier</th>
                            <th>Platforms</th>
                            <th>Followers (Total)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInfluencers.map((inf) => {
                            const totalFollowers = inf.platforms.reduce((acc, curr) => acc + curr.followers, 0);

                            return (
                                <tr key={inf.id}>
                                    <td className={styles.rowSelect}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={selectedIds.has(inf.id)}
                                            onChange={() => toggleSelect(inf.id)}
                                            aria-label={`Select ${inf.name}`}
                                            title={`Select ${inf.name}`}
                                        />
                                    </td>
                                    <td>
                                        <Link href={`/admin/influencers/${inf.id}`} className={styles.rowLink}>
                                            <div className={styles.avatarCell}>
                                                <div className={styles.avatar}>{inf.name[0]}</div>
                                                <div className={styles.nameInfo}>
                                                    <div className={styles.name}>{inf.name}</div>
                                                    <div className={styles.email}>{inf.email}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td>
                                        <span className={clsx(styles.badge, styles.mutedBadge)}>
                                            {inf.primaryNiche}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${styles.badgeTier}`}>
                                            {inf.tier}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.platforms}>
                                            {inf.platforms.map(p => (
                                                <div key={p.platform} className={styles.platformIcon} title={`${p.platform}: ${p.followers.toLocaleString()}`}>
                                                    {p.platform[0]}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className={styles.tabularNums}>
                                        {totalFollowers.toLocaleString()}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Link href={`/admin/influencers/${inf.id}`} className={clsx("btn btn-outline", styles.iconOnlyBtn)}>
                                                <ExternalLink size={14} />
                                            </Link>
                                            <button
                                                className={clsx("btn btn-outline", styles.iconOnlyBtn, styles.dangerOutline)}
                                                onClick={() => handleDelete(inf.id)}
                                            >
                                                <MoreHorizontal size={14} className={styles.rotate90} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {filteredInfluencers.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ color: 'hsl(var(--muted-foreground))' }}>
                                        <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                            No influencers found
                                        </p>
                                        <p style={{ fontSize: '0.9375rem' }}>
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
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add to Campaign</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Select Campaign</label>
                            <select
                                className="input"
                                value={selectedCampaignId}
                                onChange={(e) => setSelectedCampaignId(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">Choose a campaign...</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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
