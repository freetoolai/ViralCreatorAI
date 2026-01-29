import { Sparkles, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from './ClientTopNav.module.css';

export function ClientTopNav({ clientName }: { clientName?: string }) {
    const handleLogout = async () => {
        localStorage.removeItem('viral_access_token');
        localStorage.removeItem('viral_access_type');
        localStorage.removeItem('viral_client_id');
        localStorage.removeItem('portal_client_id');
        await signOut({ redirect: true, callbackUrl: '/' });
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
                        <div className={styles.clientName}>{clientName || 'Guest Client'}</div>
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
