'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar, Plus, X, Search } from 'lucide-react';
import { Campaign, Influencer, CampaignInfluencerRef, InfluencerApprovalStatus } from '@/lib/types';
import { dataStore } from '@/lib/store';
import { useToast } from '@/components/ToastContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import styles from './detail.module.css';
import clsx from 'clsx';

const STATUS_OPTIONS: InfluencerApprovalStatus[] = [
    'Shortlisted', 'Client Review', 'Approved', 'Rejected',
    'Contract Sent', 'Contract Signed', 'Product Sent', 'Product Received',
    'Draft Under Review', 'Live', 'Paid'
];

export default function CampaignAdminDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { showToast } = useToast();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [allInfluencers, setAllInfluencers] = useState<Influencer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedForAdd, setSelectedForAdd] = useState<Set<string>>(new Set());
    const [modalSearch, setModalSearch] = useState('');

    // Deletion Modal State
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [influencerToDelete, setInfluencerToDelete] = useState<string | null>(null);

    const [financials, setFinancials] = useState({ totalPayout: 0, totalRevenue: 0, totalProfit: 0 });

    const loadData = useCallback(async () => {
        try {
            // Use dataStore via dynamic import for mock mode support
            const mod = await import('@/lib/store');

            const [camp, infs, fins] = await Promise.all([
                mod.dataStore.getCampaign(id),
                mod.dataStore.getInfluencers(),
                mod.dataStore.getCampaignFinancials(id)
            ]);

            if (camp) setCampaign({ ...camp });
            if (infs) setAllInfluencers(infs);
            if (fins) setFinancials(fins);
        } catch (error) {
            console.error("Failed to load campaign data:", error);
            showToast("Error loading campaign details.");
        }
    }, [id, showToast]);

    useEffect(() => {
        const init = async () => {
            await loadData();
        };
        init();
    }, [loadData]);


    const handleAddInfluencers = async () => {
        try {
            for (const infId of selectedForAdd) {
                await dataStore.addInfluencerToCampaign(id, infId);
            }
            const count = selectedForAdd.size;
            setIsModalOpen(false);
            setSelectedForAdd(new Set());
            await loadData();
            showToast(`Successfully added ${count} talent to campaign`);
        } catch (error) {
            console.error("Failed to add influencers:", error);
            showToast("Error adding influencers to campaign.");
        }
    };

    const handleUpdateInfluencer = async (infId: string, field: keyof CampaignInfluencerRef, value: string | number | boolean) => {
        try {
            await dataStore.updateInfluencerInCampaign(id, infId, { [field]: value });
            await loadData();
            if (field === 'status') {
                showToast(`Status updated to ${value}`);
            }
        } catch (error) {
            console.error("Failed to update influencer:", error);
            showToast("Error updating talent info.");
        }
    };

    const triggerDelete = (infId: string) => {
        setInfluencerToDelete(infId);
        setIsConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (influencerToDelete) {
            try {
                await dataStore.removeInfluencerFromCampaign(id, influencerToDelete);
                setIsConfirmDeleteOpen(false);
                setInfluencerToDelete(null);
                await loadData();
                showToast("Talent removed from campaign");
            } catch (error) {
                console.error("Failed to remove influencer:", error);
                showToast("Error removing talent from campaign.");
            }
        }
    };

    const toggleSelect = (selectedId: string) => {
        const newSet = new Set(selectedForAdd);
        if (newSet.has(selectedId)) newSet.delete(selectedId);
        else newSet.add(selectedId);
        setSelectedForAdd(newSet);
    };

    if (!campaign) return <div className="container">Loading...</div>;

    const availableInfluencers = allInfluencers.filter((inf: Influencer) =>
        !campaign.influencers?.some((existing: CampaignInfluencerRef) => existing.influencerId === inf.id)
    );

    const filteredModalInfluencers = availableInfluencers.filter((inf: Influencer) =>
        inf.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        inf.primaryNiche.toLowerCase().includes(modalSearch.toLowerCase())
    );

    const getInfluencerDetails = (id: string) => allInfluencers.find(i => i.id === id);

    return (
        <div className={styles.container}>
            <Link href="/admin/campaigns" className={styles.backLinkWrap}>
                <ArrowLeft size={16} /> Back to Campaigns
            </Link>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{campaign.title}</h1>
                    <div className={styles.meta}>
                        <div className={styles.metaItem}><Users size={16} /> Client ID: {campaign.clientId}</div>
                        <div className={styles.metaItem}><Calendar size={16} /> Created: {new Date(campaign.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Receivable</div>
                        <div className={styles.statValue}>${financials.totalRevenue.toLocaleString()}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Payout</div>
                        <div className={styles.statValue}>${financials.totalPayout.toLocaleString()}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Profit</div>
                        <div className={clsx(styles.statValue, financials.totalProfit >= 0 ? styles.positiveProfit : styles.negativeProfit)}>
                            ${financials.totalProfit.toLocaleString()}
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Campaign Roster ({campaign.influencers?.length || 0})</h2>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} aria-label="Add Creators to Campaign">
                    <Plus size={16} /> Add Creators
                </button>
            </div>

            {/* Mobile View */}
            <div className={styles.mobileCardsView}>
                {campaign.influencers?.map((ref) => {
                    const inf = getInfluencerDetails(ref.influencerId);
                    const profit = (Number(ref.clientFee) || 0) - (Number(ref.influencerFee) || 0);
                    return (
                        <div key={ref.influencerId} className={styles.mobileDataCard}>
                            <div className={styles.mobileDataCardHeader}>
                                <div className={styles.influencerCell}>
                                    <div className={styles.avatar}>{inf?.name[0]}</div>
                                    <div>
                                        <span className={styles.cellName}>{inf?.name}</span>
                                        <span className={styles.cellHandle}>{inf?.platforms[0]?.handle}</span>
                                    </div>
                                </div>
                                <select
                                    className={clsx(styles.statusSelect, styles[`status${ref.status.replace(/\s/g, '')}`] || styles.statusShortlisted)}
                                    value={ref.status}
                                    onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'status', e.target.value)}
                                    title="Campaign Status"
                                >
                                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div className={styles.mobileDataGrid}>
                                <div className={styles.mobileDataItem}>
                                    <span className={styles.mobileItemLabel}>Date</span>
                                    <input
                                        type="date"
                                        value={ref.plannedDate || ''}
                                        onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'plannedDate', e.target.value)}
                                        className={styles.mobileInput}
                                        title="Planned Date"
                                    />
                                </div>
                                <div className={styles.mobileDataItem}>
                                    <span className={styles.mobileItemLabel}>Product</span>
                                    <button
                                        className={clsx(styles.toggleBtn, ref.productAccess && styles.toggleBtnActive)}
                                        onClick={() => handleUpdateInfluencer(ref.influencerId, 'productAccess', !ref.productAccess)}
                                        title="Toggle Product Access"
                                        aria-label="Toggle Product Access"
                                    >
                                        <div className={styles.toggleHandle} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.mobileDataLinks}>
                                <input
                                    type="text"
                                    placeholder="Draft Link..."
                                    value={ref.draftLink || ''}
                                    onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'draftLink', e.target.value)}
                                    className={styles.editableInput}
                                    title="Draft Link"
                                />
                                <input
                                    type="text"
                                    placeholder="Live Link..."
                                    value={ref.postLink || ''}
                                    onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'postLink', e.target.value)}
                                    className={styles.editableInput}
                                    title="Live Link"
                                />
                            </div>

                            <div className={styles.mobileDataFinancials}>
                                <div>
                                    <span className={styles.mobileItemLabel}>Payout</span>
                                    <input
                                        type="number"
                                        value={ref.influencerFee ?? 0}
                                        onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'influencerFee', Number(e.target.value))}
                                        className={styles.editableInput}
                                        title="Influencer Fee"
                                    />
                                </div>
                                <div>
                                    <span className={styles.mobileItemLabel}>Charge</span>
                                    <input
                                        type="number"
                                        value={ref.clientFee ?? 0}
                                        onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'clientFee', Number(e.target.value))}
                                        className={styles.editableInput}
                                        title="Client Fee"
                                    />
                                </div>
                                <div className={styles.alignRight}>
                                    <span className={styles.mobileItemLabel}>Profit</span>
                                    <div className={clsx(styles.profitCell, profit >= 0 ? styles.positiveProfit : styles.negativeProfit)}>
                                        ${profit.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <button
                                className={styles.floatingRemoveBtn}
                                onClick={() => triggerDelete(ref.influencerId)}
                                title="Remove talent"
                                aria-label="Remove talent from campaign"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Table View */}
            <div className={clsx(styles.tableWrapper, styles.desktopTableView)}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.colInfluencer}>Influencer</th>
                            <th>Status</th>
                            <th>Product</th>
                            <th>Draft</th>
                            <th>Date</th>
                            <th>Post</th>
                            <th className={styles.alignRight}>Payout</th>
                            <th className={styles.alignRight}>Charge</th>
                            <th className={styles.alignRight}>Profit</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaign.influencers?.map((ref) => {
                            const inf = getInfluencerDetails(ref.influencerId);
                            const profit = (Number(ref.clientFee) || 0) - (Number(ref.influencerFee) || 0);

                            return (
                                <tr key={ref.influencerId}>
                                    <td>
                                        <div className={styles.influencerCell}>
                                            <div className={styles.avatar}>{inf?.name[0]}</div>
                                            <div>
                                                <span className={styles.cellName}>{inf?.name}</span>
                                                <span className={styles.cellHandle}>{inf?.platforms[0]?.handle}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            className={clsx(styles.statusSelect, styles[`status${ref.status.replace(/\s/g, '')}`] || styles.statusShortlisted)}
                                            value={ref.status}
                                            onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'status', e.target.value)}
                                            title="Campaign Status"
                                        >
                                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className={clsx(styles.toggleBtn, ref.productAccess && styles.toggleBtnActive)}
                                            onClick={() => handleUpdateInfluencer(ref.influencerId, 'productAccess', !ref.productAccess)}
                                            title="Toggle Product Access"
                                            aria-label="Toggle Product Access"
                                        >
                                            <div className={styles.toggleHandle} />
                                        </button>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className={styles.editableInput}
                                            placeholder="Link..."
                                            value={ref.draftLink || ''}
                                            onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'draftLink', e.target.value)}
                                            title="Draft Link"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            className={clsx(styles.editableInput, styles.dateInput)}
                                            value={ref.plannedDate || ''}
                                            onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'plannedDate', e.target.value)}
                                            title="Planned Date"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className={styles.editableInput}
                                            placeholder="Link..."
                                            value={ref.postLink || ''}
                                            onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'postLink', e.target.value)}
                                            title="Post Link"
                                        />
                                    </td>
                                    <td className={styles.alignRight}>
                                        <input
                                            type="number"
                                            className={clsx(styles.editableInput, styles.moneyInput)}
                                            value={ref.influencerFee ?? 0}
                                            onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'influencerFee', Number(e.target.value))}
                                            title="Influencer Fee"
                                        />
                                    </td>
                                    <td className={styles.alignRight}>
                                        <input
                                            type="number"
                                            className={clsx(styles.editableInput, styles.moneyInput)}
                                            value={ref.clientFee ?? 0}
                                            onChange={(e) => handleUpdateInfluencer(ref.influencerId, 'clientFee', Number(e.target.value))}
                                            title="Client Charge"
                                        />
                                    </td>
                                    <td className={clsx(styles.profitCell, profit >= 0 ? styles.positiveProfit : styles.negativeProfit)}>
                                        ${profit.toLocaleString()}
                                    </td>
                                    <td>
                                        <button
                                            className={styles.closeButton}
                                            onClick={() => triggerDelete(ref.influencerId)}
                                            title="Remove from campaign"
                                            aria-label="Remove from campaign"
                                        >
                                            <X size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {(!campaign.influencers || campaign.influencers.length === 0) && (
                            <tr>
                                <td colSpan={10} className={styles.emptyState}>
                                    No creators added to this campaign yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {isModalOpen && (
                <div role="dialog" aria-modal="true" className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Add Creators</h3>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeButton} aria-label="Close modal"><X size={20} /></button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.searchWrapper}>
                                <Search size={16} className={styles.modalSearchIcon} />
                                <input
                                    type="text"
                                    className={styles.modalSearchInput}
                                    placeholder="Search talent..."
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                    title="Search talent"
                                />
                            </div>

                            <div className={styles.resultsList}>
                                {filteredModalInfluencers.map((inf: Influencer) => (
                                    <div key={inf.id} className={styles.influencerRow} onClick={() => toggleSelect(inf.id)}>
                                        <div className={styles.influencerInfoFix}>
                                            <div className={styles.avatarSmall}>{inf.name[0]}</div>
                                            <div>
                                                <div className={styles.influencerName}>{inf.name}</div>
                                                <div className={styles.influencerMeta}>{inf.primaryNiche} • {inf.tier}</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedForAdd.has(inf.id)}
                                            readOnly
                                            className={styles.checkbox}
                                            aria-label={`Select ${inf.name}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddInfluencers} disabled={selectedForAdd.size === 0}>
                                Add {selectedForAdd.size} Creators
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                title="Remove from Campaign?"
                message="Are you sure you want to remove this talent from the campaign? This cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setIsConfirmDeleteOpen(false)}
            />
        </div>
    );
}
