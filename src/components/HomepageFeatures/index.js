import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Official SDK',
    icon: '⚡',
    description: (
      <>
        <code>npm install @esimfly/sdk</code> — request signing, idempotent orders, paced catalog
        sync and webhook verification built in, zero dependencies. Other languages use the
        documented REST API. <Link to="/docs/quick-start">Quick start →</Link>
      </>
    ),
  },
  {
    title: 'Global Coverage',
    icon: '🌍',
    description: (
      <>
        Access to 200+ countries and territories. Deliver eSIM data packages 
        instantly to travelers anywhere in the world.
      </>
    ),
  },
  {
    title: 'Real-time Webhooks',
    icon: '📡',
    description: (
      <>
        Get a signed webhook the moment an eSIM is installed, changes status or runs low on
        data — no polling. Usage, live status, network events and top-ups are one call away.{' '}
        <Link to="/docs/api/webhooks">Webhooks →</Link>
      </>
    ),
  },
  {
    title: 'Instant Activation',
    icon: '🚀',
    description: (
      <>
        eSIMs are activated instantly upon purchase. No physical shipping, 
        no delays. Perfect for last-minute travelers.
      </>
    ),
  },
  {
    title: 'Competitive Pricing',
    icon: '💰',
    description: (
      <>
        Wholesale rates for businesses. Volume discounts available. 
        Transparent pricing with no hidden fees.
      </>
    ),
  },
  {
    title: 'Built for AI Assistants',
    icon: '🤖',
    description: (
      <>
        Copy-paste prompts for every endpoint, one complete prompt for the whole API, and an
        hosted <Link to="/docs/mcp-server">MCP server</Link> (<code>mcp.esimfly.net/mcp</code>) so
        Claude, ChatGPT or Cursor can call the API directly. <Link to="/docs/llm-integration">AI integration →</Link>
      </>
    ),
  },
];

function Feature({icon, title, description}) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
          <h2>Why Choose eSIMfly Business API?</h2>
          <p>Everything you need to sell eSIMs from your own product — SDK, REST API, webhooks and AI-ready docs</p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}