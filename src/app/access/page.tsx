'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import styles from './access.module.css';

// Client code to client ID mapping
const CLIENT_CODES: Record<string, string> = {
    'FASHION-BRAND-2026': '1',
    'TECH-STARTUP-2026': '2',
    'BEAUTY-CO-2026': '3',
};

const ADMIN_CODE = 'ADMIN';

export default function AccessPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const trimmedCode = code.trim().toUpperCase();
        console.log('Verifying code:', trimmedCode);
        console.log('Expected Admin:', ADMIN_CODE);

        // Check if it's the admin code
        if (trimmedCode === ADMIN_CODE) {
            localStorage.setItem('viral_access_type', 'admin');
            localStorage.setItem('viral_access_granted', 'true');
            router.push('/admin');
            return;
        }

        // Check if it's a client code
        const clientId = CLIENT_CODES[trimmedCode];
        if (clientId) {
            localStorage.setItem('viral_access_type', 'client');
            localStorage.setItem('viral_client_id', clientId);
            localStorage.setItem('viral_access_granted', 'true');
            router.push('/portal/dashboard');
            return;
        }

        // Invalid code
        setError('Invalid access code. Please check and try again.');
        setLoading(false);
        setCode('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Lock size={32} />
                    </div>
                    <h1 className={styles.title}>Access Required</h1>
                    <p className={styles.subtitle}>
                        Enter your access code to use ViralCreatorAI
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="accessCode" className={styles.label}>
                            Access Code
                        </label>
                        <input
                            id="accessCode"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="VCAI-XXXX-XXXX"
                            className="input"
                            required
                            autoComplete="off"
                            autoFocus
                            aria-describedby={error ? 'error-message' : undefined}
                        />
                    </div>

                    {error && (
                        <div
                            id="error-message"
                            className={styles.error}
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !code.trim()}
                        style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Verifying...' : 'Continue'}
                        {!loading && <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        Don&apos;t have an access code? Contact your administrator.
                    </p>
                </div>
            </div>

            <div className={styles.branding}>
                <Sparkles size={16} />
                <span>ViralCreatorAI</span>
            </div>
        </div>
    );
}
