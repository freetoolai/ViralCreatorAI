import styles from './verify-design.module.css';
import clsx from 'clsx';

export default function VerifyDesignPage() {
    return (
        <div className={styles.container}>
            <h1>Design System Verification</h1>
            <p>If you can see this page, you are on the Correct Server.</p>

            <div className={styles.card}>
                <h2>Color Check</h2>
                <div className={styles.colorGrid}>
                    <div>
                        <div className={clsx(styles.colorBox, styles.border, styles.bgWhite)}></div>
                        <p>White (#FFFFFF)</p>
                    </div>
                    <div>
                        <div className={clsx(styles.colorBox, styles.bgBlack)}></div>
                        <p>Black (#000000)</p>
                    </div>
                    <div>
                        <div className={clsx(styles.colorBox, styles.bgBlue)}></div>
                        <p>Blue (#007AFF)</p>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h2>Card UI Check</h2>
                <div className={clsx(styles.colorGrid, styles.mt20)}>
                    <div className={clsx("card", styles.demoCard)}>
                        <h3>Premium Card</h3>
                        <p>This is a verification of the global <code>.card</code> class used throughout the application.</p>
                        <button className={clsx("btn btn-primary", styles.mt15)}>Action</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
