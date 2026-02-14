'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Users, UserCircle, Briefcase, Settings, LogOut, Search, Folder } from 'lucide-react';
import clsx from 'clsx';
import styles from './Sidebar.module.css';
import { SearchModal } from './SearchModal';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Influencers', href: '/admin/influencers', icon: Users },
    { name: 'Clients', href: '/admin/clients', icon: UserCircle },
    { name: 'Campaigns', href: '/admin/campaigns', icon: Briefcase },
    { name: 'Campaign Groups', href: '/admin/groups', icon: Folder },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleLogout = async () => {
        // Clear all session and access related localStorage keys
        const keysToRemove = [
            'viral_access_token',
            'viral_access_type',
            'viral_client_id',
            'portal_client_id',
            'viral_portal_client_id'
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));

        await signOut({ redirect: true, callbackUrl: '/' });
    };

    return (
        <>
            {/* Mobile Header - Merged TopNav + Sidebar Links Removed */}
            <div className={styles.mobileHeader}>
                <div className={styles.mobileLogo}>
                    <h2>Viral<span className={styles.logoHighlight}>CreatorAI</span></h2>
                </div>

                <div className={styles.mobileActions}>
                    <button className={styles.mobileIconBtn} aria-label="Search" onClick={() => setIsSearchOpen(true)}>
                        <Search size={20} />
                    </button>
                    <button className={styles.mobileIconBtn} aria-label="Logout" onClick={handleLogout}>
                        <LogOut size={20} />
                    </button>
                    <div className={styles.mobileAvatar}>A</div>
                </div>
            </div>

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />

            {/* Sidebar - Remains Desktop Only or Hidden on Mobile handled by CSS */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>Viral<span className={styles.logoHighlight}>CreatorAI</span></h2>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(styles.navItem, isActive && styles.active)}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.footer}>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
