import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <p className={styles.heroDescription}>
            Sell eSIM data packages for 200+ countries from your own app or store. One REST API for the
            catalog, ordering, top-ups and usage — with an official Node.js SDK, real-time webhooks and
            copy-paste prompts for AI coding assistants.
          </p>
          <pre className={styles.heroCode}><code>npm install @esimfly/sdk</code></pre>
          <div className={styles.buttons}>
            <Link
              className={clsx('button button--primary button--lg', styles.primaryButton)}
              to="/docs/intro">
              Get Started →
            </Link>
            <Link
              className={clsx('button button--outline button--lg', styles.secondaryButton)}
              to="/docs/api/balance">
              API Reference
            </Link>
            <Link
              className={clsx('button button--outline button--lg', styles.secondaryButton)}
              to="/docs/llm-integration">
              AI Prompts
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Programmatic eSIM Distribution`}
      description="Integrate eSIM connectivity into your applications. Deliver data packages globally via our RESTful API with instant activation and competitive rates.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}