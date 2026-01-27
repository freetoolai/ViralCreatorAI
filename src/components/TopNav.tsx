'use client';

import { useSession, signOut } from 'next-auth/react';
import { Search, Bell, LogOut } from 'lucide-react';
import clsx from 'clsx';
import styles from './TopNav.module.css';

export function TopNav() {
    const { data: session } = useSession();
    const user = session?.user as { name?: string; role?: string } | undefined;

    return (
        <header className={styles.header}>
            <div className={styles.searchContainer}>
                <Search size={16} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search influencers, campaigns..."
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.actions}>
                <button
                    className={clsx("btn btn-outline", styles.iconBtn)}
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <Bell size={20} />
                </button>

                <div className={styles.userMenu}>
                    <div className={styles.avatar}>
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.name || 'User'}</span>
                        <span className={styles.userRole}>{user?.role || 'Member'}</span>
                    </div>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className={clsx("btn btn-outline", styles.iconBtn, styles.btnLogout)}
                    aria-label="Sign Out"
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
