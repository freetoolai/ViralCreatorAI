'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { CommandPalette } from '@/components/admin/CommandPalette';
import styles from './layout.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const isClient = typeof window !== 'undefined' && !!localStorage.getItem('portal_client_id');
        const hasAdminToken = typeof window !== 'undefined' && !!localStorage.getItem('viral_access_token');
        const isAdminType = typeof window !== 'undefined' && localStorage.getItem('viral_access_type') === 'admin';

        const authorized = !isClient || hasAdminToken || isAdminType;

        if (!authorized) {
            router.replace('/portal/dashboard');
        }

        // Use a microtask to avoid cascading render error
        Promise.resolve().then(() => {
            setIsAuthorized(authorized);
        });
    }, [router]);

    if (isAuthorized === null) return null;
    if (isAuthorized === false) return null;

    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
                <TopNav />
                <div className={styles.content}>
                    {children}
                </div>
                <BottomNav />
            </main>
            <CommandPalette />
        </div>
    );
}
