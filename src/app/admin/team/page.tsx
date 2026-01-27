'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Mail, Shield } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { User } from '@/lib/types';

export default function TeamPage() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        setUsers(dataStore.getUsers());
    }, []);

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin': return '#007AFF';
            case 'Campaign Manager': return '#34C759';
            default: return '#6E6E73';
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Team</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>Manage your team members and permissions.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Member
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'hsl(var(--muted))' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>MEMBER</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>ROLE</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>STATUS</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', border: '1px solid var(--border)' }}>
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Mail size={12} /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        background: `${getRoleBadgeColor(user.role)}15`,
                                        color: getRoleBadgeColor(user.role),
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Shield size={12} /> {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        background: '#34C75915',
                                        color: '#34C759'
                                    }}>
                                        Active
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                        <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>No team members found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
