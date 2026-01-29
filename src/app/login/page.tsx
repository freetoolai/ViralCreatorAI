'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.ok) {
            router.push('/admin');
        } else {
            setError('Invalid credentials. Try the demo accounts below.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Sparkles size={32} fill="currentColor" />
                    </div>
                    <h1 className={styles.title}>Welcome to ViralCreatorAI</h1>
                    <p className={styles.subtitle}>Sign in to manage your influencer campaigns</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="input"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={clsx("btn btn-primary", styles.submitBtn)}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ArrowRight size={18} className={styles.btnIcon} />}
                    </button>
                </form>

                <div className={styles.demo}>
                    <p className={styles.demoTitle}>Demo Accounts:</p>
                    <div className={styles.demoAccounts}>
                        <div className={styles.demoAccount}>
                            <strong>Admin:</strong> admin@viralcreatorai.com / demo123
                        </div>
                        <div className={styles.demoAccount}>
                            <strong>Client:</strong> client@example.com / demo123
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Link href="/">← Back to homepage</Link>
                </div>
            </div>
        </div>
    );
}
