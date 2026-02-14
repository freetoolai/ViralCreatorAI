'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Search, Bell, LogOut } from 'lucide-react';
import clsx from 'clsx';
import styles from './TopNav.module.css';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useToast } from '@/components/ToastContext';

export function TopNav() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const user = session?.user as { name?: string; role?: string } | undefined;
    const { results, search, clearResults } = useGlobalSearch();
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);

        if (q.length < 1) {
            clearResults();
            setShowResults(false);
            return;
        }

        search(q);
        setShowResults(true);
    };

    return (
        <header className={styles.header}>
            <div className={styles.searchContainer} ref={searchRef}>
                <Search
                    size={18}
                    className={styles.searchIcon}
                    onClick={() => inputRef.current?.focus()}
                    style={{ cursor: 'pointer' }}
                />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search influencers, clients, campaigns..."
                    className={styles.searchInput}
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => query.length > 0 && setShowResults(true)}
                />

                {showResults && (
                    <div className={styles.searchResults}>
                        {results.length > 0 ? (
                            results.map((group) => (
                                <div key={group.type} className={styles.resultGroup}>
                                    <div className={styles.groupTitle}>{group.type}</div>
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
                                            onClick={() => setShowResults(false)}
                                        >
                                            <div className={styles.resultAvatar}>
                                                {group.type === 'Influencers' ? 'I' : group.type === 'Clients' ? 'C' : 'P'}
                                            </div>
                                            <div className={styles.resultInfo}>
                                                <span className={styles.resultName}>{(item as unknown as Record<string, string>)[group.label]}</span>
                                                <span className={styles.resultMeta}>{(item as unknown as Record<string, string>)[group.sub]}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>No matching results found</div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.iconBtn}
                    aria-label="Notifications"
                    title="Notifications"
                    onClick={() => showToast("You have no new notifications.", "info")}
                >
                    <Bell size={20} />
                </button>

                <div className={styles.userMenu}>
                    <div className={styles.avatar}>
                        {user?.name?.[0] || 'A'}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.name || 'Admin'}</span>
                        <span className={styles.userRole}>{user?.role || 'Admin'}</span>
                    </div>
                </div>

                {/* LogOut button re-added based on original structure */}
                <button
                    onClick={async () => {
                        localStorage.removeItem('portal_client_id');
                        localStorage.removeItem('viral_access_token');
                        localStorage.removeItem('viral_access_type');
                        await signOut({ callbackUrl: '/' });
                    }}
                    className={clsx(styles.iconBtn, styles.btnLogout)}
                    aria-label="Logout"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
