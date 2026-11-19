import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Official SDK',
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
    description: (
      <>
        Access to 200+ countries and territories. Deliver eSIM data packages
        instantly to travelers anywhere in the world.
      </>
    ),
  },
  {
    title: 'Real-time Webhooks',
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
    description: (
      <>
        eSIMs are activated instantly upon purchase. No physical shipping,
        no delays. Perfect for last-minute travelers.
      </>
    ),
  },
  {
    title: 'Competitive Pricing',
    description: (
      <>
        Wholesale rates for businesses. Volume discounts available.
        Transparent pricing with no hidden fees.
      </>
    ),
  },
  {
    title: 'Built for AI Assistants',
    description: (
      <>
        Copy-paste prompts for every endpoint, one complete prompt for the whole API, and an
        hosted <Link to="/docs/mcp-server">MCP server</Link> (<code>mcp.esimfly.net/mcp</code>) so
        Claude, ChatGPT or Cursor can call the API directly. <Link to="/docs/llm-integration">AI integration →</Link>
      </>
    ),
  },
];

function Feature({index, title, description}) {
  return (
    <div className={styles.feature}>
      <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
      <Heading as="h3" className={styles.title}>{title}</Heading>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.header}>
          <Heading as="h2" className={styles.heading}>What&apos;s included</Heading>
          <p className={styles.lead}>
            Everything you need to sell eSIMs from your own product — SDK, REST API, webhooks and AI-ready docs
          </p>
        </div>
        <div className={styles.grid}>
          {FeatureList.map((props, idx) => (
            <Feature key={props.title} index={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
