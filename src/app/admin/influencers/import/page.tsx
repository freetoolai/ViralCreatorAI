'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';
import { dataStore } from '@/lib/store';
import { Influencer } from '@/lib/types';
import styles from './import.module.css';

export default function ImportPage() {
    const router = useRouter();
    const [csvContent, setCsvContent] = useState('');
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleParse = () => {
        setError('');
        setSuccess('');

        if (!csvContent.trim()) {
            setError('Please paste some CSV content first.');
            return;
        }

        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError(`Parse Error: ${results.errors[0].message}`);
                    return;
                }
                setPreview(results.data);
            },
            error: (err: Error) => {
                setError(`Error: ${err.message}`);
            }
        });
    };

    const handleImport = () => {
        const existingInfluencers = dataStore.getInfluencers();
        const existingEmails = new Set(existingInfluencers.map(i => i.email.toLowerCase()));

        const newInfluencers: Influencer[] = [];
        let duplicates = 0;
        let skipped = 0;

        preview.forEach((row: any, index) => {
            // Basic Validation
            if (!row.Name || !row.Email) {
                skipped++;
                return;
            }

            const normalizedEmail = row.Email.toLowerCase().trim();

            // Duplicate Check
            if (existingEmails.has(normalizedEmail)) {
                duplicates++;
                return;
            }

            // Map to Object
            newInfluencers.push({
                id: `imported-${Date.now()}-${index}`,
                name: row.Name,
                email: row.Email, // Keep original casing for display
                phone: row.Phone,
                shippingAddress: row.Address,
                internalNotes: row.Notes,
                primaryNiche: row.Niche || 'General',
                secondaryNiches: [],
                tier: (row.Tier as any) || 'Micro',
                platforms: [
                    {
                        platform: (row.Platform as any) || 'Instagram',
                        handle: row.Handle || '',
                        link: row.Link || '',
                        followers: parseInt(row.Followers) || 0,
                        price: parseInt(row.Price) || 0
                    }
                ]
            });

            // Add to set to prevent duplicates within the same CSV
            existingEmails.add(normalizedEmail);
        });

        if (newInfluencers.length > 0) {
            dataStore.addInfluencers(newInfluencers);
            setSuccess(`Successfully imported ${newInfluencers.length} influencers. (Skipped: ${duplicates} duplicates, ${skipped} invalid)`);
            setTimeout(() => {
                router.push('/admin/influencers');
            }, 2500);
        } else {
            setError(`No valid new influencers found. (Duplicates: ${duplicates}, Invalid: ${skipped})`);
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/admin/influencers" className={styles.backLink}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to List
            </Link>

            <h1 className={styles.title}>Import Influencers</h1>
            <p className={styles.description}>
                Paste your CSV data below to bulk import creators.
                <br />
                <small className={styles.codeBlock}>Format: Name, Email, Tier, Niche, Handle, Link, Followers, Price</small>
            </p>

            <div className={`glass-panel ${styles.inputPanel}`}>
                <textarea
                    className={`input ${styles.textarea}`}
                    placeholder="Name,Email,Tier,Niche,Platform,Handle,Followers,Price,Phone,Address,Notes&#10;John Doe,john@gmail.com,Macro,Tech,YouTube,TechJohn,500000,5000,555-0123,123 Main St,Great for unboxings"
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                />

                <div className={styles.buttonGroup}>
                    <button className="btn btn-secondary" onClick={() => setPreview([])} disabled={preview.length === 0}>Clear</button>
                    <button className="btn btn-primary" onClick={handleParse}>
                        <Upload size={18} style={{ marginRight: '0.5rem' }} />
                        Preview Data
                    </button>
                </div>
            </div>

            {error && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                    <AlertCircle size={20} className={styles.alertIcon} />
                    {error}
                </div>
            )}

            {success && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                    <CheckCircle size={20} className={styles.alertIcon} />
                    {success}
                </div>
            )}

            {preview.length > 0 && !success && (
                <div className={styles.previewSection}>
                    <h3 className={styles.previewTitle}>Preview ({preview.length} rows)</h3>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {Object.keys(preview[0]).map(header => (
                                        <th key={header}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className={`btn btn-primary ${styles.fullWidthBtn}`} onClick={handleImport}>
                        Confirm Import
                    </button>
                </div>
            )}
        </div>
    );
}
