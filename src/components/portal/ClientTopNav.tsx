'use client';

import { useState, useEffect } from 'react';
import { Sparkles, LogOut } from 'lucide-react';
import { dataStore } from '@/lib/store';
import styles from './ClientTopNav.module.css';

export function ClientTopNav({ clientName: propClientName }: { clientName?: string }) {
    const [fetchedClientName, setFetchedClientName] = useState<string | null>(null);

    useEffect(() => {
        if (propClientName) return;

        const fetchClient = async () => {
            const clientId = typeof window !== 'undefined' ? localStorage.getItem('portal_client_id') : null;
            if (clientId) {
                try {
                    const clients = await dataStore.getClients();
                    const client = clients.find(c => c.id === clientId);
                    if (client) {
                        setFetchedClientName(client.companyName);
                    }
                } catch (err) {
                    console.error("Failed to fetch client for nav:", err);
                }
            }
        };
        fetchClient();
    }, [propClientName]);

    const displayedName = propClientName || fetchedClientName || 'Guest Client';

    const handleLogout = () => {
        localStorage.removeItem('viral_access_token');
        localStorage.removeItem('viral_access_type');
        localStorage.removeItem('viral_client_id');
        localStorage.removeItem('portal_client_id');
        window.location.href = '/portal';
    };

    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <div className={styles.logoContainer}>
                    <Sparkles size={16} fill="currentColor" />
                </div>
                <span>Viral<span className={styles.brandAccent}>CreatorAI</span></span>
            </div>

            <div className={styles.actions}>
                <div className={styles.profile}>
                    <div className={styles.profileInfo}>
                        <div className={styles.clientName}>{displayedName}</div>
                        <div className={styles.role}>Viewer Access</div>
                    </div>
                </div>
                <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                    title="Logout"
                    aria-label="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}
