'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, FileText, X } from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';
import { dataStore } from '@/lib/store';
import { Influencer, PlatformName, Tier } from '@/lib/types';
import { useToast } from '@/components/ToastContext';
import styles from './import.module.css';
import clsx from 'clsx';

interface CSVRow {
    Name?: string;
    Email?: string;
    Phone?: string;
    Address?: string;
    Notes?: string;
    Niche?: string;
    Tier?: string;
    Platform?: string;
    Handle?: string;
    Link?: string;
    Followers?: string;
    Price?: string;
}

export default function ImportPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [csvContent, setCsvContent] = useState('');
    const [preview, setPreview] = useState<CSVRow[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setIsParsing(false);
                if (results.errors.length > 0) {
                    showToast(`Error parsing file: ${results.errors[0].message}`, "error");
                    return;
                }
                setPreview(results.data as CSVRow[]);
                showToast(`File loaded: ${results.data.length} rows found`);
            },
            error: (err: Error) => {
                setIsParsing(false);
                showToast(`Failed to read file: ${err.message}`, "error");
            }
        });
    };

    const handleParseText = () => {
        if (!csvContent.trim()) {
            showToast('Please paste some CSV content first.', "error");
            return;
        }

        setIsParsing(true);
        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setIsParsing(false);
                if (results.errors.length > 0) {
                    showToast(`Parse Error: ${results.errors[0].message}`, "error");
                    return;
                }
                setPreview(results.data as CSVRow[]);
                showToast(`${results.data.length} rows parsed from text`);
            },
            error: (err: Error) => {
                setIsParsing(false);
                showToast(`Error: ${err.message}`, "error");
            }
        });
    };

    const handleImport = async () => {
        try {
            const existingInfluencers = await dataStore.getInfluencers();
            const existingEmails = new Set(existingInfluencers.map(i => i.email.toLowerCase()));

            const newInfluencers: Influencer[] = [];
            let duplicates = 0;

            preview.forEach((row: CSVRow, index: number) => {
                if (!row.Name || !row.Email) {
                    return;
                }

                const normalizedEmail = row.Email.toLowerCase().trim();

                if (existingEmails.has(normalizedEmail)) {
                    duplicates++;
                    return;
                }

                newInfluencers.push({
                    id: `imported-${Date.now()}-${index}`,
                    name: row.Name,
                    email: row.Email,
                    phone: row.Phone,
                    shippingAddress: row.Address,
                    internalNotes: row.Notes,
                    primaryNiche: row.Niche || 'General',
                    secondaryNiches: [],
                    tier: (row.Tier as Tier) || 'Micro',
                    platforms: [
                        {
                            platform: (row.Platform as PlatformName) || 'Instagram',
                            handle: row.Handle || '',
                            link: row.Link || '',
                            followers: parseInt(row.Followers || '0') || 0,
                            price: parseInt(row.Price || '0') || 0
                        }
                    ]
                });

                existingEmails.add(normalizedEmail);
            });

            if (newInfluencers.length > 0) {
                await dataStore.addInfluencers(newInfluencers);
                showToast(`Import Success: ${newInfluencers.length} added`);
                router.push('/admin/influencers');
            } else {
                showToast(`No new influencers added. ${duplicates} duplicates found.`, "error");
            }
        } catch (error) {
            console.error("Failed to import influencers:", error);
            showToast("Import failed. Please check your data format.", "error");
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/admin/influencers" className={styles.backLink}>
                <ArrowLeft size={16} className={styles.iconMargin} /> Back to List
            </Link>

            <h1 className={styles.title}>Bulk Import Talent</h1>
            <p className={styles.description}>
                Upload a CSV file or paste your data directly.
                <br />
                <small className={styles.codeBlock}>Required: Name, Email</small>
            </p>

            <div className={clsx("glass-panel", styles.importControls)}>
                <div className={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
                    <Upload size={32} className={styles.uploadIcon} />
                    <p>Click to upload CSV or Drag & Drop</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className={styles.hiddenInput}
                        aria-label="Upload CSV file"
                        title="Upload CSV"
                    />
                </div>

                <div className={styles.divider}>
                    <span>OR PASTE TEXT</span>
                </div>

                <textarea
                    className={clsx("input", styles.textarea)}
                    placeholder="Name,Email,Tier,Niche,Platform,Handle,Followers,Price&#10;John Doe,john@gmail.com,Macro,Tech,YouTube,TechJohn,500000,5000"
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                />

                <div className={styles.buttonGroup}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => { setPreview([]); setCsvContent(''); }}
                        disabled={preview.length === 0 && !csvContent}
                    >
                        <X size={16} className={styles.iconMargin} /> Clear
                    </button>
                    <button className="btn btn-primary" onClick={handleParseText} disabled={isParsing}>
                        {isParsing ? 'Parsing...' : 'Preview Data'}
                    </button>
                </div>
            </div>

            {preview.length > 0 && (
                <div className={styles.previewSection}>
                    <div className={styles.previewHeader}>
                        <h3 className={styles.previewTitle}>
                            <FileText size={18} className={styles.iconMargin} />
                            Previewing {preview.length} rows
                        </h3>
                        <button className="btn btn-primary btn-sm" onClick={handleImport}>
                            Confirm Import ({preview.length} rows)
                        </button>
                    </div>

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
                                {preview.slice(0, 10).map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j}>{typeof val === 'string' ? val : JSON.stringify(val)}</td>
                                        ))}
                                    </tr>
                                ))}
                                {preview.length > 10 && (
                                    <tr>
                                        <td colSpan={Object.keys(preview[0]).length} className={styles.moreRows}>
                                            ... and {preview.length - 10} more rows
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
