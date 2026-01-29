'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Users, Plus, Mail, Shield } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { User } from '@/lib/types';
import styles from './team.module.css';

export default function TeamPage() {
    const [users] = useState<User[]>(() => dataStore.getUsers());

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Team</h1>
                    <p className={styles.subtitle}>Manage your team members and permissions.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={16} className={styles.plusIcon} /> Add Member
                </button>
            </div>

            <div className={clsx("glass-panel", styles.tableWrapper)}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.tableHeaderRow}>
                            <th className={styles.tableHeaderCell}>MEMBER</th>
                            <th className={styles.tableHeaderCell}>ROLE</th>
                            <th className={styles.tableHeaderCell}>STATUS</th>
                            <th className={clsx(styles.tableHeaderCell, styles.textRight)}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className={styles.tableRow}>
                                <td className={styles.tableCell}>
                                    <div className={styles.memberCell}>
                                        <div className={styles.avatar}>
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <div className={styles.memberName}>{user.name}</div>
                                            <div className={styles.memberEmail}>
                                                <Mail size={12} /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.tableCell}>
                                    <span
                                        className={clsx(styles.roleBadge, user.role === 'Admin' ? styles.roleAdmin : styles.roleManager)}
                                    >
                                        <Shield size={12} /> {user.role}
                                    </span>
                                </td>
                                <td className={styles.tableCell}>
                                    <span className={clsx(styles.badge, styles.activeBadge)}>
                                        Active
                                    </span>
                                </td>
                                <td className={clsx(styles.tableCell, styles.textRight)}>
                                    <button className={clsx("btn btn-outline", styles.editBtn)}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Users size={48} />
                        </div>
                        <p>No team members found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
