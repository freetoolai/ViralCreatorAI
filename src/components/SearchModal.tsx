'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ChevronRight } from 'lucide-react';
import styles from './SearchModal.module.css';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const { results, search, clearResults } = useGlobalSearch();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when opening
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        } else {
            // Use requestAnimationFrame or similar to avoid synchronous setState inside effect warning
            requestAnimationFrame(() => {
                setQuery('');
                clearResults();
            });
        }
    }, [isOpen, clearResults]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        search(q);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.searchHeader}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search influencers, clients..."
                        className={styles.searchInput}
                        value={query}
                        onChange={handleSearch}
                    />
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close search">
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.resultsContainer}>
                    {results.length > 0 ? (
                        results.map((group) => (
                            <div key={group.type} className={styles.categorySection}>
                                <div className={styles.categoryTitle}>{group.type}</div>
                                {group.items.map((item) => (
                                    <Link
                                        key={(item as unknown as Record<string, string>)[group.key]}
                                        href={
                                            group.type === 'Campaigns'
                                                ? `/admin/campaigns/${(item as unknown as Record<string, string>).id}`
                                                : group.type === 'Influencers'
                                                    ? `/admin/influencers/${(item as unknown as Record<string, string>).id}`
                                                    : group.type === 'Clients'
                                                        ? `/admin/clients/${(item as unknown as Record<string, string>).id}`
                                                        : group.path
                                        }
                                        className={styles.resultItem}
                                        onClick={onClose}
                                    >
                                        <div className={styles.resultAvatar}>
                                            {group.type === 'Influencers' ? 'I' : group.type === 'Clients' ? 'C' : 'P'}
                                        </div>
                                        <div className={styles.resultInfo}>
                                            <span className={styles.resultName}>{(item as unknown as Record<string, string>)[group.label]}</span>
                                            <span className={styles.resultMeta}>{(item as unknown as Record<string, string>)[group.sub]}</span>
                                        </div>
                                        <ChevronRight size={16} color="var(--text-muted)" />
                                    </Link>
                                ))}
                            </div>
                        ))
                    ) : (
                        query.length > 0 && (
                            <div className={styles.emptyState}>
                                <p>No matching results found</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
