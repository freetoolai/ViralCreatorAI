'use client';

import { Sparkles } from 'lucide-react';
import styles from './ClientTopNav.module.css';

export function ClientTopNav({ clientName }: { clientName?: string }) {
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
                        <div className={styles.clientName}>{clientName || 'Guest Client'}</div>
                        <div className={styles.role}>Viewer Access</div>
                    </div>
                    <div className={styles.avatar}>
                        {clientName?.[0] || 'C'}
                    </div>
                </div>
            </div>
        </header>
    );
}
