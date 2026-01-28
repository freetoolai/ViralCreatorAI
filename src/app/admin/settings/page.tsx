'use client';

import { Settings as SettingsIcon, Bell, Lock, Palette, Database } from 'lucide-react';
import clsx from 'clsx';
import styles from './settings.module.css';

export default function SettingsPage() {
    return (
        <div>
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
                                defaultValue="Your Agency Name"
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
                                defaultValue="contact@agency.com"
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
                        {['New campaign approvals', 'Influencer updates', 'Client activity'].map((item) => (
                            <label key={item} className={styles.checkboxLabel}>
                                <input type="checkbox" defaultChecked className={styles.checkbox} />
                                <span className={styles.checkboxText}>{item}</span>
                            </label>
                        ))}
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

                    <button className={clsx("btn btn-outline", styles.fullWidth)}>
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
                        <button className={clsx("btn btn-outline", styles.flex1)}>
                            Export Data
                        </button>
                        <button className={clsx("btn btn-outline", styles.flex1, styles.destructBtn)}>
                            Clear Cache
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className={styles.footerActions}>
                    <button className="btn btn-secondary">
                        Cancel
                    </button>
                    <button className="btn btn-primary">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
