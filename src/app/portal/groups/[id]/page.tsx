'use client';

import { use, useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { CampaignGroup, Campaign, Influencer } from '@/lib/types';
import { dataStore } from '@/lib/store';
import styles from './portal-group.module.css';
import clsx from 'clsx';

export default function PortalGroupDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [group, setGroup] = useState<CampaignGroup | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [allInfluencers, setAllInfluencers] = useState<Influencer[]>([]);

    useEffect(() => {
        Promise.resolve().then(() => {
            const g = dataStore.getGroups().find(groupOpt => groupOpt.id === id);
            if (g) {
                setGroup(g);
                // Fetch only relevant campaigns
                const allCamps = dataStore.getCampaigns();
                const groupCamps = allCamps.filter(c => g.campaignIds.includes(c.id));
                setCampaigns(groupCamps);
                setAllInfluencers(dataStore.getInfluencers());
            }
        });
    }, [id]);

    if (!group) return <div className={styles.loading}>Loading shared view...</div>;

    const getInfluencerDetails = (infId: string) => allInfluencers.find(i => i.id === infId);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <div className={styles.badge}>Shared Campaign Group</div>
                    <h1 className={styles.title}>{group.title}</h1>
                    {group.description && <p className={styles.description}>{group.description}</p>}
                </div>
                <div className={styles.date}>
                    Shared on {new Date(group.createdAt).toLocaleDateString()}
                </div>
            </header>

            <div className={styles.content}>
                {campaigns.map(camp => (
                    <div key={camp.id} className={styles.campaignSection}>
                        <div className={styles.campHeader}>
                            <h2 className={styles.campTitle}>{camp.title}</h2>
                            <div className={styles.campMeta}>
                                <span>{camp.status}</span>
                                <span>•</span>
                                <span>{camp.platformFocus.join(', ')}</span>
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Creator</th>
                                        <th>Platform</th>
                                        <th>Status</th>
                                        <th>Content</th>
                                        <th>Date</th>
                                        <th className={styles.costHeader}>Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {camp.influencers?.map(ref => {
                                        const inf = getInfluencerDetails(ref.influencerId);
                                        return (
                                            <tr key={ref.influencerId}>
                                                <td>
                                                    <div className={styles.influencerCell}>
                                                        <div className={styles.avatar}>{inf?.name[0]}</div>
                                                        <div>
                                                            <div className={styles.name}>{inf?.name}</div>
                                                            <div className={styles.handle}>{inf?.platforms[0]?.handle}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{inf?.platforms[0]?.platform}</td>
                                                <td>
                                                    <span className={clsx(styles.statusTag, styles[`status${ref.status.replace(/\s/g, '')}`])}>
                                                        {ref.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {ref.postLink ? (
                                                        <a href={ref.postLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                                            <ExternalLink size={14} /> View Post
                                                        </a>
                                                    ) : ref.draftLink ? (
                                                        <a href={ref.draftLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                                            <ExternalLink size={14} /> View Draft
                                                        </a>
                                                    ) : (
                                                        <span className={styles.muted}>-</span>
                                                    )}
                                                </td>
                                                <td>{ref.plannedDate ? new Date(ref.plannedDate).toLocaleDateString() : '-'}</td>
                                                <td className={styles.costCell}>
                                                    ${ref.clientFee?.toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!camp.influencers || camp.influencers.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className={styles.emptyTable}>No creators in this campaign yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
