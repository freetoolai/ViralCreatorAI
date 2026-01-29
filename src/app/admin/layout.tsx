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
