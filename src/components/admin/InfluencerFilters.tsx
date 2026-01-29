'use client';

import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { Tier, PlatformName } from '@/lib/types';
import styles from './InfluencerFilters.module.css';

interface FiltersProps {
    tiers: Tier[];
    niches: string[];
    platforms: PlatformName[];
    activeFilters: {
        tier: string;
        niche: string;
        platform: string;
    };
    onFilterChange: (type: 'tier' | 'niche' | 'platform', value: string) => void;
    onClear: () => void;
}

export function InfluencerFilters({
    tiers,
    niches,
    platforms,
    activeFilters,
    onFilterChange,
    onClear
}: FiltersProps) {
    const hasActiveFilters = Object.values(activeFilters).some(Boolean);

    return (
        <div className={styles.filterBar}>
            <div className={styles.filterLabel}>
                <Filter size={16} /> Filters:
            </div>

            <select
                className={clsx("input", styles.filterSelect)}
                value={activeFilters.tier}
                onChange={(e) => onFilterChange('tier', e.target.value)}
                aria-label="Filter by tier"
            >
                <option value="">All Tiers</option>
                {tiers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
                className={clsx("input", styles.filterSelect)}
                value={activeFilters.niche}
                onChange={(e) => onFilterChange('niche', e.target.value)}
                aria-label="Filter by niche"
            >
                <option value="">All Niches</option>
                {niches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <select
                className={clsx("input", styles.filterSelect)}
                value={activeFilters.platform}
                onChange={(e) => onFilterChange('platform', e.target.value)}
                aria-label="Filter by platform"
            >
                <option value="">All Platforms</option>
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            {hasActiveFilters && (
                <button
                    onClick={onClear}
                    className={clsx("btn btn-outline", styles.clearBtn)}
                >
                    <X size={14} /> Clear
                </button>
            )}
        </div>
    );
}
