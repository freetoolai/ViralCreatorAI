'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { dataStore } from '@/lib/store';
import styles from './portal.module.css';

export default function PortalLogin() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const clients = await dataStore.getClients();
            const client = clients.find(c => c.accessCode === code);

            if (client) {
                // In real app, set cookie/session here.
                localStorage.setItem('portal_client_id', client.id);
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

                <form onSubmit={handleLogin}>
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
