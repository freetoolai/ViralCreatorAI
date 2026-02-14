'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Database, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { dataStore } from '@/lib/store';
import { useToast } from '@/components/ToastContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import styles from './settings.module.css';

export default function SettingsPage() {
    const { showToast } = useToast();
    const [companyName, setCompanyName] = useState('ViralCreatorAI');
    const [email, setEmail] = useState('admin@viralcreatorai.io');
    const [notifications, setNotifications] = useState({
        approvals: true,
        updates: true,
        activity: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('viral_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCompanyName(parsed.companyName || 'ViralCreatorAI');
                setEmail(parsed.email || 'admin@viralcreatorai.io');
                setNotifications(parsed.notifications || {
                    approvals: true,
                    updates: true,
                    activity: false
                });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            const settings = { companyName, email, notifications };
            localStorage.setItem('viral_settings', JSON.stringify(settings));
            setIsLoading(false);
            showToast("Settings saved successfully!");
        }, 800);
    };

    const handleClearDataConfirm = async () => {
        try {
            setIsLoading(true);
            await dataStore.purgeAllData();
            localStorage.clear();
            showToast("All data cleared successfully.");
            window.location.reload();
        } catch (error) {
            console.error("Purge failed:", error);
            showToast("Failed to clear database.", "error");
        } finally {
            setIsLoading(false);
            setShowClearModal(false);
        }
    };

    const handleExport = () => {
        const exportData = {
            influencers: JSON.parse(localStorage.getItem('data_store_influencers') || '[]'),
            clients: JSON.parse(localStorage.getItem('data_store_clients') || '[]'),
            campaigns: JSON.parse(localStorage.getItem('data_store_campaigns') || '[]'),
            groups: JSON.parse(localStorage.getItem('data_store_groups') || '[]'),
            settings: JSON.parse(localStorage.getItem('viral_settings') || '{}'),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `viral_creator_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSync = async () => {
        const { syncToSupabase } = await import('@/lib/sync-tool');
        try {
            setIsLoading(true);
            const stats = await syncToSupabase();
            showToast(`Sync complete! Migrated: ${stats.influencers} influencers, ${stats.clients} clients.`, "success");
            if (stats.errors.length > 0) {
                console.warn("Sync warnings:", stats.errors);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error("Sync failed:", error);
            showToast("Sync failed: " + message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in">
            <div className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Manage your application preferences and configuration.</p>
            </div>

            <div className={styles.grid}>
                {/* General Settings */}
                <div className={clsx("glass-panel", styles.section)}>
                    <div className={styles.sectionHeader}>
                        <div className={clsx(styles.iconWrapper, styles.iconGeneral)}>
                            <SettingsIcon size={20} />
                        </div>
                        <div>
                            <h3 className={styles.sectionTitle}>General</h3>
                            <p className={styles.sectionSubtitle}>Basic application settings</p>
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <div>
                            <label className={styles.label}>
                                Company Name
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Enter company name"
                                aria-label="Company Name"
                            />
                        </div>
                        <div>
                            <label className={styles.label}>
                                Contact Email
                            </label>
                            <input
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter contact email"
                                aria-label="Contact Email"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className={clsx("glass-panel", styles.section)}>
                    <div className={styles.sectionHeader}>
                        <div className={clsx(styles.iconWrapper, styles.iconNotify)}>
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className={styles.sectionTitle}>Notifications</h3>
                            <p className={styles.sectionSubtitle}>Manage notification preferences</p>
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={notifications.approvals}
                                onChange={(e) => setNotifications({ ...notifications, approvals: e.target.checked })}
                                className={styles.checkbox}
                            />
                            <span className={styles.checkboxText}>New campaign approvals</span>
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={notifications.updates}
                                onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })}
                                className={styles.checkbox}
                            />
                            <span className={styles.checkboxText}>Influencer updates</span>
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={notifications.activity}
                                onChange={(e) => setNotifications({ ...notifications, activity: e.target.checked })}
                                className={styles.checkbox}
                            />
                            <span className={styles.checkboxText}>Client activity</span>
                        </label>
                    </div>
                </div>

                {/* Security */}
                <div className={clsx("glass-panel", styles.section)}>
                    <div className={styles.sectionHeader}>
                        <div className={clsx(styles.iconWrapper, styles.iconSecurity)}>
                            <Lock size={20} />
                        </div>
                        <div>
                            <h3 className={styles.sectionTitle}>Security</h3>
                            <p className={styles.sectionSubtitle}>Password and access control</p>
                        </div>
                    </div>

                    <button
                        className={clsx("btn btn-outline", styles.fullWidth)}
                        onClick={() => showToast("Password reset link sent to your email.", "info")}
                    >
                        Change Password
                    </button>
                </div>

                {/* Data Management */}
                <div className={clsx("glass-panel", styles.section)}>
                    <div className={styles.sectionHeader}>
                        <div className={clsx(styles.iconWrapper, styles.iconData)}>
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className={styles.sectionTitle}>Data Management</h3>
                            <p className={styles.sectionSubtitle}>Export and manage your data</p>
                        </div>
                    </div>

                    <div className={styles.flexRow}>
                        <button className={clsx("btn btn-outline", styles.flex1)} onClick={handleExport}>
                            Export Data
                        </button>
                        <button
                            className={clsx("btn btn-primary", styles.flex1, isLoading && "loading")}
                            onClick={handleSync}
                            disabled={isLoading}
                        >
                            <Database size={14} style={{ marginRight: '8px' }} />
                            Sync to Cloud
                        </button>
                        <button className={clsx("btn btn-outline", styles.flex1, styles.destructBtn)} onClick={() => setShowClearModal(true)}>
                            <RotateCcw size={14} style={{ marginRight: '8px' }} />
                            Clear Local
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className={styles.footerActions}>
                    <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                        Cancel
                    </button>
                    <button
                        className={clsx("btn btn-primary", isLoading && "loading")}
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showClearModal}
                title="Purge Database"
                message="Are you sure you want to PERMANENTLY delete all data from the database? This cannot be undone."
                confirmLabel="Purge Data"
                cancelLabel="Cancel"
                onConfirm={handleClearDataConfirm}
                onCancel={() => setShowClearModal(false)}
            />
        </div>
    );
}

