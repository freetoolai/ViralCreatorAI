'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { dataStore } from '@/lib/store';
import styles from './portal.module.css';

function PortalLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [code, setCode] = useState(searchParams?.get('code') || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const hasAutoTried = useRef(false);

    const handleLogin = useCallback(async (providedCode?: string) => {
        const codeToUse = providedCode || code;
        if (!codeToUse) return;

        setLoading(true);
        setError('');

        try {
            const clients = await dataStore.getClients();
            const client = clients.find(c => c.accessCode === codeToUse);

            if (client) {
                localStorage.setItem('portal_client_id', client.id);
                // Clear any admin tokens to prevent RouteGuard conflicts when previewing
                localStorage.removeItem('viral_access_token');
                localStorage.removeItem('viral_access_type');

                router.push('/portal/dashboard');
            } else {
                setError('Invalid access code. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    }, [code, router]);

    useEffect(() => {
        const urlCode = searchParams?.get('code');
        if (urlCode && !loading && !error && !hasAutoTried.current) {
            hasAutoTried.current = true;
            handleLogin(urlCode);
        }
    }, [searchParams, handleLogin, loading, error]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.iconWrapper}>
                    <Lock size={28} />
                </div>

                <h1 className={styles.title}>Client Access</h1>
                <p className={styles.subtitle}>
                    Enter your unique access code to view your campaigns.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        className={`input ${styles.input}`}
                        placeholder="CODE"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        autoFocus
                    />

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : (
                            <>
                                Enter Portal <ArrowRight size={18} className={styles.btnArrow} />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-sm text-gray-500 mt-4">
                    Don&apos;t have an access code? Contact your agency manager.
                </p>
            </div>
        </div>
    );
}

export default function PortalLogin() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loginCard}>
                    <div className={styles.loadingState}>Loading secure portal...</div>
                </div>
            </div>
        }>
            <PortalLoginContent />
        </Suspense>
    );
}
