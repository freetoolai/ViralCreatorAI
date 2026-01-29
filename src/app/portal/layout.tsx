import { ClientTopNav } from '@/components/portal/ClientTopNav';
import { BottomNav } from '@/components/BottomNav';
import styles from './layout.module.css';

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout}>
            <ClientTopNav />
            <main className={styles.main}>
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
