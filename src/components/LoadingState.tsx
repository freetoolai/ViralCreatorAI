import styles from './LoadingState.module.css';

interface LoadingStateProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

export function LoadingState({ message = 'Loading...', size = 'medium' }: LoadingStateProps) {
    return (
        <div className={`${styles.container} ${styles[size]}`}>
            <div className={styles.spinner}></div>
            <p className={styles.message}>{message}</p>
        </div>
    );
}

export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
    return <div className={`${styles.spinner} ${styles[size]}`}></div>;
}
