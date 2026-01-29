'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCircle, Briefcase, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';
import clsx from 'clsx';

const adminItems = [
    { name: 'Home', href: '/admin', icon: LayoutDashboard },
    { name: 'Talent', href: '/admin/influencers', icon: Users },
    { name: 'Clients', href: '/admin/clients', icon: UserCircle },
    { name: 'Campaigns', href: '/admin/campaigns', icon: Briefcase },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const portalItems = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/portal/campaigns', icon: Briefcase },
    { name: 'Groups', href: '/portal/groups', icon: Users },
];

export function BottomNav() {
    const pathname = usePathname();

    const isAdmin = pathname?.startsWith('/admin');
    const isPortal = pathname?.startsWith('/portal');

    if (!isAdmin && !isPortal) return null;

    const navItems = isAdmin ? adminItems : portalItems;

    return (
        <nav className={styles.bottomNav}>
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/portal/dashboard' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(styles.navItem, isActive && styles.active)}
                    >
                        <div className={styles.iconWrapper}>
                            <Icon size={20} />
                        </div>
                        <span>{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
