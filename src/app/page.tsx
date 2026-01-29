import Link from 'next/link';
import Image from 'next/image'; // Triggering build
import { Database, Users, Zap, ArrowRight } from 'lucide-react';
import styles from './landing.module.css';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            Campaigns that <span className={styles.gradientText}>run themselves.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Manage creators, approve campaigns, and track performance—all in one calm, intelligent platform built for modern agencies. (System Update: Live)
          </p>
          <div className={styles.heroCta}>
            <Link href="/login" className="btn btn-primary">
              Start free trial <ArrowRight size={18} />
            </Link>
            <Link href="#preview" className="btn btn-secondary">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Product Value Section */}
      <section className={styles.valueSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            Built for agencies who value clarity over chaos.
          </h2>
          <p className={styles.sectionSubtitle}>
            No spreadsheets. No endless email threads. Just intelligent tools that help you focus on what matters.
          </p>

          <div className={styles.valueGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Database size={24} />
              </div>
              <h3 className={styles.valueTitle}>Creator database</h3>
              <p className={styles.valueDescription}>
                Import, organize, and search your entire creator network. CSV bulk import, smart tagging, and instant filtering.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Zap size={24} />
              </div>
              <h3 className={styles.valueTitle}>Campaign management</h3>
              <p className={styles.valueDescription}>
                Create campaigns, assign creators, and track deliverables. Everything in one place, nothing forgotten.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Users size={24} />
              </div>
              <h3 className={styles.valueTitle}>Client portals</h3>
              <p className={styles.valueDescription}>
                Share campaigns with clients via magic links. They approve or reject with one click. No login required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      <section className={styles.previewSection} id="preview">
        <div className="container">
          <h2 className={styles.sectionTitle}>
            A platform that feels like a product.
          </h2>
          <p className={styles.sectionSubtitle}>
            Designed with the same care as the campaigns you create.
          </p>

          <div className={styles.previewContainer}>
            <div className={styles.previewMockup}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDot}></div>
                <div className={styles.mockupDot}></div>
                <div className={styles.mockupDot}></div>
              </div>
              <div className={styles.mockupContent}>
                <Image
                  src="/viral_creator_dashboard_preview_v2.png"
                  alt="ViralCreatorAI Dashboard Preview"
                  width={1400}
                  height={933}
                  className={styles.previewImage}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className={styles.trustSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            Trusted by agencies who ship.
          </h2>

          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustLabel}>For agencies</div>
              <div className={styles.trustValue}>Manage 100+ creators</div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustLabel}>For brands</div>
              <div className={styles.trustValue}>Track every campaign</div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustLabel}>For teams</div>
              <div className={styles.trustValue}>One source of truth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2 className={styles.ctaTitle}>
            Ready to run calmer campaigns?
          </h2>
          <p className={styles.ctaSubtitle}>
            Start your free trial. No credit card required.
          </p>
          <Link href="/login" className="btn btn-primary">
            Get started <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
