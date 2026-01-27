'use client';

import { Settings as SettingsIcon, Bell, Lock, Palette, Database } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Settings</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Manage your application preferences and configuration.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px' }}>
                {/* General Settings */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: '#007AFF15',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <SettingsIcon size={20} style={{ color: '#007AFF' }} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>General</h3>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Basic application settings</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                Company Name
                            </label>
                            <input
                                type="text"
                                className="input"
                                defaultValue="Your Agency Name"
                                placeholder="Enter company name"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                Contact Email
                            </label>
                            <input
                                type="email"
                                className="input"
                                defaultValue="contact@agency.com"
                                placeholder="Enter contact email"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: '#34C75915',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Bell size={20} style={{ color: '#34C759' }} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Notifications</h3>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Manage notification preferences</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {['New campaign approvals', 'Influencer updates', 'Client activity'].map((item) => (
                            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#007AFF' }} />
                                <span style={{ fontSize: '0.9rem' }}>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: '#FF9F0A15',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Lock size={20} style={{ color: '#FF9F0A' }} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Security</h3>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Password and access control</p>
                        </div>
                    </div>

                    <button className="btn btn-outline" style={{ width: '100%' }}>
                        Change Password
                    </button>
                </div>

                {/* Data Management */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: '#FF3B3015',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Database size={20} style={{ color: '#FF3B30' }} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Data Management</h3>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Export and manage your data</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline" style={{ flex: 1 }}>
                            Export Data
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1, color: '#FF3B30', borderColor: 'rgba(255, 59, 48, 0.3)' }}>
                            Clear Cache
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem' }}>
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
