'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={styles.icon}>
                            <AlertTriangle size={48} />
                        </div>
                        <h2 className={styles.title}>Something went wrong</h2>
                        <p className={styles.message}>
                            We encountered an unexpected error. Don&apos;t worry, your data is safe.
                        </p>
                        <div className={styles.actions}>
                            <button onClick={this.handleReset} className="btn btn-primary">
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                            <a href="/admin" className="btn btn-outline">
                                <Home size={18} />
                                Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
