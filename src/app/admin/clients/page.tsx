'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Eye, Key, Building2, Mail, Link as LinkIcon } from 'lucide-react';
import { Client } from '@/lib/types';
import { useToast } from '@/components/ToastContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import styles from './clients.module.css';

import { useRouter } from 'next/navigation';

export default function ClientsPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({
        isOpen: false,
        id: null
    });

    const handleShare = (client: Client) => {
        const portalUrl = `${window.location.origin}/portal?code=${client.accessCode}`;
        navigator.clipboard.writeText(portalUrl);
        showToast(`Access link copied for ${client.companyName}!`);
    };

    const fetchClients = useCallback(async () => {
        try {
            // Updated to use dataStore directly for mock mode compatibility
            const data = await import('@/lib/store').then(mod => mod.dataStore.getClients());
            setClients(data);
        } catch {
            showToast("Failed to fetch clients", "error");
        }
    }, [showToast]);
    // ... (rest of the component state)
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
    }, [fetchClients]);

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
            const { dataStore } = await import('@/lib/store');

            if (isEditing && editingId) {
                await dataStore.updateClient(editingId, formData);
                showToast("Client updated successfully");
            } else {
                const newClient: Client = {
                    id: 'c' + Date.now(),
                    ...formData
                };
                await dataStore.addClient(newClient);
                showToast("Client added successfully");
            }
            refreshData();
            setIsModalOpen(false);
        } catch {
            showToast("Operation failed", "error");
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete({ isOpen: true, id });
    };

    const executeDelete = async () => {
        if (confirmDelete.id) {
            try {
                // Assuming we use the same POST endpoint with a delete flag or a separate DELETE endpoint
                // Since I don't see a DELETE handler in the route yet, I'll update it or use a trick.
                // Wait, let's check the API route first.
                // If the API route doesn't support DELETE, I should add it.
                // For now, I'll call the API.
                await import('@/lib/store').then(mod => mod.dataStore.deleteClient(confirmDelete.id!));

                setClients(prev => prev.filter(c => c.id !== confirmDelete.id));
                setConfirmDelete({ isOpen: false, id: null });
                showToast("Client deleted permanently");
            } catch {
                showToast("Failed to delete client", "error");
            }
        }
    };

    return (
        <div className="container">
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.title}>Clients</h1>
                    <p className={styles.subtitle}>Manage your client accounts and portal access.</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={16} /> Add Client
                </button>
            </div>

            <div className={styles.gridContainer}>
                {clients.map((client) => (
                    <div key={client.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.infoSection}>
                                <div className={styles.details}>
                                    <h3 className={styles.companyName}>
                                        {client.companyName}
                                    </h3>
                                    <div className={styles.contactInfo}>
                                        Contact: {client.name}
                                    </div>
                                    <div className={styles.metaGrid}>
                                        <div className={styles.infoItem}>
                                            <Mail size={16} />
                                            {client.email}
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Key size={16} />
                                            Code: <span className={styles.codeBlock}>{client.accessCode}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.buttonGroup}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleShare(client)}
                                    title="Copy Access Link"
                                >
                                    <LinkIcon size={14} className={styles.iconMarginRight} /> Share
                                </button>
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
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    className="btn btn-outline"
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
                    <div className={styles.emptyState}>
                        <Building2 size={64} className={styles.emptyIcon} />
                        <h3 className={styles.modalTitle}>No clients found</h3>
                        <p>Manage your client accounts and portal access here.</p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <Plus size={16} /> Add Your First Client
                        </button>
                    </div>
                )}
            </div>

            {/* Client Modal */}
            {isModalOpen && (
                <div role="dialog" aria-modal="true" className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
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

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Delete Client"
                message="Are you sure you want to delete this client? This will remove all their portal access. This action cannot be undone."
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
            />
        </div>
    );
}
