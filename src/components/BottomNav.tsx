'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCircle, Briefcase, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';
import clsx from 'clsx';

const navItems = [
    { name: 'Home', href: '/admin', icon: LayoutDashboard },
    { name: 'Talent', href: '/admin/influencers', icon: Users },
    { name: 'Clients', href: '/admin/clients', icon: UserCircle },
    { name: 'Campaigns', href: '/admin/campaigns', icon: Briefcase },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function BottomNav() {
    const pathname = usePathname();

    // Only show for admin routes
    if (!pathname?.startsWith('/admin')) return null;

    return (
        <nav className={styles.bottomNav}>
            {navItems.map((item) => {
                const isActive = pathname === item.href;
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
