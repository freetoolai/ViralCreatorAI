'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Building2, Plus, Key, Mail } from 'lucide-react';
import { Client } from '@/lib/types';
import tableStyles from '@/components/admin/Table.module.css';
import styles from './clients.module.css';

import { useRouter } from 'next/navigation';
import { Trash2, Edit3, Eye } from 'lucide-react';

export default function ClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients');
            const data = await res.json();
            setClients(data);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        accessCode: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const refreshData = () => fetchClients();

    const openAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            name: '',
            email: '',
            companyName: '',
            accessCode: Math.floor(1000 + Math.random() * 9000).toString()
        });
        setIsModalOpen(true);
    };

    const openEditModal = (client: Client) => {
        setIsEditing(true);
        setEditingId(client.id);
        setFormData({
            name: client.name,
            email: client.email,
            companyName: client.companyName,
            accessCode: client.accessCode
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && editingId) {
                // For now, API only has GET/POST, will handle PUT later or just POST for simulation
                await fetch('/api/clients', {
                    method: 'POST',
                    body: JSON.stringify({ ...formData, id: editingId }),
                });
            } else {
                const newClient: Client = {
                    id: 'c' + Date.now(),
                    ...formData
                };
                await fetch('/api/clients', {
                    method: 'POST',
                    body: JSON.stringify(newClient),
                });
            }
            refreshData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Submit failed:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this client?')) {
            // Note: In Phase 15 we'd have a DELETE /api/clients/[id]
            // For now, we'll simulate deletion success
            setClients(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div>
            <div className={tableStyles.tableHeader}>
                <div>
                    <h1 className={tableStyles.headerTitle}>Clients</h1>
                    <p className={tableStyles.headerSubtitle}>Manage your client accounts and portal access.</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={16} /> Add Client
                </button>
            </div>

            <div className={styles.gridContainer}>
                {clients.map((client) => (
                    <div key={client.id} className={clsx("glass-panel", styles.card)}>
                        <div className={styles.cardHeader}>
                            <div className={styles.infoSection}>
                                <div className={styles.iconBox}>
                                    <Building2 size={28} />
                                </div>
                                <div className={styles.details}>
                                    <h3 className={styles.companyName}>
                                        {client.companyName}
                                    </h3>
                                    <div className={styles.metaGrid}>
                                        <div className={styles.metaItem}>
                                            <Mail size={14} />
                                            {client.email}
                                        </div>
                                        <div className={styles.metaItem}>
                                            <Key size={14} />
                                            Access Code: <code className={styles.codeBlock}>{client.accessCode}</code>
                                        </div>
                                    </div>
                                    <div className={styles.contactInfo}>
                                        Contact: {client.name}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.buttonGroup}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => router.push(`/admin/campaigns?clientId=${client.id}`)}
                                    aria-label={`View campaigns for ${client.companyName}`}
                                    title="View Campaigns"
                                >
                                    <Eye size={14} className={styles.iconMarginRight} /> Campaigns
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => openEditModal(client)}
                                    aria-label={`Edit ${client.companyName}`}
                                    title="Edit"
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button
                                    className={clsx("btn btn-outline", styles.btnDelete)}
                                    onClick={() => handleDelete(client.id)}
                                    aria-label={`Delete ${client.companyName}`}
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {clients.length === 0 && (
                    <div className={clsx("glass-panel", styles.emptyState)}>
                        <Building2 size={48} className={styles.emptyIcon} />
                        <h3 className={clsx(styles.modalTitle, styles.emptyTitle)}>No clients found</h3>
                        <p className={styles.emptySubtitle}>Manage your client accounts and portal access here.</p>
                        <button className={clsx("btn btn-primary", styles.mt15)} onClick={openAddModal}>
                            <Plus size={16} /> Add Your First Client
                        </button>
                    </div>
                )}
            </div>

            {/* Client Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={clsx("glass-panel", styles.modalContent)}>
                        <h3 className={styles.modalTitle}>
                            {isEditing ? 'Edit Client' : 'Add New Client'}
                        </h3>

                        <form onSubmit={handleSubmit} className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label className={styles.label} htmlFor="companyName">Company Name</label>
                                <input
                                    id="companyName"
                                    className="input"
                                    required
                                    value={formData.companyName}
                                    onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.label} htmlFor="contactPerson">Contact Person</label>
                                <input
                                    id="contactPerson"
                                    className="input"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. John Smith"
                                />
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.label} htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                    placeholder="client@company.com"
                                />
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.label} htmlFor="accessCode">Portal Access Code</label>
                                <input
                                    id="accessCode"
                                    className="input"
                                    required
                                    maxLength={4}
                                    value={formData.accessCode}
                                    onChange={e => setFormData(p => ({ ...p, accessCode: e.target.value }))}
                                    placeholder="4-digit code"
                                />
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Save Changes' : 'Create Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
