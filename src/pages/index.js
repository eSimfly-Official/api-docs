import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

const QUICKSTART = `import { ESIMfly } from '@esimfly/sdk';

const esimfly = new ESIMfly({
  accessCode: process.env.ESIMFLY_ACCESS_CODE,
  secretKey: process.env.ESIMFLY_SECRET_KEY,
});

const order = await esimfly.orders.create({
  packageCode: '1664775',
  idempotencyKey: 'order-1001',
});

console.log(order.esims[0].lpaString);`;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>{siteConfig.title}</p>
            <Heading as="h1" className={styles.heroTitle}>
              {siteConfig.tagline}
            </Heading>
            <p className={styles.heroDescription}>
              Sell eSIM data packages for 200+ countries from your own app or store. One REST API for the
              catalog, ordering, top-ups and usage — with an official Node.js SDK, real-time webhooks and
              copy-paste prompts for AI coding assistants.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary" to="/docs/intro">
                Get started
              </Link>
              <Link className="button button--secondary" to="/docs/api/balance">
                API reference
              </Link>
              <Link className={styles.textLink} to="/docs/llm-integration">
                AI prompts →
              </Link>
            </div>
            <code className={styles.install}>npm install @esimfly/sdk</code>
          </div>
          <div className={styles.heroCode}>
            <CodeBlock language="javascript" title="order.js">
              {QUICKSTART}
            </CodeBlock>
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
