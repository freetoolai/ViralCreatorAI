'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Folder, Trash2, ExternalLink } from 'lucide-react';
import { CampaignGroup, Client, Campaign } from '@/lib/types';
import { dataStore } from '@/lib/store';
import styles from './groups.module.css';

export default function GroupsPage() {
    const [groups, setGroups] = useState<CampaignGroup[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [g, c, camp] = await Promise.all([
                    dataStore.getGroups(),
                    dataStore.getClients(),
                    dataStore.getCampaigns()
                ]);
                setGroups(g);
                setClients(c);
                setCampaigns(camp);
            } catch (error) {
                console.error("Failed to load groups:", error);
            }
        };
        fetchData();
    }, []);

    const getClientName = (id: string) => clients.find(c => c.id === id)?.companyName || 'Unknown Client';
    const getCampaignName = (id: string) => campaigns.find(c => c.id === id)?.title || id;

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this group?')) {
            try {
                await dataStore.deleteGroup(id);
                const updated = await dataStore.getGroups();
                setGroups(updated);
            } catch (error) {
                console.error("Failed to delete group:", error);
            }
        }
    };

    return (
        <div className="container">
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.title}>Campaign groups</h1>
                    <p className={styles.subtitle}>Curated collections shared with your clients.</p>
                </div>
                <Link href="/admin/groups/new" className="btn btn-primary">
                    <Plus size={16} /> New Group
                </Link>
            </div>

            <div className={styles.grid}>
                {groups.map(group => (
                    <div key={group.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.folderIcon}>
                                <Folder size={20} />
                            </div>
                            <div className={styles.actions}>
                                <button
                                    className={styles.iconBtn}
                                    onClick={() => handleDelete(group.id)}
                                    title="Delete Group"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className={styles.cardTitle}>{group.title}</h3>
                        <p className={styles.clientName}>{getClientName(group.clientId)}</p>

                        <div className={styles.campaignList}>
                            <span className={styles.label}>Campaigns included:</span>
                            <ul>
                                {group.campaignIds.map(cid => (
                                    <li key={cid}>{getCampaignName(cid)}</li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.cardFooter}>
                            <Link
                                href={`/portal/groups/${group.id}`}
                                className={styles.shareLink}
                                target="_blank"
                            >
                                <ExternalLink size={14} /> Open Client View
                            </Link>
                            <span className={styles.date}>
                                {new Date(group.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}

                {groups.length === 0 && (
                    <div className={styles.emptyState}>
                        <Folder size={48} />
                        <h3>No Groups Created</h3>
                        <p>Create a group to share multiple campaigns with a client.</p>
                        <Link href="/admin/groups/new" className="btn btn-primary">
                            Create First Group
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
