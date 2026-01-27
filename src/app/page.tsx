import Link from 'next/link';
import { Sparkles, Zap, Users, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Sparkles size={24} fill="currentColor" />
          <span>Viral<strong>CreatorAI</strong></span>
        </div>
        <nav className={styles.nav}>
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="/login" className="btn btn-outline">Sign In</Link>
          <Link href="/login" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            AI-Powered Influencer<br />
            Campaign Management
          </h1>
          <p className={styles.heroSubtitle}>
            Find, manage, and track creator partnerships in one intelligent platform.
            Automate workflows, approve campaigns, and measure ROI with AI precision.
          </p>
          <div className={styles.heroCta}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.0625rem' }}>
              Start Free Trial <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link href="#demo" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.0625rem' }}>
              Watch Demo
            </Link>
          </div>
          <p className={styles.heroNote}>
            ✓ No credit card required  ✓ 14-day free trial  ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <h2 className={styles.sectionTitle}>Everything you need to scale creator partnerships</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={28} />
            </div>
            <h3>AI-Powered Matching</h3>
            <p>Smart recommendations based on niche, engagement, and campaign goals. Find the perfect creators in seconds.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Users size={28} />
            </div>
            <h3>Automated Workflows</h3>
            <p>Streamline approvals, contracts, and payments. Let clients review and approve campaigns with one click.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BarChart3 size={28} />
            </div>
            <h3>Real-Time Analytics</h3>
            <p>Track campaign performance, ROI, and creator metrics in one dashboard. Make data-driven decisions.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.benefitsContent}>
          <h2>Why agencies choose ViralCreatorAI</h2>
          <ul className={styles.benefitsList}>
            <li><CheckCircle size={20} /> <span>Save 10+ hours per week on campaign management</span></li>
            <li><CheckCircle size={20} /> <span>Increase campaign ROI by 40% with AI insights</span></li>
            <li><CheckCircle size={20} /> <span>Manage 100+ creators without breaking a sweat</span></li>
            <li><CheckCircle size={20} /> <span>Client portal for seamless approvals</span></li>
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Ready to transform your influencer marketing?</h2>
        <p>Join hundreds of agencies managing campaigns with AI precision</p>
        <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', marginTop: '1.5rem' }}>
          Start Free Trial
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 ViralCreatorAI. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
