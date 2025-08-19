import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Simple Integration',
    icon: '⚡',
    description: (
      <>
        RESTful API with clear documentation and code examples. 
        Get up and running in minutes with our quickstart guide.
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
    title: 'Real-time Management',
    icon: '📊',
    description: (
      <>
        Monitor usage, check balances, and manage orders in real-time. 
        Full API access to all business dashboard features.
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
    title: 'Developer Friendly',
    icon: '👩‍💻',
    description: (
      <>
        Comprehensive API documentation with clear examples. 
        RESTful design with JSON responses for easy integration.
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
          <p>Everything you need to integrate eSIM connectivity into your platform</p>
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