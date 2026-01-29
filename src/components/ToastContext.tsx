'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';
import clsx from 'clsx';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={clsx(
                            styles.toast,
                            toast.type === 'success' && styles.toastSuccess,
                            toast.type === 'error' && styles.toastError,
                            toast.type === 'info' && styles.toastInfo
                        )}
                    >
                        {toast.type === 'success' && <CheckCircle className={styles.iconSuccess} size={20} />}
                        {toast.type === 'error' && <AlertCircle className={styles.iconError} size={20} />}
                        {toast.type === 'info' && <Info className={styles.iconInfo} size={20} />}

                        <div className={styles.content}>{toast.message}</div>

                        <button className={styles.close} onClick={() => removeToast(toast.id)} aria-label="Dismiss notification">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
