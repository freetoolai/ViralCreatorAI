'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import styles from './AIAssistant.module.css';

interface AIAssistantProps {
    influencerName: string;
    niche: string;
    metrics: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ influencerName, niche, metrics }) => {
    const [tone, setTone] = useState('professional');
    const [platform, setPlatform] = useState('instagram');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateScript = () => {
        setLoading(true);
        // Simulate AI generation delay
        setTimeout(() => {
            const templates: Record<string, string> = {
                professional: `Hi ${influencerName},\n\nI've been following your work in the ${niche} space and I'm highly impressed by your ${metrics}. We're looking for partners for an upcoming campaign and think your aesthetic would be a perfect fit.\n\nWould you be open to discussing a collaboration?\n\nBest,\nTeam ViralCreator`,
                casual: `Hey ${influencerName}! 👋\n\nLove your content in ${niche}! Your engagement (${metrics}) is incredible. We have an exciting project that aligns perfectly with your vibe.\n\nDown to chat about a potential collab?\n\nCheers!`,
                direct: `${influencerName},\n\nInterested in a collaboration for a top-tier brand in the ${niche} niche. Your ${metrics} look great for our current goals.\n\nLet me know your rates if you're available.\n\nThanks.`,
            };

            setScript(templates[tone] || templates.professional);
            setLoading(false);
        }, 800);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <Sparkles size={16} />
                </div>
                <h3 className={styles.title}>Outreach Copilot</h3>
            </div>

            <div className={styles.controls}>
                <div className={styles.selectGroup}>
                    <label className={styles.label} htmlFor="tone-select">Tone</label>
                    <select
                        id="tone-select"
                        className={styles.select}
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                    >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual / Friendly</option>
                        <option value="direct">Direct / Business</option>
                    </select>
                </div>

                <div className={styles.selectGroup}>
                    <label className={styles.label} htmlFor="platform-select">Platform</label>
                    <select
                        id="platform-select"
                        className={styles.select}
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                    >
                        <option value="instagram">Instagram DM</option>
                        <option value="email">Email Outreach</option>
                        <option value="twitter">X / Twitter</option>
                    </select>
                </div>

                <button
                    className={`btn btn-primary ${styles.generateBtn}`}
                    onClick={generateScript}
                    disabled={loading}
                >
                    {loading ? (
                        <RefreshCw size={16} className="animate-spin" />
                    ) : (
                        'Generate Script'
                    )}
                </button>
            </div>

            {script && (
                <div className={styles.resultArea}>
                    <div className={styles.scriptBox}>
                        {script}
                    </div>
                    <button
                        className={`btn btn-secondary ${styles.copyBtn}`}
                        onClick={copyToClipboard}
                    >
                        {copied ? (
                            <><Check size={14} style={{ marginRight: '6px' }} /> Copied</>
                        ) : (
                            <><Copy size={14} style={{ marginRight: '6px' }} /> Copy Script</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
