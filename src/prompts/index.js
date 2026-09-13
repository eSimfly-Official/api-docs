// Single source of truth for the AI prompts lives in static/llm/*.txt so the
// same text is served raw at https://docs.esimfly.net/llm/<id>.txt and rendered
// (with a copy button) inside the docs. The .txt files are imported as strings
// via the `asset/source` rule registered in docusaurus.config.js.
import full from '@site/static/llm/esimfly-api-full-prompt.txt';
import balance from '@site/static/llm/balance.txt';
import packages from '@site/static/llm/packages.txt';
import createOrder from '@site/static/llm/create-order.txt';
import topupPackages from '@site/static/llm/topup-packages.txt';
import topupOrder from '@site/static/llm/topup-order.txt';
import esims from '@site/static/llm/esims.txt';
import esimsUsage from '@site/static/llm/esims-usage.txt';
import esimStatus from '@site/static/llm/esim-status.txt';
import networkEvents from '@site/static/llm/network-events.txt';
import usageReport from '@site/static/llm/usage-report.txt';
import suspendEsim from '@site/static/llm/suspend-esim.txt';
import cancelEsim from '@site/static/llm/cancel-esim.txt';
import sendSms from '@site/static/llm/send-sms.txt';
import orders from '@site/static/llm/orders.txt';
import webhooks from '@site/static/llm/webhooks.txt';

const prompts = {
  'esimfly-api-full-prompt': {
    text: full,
    title: 'Complete integration prompt (all endpoints)',
    pattern: 'Catalogue synced to your DB · orders with idempotency keys · webhooks for pending eSIMs · on-demand usage lookups',
  },
  balance: {
    text: balance,
    title: 'Balance Query',
    pattern: 'Keep a local balance mirror from order responses; call at checkout (60 s cache) and from an hourly alert job — never poll',
  },
  packages: {
    text: packages,
    title: 'Get All Packages',
    pattern: 'Sync the catalogue into your own database every 6–12 h (limit=100, ~70 paced requests) and serve your storefront from it — never proxy this endpoint',
  },
  'create-order': {
    text: createOrder,
    title: 'Create Order',
    pattern: 'Send packageCode + idempotency_key, persist the whole response, render QR from lpaString, complete pending orders via webhook with bounded polling fallback',
  },
  'topup-packages': {
    text: topupPackages,
    title: 'Get Topup Packages',
    pattern: 'Call only when the customer opens the top-up screen; cache per ICCID for 10 minutes; never pre-fetch for all eSIMs',
  },
  'topup-order': {
    text: topupOrder,
    title: 'Process Topup Order',
    pattern: 'One call per customer action with a per-ICCID lock; verify timeouts via the usage query instead of blind retries',
  },
  esims: {
    text: esims,
    title: 'List All eSIMs',
    pattern: 'Your own eSIM table is the source of truth; use this list for support search and an optional paced nightly reconciliation',
  },
  'esims-usage': {
    text: esimsUsage,
    title: 'Query eSIM Usage',
    pattern: 'On demand when a customer opens one eSIM, cached 5–15 min and persisted locally — never in a per-eSIM cron',
  },
  'esim-status': {
    text: esimStatus,
    title: 'eSIM Status (live)',
    pattern: 'Support-console button only (live carrier query), throttled per eSIM — never on page load or in jobs',
  },
  'network-events': {
    text: networkEvents,
    title: 'Network Events',
    pattern: 'Diagnostic timeline for "no data" tickets; on demand, 5-minute cache, highlight wrong-network events',
  },
  'usage-report': {
    text: usageReport,
    title: 'Usage Report',
    pattern: 'On-demand per-eSIM report with a 1-hour cache; use the usage query for the headline number',
  },
  'suspend-esim': {
    text: suspendEsim,
    title: 'Suspend / Activate eSIM',
    pattern: 'Audited operator action for eSIMfly eSIMs; track suspended state locally instead of re-querying',
  },
  'cancel-esim': {
    text: cancelEsim,
    title: 'Cancel eSIM',
    pattern: 'Pre-check eligibility in your DB, warn that the whole order is cancelled, persist refund method and pending refunds',
  },
  'send-sms': {
    text: sendSms,
    title: 'Send SMS',
    pattern: 'Transactional messages through a queue; flag eSIMs that return SMS_NOT_SUPPORTED',
  },
  orders: {
    text: orders,
    title: 'Orders',
    pattern: 'Incremental daily reconciliation with from_date and limit=100; never poll to confirm an order',
  },
  webhooks: {
    text: webhooks,
    title: 'Webhooks',
    pattern: 'Configure once, verify X-Webhook-Signature on the raw body, dedupe on X-Webhook-Id, respond 2xx fast, process async',
  },
};

export default prompts;
